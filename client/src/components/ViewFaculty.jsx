/**
 * FacultyView.jsx
 *
 * This React component provides an interface for Faculty Entry Staff to view faculty records
 * in the CASFOS system with advanced filtering capabilities.
 *
 * Overview:
 * - Displays a filterable table of faculty records with fields like name, photograph, faculty type, mobile number, email, and year of allotment.
 * - Supports filtering by multiple criteria including faculty type, name, email, domains, and more.
 * - Features a hierarchical domain selection (major and minor domains) based on predefined domain options.
 * - Allows viewing detailed faculty information in a popup with formatted display of nested data and images.
 * - Includes a responsive UI with sidebar navigation, styled filters, and a popup for detailed views.
 * - Integrates with backend APIs to fetch filtered faculty data dynamically.
 * - Provides a clear filter button to reset all filters and a user-friendly interface for staff to explore faculty records.
 */

import React, { useEffect, useState } from "react"; // Import React and hooks for state and side effects
import axios from "axios"; // Import axios for HTTP requests to backend API
import { useLocation } from "react-router-dom"; // Import useLocation for accessing URL query parameters

const FacultyView = () => { // Define FacultyView functional component
  const port = import.meta.env.VITE_API_PORT; // Retrieve API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // Retrieve API IP from environment variables
  const [facultyType, setFacultyType] = useState(""); // State for faculty type filter
  const [name, setName] = useState(""); // State for name filter
  const [yearOfAllotment, setYearOfAllotment] = useState(""); // State for year of allotment filter
  const [email, setEmail] = useState(""); // State for email filter
  const [domainKnowledge, setDomainKnowledge] = useState(""); // State for domain knowledge filter
  const [areaOfExpertise, setAreaOfExpertise] = useState(""); // State for area of expertise filter
  const [institution, setInstitution] = useState(""); // State for institution filter
  const [status, setStatus] = useState(""); // State for status filter
  const [modulesHandled, setModulesHandled] = useState(""); // State for modules handled filter
  const [majorDomains, setMajorDomains] = useState([]); // State for major domains filter
  const [minorDomains, setMinorDomains] = useState([]); // State for minor domains filter
  const [mobileNumber, setMobileNumber] = useState(""); // State for mobile number filter
  const [tableData, setTableData] = useState([]); // State for table data
  const [message, setMessage] = useState(""); // State for error/no results message
  const [selectedFaculty, setSelectedFaculty] = useState(null); // State for selected faculty in popup
  
  const location = useLocation(); // Get current location for URL query params
  const queryParams = new URLSearchParams(location.search); // Parse query parameters
  const username = queryParams.get("username") || "Guest"; // Extract username, default to "Guest"
  
  // Predefined domain options for major and minor domains
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
    Environment: [
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

  // Fetch filtered faculty data when filters change
  useEffect(() => { // useEffect hook for fetching filtered data
    const handleApplyFilter = async () => { // Async function to apply filters
      try { // Start try block for API request
        const response = await axios.post(`http://${ip}:${port}/api/faculty/filterFaculties`, { // Post filter criteria to API
          facultyType: facultyType || undefined, // Include facultyType if not empty
          name: name || undefined, // Include name if not empty
          yearOfAllotment: yearOfAllotment || undefined, // Include yearOfAllotment if not empty
          email: email || undefined, // Include email if not empty
          domainKnowledge: domainKnowledge || undefined, // Include domainKnowledge if not empty
          areaOfExpertise: areaOfExpertise || undefined, // Include areaOfExpertise if not empty
          institution: institution || undefined, // Include institution if not empty
          status: status || undefined, // Include status if not empty
          modulesHandled: modulesHandled ? [modulesHandled] : undefined, // Include modulesHandled as array if not empty
          majorDomains: majorDomains.length > 0 ? majorDomains : undefined, // Include majorDomains if not empty
          minorDomains: minorDomains.length > 0 ? minorDomains : undefined, // Include minorDomains if not empty
          mobileNumber: mobileNumber || undefined, // Include mobileNumber if not empty
        });

        if (response.data.length > 0) { // Check if data is returned
          setTableData(response.data); // Update tableData with response data
          setMessage(""); // Clear any error message
        } else { // No data returned
          setTableData([]); // Clear tableData
          setMessage("No matching records found."); // Set no results message
        }
      } catch (error) { // Handle API errors
        setTableData([]); // Clear tableData
        setMessage("No matching records."); // Set error message
        console.error("Error fetching filtered data:", error); // Log error
      }
    };
    handleApplyFilter(); // Call filter function
  }, [ // Dependencies for re-running effect
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

  // Function to render popup content for faculty details
  const renderPopupContent = (data) => { // Function to format and render faculty details
    const renderValue = (value, key) => { // Helper function to render values
      if (key === "photograph" && typeof value === "string") { // Handle photograph
        const imageUrl = `http://${ip}:${port}/Uploads/${value.split("\\").pop()}`; // Construct image URL
        return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }} />; // Render image
      }

      if (Array.isArray(value)) { // Handle arrays
        return (
          <ul>
            {value.map((item, index) => ( // Map over array items
              <li key={index}>{renderValue(item, key)}</li> // Recursively render each item
            ))}
          </ul>
        );
      }

      if (typeof value === "object" && value !== null) { // Handle objects
        return (
          <ul>
            {Object.entries(value) // Map over object entries
              .filter(([key]) => key !== "_id") // Exclude _id
              .map(([key, val]) => (
                <li key={key}>
                  <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</strong> {renderValue(val, key)} // Render key-value pair
                </li>
              ))}
          </ul>
        );
      }

      return value?.toString() || "-"; // Return string value or "-"
    };

    return Object.entries(data) // Map over faculty data
      .filter(([key]) => key !== "_id" && key !== "conduct") // Exclude _id and conduct
      .map(([key, value]) => (
        <tr key={key}> // Table row for each key-value pair
          <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>
            {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}: // Format key
          </td>
          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td> // Render value
        </tr>
      ));
  };

  // Function to clear all filters
  const handleClearFilter = () => { // Reset all filter states
    setFacultyType(""); // Clear faculty type
    setName(""); // Clear name
    setYearOfAllotment(""); // Clear year of allotment
    setEmail(""); // Clear email
    setDomainKnowledge(""); // Clear domain knowledge
    setAreaOfExpertise(""); // Clear area of expertise
    setInstitution(""); // Clear institution
    setStatus(""); // Clear status
    setModulesHandled(""); // Clear modules handled
    setMajorDomains([]); // Clear major domains
    setMinorDomains([]); // Clear minor domains
    setMobileNumber(""); // Clear mobile number
    setTableData([]); // Clear table data
    setMessage(""); // Clear message
  };

  // Function to view faculty details in popup
  const handleViewDetails = (faculty) => { // Set selected faculty for popup
    setSelectedFaculty(faculty); // Update selectedFaculty state
  };

  // Function to close popup
  const closePopup = () => { // Clear selected faculty to close popup
    setSelectedFaculty(null); // Reset selectedFaculty
  };

  // Styles for popup
  const popupStyles = {
    popup: { // Overlay style
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    popupContent: { // Popup content style
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      width: "90%",
      maxWidth: "600px",
      maxHeight: "80vh",
      overflowY: "auto",
      position: "relative",
    },
    popupHeader: { // Header style
      marginBottom: "15px",
      color: "#333",
    },
    closeButton: { // Close button style
      marginTop: "15px",
      padding: "8px 16px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    table: { // Table style
      width: "100%",
      borderCollapse: "collapse",
    },
  };

  // Styles for filter section
  const filterStyles = {
    filterContainer: { // Filter container style
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      marginBottom: "20px",
    },
    filterGrid: { // Grid layout for filters
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    filterItem: { // Individual filter item style
      display: "flex",
      flexDirection: "column",
    },
    label: { // Label style
      marginBottom: "5px",
      fontWeight: "500",
      color: "#333",
    },
    input: { // Input style
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    inputFocus: { // Input focus style
      borderColor: "#007BFF",
    },
    buttonContainer: { // Button container style
      display: "flex",
      justifyContent: "flex-end",
    },
    clearButton: { // Clear button style
      padding: "8px 16px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    clearButtonHover: { // Clear button hover style
      backgroundColor: "#5a6268",
    },
  };

  // Styles for view button
  const viewButtonStyles = {
    viewButton: { // View button style
      padding: "6px 12px",
      backgroundColor: "#007BFF",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    viewButtonHover: { // View button hover style
      backgroundColor: "#0056b3",
    },
  };

  // General styles
  const styles = {
    usernameContainer: { // Username container style
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
      color: "#555",
    },
    userIcon: { // User icon style
      fontSize: "30px",
      color: "#007BFF",
    },
    username: { // Username text style
      fontWeight: "bold",
      fontSize: "18px",
    },
    rowContainer: { // Row container style (unused)
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      margin: "20px 0",
      justifyContent: "center",
    },
    userContainer: { // User container style (unused)
      flex: 1,
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      minWidth: "300px",
    },
    amcContainer: { // AMC container style (unused)
      flex: 1,
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      minWidth: "300px",
      maxHeight: "300px",
      overflowY: "auto",
    },
    cardContainer: { // Card container style (unused)
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    },
    card: { // Card style (unused)
      flex: "1",
      padding: "15px",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      minWidth: "150px",
    },
    icon: { // Icon style (unused)
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      margin: "0 auto 10px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    iconStyle: { // Icon style (unused)
      fontSize: "24px",
      color: "#fff",
    },
    container: { // Container style (unused)
      maxWidth: "50%",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
    },
    container2: { // Container2 style (unused)
      maxWidth: "800px",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
    },
    header: { // Header style (unused)
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "10px",
      textAlign: "center",
    },
    subtitle: { // Subtitle style (unused)
      color: "#666",
      fontSize: "14px",
      marginBottom: "20px",
    },
    change: { // Change style (unused)
      color: "#666",
      fontSize: "12px",
    },
    amcTable: { // AMC table style (unused)
      width: "100%",
      borderCollapse: "collapse",
    },
    amcTableHeader: { // AMC table header style (unused)
      position: "sticky",
      top: 0,
      backgroundColor: "#fff",
      zIndex: 2,
    },
    amcTableCell: { // AMC table cell style (unused)
      padding: "10px",
      border: "1px solid #ddd",
      textAlign: "left",
    },
  };

  // Module styles (unused)
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

  // Title style (unused)
  const titleStyle = {
    marginBottom: "15px",
    fontSize: "1.2em",
    color: "#28a745",
  };

  return ( // Render component UI
    <>
      <div className="asset-view"> // Main container
        <meta charSet="UTF-8" /> // Set character encoding
        <meta name="viewport" content="width=device-width, initial-scale=1.0" /> // Set responsive viewport
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" /> // Import Boxicons
        <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" /> // Import Font Awesome
        <title>CASFOS</title> // Set page title

        <section id="sidebar"> // Sidebar navigation
          <a href="#" className="brand"> // Brand logo
            <span className="text">FACULTY ENTRY STAFF</span> // Display staff title
          </a>
          <ul className="side-menu top"> // Top navigation menu
            <li>
              <a href={`/facultyentrystaffdashboard?username=${encodeURIComponent(username)}`}> // Dashboard link
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li>
              <a href={`/facultyentry?username=${encodeURIComponent(username)}`}> // Faculty entry link
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty Entry</span>
              </a>
            </li>
            <li className="active"> // Active menu item
              <a href={`/viewfaculty?username=${encodeURIComponent(username)}`}> // Faculty view link
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty View</span>
              </a>
            </li>
          </ul>
          <ul className="side-menu"> // Bottom navigation menu
            <li>
              <a href="/login" className="logout"> // Logout link
                <i className="bx bxs-log-out-circle" />
                <span className="text">Logout</span>
              </a>
            </li>
          </ul>
        </section>

        <section id="content"> // Main content section
          <nav> // Navigation bar
            <i className="bx bx-menu" /> // Menu toggle icon
            <form action="#"> // Empty form (placeholder)
              <div className="form-input"></div>
            </form>
            <div style={styles.usernameContainer}> // Username display
              <i className="bx bxs-user-circle" style={styles.userIcon}></i> // User icon
              <span style={styles.username}>{username}</span> // Display username
            </div>
          </nav>

          <main> // Main content
            <div className="dash-content"> // Dashboard content
              <div className="title"> // Section title
                <span className="text">Faculty View with Filters</span> // Title text
              </div>
              <div style={filterStyles.filterContainer}> // Filter container
                <div style={filterStyles.filterGrid}> // Filter grid
                  <div style={filterStyles.filterItem}> // Faculty type filter
                    <label style={filterStyles.label} htmlFor="facultyType">Faculty Type:</label>
                    <select
                      id="facultyType"
                      value={facultyType}
                      onChange={(e) => setFacultyType(e.target.value)} // Update faculty type
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)} // Focus style
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} // Blur style
                    >
                      <option value="">All</option> // Default option
                      <option value="internal">Internal</option> // Internal option
                      <option value="external">External</option> // External option
                      <option value="contract">Contract</option> // Contract option
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> // Name filter
                    <label style={filterStyles.label} htmlFor="name">Name:</label>
                    <input
                      id="name"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)} // Update name
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}> // Year of allotment filter
                    <label style={filterStyles.label} htmlFor="yearOfAllotment">Year of Allotment:</label>
                    <input
                      id="yearOfAllotment"
                      placeholder="YYYY"
                      value={yearOfAllotment}
                      onChange={(e) => setYearOfAllotment(e.target.value)} // Update year
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}> // Email filter
                    <label style={filterStyles.label} htmlFor="email">Email:</label>
                    <input
                      id="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} // Update email
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}> // Status filter
                    <label style={filterStyles.label} htmlFor="status">Status:</label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)} // Update status
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">All</option> // Default option
                      <option value="serving">Serving</option> // Serving option
                      <option value="retired">Retired</option> // Retired option
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> // Modules handled filter
                    <label style={filterStyles.label} htmlFor="modulesHandled">Modules Handled:</label>
                    <input
                      id="modulesHandled"
                      placeholder="Module Name"
                      value={modulesHandled}
                      onChange={(e) => setModulesHandled(e.target.value)} // Update modules
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}> // Major domains filter
                    <label style={filterStyles.label} htmlFor="majorDomains">Major Domains:</label>
                    <select
                      id="majorDomains"
                      value={majorDomains[0] || ""}
                      onChange={(e) => setMajorDomains(e.target.value ? [e.target.value] : [])} // Update major domains
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">All</option> // Default option
                      {Object.keys(domainOptions).map((domain) => ( // Map over major domains
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> // Minor domains filter
                    <label style={filterStyles.label} htmlFor="minorDomains">Minor Domains:</label>
                    <select
                      id="minorDomains"
                      value={minorDomains[0] || ""}
                      onChange={(e) => setMinorDomains(e.target.value ? [e.target.value] : [])} // Update minor domains
                      disabled={!majorDomains[0]} // Disable if no major domain selected
                      style={{
                        ...filterStyles.input,
                        opacity: !majorDomains[0] ? 0.7 : 1, // Reduce opacity if disabled
                        cursor: !majorDomains[0] ? "not-allowed" : "pointer", // Change cursor if disabled
                      }}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    >
                      <option value="">All</option> // Default option
                      {majorDomains[0] &&
                        domainOptions[majorDomains[0]]?.map((subDomain) => ( // Map over minor domains
                          <option key={subDomain} value={subDomain}>
                            {subDomain}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div style={filterStyles.filterItem}> // Area of expertise filter
                    <label style={filterStyles.label} htmlFor="areaOfExpertise">Areas of Expertise:</label>
                    <input
                      id="areaOfExpertise"
                      placeholder="Areas of Expertise"
                      value={areaOfExpertise}
                      onChange={(e) => setAreaOfExpertise(e.target.value)} // Update expertise
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}> // Institution filter
                    <label style={filterStyles.label} htmlFor="institution">Institution:</label>
                    <input
                      id="institution"
                      placeholder="Institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)} // Update institution
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}> // Mobile number filter
                    <label style={filterStyles.label} htmlFor="mobileNumber">Mobile Number:</label>
                    <input
                      id="mobileNumber"
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)} // Update mobile number
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                  <div style={filterStyles.filterItem}> // Domain knowledge filter
                    <label style={filterStyles.label} htmlFor="domainKnowledge">Domain Knowledge:</label>
                    <input
                      id="domainKnowledge"
                      placeholder="Domain Knowledge"
                      value={domainKnowledge}
                      onChange={(e) => setDomainKnowledge(e.target.value)} // Update domain knowledge
                      style={filterStyles.input}
                      onFocus={(e) => (e.target.style.borderColor = filterStyles.inputFocus.borderColor)}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    />
                  </div>
                </div>
                <div style={filterStyles.buttonContainer}> // Clear filter button container
                  <button
                    style={filterStyles.clearButton}
                    onClick={handleClearFilter} // Clear filters
                    onMouseOver={(e) => (e.target.style.backgroundColor = filterStyles.clearButtonHover.backgroundColor)} // Hover style
                    onMouseOut={(e) => (e.target.style.backgroundColor = filterStyles.clearButton.backgroundColor)} // Default style
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>} // Display error message
              {tableData.length > 0 && ( // Render table if data exists
                <table className="faculty-table" style={{ marginTop: "1rem" }}> // Faculty table
                  <thead>
                    <tr> // Table header
                      <th>Name</th>
                      <th>Photograph</th>
                      <th>Faculty Type</th>
                      <th>Mobile Number</th>
                      <th>Email</th>
                      <th>Year of Allotment</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => ( // Map over table data
                      <tr key={index}> // Table row
                        <td>{row.name}</td> // Name column
                        <td>
                          {row.photograph ? ( // Check if photograph exists
                            <img
                              src={`http://${ip}:${port}/Uploads/${row.photograph.split("\\").pop()}`} // Image URL
                              alt="Photograph"
                              style={{ width: "50px", height: "50px", borderRadius: "5px", objectFit: "cover" }} // Image style
                            />
                          ) : (
                            "No Image" // Fallback text
                          )}
                        </td>
                        <td>{row.facultyType}</td> // Faculty type column
                        <td>{row.mobileNumber}</td> // Mobile number column
                        <td>{row.email}</td> // Email column
                        <td>{row.yearOfAllotment}</td> // Year of allotment column
                        <td>
                          <button
                            style={viewButtonStyles.viewButton}
                            onClick={() => handleViewDetails(row)} // Open popup
                            onMouseOver={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButtonHover.backgroundColor)} // Hover style
                            onMouseOut={(e) => (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)} // Default style
                          >
                            View
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

        {selectedFaculty && ( // Render popup if faculty is selected
          <div style={popupStyles.popup}> // Popup overlay
            <div style={popupStyles.popupContent}> // Popup content
              <h3 style={popupStyles.popupHeader}>Faculty Details</h3> // Popup title
              <table style={popupStyles.table}> // Details table
                <tbody>{renderPopupContent(selectedFaculty)}</tbody> // Render faculty details
              </table>
              <button
                style={popupStyles.closeButton}
                onClick={closePopup} // Close popup
                onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")} // Hover style
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")} // Default style
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FacultyView; // Export component