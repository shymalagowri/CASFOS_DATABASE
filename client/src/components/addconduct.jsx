import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/style.css";
import Swal from "sweetalert2"; // Import SweetAlert2 for popups (optional)

const AddConduct = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const [facultyName, setFacultyName] = useState("");
  const [conduct, setConduct] = useState("");
  const [remarks, setRemarks] = useState("");
  const [savingStatus, setSavingStatus] = useState(""); // Added for animation

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await axios.get(`http://${ip}:${port}/api/faculty/search/${facultyId}`);
        const { name, conduct, remarks } = response.data.data;
        setFacultyName(name);
        setConduct(conduct || "");
        setRemarks(remarks || "");
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        setSavingStatus("Failed to Fetch");
      }
    };
    fetchFacultyData();
  }, [facultyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingStatus("Saving..."); // Start animation
    try {
      const response = await axios.put(`http://${ip}:${port}/api/faculty/update/${facultyId}`, {
        conduct,
        remarks,
      });
      if (response.data.success) {
        setSavingStatus("Saved"); // Success state
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Conduct updated successfully!",
        });
        setTimeout(() => {
          navigate(`/principalfacultyupdation?username=${encodeURIComponent(username)}`);
        }, 1500);
      } else {
        setSavingStatus("Failed to Save"); // Failure state
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.data.message || "Error updating conduct",
        });
      }
    } catch (error) {
      console.error("Error updating conduct:", error);
      setSavingStatus("Failed to Save"); // Failure state
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating conduct",
      });
    }
  };

  // Define styles object before using it in JSX
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "500px",
      margin: "0 auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
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
    select: {
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
    submitButton: {
      padding: "10px 20px",
      backgroundColor: "#28a745",
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
    submitButtonHover: {
      backgroundColor: "#218838",
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#333",
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
    loadingIcon: { fontSize: "16px", color: "#007BFF" },
    successIcon: { fontSize: "16px", color: "#28a745" },
    errorIcon: { fontSize: "16px", color: "#dc3545" },
  };

  return (
    <div>
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">PRINCIPAL</span>
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/principaldashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/principalassetupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Updation</span>
            </a>
          </li>
          <li>
            <a href={`/principalassetview?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Asset View</span>
            </a>
          </li>
          <li className="active">
            <a href={`/principalfacultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Faculty Updation</span>
            </a>
          </li>
          <li>
            <a href={`/principalfacultyview?username=${encodeURIComponent(username)}`}>
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
          <div style={styles.container}>
            <h2 style={styles.title}>Add Faculty Conduct</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div>
                <label style={styles.label}>Faculty Name:</label>
                <input
                  type="text"
                  value={facultyName}
                  disabled
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Conduct:</label>
                <select
                  value={conduct}
                  onChange={(e) => setConduct(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  required
                >
                  <option value="">Select Conduct</option>
                  <option value="best">Best</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="bad">Bad</option>
                  <option value="worst">Worst</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Remarks:</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                />
              </div>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={savingStatus === "Saving..."}
                onMouseOver={(e) =>
                  savingStatus !== "Saving..." &&
                  (e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                  savingStatus !== "Saving..." &&
                  (e.target.style.backgroundColor = styles.submitButton.backgroundColor)
                }
              >
                {savingStatus === "Saving..." && (
                  <>
                    <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i>
                    Saving...
                  </>
                )}
                {savingStatus === "Saved" && (
                  <>
                    <i className="bx bx-check-circle" style={styles.successIcon}></i>
                    Saved
                  </>
                )}
                {savingStatus === "Failed to Save" && (
                  <>
                    <i className="bx bx-error-circle" style={styles.errorIcon}></i>
                    Failed
                  </>
                )}
                {!savingStatus && "Submit"}
              </button>
            </form>
          </div>
        </main>
      </section>
    </div>
  );
};

export default AddConduct;