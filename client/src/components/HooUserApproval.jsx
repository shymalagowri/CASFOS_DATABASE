
/**
 * Approval.jsx
 *
 * This React component provides the Head of Office with an interface to review, approve, or reject user registration
 * requests in the Central Academy for State Forest Service (CASFOS) system.
 *
 * Features:
 * - Fetches and displays pending user registrations in a table format.
 * - Allows viewing detailed user information in a SweetAlert2 popup, excluding sensitive fields (e.g., password).
 * - Supports approving registrations with role-based access assignment and rejecting registrations with required remarks.
 * - Includes a responsive sidebar for navigation to other Head of Office tasks (e.g., asset approval, faculty management).
 * - Integrates with backend APIs for fetching registrations and processing approval/rejection actions.
 * - Uses SweetAlert2 for user feedback and styled tables for data presentation.
 *
 * @returns {JSX.Element} The Approval component
 */

// -------------------
// Imports
// -------------------
import React, { useEffect, useState } from "react"; // Imports React and hooks for state and lifecycle management
import axios from 'axios'; // Imports Axios for making HTTP requests to the backend
import "../styles/UserApproval.css"; // Imports local stylesheet for user approval styling
import { useLocation, Link, useNavigate } from "react-router-dom"; // Imports routing hooks for location, navigation, and links
import Swal from "sweetalert2"; // Imports SweetAlert2 for user notifications and alerts
import "../styles/Style.css"; // Imports global stylesheet for shared styles

// -------------------
// Main Component
// -------------------
/**
 * User registration approval component for Head of Office
 * @returns {JSX.Element}
 */
