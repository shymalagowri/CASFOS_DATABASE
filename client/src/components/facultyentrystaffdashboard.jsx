/**
 * Overview:
 * This is a React component for the Faculty Entry Staff Dashboard in a faculty management system for the Central Academy for State Forest Service (CASFOS).
 * It provides:
 * - A sidebar for navigation to faculty entry and view sections.
 * - A notification system displaying recent faculty-related actions (rejections, notifications) with expandable details, re-enter options, and clear functionality.
 * - Static sections for About Us, History, How to Reach, and Contact Us, showcasing institutional information.
 * - A hero section highlighting the institution's role.
 * - Responsive design with a modern UI, using external CSS (dashstyle.css, style.css) and inline styles for specific elements.
 *
 * The component uses React Router for URL parameter parsing and navigation, axios for API calls to fetch and manage notifications, and Helmet for SEO and metadata.
 * Notifications are fetched from a backend API at 'http://${ip}:${port}' for rejected approvals, verifications, and notify-all-true, sorted by timestamp, limited to 50.
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/dashstyle.css';

/**
 * Constants for notification types
 */
const NOTIFICATION_TYPES = {
  approvalRejection: 'approvalRejection',
  verificationRejection: 'verificationRejection',
  notifyFaculty: 'notifyFaculty',
};

