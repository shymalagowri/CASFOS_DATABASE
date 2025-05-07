import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const FacultyView = () => {
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
  const [message, setMessage] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  
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

  useEffect(() => {
    const handleApplyFilter = async () => {
      try {
        const response = await axios.post(`http://${ip}:${port}/api/faculty/filterFaculties`, {
          facultyType: facultyType || undefined,
          name: name || undefined,
          yearOfAllotment: yearOfAllotment || undefined,
          email: email || undefined,
          domainKnowledge: domainKnowledge || undefined,
          areaOfExpertise: areaOfExpertise || undefined,
          institution: institution || undefined,
          status: status || undefined,
          modulesHandled: modulesHandled ? [modulesHandled] : undefined,
          majorDomains: majorDomains.length > 0 ? majorDomains : undefined,
          minorDomains: minorDomains.length > 0 ? minorDomains : undefined,
          mobileNumber: mobileNumber || undefined,
        });

        if (response.data.length > 0) {
          setTableData(response.data);
          setMessage("");
        } else {
          setTableData([]);
          setMessage("No matching records found.");
        }
      } catch (error) {
        setTableData([]);
        setMessage("No matching records.");
        console.error("Error fetching filtered data:", error);
      }
    };
    handleApplyFilter();
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
              .filter(([key]) => key !== "_id")
              .map(([key, val]) => (
                <li key={key}>
                  <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</strong> {renderValue(val, key)}
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
            {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:
          </td>
          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td>
        </tr>
      ));
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
    setMessage("");
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
      maxWidth: "600px",
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
    rowContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      margin: "20px 0",
      justifyContent: "center",
    },
    userContainer: {
      flex: 1,
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      minWidth: "300px",
    },
    amcContainer: {
      flex: 1,
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      minWidth: "300px",
      maxHeight: "300px",
      overflowY: "auto",
    },
    cardContainer: {
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    },
    card: {
      flex: "1",
      padding: "15px",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      minWidth: "150px",
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
    container: {
      maxWidth: "50%",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
    },
    container2: {
      maxWidth: "800px",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
    },
    header: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "10px",
      textAlign: "center",
    },
    subtitle: {
      color: "#666",
      fontSize: "14px",
      marginBottom: "20px",
    },
    change: {
      color: "#666",
      fontSize: "12px",
    },
    amcTable: {
      width: "100%",
      borderCollapse: "collapse",
    },
    amcTableHeader: {
      position: "sticky",
      top: 0,
      backgroundColor: "#fff",
      zIndex: 2,
    },
    amcTableCell: {
      padding: "10px",
      border: "1px solid #ddd",
      textAlign: "left",
    },
  };

  const moduleStyle2 = {
    width: "60%",
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const moduleStyle = {
    width: "45%",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const moduleStyle3 = {
    width: "50%",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const titleStyle = {
    marginBottom: "15px",
    fontSize: "1.2em",
    color: "#28a745",
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
            <span className="text">VIEWER</span>
          </a>
          <ul className="side-menu top">
            <li >
            <a href={`/viewerdashboard?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li >
            <a href={`/viewerassetview?username=${encodeURIComponent(username)}`}>
            <i className="bx bxs-shopping-bag-alt" />
                <span className="text">Asset View</span>
              </a>
            </li>
            <li className="active">
            <a href={`/viewerfacultyview?username=${encodeURIComponent(username)}`}>
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
                <span className="text">Faculty View with Filters</span>
              </div>
              <div style={filterStyles.filterContainer}>
                <div style={filterStyles.filterGrid}>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="facultyType">Faculty Type:</label>
                    <select
                      id="facultyType"
                      value={facultyType}
                      onChange={(e) => setFacultyType(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">All</option>
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="name">Name:</label>
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
                    <label style={filterStyles.label} htmlFor="yearOfAllotment">Year of Allotment:</label>
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
                    <label style={filterStyles.label} htmlFor="email">Email:</label>
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
                    <label style={filterStyles.label} htmlFor="status">Status:</label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">All</option>
                      <option value="serving">Serving</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="modulesHandled">Modules Handled:</label>
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
                    <label style={filterStyles.label} htmlFor="majorDomains">Major Domains:</label>
                    <select
                      id="majorDomains"
                      value={majorDomains[0] || ""}
                      onChange={(e) => setMajorDomains(e.target.value ? [e.target.value] : [])}
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">All</option>
                      {Object.keys(domainOptions).map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="minorDomains">Minor Domains:</label>
                    <select
                      id="minorDomains"
                      value={minorDomains[0] || ""}
                      onChange={(e) => setMinorDomains(e.target.value ? [e.target.value] : [])}
                      disabled={!majorDomains[0]}
                      style={{
                        ...filterStyles.input,
                        opacity: !majorDomains[0] ? 0.7 : 1,
                        cursor: !majorDomains[0] ? "not-allowed" : "pointer",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">All</option>
                      {majorDomains[0] &&
                        domainOptions[majorDomains[0]]?.map((subDomain) => (
                          <option key={subDomain} value={subDomain}>
                            {subDomain}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="areaOfExpertise">Areas of Expertise:</label>
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
                    <label style={filterStyles.label} htmlFor="institution">Institution:</label>
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
                    <label style={filterStyles.label} htmlFor="mobileNumber">Mobile Number:</label>
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
                    <label style={filterStyles.label} htmlFor="domainKnowledge">Domain Knowledge:</label>
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

              {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}
              {tableData.length > 0 && (
                <table className="faculty-table" style={{ marginTop: "1rem" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Photograph</th>
                      <th>Faculty Type</th>
                      <th>Mobile Number</th>
                      <th>Email</th>
                      <th>Year of Allotment</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.name}</td>
                        <td>
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
                        <td>{row.facultyType}</td>
                        <td>{row.mobileNumber}</td>
                        <td>{row.email}</td>
                        <td>{row.yearOfAllotment}</td>
                        <td>
                          <button
                            style={viewButtonStyles.viewButton}
                            onClick={() => handleViewDetails(row)}
                            onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButtonHover.backgroundColor)}
                            onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)}
                          >
                            View
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
      </div>
    </>
  );
};


export default FacultyView;