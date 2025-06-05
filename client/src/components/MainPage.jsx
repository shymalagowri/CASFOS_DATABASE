/**
 * MainPage.jsx
 *
 * This React component serves as the public-facing landing page for the Central Academy for State Forest Service
 * (CASFOS), Coimbatore, providing an overview of the institution, its history, and contact information.
 *
 * Features:
 * - Displays a responsive navigation bar with smooth scrolling to sections (Home, About, History, How to Reach, Contact).
 * - Includes a hero section with a background image and call-to-action to explore the site.
 * - Provides detailed sections for About Us, History, How to Reach (with Google Maps), and Contact Us (with a form).
 * - Features a footer with social media links and copyright information.
 * - Supports mobile responsiveness with a toggleable menu for smaller screens.
 * - Uses React Icons for visual elements and React Scroll for smooth scrolling navigation.
 * - Integrates with the CASFOS system's login page via a navigation button.
 * - Styles are defined inline for consistency, with hover effects and responsive layouts.
 *
 * @returns {JSX.Element} The MainPage component
 */

// -------------------
// Imports
// -------------------
import React, { useState, useEffect } from "react"; // Imports React and hooks for state and lifecycle management
import { Link } from "react-scroll"; // Imports Link from react-scroll for smooth scrolling
import { useNavigate } from "react-router-dom"; // Imports useNavigate for programmatic navigation
import { FiMenu, FiX, FiMail, FiPhone, FiMapPin, FiTwitter, FiInstagram, FiFacebook } from "react-icons/fi"; // Imports Feather Icons for UI elements

// -------------------
// Main Component
// -------------------
/**
 * Main landing page component for CASFOS, Coimbatore
 * @returns {JSX.Element}
 */
