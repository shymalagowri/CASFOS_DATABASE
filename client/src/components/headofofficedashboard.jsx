/**
 * Overview:
 * This is a React component for the Head of Office (HOO) Dashboard in an asset management and faculty management system for the Central Academy for State Forest Service (CASFOS).
 * It provides:
 * - A sidebar for navigation to user approval, faculty approval, updation, and view sections.
 * - A notification system displaying recent faculty-related actions (pending approvals) with expandable details, view faculty details, acknowledge options, and clear functionality.
 * - Static sections for About Us, History, How to Reach, and Contact Us, showcasing institutional information.
 * - A hero section highlighting the institution's role.
 * - Responsive design with a modern UI, using external CSS (dashstyle.css, style.css) and inline styles for specific elements.
 *
 * The component uses React Router for URL parameter parsing, axios for API calls to fetch and manage notifications, and Helmet for SEO and metadata.
 * Notifications are fetched from a backend API at 'http://${ip}:${port}' for notifyhoo: false, sorted by notificationDate, and limited to 50.
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../styles/dashstyle.css';

/**
 * Constants for notification actions
 */
const NOTIFICATION_ACTIONS = {
  acknowledge: 'acknowledge-hoo',
};

const HOODashboard = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // State management
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [acknowledgeStatus, setAcknowledgeStatus] = useState({});

  // Router and URL params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username') || 'Guest';
  const serverBaseUrl = `http://${ip}:${port}`;

  /**
   * Fetches notifications on component mount, sorted by notificationDate, limited to 50
   */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${serverBaseUrl}/api/faculty/notifyhoo-false`);
        const sortedNotifications = response.data
          .sort((a, b) => new Date(b.notificationDate) - new Date(a.notificationDate))
          .slice(0, 50);
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifyhoo false notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  /**
   * Clears a single notification by ID
   * @param {string} id - Notification ID
   */
  const handleClearNotification = async (id) => {
    try {
      await axios.delete(`${serverBaseUrl}/api/faculty/delete-notification/${id}`);
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  /**
   * Clears all notifications
   */
  const handleClearAll = async () => {
    try {
      await axios.delete(`${serverBaseUrl}/api/faculty/delete-all-notifications`);
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
   * Handles view button click to show faculty details
   * @param {Object} faculty - Faculty notification object
   */
  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  /**
   * Closes faculty details popup
   */
  const closePopup = () => {
    setSelectedFaculty(null);
  };

  /**
   * Handles acknowledge button click
   * @param {string} facultyId - Faculty ID
   */
  const handleAcknowledge = async (facultyId) => {
    setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: 'Acknowledging...' }));
    try {
      const response = await axios.put(`${serverBaseUrl}/api/faculty/acknowledge-hoo/${facultyId}`);
      if (response.data.success) {
        setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: 'Acknowledged' }));
        setNotifications((prev) => prev.filter((n) => n._id !== facultyId));
        setTimeout(() => {
          setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: '' }));
        }, 2000);
      } else {
        setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: 'Failed to Acknowledge' }));
      }
    } catch (error) {
      setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: 'Failed to Acknowledge' }));
      console.error('Error acknowledging notification:', error);
    }
  };

  /**
   * Renders detailed information for an expanded notification
   * @param {Object} notification - Notification object
   * @returns {JSX.Element} - Notification details component
   */
  const renderNotificationDetails = (notification) => {
    return (
      <div className="notification-table">
        <p><strong>Action Time:</strong> {new Date(notification.notificationDate).toLocaleString()}</p>
        <p><strong>Name:</strong> {notification.name || 'N/A'}</p>
        <p><strong>Remarks:</strong> {notification.notifyremarks || 'No remarks provided'}</p>
        <div className="notification-actions">
          <button
            className="update-button"
            onClick={() => handleViewDetails(notification)}
          >
            View Details
          </button>
          <button
            className={`update-button ${
              acknowledgeStatus[notification._id] === 'Acknowledging...' ? 'disabled' : ''
            }`}
            onClick={() => handleAcknowledge(notification._id)}
            disabled={acknowledgeStatus[notification._id] === 'Acknowledging...'}
          >
            {acknowledgeStatus[notification._id] === 'Acknowledging...' && <>Acknowledging...</>}
            {acknowledgeStatus[notification._id] === 'Acknowledged' && <>Acknowledged</>}
            {acknowledgeStatus[notification._id] === 'Failed to Acknowledge' && <>Failed</>}
            {!acknowledgeStatus[notification._id] && 'Acknowledge'}
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renders faculty details popup
   * @param {Object} faculty - Faculty object
   * @returns {JSX.Element} - Faculty details component
   */
  const renderFacultyDetails = (faculty) => {
    const renderValue = (value, key) => {
      if (key === 'photograph' && typeof value === 'string') {
        const imageUrl = `${serverBaseUrl}/uploads/${value.split('\\').pop()}`;
        return (
          <img
            src={imageUrl}
            alt="Photograph"
            className="faculty-photo"
            onError={(e) => (e.target.src = '/images/fallback.jpg')}
          />
        );
      }
      if (Array.isArray(value)) {
        return (
          <ul className="faculty-list">
            {value.map((item, idx) => (
              <li key={idx}>{renderValue(item)}</li>
            ))}
          </ul>
        );
      }
      if (typeof value === 'object' && value !== null) {
        return (
          <ul className="faculty-list">
            {Object.entries(value)
              .filter(([subKey]) => subKey !== '_id' && subKey !== 'conduct')
              .map(([subKey, subValue]) => (
                <li key={subKey}>
                  <strong>
                    {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                  </strong>{' '}
                  {renderValue(subValue)}
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || '-';
    };

    return (
      <div className="popup-overlay">
        <div className="notification-popup">
          <h2 className="section-title">Faculty Details</h2>
          <table className="faculty-table">
            <tbody>
              {Object.entries(faculty)
                .filter(([key]) => key !== '_id' && key !== 'conduct')
                .map(([key, value]) => (
                  <tr key={key}>
                    <td className="faculty-key">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                    </td>
                    <td className="faculty-value">{renderValue(value, key)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button className="close-button" onClick={closePopup}>
            Close
          </button>
        </div>
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
        <title>CASFOS - Head of Office Dashboard</title>
      </Helmet>

      {/* Sidebar Navigation */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">HEAD OF OFFICE</span>
        </a>
        <ul className="side-menu top">
          <li className="active">
            <a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">User Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hooassetapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Faculty Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Faculty Updation</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}>
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
          <span className="head-title">Dashboard</span>
          <form action="#">
            <div className="form-input"></div>
          </form>
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
              <p>Central Academy for State Forest Service - Head of Office Dashboard</p>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="content-section">
            <div className="section-container">
              <h2 className="section-title">About Us</h2>
              <div className="about-content">
                <div className="about-text">
                  <p>
                    The Central Academy for State Forest Service, Coimbatore (CASFOS) is a premier institution under the Directorate of Forest Education, Ministry of Environment, Forests, and Climate Change. It plays a pivotal role in training Range Forest Officers (RFOs) and providing in-service training to State Forest Service Officers at ACF and DCF ranks.
                  </p>
                  <p>
                    Established on January 25, 1980, CASFOS was created to address the need for skilled forest officers, driven by Social Forestry Projects during the IV and V Five-Year Plans. The Head of Office oversees critical administrative functions, including user and faculty approvals, ensuring seamless operations.
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
                    CASFOS Coimbatore is a cornerstone of forestry education, offering professional training and administrative oversight for forest management.
                  </p>
                  <h3 className="subsection-title">Mandate</h3>
                  <ul className="mandate-list">
                    <li>Oversee faculty and user approvals for efficient operations.</li>
                    <li>Facilitate training programs for forest officers.</li>
                    <li>Support workshops on forest policy and environmental conservation.</li>
                    <li>Ensure compliance with ecological standards.</li>
                  </ul>
                  <h3 className="subsection-title">Genesis of Forest Training</h3>
                  <p>
                    Forestry education in India began in 1867, with a forest school in Dehradun (1878). The Madras Forest College, established in Coimbatore in 1912, trained foresters for South India. Revived in 1945 and renamed the Southern Forest Rangers College (SFRC) in 1955, it trained over 4,000 rangers until 1987. CASFOS Coimbatore was established in 1980 and integrated under IGNFA in 2022.
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
                    The campus hosts the Tamil Nadu Forest Academy (TNFA), the Institute of Forest Genetics & Tree Breeding (IFGTB), and the GASS Museum, making it a hub for forestry education and research.
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
                    className="notification-banner pending"
                  >
                    <div className="notification-summary">
                      <span className="notification-title">
                        Faculty Notification - {notification.name}
                        <span className="notification-time">
                          {new Date(notification.notificationDate).toLocaleString()}
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

      {/* Faculty Details Popup */}
      {selectedFaculty && renderFacultyDetails(selectedFaculty)}
    </div>
  );
};

export default HOODashboard;