/**
 * Overview:
 * This is a React component for the Principal Dashboard in a faculty and asset management system for the Central Academy for State Forest Service (CASFOS).
 * It provides:
 * - A sidebar for navigation to asset and faculty updation/view sections.
 * - A notification system displaying recent asset-related actions (approvals, rejections) with expandable details and clear functionality.
 * - Static sections for About Us, History, How to Reach, and Contact Us, showcasing institutional information, copied exactly from MainPage.jsx.
 * - A hero section highlighting the institution's role.
 * - Responsive design with a modern UI, using external CSS (dashstyle.css, style.css) and inline styles for consistency with MainPage.jsx.
 *
 * The component uses React Router for URL parameter parsing, axios for API calls to fetch and manage notifications, and Helmet for SEO and metadata.
 * Notifications are fetched from a backend API at 'http://${ip}:${port}' for asset-related actions, sorted by actionTime, limited to 50.
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import '../styles/DashStyle.css';

const PrincipalDashboard = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // State management
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Router and URL params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username') || 'Guest';
  const serverBaseUrl = `http://${ip}:${port}`;

  // Window Resize Handler
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${serverBaseUrl}/api/assets/get-asset-notification`);
        const sortedNotifications = response.data
          .sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime))
          .slice(0, 50);
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  // Notification handlers
  const handleClearNotification = async (id) => {
    try {
      await axios.delete(`${serverBaseUrl}/api/assets/delete-asset-notification/${id}`);
      setNotifications(notifications.filter((notif) => notif._id !== id));
      if (expandedNotification === id) {
        setExpandedNotification(null);
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${serverBaseUrl}/api/assets/delete-asset-notification/all`);
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  const toggleNotificationPanel = () => {
    setShowNotifications(!showNotifications);
  };

  const formatNotificationTitle = (notification) => {
    const { action, assetCategory, itemNames, subCategory } = notification;
    const itemName = itemNames?.[0] || subCategory || assetCategory || 'item';
    switch (action) {
      case 'asset approved':
        return `Asset Manager approved purchased ${assetCategory || 'assets'}`;
      case 'asset rejected':
        return `Asset Manager rejected ${itemName} purchase`;
      case 'issue approved':
        return `Asset Manager approved issuing ${itemName}`;
      case 'issue rejected':
        return `Asset Manager rejected issuing ${itemName}`;
      case 'return approved for service':
        return `Asset Manager approved ${itemName} for service`;
      case 'return approved for disposal':
        return `Asset Manager approved ${itemName} for disposal`;
      case 'return rejected':
        return `Asset Manager rejected ${itemName} return`;
      default:
        return `${action} - ${assetCategory || 'Unknown'}`;
    }
  };

  const renderNotificationDetails = (notification) => {
    const { action, supplierName, purchaseDate, billNo, receivedBy, itemNames, subCategory, quantity, location, rejectionRemarks, actionTime } = notification;
    return (
      <div className="notification-table">
        <p><strong>Action Time:</strong> {new Date(actionTime).toLocaleString()}</p>
        {action.includes('asset') && (
          <>
            <p><strong>Supplier Name:</strong> {supplierName || 'N/A'}</p>
            <p><strong>Purchase Date:</strong> {purchaseDate ? new Date(purchaseDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Bill No:</strong> {billNo || 'N/A'}</p>
            <p><strong>Received By:</strong> {receivedBy || 'N/A'}</p>
          </>
        )}
        <p><strong>Items:</strong> {itemNames?.join(', ') || subCategory || 'N/A'}</p>
        {quantity && <p><strong>Quantity:</strong> {quantity}</p>}
        {location && <p><strong>Location:</strong> {location}</p>}
        {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
      </div>
    );
  };

  // Styles from MainPage.jsx
  const styles = {
    section: {
      padding: '5rem 0',
      width: '100%',
      boxSizing: 'border-box',
    },
    sectionContainer: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '0 1rem',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2c3e50',
      marginBottom: '3rem',
      position: 'relative',
    },
    sectionTitleLine: {
      position: 'absolute',
      bottom: '-1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80px',
      height: '4px',
      background: '#2e7d32',
      borderRadius: '2px',
    },
    aboutContent: {
      display: 'flex',
      flexDirection: windowWidth <= 768 ? 'column' : 'row',
      gap: '3rem',
      alignItems: 'center',
    },
    aboutImage: {
      flex: 1,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      width: '100%',
    },
    aboutText: {
      flex: 1,
    },
    aboutParagraph: {
      fontSize: '1.1rem',
      color: '#555',
      marginBottom: '1.5rem',
      lineHeight: 1.8,
      textAlign: 'justify',
    },
    historyContent: {
      display: 'flex',
      flexDirection: windowWidth <= 768 ? 'column' : 'row',
      gap: '3rem',
    },
    historyMain: {
      flex: 2,
    },
    historyImages: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    historyImage: {
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    subsectionTitle: {
      fontSize: '1.8rem',
      fontWeight: 600,
      color: '#2c3e50',
      margin: '2rem 0 1rem',
    },
    listItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      fontSize: '1.1rem',
      color: '#555',
      marginBottom: '1.5rem',
      lineHeight: 1.8,
      textAlign: 'justify',
    },
    listIcon: {
      color: '#2e7d32',
      marginTop: '0.3rem',
    },
    reachContent: {
      display: 'flex',
      flexDirection: windowWidth <= 768 ? 'column' : 'row',
      gap: '3rem',
      alignItems: 'center',
    },
    reachMap: {
      flex: 1,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      height: '400px',
    },
    reachText: {
      flex: 1,
    },
    contactGrid: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      width: '100%',
    },
    contactCard: {
      background: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    contactHeader: {
      background: '#2e7d32',
      color: 'white',
      padding: '1.5rem',
      textAlign: 'center',
    },
    contactBody: {
      padding: '1.5rem',
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    contactIcon: {
      fontSize: '1.2rem',
      color: '#2e7d32',
    },
  };

  return (
    <div className="dashboard-container">
      {/* SEO and Metadata */}
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/styles/Style.css" />
        <title>CASFOS - Principal Dashboard</title>
      </Helmet>

      {/* Sidebar Navigation */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">PRINCIPAL</span>
        </a>
        <ul className="side-menu top">
          <li className="active">
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
          <li>
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

      {/* Main Content */}
      <section id="content">
      <nav>
          {/* <i className="bx bx-menu" /> */}
          <form action="#"><div className="form-input"></div></form>

          <div className="nav-right-container">
            
            <div className="username-container">
              <i className="bx bxs-user-circle user-icon" />
              <span className="username">{username}</span>
            </div>
          </div>
        </nav>

        <main className="main-content">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-overlay" />
            <div className="hero-content">
              <br />
              <br />
              <p>Central Academy for State Forest Service - Principal Dashboard</p>
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
                    The Central Academy for State Forest Service (CASFOS), Coimbatore is one of
                    the premier institutions under the aegis of Directorate of Forest
                    Education, Ministry of Environment, Forest and Climate Change,
                    Dehradun which imparts Professional Induction Training to the
                    newly recruited State Forest Officers (ACF) and Forest Range
                    Officers (FRO) from various States and offers In-Service Training
                    to the State Forest Service Officers of DCF, ACF, and FRO ranks.
                  </p>
                  <img
                src="/images/casfos_vana_vigyan.png"
                alt="CASFOS"
                style={{ width: "100%", height: "auto", display: "block" }} // Full-width image
              />
                  <br/>
                  <p style={styles.aboutParagraph}>
                    It also conducts General Awareness & Capacity building courses/workshops for other stake holders on importance of Forests, Forest Policy and Law to enable smooth interface between Forest and other departments
Positive: It also conducts General Awareness & Capacity building courses/workshops for other stakeholders on the importance of Forests, Forest Policy, and Law to enable a smooth interface between Forest and other departments.
 Ascending: It also conducts General Awareness & Capacity building courses/workshops for other stakeholders on the importance of Forests, Forest Policy, and Law to facilitate smooth interaction between Forest and other departments.
                  </p>
                  <p style={styles.aboutParagraph}>
                    The Academy was set up in the year 1980. Prior to this, the
                    State Forest Service Officers had been were trained at the
                    erstwhile Indian Forest College, Dehradun and State Forest Service
                    College, Burnihat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* History Section */}
          <section id="history" style={{ ...styles.section, backgroundColor: '#f5f5f5' }}>
            <div style={styles.sectionContainer}>
              <div>
                <h2 style={styles.sectionTitle}>
                  History of the Academy
                  <span style={styles.sectionTitleLine}></span>
                </h2>
              </div>
              <div style={styles.historyContent}>
                <div style={styles.historyMain}>
                  <h3 style={styles.subsectionTitle}>Genesis of Forest Training in Coimbatore</h3>
                  <p style={styles.aboutParagraph}>
                    It is interesting to note that CASFOS Coimbatore played a major role in forestry education and training in South India. The Forestry Education commenced in India in 1867, based on the recommendation of Sir Dietrich Brandis, the First Inspector General of Forests. A Forest school was set up to train Rangers and Foresters at Dehradun in the year 1878 by the then North West Province which was later taken over by the Government of India and designated as the Imperial Forest College.
                  </p>
                  <p style={styles.aboutParagraph}>
                    Next mile stone in Forestry Education in India was the establishment of Madras Forest College at Coimbatore in the year 1912 by the then Madras Presidency with Mr. F. L. C. Cowley Brown, IFS, as its first Principal. Mr. F. A. Lodge, then Conservator of Forests in Coimbatore was instrumental in the establishment of this College. It was the second Forest Rangers College in India, after DehraDun. It was set up to meet the rising demand of trained Foresters in the country, especially those from South India.
                  </p>
                  <p style={styles.aboutParagraph}>
                    During the Second World War, the Madras Forest College was closed down and was revived in 1945 by Mr. C. R. Ranganathan, IFS, as its first Indian Principal. It was taken over by the Government of India in 1948 to train more number of Forest Ranger Trainees as the demand was going up after Independence.
                  </p>
                  <p style={styles.aboutParagraph}>
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
                  <h3 style={styles.subsectionTitle}>Mandate</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {[
                      'To impart Professional training to the newly recruited State Forest Service officers and to bring them up as capable of meeting future challenges in the sphere of Forests, Wildlife & Environment through Capacity building & Knowledge sharing',
                      'Strengthening existing management process and disseminating new concepts through continued education, in the shape of In-service Courses to augment their managerial skills with administrative & technical acumen.',
                      'Conducting Special & Theme based Workshops and Refresher Courses covering emerging issues in forestry research and technology.',
                      'Re-orienting forest education in tune with requisite parameters of ecology and environment.'
                    ].map((item, index) => (
                      <li key={index} style={styles.listItem}>
                        <span style={styles.listIcon}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
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
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                padding: '2rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
                      backgroundColor: 'white',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2e7d32'
                    }}>
                      <h4 style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '1rem' }}>
                        Location Highlights:
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
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
          <section id="contact" style={{ ...styles.section, backgroundColor: '#f5f5f5' }}>
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
                    <h3 style={{ margin: 0 }}>The Principal,</h3>
                    <h3 style={{ margin: 0 }}>Central Academy for State Forest Service Coimbatore,</h3>
                    <h3 style={{ margin: 0 }}>Directorate of Forest Education,</h3>
                    <h3 style={{ margin: 0 }}>Ministry of Environment, Forest and Climate Change,</h3>
                    <h3 style={{ margin: 0 }}>Government of India</h3>
                  </div>
                  <div style={styles.contactBody}>
                    <div style={styles.contactItem}>
                      <FiMail style={styles.contactIcon} />
                      <div>
                        <h4 style={{ margin: '0 0 0.3rem 0' }}>Email</h4>
                        <p style={{ margin: 0 }}>casfos-coimbatore@gov.in</p>
                        <p style={{ margin: '0.3rem 0 0 0' }}>casfoscbe-trng@gov.in</p>
                      </div>
                    </div>
                    <div style={styles.contactItem}>
                      <FiPhone style={styles.contactIcon} />
                      <div>
                        <h4 style={{ margin: '0 0 0.3rem 0' }}>Phone</h4>
                        <p style={{ margin: 0 }}>0422-2450313</p>
                      </div>
                    </div>
                    <div style={styles.contactItem}>
                      <FiMapPin style={styles.contactIcon} />
                      <div>
                        <h4 style={{ margin: '0 0 0.3rem 0' }}>Address</h4>
                        <p style={{ margin: 0 }}>Forest Campus, R. S. Puram</p>
                        <p style={{ margin: '0.3rem 0 0 0' }}>Coimbatore, Tamil Nadu - 641002</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </section>

      {/* Notification Popup */}
      {showNotifications && (
        <div className="popup-overlay">
          <div className="notification-popup">
            <div className="notification-header">
              <h2>Recent Notifications</h2>
              <div>
                {notifications.length > 0 && (
                  <button className="clear-all-button" onClick={handleClearAll}>
                    Clear All
                  </button>
                )}
                <button className="close-button" onClick={toggleNotificationPanel}>
                  Close
                </button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications available</p>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-banner ${
                      notification.action.includes('approved') ? 'approved' : 'rejected'
                    }`}
                  >
                    <div className="notification-summary">
                      <span className="notification-title">
                        {formatNotificationTitle(notification)}
                        <span className="notification-time">
                          {new Date(notification.actionTime).toLocaleString()}
                        </span>
                      </span>
                      <div>
                        <button
                          className="expand-button"
                          onClick={() => toggleExpand(notification._id)}
                        >
                          {expandedNotification === notification._id ? '▲' : '▼'}
                        </button>
                        <button
                          className="clear-button"
                          onClick={() => handleClearNotification(notification._id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {expandedNotification === notification._id && renderNotificationDetails(notification)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalDashboard;