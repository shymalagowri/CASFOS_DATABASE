/**
 * AssetManagerDashboard.jsx
 * 
 * This React component serves as the main dashboard for an asset manager in the Central Academy for State Forest Service (CASFOS) Asset Management System.
 * It provides a comprehensive interface displaying notifications, analytics, and institutional information.
 * Features:
 * - Displays real-time notifications (e.g., asset approvals, rejections) with expand/collapse and clear options.
 * - Includes charts for asset data (permanent, consumable, issued), faculty sessions, and user counts, filterable by year and location.
 * - Features a sidebar for navigation, a hero section, and informational sections about the academy's history, location, and contact details.
 * - Uses Axios for API calls, React Router for navigation, and Helmet for meta tags and external styles.
 * 
 * @returns {JSX.Element} The AssetManagerDashboard component
 */

// -------------------
// Imports
// -------------------
import React, { useEffect, useState } from "react"; // Imports React and hooks for state and lifecycle management
import { Helmet } from "react-helmet"; // Imports Helmet for managing document head (meta tags, styles)
import "../styles/Style.css"; // Imports local stylesheet for component styling
import axios from "axios"; // Imports Axios for making HTTP requests to the backend
import { useLocation } from "react-router-dom"; // Imports useLocation for accessing URL query parameters

// -------------------
// Main Component
// -------------------
/**
 * Dashboard component for asset managers
 * @returns {JSX.Element}
 */
