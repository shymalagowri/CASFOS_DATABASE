/**
 * FacultyVerify.jsx
 *
 * This React component provides the faculty verifier with a searchable, filterable, and actionable interface
 * for reviewing, verifying, or rejecting faculty records in the CASFOS Faculty Management System.
 *
 * Features:
 * - Allows filtering unverified faculty records by type, name, year of allotment, email, domain knowledge, area of expertise,
 *   institution, status, modules handled, major/minor domains, and mobile number.
 * - Fetches and displays unverified faculty data from the backend in a table format.
 * - Provides detailed popup views for each faculty record, including nested and array fields, with image preview.
 * - Enables faculty verification and rejection, with SweetAlert2 feedback and rejection remarks workflow.
 * - Responsive UI with sidebar navigation, filter controls, styled tables, and modals for details and rejection.
 * - Integrates with backend APIs for dynamic data retrieval and status updates.
 * - Designed for faculty verifiers to efficiently search, review, verify, or reject faculty details.
 *
 * @returns {JSX.Element} The FacultyVerify component
 */

// -------------------
// Imports
// -------------------
import React, { useEffect, useState } from "react"; // Imports React and hooks for state and lifecycle management
import axios from "axios"; // Imports Axios for making HTTP requests to the backend
import { useLocation } from "react-router-dom"; // Imports useLocation for accessing URL query parameters
import Swal from "sweetalert2"; // Imports SweetAlert2 for user notifications and alerts

// -------------------
// Main Component
// -------------------
/**
 * Faculty verification component for reviewing and managing unverified faculty records
 * @returns {JSX.Element}
 */
