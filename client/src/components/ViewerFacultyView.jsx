/**
 * FacultyView.jsx
 *
 * This React component allows users in the Viewer role of the Central Academy for State Forest Service (CASFOS) system
 * to view and filter faculty details based on various criteria such as faculty type, name, email, and domains of expertise.
 *
 * Features:
 * - Displays a filter form with input fields and dropdowns for faculty attributes (e.g., Faculty Type, Major/Minor Domains).
 * - Fetches filtered faculty data from the backend using Axios and displays it in a table.
 * - Supports viewing detailed faculty information in a popup, including nested objects and images.
 * - Includes a responsive sidebar for navigation to other Viewer tasks (e.g., dashboard, asset view).
 * - Provides a clear filter button to reset all inputs and clear the table.
 * - Uses a comprehensive domain options object for categorizing faculty expertise.
 * - Integrates with backend APIs for filtering faculty data.
 * - Implements inline styles for filters, table, and popup, with hover effects for interactivity.
 *
 * @returns {JSX.Element} The FacultyView component
 */

// -------------------
// Imports
// -------------------
import React, { useEffect, useState } from "react"; // Imports React and hooks for state and lifecycle management
import axios from "axios"; // Imports Axios for making HTTP requests to the backend
import { useLocation } from "react-router-dom"; // Imports useLocation for accessing query parameters

// -------------------
// Main Component
// -------------------
/**
 * Faculty view and filter component for Viewer role
 * @returns {JSX.Element}
 */