const AssetManagerDashboard = () => {
  // Extracts query parameters from the URL
  const location = useLocation(); // Gets the current location object from React Router
  const queryParams = new URLSearchParams(location.search); // Parses query parameters from the URL
  const username = queryParams.get("username") || "Guest"; // Retrieves username from query params, defaults to "Guest"

  // Returns the JSX structure for the dashboard
  return (
    <>
      {/* Fragment to group multiple elements without adding extra DOM nodes */}
      <div>
        {/* Helmet manages document head for SEO and external resources */}
        <Helmet>
          <meta charSet="UTF-8" /> {/* Sets character encoding to UTF-8 */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" /> {/* Ensures responsive viewport scaling */}
          <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" /> {/* Loads Boxicons for sidebar icons */}
          <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" /> {/* Loads Font Awesome for additional icons */}
          <link rel="stylesheet" href="style.css" /> {/* Loads local style.css (Note: may overlap with Style.css) */}
          <title>CASFOS</title> {/* Sets the page title to "CASFOS" */}
        </Helmet>

        {/* Sidebar section for navigation */}
        <section id="sidebar">
          <a href="#" className="brand"> {/* Brand link (currently a placeholder with #) */}
            <span className="text">ASSET MANAGER</span> {/* Displays "ASSET MANAGER" as the brand name */}
          </a>
          <ul className="side-menu top"> {/* List of primary navigation links */}
            <li className="active"> {/* Marks the Home link as active */}
              <a href={`/assetmanagerdashboard?username=${encodeURIComponent(username)}`}> {/* Navigates to dashboard with username */}
                <i className="bx bxs-dashboard" /> {/* Dashboard icon */}
                <span className="text">Home</span> {/* Home link text */}
              </a>
            </li>
            <li> {/* Asset Approval link */}
              <a href={`/adminassetapproval?username=${encodeURIComponent(username)}`}> {/* Navigates to asset approval page */}
                <i className="bx bxs-shopping-bag-alt" /> {/* Shopping bag icon */}
                <span className="text">Asset Approval</span> {/* Approval link text */}
              </a>
            </li>
            <li> {/* Asset Updation link */}
              <a href={`/assetupdation?username=${encodeURIComponent(username)}`}> {/* Navigates to asset updation page */}
                <i className="bx bxs-package" /> {/* Package icon */}
                <span className="text">Asset Updation</span> {/* Updation link text */}
              </a>
            </li>
            <li> {/* Asset View link */}
              <a href={`/managerassetview?username=${encodeURIComponent(username)}`}> {/* Navigates to asset view page */}
                <i className="bx bxs-reply" /> {/* Reply icon */}
                <span className="text">Asset View</span> {/* View link text */}
              </a>
            </li>
          </ul>
          <ul className="side-menu"> {/* List for secondary navigation (logout) */}
            <li> {/* Logout link */}
              <a href="/login" className="logout"> {/* Navigates to login page */}
                <i className="bx bxs-log-out-circle" /> {/* Logout icon */}
                <span className="text">Logout</span> {/* Logout link text */}
              </a>
            </li>
          </ul>
        </section>

        {/* Main content section */}
        <section id="content">
          <nav> {/* Navigation bar within content */}
            <i className="bx bx-menu" /> {/* Menu icon (likely for toggling sidebar) */}
            <span className="head-title">Dashboard</span> {/* Displays "Dashboard" as the page title */}
            <form action="#"> {/* Placeholder form (currently empty) */}
              <div className="form-input"></div> {/* Empty form input container */}
            </form>
            <div style={styles.usernameContainer}> {/* Container for username display */}
              <i className="bx bxs-user-circle" style={styles.userIcon}></i> {/* User icon */}
              <span style={styles.username}>{username}</span> {/* Displays the username */}
            </div>
          </nav>

          <main className="main-content"> {/* Main content area */}
            {/* Hero Section */}
            <section className="hero-section"> {/* Hero section with overlay and content */}
              <div className="hero-overlay" /> {/* Overlay for visual effect */}
              <div className="hero-content"> {/* Content within hero section */}
                <br></br> {/* Adds vertical spacing */}
                <br></br> {/* Adds additional vertical spacing */}
                <p>Central Academy for State Forest Service - Asset Management System</p> {/* Hero section description */}
              </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="content-section"> {/* About section */}
              <div className="section-container"> {/* Container for section content */}
                <h2 className="section-title">About Us</h2> {/* Section title */}
                <div className="about-content"> {/* Content wrapper */}
                  <div className="about-text"> {/* Text content */}
                    <p> {/* Paragraph describing CASFOS */}
                      The Central Academy for State Forest Service, Coimbatore (erstwhile State Forest Service College) is a premier institution under the Directorate of Forest Education, Ministry of Environment, Forests, and Climate Change. It imparts professional training to newly recruited Range Forest Officers (RFOs) and in-service training to State Forest Service Officers at ACF and DCF ranks.
                    </p>
                    <p> {/* Paragraph on establishment and history */}
                      Established on January 25, 1980, the Academy was created to meet the growing demand for trained forest officers, spurred by Social Forestry Projects during the IV and V Five-Year Plans. Previously, officers were trained at the Indian Forest College, Dehradun, and Burnihat. CASFOS Coimbatore continues to uphold excellence in forestry education.
                    </p>
                    <p className="update-info"> {/* Placeholder for update information */}
                    </p>
                  </div>
                  <div className="about-image"> {/* Image container */}
                    <img
                      src="/images/casfos_vana_vigyan.png" // Path to CASFOS emblem image
                      alt="CASFOS Emblem" // Alt text for accessibility
                      className="section-image" // Styling class
                      onError={(e) => (e.target.src = '/images/fallback.jpg')} // Fallback image if loading fails
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* History Section */}
            <section id="history" className="content-section alt-bg"> {/* History section with alternate background */}
              <div className="section-container"> {/* Container for section content */}
                <h2 className="section-title">History of the Academy</h2> {/* Section title */}
                <div className="history-content"> {/* Content wrapper */}
                  <div className="history-text"> {/* Text content */}
                    <p> {/* Overview of CASFOS’s role */}
                      CASFOS Coimbatore is a cornerstone of forestry education, offering professional training to State Forest Officers (ACF, FRO) and workshops on forest policy, wildlife, and environmental conservation.
                    </p>
                    <h3 className="subsection-title">Mandate</h3> {/* Subsection title for mandate */}
                    <ul className="mandate-list"> {/* List of mandate items */}
                      <li>Deliver professional training to prepare officers for forestry challenges.</li> {/* Mandate item */}
                      <li>Enhance management skills through in-service courses.</li> {/* Mandate item */}
                      <li>Conduct workshops on emerging forestry research and technology.</li> {/* Mandate item */}
                      <li>Align forest education with ecological and environmental standards.</li> {/* Mandate item */}
                    </ul>
                    <h3 className="subsection-title">Genesis of Forest Training</h3> {/* Subsection title for history */}
                    <p> {/* Historical context of forestry education */}
                      Forestry education in India began in 1867, with a forest school established in Dehradun (1878). The Madras Forest College, founded in Coimbatore in 1912, was the second Rangers College, training foresters for South India. Revived in 1945 and renamed the Southern Forest Rangers College (SFRC) in 1955, it trained over 4,000 rangers until 1987. CASFOS Coimbatore was established in 1980 and integrated under IGNFA in 2022.
                    </p>
                  </div>
                  <div className="history-images"> {/* Container for historical images */}
                    <img
                      src="/images/casfos_coimbatore_img4.jpg" // Path to historical campus image
                      alt="Historical Campus" // Alt text for accessibility
                      className="section-image" // Styling class
                      onError={(e) => (e.target.src = '/images/fallback.jpg')} // Fallback image if loading fails
                    />
                    <img
                      src="/images/casfos_coimbatore_img5.jpg" // Path to forest campus image
                      alt="Forest Campus" // Alt text for accessibility
                      className="section-image" // Styling class
                      onError={(e) => (e.target.src = '/images/fallback.jpg')} // Fallback image if loading fails
                    />
                    <img
                      src="/images/casfos_coimbatore_img3.jpg" // Path to training facility image
                      alt="Training Facility" // Alt text for accessibility
                      className="section-image" // Styling class
                      onError={(e) => (e.target.src = '/images/fallback.jpg')} // Fallback image if loading fails
                    />
                  </div>
                  <div className="history-text-continued"> {/* Placeholder for continued text */}
                    <p className="update-info"> {/* Placeholder for update information */}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Reach Section */}
            <section id="reach" className="content-section"> {/* Reach section */}
              <div className="section-container"> {/* Container for section content */}
                <h2 className="section-title">How to Reach</h2> {/* Section title */}
                <div className="reach-content"> {/* Content wrapper */}
                  <div className="reach-text"> {/* Text content */}
                    <p> {/* Location details */}
                      Located in the scenic Forest Campus, R.S. Puram, Coimbatore, Tamil Nadu, CASFOS is 5 km from Coimbatore Railway Station and 12 km from Coimbatore International Airport.
                    </p>
                    <p> {/* Additional campus information */}
                      The campus hosts the Tamil Nadu Forest Academy (TNFA), the Institute of Forest Genetics & Tree Breeding (IFGTB), and the renowned GASS Museum, making it a hub for forestry education and research.
                    </p>
                  </div>
                  <div className="map-container"> {/* Container for Google Maps iframe */}
                    <iframe
                      src="http://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.2649732361087!2d76.93796778831465!3d11.018735325854964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba858dde76380d3%3A0xbe08bb837838e990!2sCentral%20Academy%20for%20State%20Forest%20Service!5e0!3m2!1sen!2sin!4v1744637852810!5m2!1sen!2sin" // Google Maps embed URL
                      width="600" // Iframe width
                      height="450" // Iframe height
                      style={{ border: 0 }} // Removes border
                      allowFullScreen="" // Enables fullscreen mode
                      loading="lazy" // Lazy loads the iframe
                      referrerPolicy="no-referrer-when-downgrade" // Sets referrer policy
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="content-section alt-bg"> {/* Contact section with alternate background */}
              <div className="section-container"> {/* Container for section content */}
                <h2 className="section-title">Contact Us</h2> {/* Section title */}
                <div className="contact-content"> {/* Content wrapper */}
                  <div className="contact-card"> {/* Card for contact information */}
                    <h3 className="contact-heading"> {/* Contact heading */}
                      Central Academy for State Forest Service <br />
                      Directorate of Forest Education <br />
                      Ministry of Environment, Forest and Climate Change <br />
                      Government of India
                    </h3>
                    <div className="contact-info"> {/* Container for contact details */}
                      <div className="contact-item"> {/* Email contact item */}
                        <i className="bx bx-envelope" /> {/* Envelope icon */}
                        <p>
                          <strong>Email:</strong> casfos-coimbatore@gov.in | casfoscbe-trng@gov.in {/* Email addresses */}
                        </p>
                      </div>
                      <div className="contact-item"> {/* Phone contact item */}
                        <i className="bx bx-phone" /> {/* Phone icon */}
                        <p>
                          <strong>Phone:</strong> 0422-2450313 {/* Phone number */}
                        </p>
                      </div>
                      <div className="contact-item"> {/* Address contact item */}
                        <i className="bx bx-map" /> {/* Map icon */}
                        <p>
                          <strong>Address:</strong> Forest Campus, R.S. Puram, Coimbatore - 641002, Tamil Nadu {/* Physical address */}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </section>
      </div>
    </>
  );
};

