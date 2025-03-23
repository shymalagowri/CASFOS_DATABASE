import React, { useEffect, useState } from "react";
import "../styles/style.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/viewFaculty.css";

const FacultyUpdation = () => {
  const [facultyType, setFacultyType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [yearOfAllotment, setYearOfAllotment] = useState("");
  const [status, setStatus] = useState("");
  const [modulesHandled, setModulesHandled] = useState("");
  const [majorDomains, setMajorDomains] = useState("");
  const [minorDomains, setMinorDomains] = useState("");
  const [areasOfExpertise, setAreasOfExpertise] = useState("");
  const [institution, setInstitution] = useState("");

  const [tableData, setTableData] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const handleUpdateDetails = async (facultyId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/faculty/search/${facultyId}`);
      const facultyData = response.data.data;
      console.log(facultyData);
      navigate(`/updatefacultyentry?username=${encodeURIComponent(username)}`, {
        state: { facultyData, isUpdate: true },
      });
    } catch (error) {
      console.error("Error fetching faculty details:", error);
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
          majorDomains: majorDomains ? [majorDomains] : undefined,
          minorDomains: minorDomains ? [minorDomains] : undefined,
          areasOfExpertise,
          institution,
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
    setMajorDomains("");
    setMinorDomains("");
    setAreasOfExpertise("");
    setInstitution("");
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
                  <input
                    id="majorDomains"
                    placeholder="Major Domain"
                    value={majorDomains}
                    onChange={(e) => setMajorDomains(e.target.value)}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="minorDomains">Minor Domains:</label>
                  <input
                    id="minorDomains"
                    placeholder="Minor Domain"
                    value={minorDomains}
                    onChange={(e) => setMinorDomains(e.target.value)}
                  />
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

export default FacultyUpdation;