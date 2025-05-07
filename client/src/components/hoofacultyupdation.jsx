import React, { useEffect, useState } from "react";
import "../styles/style.css"; // General styles
import axios from "axios"; // http client for API requests
import { useLocation, useNavigate } from "react-router-dom"; // For navigation and URL parameters
import "../styles/viewFaculty.css"; // Component-specific styles
import Swal from "sweetalert2"; // Added SweetAlert2 import

// FacultyUpdation component: Allows Head of Office to filter, view, update, and delete faculty records
const FacultyUpdation = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // State definitions for filters and faculty data
  const [facultyType, setFacultyType] = useState(""); // Faculty type filter
  const [name, setName] = useState(""); // Name filter
  const [email, setEmail] = useState(""); // Email filter
  const [yearOfAllotment, setYearOfAllotment] = useState(""); // Year of allotment filter
  const [status, setStatus] = useState(""); // Status filter
  const [modulesHandled, setModulesHandled] = useState(""); // Modules handled filter
  const [majorDomains, setMajorDomains] = useState([]); // Major domains filter
  const [minorDomains, setMinorDomains] = useState([]); // Minor domains filter
  const [areasOfExpertise, setAreasOfExpertise] = useState(""); // Areas of expertise filter
  const [institution, setInstitution] = useState(""); // Institution filter
  const [mobileNumber, setMobileNumber] = useState(""); // Mobile number filter
  const [tableData, setTableData] = useState([]); // Filtered faculty data for table
  const [totalFaculties, setTotalFaculties] = useState(0); // Total number of filtered faculties
  const [message, setMessage] = useState(""); // Message for no records found
  const [selectedFaculty, setSelectedFaculty] = useState(null); // Faculty selected for detailed view
  const [deleteStatus, setDeleteStatus] = useState({}); // Deletion status per faculty

  // Domain options for major and minor domains dropdowns
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

  // Navigation and username extraction
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  // Navigate to update page with faculty data
  const handleUpdateDetails = async (facultyId) => {
    try {
      const response = await axios.get(`http://${ip}:${port}/api/faculty/search/${facultyId}`);
      const facultyData = response.data.data;
      navigate(`/updatefacultyentryhoo?username=${encodeURIComponent(username)}`, {
        state: { facultyData, isUpdate: true },
      });
    } catch (error) {
      console.error("Error fetching faculty details:", error);
    }
  };

  // Initiate faculty deletion with SweetAlert2 confirmation
  const handleDeleteFaculty = (facultyId) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you want to delete this faculty record?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(facultyId);
      }
    });
  };

  // Perform faculty deletion with SweetAlert2 feedback
  const confirmDelete = async (facultyId) => {
    setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Deleting..." }));

    try {
      const response = await axios.delete(`http://${ip}:${port}/api/faculty/delete/${facultyId}`);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty deleted successfully!",
        });
        setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Deleted" }));
        setTableData((prevData) => prevData.filter((faculty) => faculty._id !== facultyId));
        setTotalFaculties((prev) => prev - 1);
        setTimeout(() => {
          setDeleteStatus((prev) => ({ ...prev, [facultyId]: "" }));
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Delete",
          text: response.data.message || "Failed to delete faculty. Please try again.",
        });
        setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Failed to Delete" }));
      }
    } catch (error) {
      console.error("Error deleting faculty:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.message === "Network Error"
          ? "Unable to connect to the server. Please check your network connection."
          : "An unexpected error occurred while deleting the faculty.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Failed to Delete" }));
    }
  };

  // Apply filters and fetch faculty data
  const handleApplyFilter = async () => {
    try {
      const response = await axios.post(`http://${ip}:${port}/api/faculty/filterFaculties`, {
        facultyType,
        name,
        email,
        yearOfAllotment,
        status,
        modulesHandled: modulesHandled ? [modulesHandled] : undefined,
        majorDomains: majorDomains.length > 0 ? majorDomains : undefined,
        minorDomains: minorDomains.length > 0 ? minorDomains : undefined,
        areasOfExpertise,
        institution,
        mobileNumber,
      });

      setTableData(response.data);
      setTotalFaculties(response.data.length);
      setMessage(response.data.length > 0 ? "" : "No matching records found.");
    } catch (error) {
      setTableData([]);
      setTotalFaculties(0);
      setMessage("No matching records.");
      console.error("Error fetching filtered faculty:", error);
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    handleApplyFilter();
  }, []);

  useEffect(() => {
    handleApplyFilter();
  }, [facultyType, name, email, yearOfAllotment, status, modulesHandled, majorDomains, minorDomains, areasOfExpertise, institution, mobileNumber]);

  // Render faculty details in popup
  const renderPopupContent = (data) => {
    const renderValue = (value, key) => {
      if (key === "photograph" && typeof value === "string") {
        const imageUrl = `http://${ip}:${port}/uploads/${value.split("\\").pop()}`;
        return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px", objectFit: "cover" }} />;
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
                  <strong>{subKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</strong>{" "}
                  {renderValue(val, subKey)}
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || "-";
    };

    return Object.entries(data)
    .filter(([key]) => key !== "_id" && key !== "conduct")
      .map(([key, value]) => (
        <tr key={key}>
          <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>
            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
          </td>
          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td>
        </tr>
      ));
  };

  // Clear all filters
  const handleClearFilter = () => {
    setFacultyType("");
    setName("");
    setEmail("");
    setYearOfAllotment("");
    setStatus("");
    setModulesHandled("");
    setMajorDomains([]);
    setMinorDomains([]);
    setAreasOfExpertise("");
    setInstitution("");
    setMobileNumber("");
    handleApplyFilter();
  };

  // Open faculty details popup
  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  // Close faculty details popup
  const closePopup = () => {
    setSelectedFaculty(null);
  };

  // Inline styles for filter section
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

  // Inline styles for view/update buttons
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
  };

  // Inline styles for delete buttons
  const deleteButtonStyles = {
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#ff4444",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
    },
    deleteButtonHover: {
      backgroundColor: "#cc0000",
    },
    deleteButtonDisabled: {
      backgroundColor: "#6c757d",
      cursor: "not-allowed",
    },
  };

  // Inline styles for popups
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
      maxWidth: "600px",
      maxHeight: "80vh",
      overflowY: "auto",
      position: "relative",
      animation: "slideIn 0.3s ease-out",
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
  };

  // General inline styles
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
    totalFaculties: {
      position: "absolute",
      top: "10px",
      right: "20px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333",
      backgroundColor: "#f1f1f1",
      padding: "5px 10px",
      borderRadius: "4px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    loadingIcon: { fontSize: "14px", color: "#007BFF" },
    successIcon: { fontSize: "14px", color: "#28a745" },
    errorIcon: { fontSize: "14px", color: "#dc3545" },
  };

  // Render the component
  return (
    <div className="faculty-view">
      {/* Meta tags and stylesheets */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <title>CASFOS</title>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      {/* Sidebar */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">HEAD OF OFFICE</span>
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">User Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hooassetapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Faculty Approval</span>
            </a>
          </li>
          <li className="active">
            <a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Faculty Updation</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}>
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

      {/* Main content */}
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
        <main style={{ position: "relative" }}>
          <div style={styles.totalFaculties}>Total No of Faculties: {totalFaculties}</div>
          <div className="dash-content">
            <div className="title">
              <span className="text">EXISTING FACULTY UPDATION</span>
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
                  <label style={filterStyles.label} htmlFor="areasOfExpertise">
                    Areas of Expertise:
                  </label>
                  <input
                    id="areasOfExpertise"
                    placeholder="Areas of Expertise"
                    value={areasOfExpertise}
                    onChange={(e) => setAreasOfExpertise(e.target.value)}
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

            {/* Display message if no records found */}
            {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}

            {/* Faculty table */}
            {tableData.length > 0 && (
              <table className="faculty-table" style={{ marginTop: "1rem", width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Photograph</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Faculty Type</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Mobile Number</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Year of Allotment</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>View</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Update</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row._id}>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.name || "-"}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        {row.photograph ? (
                          <img
                            src={`http://${ip}:${port}/uploads/${row.photograph.split("\\").pop()}`}
                            alt="Photograph"
                            style={{ width: "50px", height: "50px", borderRadius: "5px", objectFit: "cover" }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.facultyType || "-"}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.mobileNumber || "-"}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.email || "-"}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.yearOfAllotment || "-"}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        <button
                          style={viewButtonStyles.viewButton}
                          onClick={() => handleViewDetails(row)}
                          onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButtonHover.backgroundColor)}
                          onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)}
                        >
                          View
                        </button>
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        <button
                          style={viewButtonStyles.viewButton}
                          onClick={() => handleUpdateDetails(row._id)}
                          onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButtonHover.backgroundColor)}
                          onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)}
                        >
                          Update
                        </button>
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        <button
                          style={{
                            ...deleteButtonStyles.deleteButton,
                            ...(deleteStatus[row._id] === "Deleting..." ? deleteButtonStyles.deleteButtonDisabled : {}),
                          }}
                          onClick={() => handleDeleteFaculty(row._id)}
                          onMouseOver={(e) =>
                            deleteStatus[row._id] !== "Deleting..." &&
                            (e.target.style.backgroundColor = deleteButtonStyles.deleteButtonHover.backgroundColor)
                          }
                          onMouseOut={(e) =>
                            deleteStatus[row._id] !== "Deleting..." &&
                            (e.target.style.backgroundColor = deleteButtonStyles.deleteButton.backgroundColor)
                          }
                          disabled={deleteStatus[row._id] === "Deleting..."}
                        >
                          {deleteStatus[row._id] === "Deleting..." && (
                            <>
                              <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i>
                              Deleting...
                            </>
                          )}
                          {deleteStatus[row._id] === "Deleted" && (
                            <>
                              <i className="bx bx-check-circle" style={styles.successIcon}></i>
                              Deleted
                            </>
                          )}
                          {deleteStatus[row._id] === "Failed to Delete" && (
                            <>
                              <i className="bx bx-error-circle" style={styles.errorIcon}></i>
                              Failed
                            </>
                          )}
                          {!deleteStatus[row._id] && "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </section>

      {/* Faculty Details Popup */}
      {selectedFaculty && (
        <div style={popupStyles.popup}>
          <div style={popupStyles.popupContent}>
            <h3 style={popupStyles.popupHeader}>Faculty Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
    </div>
  );
};

export default FacultyUpdation;