const FacultyVerify = () => {
  // -------------------
  // Configuration
  // -------------------
  const port = import.meta.env.VITE_API_PORT; // Retrieves API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // Retrieves API IP address from environment variables

  // -------------------
  // State Management
  // -------------------
  const [facultyType, setFacultyType] = useState(""); // State for filtering by faculty type (e.g., internal, external)
  const [name, setName] = useState(""); // State for filtering by faculty name
  const [yearOfAllotment, setYearOfAllotment] = useState(""); // State for filtering by year of allotment
  const [email, setEmail] = useState(""); // State for filtering by email
  const [domainKnowledge, setDomainKnowledge] = useState(""); // State for filtering by domain knowledge
  const [areaOfExpertise, setAreaOfExpertise] = useState(""); // State for filtering by area of expertise
  const [institution, setInstitution] = useState(""); // State for filtering by institution
  const [status, setStatus] = useState(""); // State for filtering by faculty status (e.g., serving, retired)
  const [modulesHandled, setModulesHandled] = useState(""); // State for filtering by modules handled
  const [majorDomains, setMajorDomains] = useState([]); // State for filtering by major domains (array)
  const [minorDomains, setMinorDomains] = useState([]); // State for filtering by minor domains (array)
  const [mobileNumber, setMobileNumber] = useState(""); // State for filtering by mobile number
  const [tableData, setTableData] = useState([]); // State for storing filtered faculty data for display
  const [verifyingStatus, setVerifyingStatus] = useState({}); // State for tracking verification/rejection status per faculty
  const [selectedFaculty, setSelectedFaculty] = useState(null); // State for storing faculty details for popup view
  const [rejectingFacultyId, setRejectingFacultyId] = useState(null); // State for tracking faculty ID being rejected
  const [rejectionRemarks, setRejectionRemarks] = useState(""); // State for storing rejection remarks

  // -------------------
  // URL Query Parameters
  // -------------------
  const location = useLocation(); // Gets the current location object from React Router
  const queryParams = new URLSearchParams(location.search); // Parses query parameters from the URL
  const username = queryParams.get("username") || "Guest"; // Retrieves username from query params, defaults to "Guest"

  // -------------------
  // Domain Options
  // -------------------
  // Defines domain options for major and minor domain filters
  const domainOptions = {
    "Forest & Wildlife": [ // Major domain with corresponding minor domains
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
    Environment: [ // Major domain with corresponding minor domains
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
    "Disaster Management": [ // Major domain with corresponding minor domains
      "Forest Fire Management & Damage assessment",
      "Cyclone",
      "Flood",
      "Desertification",
      "Others",
    ],
    "Human Resource Development": [ // Major domain with corresponding minor domains
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
    "Health and Fitness": [ // Major domain with corresponding minor domains
      "First Aid",
      "Counselling",
      "Physical, mental and Social Health",
      "Stress Management",
      "Yoga and Meditation",
      "Others",
    ],
    "Ethics and Public Governance": [ // Major domain with corresponding minor domains
      "Public administration, PublicGrievance and Public Finance",
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
    "Jurisprudence (Acts and Rules)": [ // Major domain with corresponding minor domains
      "The Bharatiya Nagarik Suraksha Sanhita (BNSS)",
      "Bharatiya Nyaya Sanhita (BNS)",
      "Bharatiya Sakshya Adhiniyam (BSA)",
      "POSH Act, 2013",
      "Right to Information (RTI) Act, 2005",
      "Cyber Security Laws",
      "Others",
    ],
    "CCS Rules and Regulation": [ // Major domain with corresponding minor domains
      "Service Rules and matters",
      "Conduct Rules",
      "Disciplinary Proceedings",
      "Others",
    ],
    "Media Management": [ // Major domain with corresponding minor domains
      "The Art of Interacting with Print and Electronic Media",
      "Role of Media",
      "Media Relations and Image Management",
      "Proactive Media Engagement",
      "Social Media Management",
      "Others",
    ],
  };

  // -------------------
  // Data Fetching
  // -------------------
  /**
   * Fetches unverified faculty records and applies filters
   */
  useEffect(() => {
    const fetchUnverifiedFaculties = async () => {
      try {
        // Fetches all faculty records from the backend
        const response = await axios.get(`http://${ip}:${port}/api/faculty/getAllFaculties`);
        // Filters for unverified faculties only
        const unverifiedFaculties = response.data.filter((faculty) => !faculty.verified);

        // Applies client-side filtering based on state
        const filteredData = unverifiedFaculties.filter((faculty) => {
          return (
            // Matches faculty type (case-insensitive)
            (!facultyType || faculty.facultyType.toLowerCase().includes(factoryType.toLowerCase())) &&
            // Matches name (case-insensitive)
            (!name || faculty.name.toLowerCase().includes(name.toLowerCase())) &&
            // Matches exact year of allotment
            (!yearOfAllotment || faculty.yearOfAllotment === yearOfAllotment) &&
            // Matches email (case-insensitive)
            (!email || faculty.email?.toLowerCase().includes(email.toLowerCase())) &&
            // Matches status
            (!status || faculty.status === status) &&
            // Matches modules handled (case-insensitive, partial match)
            (!modulesHandled || faculty.modulesHandled?.some((m) => m.toLowerCase().includes(modulesHandled.toLowerCase()))) &&
            // Matches all selected major domains
            (majorDomains.length === 0 || majorDomains.every((md) => faculty.majorDomains?.includes(md))) &&
            // Matches all selected minor domains
            (minorDomains.length === 0 || minorDomains.every((md) => faculty.minorDomains?.includes(md))) &&
            // Matches area of expertise (case-insensitive)
            (!areaOfExpertise || faculty.areasOfExpertise?.toLowerCase().includes(areaOfExpertise.toLowerCase())) &&
            // Matches institution (case-insensitive)
            (!institution || faculty.institution?.toLowerCase().includes(institution.toLowerCase())) &&
            // Matches mobile number (exact match)
            (!mobileNumber || faculty.mobileNumber?.includes(mobileNumber)) &&
            // Matches domain knowledge (case-insensitive)
            (!domainKnowledge || faculty.domainKnowledge?.toLowerCase().includes(domainKnowledge.toLowerCase()))
          );
        });

        // Updates table data if filtered results exist, else clears table
        if (filteredData.length > 0) {
          setTableData(filteredData);
        } else {
          setTableData([]);
        }
      } catch (error) {
        // Clears table and logs error on fetch failure
        setTableData([]);
        console.error("Error fetching unverified faculties:", error);
      }
    };

    // Triggers fetch when any filter state changes
    fetchUnverifiedFaculties();
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

  // -------------------
  // Verification Handler
  // -------------------
  /**
   * Verifies a faculty record
   * @param {string} facultyId - The ID of the faculty to verify
   */
  const handleVerifyFaculty = async (facultyId) => {
    // Updates verification status to indicate processing
    setVerifyingStatus((prev) => ({
      ...prev,
      [facultyId]: "Verifying...",
    }));

    try {
      // Sends verification request to backend
      const response = await axios.put(`http://${ip}:${port}/api/faculty/verifyFaculty/${facultyId}`);
      if (response.data.success) {
        // Shows success notification
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty verified successfully!",
        });
        // Updates status to verified
        setVerifyingStatus((prev) => ({
          ...prev,
          [facultyId]: "Verified",
        }));
        // Removes verified faculty from table
        setTableData((prevData) => prevData.filter((faculty) => faculty._id !== facultyId));
        // Clears status after 2 seconds
        setTimeout(() => {
          setVerifyingStatus((prev) => ({
            ...prev,
            [facultyId]: "",
          }));
        }, 2000);
      } else {
        // Shows error notification if verification fails
        Swal.fire({
          icon: "error",
          title: "Failed to Verify",
          text: response.data.message || "Failed to verify faculty. Please try again.",
        });
        // Updates status to indicate failure
        setVerifyingStatus((prev) => ({
          ...prev,
          [facultyId]: "Failed to Verify",
        }));
      }
    } catch (error) {
      // Logs error and shows detailed error message
      console.error("Error verifying faculty:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.message === "Network Error" ? "Unable to connect to the server. Please check your network connection." : "An unexpected error occurred while verifying the faculty.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      // Updates status to indicate failure
      setVerifyingStatus((prev) => ({
        ...prev,
        [facultyId]: "Failed to Verify",
      }));
    }
  };

  // -------------------
  // Rejection Handlers
  // -------------------
  /**
   * Initiates rejection process for a faculty
   * @param {string} facultyId - The ID of the faculty to reject
   */
  const handleRejectFaculty = (facultyId) => {
    // Sets faculty ID for rejection and clears remarks
    setRejectingFacultyId(facultyId);
    setRejectionRemarks("");
  };

  /**
   * Submits rejection with remarks
   */
  const submitRejection = async () => {
    // Validates that remarks are provided
    if (!rejectionRemarks.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please provide rejection remarks.",
      });
      return;
    }

    try {
      // Sends rejection request with remarks to backend
      const response = await axios.post(`http://${ip}:${port}/api/faculty/rejectFacultyVerification/${rejectingFacultyId}`, {
        rejectionRemarks,
      });

      if (response.data.success) {
        // Shows success notification
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Faculty rejected successfully!",
        });
        // Removes rejected faculty from table
        setTableData((prevData) => prevData.filter((faculty) => faculty._id !== rejectingFacultyId));
        // Updates status to rejected
        setVerifyingStatus((prev) => ({
          ...prev,
          [rejectingFacultyId]: "Rejected",
        }));
        // Clears status after 2 seconds
        setTimeout(() => {
          setVerifyingStatus((prev) => ({
            ...prev,
            [rejectingFacultyId]: "",
          }));
        }, 2000);
      } else {
        // Shows error notification if rejection fails
        Swal.fire({
          icon: "error",
          title: "Failed to Reject",
          text: response.data.message || "Failed to reject faculty. Please try again.",
        });
        // Updates status to indicate failure
        setVerifyingStatus((prev) => ({
          ...prev,
          [rejectingFacultyId]: "Failed to Reject",
        }));
      }
    } catch (error) {
      // Logs error and shows detailed error message
      console.error("Error rejecting faculty:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.message === "Network Error" ? "Unable to connect to the server. Please check your network connection." : "An unexpected error occurred while rejecting the faculty.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      // Updates status to indicate failure
      setVerifyingStatus((prev) => ({
        ...prev,
        [rejectingFacultyId]: "Failed to Reject",
      }));
    } finally {
      // Clears rejection modal
      setRejectingFacultyId(null);
    }
  };

  // -------------------
  // Popup Content Renderer
  // -------------------
  /**
   * Renders faculty details in a popup table
   * @param {Object} data - Faculty data to display
   * @returns {JSX.Element[]} Table rows with faculty details
   */
  const renderPopupContent = (data) => {
    // Helper function to render values recursively
    const renderValue = (value, key) => {
      // Handles photograph field as an image
      if (key === "photograph" && typeof value === "string") {
        const imageUrl = `http://${ip}:${port}/Uploads/${value.split("\\").pop()}`; // Constructs image URL
        return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }} />; // Renders image
      }
      // Handles arrays
      if (Array.isArray(value)) {
        return (
          <ul>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item, key)}</li> // Recursively renders array items
            ))}
          </ul>
        );
      }
      // Handles nested objects
      if (typeof value === "object" && value !== null) {
        return (
          <ul>
            {Object.entries(value)
              .filter(([subKey]) => subKey !== "_id") // Excludes _id fields
              .map(([subKey, val]) => (
                <li key={subKey}>
                  <strong>{subKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</strong> {renderValue(val, subKey)} {/* Renders nested fields */}
                </li>
              ))}
          </ul>
        );
      }
      // Renders primitive values or fallback
      return value?.toString() || "-";
    };

    // Maps faculty data to table rows
    const allFields = Object.entries(data)
      .filter(([key]) => key.toLowerCase() !== "_id" && key.toLowerCase() !== "conduct") // Excludes _id and conduct fields
      .map(([key, value]) => (
        <tr key={key}>
          <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</td> {/* Formats key as title case */}
          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td> {/* Renders value */}
        </tr>
      ));

    // Returns fields or a placeholder if none exist
    return allFields.length > 0 ? allFields : <tr><td colSpan="2">No additional details available</td></tr>;
  };

  // -------------------
  // Filter Handler
  // -------------------
  /**
   * Clears all filter inputs and resets table data
   */
  const handleClearFilter = () => {
    setFacultyType(""); // Clears faculty type filter
    setName(""); // Clears name filter
    setYearOfAllotment(""); // Clears year of allotment filter
    setEmail(""); // Clears email filter
    setDomainKnowledge(""); // Clears domain knowledge filter
    setAreaOfExpertise(""); // Clears area of expertise filter
    setInstitution(""); // Clears institution filter
    setStatus(""); // Clears status filter
    setModulesHandled(""); // Clears modules handled filter
    setMajorDomains([]); // Clears major domains filter
    setMinorDomains([]); // Clears minor domains filter
    setMobileNumber(""); // Clears mobile number filter
    setTableData([]); // Clears table data
    setVerifyingStatus({}); // Clears verification status
  };

  // -------------------
  // Popup Handlers
  // -------------------
  /**
   * Opens popup with faculty details
   * @param {Object} faculty - Faculty data to display
   */
  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty); // Sets faculty for popup display
  };

  /**
   * Closes the faculty details popup
   */
  const closePopup = () => {
    setSelectedFaculty(null); // Clears selected faculty to close popup
  };

  // -------------------
  // Styles
  // -------------------
  /**
   * Styles for the faculty details popup
   */
  const popupStyles = {
    popup: { // Overlay for popup
      position: "fixed", // Fixed position to cover screen
      top: 0, // Aligns to top
      left: 0, // Aligns to left
      width: "100%", // Full width
      height: "100%", // Full height
      background: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
      display: "flex", // Flexbox for centering
      justifyContent: "center", // Centers horizontally
      alignItems: "center", // Centers vertically
      zIndex: 1000, // Ensures popup is above other content
    },
    popupContent: { // Content container
      background: "white", // White background
      padding: "20px", // Padding
      borderRadius: "10px", // Rounded corners
      width: "90%", // Responsive width
      maxWidth: "800px", // Maximum width
      maxHeight: "80vh", // Maximum height with scroll
      overflowY: "auto", // Vertical scrollbar if needed
      position: "relative", // Relative positioning for children
    },
    popupHeader: { // Header style
      marginBottom: "15px", // Bottom margin
      color: "#333", // Dark text color
    },
    closeButton: { // Close button style
      marginTop: "15px", // Top margin
      padding: "8px 16px", // Padding
      backgroundColor: "#dc3545", // Red background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "5px", // Rounded corners
      cursor: "pointer", // Pointer cursor
    },
    table: { // Table style
      width: "100%", // Full width
      borderCollapse: "collapse", // Collapses borders
    },
  };

  /**
   * Styles for filter controls
   */
  const filterStyles = {
    filterContainer: { // Container for filter inputs
      padding: "20px", // Padding
      backgroundColor: "#f9f9f9", // Light gray background
      borderRadius: "8px", // Rounded corners
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
      marginBottom: "20px", // Bottom margin
    },
    filterGrid: { // Grid layout for filter inputs
      display: "grid", // Grid layout
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Responsive columns
      gap: "15px", // Space between items
      marginBottom: "20px", // Bottom margin
    },
    filterItem: { // Individual filter item
      display: "flex", // Flexbox layout
      flexDirection: "column", // Stack vertically
    },
    label: { // Label style
      marginBottom: "5px", // Bottom margin
      fontWeight: "500", // Medium weight
      color: "#333", // Dark text color
    },
    input: { // Input field style
      padding: "8px 12px", // Padding
      border: "1px solid #ddd", // Light border
      borderRadius: "4px", // Rounded corners
      fontSize: "14px", // Font size
      outline: "none", // Removes default outline
      transition: "border-color 0.2s", // Smooth border color transition
    },
    inputFocus: { // Focused input border
      borderColor: "#007BFF", // Blue border on focus
    },
    buttonContainer: { // Container for clear button
      display: "flex", // Flexbox layout
      justifyContent: "flex-end", // Aligns to right
    },
    clearButton: { // Clear filter button
      padding: "8px 16px", // Padding
      backgroundColor: "#6c757d", // Gray background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      cursor: "pointer", // Pointer cursor
      transition: "background-color 0.2s", // Smooth color transition
    },
    clearButtonHover: { // Hover state for clear button
      backgroundColor: "#5a6268", // Darker gray on hover
    },
  };

  /**
   * Styles for action buttons
   */
  const viewButtonStyles = {
    viewButton: { // View details button
      padding: "6px 12px", // Padding
      backgroundColor: "#007BFF", // Blue background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      cursor: "pointer", // Pointer cursor
      transition: "background-color 0.2s", // Smooth color transition
    },
    viewButtonHover: { // Hover state for view button
      backgroundColor: "#0056b3", // Darker blue on hover
    },
    verifyButton: { // Verify button
      padding: "6px 12px", // Padding
      backgroundColor: "#28a745", // Green background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      cursor: "pointer", // Pointer cursor
      transition: "background-color 0.2s", // Smooth color transition
      marginLeft: "10px", // Left margin
    },
    verifyButtonHover: { // Hover state for verify button
      backgroundColor: "#218838", // Darker green on hover
    },
  };

  /**
   * Styles for reject button
   */
  const rejectButtonStyles = {
    rejectButton: { // Reject button
      padding: "6px 12px", // Padding
      backgroundColor: "#dc3545", // Red background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      cursor: "pointer", // Pointer cursor
      transition: "background-color 0.2s", // Smooth color transition
      marginLeft: "10px", // Left margin
    },
    rejectButtonHover: { // Hover state for reject button
      backgroundColor: "#c82333", // Darker red on hover
    },
  };

  /**
   * General component styles
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
    verifyingStatus: { // Verification status display
      marginTop: "5px", // Top margin
      fontSize: "12px", // Smaller font
      color: "#555", // Gray color
      display: "flex", // Flexbox layout
      alignItems: "center", // Centers vertically
      gap: "5px", // Space between items
    },
    loadingIcon: { fontSize: "14px", color: "#007BFF" }, // Loading icon style
    successIcon: { fontSize: "14px", color: "#28a745" }, // Success icon style
    errorIcon: { fontSize: "14px", color: "#dc3545" }, // Error icon style
  };

  // -------------------
  // JSX Rendering
  // -------------------
  return (
    <>
      {/* Wraps content in a fragment to avoid extra DOM nodes */}
      <div className="asset-view"> {/* Main container with asset-view class */}
        {/* Meta tags for character encoding and responsive viewport */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* External stylesheets for icons */}
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" /> {/* Boxicons for sidebar */}
        <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" /> {/* Font Awesome for icons */}
        <title>CASFOS</title> {/* Page title */}

        {/* Sidebar navigation */}
        <section id="sidebar"> {/* Sidebar section */}
          <a href="#" className="brand"> {/* Brand link (placeholder) */}
            <span className="text">FACULTY VERIFIER</span> {/* Brand name */}
          </a>
          <ul className="side-menu top"> {/* Primary navigation links */}
            <li> {/* Home link */}
              <a href={`/facultyverifierdashboard?username=${encodeURIComponent(username)}`}> {/* Navigates to dashboard */}
                <i className="bx bxs-dashboard" /> {/* Dashboard icon */}
                <span className="text">Home</span> {/* Home text */}
              </a>
            </li>
            <li className="active"> {/* Faculty Verify link (active) */}
              <a href={`/facultyverify?username=${encodeURIComponent(username)}`}> {/* Navigates to current page */}
                <i className="bx bxs-doughnut-chart" /> {/* Chart icon */}
                <span className="text">Faculty Verify</span> {/* Verify text */}
              </a>
            </li>
            <li> {/* Faculty View link */}
              <a href={`/facultyverifierfacultyview?username=${encodeURIComponent(username)}`}> {/* Navigates to view page */}
                <i className="bx bxs-doughnut-chart" /> {/* Chart icon */}
                <span className="text">Faculty View</span> {/* View text */}
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

          <main> {/* Main content area */}
            <div className="dash-content"> {/* Dashboard content wrapper */}
              <div className="title"> {/* Page title */}
                <span className="text">Unverified Faculty View with Filters</span> {/* Title text */}
              </div>
              {/* Filter controls */}
              <div style={filterStyles.filterContainer}> {/* Filter container */}
                <div style={filterStyles.filterGrid}> {/* Grid for filter inputs */}
                  {/* Faculty Type filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="facultyType">Faculty Type:</label> {/* Label */}
                    <select
                      id="facultyType"
                      value={facultyType}
                      onChange={(e) => setFacultyType(e.target.value)} // Updates faculty type
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    >
                      <option value="">Select</option> {/* Placeholder option */}
                      <option value="internal">Internal</option> {/* Internal faculty */}
                      <option value="external">External</option> {/* External faculty */}
                      <option value="contract">Contract</option> {/* Contract faculty */}
                    </select>
                  </div>
                  {/* Name filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="name">Name:</label> {/* Label */}
                    <input
                      id="name"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)} // Updates name
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                  {/* Year of Allotment filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="yearOfAllotment">Year of Allotment:</label> {/* Label */}
                    <input
                      id="yearOfAllotment"
                      placeholder="YYYY"
                      value={yearOfAllotment}
                      onChange={(e) => setYearOfAllotment(e.target.value)} // Updates year
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                  {/* Email filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="email">Email:</label> {/* Label */}
                    <input
                      id="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} // Updates email
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                  {/* Status filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="status">Status:</label> {/* Label */}
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)} // Updates status
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    >
                      <option value="">Select</option> {/* Placeholder option */}
                      <option value="serving">Serving</option> {/* Serving status */}
                      <option value="retired">Retired</option> {/* Retired status */}
                    </select>
                  </div>
                  {/* Modules Handled filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="modulesHandled">Modules Handled:</label> {/* Label */}
                    <input
                      id="modulesHandled"
                      placeholder="Module Name"
                      value={modulesHandled}
                      onChange={(e) => setModulesHandled(e.target.value)} // Updates modules
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                  {/* Major Domains filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="majorDomains">Major Domains:</label> {/* Label */}
                    <select
                      id="majorDomains"
                      value={majorDomains[0] || ""} // Supports single selection
                      onChange={(e) => setMajorDomains([e.target.value])} // Updates major domains
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    >
                      <option value="">Select Major Domain</option> {/* Placeholder option */}
                      {Object.keys(domainOptions).map((domain) => (
                        <option key={domain} value={domain}>{domain}</option> // Renders major domain options
                      ))}
                    </select>
                  </div>
                  {/* Minor Domains filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="minorDomains">Minor Domains:</label> {/* Label */}
                    <select
                      id="minorDomains"
                      value={minorDomains[0] || ""} // Supports single selection
                      onChange={(e) => setMinorDomains([e.target.value])} // Updates minor domains
                      disabled={!majorDomains[0]} // Disables if no major domain selected
                      style={{
                        ...filterStyles.input,
                        opacity: !majorDomains[0] ? 0.7 : 1, // Fades when disabled
                        cursor: !majorDomains[0] ? "not-allowed" : "pointer", // Cursor style
                      }}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    >
                      <option value="">Select Minor Domain</option> {/* Placeholder option */}
                      {majorDomains[0] &&
                        domainOptions[majorDomains[0]]?.map((subDomain) => (
                          <option key={subDomain} value={subDomain}>{subDomain}</option> // Renders minor domain options
                        ))}
                    </select>
                  </div>
                  {/* Area of Expertise filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="areaOfExpertise">Areas of Expertise:</label> {/* Label */}
                    <input
                      id="areaOfExpertise"
                      placeholder="Areas of Expertise"
                      value={areaOfExpertise}
                      onChange={(e) => setAreaOfExpertise(e.target.value)} // Updates expertise
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                  {/* Institution filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="institution">Institution:</label> {/* Label */}
                    <input
                      id="institution"
                      placeholder="Institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)} // Updates institution
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                  {/* Mobile Number filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="mobileNumber">Mobile Number:</label> {/* Label */}
                    <input
                      id="mobileNumber"
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)} // Updates mobile number
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                  {/* Domain Knowledge filter */}
                  <div style={filterStyles.filterItem}>
                    <label style={filterStyles.label} htmlFor="domainKnowledge">Domain Knowledge:</label> {/* Label */}
                    <input
                      id="domainKnowledge"
                      placeholder="Domain Knowledge"
                      value={domainKnowledge}
                      onChange={(e) => setDomainKnowledge(e.target.value)} // Updates domain knowledge
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    />
                  </div>
                </div>
                <div style={filterStyles.buttonContainer}> {/* Clear filter button container */}
                  <button
                    style={filterStyles.clearButton}
                    onClick={handleClearFilter} // Clears filters
                    onMouseOver={(e) => (e.target.style.backgroundColor = filterStyles.clearButtonHover.backgroundColor)} // Hover style
                    onMouseOut={(e) => (e.target.style.borderColor = filterStyles.clearButton.backgroundColor)} // Default style
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {/* Faculty table or no-data message */}
              {tableData.length > 0 ? (
                <table className="faculty-table" style={{ marginTop: "1rem", width: "100%", borderCollapse: "collapse" }}> {/* Faculty data table */}
                  <thead>
                    <tr>
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th> {/* Name column */}
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Faculty Type</th> {/* Faculty Type column */}
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th> {/* Status column */}
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Mobile Number</th> {/* Mobile Number column */}
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th> {/* Email column */}
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Year of Allotment</th> {/* Year of Allotment column */}
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Major Domains</th> {/* Major Domains column */}
                      <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th> {/* Actions column */}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}> {/* Table row for each faculty */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.name || "-"}</td> {/* Name cell */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.facultyType || "-"}</td> {/* Faculty Type cell */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.status || "-"}</td> {/* Status cell */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.mobileNumber || "-"}</td> {/* Mobile Number cell */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.email || "-"}</td> {/* Email cell */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.yearOfAllotment || "-"}</td> {/* Year of Allotment cell */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.majorDomains?.join(", ") || "-"}</td> {/* Major Domains cell */}
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}> {/* Actions cell */}
                          <button
                            style={viewButtonStyles.viewButton}
                            onClick={() => handleViewDetails(row)} // Opens details popup
                            onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButtonHover.backgroundColor)} // Hover style
                            onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)} // Default style
                          >
                            View
                          </button>
                          <button
                            style={viewButtonStyles.verifyButton}
                            onClick={() => handleVerifyFaculty(row._id)} // Triggers verification
                            onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.verifyButtonHover.backgroundColor)} // Hover style
                            onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.verifyButton.backgroundColor)} // Default style
                            disabled={verifyingStatus[row._id] === "Verifying..."} // Disables during verification
                          >
                            Verify
                          </button>
                          <button
                            style={rejectButtonStyles.rejectButton}
                            onClick={() => handleRejectFaculty(row._id)} // Opens rejection modal
                            onMouseOver={(e) => (e.target.style.backgroundColor = rejectButtonStyles.rejectButtonHover.backgroundColor)} // Hover style
                            onMouseOut={(e) => (e.target.style.backgroundColor = rejectButtonStyles.rejectButton.backgroundColor)} // Default style
                            disabled={verifyingStatus[row._id] === "Verifying..."} // Disables during verification
                          >
                            Reject
                          </button>
                          {/* Verification status display */}
                          {verifyingStatus[row._id] && (
                            <div style={styles.verifyingStatus}>
                              {verifyingStatus[row._id] === "Verifying..." && (
                                <>
                                  <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i> {/* Loading icon */}
                                  <span>Verifying...</span> {/* Verifying text */}
                                </>
                              )}
                              {verifyingStatus[row._id] === "Verified" && (
                                <>
                                  <i className="bx bx-check-circle" style={styles.successIcon}></i> {/* Success icon */}
                                  <span>Verified</span> {/* Verified text */}
                                </>
                              )}
                              {verifyingStatus[row._id] === "Rejected" && (
                                <>
                                  <i className="bx bx-x-circle" style={styles.errorIcon}></i> {/* Error icon */}
                                  <span>Rejected</span> {/* Rejected text */}
                                </>
                              )}
                              {verifyingStatus[row._id] === "Failed to Verify" && (
                                <>
                                  <i className="bx bx-error-circle" style={styles.errorIcon}></i> {/* Error icon */}
                                  <span>Failed to Verify</span> {/* Failed verify text */}
                                </>
                              )}
                              {verifyingStatus[row._id] === "Failed to Reject" && (
                                <>
                                  <i className="bx bx-error-circle" style={styles.errorIcon}></i> {/* Error icon */}
                                  <span>Failed to Reject</span> {/* Failed reject text */}
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "red", marginTop: "1rem" }}>No unverified faculty records found matching the criteria.</p> 
              )}
            </div>
          </main>
        </section>

        {/* Faculty details popup */}
        {selectedFaculty && (
          <div style={popupStyles.popup}> {/* Popup overlay */}
            <div style={popupStyles.popupContent}> {/* Popup content */}
              <h3 style={popupStyles.popupHeader}>Faculty Details</h3> {/* Popup title */}
              <table style={popupStyles.table}> {/* Details table */}
                <tbody>{renderPopupContent(selectedFaculty)}</tbody> {/* Renders faculty details */}
              </table>
              <button
                style={popupStyles.closeButton}
                onClick={closePopup} // Closes popup
                onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")} // Hover style
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")} // Default style
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Rejection remarks modal */}
        {rejectingFacultyId && (
          <div style={popupStyles.popup}> {/* Rejection modal overlay */}
            <div style={popupStyles.popupContent}> {/* Modal content */}
              <h3 style={popupStyles.popupHeader}>Rejection Remarks</h3> {/* Modal title */}
              <textarea
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)} // Updates remarks
                placeholder="Enter rejection remarks here..."
                style={{
                  width: "100%", // Full width
                  minHeight: "100px", // Minimum height
                  padding: "10px", // Padding
                  border: "1px solid #ddd", // Light border
                  borderRadius: "4px", // Rounded corners
                  marginBottom: "15px", // Bottom margin
                  resize: "vertical", // Vertical resize only
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}> {/* Button container */}
                <button
                  style={{
                    ...popupStyles.closeButton,
                    backgroundColor: "#6c757d", // Gray background
                  }}
                  onClick={() => setRejectingFacultyId(null)} // Cancels rejection
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")} // Hover style
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")} // Default style
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...popupStyles.closeButton,
                    backgroundColor: "#28a745", // Green background
                  }}
                  onClick={submitRejection} // Submits rejection
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#218738")} // Hover style
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")} // Default style
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Exports the component as default
export default FacultyVerify;