const FacultyView = () => {
  // -------------------
  // Configuration
  // -------------------
  const port = import.meta.env.VITE_API_PORT; // Retrieves API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // Retrieves API IP address from environment variables

  // -------------------
  // State and Routing
  // -------------------
  const [facultyType, setFacultyType] = useState(""); // State for faculty type filter
  const [name, setName] = useState(""); // State for name filter
  const [yearOfAllotment, setYearOfAllotment] = useState(""); // State for year of allotment filter
  const [email, setEmail] = useState(""); // State for email filter
  const [domainKnowledge, setDomainKnowledge] = useState(""); // State for domain knowledge filter
  const [areaOfExpertise, setAreaOfExpertise] = useState(""); // State for area of expertise filter
  const [institution, setInstitution] = useState(""); // State for institution filter
  const [status, setStatus] = useState(""); // State for status filter
  const [modulesHandled, setModulesHandled] = useState(""); // State for modules handled filter
  const [majorDomains, setMajorDomains] = useState([]); // State for major domains filter (array)
  const [minorDomains, setMinorDomains] = useState([]); // State for minor domains filter (array)
  const [mobileNumber, setMobileNumber] = useState(""); // State for mobile number filter
  const [tableData, setTableData] = useState([]); // State for filtered faculty data
  const [message, setMessage] = useState(""); // State for error or no-data messages
  const [selectedFaculty, setSelectedFaculty] = useState(null); // State for selected faculty in popup
  
  const location = useLocation(); // Gets the current location object from React Router
  const queryParams = new URLSearchParams(location.search); // Parses query parameters from the URL
  const username = queryParams.get("username") || "Guest"; // Retrieves username from query params, defaults to "Guest"

  // -------------------
  // Domain Options
  // -------------------
  /**
   * Object containing domain categories and their subdomains for filtering
   */
  const domainOptions = {
    "Forest & Wildlife": [ // Forest & Wildlife category
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
    Environment: [ // Environment category
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
    "Disaster Management": [ // Disaster Management category
      "Forest Fire Management & Damage assessment",
      "Cyclone",
      "Flood",
      "Desertification",
      "Others",
    ],
    "Human Resource Development": [ // Human Resource Development category
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
    "Health and Fitness": [ // Health and Fitness category
      "First Aid",
      "Counselling",
      "Physical, mental and Social Health",
      "Stress Management",
      "Yoga and Meditation",
      "Others",
    ],
    "Ethics and Public Governance": [ // Ethics and Public Governance category
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
    "Jurisprudence (Acts and Rules)": [ // Jurisprudence category
      "The Bharatiya Nagarik Suraksha Sanhita (BNSS)",
      "Bharatiya Nyaya Sanhita (BNS)",
      "Bharatiya Sakshya Adhiniyam (BSA)",
      "POSH Act, 2013",
      "Right to Information (RTI) Act, 2005",
      "Cyber Security Laws",
      "Others",
    ],
    "CCS Rules and Regulation": [ // CCS Rules category
      "Service Rules and matters",
      "Conduct Rules",
      "Disciplinary Proceedings",
      "Others",
    ],
    "Media Management": [ // Media Management category
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
   * Fetches filtered faculty data based on current filter states
   */
  useEffect(() => {
    const handleApplyFilter = async () => {
      try {
        // Sends POST request to filter faculties with current filter values
        const response = await axios.post(`http://${ip}:${port}/api/faculty/filterFaculties`, {
          facultyType: facultyType || undefined, // Includes facultyType if not empty
          name: name || undefined, // Includes name if not empty
          yearOfAllotment: yearOfAllotment || undefined, // Includes yearOfAllotment if not empty
          email: email || undefined, // Includes email if not empty
          domainKnowledge: domainKnowledge || undefined, // Includes domainKnowledge if not empty
          areaOfExpertise: areaOfExpertise || undefined, // Includes areaOfExpertise if not empty
          institution: institution || undefined, // Includes institution if not empty
          status: status || undefined, // Includes status if not empty
          modulesHandled: modulesHandled ? [modulesHandled] : undefined, // Includes modulesHandled as array if not empty
          majorDomains: majorDomains.length > 0 ? majorDomains : undefined, // Includes majorDomains if not empty
          minorDomains: minorDomains.length > 0 ? minorDomains : undefined, // Includes minorDomains if not empty
          mobileNumber: mobileNumber || undefined, // Includes mobileNumber if not empty
        });

        if (response.data.length > 0) { // Checks if data is returned
          setTableData(response.data); // Updates table data
          setMessage(""); // Clears any error message
        } else {
          setTableData([]); // Clears table data
          setMessage("No matching records found."); // Sets no-data message
        }
      } catch (error) {
        setTableData([]); // Clears table data
        setMessage("No matching records."); // Sets error message
        console.error("Error fetching filtered data:", error); // Logs error
      }
    };
    handleApplyFilter(); // Triggers filter on mount and filter changes
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
  ]); // Dependencies for re-running effect

  // -------------------
  // Helper Functions
  // -------------------
  /**
   * Renders faculty details in a popup table, handling nested objects, arrays, and images
   * @param {Object} data - Faculty data
   * @returns {JSX.Element[]} Table rows
   */
  const renderPopupContent = (data) => {
    const renderValue = (value, key) => {
      if (key === "photograph" && typeof value === "string") { // Handles photograph field
        const imageUrl = `http://${ip}:${port}/Uploads/${value.split("\\").pop()}`; // Constructs image URL
        return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }} />; // Renders image
      }

      if (Array.isArray(value)) { // Handles arrays
        return (
          <ul>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item, key)}</li> // Recursively renders array items
            ))}
          </ul>
        );
      }

      if (typeof value === "object" && value !== null) { // Handles nested objects
        return (
          <ul>
            {Object.entries(value)
              .filter(([key]) => key !== "_id") // Excludes _id
              .map(([key, val]) => (
                <li key={key}>
                  <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</strong> {renderValue(val, key)} // Renders key-value pair
                </li>
              ))}
          </ul>
        );
      }

      return value?.toString() || "-"; // Converts value to string or shows "-"
    };

    return Object.entries(data)
      .filter(([key]) => key !== "_id" && key !== "conduct") // Excludes _id and conduct
      .map(([key, value]) => (
        <tr key={key}>
          <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>
            {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}: // Formats key
          </td>
          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td> // Renders value
        </tr>
      ));
  };

  /**
   * Clears all filter inputs and resets table data
   */
  const handleClearFilter = () => {
    setFacultyType(""); // Resets faculty type
    setName(""); // Resets name
    setYearOfAllotment(""); // Resets year of allotment
    setEmail(""); // Resets email
    setDomainKnowledge(""); // Resets domain knowledge
    setAreaOfExpertise(""); // Resets area of expertise
    setInstitution(""); // Resets institution
    setStatus(""); // Resets status
    setModulesHandled(""); // Resets modules handled
    setMajorDomains([]); // Resets major domains
    setMinorDomains([]); // Resets minor domains
    setMobileNumber(""); // Resets mobile number
    setTableData([]); // Clears table data
    setMessage(""); // Clears message
  };

  /**
   * Opens popup with selected faculty details
   * @param {Object} faculty - Faculty data
   */
  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty); // Sets selected faculty for popup
  };

  /**
   * Closes the faculty details popup
   */
  const closePopup = () => {
    setSelectedFaculty(null); // Clears selected faculty
  };

  // -------------------
  // Styles
  // -------------------
  /**
   * Styles for popup
   */
  const popupStyles = {
    popup: { // Popup overlay
      position: "fixed", // Fixed positioning
      top: 0, // Fullscreen
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
      display: "flex", // Flexbox layout
      justifyContent: "center", // Centered horizontally
      alignItems: "center", // Centered vertically
      zIndex: 1000, // High z-index
    },
    popupContent: { // Popup content
      background: "white", // White background
      padding: "20px", // Padding
      borderRadius: "10px", // Rounded corners
      width: "90%", // Responsive width
      maxWidth: "600px", // Maximum width
      maxHeight: "80vh", // Maximum height
      overflowY: "auto", // Scrollable
      position: "relative", // Relative for close button
    },
    popupHeader: { // Popup header
      marginBottom: "15px", // Bottom margin
      color: "#333", // Dark text
    },
    closeButton: { // Close button
      marginTop: "15px", // Top margin
      padding: "8px 16px", // Padding
      backgroundColor: "#dc3545", // Red background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "5px", // Rounded corners
      cursor: "pointer", // Pointer cursor
    },
    table: { // Popup table
      width: "100%", // Full width
      borderCollapse: "collapse", // Collapsed borders
    },
  };

  /**
   * Styles for filter form
   */
  const filterStyles = {
    filterContainer: { // Filter form container
      padding: "20px", // Padding
      backgroundColor: "#f9f9f9", // Light gray background
      borderRadius: "8px", // Rounded corners
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
      marginBottom: "20px", // Bottom margin
    },
    filterGrid: { // Grid for filter inputs
      display: "grid", // Grid layout
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Responsive columns
      gap: "15px", // Space between inputs
      marginBottom: "20px", // Bottom margin
    },
    filterItem: { // Individual filter item
      display: "flex", // Flexbox layout
      flexDirection: "column", // Vertical stack
    },
    label: { // Input label
      marginBottom: "5px", // Bottom margin
      fontWeight: "500", // Medium weight
      color: "#333", // Dark text
    },
    input: { // Input field
      padding: "8px 12px", // Padding
      border: "1px solid #ddd", // Light border
      borderRadius: "4px", // Rounded corners
      fontSize: "14px", // Font size
      outline: "none", // No outline
      transition: "border-color 0.2s", // Smooth border transition
    },
    inputFocus: { // Focused input border
      borderColor: "#007BFF", // Blue border
    },
    buttonContainer: { // Clear button container
      display: "flex", // Flexbox layout
      justifyContent: "flex-end", // Align right
    },
    clearButton: { // Clear filter button
      padding: "8px 16px", // Padding
      backgroundColor: "#6c757d", // Gray background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      cursor: "pointer", // Pointer cursor
      transition: "background-color 0.2s", // Smooth transition
    },
    clearButtonHover: { // Hover state for clear button
      backgroundColor: "#5a6268", // Darker gray
    },
  };

  /**
   * Styles for view button
   */
  const viewButtonStyles = {
    viewButton: { // View details button
      padding: "6px 12px", // Padding
      backgroundColor: "#007BFF", // Blue background
      color: "white", // White text
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      cursor: "pointer", // Pointer cursor
      transition: "background-color 0.2s", // Smooth transition
    },
    viewButtonHover: { // Hover state for view button
      backgroundColor: "#0056b3", // Darker blue
    },
  };

  /**
   * General styles
   */
  const styles = {
    usernameContainer: { // Username display container
      display: "flex", // Flexbox layout
      alignItems: "center", // Vertically centered
      gap: "10px", // Space between items
      fontSize: "14px", // Font size
      color: "#555", // Gray text
    },
    userIcon: { // User icon
      fontSize: "30px", // Icon size
      color: "#007BFF", // Blue
    },
    username: { // Username text
      fontWeight: "bold", // Bold
      fontSize: "18px", // Font size
    },
    rowContainer: { // Unused row container
      display: "flex", // Flexbox layout
      flexWrap: "wrap", // Wraps items
      gap: "20px", // Space between items
      margin: "20px 0", // Vertical margin
      justifyContent: "center", // Centered
    },
    userContainer: { // Unused user container
      flex: 1, // Takes available space
      padding: "20px", // Padding
      borderRadius: "10px", // Rounded corners
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow
      backgroundColor: "#fff", // White background
      minWidth: "300px", // Minimum width
    },
    amcContainer: { // Unused AMC container
      flex: 1, // Takes available space
      padding: "20px", // Padding
      borderRadius: "10px", // Rounded corners
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow
      backgroundColor: "#fff", // White background
      minWidth: "300px", // Minimum width
      maxHeight: "300px", // Maximum height
      overflowY: "auto", // Scrollable
    },
    cardContainer: { // Unused card container
      display: "flex", // Flexbox layout
      gap: "15px", // Space between items
      flexWrap: "wrap", // Wraps items
    },
    card: { // Unused card
      flex: "1", // Takes available space
      padding: "15px", // Padding
      borderRadius: "10px", // Rounded corners
      textAlign: "center", // Centered text
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Shadow
      minWidth: "150px", // Minimum width
    },
    icon: { // Unused icon
      width: "50px", // Fixed width
      height: "50px", // Fixed height
      borderRadius: "50%", // Circular
      margin: "0 auto 10px", // Centered with bottom margin
      display: "flex", // Flexbox layout
      justifyContent: "center", // Centered horizontally
      alignItems: "center", // Centered vertically
    },
    iconStyle: { // Unused icon style
      fontSize: "24px", // Icon size
      color: "#fff", // White
    },
    container: { // Unused container
      maxWidth: "50%", // Maximum width
      margin: "20px auto", // Centered
      padding: "20px", // Padding
      borderRadius: "10px", // Rounded corners
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow
      backgroundColor: "#fff", // White background
    },
    container2: { // Unused container
      maxWidth: "800px", // Maximum width
      margin: "20px auto", // Centered
      padding: "20px", // Padding
      borderRadius: "10px", // Rounded corners
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow
      backgroundColor: "#fff", // White background
    },
    header: { // Unused header
      display: "flex", // Flexbox layout
      justifyContent: "center", // Centered horizontally
      alignItems: "center", // Centered vertically
      marginBottom: "10px", // Bottom margin
      textAlign: "center", // Centered text
    },
    subtitle: { // Unused subtitle
      color: "#666", // Gray text
      fontSize: "14px", // Font size
      marginBottom: "20px", // Bottom margin
    },
    change: { // Unused change text
      color: "#666", // Gray text
      fontSize: "12px", // Font size
    },
    amcTable: { // Unused AMC table
      width: "100%", // Full width
      borderCollapse: "collapse", // Collapsed borders
    },
    amcTableHeader: { // Unused AMC table header
      position: "sticky", // Sticky positioning
      top: 0, // Sticks to top
      backgroundColor: "#fff", // White background
      zIndex: 2, // Above content
    },
    amcTableCell: { // Unused AMC table cell
      padding: "10px", // Padding
      border: "1px solid #ddd", // Light border
      textAlign: "left", // Left-aligned text
    },
  };

  /**
   * Module styles (unused)
   */
  const moduleStyle2 = {
    width: "60%", // Fixed width
    padding: "10px", // Padding
    backgroundColor: "white", // White background
    borderRadius: "15px", // Rounded corners
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow
    textAlign: "center", // Centered text
  };

  const moduleStyle = {
    width: "45%", // Fixed width
    padding: "20px", // Padding
    backgroundColor: "white", // White background
    borderRadius: "15px", // Rounded corners
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow
    textAlign: "center", // Centered text
  };

  const moduleStyle3 = {
    width: "50%", // Fixed width
    padding: "20px", // Padding
    backgroundColor: "white", // White background
    borderRadius: "15px", // Rounded corners
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow
    textAlign: "center", // Centered text
  };

  /**
   * Title style
   */
  const titleStyle = {
    marginBottom: "15px", // Bottom margin
    fontSize: "1.2em", // Font size
    color: "#28a745", // Green text
  };

  // -------------------
  // JSX Rendering
  // -------------------
  return (
    <>
      <div className="asset-view"> {/* Main container */}
        {/* Meta tags for character encoding and responsive viewport */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* External stylesheets for icons */}
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" /> {/* Boxicons */}
        <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" /> {/* Font Awesome */}
        <title>CASFOS</title> {/* Page title */}

        {/* Sidebar navigation */}
        <section id="sidebar"> {/* Sidebar section */}
          <a href="#" className="brand"> {/* Brand link (placeholder) */}
            <span className="text">VIEWER</span> {/* Brand name */}
          </a>
          <ul className="side-menu top"> {/* Primary navigation links */}
            <li> {/* Home link */}
              <a href={`/viewerdashboard?username=${encodeURIComponent(username)}`}> {/* Navigates to dashboard */}
                <i className="bx bxs-dashboard" /> {/* Dashboard icon */}
                <span className="text">Home</span> {/* Home text */}
              </a>
            </li>
            <li> {/* Asset View link */}
              <a href={`/viewerassetview?username=${encodeURIComponent(username)}`}> {/* Navigates to asset view */}
                <i className="bx bxs-shopping-bag-alt" /> {/* Shopping bag icon */}
                <span className="text">Asset View</span> {/* Asset View text */}
              </a>
            </li>
            <li className="active"> {/* Faculty View link (active) */}
              <a href={`/viewerfacultyview?username=${encodeURIComponent(username)}`}> {/* Navigates to current page */}
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

          <main> {/* Main content */}
            <div className="dash-content"> {/* Dashboard content */}
              <div className="title"> {/* Page title */}
                <span className="text">Faculty View with Filters</span> {/* Title text */}
              </div>
              <div style={filterStyles.filterContainer}> {/* Filter form container */}
                <div style={filterStyles.filterGrid}> {/* Filter inputs grid */}
                  <div style={filterStyles.filterItem}> {/* Faculty Type filter */}
                    <label style={filterStyles.label} htmlFor="facultyType">Faculty Type:</label> {/* Label */}
                    <select
                      id="facultyType"
                      value={facultyType}
                      onChange={(e) => setFacultyType(e.target.value)} // Updates facultyType
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    >
                      <option value="">All</option> {/* Default option */}
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> {/* Name filter */}
                    <label style={filterStyles.label} htmlFor="name">Name:</label> {/* Label */}
                    <input
                      id="name"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)} // Updates name
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                  <div style={filterStyles.filterItem}> {/* Year of Allotment filter */}
                    <label style={filterStyles.label} htmlFor="yearOfAllotment">Year of Allotment:</label> {/* Label */}
                    <input
                      id="yearOfAllotment"
                      placeholder="YYYY"
                      value={yearOfAllotment}
                      onChange={(e) => setYearOfAllotment(e.target.value)} // Updates yearOfAllotment
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                  <div style={filterStyles.filterItem}> {/* Email filter */}
                    <label style={filterStyles.label} htmlFor="email">Email:</label> {/* Label */}
                    <input
                      id="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} // Updates email
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                  <div style={filterStyles.filterItem}> {/* Status filter */}
                    <label style={filterStyles.label} htmlFor="status">Status:</label> {/* Label */}
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)} // Updates status
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    >
                      <option value="">All</option> {/* Default option */}
                      <option value="serving">Serving</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> {/* Modules Handled filter */}
                    <label style={filterStyles.label} htmlFor="modulesHandled">Modules Handled:</label> {/* Label */}
                    <input
                      id="modulesHandled"
                      placeholder="Module Name"
                      value={modulesHandled}
                      onChange={(e) => setModulesHandled(e.target.value)} // Updates modulesHandled
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                  <div style={filterStyles.filterItem}> {/* Major Domains filter */}
                    <label style={filterStyles.label} htmlFor="majorDomains">Major Domains:</label> {/* Label */}
                    <select
                      id="majorDomains"
                      value={majorDomains[0] || ""} // Uses first item in array
                      onChange={(e) => setMajorDomains(e.target.value ? [e.target.value] : [])} // Updates majorDomains as single-item array
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    >
                      <option value="">All</option> {/* Default option */}
                      {Object.keys(domainOptions).map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option> // Renders domain categories
                      ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> {/* Minor Domains filter */}
                    <label style={filterStyles.label} htmlFor="minorDomains">Minor Domains:</label> {/* Label */}
                    <select
                      id="minorDomains"
                      value={minorDomains[0] || ""} // Uses first item in array
                      onChange={(e) => setMinorDomains(e.target.value ? [e.target.value] : [])} // Updates minorDomains as single-item array
                      disabled={!majorDomains[0]} // Disables if no major domain selected
                      style={{
                        ...filterStyles.input,
                        opacity: !majorDomains[0] ? 0.7 : 1, // Fades when disabled
                        cursor: !majorDomains[0] ? "not-allowed" : "pointer", // Cursor style
                      }}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    >
                      <option value="">All</option> {/* Default option */}
                      {majorDomains[0] &&
                        domainOptions[majorDomains[0]]?.map((subDomain) => (
                          <option key={subDomain} value={subDomain}>
                            {subDomain}
                          </option> // Renders subdomains for selected major domain
                        ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> {/* Area of Expertise filter */}
                    <label style={filterStyles.label} htmlFor="areaOfExpertise">Areas of Expertise:</label> {/* Label */}
                    <input
                      id="areaOfExpertise"
                      placeholder="Areas of Expertise"
                      value={areaOfExpertise}
                      onChange={(e) => setAreaOfExpertise(e.target.value)} // Updates areaOfExpertise
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                  <div style={filterStyles.filterItem}> {/* Institution filter */}
                    <label style={filterStyles.label} htmlFor="institution">Institution:</label> {/* Label */}
                    <input
                      id="institution"
                      placeholder="Institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)} // Updates institution
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                  <div style={filterStyles.filterItem}> {/* Mobile Number filter */}
                    <label style={filterStyles.label} htmlFor="mobileNumber">Mobile Number:</label> {/* Label */}
                    <input
                      id="mobileNumber"
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)} // Updates mobileNumber
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                  <div style={filterStyles.filterItem}> {/* Domain Knowledge filter */}
                    <label style={filterStyles.label} htmlFor="domainKnowledge">Domain Knowledge:</label> {/* Label */}
                    <input
                      id="domainKnowledge"
                      placeholder="Domain Knowledge"
                      value={domainKnowledge}
                      onChange={(e) => setDomainKnowledge(e.target.value)} // Updates domainKnowledge
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Blue border on focus
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Default border
                    />
                  </div>
                </div>
                <div style={filterStyles.buttonContainer}> {/* Clear button container */}
                  <button
                    style={filterStyles.clearButton}
                    onClick={handleClearFilter} // Clears filters
                    onMouseOver={(e) => (e.target.style.backgroundColor = filterStyles.clearButtonHover.backgroundColor)} // Hover color
                    onMouseOut={(e) => (e.target.style.backgroundColor = filterStyles.clearButton.backgroundColor)} // Default color
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>} {/* Error/no-data message */}
              {tableData.length > 0 && ( // Renders table if data exists
                <table className="faculty-table" style={{ marginTop: "1rem" }}> {/* Faculty table */}
                  <thead>
                    <tr>
                      <th>Name</th> {/* Name column */}
                      <th>Photograph</th> {/* Photograph column */}
                      <th>Faculty Type</th> {/* Faculty Type column */}
                      <th>Mobile Number</th> {/* Mobile Number column */}
                      <th>Email</th> {/* Email column */}
                      <th>Year of Allotment</th> {/* Year of Allotment column */}
                      <th>View</th> {/* View column */}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}> {/* Table row */}
                        <td>{row.name}</td> {/* Name cell */}
                        <td>
                          {row.photograph ? ( // Checks if photograph exists
                            <img
                              src={`http://${ip}:${port}/Uploads/${row.photograph.split("\\").pop()}`} // Image URL
                              alt="Photograph"
                              style={{ width: "50px", height: "50px", borderRadius: "5px", objectFit: "cover" }} // Image styles
                            />
                          ) : (
                            "No Image" // Placeholder text
                          )}
                        </td> {/* Photograph cell */}
                        <td>{row.facultyType}</td> {/* Faculty Type cell */}
                        <td>{row.mobileNumber}</td> {/* Mobile Number cell */}
                        <td>{row.email}</td> {/* Email cell */}
                        <td>{row.yearOfAllotment}</td> {/* Year of Allotment cell */}
                        <td>
                          <button
                            style={viewButtonStyles.viewButton}
                            onClick={() => handleViewDetails(row)} // Opens popup
                            onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButtonHover.backgroundColor)} // Hover color
                            onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)} // Default color
                          >
                            View
                          </button> {/* View button */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </section>

        {selectedFaculty && ( // Renders popup if faculty selected
          <div style={popupStyles.popup}> {/* Popup overlay */}
            <div style={popupStyles.popupContent}> {/* Popup content */}
              <h3 style={popupStyles.popupHeader}>Faculty Details</h3> {/* Popup title */}
              <table style={popupStyles.table}> {/* Details table */}
                <tbody>{renderPopupContent(selectedFaculty)}</tbody> {/* Renders faculty details */}
              </table>
              <button
                style={popupStyles.closeButton}
                onClick={closePopup} // Closes popup
                onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")} // Hover color
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")} // Default color
              >
                Close
              </button> {/* Close button */}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Exports the component as default
export default FacultyView;