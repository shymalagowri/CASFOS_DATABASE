const Faculty = require('../model/faculty');
const ConfirmedFaculty = require('../model/ConfirmedFaculty');
const AutoSaveFaculty = require('../model/AutoSaveFaculty');

const saveFaculty = async (req, res) => {
  console.log("Saving Faculty...");
  try {
    const { facultyType, _id, ...facultyData } = req.body;
    const photographPath = req.file ? req.file.path : null;

    const flatArrayFields = ["modulesHandled", "majorDomains", "minorDomains"];
    const nestedArrayFields = [
      "publications",
      "educationDetails",
      "coursesHandled",
      "toursAttended",
      "examiner",
      "specialSessions",
      "otherResponsibilities",
    ];

    const parsedFacultyData = { ...facultyData };
    flatArrayFields.forEach((field) => {
      if (parsedFacultyData[field]) {
        if (Array.isArray(parsedFacultyData[field])) {
          parsedFacultyData[field] = parsedFacultyData[field];
        } else if (typeof parsedFacultyData[field] === "string") {
          try {
            const parsed = JSON.parse(parsedFacultyData[field]);
            parsedFacultyData[field] = Array.isArray(parsed) ? parsed.flat() : [parsed];
          } catch {
            parsedFacultyData[field] = [parsedFacultyData[field]];
          }
        }
      } else {
        parsedFacultyData[field] = [];
      }
    });

    nestedArrayFields.forEach((field) => {
      if (parsedFacultyData[field]) {
        if (Array.isArray(parsedFacultyData[field])) {
          parsedFacultyData[field] = parsedFacultyData[field];
        } else if (typeof parsedFacultyData[field] === "string") {
          try {
            parsedFacultyData[field] = JSON.parse(parsedFacultyData[field]);
          } catch {
            parsedFacultyData[field] = [];
          }
        }
      } else {
        parsedFacultyData[field] = [];
      }
    });

    const updatedFacultyData = {
      ...parsedFacultyData,
      facultyType,
      photograph: photographPath,
      staffid: req.body.staffid || `FAC${Date.now()}`,
      status: facultyData.status || "serving",
      conduct: facultyData.conduct || "",
      verified: facultyData.verified || false, // Preserve verified status if provided
    };
    console.log("Processed faculty data:", updatedFacultyData);

    const { name, mobileNumber } = facultyData;
    const existingFaculty = await AutoSaveFaculty.findOne({ name, mobileNumber });

    if (existingFaculty) {
      console.log("Existing autosaved faculty found. Deleting...");
      await AutoSaveFaculty.deleteOne({ staffid: existingFaculty.staffid });
      console.log("Deleted autosaved faculty.");
    }

    if (!_id) {
      const newFaculty = new Faculty(updatedFacultyData);
      await newFaculty.save();
      return res.status(201).send({
        success: true,
        message: "Faculty saved successfully with verification pending!",
        data: newFaculty,
      });
    } else {
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
    res.status(500).send({ success: false, message: "Error saving/updating faculty data", error: error.message });
  }
};

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

const autoSaveFacultyData = async (req, res) => {
  try {
    const { staffid, facultyType, facultyData } = req.body;
    if (!staffid) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    const autosaveFaculty = await AutoSaveFaculty.findOneAndUpdate(
      { staffid },
      { ...facultyData, staffid, facultyType, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res.json(autosaveFaculty);
  } catch (err) {
    console.error("Error auto-saving faculty data:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteAutoSavedFaculty = async (req, res) => {
  const { staffid } = req.params;

  try {
    if (!staffid) {
      return res.status(400).send({ success: false, message: "Staff ID is required for deletion" });
    }

    const deletedData = await AutoSaveFaculty.findOneAndDelete({ staffid });

    if (!deletedData) {
      return res.status(404).send({ success: false, message: "No auto-saved data found for the given staff ID" });
    }

    console.log(`Auto-save data deleted for staff ID: ${staffid}`);
    res.status(200).send({ success: true, message: "Auto-save data deleted successfully" });
  } catch (error) {
    console.error("Error deleting auto-save data:", error);
    res.status(500).send({ success: false, message: "Error deleting auto-save data" });
  }
};

const getFacultyById = async (req, res) => {
  const { id } = req.params;
  try {
    // Check both collections since faculty could be in either
    let faculty = await Faculty.findById(id);
    if (!faculty) {
      faculty = await ConfirmedFaculty.findById(id);
    }
    if (!faculty) {
      return res.status(404).send({ success: false, message: 'Faculty not found' });
    }
    console.log("Fetched faculty:", faculty);
    res.status(200).send({ success: true, data: faculty });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching faculty data' });
  }
};

const getAllFaculties = async (req, res) => {
  try {
    // Fetch all fields except 'conduct'
    const faculties = await Faculty.find().select('-conduct');
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const verifyFaculty = async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      id,
      { verified: true },
      { new: true }
    );
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found for verification' });
    }
    res.status(200).json({ success: true, message: 'Faculty verified successfully', data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying faculty', error: error.message });
  }
};


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
    await Faculty.findByIdAndDelete(id);
    res.json({ message: "Faculty approved and moved to confirmed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


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
      domainKnowledge
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

const getSessionsHandled = async (req, res) => {
  const { year } = req.query;

  try {
    const faculties = await ConfirmedFaculty.find({});
    const startYear = 2025, endYear = 2035;

    if (year === "All") {
      const yearlySessionCounts = Array(endYear - startYear + 1).fill(0);

      faculties.forEach(faculty => {
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

    faculties.forEach(faculty => {
      const facultyDate = new Date(faculty.joined || faculty.dateOfJoining);
      if (facultyDate.getUTCFullYear() === parseInt(year)) {
        const monthIndex = facultyDate.getUTCMonth();
        monthlySessionCounts[monthIndex] += faculty.coursesHandled.length;
      }
    });

    res.json({
      labels: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
      sessionCounts: monthlySessionCounts,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching session data." });
  }
};

const getFacultyEntriesByMonth = async (req, res) => {
  const { year } = req.query;
  
  try {
    const faculties = await ConfirmedFaculty.find({});
    const internalCounts = Array(12).fill(0);
    const externalCounts = Array(12).fill(0);
    const contractCounts = Array(12).fill(0);

    if (year === "All") {
      const startYear = 2025, endYear = 2035;
      const yearlyInternalCounts = Array(endYear - startYear + 1).fill(0);
      const yearlyExternalCounts = Array(endYear - startYear + 1).fill(0);
      const yearlyContractCounts = Array(endYear - startYear + 1).fill(0);

      faculties.forEach(faculty => {
        const facultyYear = new Date(faculty.joined || faculty.dateOfJoining).getUTCFullYear();
        const index = facultyYear - startYear;
        if (index >= 0 && index < yearlyInternalCounts.length) {
          if (faculty.facultyType === 'internal') {
            yearlyInternalCounts[index]++;
          } else if (faculty.facultyType === 'external') {
            yearlyExternalCounts[index]++;
          } else if (faculty.facultyType === 'contract') {
            yearlyContractCounts[index]++;
          }
        }
      });

      return res.json({
        labels: Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString()),
        internal: yearlyInternalCounts,
        external: yearlyExternalCounts,
        contract: yearlyContractCounts
      });
    }

    const yearData = faculties.filter(faculty => 
      new Date(faculty.joined || faculty.dateOfJoining).getUTCFullYear() === parseInt(year)
    );
    yearData.forEach(faculty => {
      const month = new Date(faculty.joined || faculty.dateOfJoining).getUTCMonth();
      if (faculty.facultyType === 'internal') {
        internalCounts[month]++;
      } else if (faculty.facultyType === 'external') {
        externalCounts[month]++;
      } else if (faculty.facultyType === 'contract') {
        contractCounts[month]++;
      }
    });

    res.json({
      labels: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
      internal: internalCounts,
      external: externalCounts,
      contract: contractCounts
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching faculty data." });
  }
};

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
  verifyFaculty
};