// Overview: This React component, AddConduct, is designed for updating the conduct and remarks of a faculty member.
// It fetches faculty data based on a provided facultyId, allows the user to select a conduct rating and add remarks,
// and submits the updated data to a backend API. The component includes a sidebar for navigation, a form for data input,
// and visual feedback for the saving process using SweetAlert2 popups and loading animations. It uses React Router for navigation
// and Axios for API calls. The styling is handled inline with a styles object for consistency and responsiveness.

import React, { useState, useEffect } from "react"; // Import React and hooks for state and lifecycle management
import axios from "axios"; // Import Axios for making HTTP requests
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Import React Router hooks for URL params, navigation, and location
import "../styles/Style.css"; // Import external CSS for additional styling
import Swal from "sweetalert2"; // Import SweetAlert2 for user-friendly alert popups

// Define the AddConduct functional component
const AddConduct = () => {
  // Retrieve environment variables for API configuration
  const port = import.meta.env.VITE_API_PORT; // API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // API IP from environment variables

  // Extract facultyId from URL parameters
  const { facultyId } = useParams();
  // Initialize navigation hook
  const navigate = useNavigate();
  // Access current location for query parameters
  const location = useLocation();
  // Parse query parameters to get username, default to "Guest" if not provided
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  // State for storing faculty name, conduct, remarks, and saving status
  const [facultyName, setFacultyName] = useState(""); // Faculty name fetched from API
  const [conduct, setConduct] = useState(""); // Conduct rating (e.g., best, good)
  const [remarks, setRemarks] = useState(""); // Additional remarks
  const [savingStatus, setSavingStatus] = useState(""); // Tracks saving state for UI feedback

  // Effect hook to fetch faculty data when component mounts or facultyId changes
  useEffect(() => {
    // Async function to fetch faculty data
    const fetchFacultyData = async () => {
      try {
        // Make GET request to fetch faculty data by ID
        const response = await axios.get(`http://${ip}:${port}/api/faculty/search/${facultyId}`);
        const { name, conduct, remarks } = response.data.data; // Destructure response data
        setFacultyName(name); // Set faculty name
        setConduct(conduct || ""); // Set conduct or empty string
        setRemarks(remarks || ""); // Set remarks or empty string
      } catch (error) {
        console.error("Error fetching faculty data:", error); // Log error
        setSavingStatus("Failed to Fetch"); // Update status for UI feedback
      }
    };
    fetchFacultyData(); // Call the fetch function
  }, [facultyId, ip, port]); // Dependencies for useEffect

  // Handle form submission to update faculty conduct
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setSavingStatus("Saving..."); // Set saving status for animation
    try {
      // Make PUT request to update faculty conduct and remarks
      const response = await axios.put(`http://${ip}:${port}/api/faculty/update/${facultyId}`, {
        conduct,
        remarks,
      });
      if (response.data.success) {
        setSavingStatus("Saved"); // Update status to success
        // Show success popup using SweetAlert2
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Conduct updated successfully!",
        });
        // Navigate back to faculty updation page after 1.5 seconds
        setTimeout(() => {
          navigate(`/principalfacultyupdation?username=${encodeURIComponent(username)}`);
        }, 1500);
      } else {
        setSavingStatus("Failed to Save"); // Update status to failure
        // Show error popup
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.data.message || "Error updating conduct",
        });
      }
    } catch (error) {
      console.error("Error updating conduct:", error); // Log error
      setSavingStatus("Failed to Save"); // Update status to failure
      // Show error popup
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating conduct",
      });
    }
  };

  // Define inline styles for consistent UI
  const styles = {
    container: {
      padding: "20px", // Padding for container
      maxWidth: "500px", // Max width for form container
      margin: "0 auto", // Center container
      backgroundColor: "#f9f9f9", // Light background
      borderRadius: "8px", // Rounded corners
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
    },
    form: {
      display: "flex", // Flexbox for form layout
      flexDirection: "column", // Vertical layout
      gap: "15px", // Spacing between form elements
    },
    label: {
      marginBottom: "5px", // Space below label
      fontWeight: "500", // Medium font weight
      color: "#333", // Dark text color
    },
    input: {
      padding: "8px 12px", // Padding for input fields
      border: "1px solid #ddd", // Light border
      borderRadius: "4px", // Rounded corners
      fontSize: "14px", // Font size
      outline: "none", // Remove default outline
      transition: "border-color 0.2s", // Smooth border color transition
    },
    select: {
      padding: "8px 12px", // Padding for select dropdown
      border: "1px solid #ddd", // Light border
      borderRadius: "4px", // Rounded corners
      fontSize: "14px", // Font size
      outline: "none", // Remove default outline
      transition: "border-color 0.2s", // Smooth border color transition
    },
    inputFocus: {
      borderColor: "#007BFF", // Blue border on focus
    },
    submitButton: {
      padding: "10px 20px", // Padding for button
      backgroundColor: "#28a745", // Green background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      cursor: "pointer", // Pointer cursor
      transition: "background-color 0.2s", // Smooth background transition
      display: "flex", // Flexbox for button content
      alignItems: "center", // Center vertically
      justifyContent: "center", // Center horizontally
      gap: "5px", // Space between icon and text
    },
    submitButtonHover: {
      backgroundColor: "#218838", // Darker green on hover
    },
    title: {
      textAlign: "center", // Center title
      marginBottom: "20px", // Space below title
      color: "#333", // Dark text color
    },
    usernameContainer: {
      display: "flex", // Flexbox for username display
      alignItems: "center", // Center vertically
      gap: "10px", // Space between icon and text
      fontSize: "14px", // Font size
      color: "#555", // Gray text color
    },
    userIcon: {
      fontSize: "30px", // Icon size
      color: "#007BFF", // Blue icon color
    },
    username: {
      fontWeight: "bold", // Bold username
      fontSize: "18px", // Larger font size
    },
    loadingIcon: { fontSize: "16px", color: "#007BFF" }, // Blue loading icon
    successIcon: { fontSize: "16px", color: "#28a745" }, // Green success icon
    errorIcon: { fontSize: "16px", color: "#dc3545" }, // Red error icon
  };

  // Render the component UI
  return (
    <div>
      {/* Sidebar navigation */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">PRINCIPAL</span> {/* Sidebar title */}
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/principaldashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span> {/* Home link */}
            </a>
          </li>
          <li>
            <a href={`/principalassetupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Updation</span> {/* Asset update link */}
            </a>
          </li>
          <li>
            <a href={`/principalassetview?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Asset View</span> {/* Asset view link */}
            </a>
          </li>
          <li className="active">
            <a href={`/principalfacultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Faculty Updation</span> {/* Faculty update link (active) */}
            </a>
          </li>
          <li>
            <a href={`/principalfacultyview?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty View</span> {/* Faculty view link */}
            </a>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="/login" className="logout">
              <i className="bx bxs-log-out-circle" />
              <span className="text">Logout</span> {/* Logout link */}
            </a>
          </li>
        </ul>
      </section>

      {/* Main content section */}
      <section id="content">
        {/* Navigation bar */}
        <nav>
          <i className="bx bx-menu" /> {/* Menu icon */}
          <form action="#">
            <div className="form-input"></div> {/* Empty form for potential future use */}
          </form>
          {/* Username display */}
          <div style={styles.usernameContainer}>
            <i className="bx bxs-user-circle" style={styles.userIcon}></i>
            <span style={styles.username}>{username}</span> {/* Display username */}
          </div>
        </nav>

        {/* Main content */}
        <main>
          <div style={styles.container}>
            <h2 style={styles.title}>Add Faculty Conduct</h2> {/* Form title */}
            {/* Conduct update form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Faculty name field (disabled) */}
              <div>
                <label style={styles.label}>Faculty Name:</label>
                <input
                  type="text"
                  value={facultyName}
                  disabled
                  style={styles.input}
                />
              </div>
              {/* Conduct selection dropdown */}
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
              {/* Remarks input field */}
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
              {/* Submit button with dynamic feedback */}
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
                {/* Show loading state */}
                {savingStatus === "Saving..." && (
                  <>
                    <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i>
                    Saving...
                  </>
                )}
                {/* Show success state */}
                {savingStatus === "Saved" && (
                  <>
                    <i className="bx bx-check-circle" style={styles.successIcon}></i>
                    Saved
                  </>
                )}
                {/* Show error state */}
                {savingStatus === "Failed to Save" && (
                  <>
                    <i className="bx bx-error-circle" style={styles.errorIcon}></i>
                    Failed
                  </>
                )}
                {/* Default button text */}
                {!savingStatus && "Submit"}
              </button>
            </form>
          </div>
        </main>
      </section>
    </div>
  );
};

// Export the component
export default AddConduct;