// Import required Mongoose models for faculty data management
const Faculty = require('../model/faculty');              // Unverified faculty data
const ConfirmedFaculty = require('../model/ConfirmedFaculty'); // Verified and approved faculty
const AutoSaveFaculty = require('../model/AutoSaveFaculty');  // Auto-saved faculty drafts
const RejectedFaculty = require('../model/rejectedFaculty');  // Rejected faculty records
const NotifyFaculty = require('../model/NotifyFaculty');      // Faculty notification records

// Save or update faculty data
const saveFaculty = async (req, res) => {
  console.log("Saving Faculty...");
  try {
    // Destructure request body
    const { facultyType, _id, ...facultyData } = req.body;
    const photographPath = req.file ? req.file.path : null; // Handle uploaded photograph

    // Define fields that should be flat arrays
    const flatArrayFields = ["modulesHandled", "majorDomains", "minorDomains"];
    // Define fields that should be nested arrays/objects
    const nestedArrayFields = [
      "publications",
      "educationDetails",
      "coursesHandled",
      "toursAttended",
      "examiner",
      "specialSessions",
      "otherResponsibilities",
    ];

    // Create a copy of facultyData for parsing
    const parsedFacultyData = { ...facultyData };

    // Process flat array fields
    flatArrayFields.forEach((field) => {
      if (parsedFacultyData[field]) {
        if (Array.isArray(parsedFacultyData[field])) {
          parsedFacultyData[field] = parsedFacultyData[field]; // Keep as is if already an array
        } else if (typeof parsedFacultyData[field] === "string") {
          try {
            const parsed = JSON.parse(parsedFacultyData[field]);
            parsedFacultyData[field] = Array.isArray(parsed) ? parsed.flat() : [parsed];
          } catch {
            parsedFacultyData[field] = [parsedFacultyData[field]]; // Fallback to array with single item
          }
        }
      } else {
        parsedFacultyData[field] = []; // Default to empty array if not provided
      }
    });

    // Process nested array fields
    nestedArrayFields.forEach((field) => {
      if (parsedFacultyData[field]) {
        if (Array.isArray(parsedFacultyData[field])) {
          parsedFacultyData[field] = parsedFacultyData[field]; // Keep as is if already an array
        } else if (typeof parsedFacultyData[field] === "string") {
          try {
            parsedFacultyData[field] = JSON.parse(parsedFacultyData[field]); // Parse JSON string
          } catch {
            parsedFacultyData[field] = []; // Fallback to empty array on parse failure
          }
        }
      } else {
        parsedFacultyData[field] = []; // Default to empty array if not provided
      }
    });

    // Prepare final faculty data object with defaults
    const updatedFacultyData = {
      ...parsedFacultyData,
      facultyType,
      photograph: photographPath,
      staffid: req.body.staffid || `FAC${Date.now()}`, // Generate unique staff ID if not provided
      status: facultyData.status || "serving",         // Default status
      conduct: facultyData.conduct || "",              // Default conduct
      verified: facultyData.verified || false,         // Preserve or default verified status
    };
    console.log("Processed faculty data:", updatedFacultyData);

    // Check for existing autosaved data
    const { name, mobileNumber } = facultyData;
    const existingFaculty = await AutoSaveFaculty.findOne({ name, mobileNumber });

    if (existingFaculty) {
      console.log("Existing autosaved faculty found. Deleting...");
      await AutoSaveFaculty.deleteOne({ staffid: existingFaculty.staffid });
      console.log("Deleted autosaved faculty.");
    }

    if (!_id) {
      // Create new faculty record
      const newFaculty = new Faculty(updatedFacultyData);
      await newFaculty.save();
      return res.status(201).send({
        success: true,
        message: "Faculty saved successfully with verification pending!",
        data: newFaculty,
      });
    } else {
      // Update existing faculty record
      console.log("Updating existing faculty with ID:", _id);
      let updatedFaculty = await Faculty.findByIdAndUpdate(_id, updatedFacultyData, { new: true });
      if (!updatedFaculty) {
        console.log("Faculty not found in Faculty collection, checking ConfirmedFaculty...");
        updatedFaculty = await ConfirmedFaculty.findByIdAndUpdate(_id, updatedFacultyData, { new: true });
        if (!updatedFaculty) {
          console.log("Faculty not found for ID:", _id);
          return res.status(404).send({ success: false, message: "Faculty not found for update" });
        }
        console.log("Faculty updated successfully in ConfirmedFaculty:", updatedFaculty);
        return res.status(200).send({
          success: true,
          message: "Faculty updated successfully in ConfirmedFaculty!",
          data: updatedFaculty,
        });
      }
      console.log("Faculty updated successfully in Faculty:", updatedFaculty);
      return res.status(200).send({
        success: true,
        message: "Faculty updated successfully!",
        data: updatedFaculty,
      });
    }
  } catch (error) {
    console.error("Error saving faculty:", error);
    res.status(500).send({
      success: false,
      message: "Error saving/updating faculty data",
      error: error.message,
    });
  }
};

