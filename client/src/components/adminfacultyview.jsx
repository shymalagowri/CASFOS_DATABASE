import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import "../styles/viewAsset.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
const AdminFacultyView = () => {
    const [facultyType, setFacultyType] = useState("");
    const [name, setName] = useState("");
    const [yearOfAllotment, setYearOfAllotment] = useState("");
    const [email, setEmail] = useState("");
    const [domainKnowledge, setDomainKnowledge] = useState("");
    const [areaOfExpertise, setAreaOfExpertise] = useState("");
    const [institution, setInstitution] = useState("");
    const [tableData, setTableData] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState(null);
  const location = useLocation(); 
    const queryParams = new URLSearchParams(location.search); // Create URLSearchParams object
    const username = queryParams.get("username") || "Guest"; 
      useEffect(() => {
    
    const handleApplyFilter = async () => {
      try {
        const response = await axios.post("http://localhost:3001/api/faculty/filterFaculties", {
          facultyType,
          name,
          yearOfAllotment,
          email,
          domainKnowledge,
          areaOfExpertise,
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
    }
    };
    handleApplyFilter();
  },[facultyType, name, email]);
    const renderPopupContent = (data) => {
      const renderValue = (value, key) => {
        if (key === "photograph" && typeof value === "string") {
          // Ensure correct URL format for the image
          const imageUrl = `http://localhost:3001/uploads/${value.split("\\").pop()}`;
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
      setYearOfAllotment("");
      setEmail("");
      setDomainKnowledge("");
      setAreaOfExpertise("");
      setInstitution("");
      setTableData([]);
      setMessage("");
    };
  
    const handleViewDetails = (faculty) => {
      setSelectedFaculty(faculty);
    };
  
    const closePopup = () => {
      setSelectedFaculty(null);
    };
  return (
    <>
      <div className="asset-view">
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"/>

        <link rel="stylesheet" href="style.css" />
        <title>CASFOS</title>
        {/* SIDEBAR */}
        <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">ADMIN</span>
          </a>
          <ul className="side-menu top">
            <li >
            <a href={`/admindashboard?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li>
            <a href={`/adminuserapproval?username=${encodeURIComponent(username)}`}>
            <i className="bx bxs-shopping-bag-alt" />
                <span className="text">Registration Approval</span>
              </a>
            </li>
            <li>
            <a href={`/usermanagement?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">User Management</span>
              </a>
            </li>
            <li>
            <a href={`/adminassetapproval?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Asset Approval</span>
              </a>
            </li>
            <li>
            <a href={`/adminfacultyapproval?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty Approval</span>
              </a>
            </li>
            <li>
            <a href={`/adminassetview?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Asset View</span>
              </a>
            </li>
            <li className="active">
            <a href={`/adminfacultyview?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty View</span>
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
        {/* SIDEBAR */}
        {/* CONTENT */}
        <section id="content">
          {/* NAVBAR */}
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
          {/* NAVBAR */}
          {/* MAIN */}
          <main>
          <div className="dash-content">
          <div className="title">
            <span className="text">Faculty View with Filters</span>
          </div>
          <div className="filter-container">
  <div className="filter-grid">
    <div className="filter-item">
      <label htmlFor="facultyType">Faculty Type:</label>
      <input
        id="facultyType"
        placeholder="Faculty Type"
        value={facultyType}
        onChange={(e) => setFacultyType(e.target.value)}
      />
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
      <label htmlFor="yearOfAllotment">Year of Allotment:</label>
      <input
        id="yearOfAllotment"
        placeholder="Year of Allotment"
        value={yearOfAllotment}
        onChange={(e) => setYearOfAllotment(e.target.value)}
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
      <label htmlFor="domainKnowledge">Domain Knowledge:</label>
      <input
        id="domainKnowledge"
        placeholder="Domain Knowledge"
        value={domainKnowledge}
        onChange={(e) => setDomainKnowledge(e.target.value)}
      />
    </div>
    <div className="filter-item">
      <label htmlFor="areaOfExpertise">Area of Expertise:</label>
      <input
        id="areaOfExpertise"
        placeholder="Area of Expertise"
        value={areaOfExpertise}
        onChange={(e) => setAreaOfExpertise(e.target.value)}
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
                  <th>Photograph</th> {/* New Column for Image */}

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
                      <button className="btn view" onClick={() => handleViewDetails(row)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
            </main>
          {/* MAIN */}
        </section>
        {selectedFaculty && (
  <div className="popup">
    <div className="popup-content">
      <h3>Faculty Details</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
        {renderPopupContent(selectedFaculty)}

        </tbody>
      </table>
      <button className="btn close" onClick={closePopup}>Close</button>
    </div>
  </div>
)}
      </div>
            
    </>
    
  );
};

const styles = {
  rowContainer: {
    display: "flex",
    flexWrap: "wrap", // Ensure responsiveness
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
    minWidth: "300px", // Prevents shrinking too much
  },
  amcContainer: {
    flex: 1,
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    minWidth: "300px",
    maxHeight: "300px", // Fixed height
    overflowY: "auto", // Enables scrolling
  },
  cardContainer: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap", // Ensures responsiveness
  },
  card: {
    flex: "1",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    minWidth: "150px", // Prevents too small cards
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

export default AdminFacultyView;