const FacultyEntryStaffDashboard = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // State management
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Router and URL params
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username') || 'Guest';
  const serverBaseUrl = `http://${ip}:${port}`;

  /**
   * Fetches notifications on component mount, sorted by timestamp, limited to 50
   */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [approvalResponse, verificationResponse, notifyResponse] = await Promise.all([
          axios.get(`${serverBaseUrl}/api/faculty/rejected-approvals`),
          axios.get(`${serverBaseUrl}/api/faculty/rejected-verifications`),
          axios.get(`${serverBaseUrl}/api/faculty/notify-all-true`),
        ]);

        const allNotifications = [
          ...approvalResponse.data.map((n) => ({ ...n, type: NOTIFICATION_TYPES.approvalRejection })),
          ...verificationResponse.data.map((n) => ({ ...n, type: NOTIFICATION_TYPES.verificationRejection })),
          ...notifyResponse.data.map((n) => ({ ...n, type: NOTIFICATION_TYPES.notifyFaculty })),
        ];

        const sortedNotifications = allNotifications
          .map((notification) => {
            let timestamp =
              notification.type === NOTIFICATION_TYPES.approvalRejection ||
              notification.type === NOTIFICATION_TYPES.verificationRejection
                ? notification.updatedAt || notification.notificationDate || new Date(0)
                : notification.notificationDate || notification.updatedAt || new Date(0);
            return { ...notification, timestamp: new Date(timestamp) };
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50);

        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  /**
   * Clears a single notification by ID
   * @param {string} id - Notification ID
   */
  const handleClearNotification = async (id, type) => {
    try {
      const endpoint =
        type === NOTIFICATION_TYPES.approvalRejection || type === NOTIFICATION_TYPES.verificationRejection
          ? `${serverBaseUrl}/api/faculty/rejected-approvals/${id}`
          : `${serverBaseUrl}/api/faculty/notifications/${id}`;
      await axios.delete(endpoint);
      setNotifications(notifications.filter((notif) => notif._id !== id));
      if (expandedNotification === id) {
        setExpandedNotification(null);
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  /**
   * Clears all notifications
   */
  const handleClearAll = async () => {
    try {
      await Promise.all([
        axios.delete(`${serverBaseUrl}/api/faculty/rejected-approvals/all`),
        axios.delete(`${serverBaseUrl}/api/faculty/notifications/all`),
      ]);
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  /**
   * Toggles expansion of notification details
   * @param {string} id - Notification ID
   */
  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  /**
   * Toggles visibility of the notification panel
   */
  const toggleNotificationPanel = () => {
    setShowNotifications(!showNotifications);
  };

  /**
   * Formats the notification title based on type
   * @param {Object} notification - Notification object
   * @returns {string} - Formatted title
   */
  const formatNotificationTitle = (notification) => {
    if (notification.type === NOTIFICATION_TYPES.approvalRejection) {
      return `Faculty Approval Rejected - ${notification.name}`;
    } else if (notification.type === NOTIFICATION_TYPES.verificationRejection) {
      return `Faculty Verification Rejected - ${notification.name}`;
    } else if (notification.type === NOTIFICATION_TYPES.notifyFaculty) {
      return `Faculty Notification - ${notification.name}`;
    }
    return 'Unknown Notification';
  };

  /**
   * Handles re-enter navigation
   * @param {Object} notification - Notification object
   */
  const handleReenter = (notification) => {
    navigate(`/facultyentry?username=${encodeURIComponent(username)}`, {
      state: { facultyData: notification },
    });
  };

  /**
   * Renders detailed information for an expanded notification
   * @param {Object} notification - Notification object
   * @returns {JSX.Element} - Notification details component
   */
  const renderNotificationDetails = (notification) => {
    const isRejection =
      notification.type === NOTIFICATION_TYPES.approvalRejection ||
      notification.type === NOTIFICATION_TYPES.verificationRejection;
    const timeField = isRejection ? 'updatedAt' : 'notificationDate';
    const remarksField = isRejection ? 'rejectionRemarks' : 'notifyremarks';

    return (
      <div className="notification-table">
        <p>
          <strong>{isRejection ? 'Rejection' : 'Notification'} Time:</strong>{' '}
          {new Date(notification[timeField]).toLocaleString()}
        </p>
        <p>
          <strong>Name:</strong> {notification.name || 'N/A'}
        </p>
        <p>
          <strong>Remarks:</strong> {notification[remarksField] || 'No remarks provided'}
        </p>
        <button
          className="update-button"
          onClick={() => handleReenter(notification)}
        >
          Re-enter
        </button>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* SEO and Metadata */}
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/styles/style.css" />
        <title>CASFOS - Faculty Entry Staff Dashboard</title>
      </Helmet>

      {/* Sidebar Navigation */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">FACULTY ENTRY STAFF</span>
        </a>
        <ul className="side-menu top">
          <li className="active">
            <a href={`/facultyentrydashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/facultyentry?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty Entry</span>
            </a>
          </li>
          <li>
            <a href={`/viewfaculty?username=${encodeURIComponent(username)}`}>
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
          <i className="bx bx-menu" />
          <form action="#"><div className="form-input"></div></form>

          <div className="nav-right-container">
            <div className="notification-icon-container">
              <i className="fas fa-bell bell-icon" onClick={toggleNotificationPanel} />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </div>

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
              <p>Central Academy for State Forest Service - Faculty Entry Staff Dashboard</p>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="content-section">
            <div className="section-container">
              <h2 className="section-title">About Us</h2>
              <div className="about-content">
                <div className="about-text">
                  <p>
                    The Central Academy for State Forest Service, Coimbatore (CASFOS) is a premier institution under the Directorate of Forest Education, Ministry of Environment, Forests, and Climate Change. It specializes in training Range Forest Officers and State Forest Service Officers.
                  </p>
                  <p>
                    The Faculty Entry Staff play a crucial role in managing faculty data, ensuring accurate entry and verification of faculty details to support training programs. Established in 1980, CASFOS continues to uphold excellence in forestry education.
                  </p>
                </div>
                <div className="about-image">
                  <img
                    src="/images/casfos_vana_vigyan.png"
                    alt="CASFOS Emblem"
                    className="section-image"
                    onError={(e) => (e.target.src = '/images/fallback.jpg')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* History Section */}
          <section id="history" className="content-section alt-bg">
            <div className="section-container">
              <h2 className="section-title">History of the Academy</h2>
              <div className="history-content">
                <div className="history-text">
                  <p>
                    CASFOS Coimbatore is a cornerstone of forestry education, facilitating the management of faculty data to support training initiatives.
                  </p>
                  <h3 className="subsection-title">Mandate</h3>
                  <ul className="mandate-list">
                    <li>Manage accurate entry and verification of faculty details.</li>
                    <li>Support training programs through reliable data management.</li>
                    <li>Contribute to workshops on forestry and environmental conservation.</li>
                    <li>Ensure compliance with educational standards.</li>
                  </ul>
                  <h3 className="subsection-title">Genesis of Forest Training</h3>
                  <p>
                    Forestry education in India began in 1867, with a forest school established in Dehradun (1878). The Madras Forest College, founded in Coimbatore in 1912, trained foresters for South India. Revived in 1945 and renamed the Southern Forest Rangers College (SFRC) in 1955, it trained over 4,000 rangers until 1987. CASFOS Coimbatore was established in 1980 and integrated under IGNFA in 2022.
                  </p>
                </div>
                <div className="history-images">
                  <img
                    src="/images/casfos_coimbatore_img4.jpg"
                    alt="Historical Campus"
                    className="section-image"
                    onError={(e) => (e.target.src = '/images/fallback.jpg')}
                  />
                  <img
                    src="/images/casfos_coimbatore_img5.jpg"
                    alt="Forest Campus"
                    className="section-image"
                    onError={(e) => (e.target.src = '/images/fallback.jpg')}
                  />
                  <img
                    src="/images/casfos_coimbatore_img3.jpg"
                    alt="Training Facility"
                    className="section-image"
                    onError={(e) => (e.target.src = '/images/fallback.jpg')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Reach Section */}
          <section id="reach" className="content-section">
            <div className="section-container">
              <h2 className="section-title">How to Reach</h2>
              <div className="reach-content">
                <div className="reach-text">
                  <p>
                    Located in the scenic Forest Campus, R.S. Puram, Coimbatore, Tamil Nadu, CASFOS is 5 km from Coimbatore Railway Station and 12 km from Coimbatore International Airport.
                  </p>
                  <p>
                    The campus hosts the Tamil Nadu Forest Academy (TNFA), the Institute of Forest Genetics & Tree Breeding (IFGTB), and the renowned GASS Museum, making it a hub for forestry education and research.
                  </p>
                </div>
                <div className="map-container">
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
          </section>

          {/* Contact Section */}
          <section id="contact" className="content-section alt-bg">
            <div className="section-container">
              <h2 className="section-title">Contact Us</h2>
              <div className="contact-content">
                <div className="contact-card">
                  <h3 className="contact-heading">
                    Central Academy for State Forest Service <br />
                    Directorate of Forest Education <br />
                    Ministry of Environment, Forest and Climate Change <br />
                    Government of India
                  </h3>
                  <div className="contact-info">
                    <div className="contact-item">
                      <i className="bx bx-envelope" />
                      <p>
                        <strong>Email:</strong> casfos-coimbatore@gov.in | casfoscbe-trng@gov.in
                      </p>
                    </div>
                    <div className="contact-item">
                      <i className="bx bx-phone" />
                      <p>
                        <strong>Phone:</strong> 0422-2450313
                      </p>
                    </div>
                    <div className="contact-item">
                      <i className="bx bx-map" />
                      <p>
                        <strong>Address:</strong> Forest Campus, R.S. Puram, Coimbatore - 641002, Tamil Nadu
                      </p>
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
                      notification.type === NOTIFICATION_TYPES.approvalRejection ||
                      notification.type === NOTIFICATION_TYPES.verificationRejection
                        ? 'rejected'
                        : 'pending'
                    }`}
                  >
                    <div className="notification-summary">
                      <span className="notification-title">
                        {formatNotificationTitle(notification)}
                        <span className="notification-time">
                          {new Date(notification.updatedAt || notification.notificationDate).toLocaleString()}
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
                          onClick={() => handleClearNotification(notification._id, notification.type)}
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

export default FacultyEntryStaffDashboard;