// Retrieve autosaved faculty data by staff ID
const getAutoSavedFacultyData = async (req, res) => {
  try {
    const { staffid } = req.query;
    if (!staffid) {
      return res.status(400).json({ success: false, message: "Staff ID is required" });
    }

    const facultyData = await AutoSaveFaculty.findOne({ staffid });
    if (!facultyData) {
      return res.status(404).json({ success: false, message: "No auto-saved data found" });
    }

    res.status(200).json({ success: true, data: facultyData });
  } catch (error) {
    console.error("Error fetching auto-saved faculty data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Auto-save faculty data for later completion
const autoSaveFacultyData = async (req, res) => {
  try {
    const { staffid, facultyType, facultyData } = req.body;
    if (!staffid) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    const autosaveFaculty = await AutoSaveFaculty.findOneAndUpdate(
      { staffid },
      { ...facultyData, staffid, facultyType, lastUpdated: new Date() }, // Update with timestamp
      { upsert: true, new: true } // Create if not exists, return updated document
    );

    res.json(autosaveFaculty);
  } catch (err) {
    console.error("Error auto-saving faculty data:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete autosaved faculty data by staff ID
const deleteAutoSavedFaculty = async (req, res) => {
  const { staffid } = req.params;

  try {
    if (!staffid) {
      return res.status(400).send({ success: false, message: "Staff ID is required for deletion" });
    }

    const deletedData = await AutoSaveFaculty.findOneAndDelete({ staffid });

    if (!deletedData) {
      return res.status(404).send({
        success: false,
        message: "No auto-saved data found for the given staff ID",
      });
    }

    console.log(`Auto-save data deleted for staff ID: ${staffid}`);
    res.status(200).send({ success: true, message: "Auto-save data deleted successfully" });
  } catch (error) {
    console.error("Error deleting auto-save data:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting auto-save data",
      error: error.message,
    });
  }
};

// Get faculty details by ID from either Faculty or ConfirmedFaculty
const getFacultyById = async (req, res) => {
  const { id } = req.params;
  try {
    let faculty = await Faculty.findById(id);
    if (!faculty) {
      faculty = await ConfirmedFaculty.findById(id); // Check confirmed collection if not found
    }
    if (!faculty) {
      return res.status(404).send({ success: false, message: "Faculty not found" });
    }
    console.log("Fetched faculty:", faculty);
    res.status(200).send({ success: true, data: faculty });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error fetching faculty data" });
  }
};

// Retrieve all faculty records excluding conduct field
const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().select("-conduct"); // Exclude conduct field
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify a faculty member
const verifyFaculty = async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      id,
      { verified: true },
      { new: true } // Return updated document
    );
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found for verification" });
    }
    res.status(200).json({
      success: true,
      message: "Faculty verified successfully",
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying faculty",
      error: error.message,
    });
  }
};

// Approve a verified faculty member and move to ConfirmedFaculty
const approveFaculty = async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (!faculty.verified) {
      return res.status(400).json({ message: "Faculty must be verified before approval" });
    }

    const confirmedFaculty = new ConfirmedFaculty({ ...faculty._doc });
    await confirmedFaculty.save();
    await Faculty.findByIdAndDelete(id); // Remove from unverified collection
    res.json({ message: "Faculty approved and moved to confirmed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Filter confirmed faculty based on provided criteria
const getFilteredFaculty = async (req, res) => {
  try {
    const {
      facultyType,
      name,
      yearOfAllotment,
      email,
      majorDomains,
      minorDomains,
      areasOfExpertise,
      institution,
      status,
      conduct,
      modulesHandled,
      mobileNumber,
      domainKnowledge,
    } = req.body;

    const query = {};
    if (facultyType) query.facultyType = { $regex: facultyType, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };
    if (yearOfAllotment) query.yearOfAllotment = yearOfAllotment;
    if (email) query.email = { $regex: email, $options: "i" };
    if (majorDomains && majorDomains.length > 0) query.majorDomains = { $in: majorDomains };
    if (minorDomains && minorDomains.length > 0) query.minorDomains = { $in: minorDomains };
    if (areasOfExpertise) query.areasOfExpertise = { $regex: areasOfExpertise, $options: "i" };
    if (institution) query.institution = { $regex: institution, $options: "i" };
    if (status) query.status = status;
    if (conduct) query.conduct = { $regex: conduct, $options: "i" };
    if (modulesHandled && modulesHandled.length > 0) query.modulesHandled = { $in: modulesHandled };
    if (mobileNumber) query.mobileNumber = { $regex: mobileNumber, $options: "i" };
    if (domainKnowledge) query.domainKnowledge = { $regex: domainKnowledge, $options: "i" };

    const faculties = await ConfirmedFaculty.find(query);

    if (faculties.length === 0) {
      return res.status(404).json({ message: "No matching records found." });
    }

    res.status(200).json(faculties);
  } catch (error) {
    console.error("Error fetching faculty details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get session counts by year or month
const getSessionsHandled = async (req, res) => {
  const { year } = req.query;

  try {
    const faculties = await ConfirmedFaculty.find({});
    const startYear = 2025,
      endYear = 2035;

    if (year === "All") {
      const yearlySessionCounts = Array(endYear - startYear + 1).fill(0);

      faculties.forEach((faculty) => {
        const facultyYear = new Date(faculty.joined || faculty.dateOfJoining).getUTCFullYear();
        const index = facultyYear - startYear;
        if (index >= 0 && index < yearlySessionCounts.length) {
          yearlySessionCounts[index] += faculty.coursesHandled.length;
        }
      });

      return res.json({
        labels: Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString()),
        sessionCounts: yearlySessionCounts,
      });
    }

    const monthlySessionCounts = Array(12).fill(0);

    faculties.forEach((faculty) => {
      const facultyDate = new Date(faculty.joined || faculty.dateOfJoining);
      if (facultyDate.getUTCFullYear() === parseInt(year)) {
        const monthIndex = facultyDate.getUTCMonth();
        monthlySessionCounts[monthIndex] += faculty.coursesHandled.length;
      }
    });

    res.json({
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      sessionCounts: monthlySessionCounts,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching session data." });
  }
};

// Get faculty entries by type and month/year
const getFacultyEntriesByMonth = async (req, res) => {
  const { year } = req.query;

  try {
    const faculties = await ConfirmedFaculty.find({});
    const internalCounts = Array(12).fill(0);
    const externalCounts = Array(12).fill(0);
    const contractCounts = Array(12).fill(0);

    if (year === "All") {
      const startYear = 2025,
        endYear = 2035;
      const yearlyInternalCounts = Array(endYear - startYear + 1).fill(0);
      const yearlyExternalCounts = Array(endYear - startYear + 1).fill(0);
      const yearlyContractCounts = Array(endYear - startYear + 1).fill(0);

      faculties.forEach((faculty) => {
        const facultyYear = new Date(faculty.joined || faculty.dateOfJoining).getUTCFullYear();
        const index = facultyYear - startYear;
        if (index >= 0 && index < yearlyInternalCounts.length) {
          if (faculty.facultyType === "internal") yearlyInternalCounts[index]++;
          else if (faculty.facultyType === "external") yearlyExternalCounts[index]++;
          else if (faculty.facultyType === "contract") yearlyContractCounts[index]++;
        }
      });

      return res.json({
        labels: Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString()),
        internal: yearlyInternalCounts,
        external: yearlyExternalCounts,
        contract: yearlyContractCounts,
      });
    }

    const yearData = faculties.filter(
      (faculty) =>
        new Date(faculty.joined || faculty.dateOfJoining).getUTCFullYear() === parseInt(year)
    );
    yearData.forEach((faculty) => {
      const month = new Date(faculty.joined || faculty.dateOfJoining).getUTCMonth();
      if (faculty.facultyType === "internal") internalCounts[month]++;
      else if (faculty.facultyType === "external") externalCounts[month]++;
      else if (faculty.facultyType === "contract") contractCounts[month]++;
    });

    res.json({
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      internal: internalCounts,
      external: externalCounts,
      contract: contractCounts,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching faculty data." });
  }
};

// Delete faculty from either Faculty or ConfirmedFaculty
const deleteFaculty = async (req, res) => {
  const { id } = req.params;

  try {
    let deletedFaculty = await Faculty.findByIdAndDelete(id);
    if (!deletedFaculty) {
      deletedFaculty = await ConfirmedFaculty.findByIdAndDelete(id);
      if (!deletedFaculty) {
        return res.status(404).send({ success: false, message: "Faculty not found" });
      }
      console.log(`Faculty deleted from ConfirmedFaculty with ID: ${id}`);
      return res.status(200).send({
        success: true,
        message: "Faculty deleted successfully from ConfirmedFaculty",
      });
    }

    console.log(`Faculty deleted from Faculty with ID: ${id}`);
    res.status(200).send({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting faculty:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting faculty",
      error: error.message,
    });
  }
};

// Update specific fields of a confirmed faculty
const updateFaculty = async (req, res) => {
  try {
    const { conduct, remarks } = req.body;

    const updateObject = {};
    if (conduct) updateObject.conduct = conduct;
    if (remarks) updateObject.remarks = remarks;

    const faculty = await ConfirmedFaculty.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true, runValidators: true } // Return updated doc and validate
    );

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    res.json({ success: true, data: faculty });
  } catch (error) {
    console.error("Error updating faculty:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Reject faculty verification and move to RejectedFaculty
const rejectFacultyVerification = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks } = req.body;

  try {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    const rejectedFaculty = new RejectedFaculty({
      ...faculty._doc,
      verificationRejection: true,
      rejectionRemarks: rejectionRemarks || "No remarks provided",
    });

    await rejectedFaculty.save();
    await Faculty.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Faculty verification rejected and moved to rejected collection",
      data: rejectedFaculty,
    });
  } catch (error) {
    console.error("Error rejecting faculty verification:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting faculty verification",
      error: error.message,
    });
  }
};

// Reject faculty approval and move to RejectedFaculty
const rejectFacultyApproval = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks } = req.body;

  try {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    if (!faculty.verified) {
      return res.status(400).json({ success: false, message: "Faculty must be verified before rejection" });
    }

    const rejectedFaculty = new RejectedFaculty({
      ...faculty._doc,
      approvalRejection: true,
      rejectionRemarks: rejectionRemarks || "No remarks provided",
    });

    await rejectedFaculty.save();
    await Faculty.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Faculty approval rejected and moved to rejected collection",
      data: rejectedFaculty,
    });
  } catch (error) {
    console.error("Error rejecting faculty approval:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting faculty approval",
      error: error.message,
    });
  }
};