// -------------------
// Styles
// -------------------
/**
 * CSS styles for the dashboard and notification components
 */
const styles = {
  notificationPanel: { // Styles for notification panel
    maxWidth: "800px", // Maximum width of 800px
    margin: "20px auto", // Centered with 20px margin
    padding: "20px", // 20px padding
    borderRadius: "10px", // Rounded corners
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
    backgroundColor: "#fff", // White background
    maxHeight: "500px", // Maximum height with scroll
    overflowY: "auto", // Vertical scrollbar if needed
  },
  notificationHeader: { // Styles for notification header
    display: "flex", // Flexbox layout
    justifyContent: "space-between", // Space between items
    alignItems: "center", // Center vertically
    marginBottom: "15px", // Bottom margin
    position: "sticky", // Sticks to top when scrolling
    top: 0, // Sticks at top
    backgroundColor: "#fff", // White background
    padding: "10px 0", // Vertical padding
    zIndex: 1, // Ensures header stays above content
  },
  notificationList: { // Styles for notification list
    maxHeight: "400px", // Maximum height with scroll
    overflowY: "auto", // Vertical scrollbar
    paddingRight: "5px", // Right padding for scrollbar
  },
  notificationBanner: { // Styles for individual notification
    padding: "15px", // 15px padding
    marginBottom: "10px", // Bottom margin
    borderRadius: "5px", // Rounded corners
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
  },
  notificationSummary: { // Styles for notification summary
    display: "flex", // Flexbox layout
    justifyContent: "space-between", // Space between items
    alignItems: "center", // Center vertically
  },
  notificationTitle: { // Styles for notification title
    flex: 1, // Takes available space
    fontWeight: "bold", // Bold text
    display: "flex", // Flexbox for layout
    flexDirection: "column", // Stack items vertically
  },
  notificationTime: { // Styles for notification timestamp
    fontSize: "0.8em", // Smaller font size
    color: "#666", // Gray color
    fontWeight: "normal", // Normal weight
    marginTop: "5px", // Top margin
  },
  clearAllButton: { // Styles for clear all notifications button
    padding: "8px 15px", // Padding
    backgroundColor: "#dc3545", // Red background
    color: "#fff", // White text
    border: "none", // No border
    borderRadius: "5px", // Rounded corners
    cursor: "pointer", // Pointer cursor
    fontSize: "14px", // Font size
    fontWeight: "bold", // Bold text
  },
  expandButton: { // Styles for expand notification button
    padding: "5px 10px", // Padding
    backgroundColor: "#007bff", // Blue background
    color: "#fff", // White text
    border: "none", // No border
    borderRadius: "5px", // Rounded corners
    cursor: "pointer", // Pointer cursor
    marginRight: "10px", // Right margin
    minWidth: "30px", // Minimum width
  },
  clearButton: { // Styles for clear single notification button
    padding: "5px 10px", // Padding
    backgroundColor: "#dc3545", // Red background
    color: "#fff", // White text
    border: "none", // No border
    borderRadius: "5px", // Rounded corners
    cursor: "pointer", // Pointer cursor
    minWidth: "30px", // Minimum width
  },
  notificationDetails: { // Styles for expanded notification details
    marginTop: "10px", // Top margin
    padding: "10px", // Padding
    backgroundColor: "#f9f9f9", // Light gray background
    borderRadius: "5px", // Rounded corners
    fontSize: "0.9em", // Slightly smaller font
  },
  noNotifications: { // Styles for no notifications message
    textAlign: "center", // Centered text
    color: "#666", // Gray color
    padding: "20px", // Padding
  },
  usernameContainer: { // Styles for username container
    display: "flex", // Flexbox layout
    alignItems: "center", // Center vertically
    gap: "10px", // Space between items
    fontSize: "14px", // Font size
    color: "#555", // Gray color
  },
  userIcon: { // Styles for user icon
    fontSize: "30px", // Larger icon size
    color: "#007BFF", // Blue color
  },
  username: { // Styles for username text
    fontWeight: "bold", // Bold text
    fontSize: "18px", // Font size
  },
  container: { // Styles for generic container
    maxWidth: "800px", // Maximum width
    margin: "20px auto", // Centered with margin
    padding: "20px", // Padding
    borderRadius: "10px", // Rounded corners
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
    backgroundColor: "#fff", // White background
  },
  header: { // Styles for header
    display: "flex", // Flexbox layout
    justifyContent: "space-between", // Space between items
    alignItems: "center", // Center vertically
    marginBottom: "10px", // Bottom margin
  },
  subtitle: { // Styles for subtitle
    color: "#666", // Gray color
    fontSize: "14px", // Font size
    marginBottom: "20px", // Bottom margin
  },
  cardContainer: { // Styles for card container
    display: "flex", // Flexbox layout
    gap: "15px", // Space between cards
  },
  card: { // Styles for individual cards
    flex: "1", // Equal width
    padding: "15px", // Padding
    borderRadius: "10px", // Rounded corners
    textAlign: "center", // Centered text
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
  },
  icon: { // Styles for card icons
    width: "50px", // Fixed width
    height: "50px", // Fixed height
    borderRadius: "50%", // Circular shape
    margin: "0 auto 10px", // Centered with bottom margin
    display: "flex", // Flexbox for centering
    justifyContent: "center", // Center horizontally
    alignItems: "center", // Center vertically
  },
  iconStyle: { // Styles for icon within cards
    fontSize: "24px", // Font size
    color: "#fff", // White color
  },
};

// Exports the component as default
export default AssetManagerDashboard;
