import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FacultyApproval.css";
import { useLocation, Link } from "react-router-dom";
import "../styles/style.css";
function FacultyApproval() {
  const [faculties, setFaculties] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [existingUsersCount, setExistingUsersCount] = useState(0);
  const location = useLocation(); 
    const queryParams = new URLSearchParams(location.search); // Create URLSearchParams object
    const username = queryParams.get("username") || "Guest";
  const [dataEntriesCount, setDataEntriesCount] = useState(0);
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch count of new users
        const newUsersResponse = await axios.get("http://localhost:3001/api/users/temporaryuserscount");
        setNewUsersCount(newUsersResponse.data.count);

        // Fetch count of existing users
        const existingUsersResponse = await axios.get("http://localhost:3001/api/users/count");
        console.log(existingUsersResponse.data.data);
        const totalusers = existingUsersResponse.data.data.adminCount + existingUsersResponse.data.data.dataEntryCount + existingUsersResponse.data.data.viewerCount;
        setExistingUsersCount(totalusers);

        // Fetch count of data entries
        const assetRes = await axios.get("http://localhost:3001/api/assets/monthly");
        console.log(assetRes.data.data);
        const facultyRes = await axios.get("http://localhost:3001/api/faculty/monthly");
        console.log(facultyRes.data.internal);
        const assetCount = assetRes.data.data.reduce((total, item) => total + item, 0);
        const ifacultyCount = facultyRes.data.internal.reduce((total, item) => total + item, 0);
        const efacultyCount = facultyRes.data.external.reduce((total, item) => total + item, 0);
        const finalcount = assetCount + ifacultyCount + efacultyCount;
        setDataEntriesCount(finalcount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCounts();
  }, []);
  useEffect(() => {
    axios.get("http://localhost:3001/api/faculty/getAllFaculties").then((response) => {
      setFaculties(response.data);
    });
  }, []);

  const approveFaculty = (id) => {
    axios.post(`http://localhost:3001/api/faculty/approve/${id}`).then(() => {
      setFaculties(faculties.filter((faculty) => faculty._id !== id));
    });
  };

  const renderPopupContent = (data) => {
    const renderValue = (value, key) => {
      if (key === "photograph" && typeof value === "string") {
        // Ensure correct URL format
        const imageUrl = `http://localhost:3001/uploads/${value.split("\\").pop()}`;
        return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px" }} />;
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
                  <strong>{key}:</strong> {renderValue(val, key)}
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || "-";
    };
  
    return Object.entries(data)
      .filter(([key]) => key !== "_id") // Exclude keys like _id
      .map(([key, value]) => (
        <tr key={key}>
          <td>{key}</td>
          <td>{renderValue(value, key)}</td>
        </tr>
      ));
  };
  
  

  return (
    <div className="faculty-approval">
     <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
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
            <li className="active">
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
            <li>
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

      {/* CONTENT */}
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
     
          <div className="activity">
          <h2 style={styles.title}>New Faculty Approval</h2>
          <div style={styles.container}>

            <table className="advanced-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Faculty Type</th>
                  <th>Year of Allotment</th>
                  <th>Mobile Number</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr key={faculty._id}>
                    <td>{faculty.name}</td>
                    <td>{faculty.facultyType}</td>
                    <td>{faculty.yearOfAllotment}</td>
                    <td>{faculty.mobileNumber}</td>
                    <td>
                      <button
                        className="view-button"
                        onClick={() => setPopupData(faculty)}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        className="approve-button"
                        onClick={() => approveFaculty(faculty._id)}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </div>
      </section>
      {popupData && (
        <div className="popup">
          <div className="popup-content">
            <h3>{popupData.name} Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>{renderPopupContent(popupData)}</tbody>
            </table>
            <button onClick={() => setPopupData(null)}>Close</button>
          </div>
        </div>
      )}
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
  container: {
    maxWidth: "1200px",
    margin: "15px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "50px",
    marginBottom: "15px",
    marginLeft : "20px",
    color: "#333",
  },
};


export default FacultyApproval;