// Fetch recent rejected faculty approvals
const getRejectedFacultyApprovals = async (req, res) => {
  try {
    const rejectedApprovals = await RejectedFaculty.find({ approvalRejection: true })
      .sort({ updatedAt: -1 }) // Most recent first
      .limit(10); // Limit to 10 records
    res.status(200).json(rejectedApprovals);
  } catch (error) {
    console.error("Error fetching rejected faculty approvals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rejected faculty approvals",
      error: error.message,
    });
  }
};

// Fetch recent rejected faculty verifications
const getRejectedFacultyVerifications = async (req, res) => {
  try {
    const rejectedVerifications = await RejectedFaculty.find({ verificationRejection: true })
      .sort({ updatedAt: -1 }) // Most recent first
      .limit(10); // Limit to 10 records
    res.status(200).json(rejectedVerifications);
  } catch (error) {
    console.error("Error fetching rejected faculty verifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rejected faculty verifications",
      error: error.message,
    });
  }
};

// Notify faculty and move to NotifyFaculty collection
const notifyFaculty = async (req, res) => {
  const { id } = req.params;
  const { notifyremarks } = req.body;

  try {
    const faculty = await ConfirmedFaculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    const notifyFacultyEntry = new NotifyFaculty({
      ...faculty._doc,
      notifyprincipal: true,
      notifyremarks: notifyremarks || "",
      notificationDate: new Date(),
    });

    await notifyFacultyEntry.save();
    await ConfirmedFaculty.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Faculty notified and moved to notification collection",
      data: notifyFacultyEntry,
    });
  } catch (error) {
    console.error("Error notifying faculty:", error);
    res.status(500).json({
      success: false,
      message: "Error notifying faculty",
      error: error.message,
    });
  }
};

