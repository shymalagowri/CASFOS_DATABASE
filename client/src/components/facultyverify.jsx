import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // Added SweetAlert2 import

const FacultyVerify = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const [facultyType, setFacultyType] = useState("");
  const [name, setName] = useState("");
  const [yearOfAllotment, setYearOfAllotment] = useState("");
  const [email, setEmail] = useState("");
  const [domainKnowledge, setDomainKnowledge] = useState("");
  const [areaOfExpertise, setAreaOfExpertise] = useState("");
  const [institution, setInstitution] = useState("");
  const [status, setStatus] = useState("");
  const [modulesHandled, setModulesHandled] = useState("");
  const [majorDomains, setMajorDomains] = useState([]);
  const [minorDomains, setMinorDomains] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [tableData, setTableData] = useState([]);
  const [verifyingStatus, setVerifyingStatus] = useState({});
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [rejectingFacultyId, setRejectingFacultyId] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

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
      "Public administration, PublicGrievance and Public Finance",
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

  useEffect(() => {
    const fetchUnverifiedFaculties = async () => {
      try {
        const response = await axios.get(`http://${ip}:${port}/api/faculty/getAllFaculties`);
        const unverifiedFaculties = response.data.filter((faculty) => !faculty.verified);

        const filteredData = unverifiedFaculties.filter((faculty) => {
          return (
            (!facultyType || faculty.facultyType.toLowerCase().includes(facultyType.toLowerCase())) &&
            (!name || faculty.name.toLowerCase().includes(name.toLowerCase())) &&
            (!yearOfAllotment || faculty.yearOfAllotment === yearOfAllotment) &&
            (!email || faculty.email?.toLowerCase().includes(email.toLowerCase())) &&
            (!status || faculty.status === status) &&
            (!modulesHandled || faculty.modulesHandled?.some((m) => m.toLowerCase().includes(modulesHandled.toLowerCase()))) &&
            (majorDomains.length === 0 || majorDomains.every((md) => faculty.majorDomains?.includes(md))) &&
            (minorDomains.length === 0 || minorDomains.every((md) => faculty.minorDomains?.includes(md))) &&
            (!areaOfExpertise || faculty.areasOfExpertise?.toLowerCase().includes(areaOfExpertise.toLowerCase())) &&
            (!institution || faculty.institution?.toLowerCase().includes(institution.toLowerCase())) &&
            (!mobileNumber || faculty.mobileNumber?.includes(mobileNumber)) &&
            (!domainKnowledge || faculty.domainKnowledge?.toLowerCase().includes(domainKnowledge.toLowerCase()))
          );
        });

        if (filteredData.length > 0) {
          setTableData(filteredData);
        } else {
          setTableData([]);
        }
      } catch (error) {
        setTableData([]);
        console.error("Error fetching unverified faculties:", error);
      }
    };

    fetchUnverifiedFaculties();
  }, [
    facultyType,
    name,
    email,
    yearOfAllotment,
    status,
    modulesHandled,
    majorDomains,
    minorDomains,
    areaOfExpertise,
    institution,
    mobileNumber,
    domainKnowledge,
  ]);

  const handleVerifyFaculty = async (facultyId) => {
    console.log("Verifying faculty with ID:", facultyId);
    setVerifyingStatus((prev) => ({
      ...prev,
      [facultyId]: "Verifying...",
    }));

    try {
      const response = await axios.put(`http://${ip}:${port}/api/faculty/verifyFaculty/${facultyId}`);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty verified successfully!",
        });
        setVerifyingStatus((prev) => ({
          ...prev,
          [facultyId]: "Verified",
        }));
        setTableData((prevData) => prevData.filter((faculty) => faculty._id !== facultyId));
        setTimeout(() => {
          setVerifyingStatus((prev) => ({
            ...prev,
            [facultyId]: "",
          }));
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Verify",
          text: response.data.message || "Failed to verify faculty. Please try again.",
        });
        setVerifyingStatus((prev) => ({
          ...prev,
          [facultyId]: "Failed to Verify",
        }));
      }
    } catch (error) {
      console.error("Error verifying faculty:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.message === "Network Error" ? "Unable to connect to the server. Please check your network connection." : "An unexpected error occurred while verifying the faculty.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      setVerifyingStatus((prev) => ({
        ...prev,
        [facultyId]: "Failed to Verify",
      }));
    }
  };

  const handleRejectFaculty = (facultyId) => {
    setRejectingFacultyId(facultyId);
    setRejectionRemarks("");
  };

  const submitRejection = async () => {
    if (!rejectionRemarks.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please provide rejection remarks.",
      });
      return;
    }

    try {
      const response = await axios.post(`http://${ip}:${port}/api/faculty/rejectFacultyVerification/${rejectingFacultyId}`, {
        rejectionRemarks,
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty rejected successfully!",
        });
        setTableData((prevData) => prevData.filter((faculty) => faculty._id !== rejectingFacultyId));
        setVerifyingStatus((prev) => ({
          ...prev,
          [rejectingFacultyId]: "Rejected",
        }));
        setTimeout(() => {
          setVerifyingStatus((prev) => ({
            ...prev,
            [rejectingFacultyId]: "",
          }));
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Reject",
          text: response.data.message || "Failed to reject faculty. Please try again.",
        });
        setVerifyingStatus((prev) => ({
          ...prev,
          [rejectingFacultyId]: "Failed to Reject",
        }));
      }
    } catch (error) {
      console.error("Error rejecting faculty:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.message === "Network Error" ? "Unable to connect to the server. Please check your network connection." : "An unexpected error occurred while rejecting the faculty.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      setVerifyingStatus((prev) => ({
        ...prev,
        [rejectingFacultyId]: "Failed to Reject",
      }));
    } finally {
      setRejectingFacultyId(null);
    }
  };

  const renderPopupContent = (data) => {
    const renderValue = (value, key) => {
      if (key === "photograph" && typeof value === "string") {
        const imageUrl = `http://${ip}:${port}/uploads/${value.split("\\").pop()}`;
        return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }} />;
      }
      if (Array.isArray(value)) {
        return (
          <ul>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item, key)}</li>
            ))}
          </ul>
        );
      }
      if (typeof value === "object" && value !== null) {
        return (
          <ul>
            {Object.entries(value)
              .filter(([subKey]) => subKey !== "_id")
              .map(([subKey, val]) => (
                <li key={subKey}>
                  <strong>{subKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</strong> {renderValue(val, subKey)}
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || "-";
    };

    const allFields = Object.entries(data)
      .filter(([key]) => key.toLowerCase() !== "_id" && key.toLowerCase() !== "conduct")
      .map(([key, value]) => (
        <tr key={key}>
          <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</td>
          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td>
        </tr>
      ));

    return allFields.length > 0 ? allFields : <tr><td colSpan="2">No additional details available</td></tr>;
  };

  const handleClearFilter = () => {
    setFacultyType("");
    setName("");
    setYearOfAllotment("");
    setEmail("");
    setDomainKnowledge("");
    setAreaOfExpertise("");
    setInstitution("");
    setStatus("");
    setModulesHandled("");
    setMajorDomains([]);
    setMinorDomains([]);
    setMobileNumber("");
    setTableData([]);
    setVerifyingStatus({});
  };

  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  const closePopup = () => {
    setSelectedFaculty(null);
  };

  const popupStyles = {
    popup: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    popupContent: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      width: "90%",
      maxWidth: "800px",
      maxHeight: "80vh",
      overflowY: "auto",
      position: "relative",
    },
    popupHeader: {
      marginBottom: "15px",
      color: "#333",
    },
    closeButton: {
      marginTop: "15px",
      padding: "8px 16px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
  };

  const filterStyles = {
    filterContainer: {
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      marginBottom: "20px",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    filterItem: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      marginBottom: "5px",
      fontWeight: "500",
      color: "#333",
    },
    input: {
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    inputFocus: {
      borderColor: "#007BFF",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
    },
    clearButton: {
      padding: "8px 16px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    clearButtonHover: {
      backgroundColor: "#5a6268",
    },
  };

  const viewButtonStyles = {
    viewButton: {
      padding: "6px 12px",
      backgroundColor: "#007BFF",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    viewButtonHover: {
      backgroundColor: "#0056b3",
    },
    verifyButton: {
      padding: "6px 12px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      marginLeft: "10px",
    },
    verifyButtonHover: {
      backgroundColor: "#218838",
    },
  };

  const rejectButtonStyles = {
    rejectButton: {
      padding: "6px 12px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      marginLeft: "10px",
    },
    rejectButtonHover: {
      backgroundColor: "#c82333",
    },
  };

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
    verifyingStatus: {
      marginTop: "5px",
      fontSize: "12px",
      color: "#555",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    loadingIcon: { fontSize: "14px", color: "#007BFF" },
    successIcon: { fontSize: "14px", color: "#28a745" },
    errorIcon: { fontSize: "14px", color: "#dc3545" },
  };

  return (
    <>
      <div className="asset-view">
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <title>CASFOS</title>

        <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">FACULTY VERIFIER</span>
          </a>
          <ul className="side-menu top">
            <li>
              <a href={`/facultyverifierdashboard?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li className="active">
              <a href={`/facultyverify?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty Verify</span>
              </a>
            </li>
            <li>
              <a href={`/facultyverifierfacultyview?username=${encodeURIComponent(username)}`}>
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
            <form action="#">
              <div className="form-input"></div>
            </form>
            <div style={styles.usernameContainer}>
              <i className="bx bxs-user-circle" style={styles.userIcon}></i>
              <span style={styles.username}>{username}</span>
            </div>
          </nav>

          <main>
            <div className="dash-content">
              <div className="title">
                <span className="text">Unverified Faculty View with Filters</span>
              </div>
              <div style={filterStyles.filterContainer}>
                <div style={filterStyles.filterGrid}>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="facultyType">
                      Faculty Type:
                    </label>
                    <select
                      id="facultyType"
                      value={facultyType}
                      onChange={(e) => setFacultyType(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">Select</option>
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="name">
                      Name:
                    </label>
                    <input
                      id="name"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="yearOfAllotment">
                      Year of Allotment:
                    </label>
                    <input
                      id="yearOfAllotment"
                      placeholder="YYYY"
                      value={yearOfAllotment}
                      onChange={(e) => setYearOfAllotment(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="email">
                      Email:
                    </label>
                    <input
                      id="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="status">
                      Status:
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">Select</option>
                      <option value="serving">Serving</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="modulesHandled">
                      Modules Handled:
                    </label>
                    <input
                      id="modulesHandled"
                      placeholder="Module Name"
                      value={modulesHandled}
                      onChange={(e) => setModulesHandled(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="majorDomains">
                      Major Domains:
                    </label>
                    <select
                      id="majorDomains"
                      value={majorDomains[0] || ""}
                      onChange={(e) => setMajorDomains([e.target.value])}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">Select Major Domain</option>
                      {Object.keys(domainOptions).map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="minorDomains">
                      Minor Domains:
                    </label>
                    <select
                      id="minorDomains"
                      value={minorDomains[0] || ""}
                      onChange={(e) => setMinorDomains([e.target.value])}
                      disabled={!majorDomains[0]}
                      style={{
                        ...filterStyles.input,
                        opacity: !majorDomains[0] ? 0.7 : 1,
                        cursor: !majorDomains[0] ? "not-allowed" : "pointer",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">Select Minor Domain</option>
                      {majorDomains[0] &&
                        domainOptions[majorDomains[0]]?.map((subDomain) => (
                          <option key={subDomain} value={subDomain}>
                            {subDomain}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="areaOfExpertise">
                      Areas of Expertise:
                    </label>
                    <input
                      id="areaOfExpertise"
                      placeholder="Areas of Expertise"
                      value={areaOfExpertise}
                      onChange={(e) => setAreaOfExpertise(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="institution">
                      Institution:
                    </label>
                    <input
                      id="institution"
                      placeholder="Institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="mobileNumber">
                      Mobile Number:
                    </label>
                    <input
                      id="mobileNumber"
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="domainKnowledge">
                      Domain Knowledge:
                    </label>
                    <input
                      id="domainKnowledge"
                      placeholder="Domain Knowledge"
                      value={domainKnowledge}
                      onChange={(e) => setDomainKnowledge(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                </div>
                <div style={filterStyles.buttonContainer}>
                  <button
                    style={filterStyles.clearButton}
                    onClick={handleClearFilter}
                    onMouseOver={(e) => (e.target.style.backgroundColor = filterStyles.clearButtonHover.backgroundColor)}
                    onMouseOut={(e) => (e.target.style.backgroundColor = filterStyles.clearButton.backgroundColor)}
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {tableData.length > 0 ? (
                <table className="faculty-table" style={{ marginTop: "1rem", width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Faculty Type</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Mobile Number</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Year of Allotment</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Major Domains</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.name || "-"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.facultyType || "-"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.status || "-"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.mobileNumber || "-"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.email || "-"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.yearOfAllotment || "-"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.majorDomains?.join(", ") || "-"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                          <button
                            style={viewButtonStyles.viewButton}
                            onClick={() => handleViewDetails(row)}
                            onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButtonHover.backgroundColor)}
                            onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)}
                          >
                            View
                          </button>
                          <button
                            style={viewButtonStyles.verifyButton}
                            onClick={() => handleVerifyFaculty(row._id)}
                            onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.verifyButtonHover.backgroundColor)}
                            onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.verifyButton.backgroundColor)}
                            disabled={verifyingStatus[row._id] === "Verifying..."}
                          >
                            Verify
                          </button>
                          <button
                            style={rejectButtonStyles.rejectButton}
                            onClick={() => handleRejectFaculty(row._id)}
                            onMouseOver={(e) => (e.target.style.backgroundColor = rejectButtonStyles.rejectButtonHover.backgroundColor)}
                            onMouseOut={(e) => (e.target.style.backgroundColor = rejectButtonStyles.rejectButton.backgroundColor)}
                            disabled={verifyingStatus[row._id] === "Verifying..."}
                          >
                            Reject
                          </button>
                          {verifyingStatus[row._id] && (
                            <div style={styles.verifyingStatus}>
                              {verifyingStatus[row._id] === "Verifying..." && (
                                <>
                                  <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i>
                                  <span>Verifying...</span>
                                </>
                              )}
                              {verifyingStatus[row._id] === "Verified" && (
                                <>
                                  <i className="bx bx-check-circle" style={styles.successIcon}></i>
                                  <span>Verified</span>
                                </>
                              )}
                              {verifyingStatus[row._id] === "Rejected" && (
                                <>
                                  <i className="bx bx-x-circle" style={styles.errorIcon}></i>
                                  <span>Rejected</span>
                                </>
                              )}
                              {verifyingStatus[row._id] === "Failed to Verify" && (
                                <>
                                  <i className="bx bx-error-circle" style={styles.errorIcon}></i>
                                  <span>Failed to Verify</span>
                                </>
                              )}
                              {verifyingStatus[row._id] === "Failed to Reject" && (
                                <>
                                  <i className="bx bx-error-circle" style={styles.errorIcon}></i>
                                  <span>Failed to Reject</span>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "red", marginTop: "1rem" }}>No unverified faculty records found matching the criteria.</p>
              )}
            </div>
          </main>
        </section>

        {selectedFaculty && (
          <div style={popupStyles.popup}>
            <div style={popupStyles.popupContent}>
              <h3 style={popupStyles.popupHeader}>Faculty Details</h3>
              <table style={popupStyles.table}>
                <tbody>{renderPopupContent(selectedFaculty)}</tbody>
              </table>
              <button
                style={popupStyles.closeButton}
                onClick={closePopup}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {rejectingFacultyId && (
          <div style={popupStyles.popup}>
            <div style={popupStyles.popupContent}>
              <h3 style={popupStyles.popupHeader}>Rejection Remarks</h3>
              <textarea
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="Enter rejection remarks here..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginBottom: "15px",
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  style={{
                    ...popupStyles.closeButton,
                    backgroundColor: "#6c757d",
                  }}
                  onClick={() => setRejectingFacultyId(null)}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...popupStyles.closeButton,
                    backgroundColor: "#28a745",
                  }}
                  onClick={submitRejection}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#218738")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FacultyVerify;