const MainPage = () => {
  // -------------------
  // Configuration
  // -------------------
  const port = import.meta.env.VITE_API_PORT; // Retrieves API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // Retrieves API IP address from environment variables

  // -------------------
  // State and Routing
  // -------------------
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [menuOpen, setMenuOpen] = useState(false); // State for toggling mobile menu visibility
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // State for tracking window width

  // -------------------
  // Window Resize Handler
  // -------------------
  /**
   * Updates window width state on resize for responsive design
   */
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // Updates window width state
    };

    window.addEventListener('resize', handleResize); // Adds resize event listener
    return () => window.removeEventListener('resize', handleResize); // Cleans up listener on unmount
  }, []); // Runs once on mount

  // -------------------
  // Styles
  // -------------------
  /**
   * Inline styles for the component
   */
  const styles = {
    container: {
    fontFamily: "'Poppins', sans-serif",
    color: "#333",
    lineHeight: 1.6,
    background: "#fff",
    minHeight: "100vh",
  },
    nav: { // Navigation bar
      background: "linear-gradient(135deg, #1e5631 0%, #2e7d32 100%)", // Green gradient background
      color: "white", // White text
      position: "fixed", // Fixed at top
      width: "100vw", // Full width
      top: 0, // Aligns to top
      zIndex: 1000, // High z-index for layering
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // Subtle shadow
    },
    navContainer: { // Container for nav content
      width: "100%", // Maximum width
      margin: "0 auto", // Centered
      padding: "1rem 0", // Horizontal padding
      display: "flex", // Flexbox layout
      justifyContent: "space-between", // Space between items
      alignItems: "center", // Vertically centered
      flexWrap: "wrap", // Allows wrapping
    },
    navContainer1: { // Container for nav content
      maxWidth: "820px", // Maximum width
      margin: "0 auto", // Centered
      display: "flex", // Flexbox layout
      justifyContent: "space-between", // Space between items
      alignItems: "center", // Vertically centered
      flexWrap: "wrap", // Allows wrapping
    },
    logoContainer: { // Container for logo and text
      display: "flex", // Flexbox layout
      flexDirection: "column", // Stacks vertically
      alignItems: "center", // Centers items
      gap: "0.5rem", // Space between items
      flex: 1, // Takes available space
      textAlign: "center", // Centers text
    },
    logoImg: { // Logo image
      height: "110px", // Fixed height
      width: "110px", // Fixed width
    },
    logoText: { // Container for logo text
      display: "flex", // Flexbox layout
      flexDirection: "column", // Stacks vertically
      alignItems: "center", // Centers items
    },
    logoTitle: { // Main title
      fontSize: "1.4rem", // Font size
      fontWeight: 700, // Bold
      margin: "0", // No margin
      marginLeft: "18rem", // Margin to the left
      color: "#fff", // White text
      textAlign: "center", // Centers text
      width: "100%", // Full width for centering
    },
    logoSubtitle: { // Subtitle
      fontSize: "1rem", // Font size
      fontWeight: 600, // Semi-bold
      margin: "0.2rem 0", // Small vertical margin
      color: "rgba(255,255,255,0.9)", // Slightly transparent white
    },
    logoCaption: { // Caption
      fontSize: "0.8rem", // Smaller font
      color: "rgba(255,255,255,0.8)", // More transparent white
      margin: "0.2rem 0", // Small vertical margin
    },
    partnerLogos: { // Container for partner logos
      marginLeft: "20rem", // Margin to the left
      display: "flex", // Flexbox layout
      gap: "1rem", // Space between logos
      alignItems: "center", // Vertically centered
    },
    partnerLogo: { // Individual partner logo
      height: "100px", // Fixed height
      width: "auto", // Auto width
    },
    mobileMenuButton: { // Mobile menu toggle button
      fontSize: "1.5rem", // Icon size
      cursor: "pointer", // Pointer cursor
    },
    navLinksContainer: { // Container for navigation links
      display: "flex", // Flexbox layout
      gap: "1.5rem", // Space between items
      alignItems: "center", // Vertically centered
    },
    navLinks: { // Container for nav links
      display: "flex", // Flexbox layout
      gap: "1rem", // Space between links
    },
    navLink: { // Individual nav link
      color: "white", // White text
      textDecoration: "none", // No underline
      fontSize: "0.9rem", // Font size
      fontWeight: 500, // Medium weight
      padding: "0.5rem 1rem", // Padding
      borderRadius: "4px", // Rounded corners
      transition: "all 0.3s ease", // Smooth transition
      cursor: "pointer", // Pointer cursor
    },
    navLinkHover: { // Hover state for nav link
      backgroundColor: "rgba(255,255,255,0.1)", // Light background
    },
    loginButton: { // Login button
      background: "white", // White background
      color: "#2e7d32", // Green text
      padding: "0.5rem 1.5rem", // Padding
      borderRadius: "4px", // Rounded corners
      fontWeight: 600, // Bold
      cursor: "pointer", // Pointer cursor
      transition: "all 0.3s ease", // Smooth transition
      border: "none", // No border
    },
    loginButtonHover: { // Hover state for login button
      transform: "translateY(-2px)", // Slight lift
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Shadow
    },
    hero: { // Hero section
      height: "100vh", // Full viewport height
      display: "flex", // Flexbox layout
      alignItems: "center", // Vertically centered
      justifyContent: "center", // Horizontally centered
      position: "relative", // Relative for overlay
      overflow: "hidden", // Hides overflow
    },
    heroOverlay: { // Dark overlay for hero
      position: "absolute", // Absolute positioning
      top: 0, // Aligns to top
      left: 0, // Aligns to left
      width: "100%", // Full width
      height: "100%", // Full height
      backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent black
    },
    heroContent: { // Hero content container
      position: "relative", // Relative for z-index
      zIndex: 10, // Above overlay
      textAlign: "center", // Centered text
      maxWidth: "800px", // Maximum width
      padding: "0 2rem", // Padding
    },
    heroTitle: { // Hero title
      fontSize: "3.5rem", // Large font
      fontWeight: 700, // Bold
      color: "white", // White text
      marginBottom: "1.5rem", // Bottom margin
      textShadow: "0 2px 4px rgba(0,0,0,0.3)", // Text shadow
    },
    heroSubtitle: { // Hero subtitle
      fontSize: "1.5rem", // Font size
      color: "white", // White text
      marginBottom: "2rem", // Bottom margin
      textShadow: "0 1px 2px rgba(0,0,0,0.2)", // Text shadow
    },
    exploreButton: { // Explore button
      display: "inline-block", // Inline-block for link
      background: "#2e7d32", // Green background
      color: "white", // White text
      padding: "1rem 2.5rem", // Padding
      borderRadius: "50px", // Rounded corners
      fontWeight: 600, // Bold
      textDecoration: "none", // No underline
      transition: "all 0.3s ease", // Smooth transition
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)", // Shadow
    },
    exploreButtonHover: { // Hover state for explore button
      transform: "translateY(-3px)", // Lift effect
      boxShadow: "0 6px 12px rgba(0,0,0,0.3)", // Larger shadow
      background: "#1e5631", // Darker green
    },
    section: {
    padding: "5rem 0",
    width: "100%",
    boxSizing: "border-box",
  },
    sectionContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 1rem",
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Center all section content
  },
    sectionTitle: { // Section title
      textAlign: "center", // Centered text
      fontSize: "2.5rem", // Font size
      fontWeight: 700, // Bold
      color: "#1e5631", // Dark green
      marginBottom: "3rem", // Bottom margin
      position: "relative", // Relative for underline
    },
    sectionTitleLine: { // Underline for section title
      position: "absolute", // Absolute positioning
      bottom: "-1rem", // Below title
      left: "50%", // Centered
      transform: "translateX(-50%)", // Horizontally centered
      width: "80px", // Fixed width
      height: "4px", // Fixed height
      background: "#2e7d32", // Green
      borderRadius: "2px", // Rounded
    },
    aboutContent: { // About section content
      display: "flex", // Flexbox layout
      flexDirection: windowWidth <= 768 ? "column" : "row", // Column on mobile, row on desktop
      gap: "3rem", // Space between items
      alignItems: "center", // Vertically centered
    },
    aboutImage: { // About section image
      flex: 1, // Takes equal space
      borderRadius: "8px", // Rounded corners
      overflow: "hidden", // Hides overflow
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)", // Shadow
      width: "100%", // Full width
    },
    aboutText: { // About section text
      flex: 1, // Takes equal space
    },
    aboutParagraph: { // Paragraph in about section
      fontSize: "1.1rem", // Font size
      color: "#555", // Gray text
      marginBottom: "1.5rem", // Bottom margin
      lineHeight: 1.8, // Line height
      textAlign: "justify", // Justified text
    },
    infoBox: { // Info box for last updated
      background: "#e8f5e9", // Light green background
      padding: "1.5rem", // Padding
      borderRadius: "8px", // Rounded corners
      borderLeft: "4px solid #2e7d32", // Green left border
    },
    infoText: { // Text in info box
      color: "#1e5631", // Dark green
      fontWeight: 500, // Medium weight
      margin: 0, // No margin
    },
    historyContent: { // History section content
      display: "flex", // Flexbox layout
      flexDirection: windowWidth <= 768 ? "column" : "row", // Column on mobile, row on desktop
      gap: "3rem", // Space between items
    },
    historyMain: { // Main history content
      flex: 2, // Takes more space
    },
    historyImages: { // History images container
      flex: 1, // Takes less space
      display: "flex", // Flexbox layout
      flexDirection: "column", // Stacks vertically
      gap: "1.5rem", // Space between images
    },
    historyImage: { // Individual history image
      borderRadius: "8px", // Rounded corners
      overflow: "hidden", // Hides overflow
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Shadow
    },
    subsectionTitle: { // Subsection title
      fontSize: "1.8rem", // Font size
      fontWeight: 600, // Semi-bold
      color: "#1e5631", // Dark green
      margin: "2rem 0 1rem", // Margins
    },
    listItem: { // List item
      display: "flex", // Flexbox layout
      alignItems: "flex-start", // Aligns top
      gap: "0.5rem", // Space between icon and text
      textAlign: "justify", // Justified text
ontSize: "1.1rem", // Font size
      color: "#555", // Gray text
      marginBottom: "1.5rem", // Bottom margin
      lineHeight: 1.8, // Line height
      },
    listIcon: { // List item icon
      color: "#2e7d32", // Green
      marginTop: "0.3rem", // Slight offset
    },
    reachContent: { // How to Reach content
      display: "flex", // Flexbox layout
      flexDirection: windowWidth <= 768 ? "column" : "row", // Column on mobile, row on desktop
      gap: "3rem", // Space between items
      alignItems: "center", // Vertically centered
    },
    reachMap: { // Map container
      flex: 1, // Takes equal space
      borderRadius: "8px", // Rounded corners
      overflow: "hidden", // Hides overflow
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)", // Shadow
      height: "400px", // Fixed height
    },
    reachText: { // How to Reach text
      flex: 1, // Takes equal space
    },
    contactGrid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2rem",
    width: "100%",
  },
  contactCard: {
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
    contactHeader: { // Contact card header
      background: "#2e7d32", // Green background
      color: "white", // White text
      padding: "1.5rem", // Padding
      textAlign: "center", // Centered text
    },
    contactBody: { // Contact card body
      padding: "1.5rem", // Padding
    },
    contactItem: { // Contact item
      display: "flex", // Flexbox layout
      alignItems: "center", // Vertically centered
      gap: "1rem", // Space between icon and text
      marginBottom: "1.5rem", // Bottom margin
    },
    contactIcon: { // Contact icon
      fontSize: "1.2rem", // Icon size
      color: "#2e7d32", // Green
    },
    formInput: { // Form input field
      width: "100%", // Full width
      padding: "0.8rem 1rem", // Padding
      border: "1px solid #ddd", // Light border
      borderRadius: "4px", // Rounded corners
      marginBottom: "1rem", // Bottom margin
      fontSize: "1rem", // Font size
    },
    formTextarea: { // Form textarea
      width: "100%", // Full width
      padding: "0.8rem 1rem", // Padding
      border: "1px solid #ddd", // Light border
      borderRadius: "4px", // Rounded corners
      marginBottom: "1rem", // Bottom margin
      fontSize: "1rem", // Font size
      minHeight: "120px", // Minimum height
    },
    submitButton: { // Form submit button
      width: "100%", // Full width
      background: "#2e7d32", // Green background
      color: "white", // White text
      padding: "0.8rem", // Padding
      border: "none", // No border
      borderRadius: "4px", // Rounded corners
      fontSize: "1rem", // Font size
      fontWeight: 600, // Bold
      cursor: "pointer", // Pointer cursor
      transition: "all 0.3s ease", // Smooth transition
    },
    submitButtonHover: { // Hover state for submit button
      background: "#1e5631", // Darker green
    },
    footer: { // Footer
      background: "#1e5631", // Dark green background
      color: "white", // White text
      padding: "3rem 0", // Vertical padding
      textAlign: "center", // Centered text
    },
    footerContent: { // Footer content container
      maxWidth: "1200px", // Maximum width
      margin: "0 auto", // Centered
      padding: "0 2rem", // Horizontal padding
    },
    footerLogo: { // Footer logo
      marginBottom: "1.5rem", // Bottom margin
    },
    footerLinks: { // Footer links container
      display: "flex", // Flexbox layout
      justifyContent: "center", // Centered
      gap: "1.5rem", // Space between links
      marginBottom: "2rem", // Bottom margin
    },
    footerLink: { // Individual footer link
      color: "rgba(255,255,255,0.8)", // Slightly transparent white
      textDecoration: "none", // No underline
      transition: "all 0.3s ease", // Smooth transition
    },
    footerLinkHover: { // Hover state for footer link
      color: "white", // White
    },
    socialLinks: { // Social media links container
      display: "flex", // Flexbox layout
      justifyContent: "center", // Centered
      gap: "1.5rem", // Space between links
      marginBottom: "2rem", // Bottom margin
    },
    socialLink: { // Individual social link
      color: "white", // White
      fontSize: "1.5rem", // Icon size
      transition: "all 0.3s ease", // Smooth transition
    },
    socialLinkHover: { // Hover state for social link
      transform: "translateY(-3px)", // Lift effect
    },
    copyright: { // Copyright text
      color: "rgba(255,255,255,0.7)", // Transparent white
      fontSize: "0.9rem", // Font size
    },
  };

  // -------------------
  // JSX Rendering
  // -------------------
  return (
    <div style={styles.container}> {/* Main container */}
      {/* Navigation Bar */}
      <nav style={styles.nav}> {/* Fixed navigation bar */}
        <div style={styles.navContainer}> {/* Nav content container */}
         <div style={{
    width: "100vw", // Changed from maxWidth to width for full viewport width
    minWidth: "auto", // Optional: ensures a minimum width for large layouts
    display: "flex",
    marginLeft: "0", // Centers the content
    alignItems: "center",
    justifyContent: "space-between",
      flexWrap: "wrap",         // Allows wrapping
    padding: "0 4rem", // Increased horizontal padding for more space
    background: "white"
  }}>
    {/* Left: Emblem */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 120 }}>
      <img
        src="/images/emblem_of_india.png"
        alt="Emblem of India"
        style={{ height: "140px", width: "auto", marginBottom: 4 }}
      />
    </div>
    {/* Center: Text */}
    <div style={{ flex: 1, textAlign: "left", marginLeft: 32 }}>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#00695c", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
        Database Management System
      </div>
      <div style={{ fontSize: "1.0rem", color: "#222", fontWeight: 500 }}>
                                      Central Academy for State Forest Service Coimbatore<br /></div>
       <div style={{ fontSize: "0.8rem", color: "#222", fontWeight: 500 }}>

                             Directorate of Forest Education,<br />

        Ministry of Environment, Forest and Climate Change,<br />
        Government of India
      </div>
    </div>
    {/* Right: Partner Logos */}
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", minWidth: 320, justifyContent: "flex-end" }}>
      <img src="/images/ministry.png" alt="Ministry" style={{ height: 100, width: "auto" }} />
      <img src="/images/casfos_logo.jpg" alt="CASFOS" style={{ height: 100, width: "auto" }} />
      <img src="/images/lifestyle_for_environment.png" alt="Lifestyle" style={{ height: 100, width: "auto" }} />
    </div>
  </div>
  </div>
  <div>
        <div style={styles.navContainer1}> {/* Nav content container */}
          
          <div 
            style={{ 
              ...styles.mobileMenuButton,
              display: windowWidth <= 768 ? 'block' : 'none'
            }}
            onClick={() => setMenuOpen(!menuOpen)} // Toggles mobile menu
          >
            {menuOpen ? <FiX /> : <FiMenu />} {/* Shows close or menu icon */}
          </div>
          
          <div 
            style={{ 
              ...styles.navLinksContainer,
              display: menuOpen || windowWidth > 768 ? 'flex' : 'none', // Shows on menu open or desktop
              flexDirection: windowWidth <= 768 ? 'column' : 'row', // Column on mobile, row on desktop
              position: windowWidth <= 768 ? 'absolute' : 'static', // Absolute on mobile
              top: windowWidth <= 768 ? '100%' : 'auto', // Below nav on mobile
              left: windowWidth <= 768 ? 0 : 'auto', // Full width on mobile
              right: windowWidth <= 768 ? 0 : 'auto',
              backgroundColor: windowWidth <= 768 ? '#1e5631' : 'transparent', // Green background on mobile
              padding: windowWidth <= 768 ? '1rem' : 0, // Padding on mobile
            }}
          >
            <div style={{ 
              ...styles.navLinks,
              flexDirection: windowWidth <= 768 ? 'column' : 'row' // Column on mobile, row on desktop
            }}> {/* Nav links container */}
              {[
                { id: "hero", label: "Home" },
                { id: "about", label: "About Us" },
                { id: "history", label: "History" },
                { id: "reach", label: "How to Reach" },
                { id: "contact", label: "Contact Us" },
              ].map(({ id, label }) => (
                <Link
                  key={id}
                  to={id}
                  smooth={true}
                  duration={500}
                  offset={-80} // Adjusts for fixed header
                  style={styles.navLink}
                  onClick={() => {
                    setMenuOpen(false); // Closes mobile menu
                    const element = document.getElementById(id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
                    }
                  }}
                >
                  {label}
                </Link>
              ))} {/* Navigation links */}
              <a
                href="http://dfe.gov.in/uploads/documents/37102doc_certifcate-of-accreditation-coimbatore-file.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.navLink}
              >
                Accreditation
              </a> {/* External certificate link */}
            </div>
            <button
              style={styles.loginButton}
              onMouseEnter={e => e.currentTarget.style.transform = styles.loginButtonHover.transform} // Hover lift
              onMouseLeave={e => e.currentTarget.style.transform = ''} // Reset
              onClick={() => navigate("/login")} // Navigates to login
            >
              Login
            </button> {/* Login button */}
          </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" style={styles.hero}> {/* Hero section */}
        <div style={styles.heroOverlay}></div> {/* Dark overlay */}
        <div 
          style={{ 
            ...styles.hero, 
            backgroundImage: "url('/images/casfos_building.jpg')", // Background image
            backgroundSize: "cover", // Covers area
            backgroundPosition: "center", // Centered
            position: "absolute", // Absolute positioning
            inset: 0 // Fills container
          }}
        ></div>
        <div style={styles.heroContent}> {/* Hero content */}
          <h1 style={styles.heroTitle}>Welcome to CASFOS</h1> {/* Main title */}
          <p style={styles.heroSubtitle}>
            Central Academy for State Forest Service, Coimbatore
          </p> {/* Subtitle */}
          <Link
                  key="about"
                  to="about"
                  smooth={true}
                  duration={500}
                  offset={-80} // Adjusts for fixed header
  style={styles.exploreButton}
  activeStyle={styles.exploreButtonHover}
  onMouseEnter={e => e.currentTarget.style.transform = styles.exploreButtonHover.transform}
  onMouseLeave={e => e.currentTarget.style.transform = ''}                  onClick={() => {
                    setMenuOpen(false); // Closes mobile menu
                    const element = document.getElementById("about");
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
                    }
                  }}
                >
            Explore More
          </Link> {/* Explore button */}
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={styles.section}> {/* About section */}
        <div style={styles.sectionContainer}> {/* Content container */}
          <div>
            <h2 style={styles.sectionTitle}>
              About Us
              <span style={styles.sectionTitleLine}></span> {/* Underline */}
            </h2>
          </div>
          
          <div style={styles.aboutContent}> {/* About content */}
            <div style={styles.aboutText}> {/* Text content */}
              <p style={styles.aboutParagraph}>
                The Central Academy for State Forest Service(CASFOS), Coimbatore is one of
                the premier institutions under the aegis of Directorate of Forest
                Education, Ministry of Environment, Forest and Climate Change,
                Dehradun which imparts Professional Induction Training to the
                newly recruited State Forest Officers (ACF) and Forest Range
                Officers (FRO) from various States and offers In-Service Training
                to the State Forest Service Officers of DCF, ACF, and FRO ranks.
              </p> {/* Paragraph 1 */}
               <img
                src="/images/casfos_vana_vigyan.png"
                alt="CASFOS"
                style={{ width: "100%", height: "auto", display: "block" }} // Full-width image
              />
              <br></br>
              <p style={styles.aboutParagraph}>
                It also conducts General Awareness & Capacity building courses/workshops for other stake holders on importance of Forests, Forest Policy and Law to enable smooth interface between Forest and other departments
              </p>
              <p style={styles.aboutParagraph}>
                The Academy was set up in the year 1980. Prior to this, the
                State Forest Service Officers had been were trained at the
                erstwhile Indian Forest College, Dehradun and State Forest Service
                College, Burnihat.
              </p> {/* Paragraph 2 */}
             
            </div>
           
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history" style={{ ...styles.section, backgroundColor: "#f5f5f5" }}> {/* History section with light background */}
        <div style={styles.sectionContainer}> {/* Content container */}
          <div>
            <h2 style={styles.sectionTitle}>
              History of the Academy
              <span style={styles.sectionTitleLine}></span> {/* Underline */}
            </h2>
          </div>

          <div style={styles.historyContent}> {/* History content */}
            <div style={styles.historyMain}> {/* Main text content */}
                                      <h3 style={styles.subsectionTitle}>Genesis of Forest Training in Coimbatore</h3> {/* Subsection title */}

              <p style={styles.aboutParagraph}>
                It is interesting to note that CASFOS Coimbatore played a major role in forestry education and training in South India. The Forestry Education commenced in India in 1867, based on the recommendation of Sir Dietrich Brandis, the First Inspector General of Forests. A Forest school was set up to train Rangers and Foresters at Dehradun in the year 1878 by the then North West Province which was later taken over by the Government of India and designated as the Imperial Forest College.
              </p> {/* Paragraph */}
              <p style={styles.aboutParagraph}>
                Next mile stone in Forestry Education in India was the establishment of Madras Forest College at Coimbatore in the year 1912 by the then Madras Presidency with Mr. F. L. C. Cowley Brown, IFS, as its first Principal. Mr. F. A. Lodge, then Conservator of Forests in Coimbatore was instrumental in the establishment of this College. It was the second Forest Rangers College in India, after DehraDun. It was set up to meet the rising demand of trained Foresters in the country, especially those from South India.
              </p>
              <p style={styles.aboutParagraph}>
                During the Second World War, the Madras Forest College was closed down and was revived in 1945 by Mr. C. R. Ranganathan, IFS, as its first Indian Principal. It was taken over by the Government of India in 1948 to train more number of Forest Ranger Trainees as the demand was going up after Independence.
              </p>
              <p  style={styles.aboutParagraph}>
                The historic Forest Campus that housed the MFC later became the “Southern Forest Rangers College” (SFRC) in the year 1955. Under the aegis of Government of India, 31 batches of Forest Rangers passed out from the SFRC after completing rigorous training of two years. SFRC has trained more than 4000 Forest Ranger officers between 1912 and 1988. The trainees included not only Indians but also from Ceylon, Afghanistan, Uganda, Malaya, Ghana, Fiji, Laos, Sierra Leone, British Guyana, etc.
              </p>
              <p style={styles.aboutParagraph}>
                Due to policy decision of the Government of India, that imparting Induction and In-service Training to the Forestry Personnel below the rank of Assistant Conservator of Forests should rest with the State Government, the training activities came to an end on 31.12.1987 in the Southern Forest Rangers College.
                </p>
                <p style={styles.aboutParagraph}>
                  State Forest Service Officers were trained at the College, erstwhile Indian Forest College, Dehradun and State Forest Service College, Burnihat. With the advent of various developmental schemes in the Forestry sector during the IV and V Five year plans, and launching of the Social Forestry Projects in many States, the Government of India felt the urgency of starting two more institutions to train the increasing number of officers specially from the State Services, and as a sequel to this the State Forest Service College, Coimbatore was established on 25th January, 1980 under the aegis of Directorate of Forest Education, Ministry of Environment & Forests. Later it was rechristened as Central Academy for State Forest Service (CASFOS).
                </p>
                <p style={styles.aboutParagraph}>
                  CASFOS Coimbatore was brought under the single administrative control of Director, IGNFA, Dehradun along with the other Academies as integration of all Forest Training Academies under a single command. (Vide order no. 15-15/2018-RT, dated 03-02-2022)
                </p>
              <h3 style={styles.subsectionTitle}>Mandate</h3> {/* Subsection title */}
              <ul style={{ listStyle: "none", padding: 0 }}> {/* Mandate list */}
                {[
                  "To impart Professional training to the newly recruited State Forest Service officers and to bring them up as capable of meeting future challenges in the sphere of Forests, Wildlife & Environment through Capacity building & Knowledge sharing",
                  "Strengthening existing management process and disseminating new concepts through continued education, in the shape of In-service Courses to augment their managerial skills with administrative & technical acumen.",
                  "Conducting Special & Theme based Workshops and Refresher Courses covering emerging issues in forestry research and technology.",
                  "Re-orienting forest education in tune with requisite parameters of ecology and environment."
                ].map((item, index) => (
                  <li key={index} style={styles.listItem}>
                    <span style={styles.listIcon}>✓</span> {/* Checkmark icon */}
                    <span>{item}</span> {/* List item text */}
                  </li>
                ))}
              </ul>
              
            
            </div>
            
           
          </div>
        </div>
      </section>

      {/* How to Reach Section */}
      <section id="reach" style={styles.section}> {/* How to Reach section */}
        <div style={styles.sectionContainer}> {/* Content container */}
          <div>
            <h2 style={styles.sectionTitle}>
              How To Reach
              <span style={styles.sectionTitleLine}></span> {/* Underline */}
            </h2>
          </div>
          
          <div style={{ 
            backgroundColor: "#e8f5e9", // Light green background
            borderRadius: "8px", // Rounded corners
            padding: "2rem", // Padding
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)" // Shadow
          }}> {/* Section wrapper */}
            <div style={styles.reachContent}> {/* Content */}
              <div style={styles.reachText}> {/* Text content */}
                <p style={styles.aboutParagraph}>
                  Setup in the picturesque Forest Campus, R. S. Puram, Coimbatore,
                  Tamil Nadu, the Central Academy for State Forest Service is
                  situated at a distance of 5 km from the Coimbatore Railway Station
                  and 12 Km from Coimbatore International Airport.
                </p> {/* Paragraph */}
                <div style={{ 
                  backgroundColor: "white", // White background
                  padding: "1.5rem", // Padding
                  borderRadius: "8px", // Rounded corners
                  borderLeft: "4px solid #2e7d32" // Green left border
                }}> {/* Highlights box */}
                  <h4 style={{ 
                    fontWeight: 600, // Semi-bold
                    color: "#1e5631", // Dark green
                    marginBottom: "1rem" // Bottom margin
                  }}>
                    Location Highlights:
                  </h4> {/* Title */}
                  <ul style={{ listStyle: "none", padding: 0 }}> {/* Highlights list */}
                    <li style={styles.listItem}>• Tamil Nadu Forest Academy (TNFA)</li>
                    <li style={styles.listItem}>• Institute of Forest Genetics & Tree breeding (IFGTB)</li>
                    <li style={styles.listItem}>• Famous 'GASS MUSEUM'</li>
                  </ul>
                </div>
              </div>
              <div style={styles.reachMap}> {/* Map container */}
                <iframe
                  src="http://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.2649732361087!2d76.93796778831465!3d11.018735325854964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba858dde76380d3%3A0xbe08bb837838e990!2sCentral%20Academy%20for%20State%20Forest%20Service!5e0!3m2!1sen!2sin!4v1744637852810!5m2!1sen!2sin"
                  width="600" // Full width
                  height="450" // Full height
                  style={{ border: 0 }} // No border
                  allowFullScreen="" // Allows fullscreen
                  loading="lazy" // Lazy loading
                  referrerPolicy="no-referrer-when-downgrade" // Security policy
                /> {/* Google Maps iframe */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ ...styles.section, backgroundColor: "#f5f5f5" }}> {/* Contact section with light background */}
        <div style={styles.sectionContainer}> {/* Content container */}
          <div>
            <h2 style={styles.sectionTitle}>
              Contact Us
              <span style={styles.sectionTitleLine}></span> {/* Underline */}
            </h2>
          </div>
          
          <div style={styles.contactGrid}> {/* Contact cards grid */}
            <div style={styles.contactCard}> {/* Contact info card */}
              <div style={styles.contactHeader}> {/* Card header */}
                
                <h3 style={{ margin: 0 }}>The Principal,</h3> {/* Title */}
                                <h3 style={{ margin: 0 }}>Central Academy for State Forest Service Coimbatore,</h3> {/* Title */}
                                <h3 style={{ margin: 0 }}>Directorate of Forest Education,</h3> {/* Title */}
                                <h3 style={{ margin: 0 }}>Ministry of Environment, Forest and Climate Change,</h3> {/* Title */}
                                <h3 style={{ margin: 0 }}>Government of India</h3> {/* Title */}

              </div>
              <div style={styles.contactBody}> {/* Card body */}
                <div style={styles.contactItem}> {/* Email item */}
                  <FiMail style={styles.contactIcon} /> {/* Email icon */}
                  <div>
                    <h4 style={{ margin: "0 0 0.3rem 0" }}>Email</h4> {/* Label */}
                    <p style={{ margin: 0 }}>casfos-coimbatore@gov.in</p> {/* Email 1 */}
                    <p style={{ margin: "0.3rem 0 0 0" }}>casfoscbe-trng@gov.in</p> {/* Email 2 */}
                  </div>
                </div>
                
                <div style={styles.contactItem}> {/* Phone item */}
                  <FiPhone style={styles.contactIcon} /> {/* Phone icon */}
                  <div>
                    <h4 style={{ margin: "0 0 0.3rem 0" }}>Phone</h4> {/* Label */}
                    <p style={{ margin: 0 }}>0422-2450313</p> {/* Phone number */}
                  </div>
                </div>
                
                <div style={styles.contactItem}> {/* Address item */}
                  <FiMapPin style={styles.contactIcon} /> {/* Map pin icon */}
                  <div>
                    <h4 style={{ margin: "0 0 0.3rem 0" }}>Address</h4> {/* Label */}
                    <p style={{ margin: 0 }}>Forest Campus, R. S. Puram</p> {/* Address line 1 */}
                    <p style={{ margin: "0.3rem 0 0 0" }}>Coimbatore, Tamil Nadu - 641002</p> {/* Address line 2 */}
                  </div>
                </div>
              </div>
            </div>
            
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}> {/* Footer */}
        <div style={styles.footerContent}> {/* Content container */}
          <div style={styles.footerLogo}> {/* Logo section */}
            <h3 style={{ margin: "0 0 0.5rem 0" }}>CASFOS, Coimbatore</h3> {/* Title */}
            <p style={{ margin: "0.2rem 0", opacity: 0.8 }}>
              Directorate of Forest Education
            </p>
            <p style={{ margin: "0.2rem 0", opacity: 0.8 }}>
              Ministry of Environment, Forest and Climate Change
            </p> {/* Subtitle 1 */}
            <p style={{ margin: "0.2rem 0", opacity: 0.8 }}>
              Government of India
            </p> {/* Subtitle 2 */}
          </div>
          <div style={styles.socialLinks}> {/* Social media links */}
            <a href="https://twitter.com/dfe_goi" style={styles.socialLink}>
              <FiTwitter />
            </a> {/* Twitter link */}
            <a href="https://www.instagram.com/dfe_goi/" style={styles.socialLink}>
              <FiInstagram />
            </a> {/* Instagram link */}
            <a href="https://www.facebook.com/DFE.Dehradun" style={styles.socialLink}>
    <FiFacebook />
            </a> {/* LinkedIn link */}
          </div>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} CASFOS, Coimbatore. All rights reserved.
          </p> {/* Copyright text */}
        </div>
      </footer>
    </div>
  );
};

// Exports the component as default
export default MainPage;
