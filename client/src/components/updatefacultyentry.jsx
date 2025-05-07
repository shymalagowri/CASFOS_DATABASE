import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/facultymanagement.css";
import "../styles/style.css";
import axios from "axios";

// Utility function to convert ISO date to yyyy-MM-dd format
const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Domain options
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
  "Disaster Management": [
    "Forest Fire Management & Damage assessment",
    "Cyclone",
    "Flood",
    "Desertification",
    "Others",
  ],
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
  "Health and Fitness": [
    "First Aid",
    "Counselling",
    "Physical, mental and Social Health",
    "Stress Management",
    "Yoga and Meditation",
    "Others",
  ],
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
  "CCS Rules and Regulation": [
    "Service Rules and matters",
    "Conduct Rules",
    "Disciplinary Proceedings",
    "Others",
  ],
  "Media Management": [
    "The Art of Interacting with Print and Electronic Media",
    "Role of Media",
    "Media Relations and Image Management",
    "Proactive Media Engagement",
    "Social Media Management",
    "Others",
  ],
};

function UpdateFacultyEntry() {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const { facultyData, isUpdate } = location.state || {};
  console.log("location.state:", location.state);
  console.log("facultyData:", facultyData);
  console.log("isUpdate:", isUpdate);

  // Format dates from backend
  const formattedFacultyData = {
    ...facultyData,
    rrSfsDate: formatDate(facultyData?.rrSfsDate),
    dateOfJoining: formatDate(facultyData?.dateOfJoining),
    dateOfRelieve: formatDate(facultyData?.dateOfRelieve),
    dateOfBirth: formatDate(facultyData?.dateOfBirth),
    joined: formatDate(facultyData?.joined),
    publications: facultyData?.publications?.map((pub) => ({
      ...pub,
      dateOfPublication: formatDate(pub.dateOfPublication),
    })) || [],
    coursesHandled: facultyData?.coursesHandled?.map((course) => ({
      ...course,
    })) || [],
    toursAttended: facultyData?.toursAttended?.map((tour) => ({
      ...tour,
      startDate: formatDate(tour.startDate),
      endDate: formatDate(tour.endDate),
    })) || [],
    examiner: facultyData?.examiner?.map((exam) => ({
      ...exam,
      date: formatDate(exam.date),
    })) || [],
    specialSessions: facultyData?.specialSessions?.map((session) => ({
      ...session,
      date: formatDate(session.date),
    })) || [],
  };

  const _id = formattedFacultyData._id;

  // Initialize state with formatted faculty data
  const [facultyType, setFacultyType] = useState(formattedFacultyData?.facultyType || "");
  const [facultyDetails, setFacultyDetails] = useState({
    name: formattedFacultyData?.name || "",
    cadre: formattedFacultyData?.cadre || "",
    yearOfAllotment: formattedFacultyData?.yearOfAllotment || "",
    rrSfsDate: formattedFacultyData?.rrSfsDate || "",
    dateOfJoining: formattedFacultyData?.dateOfJoining || "",
    dateOfRelieve: formattedFacultyData?.dateOfRelieve || "",
    dateOfBirth: formattedFacultyData?.dateOfBirth || "",
    mobileNumber: formattedFacultyData?.mobileNumber || "",
    communicationAddress: formattedFacultyData?.communicationAddress || "",
    permanentAddress: formattedFacultyData?.permanentAddress || "",
    email: formattedFacultyData?.email || "",
    photograph: formattedFacultyData?.photograph || "",
    presentPlaceOfWorking: formattedFacultyData?.presentPlaceOfWorking || "",
    status: formattedFacultyData?.status || "serving",
    modulesHandled: formattedFacultyData?.modulesHandled || [],
    majorDomains: formattedFacultyData?.majorDomains || [],
    minorDomains: formattedFacultyData?.minorDomains || [],
    areasOfExpertise: formattedFacultyData?.areasOfExpertise || "",
    awardsReceived: formattedFacultyData?.awardsReceived || "",
    inServiceTrainingHandled: formattedFacultyData?.inServiceTrainingHandled || "",
    publications: formattedFacultyData?.publications || [],
    educationDetails: formattedFacultyData?.educationDetails || [],
    coursesHandled: formattedFacultyData?.coursesHandled || [],
    toursAttended: formattedFacultyData?.toursAttended || [],
    examiner: formattedFacultyData?.examiner || [],
    specialSessions: formattedFacultyData?.specialSessions || [],
    institution: formattedFacultyData?.institution || "",
    otherResponsibilities: formattedFacultyData?.otherResponsibilities || [],
    joined: formattedFacultyData?.joined || "",
    staffid: formattedFacultyData?.staffid || "",
  });

  // State for domain expertise
  const [domainExpertise, setDomainExpertise] = useState(() => {
    if (formattedFacultyData?.majorDomains?.length > 0) {
      return formattedFacultyData.majorDomains.map((major) => ({
        major,
        minors: formattedFacultyData.minorDomains?.filter((minor) =>
          domainOptions[major]?.includes(minor)
        ) || [],
      }));
    }
    return [{ major: "", minors: [] }];
  });

  // Handlers for domain expertise
  const handleMajorDomainChange = (index, value) => {
    const updatedExpertise = [...domainExpertise];
    updatedExpertise[index] = { major: value, minors: [] };
    setDomainExpertise(updatedExpertise);
    updateFacultyDomains(updatedExpertise);
  };

  const handleMinorDomainChange = (index, subDomain, checked) => {
    const updatedExpertise = [...domainExpertise];
    if (checked) {
      updatedExpertise[index].minors = [...updatedExpertise[index].minors, subDomain];
    } else {
      updatedExpertise[index].minors = updatedExpertise[index].minors.filter(
        (d) => d !== subDomain
      );
    }
    setDomainExpertise(updatedExpertise);
    updateFacultyDomains(updatedExpertise);
  };

  const updateFacultyDomains = (expertise) => {
    const majorDomains = expertise.map((e) => e.major).filter(Boolean);
    const minorDomains = expertise.flatMap((e) => e.minors);
    setFacultyDetails((prev) => ({
      ...prev,
      majorDomains,
      minorDomains,
    }));
  };

  const handleAddDomainExpertise = () => {
    setDomainExpertise([...domainExpertise, { major: "", minors: [] }]);
  };

  const handleRemoveDomainExpertise = (index) => {
    const updatedExpertise = domainExpertise.filter((_, i) => i !== index);
    setDomainExpertise(updatedExpertise);
    updateFacultyDomains(updatedExpertise);
  };

  // Handlers for adding nested items
  const handleAddPublication = () => {
    setFacultyDetails({
      ...facultyDetails,
      publications: [
        ...facultyDetails.publications,
        { typeOfPublication: "", title: "", dateOfPublication: "", additionalDetails: "" },
      ],
    });
  };

  const handleAddEducationDetail = () => {
    setFacultyDetails({
      ...facultyDetails,
      educationDetails: [
        ...facultyDetails.educationDetails,
        { degree: "", specialization: "", institutionName: "" },
      ],
    });
  };

  const handleAddCourse = () => {
    setFacultyDetails({
      ...facultyDetails,
      coursesHandled: [
        ...facultyDetails.coursesHandled,
        {
          courseType: "",
          batchno: "",
          title: "",
          feedbackRating: "",
          feedbackRatings: "",
          otherCourseType: "",
        },
      ],
    });
  };

  const handleAddTour = () => {
    setFacultyDetails({
      ...facultyDetails,
      toursAttended: [
        ...facultyDetails.toursAttended,
        {
          activityType: "",
          days: "",
          startDate: "",
          endDate: "",
          fieldExerciseName: "",
          batchNumber: "",
          location: "",
          remarks: "",
          region: "",
        },
      ],
    });
  };

  const handleAddExaminer = () => {
    setFacultyDetails({
      ...facultyDetails,
      examiner: [
        ...facultyDetails.examiner,
        { batchNo: "", year: "", batchType: "", date: "", paperCorrected: "" },
      ],
    });
  };

  const handleAddSpecialSession = () => {
    setFacultyDetails({
      ...facultyDetails,
      specialSessions: [
        ...facultyDetails.specialSessions,
        { institutionname: "", topic: "", date: "", feedbackRating: "", feedbackRating1: "" },
      ],
    });
  };

  const handleAddResponsibility = () => {
    setFacultyDetails({
      ...facultyDetails,
      otherResponsibilities: [...facultyDetails.otherResponsibilities, { responsibility: "" }],
    });
  };

  // Handlers for removing nested items
  const handleRemovePublication = (index) => {
    setFacultyDetails({
      ...facultyDetails,
      publications: facultyDetails.publications.filter((_, i) => i !== index),
    });
  };

  const handleRemoveEducationDetail = (index) => {
    setFacultyDetails({
      ...facultyDetails,
      educationDetails: facultyDetails.educationDetails.filter((_, i) => i !== index),
    });
  };

  const handleRemoveCourse = (index) => {
    setFacultyDetails({
      ...facultyDetails,
      coursesHandled: facultyDetails.coursesHandled.filter((_, i) => i !== index),
    });
  };

  const handleRemoveTour = (index) => {
    setFacultyDetails({
      ...facultyDetails,
      toursAttended: facultyDetails.toursAttended.filter((_, i) => i !== index),
    });
  };

  const handleRemoveExaminer = (index) => {
    setFacultyDetails({
      ...facultyDetails,
      examiner: facultyDetails.examiner.filter((_, i) => i !== index),
    });
  };

  const handleRemoveSpecialSession = (index) => {
    setFacultyDetails({
      ...facultyDetails,
      specialSessions: facultyDetails.specialSessions.filter((_, i) => i !== index),
    });
  };

  const handleRemoveResponsibility = (index) => {
    setFacultyDetails({
      ...facultyDetails,
      otherResponsibilities: facultyDetails.otherResponsibilities.filter((_, i) => i !== index),
    });
  };

  // Handlers for input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFacultyDetails({ ...facultyDetails, photograph: file });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyDetails({ ...facultyDetails, [name]: value });
  };

  const handleArrayInputChange = (e, field) => {
    const { value } = e.target;
    const flatArray = value.split(",").map((item) => item.trim()).filter((item) => item);
    setFacultyDetails({ ...facultyDetails, [field]: flatArray });
  };

  const handleNestedInputChange = (e, field, index) => {
    const { name, value } = e.target;
    const updatedField = facultyDetails[field].map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    );
    setFacultyDetails({ ...facultyDetails, [field]: updatedField });
  };

  const handleFacultyTypeChange = (e) => {
    setFacultyType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facultyType) {
      alert("Please select a faculty type.");
      return;
    }
    const updatedFacultyDetails = { ...facultyDetails, facultyType, _id };
    console.log("Submitting:", updatedFacultyDetails);

    try {
      const formData = new FormData();

      // Handle scalar fields and file
      Object.entries(updatedFacultyDetails).forEach(([key, value]) => {
        if (key === "photograph" && value instanceof File) {
          formData.append(key, value);
        } else if (!Array.isArray(value)) {
          formData.append(key, value || "");
        }
      });

      // Handle array fields
      const arrayFields = [
        "modulesHandled",
        "majorDomains",
        "minorDomains",
        "publications",
        "educationDetails",
        "coursesHandled",
        "toursAttended",
        "examiner",
        "specialSessions",
        "otherResponsibilities",
      ];
      arrayFields.forEach((field) => {
        if (updatedFacultyDetails[field].length > 0) {
          if (["modulesHandled", "majorDomains", "minorDomains"].includes(field)) {
            updatedFacultyDetails[field].forEach((item, index) => {
              formData.append(`${field}[${index}]`, item);
            });
          } else {
            updatedFacultyDetails[field].forEach((item, index) => {
              Object.entries(item).forEach(([subKey, subValue]) => {
                formData.append(`${field}[${index}][${subKey}]`, subValue || "");
              });
            });
          }
        }
      });

      const response = await axios.post(`http://${ip}:${port}/api/faculty/save`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        alert("Faculty data updated successfully!");
      } else {
        alert("Failed to update faculty data.");
      }
    } catch (error) {
      console.error("Error updating faculty data:", error);
      alert("An error occurred while updating the data.");
    }
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="style.css" />
      <title>CASFOS</title>
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">DATA ENTRY STAFF</span>
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/dataentrydashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/assetentry?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Entry</span>
            </a>
          </li>
          <li>
            <a href={`/rejectedassets?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Rejected Assets</span>
            </a>
          </li>
          <li>
            <a href={`/facultyentry?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty Entry</span>
            </a>
          </li>
          <li className="active">
            <a href={`/facultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty Updation</span>
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
                <div className="title">
                  <i className="uil uil-tachometer-fast-alt" />
                  <span className="text">Faculty Management</span>
                </div>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="facultyType">Faculty Type:</label>
                    <h2>{facultyType} Faculty</h2>
                  </div>

                  {(facultyType === "internal" ||
                    facultyType === "external" ||
                    facultyType === "contract") && (
                    <div>
                      <label>Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={facultyDetails.name}
                        onChange={handleInputChange}
                        required
                      />
                      <label>Cadre:</label>
                      <input
                        type="text"
                        name="cadre"
                        value={facultyDetails.cadre}
                        onChange={handleInputChange}
                      />
                      <label>Year of Allotment:</label>
                      <input
                        type="text"
                        name="yearOfAllotment"
                        value={facultyDetails.yearOfAllotment}
                        onChange={handleInputChange}
                      />
                      <label>RR/SFS Date:</label>
                      <input
                        type="date"
                        name="rrSfsDate"
                        value={facultyDetails.rrSfsDate}
                        onChange={handleInputChange}
                      />
                      <label>Date of Joining:</label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={facultyDetails.dateOfJoining}
                        onChange={handleInputChange}
                      />
                      <label>Date of Relieve:</label>
                      <input
                        type="date"
                        name="dateOfRelieve"
                        value={facultyDetails.dateOfRelieve}
                        onChange={handleInputChange}
                      />
                      <label>Date of Birth:</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={facultyDetails.dateOfBirth}
                        onChange={handleInputChange}
                      />
                      <label>Mobile Number:</label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={facultyDetails.mobileNumber}
                        onChange={handleInputChange}
                      />
                      <label>Communication Address:</label>
                      <input
                        type="text"
                        name="communicationAddress"
                        value={facultyDetails.communicationAddress}
                        onChange={handleInputChange}
                      />
                      <label>Permanent Address:</label>
                      <input
                        type="text"
                        name="permanentAddress"
                        value={facultyDetails.permanentAddress}
                        onChange={handleInputChange}
                      />
                      <label>Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={facultyDetails.email}
                        onChange={handleInputChange}
                        required
                      />
                      <label>Photograph:</label>
                      <input
                        type="file"
                        name="photograph"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label>Present Place of Working:</label>
                      <input
                        type="text"
                        name="presentPlaceOfWorking"
                        value={facultyDetails.presentPlaceOfWorking}
                        onChange={handleInputChange}
                      />
                      <label>Status:</label>
                      <select
                        name="status"
                        value={facultyDetails.status}
                        onChange={handleInputChange}
                      >
                        <option value="serving">Serving</option>
                        <option value="retired">Retired</option>
                      </select>
                      <label>Modules Handled (comma-separated):</label>
                      <input
                        type="text"
                        name="modulesHandled"
                        value={facultyDetails.modulesHandled.join(", ")}
                        onChange={(e) => handleArrayInputChange(e, "modulesHandled")}
                      />

                      {/* Domain Expertise */}
                      <h3>Domain Expertise</h3>
                      {domainExpertise.map((expertise, index) => (
                        <div
                          key={index}
                          className="domain-expertise-entry"
                          style={{ marginBottom: "20px" }}
                        >
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
                                    onChange={(e) =>
                                      handleMinorDomainChange(index, subDomain, e.target.checked)
                                    }
                                  />
                                  <label htmlFor={`minor-${index}-${subDomain}`}>
                                    {subDomain}
                                  </label>
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
                      <button
                        type="button"
                        onClick={handleAddDomainExpertise}
                        style={{ marginTop: "10px" }}
                      >
                        <i className="bx bx-plus" /> Add Domain Expertise
                      </button>

                      <label>Areas of Expertise:</label>
                      <input
                        type="text"
                        name="areasOfExpertise"
                        value={facultyDetails.areasOfExpertise}
                        onChange={handleInputChange}
                      />
                      <label>Awards Received:</label>
                      <input
                        type="text"
                        name="awardsReceived"
                        value={facultyDetails.awardsReceived}
                        onChange={handleInputChange}
                      />
                      <label>In-service Training Handled:</label>
                      <input
                        type="text"
                        name="inServiceTrainingHandled"
                        value={facultyDetails.inServiceTrainingHandled}
                        onChange={handleInputChange}
                      />
                      <label>Institution:</label>
                      <input
                        type="text"
                        name="institution"
                        value={facultyDetails.institution}
                        onChange={handleInputChange}
                        required={facultyType === "external"}
                      />
                      <label>Staff ID:</label>
                      <input
                        type="text"
                        name="staffid"
                        value={facultyDetails.staffid}
                        onChange={handleInputChange}
                        disabled={isUpdate}
                      />
                      <label>Joined Date:</label>
                      <input
                        type="date"
                        name="joined"
                        value={facultyDetails.joined}
                        onChange={handleInputChange}
                      />

                      {/* Publications */}
                      <h3>Publications</h3>
                      <button type="button" onClick={handleAddPublication}>
                        Add Publication
                      </button>
                      {facultyDetails.publications.map((pub, index) => (
                        <div key={index}>
                          <h4>Publication {index + 1}</h4>
                          <select
                            name="typeOfPublication"
                            value={pub.typeOfPublication}
                            onChange={(e) => handleNestedInputChange(e, "publications", index)}
                          >
                            <option value="">Select Type</option>
                            <option value="Books Published">Books Published</option>
                            <option value="Articles Published">Articles Published</option>
                            <option value="Manuals">Manuals</option>
                            <option value="Others">Others</option>
                          </select>
                          <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={pub.title}
                            onChange={(e) => handleNestedInputChange(e, "publications", index)}
                          />
                          <input
                            type="date"
                            name="dateOfPublication"
                            value={pub.dateOfPublication}
                            onChange={(e) => handleNestedInputChange(e, "publications", index)}
                          />
                          <input
                            type="text"
                            name="additionalDetails"
                            placeholder="Additional Details"
                            value={pub.additionalDetails}
                            onChange={(e) => handleNestedInputChange(e, "publications", index)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePublication(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Education Details */}
                      <h3>Education Details</h3>
                      <button type="button" onClick={handleAddEducationDetail}>
                        Add Education
                      </button>
                      {facultyDetails.educationDetails.map((edu, index) => (
                        <div key={index}>
                          <h4>Education {index + 1}</h4>
                          <input
                            type="text"
                            name="degree"
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => handleNestedInputChange(e, "educationDetails", index)}
                          />
                          <input
                            type="text"
                            name="specialization"
                            placeholder="Specialization"
                            value={edu.specialization}
                            onChange={(e) => handleNestedInputChange(e, "educationDetails", index)}
                          />
                          <input
                            type="text"
                            name="institutionName"
                            placeholder="Institution Name"
                            value={edu.institutionName}
                            onChange={(e) => handleNestedInputChange(e, "educationDetails", index)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEducationDetail(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Courses Handled */}
                      <h3>Courses Handled</h3>
                      <button type="button" onClick={handleAddCourse}>
                        Add Course
                      </button>
                      {facultyDetails.coursesHandled.map((course, index) => (
                        <div key={index}>
                          <h4>Course {index + 1}</h4>
                          <select
                            name="courseType"
                            value={course.courseType}
                            onChange={(e) => handleNestedInputChange(e, "coursesHandled", index)}
                          >
                            <option value="">Select Type</option>
                            <option value="InductionTraining">Induction Training</option>
                            <option value="InserviceTraining">In-service Training</option>
                            <option value="OtherStakeholder">Other Stakeholder</option>
                            <option value="SpecialTraining">Special Training</option>
                            <option value="SpecialLecture">Special Lecture</option>
                            <option value="Tours">Tours</option>
                            <option value="Others">Others</option>
                          </select>
                          <input
                            type="number"
                            name="batchno"
                            placeholder="Batch Number"
                            value={course.batchno}
                            onChange={(e) => handleNestedInputChange(e, "coursesHandled", index)}
                          />
                          <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={course.title}
                            onChange={(e) => handleNestedInputChange(e, "coursesHandled", index)}
                          />
                          <input
                            type="number"
                            name="feedbackRating"
                            placeholder="Feedback Rating (1-10)"
                            value={course.feedbackRating}
                            min="1"
                            max="10"
                            onChange={(e) => handleNestedInputChange(e, "coursesHandled", index)}
                          />
                          <select
                            name="feedbackRatings"
                            value={course.feedbackRatings}
                            onChange={(e) => handleNestedInputChange(e, "coursesHandled", index)}
                          >
                            <option value="">Select Rating</option>
                            <option value="poor">Poor</option>
                            <option value="good">Good</option>
                            <option value="verygood">Very Good</option>
                            <option value="excellent">Excellent</option>
                          </select>
                          <input
                            type="text"
                            name="otherCourseType"
                            placeholder="Other Course Type"
                            value={course.otherCourseType}
                            onChange={(e) => handleNestedInputChange(e, "coursesHandled", index)}
                          />
                          <button type="button" onClick={() => handleRemoveCourse(index)}>
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Tours Attended */}
                      <h3>Tours Attended</h3>
                      <button type="button" onClick={handleAddTour}>
                        Add Tour
                      </button>
                      {facultyDetails.toursAttended.map((tour, index) => (
                        <div key={index}>
                          <h4>Tour {index + 1}</h4>
                          <select
                            name="activityType"
                            value={tour.activityType}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          >
                            <option value="">Select Type</option>
                            <option value="FieldExercise">Field Exercise</option>
                            <option value="StudyTour">Study Tour</option>
                          </select>
                          <input
                            type="number"
                            name="days"
                            placeholder="Days"
                            value={tour.days}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <input
                            type="date"
                            name="startDate"
                            value={tour.startDate}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <input
                            type="date"
                            name="endDate"
                            value={tour.endDate}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <input
                            type="text"
                            name="fieldExerciseName"
                            placeholder="Field Exercise Name"
                            value={tour.fieldExerciseName}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <input
                            type="number"
                            name="batchNumber"
                            placeholder="Batch Number"
                            value={tour.batchNumber}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={tour.location}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <input
                            type="text"
                            name="remarks"
                            placeholder="Remarks"
                            value={tour.remarks}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <input
                            type="text"
                            name="region"
                            placeholder="Region"
                            value={tour.region}
                            onChange={(e) => handleNestedInputChange(e, "toursAttended", index)}
                          />
                          <button type="button" onClick={() => handleRemoveTour(index)}>
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Examiner */}
                      <h3>Examiner</h3>
                      <button type="button" onClick={handleAddExaminer}>
                        Add Examiner
                      </button>
                      {facultyDetails.examiner.map((exam, index) => (
                        <div key={index}>
                          <h4>Examiner {index + 1}</h4>
                          <input
                            type="number"
                            name="batchNo"
                            placeholder="Batch Number"
                            value={exam.batchNo}
                            onChange={(e) => handleNestedInputChange(e, "examiner", index)}
                          />
                          <input
                            type="number"
                            name="year"
                            placeholder="Year"
                            value={exam.year}
                            onChange={(e) => handleNestedInputChange(e, "examiner", index)}
                          />
                          <input
                            type="text"
                            name="batchType"
                            placeholder="Batch Type"
                            value={exam.batchType}
                            onChange={(e) => handleNestedInputChange(e, "examiner", index)}
                          />
                          <input
                            type="date"
                            name="date"
                            value={exam.date}
                            onChange={(e) => handleNestedInputChange(e, "examiner", index)}
                          />
                          <input
                            type="text"
                            name="paperCorrected"
                            placeholder="Paper Corrected"
                            value={exam.paperCorrected}
                            onChange={(e) => handleNestedInputChange(e, "examiner", index)}
                          />
                          <button type="button" onClick={() => handleRemoveExaminer(index)}>
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Special Sessions */}
                      <h3>Special Sessions</h3>
                      <button type="button" onClick={handleAddSpecialSession}>
                        Add Special Session
                      </button>
                      {facultyDetails.specialSessions.map((session, index) => (
                        <div key={index}>
                          <h4>Special Session {index + 1}</h4>
                          <input
                            type="text"
                            name="institutionname"
                            placeholder="Institution Name"
                            value={session.institutionname}
                            onChange={(e) => handleNestedInputChange(e, "specialSessions", index)}
                          />
                          <input
                            type="text"
                            name="topic"
                            placeholder="Topic"
                            value={session.topic}
                            onChange={(e) => handleNestedInputChange(e, "specialSessions", index)}
                          />
                          <input
                            type="date"
                            name="date"
                            value={session.date}
                            onChange={(e) => handleNestedInputChange(e, "specialSessions", index)}
                          />
                          <input
                            type="number"
                            name="feedbackRating"
                            placeholder="Feedback Rating"
                            value={session.feedbackRating}
                            onChange={(e) => handleNestedInputChange(e, "specialSessions", index)}
                          />
                          <input
                            type="text"
                            name="feedbackRating1"
                            placeholder="Feedback Rating Text"
                            value={session.feedbackRating1}
                            onChange={(e) => handleNestedInputChange(e, "specialSessions", index)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialSession(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Other Responsibilities */}
                      <h3>Other Responsibilities</h3>
                      <button type="button" onClick={handleAddResponsibility}>
                        Add Responsibility
                      </button>
                      {facultyDetails.otherResponsibilities.map((resp, index) => (
                        <div key={index}>
                          <h4>Responsibility {index + 1}</h4>
                          <input
                            type="text"
                            name="responsibility"
                            placeholder="Responsibility"
                            value={resp.responsibility}
                            onChange={(e) =>
                              handleNestedInputChange(e, "otherResponsibilities", index)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveResponsibility(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isUpdate && <button type="submit">Update Faculty</button>}
                </form>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

const styles = {
  usernameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#555",
  },
  userIcon: {
    fontSize: "30px",
    color: "#007BFF",
  },
  username: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  cardContainer: {
    display: "flex",
    gap: "15px",
  },
  card: {
    flex: "1",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    margin: "0 auto 10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  iconStyle: {
    fontSize: "24px",
    color: "#fff",
  },
  change: {
    color: "#666",
    fontSize: "12px",
  },
};

export default UpdateFacultyEntry;