// Fetch notifications where HOO hasn't acknowledged
const getNotifyHooFalse = async (req, res) => {
  try {
    const notifications = await NotifyFaculty.find({ notifyhoo: false });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifyhoo false notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Acknowledge notification by HOO
const acknowledgeHoo = async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await NotifyFaculty.findByIdAndUpdate(
      id,
      { notifyhoo: true },
      { new: true }
    );
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.status(200).json({
      success: true,
      message: "Notification acknowledged",
      data: faculty,
    });
  } catch (error) {
    console.error("Error acknowledging notification:", error);
    res.status(500).json({
      success: false,
      message: "Error acknowledging notification",
      error: error.message,
    });
  }
};

// Fetch notifications pending SI acknowledgment
const getNotifySIPending = async (req, res) => {
  try {
    const notifications = await NotifyFaculty.find({
      notifyprincipal: true,
      notifyhoo: true,
      notifysi: false,
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notify SI pending notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Acknowledge notification by SI
const acknowledgeSI = async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await NotifyFaculty.findByIdAndUpdate(
      id,
      { notifysi: true },
      { new: true }
    );
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.status(200).json({
      success: true,
      message: "Notification acknowledged",
      data: faculty,
    });
  } catch (error) {
    console.error("Error acknowledging notification:", error);
    res.status(500).json({
      success: false,
      message: "Error acknowledging notification",
      error: error.message,
    });
  }
};

// Fetch fully acknowledged notifications
const getNotifyAllTrue = async (req, res) => {
  try {
    const notifications = await NotifyFaculty.find({
      notifyprincipal: true,
      notifyhoo: true,
      notifysi: true,
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notify all true notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Delete a rejected faculty approval
const deleteRejectedFacultyApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RejectedFaculty.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Rejected approval not found" });
    }
    res.status(200).json({ success: true, message: "Rejected approval deleted successfully" });
  } catch (error) {
    console.error("Error deleting rejected approval:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting rejected approval",
      error: error.message,
    });
  }
};

// Delete a rejected faculty verification
const deleteRejectedFacultyVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RejectedFaculty.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Rejected verification not found" });
    }
    res.status(200).json({ success: true, message: "Rejected verification deleted successfully" });
  } catch (error) {
    console.error("Error deleting rejected verification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting rejected verification",
      error: error.message,
    });
  }
};

// Delete a notification
const deleteFacultyNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NotifyFaculty.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  saveFaculty,
  getAllFaculties,
  getAutoSavedFacultyData,
  autoSaveFacultyData,
  deleteAutoSavedFaculty,
  approveFaculty,
  getFilteredFaculty,
  getFacultyEntriesByMonth,
  getSessionsHandled,
  getFacultyById,
  verifyFaculty,
  deleteFaculty,
  updateFaculty,
  rejectFacultyVerification,
  rejectFacultyApproval,
  getRejectedFacultyApprovals,
  getRejectedFacultyVerifications,
  notifyFaculty,
  getNotifyHooFalse,
  acknowledgeHoo,
  getNotifySIPending,
  acknowledgeSI,
  getNotifyAllTrue,
  deleteRejectedFacultyApproval, // New
  deleteRejectedFacultyVerification, // New
  deleteFacultyNotification, // New
};