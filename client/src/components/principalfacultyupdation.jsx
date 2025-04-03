import React, { useEffect, useState } from "react";
import "../styles/style.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/viewFaculty.css";

const principalFacultyUpdation = () => {
  const [facultyType, setFacultyType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [yearOfAllotment, setYearOfAllotment] = useState("");
  const [status, setStatus] = useState("");
  const [modulesHandled, setModulesHandled] = useState("");
  const [majorDomains, setMajorDomains] = useState([]);
  const [minorDomains, setMinorDomains] = useState([]);
  const [areasOfExpertise, setAreasOfExpertise] = useState("");
  const [institution, setInstitution] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [tableData, setTableData] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
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
    "Environment": [
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
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const handleUpdateDetails = async (facultyId) => {
    try {
      console.log("Fetching faculty data for ID:", facultyId);
      const response = await axios.get(`http://localhost:3001/api/faculty/search/${facultyId}`);
      if (response.data.success) {
        const facultyData = response.data.data;
        console.log("Faculty data fetched:", facultyData);
        navigate(`/updatefacultyentry?username=${encodeURIComponent(username)}`, {
          state: { facultyData, isUpdate: true },
        });
      } else {
        setMessage("Faculty not found.");
        console.log("Faculty not found in response:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching faculty details:", error);
      setMessage("Error fetching faculty data.");
    }
  };

  useEffect(() => {
    const handleApplyFilter = async () => {
      try {
        const response = await axios.post("http://localhost:3001/api/faculty/filterFaculties", {
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
        console.error("Error fetching filtered faculty:", error);
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
    areasOfExpertise,
    institution,
    mobileNumber,
  ]);

  const renderPopupContent = (data) => {
    const renderValue = (value, key) => {
      if (key === "photograph" && typeof value === "string") {
        const imageUrl = `http://localhost:3001/uploads/${value.split("\\").pop()}`;
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
              .filter(([key]) => key !== "_id")
              .map(([key, val]) => (
                <li key={key}>
                  <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</strong>{" "}
                  {renderValue(val, key)}
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || "-";
    };

    return Object.entries(data)
      .filter(([key]) => key !== "_id")
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
    setEmail("");
    setYearOfAllotment("");
    setStatus("");
    setModulesHandled("");
    setMajorDomains([]);
    setMinorDomains([]);
    setAreasOfExpertise("");
    setInstitution("");
    setMobileNumber("");
  };

  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  const closePopup = () => {
    setSelectedFaculty(null);
  };

  return (
    <div className="faculty-view">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="style.css" />
      <title>CASFOS</title>
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">DATA ENTRY STAFF</span>
        </a>
        <ul className="side-menu top">
            <li className="active"><a href={`/principaldashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li ><a href={`/principalassetupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Updation</span></a></li>
            <li><a href={`/principalassetview?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset View</span></a></li>
            <li><a href={`/principalfacultyupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Faculty Updation</span></a></li>
            <li><a href={`/principalfacultyview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li>
          </ul>
        <ul className="side-menu">
          <li>
            <a href="/" className="logout">
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
          <div className="dash-content">
            <div className="title">
              <span className="text">EXISTING FACULTY UPDATION</span>
            </div>
            <div className="filters">
              <div className="filter-grid">
                <div className="filter-item">
                  <label htmlFor="facultyType">Faculty Type:</label>
                  <select
                    id="facultyType"
                    value={facultyType}
                    onChange={(e) => setFacultyType(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="contract">Contract</option>

                  </select>
                </div>
                <div className="filter-item">
                  <label htmlFor="name">Name:</label>
                  <input
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="email">Email:</label>
                  <input
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="yearOfAllotment">Year of Allotment:</label>
                  <input
                    id="yearOfAllotment"
                    placeholder="YYYY"
                    value={yearOfAllotment}
                    onChange={(e) => setYearOfAllotment(e.target.value)}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="serving">Serving</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div className="filter-item">
                  <label htmlFor="modulesHandled">Modules Handled:</label>
                  <input
                    id="modulesHandled"
                    placeholder="Module Name"
                    value={modulesHandled}
                    onChange={(e) => setModulesHandled(e.target.value)}
                  />
                </div>
                <div className="filter-item">
  <label htmlFor="majorDomains">Major Domains:</label>
  <select
    id="majorDomains"
    value={majorDomains[0] || ""} // Assuming single selection for simplicity
    onChange={(e) => setMajorDomains([e.target.value])}
  >
    <option value="">Select Major Domain</option>
    {Object.keys(domainOptions).map((domain) => (
      <option key={domain} value={domain}>
        {domain}
      </option>
    ))}
  </select>
</div>
<div className="filter-item">
  <label htmlFor="minorDomains">Minor Domains:</label>
  <select
    id="minorDomains"
    value={minorDomains[0] || ""} // Assuming single selection for simplicity
    onChange={(e) => setMinorDomains([e.target.value])}
    disabled={!majorDomains[0]} // Disable if no major domain is selected
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
                <div className="filter-item">
                  <label htmlFor="areasOfExpertise">Areas of Expertise:</label>
                  <input
                    id="areasOfExpertise"
                    placeholder="Areas of Expertise"
                    value={areasOfExpertise}
                    onChange={(e) => setAreasOfExpertise(e.target.value)}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="institution">Institution:</label>
                  <input
                    id="institution"
                    placeholder="Institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="mobileNumber">Mobile Number:</label>
                  <input
                    id="mobileNumber"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="button-container">
                <button className="btn clear" onClick={handleClearFilter}>
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
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.name}</td>
                      <td>
                        {row.photograph ? (
                          <img
                            src={`http://localhost:3001/uploads/${row.photograph.split("\\").pop()}`}
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
                        <button className="btn view" onClick={() => handleViewDetails(row)}>
                          View
                        </button>
                      </td>
                      <td>
                        <button className="btn view" onClick={() => handleUpdateDetails(row._id)}>
                          Update
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
        <div className="popup">
          <div className="popup-content">
            <h3>Faculty Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>{renderPopupContent(selectedFaculty)}</tbody>
            </table>
            <button className="btn close" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
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
};

export default principalFacultyUpdation;