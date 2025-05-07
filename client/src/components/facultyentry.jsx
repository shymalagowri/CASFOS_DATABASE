import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import "../styles/facultymanagement.css";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const FacultyManagement = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const [facultyType, setFacultyType] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [savingStatus, setSavingStatus] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [facultyData, setFacultyData] = useState({
    name: "",
    cadre: "",
    yearOfAllotment: "",
    rrSfsDate: "",
    dateOfJoining: "",
    dateOfRelieve: "",
    dateOfBirth: "",
    mobileNumber: "",
    communicationAddress: "",
    permanentAddress: "",
    email: "",
    photograph: null,
    presentPlaceOfWorking: "",
    status: "",
    majorDomains: [],
    minorDomains: [],
    areasOfExpertise: "",
    awardsReceived: "",
    inServiceTrainingHandled: "",
    publications: [],
    educationDetails: [],
    coursesHandled: [],
    toursAttended: [],
    examiner: [],
    specialSessions: [],
    institution: "",
    conduct: "",
    modulesHandled: [],
    otherResponsibilities: [],
  });
  const [domainExpertise, setDomainExpertise] = useState([{ major: "", minors: [] }]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const staffid = username.toString();

  const domainOptions = {
    "Forest & Wildlife": [
      "Silviculture",
      "Mensuration and Biometry",
      "Non – Timber Forest Products and Medicinal plants",
      "Tree Harvesting, Wood Science and Technology",
      "Forest Survey & Engineering",
      "Forest Health and Disaster Management",
      "Forest-People Interface",
      "Forest Policy and Law",
      "Forest Resource Management",
      "Wildlife Conservation & Management",
      "Land Resources and Conservation",
      "Economics of Forests and Natural Resources",
      "Environmental Laws & Management",
      "Applied Ecology and Biodiversity Conservation",
      "Forest Administration and Accounts",
      "General Biology/ Forest Botany & Taxonomy",
      "Forest Statistics/Mathematics",
      "Computer Application, Remote Sensing and GIS in Forestry",
      "Urban Forestry/Recreation Forestry & Land Scaping",
    ],
    Environment: [
      "Environmental Laws & Management",
      "Climate Change: Adaptation & Mitigation",
      "Wasteland Management",
      "Environmental Economics & Accounting",
      "Coastal Regulation Zone",
      "Environmental Impact Assessment & Auditing",
      "Ecosystem Services Valuation",
      "Sustainable Development Goals",
      "Green Energy",
      "Ecosystem Health",
      "Others",
    ],
    "Disaster Management": ["Forest Fire Management & Damage assessment", "Cyclone", "Flood", "Desertification", "Others"],
    "Human Resource Development": [
      "Time Management",
      "Leadership Management",
      "Effective Leadership and Conflict Resolution",
      "Communication Skills and Management",
      "Crowd Management",
      "Delegation and Interdepartmental Coordination",
      "Emotional Intelligence",
      "Gender Sensitization",
      "Building competencies for personal Excellence",
      "Others",
    ],
    "Health and Fitness": ["First Aid", "Counselling", "Physical, mental and Social Health", "Stress Management", "Yoga and Meditation", "Others"],
    "Ethics and Public Governance": [
      "Public administration, Public Grievance and Public Finance",
      "Decision Making",
      "Ethics in Governance",
      "Anti-corruption Measures",
      "Conflict Management",
      "Transparency in working",
      "Accountability",
      "Public Relations, Crisis control",
      "E-governance",
      "Project Implementation and Management",
      "Others",
    ],
    "Jurisprudence (Acts and Rules)": [
      "The Bharatiya Nagarik Suraksha Sanhita (BNSS)",
      "Bharatiya Nyaya Sanhita (BNS)",
      "Bharatiya Sakshya Adhiniyam (BSA)",
      "POSH Act, 2013",
      "Right to Information (RTI) Act, 2005",
      "Cyber Security Laws",
      "Others",
    ],
    "CCS Rules and Regulation": ["Service Rules and matters", "Conduct Rules", "Disciplinary Proceedings", "Others"],
    "Media Management": [
      "The Art of Interacting with Print and Electronic Media",
      "Role of Media",
      "Media Relations and Image Management",
      "Proactive Media Engagement",
      "Social Media Management",
      "Others",
    ],
  };

  useEffect(() => {
    if (location.state && location.state.facultyData) {
      const rejectedFaculty = location.state.facultyData;
      setFacultyType(rejectedFaculty.facultyType || "");
      setFacultyData({
        ...facultyData,
        name: rejectedFaculty.name || "",
        cadre: rejectedFaculty.cadre || "",
        yearOfAllotment: rejectedFaculty.yearOfAllotment || "",
        rrSfsDate: rejectedFaculty.rrSfsDate ? new Date(rejectedFaculty.rrSfsDate).toISOString().split("T")[0] : "",
        dateOfJoining: rejectedFaculty.dateOfJoining ? new Date(rejectedFaculty.dateOfJoining).toISOString().split("T")[0] : "",
        dateOfRelieve: rejectedFaculty.dateOfRelieve ? new Date(rejectedFaculty.dateOfRelieve).toISOString().split("T")[0] : "",
        dateOfBirth: rejectedFaculty.dateOfBirth ? new Date(rejectedFaculty.dateOfBirth).toISOString().split("T")[0] : "",
        mobileNumber: rejectedFaculty.mobileNumber || "",
        communicationAddress: rejectedFaculty.communicationAddress || "",
        permanentAddress: rejectedFaculty.permanentAddress || "",
        email: rejectedFaculty.email || "",
        photograph: null,
        presentPlaceOfWorking: rejectedFaculty.presentPlaceOfWorking || "",
        status: rejectedFaculty.status || "",
        majorDomains: rejectedFaculty.majorDomains || [],
        minorDomains: rejectedFaculty.minorDomains || [],
        areasOfExpertise: rejectedFaculty.areasOfExpertise || "",
        awardsReceived: rejectedFaculty.awardsReceived || "",
        inServiceTrainingHandled: rejectedFaculty.inServiceTrainingHandled || "",
        publications: rejectedFaculty.publications || [],
        educationDetails: rejectedFaculty.educationDetails || [],
        coursesHandled: rejectedFaculty.coursesHandled || [],
        toursAttended: rejectedFaculty.toursAttended || [],
        examiner: rejectedFaculty.examiner || [],
        specialSessions: rejectedFaculty.specialSessions || [],
        institution: rejectedFaculty.institution || "",
        conduct: rejectedFaculty.conduct || "",
        modulesHandled: rejectedFaculty.modulesHandled || [],
        otherResponsibilities: rejectedFaculty.otherResponsibilities || [],
      });

      if (rejectedFaculty.majorDomains && rejectedFaculty.majorDomains.length > 0) {
        const newDomainExpertise = rejectedFaculty.majorDomains.map((major) => ({
          major,
          minors: rejectedFaculty.minorDomains.filter((minor) => domainOptions[major]?.includes(minor)) || [],
        }));
        setDomainExpertise(newDomainExpertise.length > 0 ? newDomainExpertise : [{ major: "", minors: [] }]);
      }

      if (rejectedFaculty.photograph) {
        setImagePreview(rejectedFaculty.photograph);
      }
    }
  }, [location.state]);

  const handleFacultyTypeChange = (e) => {
    setFacultyType(e.target.value);
    setFacultyData({
      ...facultyData,
      institution: "",
      majorDomains: [],
      minorDomains: [],
      status: "",
      conduct: "",
    });
    setDomainExpertise([{ major: "", minors: [] }]);
    autoSaveFacultyData();
  };

  const handleInputChange = (e, fieldType = "", index = -1) => {
    const { name, value } = e.target;
    if (fieldType === "coursesHandled") {
      const updatedCourses = [...facultyData.coursesHandled];
      updatedCourses[index][name] = value;
      setFacultyData({ ...facultyData, coursesHandled: updatedCourses });
    } else if (fieldType === "modulesHandled") {
      const updatedModules = [...facultyData.modulesHandled];
      updatedModules[index] = value;
      setFacultyData({ ...facultyData, modulesHandled: updatedModules });
    } else if (fieldType) {
      const updatedField = [...facultyData[fieldType]];
      updatedField[index][name] = value;
      setFacultyData({ ...facultyData, [fieldType]: updatedField });
    } else {
      setFacultyData({ ...facultyData, [name]: value });
    }
    autoSaveFacultyData();
  };

  const handleMajorDomainChange = (index, value) => {
    const updatedExpertise = [...domainExpertise];
    updatedExpertise[index] = { major: value, minors: [] };
    setDomainExpertise(updatedExpertise);
    updateFacultyData(updatedExpertise);
  };

  const handleMinorDomainChange = (index, subDomain, checked) => {
    const updatedExpertise = [...domainExpertise];
    if (checked) {
      updatedExpertise[index].minors = [...updatedExpertise[index].minors, subDomain];
    } else {
      updatedExpertise[index].minors = updatedExpertise[index].minors.filter((d) => d !== subDomain);
    }
    setDomainExpertise(updatedExpertise);
    updateFacultyData(updatedExpertise);
  };

  const updateFacultyData = (expertise) => {
    const majorDomains = expertise.map((e) => e.major).filter(Boolean);
    const minorDomains = expertise.flatMap((e) => e.minors);
    setFacultyData((prev) => ({
      ...prev,
      majorDomains,
      minorDomains,
    }));
    autoSaveFacultyData();
  };

  const handleAddDomainExpertise = () => {
    setDomainExpertise([...domainExpertise, { major: "", minors: [] }]);
  };

  const handleRemoveDomainExpertise = (index) => {
    const updatedExpertise = domainExpertise.filter((_, i) => i !== index);
    setDomainExpertise(updatedExpertise);
    updateFacultyData(updatedExpertise);
  };

  const handleAddResponsibility = () => {
    setFacultyData({
      ...facultyData,
      otherResponsibilities: [...(facultyData.otherResponsibilities || []), { responsibility: "" }],
    });
  };

  const handleRemoveResponsibility = (index) => {
    const updatedResponsibilities = (facultyData.otherResponsibilities || []).filter((_, i) => i !== index);
    setFacultyData({ ...facultyData, otherResponsibilities: updatedResponsibilities });
  };

  const handleAddModule = () => {
    setFacultyData({
      ...facultyData,
      modulesHandled: [...(facultyData.modulesHandled || []), ""],
    });
  };

  const handleRemoveModule = (index) => {
    const updatedModules = (facultyData.modulesHandled || []).filter((_, i) => i !== index);
    setFacultyData({ ...facultyData, modulesHandled: updatedModules });
  };

  const handleAddPublication = () => {
    setFacultyData((prevState) => ({
      ...prevState,
      publications: [
        ...(prevState.publications || []),
        { typeOfPublication: "", title: "", dateOfPublication: "", additionalDetails: "" },
      ],
    }));
  };

  const handleRemovePublication = (index) => {
    const updatedPublications = (facultyData.publications || []).filter((_, i) => i !== index);
    setFacultyData({ ...facultyData, publications: updatedPublications });
  };

  const handleAddEducation = () => {
    setFacultyData((prevState) => ({
      ...prevState,
      educationDetails: [
        ...(prevState.educationDetails || []),
        { degree: "", specialization: "", institutionName: "" },
      ],
    }));
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = (facultyData.educationDetails || []).filter((_, i) => i !== index);
    setFacultyData({ ...facultyData, educationDetails: updatedEducation });
  };

  const handleAddCourse = () => {
    setFacultyData({
      ...facultyData,
      coursesHandled: [
        ...(facultyData.coursesHandled || []),
        { courseType: "", batchno: "", title: "", feedbackRating: "", feedbackRatings: "", otherCourseType: "" },
      ],
    });
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = (facultyData.coursesHandled || []).filter((_, i) => i !== index);
    setFacultyData({ ...facultyData, coursesHandled: updatedCourses });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Size Error",
          text: "Photograph must be less than 500KB.",
        });
        return;
      }
      setFacultyData({ ...facultyData, photograph: file });
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const validateForm = () => {
    const errors = [];

    // Required fields
    if (!facultyType) {
      errors.push("Faculty Type is required.");
    }
    if (!facultyData.name.trim()) {
      errors.push("Name is required.");
    } else if (facultyData.name.length > 100) {
      errors.push("Name must be under 100 characters.");
    }
    if (!facultyData.mobileNumber) {
      errors.push("Mobile Number is required.");
    } else if (!/^\d{10}$/.test(facultyData.mobileNumber)) {
      errors.push("Mobile Number must be exactly 10 digits.");
    }
    if (!facultyData.email) {
      errors.push("Email Address is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(facultyData.email)) {
      errors.push("Please enter a valid Email Address (e.g., example@domain.com).");
    }

    // Optional fields - only validate if provided
    if (facultyData.yearOfAllotment && !/^\d{4}$/.test(facultyData.yearOfAllotment)) {
      errors.push("Year of Allotment must be a valid 4-digit year (e.g., 2020).");
    }

    if (facultyData.cadre && !facultyData.cadre.trim()) {
      errors.push("Cadre cannot be empty if provided.");
    }

    if ((facultyType === "external" || facultyType === "contract") && facultyData.institution && !facultyData.institution.trim()) {
      errors.push("Institution Name cannot be empty if provided.");
    }

    facultyData.educationDetails.forEach((edu, index) => {
      if (edu.degree.trim()) {
        if (!edu.specialization.trim()) {
          errors.push(`Education ${index + 1}: Specialization is required if Degree is provided.`);
        }
        if (!edu.institutionName.trim()) {
          errors.push(`Education ${index + 1}: Institution Name is required if Degree is provided.`);
        }
      }
    });

    facultyData.publications.forEach((pub, index) => {
      if (pub.typeOfPublication) {
        if (!pub.title.trim()) {
          errors.push(`Publication ${index + 1}: Title is required if Type of Publication is selected.`);
        }
        if (!pub.dateOfPublication) {
          errors.push(`Publication ${index + 1}: Date of Publication is required if Type of Publication is selected.`);
        }
      }
    });

    facultyData.coursesHandled.forEach((course, index) => {
      if (course.courseType) {
        if (!course.batchno) {
          errors.push(`Course ${index + 1}: Batch Number is required if Course Type is selected.`);
        }
        if (!course.title.trim()) {
          errors.push(`Course ${index + 1}: Title is required if Course Type is selected.`);
        }
      }
      if (course.feedbackRating && (course.feedbackRating < 1 || course.feedbackRating > 10)) {
        errors.push(`Course ${index + 1}: Feedback Rating must be between 1 and 10.`);
      }
    });

    facultyData.modulesHandled.forEach((module, index) => {
      if (module && !module.trim()) {
        errors.push(`Module ${index + 1}: Module name cannot be empty if provided.`);
      }
    });

    facultyData.otherResponsibilities.forEach((resp, index) => {
      if (resp.responsibility && !resp.responsibility.trim()) {
        errors.push(`Responsibility ${index + 1}: Responsibility cannot be empty if provided.`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaved(true);

    const errors = validateForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Errors",
        html: `<ul style="text-align: left;">${errors.map((err) => `<li>${err}</li>`).join("")}</ul>`,
        confirmButtonText: "OK",
      });
      setIsSaved(false);
      return;
    }

    const updatedFacultyData = { ...facultyData, facultyType };
    try {
      const response = await axios.post(
        `http://${ip}:${port}/api/faculty/save`,
        updatedFacultyData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty data saved successfully!",
        });
        setFacultyData({
          name: "",
          cadre: "",
          yearOfAllotment: "",
          rrSfsDate: "",
          dateOfJoining: "",
          dateOfRelieve: "",
          dateOfBirth: "",
          mobileNumber: "",
          communicationAddress: "",
          permanentAddress: "",
          email: "",
          photograph: null,
          presentPlaceOfWorking: "",
          status: "",
          majorDomains: [],
          minorDomains: [],
          areasOfExpertise: "",
          awardsReceived: "",
          inServiceTrainingHandled: "",
          publications: [],
          educationDetails: [],
          coursesHandled: [],
          toursAttended: [],
          examiner: [],
          specialSessions: [],
          institution: "",
          conduct: "",
          modulesHandled: [],
          otherResponsibilities: [],
        });
        setDomainExpertise([{ major: "", minors: [] }]);
        setFacultyType("");
        setImagePreview(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Save",
          text: response.data.message || "Failed to save faculty data. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving faculty data:", error);
      const errorMessage = error.response?.data?.message || 
        error.message === "Network Error" ? "Unable to connect to the server. Please check your network connection." :
        "An unexpected error occurred while saving the data.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
    setIsSaved(false);
  };

  const autoSaveFacultyData = async () => {
    if (!facultyType || isSaved) return;
    setSavingStatus("Saving...");
    try {
      const response = await axios.post(`http://${ip}:${port}/api/faculty/autoSaveFaculty`, {
        staffid,
        facultyType,
        facultyData,
      });
      setSavingStatus("Draft Saved");
    } catch (error) {
      console.error("Auto-save error:", error);
      const errorMessage = error.response?.data?.message || "Failed to auto-save draft.";
      setSavingStatus(errorMessage);
    }
  };

  useEffect(() => {
    const fetchAutoSavedFacultyData = async () => {
      if (location.state && location.state.facultyData) return;
      try {
        const response = await axios.get(`http://${ip}:${port}/api/faculty/getAutoSavedFaculty`, {
          params: { staffid },
        });
        if (response.data.success) {
          const fetchedData = response.data.data || {};
          setFacultyType(fetchedData.facultyType || "");
          setFacultyData((prev) => ({
            ...prev,
            name: fetchedData.name || "",
            cadre: fetchedData.cadre || "",
            yearOfAllotment: fetchedData.yearOfAllotment || "",
            rrSfsDate: fetchedData.rrSfsDate ? new Date(fetchedData.rrSfsDate).toISOString().split("T")[0] : "",
            dateOfJoining: fetchedData.dateOfJoining ? new Date(fetchedData.dateOfJoining).toISOString().split("T")[0] : "",
            dateOfRelieve: fetchedData.dateOfRelieve ? new Date(fetchedData.dateOfRelieve).toISOString().split("T")[0] : "",
            dateOfBirth: fetchedData.dateOfBirth ? new Date(fetchedData.dateOfBirth).toISOString().split("T")[0] : "",
            mobileNumber: fetchedData.mobileNumber || "",
            communicationAddress: fetchedData.communicationAddress || "",
            permanentAddress: fetchedData.permanentAddress || "",
            email: fetchedData.email || "",
            photograph: fetchedData.photograph || null,
            presentPlaceOfWorking: fetchedData.presentPlaceOfWorking || "",
            status: fetchedData.status || "",
            conduct: fetchedData.conduct || "",
            modulesHandled: fetchedData.modulesHandled || [],
            majorDomains: fetchedData.majorDomains || [],
            minorDomains: fetchedData.minorDomains || [],
            areasOfExpertise: fetchedData.areasOfExpertise || "",
            awardsReceived: fetchedData.awardsReceived || "",
            inServiceTrainingHandled: fetchedData.inServiceTrainingHandled || "",
            publications: fetchedData.publications || [],
            educationDetails: fetchedData.educationDetails || [],
            coursesHandled: fetchedData.coursesHandled || [],
            toursAttended: fetchedData.toursAttended || [],
            examiner: fetchedData.examiner || [],
            specialSessions: fetchedData.specialSessions || [],
            institution: fetchedData.institution || "",
            otherResponsibilities: fetchedData.otherResponsibilities || [],
          }));

          if (fetchedData.majorDomains && fetchedData.majorDomains.length > 0) {
            const newDomainExpertise = fetchedData.majorDomains.map((major) => ({
              major,
              minors: fetchedData.minorDomains?.filter((minor) => domainOptions[major]?.includes(minor)) || [],
            }));
            setDomainExpertise(newDomainExpertise);
          }
        }
      } catch (error) {
        console.error("Error fetching auto-saved faculty data:", error);
      }
    };
    fetchAutoSavedFacultyData();

    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveFacultyData();
    }, 10000);
    return () => clearInterval(interval);
  }, [facultyType, facultyData]);

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="style.css" />
        <title>CASFOS</title>
      </Helmet>
      <div>
        <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">FACULTY ENTRY STAFF</span>
          </a>
          <ul className="side-menu top">
            <li>
              <a href={`/facultyentrystaffdashboard?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li className="active">
              <a href={`/facultyentry?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty Entry</span>
              </a>
            </li>
            <li>
              <a href={`/viewfaculty?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty View</span>
              </a>
            </li>
          </ul>
          <ul className="side-menu">
            <li>
              <a href="/login" className="logout">
                <i className="bx bxs-log-out-circle" />
                <span className="text">Logout</span>
              </a>
            </li>
          </ul>
        </section>
        <section id="content">
          <nav>
            <i className="bx bx-menu" />
            <span className="head-title">Dashboard</span>
            <form action="#">
              <div className="form-input"></div>
            </form>
            <div style={styles.usernameContainer}>
              <i className="bx bxs-user-circle" style={styles.userIcon}></i>
              <span style={styles.username}>{username}</span>
            </div>
          </nav>
          <main>
            <div className="faculty-management">
              <div className="dash-content">
                <div className="overview">
                  <div className="title" style={styles.title}>
                    <div className="title-text">
                      <i className="uil uil-tachometer-fast-alt" />
                      <span className="text">Faculty Management</span>
                    </div>
                    <div className="saving-status" style={styles.savingStatus}>
                      {savingStatus === "Saving..." && (
                        <div>
                          <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i>
                          <span>{savingStatus}</span>
                        </div>
                      )}
                      {savingStatus === "Draft Saved" && (
                        <div>
                          <i className="bx bx-check-circle" style={styles.successIcon}></i>
                          <span>{savingStatus}</span>
                        </div>
                      )}
                      {savingStatus && savingStatus !== "Saving..." && savingStatus !== "Draft Saved" && (
                        <div>
                          <i className="bx bx-error-circle" style={styles.errorIcon}></i>
                          <span>{savingStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="facultyType">Faculty Type <span style={{ color: "red" }}>*</span>:</label>
                      <select id="facultyType" value={facultyType} onChange={handleFacultyTypeChange}>
                        <option value="" disabled>Select Faculty Type</option>
                        <option value="internal">Internal Faculty</option>
                        <option value="external">External Faculty</option>
                        <option value="contract">Contract Faculty</option>
                      </select>
                    </div>

                    {facultyType === "internal" && (
                      <div>
                        <h3>Internal Faculty Details</h3>
                        <label htmlFor="name">Name <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Name"
                          value={facultyData.name}
                          onChange={handleInputChange}
                          maxLength="100"
                        />
                        <div style={{ fontSize: "12px", color: "#555" }}>
                          {facultyData.name.length}/100 characters
                        </div>
                        <label htmlFor="cadre">Cadre:</label>
                        <input
                          type="text"
                          id="cadre"
                          name="cadre"
                          placeholder="Cadre"
                          value={facultyData.cadre}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="yearOfAllotment">Year of Allotment:</label>
                        <input
                          type="text"
                          id="yearOfAllotment"
                          name="yearOfAllotment"
                          placeholder="Year of Allotment"
                          value={facultyData.yearOfAllotment}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="rrSfsDate">RR/SFS Date:</label>
                        <input
                          type="date"
                          id="rrSfsDate"
                          name="rrSfsDate"
                          value={facultyData.rrSfsDate}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="dateOfJoining">Date of Joining:</label>
                        <input
                          type="date"
                          id="dateOfJoining"
                          name="dateOfJoining"
                          value={facultyData.dateOfJoining}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="dateOfRelieve">Date of Relieving:</label>
                        <input
                          type="date"
                          id="dateOfRelieve"
                          name="dateOfRelieve"
                          value={facultyData.dateOfRelieve}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="dateOfBirth">Date of Birth:</label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={facultyData.dateOfBirth}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="mobileNumber">Mobile Number <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="text"
                          id="mobileNumber"
                          name="mobileNumber"
                          placeholder="Mobile Number"
                          value={facultyData.mobileNumber}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="communicationAddress">Communication Address:</label>
                        <input
                          type="text"
                          id="communicationAddress"
                          name="communicationAddress"
                          placeholder="Communication Address"
                          value={facultyData.communicationAddress}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="permanentAddress">Permanent Address:</label>
                        <input
                          type="text"
                          id="permanentAddress"
                          name="permanentAddress"
                          placeholder="Permanent Address"
                          value={facultyData.permanentAddress}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="email">Email Address <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Email Address"
                          value={facultyData.email}
                          onChange={handleInputChange}
                        />
                        <div>
                          <label htmlFor="photograph">Photograph (less than 50KB):</label>
                          <input
                            type="file"
                            id="photograph"
                            name="photograph"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          {imagePreview && (
                            <div style={{ marginTop: "10px" }}>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "contain" }}
                              />
                            </div>
                          )}
                        </div>
                        <label htmlFor="status">Status:</label>
                        <select name="status" value={facultyData.status} onChange={handleInputChange}>
                          <option value="" disabled>Select Status</option>
                          <option value="retired">Repatriated</option>
                          <option value="serving">Serving</option>
                        </select>

                        {facultyData.status === "serving" && (
                          <div>
                            <label htmlFor="presentPlaceOfWorking">Present Place of Working:</label>
                            <input
                              type="text"
                              id="presentPlaceOfWorking"
                              name="presentPlaceOfWorking"
                              placeholder="Present Place of Working"
                              value={facultyData.presentPlaceOfWorking}
                              onChange={handleInputChange}
                            />
                          </div>
                        )}

                        <h3>Domain Expertise</h3>
                        {domainExpertise.map((expertise, index) => (
                          <div key={index} className="domain-expertise-entry" style={{ marginBottom: "20px" }}>
                            <div className="domain-section">
                              <h4>Major Domain {index + 1}</h4>
                              <select
                                value={expertise.major}
                                onChange={(e) => handleMajorDomainChange(index, e.target.value)}
                              >
                                <option value="">Select Major Domain</option>
                                {Object.keys(domainOptions).map((domain) => (
                                  <option key={domain} value={domain}>
                                    {domain}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {expertise.major && (
                              <div className="domain-section">
                                <h4>Minor Domains</h4>
                                {domainOptions[expertise.major].map((subDomain) => (
                                  <div key={subDomain}>
                                    <input
                                      type="checkbox"
                                      id={`minor-${index}-${subDomain}`}
                                      value={subDomain}
                                      checked={expertise.minors.includes(subDomain)}
                                      onChange={(e) => handleMinorDomainChange(index, subDomain, e.target.checked)}
                                    />
                                    <label htmlFor={`minor-${index}-${subDomain}`}>{subDomain}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {domainExpertise.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDomainExpertise(index)}
                                style={{ marginTop: "10px", color: "white" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={handleAddDomainExpertise} style={{ marginTop: "10px" }}>
                          <i className="bx bx-plus" /> Add Domain Expertise
                        </button>

                        <label htmlFor="areasOfExpertise">Areas of Expertise:</label>
                        <input
                          type="text"
                          name="areasOfExpertise"
                          placeholder="Areas of Expertise"
                          value={facultyData.areasOfExpertise}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="awardsReceived">Awards Received:</label>
                        <input
                          type="text"
                          name="awardsReceived"
                          placeholder="Awards Received"
                          value={facultyData.awardsReceived}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="inServiceTrainingHandled">In-Service Training Handled:</label>
                        <input
                          type="text"
                          name="inServiceTrainingHandled"
                          placeholder="In-Service Training Handled"
                          value={facultyData.inServiceTrainingHandled}
                          onChange={handleInputChange}
                        />

                        <h3>Educational Details</h3>
                        <button type="button" onClick={handleAddEducation}>Add Educational Details</button>
                        {(facultyData.educationDetails || []).map((education, index) => (
                          <div key={index}>
                            <h4>Education {index + 1} Details</h4>
                            <label Server HTMLFor={`degree-${index}`}>Degree:</label>
                            <input
                              type="text"
                              name="degree"
                              placeholder="Degree"
                              value={education.degree}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <label Server HTMLFor={`specialization-${index}`}>Specialization:</label>
                            <input
                              type="text"
                              name="specialization"
                              placeholder="Specialization"
                              value={education.specialization}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <label Server HTMLFor={`institutionName-${index}`}>Institution Name:</label>
                            <input
                              type="text"
                              name="institutionName"
                              placeholder="Institution Name"
                              value={education.institutionName}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <button type="button" onClick={() => handleRemoveEducation(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Books and Article Publication</h3>
                        <button type="button" onClick={handleAddPublication}>Add Publication</button>
                        {(facultyData.publications || []).map((publication, index) => (
                          <div key={index}>
                            <h4>Publication {index + 1} Details</h4>
                            <select
                              name="typeOfPublication"
                              value={publication.typeOfPublication}
                              onChange={(e) => handleInputChange(e, "publications", index)}
                            >
                              <option value="" disabled>Select Type of Publication</option>
                              <option value="Books Published">Books Published</option>
                              <option value="Articles Published">Articles Published</option>
                              <option value="Manuals">Manuals</option>
                              <option value="Others">Others</option>
                            </select>
                            <label Server HTMLFor="title">Title of Publication:</label>
                            <input
                              type="text"
                              name="title"
                              placeholder="Title"
                              value={publication.title}
                              onChange={(e) => handleInputChange(e, "publications", index)}
                            />
                            <label Server HTMLFor="dateOfPublication">Date of Publication:</label>
                            <input
                              type="date"
                              name="dateOfPublication"
                              value={publication.dateOfPublication}
                              onChange={(e) => handleInputChange(e, "publications", index)}
                            />
                            {publication.typeOfPublication === "Others" && (
                              <div>
                                <label Server HTMLFor={`additionalDetails-${index}`}>Additional Details:</label>
                                <input
                                  type="text"
                                  id={`additionalDetails-${index}`}
                                  name="additionalDetails"
                                  placeholder="Additional Details"
                                  value={publication.additionalDetails}
                                  onChange={(e) => handleInputChange(e, "publications", index)}
                                />
                              </div>
                            )}
                            <button type="button" onClick={() => handleRemovePublication(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Courses Handled</h3>
                        <button type="button" onClick={handleAddCourse}>Add Additional Course</button>
                        {(facultyData.coursesHandled || []).map((course, index) => (
                          <div key={index}>
                            <h4>Course {index + 1} Details</h4>
                            <label Server HTMLFor="courseType">Course Type:</label>
                            <select
                              name="courseType"
                              value={course.courseType}
                              onChange={(e) => handleInputChange(e, "coursesHandled", index)}
                            >
                              <option value="">Select Course Type</option>
                              <option value="InductionTraining">Induction Training</option>
                              <option value="InserviceTraining">In-Service Training</option>
                              <option value="OtherStakeholder">Other Stakeholder</option>
                              <option value="SpecialTraining">Special Training</option>
                              <option value="SpecialLecture">Special Lecture</option>
                              <option value="Tours">Tours</option>
                              <option value="Others">Others</option>
                            </select>
                            {course.courseType === "Others" && (
                              <div>
                                <label Server HTMLFor={`otherCourseType-${index}`}>Specify Other Course Type:</label>
                                <input
                                  type="text"
                                  name="otherCourseType"
                                  placeholder="Specify Course Type"
                                  value={course.otherCourseType || ""}
                                  onChange={(e) => handleInputChange(e, "coursesHandled", index)}
                                />
                              </div>
                            )}
                            <label Server HTMLFor="batchno">Batch Number:</label>
                            <input
                              type="number"
                              name="batchno"
                              placeholder="Batch No"
                              value={course.batchno}
                              onChange={(e) => handleInputChange(e, "coursesHandled", index)}
                            />
                            <label Server HTMLFor="title">Title of the Course:</label>
                            <input
                              type="text"
                              name="title"
                              placeholder="Title of the Course"
                              value={course.title}
                              onChange={(e) => handleInputChange(e, "coursesHandled", index)}
                            />
                            <label Server HTMLFor="feedbackRating">Feedback Rating:</label>
                            <input
                              type="number"
                              name="feedbackRating"
                              placeholder="Feedback Rating (1-10)"
                              value={course.feedbackRating}
                              onChange={(e) => handleInputChange(e, "coursesHandled", index)}
                            />
                            <label Server HTMLFor="feedbackRatings">Ordinal Ratings:</label>
                            <select
                              name="feedbackRatings"
                              value={course.feedbackRatings}
                              onChange={(e) => handleInputChange(e, "coursesHandled", index)}
                            >
                              <option value="" disabled>Select Feedback Rating</option>
                              <option value="poor">Poor</option>
                              <option value="good">Good</option>
                              <option value="verygood">Very Good</option>
                              <option value="excellent">Excellent</option>
                            </select>
                            <button type="button" onClick={() => handleRemoveCourse(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Modules Handled</h3>
                        <button type="button" onClick={handleAddModule}>Add Module</button>
                        {(facultyData.modulesHandled || []).map((module, index) => (
                          <div key={index}>
                            <h4>Module {index + 1}</h4>
                            <input
                              type="text"
                              placeholder="Enter Module"
                              value={module}
                              onChange={(e) => handleInputChange(e, "modulesHandled", index)}
                            />
                            <button type="button" onClick={() => handleRemoveModule(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Other Responsibilities</h3>
                        <button type="button" onClick={handleAddResponsibility}>Add Responsibility</button>
                        {(facultyData.otherResponsibilities || []).map((resp, index) => (
                          <div key={index}>
                            <h4>Responsibility {index + 1}</h4>
                            <label Server HTMLFor={`responsibility-${index}`}>Responsibility:</label>
                            <input
                              type="text"
                              name="responsibility"
                              placeholder="Enter Responsibility"
                              value={resp.responsibility}
                              onChange={(e) => handleInputChange(e, "otherResponsibilities", index)}
                            />
                            <button type="button" onClick={() => handleRemoveResponsibility(index)}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {facultyType === "external" && (
                      <div>
                        <h3>External Faculty Details</h3>
                        <label htmlFor="name">Name <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Name of the Officer"
                          value={facultyData.name}
                          onChange={handleInputChange}
                          maxLength="100"
                        />
                        <div style={{ fontSize: "12px", color: "#555" }}>
                          {facultyData.name.length}/100 characters
                        </div>
                        <label htmlFor="cadre">Cadre:</label>
                        <input
                          type="text"
                          name="cadre"
                          placeholder="Cadre"
                          value={facultyData.cadre}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="yearOfAllotment">Year of Allotment:</label>
                        <input
                          type="text"
                          name="yearOfAllotment"
                          placeholder="Year of Allotment"
                          value={facultyData.yearOfAllotment}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="mobileNumber">Mobile Number <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="text"
                          name="mobileNumber"
                          placeholder="Mobile Number"
                          value={facultyData.mobileNumber}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="communicationAddress">Communication Address:</label>
                        <input
                          type="text"
                          name="communicationAddress"
                          placeholder="Communication Address"
                          value={facultyData.communicationAddress}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="permanentAddress">Permanent Address:</label>
                        <input
                          type="text"
                          name="permanentAddress"
                          placeholder="Permanent Address"
                          value={facultyData.permanentAddress}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="email">Email Address <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email ID"
                          value={facultyData.email}
                          onChange={handleInputChange}
                        />
                        <div>
                          <label htmlFor="photograph">Photograph (less than 50KB):</label>
                          <input
                            type="file"
                            id="photograph"
                            name="photograph"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          {imagePreview && (
                            <div style={{ marginTop: "10px" }}>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "contain" }}
                              />
                            </div>
                          )}
                        </div>

                        <label htmlFor="status">Status:</label>
                        <select name="status" value={facultyData.status} onChange={handleInputChange}>
                          <option value="" disabled>Select Status</option>
                          <option value="retired">Repatriated</option>
                          <option value="serving">Serving</option>
                        </select>

                        {facultyData.status === "serving" && (
                          <div>
                            <label htmlFor="presentPlaceOfWorking">Present Place of Working:</label>
                            <input
                              type="text"
                              id="presentPlaceOfWorking"
                              name="presentPlaceOfWorking"
                              placeholder="Present Place of Working"
                              value={facultyData.presentPlaceOfWorking}
                              onChange={handleInputChange}
                            />
                          </div>
                        )}

                        <label htmlFor="institution">Name of the Institution:</label>
                        <input
                          type="text"
                          name="institution"
                          placeholder="Institution (College/University)"
                          value={facultyData.institution}
                          onChange={handleInputChange}
                        />

                        <h3>Domain Expertise</h3>
                        {domainExpertise.map((expertise, index) => (
                          <div key={index} className="domain-expertise-entry" style={{ marginBottom: "20px" }}>
                            <div className="domain-section">
                              <h4>Major Domain {index + 1}</h4>
                              <select
                                value={expertise.major}
                                onChange={(e) => handleMajorDomainChange(index, e.target.value)}
                              >
                                <option value="">Select Major Domain</option>
                                {Object.keys(domainOptions).map((domain) => (
                                  <option key={domain} value={domain}>
                                    {domain}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {expertise.major && (
                              <div className="domain-section">
                                <h4>Minor Domains</h4>
                                {domainOptions[expertise.major].map((subDomain) => (
                                  <div key={subDomain}>
                                    <input
                                      type="checkbox"
                                      id={`minor-${index}-${subDomain}`}
                                      value={subDomain}
                                      checked={expertise.minors.includes(subDomain)}
                                      onChange={(e) => handleMinorDomainChange(index, subDomain, e.target.checked)}
                                    />
                                    <label htmlFor={`minor-${index}-${subDomain}`}>{subDomain}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {domainExpertise.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDomainExpertise(index)}
                                style={{ marginTop: "10px", color: "white" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={handleAddDomainExpertise} style={{ marginTop: "10px" }}>
                          <i className="bx bx-plus" /> Add Domain Expertise
                        </button>

                        <label htmlFor="areasOfExpertise">Areas of Expertise:</label>
                        <input
                          type="text"
                          name="areasOfExpertise"
                          placeholder="Areas of Expertise"
                          value={facultyData.areasOfExpertise}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="awardsReceived">Awards Received:</label>
                        <input
                          type="text"
                          name="awardsReceived"
                          placeholder="Awards Received"
                          value={facultyData.awardsReceived}
                          onChange={handleInputChange}
                        />

                        <h3>Educational Details</h3>
                        <button type="button" onClick={handleAddEducation}>Add Educational Details</button>
                        {(facultyData.educationDetails || []).map((education, index) => (
                          <div key={index}>
                            <h4>Education {index + 1} Details</h4>
                            <label htmlFor={`degree-${index}`}>Degree:</label>
                            <input
                              type="text"
                              name="degree"
                              placeholder="Degree"
                              value={education.degree}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <label htmlFor={`specialization-${index}`}>Specialization:</label>
                            <input
                              type="text"
                              name="specialization"
                              placeholder="Specialization"
                              value={education.specialization}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <label htmlFor={`institutionName-${index}`}>Institution Name:</label>
                            <input
                              type="text"
                              name="institutionName"
                              placeholder="Institution Name"
                              value={education.institutionName}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <button type="button" onClick={() => handleRemoveEducation(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Modules Handled</h3>
                        <button type="button" onClick={handleAddModule}>Add Module</button>
                        {(facultyData.modulesHandled || []).map((module, index) => (
                          <div key={index}>
                            <h4>Module {index + 1}</h4>
                            <input
                              type="text"
                              placeholder="Enter Module"
                              value={module}
                              onChange={(e) => handleInputChange(e, "modulesHandled", index)}
                            />
                            <button type="button" onClick={() => handleRemoveModule(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Other Responsibilities</h3>
                        <button type="button" onClick={handleAddResponsibility}>Add Responsibility</button>
                        {(facultyData.otherResponsibilities || []).map((resp, index) => (
                          <div key={index}>
                            <h4>Responsibility {index + 1}</h4>
                            <label htmlFor={`responsibility-${index}`}>Responsibility:</label>
                            <input
                              type="text"
                              name="responsibility"
                              placeholder="Enter Responsibility"
                              value={resp.responsibility}
                              onChange={(e) => handleInputChange(e, "otherResponsibilities", index)}
                            />
                            <button type="button" onClick={() => handleRemoveResponsibility(index)}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {facultyType === "contract" && (
                      <div>
                        <h3>Contract Faculty Details</h3>
                        <label htmlFor="name">Name <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Name of the Officer"
                          value={facultyData.name}
                          onChange={handleInputChange}
                          maxLength="100"
                        />
                        <div style={{ fontSize: "12px", color: "#555" }}>
                          {facultyData.name.length}/100 characters
                        </div>
                        <label htmlFor="cadre">Cadre:</label>
                        <input
                          type="text"
                          name="cadre"
                          placeholder="Cadre"
                          value={facultyData.cadre}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="yearOfAllotment">Year of Allotment:</label>
                        <input
                          type="text"
                          name="yearOfAllotment"
                          placeholder="Year of Allotment"
                          value={facultyData.yearOfAllotment}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="mobileNumber">Mobile Number <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="text"
                          name="mobileNumber"
                          placeholder="Mobile Number"
                          value={facultyData.mobileNumber}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="communicationAddress">Communication Address:</label>
                        <input
                          type="text"
                          name="communicationAddress"
                          placeholder="Communication Address"
                          value={facultyData.communicationAddress}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="permanentAddress">Permanent Address:</label>
                        <input
                          type="text"
                          name="permanentAddress"
                          placeholder="Permanent Address"
                          value={facultyData.permanentAddress}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="email">Email Address <span style={{ color: "red" }}>*</span>:</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email ID"
                          value={facultyData.email}
                          onChange={handleInputChange}
                        />
                        <div>
                          <label htmlFor="photograph">Photograph (less than 50KB):</label>
                          <input
                            type="file"
                            id="photograph"
                            name="photograph"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          {imagePreview && (
                            <div style={{ marginTop: "10px" }}>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "contain" }}
                              />
                            </div>
                          )}
                        </div>

                        <label htmlFor="status">Status:</label>
                        <select name="status" value={facultyData.status} onChange={handleInputChange}>
                          <option value="" disabled>Select Status</option>
                          <option value="retired">Repatriated</option>
                          <option value="serving">Serving</option>
                        </select>

                        {facultyData.status === "serving" && (
                          <div>
                            <label htmlFor="presentPlaceOfWorking">Present Place of Working:</label>
                            <input
                              type="text"
                              id="presentPlaceOfWorking"
                              name="presentPlaceOfWorking"
                              placeholder="Present Place of Working"
                              value={facultyData.presentPlaceOfWorking}
                              onChange={handleInputChange}
                            />
                          </div>
                        )}

                        <label htmlFor="institution">Name of the Institution:</label>
                        <input
                          type="text"
                          name="institution"
                          placeholder="Institution (College/University)"
                          value={facultyData.institution}
                          onChange={handleInputChange}
                        />

                        <h3>Domain Expertise</h3>
                        {domainExpertise.map((expertise, index) => (
                          <div key={index} className="domain-expertise-entry" style={{ marginBottom: "20px" }}>
                            <div className="domain-section">
                              <h4>Major Domain {index + 1}</h4>
                              <select
                                value={expertise.major}
                                onChange={(e) => handleMajorDomainChange(index, e.target.value)}
                              >
                                <option value="">Select Major Domain</option>
                                {Object.keys(domainOptions).map((domain) => (
                                  <option key={domain} value={domain}>
                                    {domain}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {expertise.major && (
                              <div className="domain-section">
                                <h4>Minor Domains</h4>
                                {domainOptions[expertise.major].map((subDomain) => (
                                  <div key={subDomain}>
                                    <input
                                      type="checkbox"
                                      id={`minor-${index}-${subDomain}`}
                                      value={subDomain}
                                      checked={expertise.minors.includes(subDomain)}
                                      onChange={(e) => handleMinorDomainChange(index, subDomain, e.target.checked)}
                                    />
                                    <label htmlFor={`minor-${index}-${subDomain}`}>{subDomain}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {domainExpertise.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDomainExpertise(index)}
                                style={{ marginTop: "10px", color: "white" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={handleAddDomainExpertise} style={{ marginTop: "10px" }}>
                          <i className="bx bx-plus" /> Add Domain Expertise
                        </button>

                        <label htmlFor="areasOfExpertise">Areas of Expertise:</label>
                        <input
                          type="text"
                          name="areasOfExpertise"
                          placeholder="Areas of Expertise"
                          value={facultyData.areasOfExpertise}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="awardsReceived">Awards Received:</label>
                        <input
                          type="text"
                          name="awardsReceived"
                          placeholder="Awards Received"
                          value={facultyData.awardsReceived}
                          onChange={handleInputChange}
                        />

                        <h3>Educational Details</h3>
                        <button type="button" onClick={handleAddEducation}>Add Educational Details</button>
                        {(facultyData.educationDetails || []).map((education, index) => (
                          <div key={index}>
                            <h4>Education {index + 1} Details</h4>
                            <label htmlFor={`degree-${index}`}>Degree:</label>
                            <input
                              type="text"
                              name="degree"
                              placeholder="Degree"
                              value={education.degree}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <label htmlFor={`specialization-${index}`}>Specialization:</label>
                            <input
                              type="text"
                              name="specialization"
                              placeholder="Specialization"
                              value={education.specialization}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <label htmlFor={`institutionName-${index}`}>Institution Name:</label>
                            <input
                              type="text"
                              name="institutionName"
                              placeholder="Institution Name"
                              value={education.institutionName}
                              onChange={(e) => handleInputChange(e, "educationDetails", index)}
                            />
                            <button type="button" onClick={() => handleRemoveEducation(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Modules Handled</h3>
                        <button type="button" onClick={handleAddModule}>Add Module</button>
                        {(facultyData.modulesHandled || []).map((module, index) => (
                          <div key={index}>
                            <h4>Module {index + 1}</h4>
                            <input
                              type="text"
                              placeholder="Enter Module"
                              value={module}
                              onChange={(e) => handleInputChange(e, "modulesHandled", index)}
                            />
                            <button type="button" onClick={() => handleRemoveModule(index)}>Remove</button>
                          </div>
                        ))}

                        <h3>Other Responsibilities</h3>
                        <button type="button" onClick={handleAddResponsibility}>Add Responsibility</button>
                        {(facultyData.otherResponsibilities || []).map((resp, index) => (
                          <div key={index}>
                            <h4>Responsibility {index + 1}</h4>
                            <label htmlFor={`responsibility-${index}`}>Responsibility:</label>
                            <input
                              type="text"
                              name="responsibility"
                              placeholder="Enter Responsibility"
                              value={resp.responsibility}
                              onChange={(e) => handleInputChange(e, "otherResponsibilities", index)}
                            />
                            <button type="button" onClick={() => handleRemoveResponsibility(index)}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button type="submit" disabled={isSaved}>
                      {isSaved ? "Saving..." : "Save"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

const styles = {
  savingStatus: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  loadingIcon: { fontSize: "16px", color: "#007BFF" },
  successIcon: { fontSize: "16px", color: "#28a745" },
  errorIcon: { fontSize: "16px", color: "#dc3545" },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  title: { display: "flex", justifyContent: "space-between", alignItems: "center" },
};

export default FacultyManagement;