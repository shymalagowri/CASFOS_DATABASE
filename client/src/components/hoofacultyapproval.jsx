import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FacultyApproval.css";
import { useLocation } from "react-router-dom";
import "../styles/style.css";
import Swal from "sweetalert2";

function FacultyApproval() {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const [faculties, setFaculties] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [existingUsersCount, setExistingUsersCount] = useState(0);
  const [dataEntriesCount, setDataEntriesCount] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState({});
  const [rejectingFacultyId, setRejectingFacultyId] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const newUsersResponse = await axios.get(`http://${ip}:${port}/api/users/temporaryuserscount`);
        setNewUsersCount(newUsersResponse.data.count);

        const existingUsersResponse = await axios.get(`http://${ip}:${port}/api/users/count`);
        const totalusers =
          existingUsersResponse.data.data.adminCount +
          existingUsersResponse.data.data.dataEntryCount +
          existingUsersResponse.data.data.viewerCount;
        setExistingUsersCount(totalusers);

        const assetRes = await axios.get(`http://${ip}:${port}/api/assets/monthly`);
        const facultyRes = await axios.get(`http://${ip}:${port}/api/faculty/monthly`);
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
    const fetchFaculties = async () => {
      try {
        const response = await axios.get(`http://${ip}:${port}/api/faculty/getAllFaculties`);
        setFaculties(response.data);
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    };
    fetchFaculties();
  }, []);

  const approveFaculty = async (id) => {
    try {
      const facultyToApprove = faculties.find((faculty) => faculty._id === id);
      if (!facultyToApprove.verified) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Faculty must be verified before approval.",
        });
        return;
      }

      setApprovalStatus((prev) => ({ ...prev, [id]: "Saving..." }));

      const response = await axios.post(`http://${ip}:${port}/api/faculty/approve/${id}`);
      if (response.data.message === "Faculty approved and moved to confirmed successfully") {
        setFaculties(faculties.filter((faculty) => faculty._id !== id));
        setApprovalStatus((prev) => ({ ...prev, [id]: "Approved" }));
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty approved successfully!",
        });

        setTimeout(() => {
          setApprovalStatus((prev) => ({ ...prev, [id]: "" }));
        }, 2000);
      } else {
        setApprovalStatus((prev) => ({ ...prev, [id]: "Failed to Approve" }));
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.data.message || "Unexpected response from server.",
        });
      }
    } catch (error) {
      console.error("Error approving faculty:", error);
      setApprovalStatus((prev) => ({ ...prev, [id]: "Failed to Approve" }));
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error approving faculty.",
      });
    }
  };

  const rejectFaculty = async (id) => {
    setRejectingFacultyId(id);
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
      const facultyToReject = faculties.find((faculty) => faculty._id === rejectingFacultyId);
      if (!facultyToReject.verified) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Faculty must be verified before rejection.",
        });
        setRejectingFacultyId(null);
        return;
      }

      setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Rejecting..." }));

      const response = await axios.post(`http://${ip}:${port}/api/faculty/rejectFacultyApproval/${rejectingFacultyId}`, {
        rejectionRemarks
      });

      if (response.data.success) {
        setFaculties(faculties.filter((faculty) => faculty._id !== rejectingFacultyId));
        setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Rejected" }));
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty rejected successfully!!!",
        });

        setTimeout(() => {
          setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "" }));
        }, 2000);
      } else {
        setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Failed to Reject" }));
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.data.message || "Unexpected response from server.",
        });
      }
    } catch (error) {
      console.error("Error rejecting faculty approval:", error);
      setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Failed to Reject" }));
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error rejecting faculty approval.",
      });
    } finally {
      setRejectingFacultyId(null);
    }
  };

  const renderPopupContent = (data) => {
    const renderValue = (value, key) => {
      if (key === "photograph" && typeof value === "string") {
        const imageUrl = `http://${ip}:${port}/uploads/${value.split("\\").pop()}`;
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
      .filter(([key]) => key !== "_id")
      .map(([key, value]) => (
        <tr key={key}>
          <td>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</td>
          <td>{renderValue(value, key)}</td>
        </tr>
      ));
  };

  return (
    <div className="faculty-approval">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="style.css" />
      <title>CASFOS</title>

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
          <li className="active">
            <a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Faculty Approval</span>
            </a>
          </li>
          <li>
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
                  <th>Verified</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr key={faculty._id}>
                    <td>{faculty.name || "-"}</td>
                    <td>{faculty.facultyType || "-"}</td>
                    <td>{faculty.yearOfAllotment || "-"}</td>
                    <td>{faculty.mobileNumber || "-"}</td>
                    <td>{faculty.verified ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="view-button"
                        onClick={() => setPopupData(faculty)}
                      >
                        View
                      </button>
                    </td>
                    <td style={{ display: "flex", gap: "10px", alignItems: "center" }}>
  <button
    className="approve-button"
    onClick={() => approveFaculty(faculty._id)}
    disabled={!faculty.verified || approvalStatus[faculty._id] === "Saving..." || approvalStatus[faculty._id] === "Rejecting..."}
    style={{
      backgroundColor: faculty.verified ? "#28a745" : "#ccc",
      cursor: faculty.verified ? "pointer" : "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      padding: "8px 16px", // Ensure consistent padding
      borderRadius: "5px",
      border: "none",
      color: "white",
    }}
  >
    {approvalStatus[faculty._id] === "Saving..." && (
      <>
        <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i>
        Saving...
      </>
    )}
    {approvalStatus[faculty._id] === "Approved" && (
      <>
        <i className="bx bx-check-circle" style={styles.successIcon}></i>
        Approved
      </>
    )}
    {approvalStatus[faculty._id] === "Failed to Approve" && (
      <>
        <i className="bx bx-error-circle" style={styles.errorIcon}></i>
        Failed
      </>
    )}
    {!approvalStatus[faculty._id] && "Approve"}
  </button>
  <button
    className="reject-button"
    onClick={() => rejectFaculty(faculty._id)}
    disabled={!faculty.verified || approvalStatus[faculty._id] === "Saving..." || approvalStatus[faculty._id] === "Rejecting..."}
    style={{
      backgroundColor: faculty.verified ? "#dc3545" : "#ccc",
      cursor: faculty.verified ? "pointer" : "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      padding: "8px 16px", // Ensure consistent padding
      borderRadius: "5px",
      border: "none",
      color: "white",
    }}
  >
    {approvalStatus[faculty._id] === "Rejecting..." && (
      <>
        <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i>
        Rejecting...
      </>
    )}
    {approvalStatus[faculty._id] === "Rejected" && (
      <>
        <i className="bx bx-x-circle" style={styles.errorIcon}></i>
        Rejected
      </>
    )}
    {approvalStatus[faculty._id] === "Failed to Reject" && (
      <>
        <i className="bx bx-error-circle" style={styles.errorIcon}></i>
        Failed
      </>
    )}
    {!approvalStatus[faculty._id] && "Reject"}
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

      {rejectingFacultyId && (
        <div className="popup">
          <div className="popup-content">
            <h3>Rejection Remarks</h3>
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
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => setRejectingFacultyId(null)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={submitRejection}
              >
                Submit
              </button>
            </div>
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
    marginLeft: "20px",
    color: "#333",
  },
  loadingIcon: { fontSize: "16px", color: "#007BFF" },
  successIcon: { fontSize: "16px", color: "#28a745" },
  errorIcon: { fontSize: "16px", color: "#dc3545" },
};

export default FacultyApproval;