function Approval() {
  // -------------------
  // Configuration
  // -------------------
  const port = import.meta.env.VITE_API_PORT; // Retrieves API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // Retrieves API IP address from environment variables

  // -------------------
  // State and Routing
  // -------------------
  const [registrations, setRegistrations] = useState([]); // State for storing pending user registrations
  const location = useLocation(); // Gets the current location object from React Router
  const navigate = useNavigate(); // Hook for programmatic navigation
  const queryParams = new URLSearchParams(location.search); // Parses query parameters from the URL
  const username = queryParams.get("username") || "Guest"; // Retrieves username from query params, defaults to "Guest"

  // -------------------
  // Data Fetching
  // -------------------
  /**
   * Fetches pending user registrations from the backend
   */
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        // Fetches all pending registrations from the backend
        const response = await axios.get(`http://${ip}:${port}/api/users/registrations`);
        setRegistrations(response.data); // Updates state with fetched registrations
      } catch (error) {
        // Logs error if fetch fails
        console.error('Error fetching registrations', error);
      }
    };
    fetchRegistrations(); // Triggers fetch on component mount
  }, [navigate, username]); // Re-runs if navigate or username changes

  // -------------------
  // Helper Functions
  // -------------------
  /**
   * Displays user details in a SweetAlert2 popup
   * @param {Object} reg - User registration data
   */
  const viewDetails = (reg) => {
    const ignoredKeys = ["_id", "password", "__v"]; // Keys to exclude from display
    // Generates HTML table for user details
    const detailsHtml = `
      <table style="width:100%; text-align:left; border-collapse: collapse;">
        ${Object.entries(reg)
          .filter(([key]) => !ignoredKeys.includes(key)) // Excludes sensitive keys
          .map(([key, value]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1); // Capitalizes key for display
            if (key === "dob" && value) {
              value = new Date(value).toISOString().split("T")[0]; // Formats date of birth as YYYY-MM-DD
            }
            return `
              <tr>
                <td style="font-weight:bold; padding:8px; border-bottom: 1px solid #ddd;">${formattedKey}</td>
                <td style="padding:8px; border-bottom: 1px solid #ddd;">${value || 'N/A'}</td>
              </tr>`;
          })
          .join("")}
      </table>`;

    // Shows details in a SweetAlert2 popup
    Swal.fire({
      title: "User Details", // Popup title
      html: detailsHtml, // Table content
      confirmButtonText: "Close", // Close button text
    });
  };

  /**
   * Approves a user registration
   * @param {string} id - User registration ID
   */
  const approveAction = async (id) => {
    const selectedUser = registrations.find(reg => reg._id === id); // Finds user by ID

    try {
      // Sends approval request with role-based access
      await axios.post(`http://${ip}:${port}/api/users/approve/${id}`, {
        access: selectedUser.role === 'headofoffice' || selectedUser.role === 'principal' ? ['all'] : [], // Grants full access for specific roles
        specificRole: selectedUser.role, // Passes user role
      });
      // Removes approved user from table
      setRegistrations(registrations.filter(reg => reg._id !== id));
      // Shows success notification
      Swal.fire('Approved!', 'The user has been approved.', 'success');
    } catch (error) {
      // Logs error and shows error notification
      console.error('Error approving registration', error);
      Swal.fire('Error!', 'There was an error approving the user.', 'error');
    }
  };

  /**
   * Rejects a user registration with remarks
   * @param {string} id - User registration ID
   */
  const rejectAction = async (id) => {
    // Shows rejection remark input popup
    Swal.fire({
      title: 'Reject Registration', // Popup title
      input: 'textarea', // Textarea for remarks
      inputLabel: 'Reason for rejection', // Label
      inputPlaceholder: 'Enter your remark here...', // Placeholder
      inputAttributes: { 'aria-label': 'Enter your remark here' }, // Accessibility attribute
      showCancelButton: true, // Shows cancel button
      confirmButtonText: 'Submit', // Submit button text
      cancelButtonText: 'Cancel', // Cancel button text
      preConfirm: (remark) => {
        if (!remark) {
          Swal.showValidationMessage('Remark is required for rejection.'); // Validates remark
        }
        return remark; // Returns remark
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Sends rejection request with remark
          await axios.post(`http://${ip}:${port}/api/users/reject/${id}`, { remark: result.value });
          // Removes rejected user from table
          setRegistrations(registrations.filter(reg => reg._id !== id));
          // Shows success notification
          Swal.fire('Rejected!', 'The registration has been rejected.', 'success');
        } catch (error) {
          // Logs error and shows error notification
          console.error('Error rejecting registration', error);
          Swal.fire('Error!', 'There was an error processing the rejection.', 'error');
        }
      }
    });
  };

  // -------------------
  // JSX Rendering
  // -------------------
  return (
    <div className="user-approval"> {/* Main container with user-approval class */}
      {/* Meta tags for character encoding and responsive viewport */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {/* External stylesheet for icons */}
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" /> {/* Boxicons for sidebar */}
      <link rel="stylesheet" href="style.css" /> {/* Local stylesheet (may overlap with UserApproval.css) */}
      <title>CASFOS</title> {/* Page title */}

      {/* Sidebar navigation */}
      <section id="sidebar"> {/* Sidebar section */}
        <a href="#" className="brand"> {/* Brand link (placeholder) */}
          <span className="text">HEAD OF OFFICE</span> {/* Brand name */}
        </a>
        <ul className="side-menu top"> {/* Primary navigation links */}
          <li> {/* Home link */}
            <a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}> {/* Navigates to dashboard */}
              <i className="bx bxs-dashboard" /> {/* Dashboard icon */}
              <span className="text">Home</span> {/* Home text */}
            </a>
          </li>
          <li className="active"> {/* User Approval link (active) */}
            <a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}> {/* Navigates to current page */}
              <i className="bx bxs-shopping-bag-alt" /> {/* Shopping bag icon */}
              <span className="text">User Approval</span> {/* User Approval text */}
            </a>
          </li>
          <li> {/* Asset Approval link */}
            <a href={`/hooassetapproval?username=${encodeURIComponent(username)}`}> {/* Navigates to asset approval */}
              <i className="bx bxs-shopping-bag-alt" /> {/* Shopping bag icon */}
              <span className="text">Asset Approval</span> {/* Asset Approval text */}
            </a>
          </li>
          <li> {/* Faculty Approval link */}
            <a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}> {/* Navigates to faculty approval */}
              <i className="bx bxs-package" /> {/* Package icon */}
              <span className="text">Faculty Approval</span> {/* Faculty Approval text */}
            </a>
          </li>
          <li> {/* Faculty Updation link */}
            <a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}> {/* Navigates to faculty updation */}
              <i className="bx bxs-reply" /> {/* Reply icon */}
              <span className="text">Faculty Updation</span> {/* Faculty Updation text */}
            </a>
          </li>
          <li> {/* Faculty View link */}
            <a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}> {/* Navigates to faculty view */}
              <i className="bx bxs-doughnut-chart" /> {/* Chart icon */}
              <span className="text">Faculty View</span> {/* Faculty View text */}
            </a>
          </li>
        </ul>
        <ul className="side-menu"> {/* Secondary navigation */}
          <li> {/* Logout link */}
            <a href="/login" className="logout"> {/* Navigates to login page */}
              <i className="bx bxs-log-out-circle" /> {/* Logout icon */}
              <span className="text">Logout</span> {/* Logout text */}
            </a>
          </li>
        </ul>
      </section>

      {/* Main content section */}
      <section id="content"> {/* Content section */}
        <nav> {/* Navigation bar */}
          <i className="bx bx-menu" /> {/* Menu icon (likely for sidebar toggle) */}
          <form action="#"> {/* Placeholder form */}
            <div className="form-input"></div> {/* Empty form input */}
          </form>
          <div style={styles.usernameContainer}> {/* Username display */}
            <i className="bx bxs-user-circle" style={styles.userIcon}></i> {/* User icon */}
            <span style={styles.username}>{username}</span> {/* Username text */}
          </div>
        </nav>
        <h2 style={styles.title}>New Registration Approval</h2> {/* Page title */}
        <br /> {/* Adds vertical spacing */}
        <div style={styles.container}> {/* Table container */}
          <table className="advanced-table"> {/* Registration table */}
            <thead>
              <tr>
                <th>Name</th> {/* Name column */}
                <th>Phone Number</th> {/* Phone Number column */}
                <th>Joined</th> {/* Joined Date column */}
                <th>Type</th> {/* Role/Type column */}
                <th>Action</th> {/* Action column */}
                <th>Details</th> {/* Details column */}
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, index) => (
                <tr key={index}> {/* Table row for each registration */}
                  <td>{reg.name}</td> {/* Name cell */}
                  <td>{reg.phone}</td> {/* Phone Number cell */}
                  <td>{new Date(reg.joined).toLocaleDateString()}</td> {/* Joined Date cell (formatted) */}
                  <td>
                    {/* Maps role to display text */}
                    {reg.role === 'headofoffice' ? 'Head of Office' :
                     reg.role === 'principal' ? 'Principal' :
                     reg.role === 'assetmanager' ? 'Asset Manager' :
                     reg.role === 'storekeeper' ? 'Storekeeper' :
                     reg.role === 'facultyentrystaff' ? 'Faculty Entry Staff' :
                     reg.role === 'facultyverifier' ? 'Faculty Verifier' :
                     'Viewer'}
                  </td> {/* Role cell */}
                  <td>
                    <button onClick={() => approveAction(reg._id)}>Approve</button> {/* Approve button */}
                    <button onClick={() => rejectAction(reg._id)}>Reject</button> {/* Reject button */}
                  </td> {/* Action cell */}
                  <td>
                    <button className="view-button" onClick={() => viewDetails(reg)}>View</button> {/* View details button */}
                  </td> {/* Details cell */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// -------------------
// Styles
// -------------------
/**
 * Inline styles for the component
 */
const styles = {
  usernameContainer: { // Username display container
    display: "flex", // Flexbox layout
    alignItems: "center", // Centers vertically
    gap: "10px", // Space between items
    fontSize: "14px", // Font size
    color: "#555", // Gray color
  },
  userIcon: { // User icon
    fontSize: "30px", // Larger size
    color: "#007BFF", // Blue color
  },
  username: { // Username text
    fontWeight: "bold", // Bold text
    fontSize: "18px", // Font size
  },
  container: { // Table container
    maxWidth: "1200px", // Maximum width
    margin: "15px auto", // Centered with margin
    padding: "20px", // Padding
    borderRadius: "10px", // Rounded corners
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
    backgroundColor: "#fff", // White background
  },
  title: { // Page title
    fontSize: "28px", // Font size
    fontWeight: "bold", // Bold text
    marginTop: "50px", // Top margin
    marginBottom: "15px", // Bottom margin
    marginLeft: "20px", // Left margin
    color: "#333", // Dark text color
  },
};

// Exports the component as default
export default Approval;
