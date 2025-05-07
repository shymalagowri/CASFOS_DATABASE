import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiMail, FiPhone, FiMapPin, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";

const MainPage = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom styles object
  const styles = {
    container: {
      fontFamily: "'Poppins', sans-serif",
      color: "#333",
      lineHeight: 1.6,
    },
    nav: {
      background: "linear-gradient(135deg, #1e5631 0%, #2e7d32 100%)",
      color: "white",
      padding: "1rem 0",
      position: "fixed",
      width: "100%",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    navContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
    },
    logoContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
      flex: 1,
      textAlign: "center",
    },
    logoImg: {
      height: "70px",
      width: "70px",
      objectFit: "contain",
    },
    logoText: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    logoTitle: {
        fontSize: "1.4rem",
        fontWeight: 700,
        margin: "0",
        color: "#fff",
        textAlign: "center", // Add this
        width: "100%", // Add this to ensure full width for centering
      },
    logoSubtitle: {
      fontSize: "1rem",
      fontWeight: 600,
      margin: "0.2rem 0",
      color: "rgba(255,255,255,0.9)",
    },
    logoCaption: {
      fontSize: "0.8rem",
      color: "rgba(255,255,255,0.8)",
      margin: "0.2rem 0",
    },
    partnerLogos: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
    },
    partnerLogo: {
      height: "50px",
      width: "auto",
      objectFit: "contain",
    },
    mobileMenuButton: {
      fontSize: "1.5rem",
      cursor: "pointer",
    },
    navLinksContainer: {
      display: "flex",
      gap: "1.5rem",
      alignItems: "center",
    },
    navLinks: {
      display: "flex",
      gap: "1rem",
    },
    navLink: {
      color: "white",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: 500,
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    navLinkHover: {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    loginButton: {
      background: "white",
      color: "#2e7d32",
      padding: "0.5rem 1.5rem",
      borderRadius: "4px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "none",
    },
    loginButtonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    hero: {
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    },
    heroOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    heroContent: {
      position: "relative",
      zIndex: 10,
      textAlign: "center",
      maxWidth: "800px",
      padding: "0 2rem",
    },
    heroTitle: {
      fontSize: "3.5rem",
      fontWeight: 700,
      color: "white",
      marginBottom: "1.5rem",
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    },
    heroSubtitle: {
      fontSize: "1.5rem",
      color: "white",
      marginBottom: "2rem",
      textShadow: "0 1px 2px rgba(0,0,0,0.2)",
    },
    exploreButton: {
      display: "inline-block",
      background: "#2e7d32",
      color: "white",
      padding: "1rem 2.5rem",
      borderRadius: "50px",
      fontWeight: 600,
      textDecoration: "none",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    },
    exploreButtonHover: {
      transform: "translateY(-3px)",
      boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
      background: "#1e5631",
    },
    section: {
      padding: "5rem 0",
    },
    sectionContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 2rem",
    },
    sectionTitle: {
      textAlign: "center",
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#1e5631",
      marginBottom: "3rem",
      position: "relative",
    },
    sectionTitleLine: {
      position: "absolute",
      bottom: "-1rem",
      left: "50%",
      transform: "translateX(-50%)",
      width: "80px",
      height: "4px",
      background: "#2e7d32",
      borderRadius: "2px",
    },
    aboutContent: {
      display: "flex",
      flexDirection: windowWidth <= 768 ? "column" : "row",
      gap: "3rem",
      alignItems: "center",
    },
    aboutImage: {
      flex: 1,
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
      width: "100%",
    },
    aboutText: {
      flex: 1,
    },
    aboutParagraph: {
      fontSize: "1.1rem",
      color: "#555",
      marginBottom: "1.5rem",
      lineHeight: 1.8,
    },
    infoBox: {
      background: "#e8f5e9",
      padding: "1.5rem",
      borderRadius: "8px",
      borderLeft: "4px solid #2e7d32",
    },
    infoText: {
      color: "#1e5631",
      fontWeight: 500,
      margin: 0,
    },
    historyContent: {
      display: "flex",
      flexDirection: windowWidth <= 768 ? "column" : "row",
      gap: "3rem",
    },
    historyMain: {
      flex: 2,
    },
    historyImages: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    historyImage: {
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    subsectionTitle: {
      fontSize: "1.8rem",
      fontWeight: 600,
      color: "#1e5631",
      margin: "2rem 0 1rem",
    },
    listItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    listIcon: {
      color: "#2e7d32",
      marginTop: "0.3rem",
    },
    reachContent: {
      display: "flex",
      flexDirection: windowWidth <= 768 ? "column" : "row",
      gap: "3rem",
      alignItems: "center",
    },
    reachMap: {
      flex: 1,
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
      height: "400px",
    },
    reachText: {
      flex: 1,
    },
    contactGrid: {
      display: "grid",
      gridTemplateColumns: windowWidth <= 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "2rem",
    },
    contactCard: {
      background: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    contactHeader: {
      background: "#2e7d32",
      color: "white",
      padding: "1.5rem",
    },
    contactBody: {
      padding: "1.5rem",
    },
    contactItem: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    contactIcon: {
      fontSize: "1.2rem",
      color: "#2e7d32",
    },
    formInput: {
      width: "100%",
      padding: "0.8rem 1rem",
      border: "1px solid #ddd",
      borderRadius: "4px",
      marginBottom: "1rem",
      fontSize: "1rem",
    },
    formTextarea: {
      width: "100%",
      padding: "0.8rem 1rem",
      border: "1px solid #ddd",
      borderRadius: "4px",
      marginBottom: "1rem",
      fontSize: "1rem",
      minHeight: "120px",
    },
    submitButton: {
      width: "100%",
      background: "#2e7d32",
      color: "white",
      padding: "0.8rem",
      border: "none",
      borderRadius: "4px",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    submitButtonHover: {
      background: "#1e5631",
    },
    footer: {
      background: "#1e5631",
      color: "white",
      padding: "3rem 0",
      textAlign: "center",
    },
    footerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 2rem",
    },
    footerLogo: {
      marginBottom: "1.5rem",
    },
    footerLinks: {
      display: "flex",
      justifyContent: "center",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    footerLink: {
      color: "rgba(255,255,255,0.8)",
      textDecoration: "none",
      transition: "all 0.3s ease",
    },
    footerLinkHover: {
      color: "white",
    },
    socialLinks: {
      display: "flex",
      justifyContent: "center",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    socialLink: {
      color: "white",
      fontSize: "1.5rem",
      transition: "all 0.3s ease",
    },
    socialLinkHover: {
      transform: "translateY(-3px)",
    },
    copyright: {
      color: "rgba(255,255,255,0.7)",
      fontSize: "0.9rem",
    },
  };

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logoContainer}>
            <h1 style={styles.logoTitle}>DATABASE MANAGEMENT SYSTEM</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src="/images/emblem_of_india.png"
                alt="Emblem of India"
                style={styles.logoImg}
              />
              <div style={styles.logoText}>
                <h2 style={styles.logoSubtitle}>CASFOS, COIMBATORE</h2>
                <p style={styles.logoCaption}>
                  Ministry of Environment, Forest and Climate Change, Government of India
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ 
            ...styles.partnerLogos, 
            display: windowWidth <= 768 ? 'none' : 'flex' 
          }}>
            <img
              src="/images/ministry.png"
              alt="Ministry"
              style={styles.partnerLogo}
            />
            <img
              src="/images/casfos_dehradun.png"
              alt="CASFOS"
              style={styles.partnerLogo}
            />
            <img
              src="/images/lifestyle_for_environment.png"
              alt="Lifestyle"
              style={styles.partnerLogo}
            />
          </div>
          
          <div 
            style={{ 
              ...styles.mobileMenuButton,
              display: windowWidth <= 768 ? 'block' : 'none'
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </div>
          
          <div 
            style={{ 
              ...styles.navLinksContainer,
              display: menuOpen || windowWidth > 768 ? 'flex' : 'none',
              flexDirection: windowWidth <= 768 ? 'column' : 'row',
              position: windowWidth <= 768 ? 'absolute' : 'static',
              top: windowWidth <= 768 ? '100%' : 'auto',
              left: windowWidth <= 768 ? 0 : 'auto',
              right: windowWidth <= 768 ? 0 : 'auto',
              backgroundColor: windowWidth <= 768 ? '#1e5631' : 'transparent',
              padding: windowWidth <= 768 ? '1rem' : 0,
            }}
          >
            <div style={{ 
              ...styles.navLinks,
              flexDirection: windowWidth <= 768 ? 'column' : 'row'
            }}>
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
    offset={-80} // Adjust this value based on your header height
    style={styles.navLink}
    onClick={() => {
      setMenuOpen(false);
      // Force scroll to the exact position
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }}
  >
    {label}
  </Link>
))}
              <a
                href="http://dfe.gov.in/uploads/documents/37102doc_certifcate-of-accreditation-coimbatore-file.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.navLink}
              >
                Certificate
              </a>
            </div>
            <button
              style={styles.loginButton}
              onMouseEnter={e => e.currentTarget.style.transform = styles.loginButtonHover.transform}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div 
          style={{ 
            ...styles.hero, 
            backgroundImage: "url('/images/casfos_building.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            inset: 0
          }}
        ></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Welcome to CASFOS</h1>
          <p style={styles.heroSubtitle}>
            Central Academy for State Forest Service, Coimbatore
          </p>
          <Link
            to="about"
            smooth
            duration={500}
            style={styles.exploreButton}
            activeStyle={styles.exploreButtonHover}
            onMouseEnter={e => e.currentTarget.style.transform = styles.exploreButtonHover.transform}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            Explore More
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={styles.section}>
        <div style={styles.sectionContainer}>
          <div>
            <h2 style={styles.sectionTitle}>
              About Us
              <span style={styles.sectionTitleLine}></span>
            </h2>
          </div>
          
          <div style={styles.aboutContent}>
            <div style={styles.aboutText}>
              <p style={styles.aboutParagraph}>
                The Central Academy for State Forest Service, Central Academy For
                State Forest Service, Coimbatore (erstwhile State Forest Service
                college) is one of the premier institutions under the aegis of
                Directorate of Forest Education, Ministry of Environment, Forests
                and Climate Change, which imparts professional training to newly
                recruited RFO's and in-service training to the State Forest
                Service Officers of ACF and DCF ranks.
              </p>
              <p style={styles.aboutParagraph}>
                The Academy was set up in the year 1980. Earlier to this, the
                State Forest Service Officers had been were trained at the
                erstwhile Indian Forest College, Dehradun and State Forest Service
                College, Burnihat.
              </p>
              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  <strong>Last updated:</strong> 05 Mar, 2025
                </p>
              </div>
            </div>
            <div style={styles.aboutImage}>
              <img
                src="/images/casfos_vana_vigyan.png"
                alt="CASFOS"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history" style={{ ...styles.section, backgroundColor: "#f5f5f5" }}>
        <div style={styles.sectionContainer}>
          <div>
            <h2 style={styles.sectionTitle}>
              History of the Academy
              <span style={styles.sectionTitleLine}></span>
            </h2>
          </div>
          
          <div style={styles.historyContent}>
            <div style={styles.historyMain}>
              <p style={styles.aboutParagraph}>
                The Central Academy for State Forest Service, Coimbatore is one of
                the premier institutions under the aegis of Directorate of Forest
                Education, Ministry of Environment, Forest and Climate Change,
                Dehradun which imparts Professional Induction Training to the
                newly recruited State Forest Officers (ACF) and Forest Range
                Officers (FRO) from various States and offers In-Service Training
                to the State Forest Service Officers of DCF, ACF, and FRO ranks.
              </p>
              
              <h3 style={styles.subsectionTitle}>Mandate</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {[
                  "To impart Professional training to the newly recruited State Forest Service officers and to bring them up as capable of meeting future challenges in the sphere of Forests, Wildlife & Environment through Capacity building & Knowledge sharing",
                  "Strengthening existing management process and disseminating new concepts through continued education, in the shape of In-service Courses to augment their managerial skills with administrative & technical acumen.",
                  "Conducting Special & Theme based Workshops and Refresher Courses covering emerging issues in forestry research and technology.",
                  "Re-orienting forest education in tune with requisite parameters of ecology and environment."
                ].map((item, index) => (
                  <li key={index} style={styles.listItem}>
                    <span style={styles.listIcon}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <h3 style={styles.subsectionTitle}>Genesis of Forest Training in Coimbatore</h3>
              <p style={styles.aboutParagraph}>
                It is interesting to note that CASFOS Coimbatore played a major
                role in forestry education and training in South India. The
                Forestry Education commenced in India in 1867, based on the
                recommendation of Sir Dietrich Brandis, the First Inspector
                General of Forests.
              </p>
            </div>
            
            <div style={styles.historyImages}>
              <div style={styles.historyImage}>
                <img
                  src="/images/casfos_coimbatore_img4.jpg"
                  alt="History"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "0.5rem" }}>
                  The historic Forest Campus
                </p>
              </div>
              
              <div style={styles.historyImage}>
                <img
                  src="/images/casfos_coimbatore_img5.jpg"
                  alt="History"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "0.5rem" }}>
                  CASFOS Campus View
                </p>
              </div>
              
              <div style={styles.historyImage}>
                <img
                  src="/images/casfos_coimbatore_img3.jpg"
                  alt="History"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "0.5rem" }}>
                  Training Session
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Reach Section */}
      <section id="reach" style={styles.section}>
        <div style={styles.sectionContainer}>
          <div>
            <h2 style={styles.sectionTitle}>
              How To Reach
              <span style={styles.sectionTitleLine}></span>
            </h2>
          </div>
          
          <div style={{ 
            backgroundColor: "#e8f5e9",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={styles.reachContent}>
              <div style={styles.reachText}>
                <p style={styles.aboutParagraph}>
                  Setup in the picturesque Forest Campus, R. S. Puram, Coimbatore,
                  Tamil Nadu, the Central Academy for State Forest Service is
                  situated at a distance of 5 km from the Coimbatore Railway Station
                  and 12 Km from Coimbatore International Airport.
                </p>
                <div style={{ 
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  borderLeft: "4px solid #2e7d32"
                }}>
                  <h4 style={{ 
                    fontWeight: 600,
                    color: "#1e5631",
                    marginBottom: "1rem"
                  }}>
                    Location Highlights:
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    <li style={styles.listItem}>• Tamil Nadu Forest Academy (TNFA)</li>
                    <li style={styles.listItem}>• Institute of Forest Genetics & Tree breeding (IFGTB)</li>
                    <li style={styles.listItem}>• Famous 'GASS MUSEUM'</li>
                  </ul>
                </div>
              </div>
              <div style={styles.reachMap}>
              <iframe
                    src="http://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.2649732361087!2d76.93796778831465!3d11.018735325854964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba858dde76380d3%3A0xbe08bb837838e990!2sCentral%20Academy%20for%20State%20Forest%20Service!5e0!3m2!1sen!2sin!4v1744637852810!5m2!1sen!2sin"
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ ...styles.section, backgroundColor: "#f5f5f5" }}>
        <div style={styles.sectionContainer}>
          <div>
            <h2 style={styles.sectionTitle}>
              Contact Us
              <span style={styles.sectionTitleLine}></span>
            </h2>
          </div>
          
          <div style={styles.contactGrid}>
            <div style={styles.contactCard}>
              <div style={styles.contactHeader}>
                <h3 style={{ margin: 0 }}>Central Academy for State Forest Service</h3>
                <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>Directorate of Forest Education</p>
              </div>
              <div style={styles.contactBody}>
                <div style={styles.contactItem}>
                  <FiMail style={styles.contactIcon} />
                  <div>
                    <h4 style={{ margin: "0 0 0.3rem 0" }}>Email</h4>
                    <p style={{ margin: 0 }}>casfos-coimbatore@gov.in</p>
                    <p style={{ margin: "0.3rem 0 0 0" }}>casfoscbe-trng@gov.in</p>
                  </div>
                </div>
                
                <div style={styles.contactItem}>
                  <FiPhone style={styles.contactIcon} />
                  <div>
                    <h4 style={{ margin: "0 0 0.3rem 0" }}>Phone</h4>
                    <p style={{ margin: 0 }}>0422-2450313</p>
                  </div>
                </div>
                
                <div style={styles.contactItem}>
                  <FiMapPin style={styles.contactIcon} />
                  <div>
                    <h4 style={{ margin: "0 0 0.3rem 0" }}>Address</h4>
                    <p style={{ margin: 0 }}>Forest Campus, R. S. Puram</p>
                    <p style={{ margin: "0.3rem 0 0 0" }}>Coimbatore, Tamil Nadu - 641002</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={styles.contactCard}>
              <div style={styles.contactHeader}>
                <h3 style={{ margin: 0 }}>Quick Contact Form</h3>
                <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>We'll get back to you soon</p>
              </div>
              <div style={styles.contactBody}>
                <form>
                  <div>
                    <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem" }}>Name</label>
                    <input
                      type="text"
                      id="name"
                      style={styles.formInput}
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
                    <input
                      type="email"
                      id="email"
                      style={styles.formInput}
                      placeholder="Your Email"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" style={{ display: "block", marginBottom: "0.5rem" }}>Message</label>
                    <textarea
                      id="message"
                      rows="4"
                      style={styles.formTextarea}
                      placeholder="Your Message"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.submitButtonHover.backgroundColor}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.submitButton.backgroundColor}
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>CASFOS, Coimbatore</h3>
            <p style={{ margin: "0.2rem 0", opacity: 0.8 }}>
              Ministry of Environment, Forest and Climate Change
            </p>
            <p style={{ margin: "0.2rem 0", opacity: 0.8 }}>
              Government of India
            </p>
          </div>
          <div style={styles.socialLinks}>
            <a href="#" style={styles.socialLink}>
              <FiTwitter />
            </a>
            <a href="#" style={styles.socialLink}>
              <FiInstagram />
            </a>
            <a href="#" style={styles.socialLink}>
              <FiLinkedin />
            </a>
          </div>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} CASFOS, Coimbatore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;