const Faculty = require('../model/faculty');
const ConfirmedFaculty = require('../model/ConfirmedFaculty');
const AutoSaveFaculty = require('../model/AutoSaveFaculty');

const saveFaculty = async (req, res) => {
  console.log("Saving Faculty...");

  try {
    const { facultyType, ...facultyData } = req.body;
    const photographPath = req.file ? req.file.path : null;
    const updatedFacultyData = { 
      ...facultyData, 
      facultyType, 
      photograph: photographPath, 
      staffid: req.body.staffid,
      status: facultyData.status || "serving" // Default status if not provided
    };
    console.log(updatedFacultyData);

    const { name, mobileNumber } = facultyData;
    const existingFaculty = await AutoSaveFaculty.findOne({ 
      "facultyData.name": name, 
      "facultyData.mobileNumber": mobileNumber 
    });

    if (existingFaculty) {
      console.log("Existing autosaved faculty found. Deleting...");
      await AutoSaveFaculty.deleteOne({ _id: existingFaculty._id });
      console.log("Deleted autosaved faculty.");
    }

    if (!updatedFacultyData._id) {
      // Create new faculty
      const newFaculty = new Faculty(updatedFacultyData);
      await newFaculty.save();
      return res.status(201).send({ success: true, message: "Faculty saved successfully!", data: newFaculty });
    } else {
      // Update existing faculty
      console.log("Updating existing faculty...");
      const updatedFaculty = await ConfirmedFaculty.findByIdAndUpdate(
        updatedFacultyData._id,
        updatedFacultyData,
        { new: true }
      );
      if (!updatedFaculty) {
        return res.status(404).send({ success: false, message: "Faculty not found for update" });
      }
      return res.status(200).send({ success: true, message: "Faculty updated successfully!", data: updatedFaculty });
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

    const facultyData = await AutoSaveFaculty.findOne({ _id: staffid });

    if (!facultyData) {
      return res.status(404).json({ success: false, message: "No auto-saved data found" });
    }

    res.status(200).json({ success: true, data: facultyData });
    console.log("Fetched auto-save faculty data successfully");
  } catch (error) {
    console.error("Error fetching auto-saved faculty data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const autoSaveFacultyData = async (req, res) => {
  try {
    const { staffid, facultyType, facultyData } = req.body;

    if (!staffid) {
      return res.status(400).json({ success: false, message: "Staff ID is required" });
    }

    // Handle photograph correctly (skip if it's an object, as it’s handled in saveFaculty)
    const updatedFacultyData = {
      ...facultyData,
      facultyType,
      status: facultyData.status || "serving", // Default to "serving"
      conduct: facultyData.conduct || "", // Default to empty string
      modulesHandled: facultyData.modulesHandled || [], // Default to empty array
      photograph: typeof facultyData.photograph === "string" ? facultyData.photograph : null // Only set if string
    };

    const updatedFaculty = await AutoSaveFaculty.findOneAndUpdate(
      { _id: staffid },
      { $set: { facultyData: updatedFacultyData, facultyType } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Faculty data auto-saved successfully!", data: updatedFaculty });
  } catch (error) {
    console.error("Error auto-saving faculty data:", error);
    res.status(500).json({ success: false, message: "Error auto-saving faculty data", error: error.message });
  }
};

const deleteAutoSavedFaculty = async (req, res) => {
  const { staffid } = req.params;

  try {
    if (!staffid) {
      return res.status(400).send({ success: false, message: "Staff ID is required for deletion" });
    }

    const deletedData = await AutoSaveFaculty.findByIdAndDelete(staffid);

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
    const faculty = await ConfirmedFaculty.findById(id);
    if (!faculty) {
      return res.status(404).send({ success: false, message: 'Faculty not found' });
    }
    res.status(200).send({ success: true, data: faculty });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching faculty data' });
  }
};

const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveFaculty = async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    const confirmedFaculty = new ConfirmedFaculty({ ...faculty._doc });
    await confirmedFaculty.save();
    await Faculty.findByIdAndDelete(id);
    res.json({ message: 'Faculty approved successfully' });
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
      modulesHandled
    } = req.body;

    const query = {};

    if (facultyType) query.facultyType = { $regex: facultyType, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };
    if (yearOfAllotment) query.yearOfAllotment = yearOfAllotment;
    if (email) query.email = { $regex: email, $options: "i" };
    if (majorDomains) query.majorDomains = { $in: majorDomains };
    if (minorDomains) query.minorDomains = { $in: minorDomains };
    if (areasOfExpertise) query.areasOfExpertise = { $regex: areasOfExpertise, $options: "i" };
    if (institution) query.institution = { $regex: institution, $options: "i" };
    if (status) query.status = status;
    if (conduct) query.conduct = { $regex: conduct, $options: "i" };
    if (modulesHandled) query.modulesHandled = { $in: modulesHandled };

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
        const facultyYear = new Date(faculty.joined).getUTCFullYear();
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
      const facultyDate = new Date(faculty.joined);
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

    if (year === "All") {
      const startYear = 2025, endYear = 2035;
      const yearlyInternalCounts = Array(endYear - startYear + 1).fill(0);
      const yearlyExternalCounts = Array(endYear - startYear + 1).fill(0);

      faculties.forEach(faculty => {
        const facultyYear = new Date(faculty.joined).getUTCFullYear();
        const index = facultyYear - startYear;
        if (index >= 0 && index < yearlyInternalCounts.length) {
          if (faculty.facultyType === 'internal') {
            yearlyInternalCounts[index]++;
          } else if (faculty.facultyType === 'external') {
            yearlyExternalCounts[index]++;
          }
        }
      });

      return res.json({
        labels: Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString()),
        internal: yearlyInternalCounts,
        external: yearlyExternalCounts,
      });
    }

    const yearData = faculties.filter(faculty => new Date(faculty.joined).getUTCFullYear() === parseInt(year));
    yearData.forEach(faculty => {
      const month = new Date(faculty.joined).getUTCMonth();
      if (faculty.facultyType === 'internal') {
        internalCounts[month]++;
      } else if (faculty.facultyType === 'external') {
        externalCounts[month]++;
      }
    });

    res.json({
      labels: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
      internal: internalCounts,
      external: externalCounts,
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
  getFacultyById
};