/**
 * Overview:
 * This is a React component for the Storekeeper Dashboard in an asset management system for the Central Academy for State Forest Service (CASFOS).
 * It serves as the main interface for storekeepers, providing:
 * - A sidebar for navigation to various asset management sections (Asset Store, Issue, Return, Updation, View).
 * - A notification system to display recent asset-related actions (approvals, rejections, etc.) with expandable details and clear options.
 * - Static sections for About Us, History, How to Reach, and Contact Us, showcasing institutional information.
 * - A hero section with placeholder statistics for total assets, issued, returned, and in maintenance.
 * - Responsive design with a modern UI, using external CSS (dashstyle.css, style.css) and inline styles for specific elements.
 * 
 * The component uses React Router for URL parameter parsing, axios for API calls to fetch and manage notifications, and Helmet for SEO and metadata.
 * Notifications are fetched from a backend API at 'http://${ip}:${port}' and limited to the 50 most recent, sorted by action time.
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../styles/dashstyle.css';

/**
 * Constants for notification actions and their corresponding tabs for redirection
 */
const NOTIFICATION_TABS = {
  'building maintenance': 'service',
  'building upgrade': 'building-upgrade',
  'building disposal': 'disposable',
  issue: 'assetissue',
  service: 'assetstore',
  updation: 'storekeeperassetupdation',
  // No specific tabs for HOO actions as they are handled by HOO approval page
  // 'return approved with HOO waiting' and 'return approved by HOO' are informational and don't redirect
};

const StorekeeperDashboard = () => {
  // State management
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Router and URL params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username') || 'Guest';
  const serverBaseUrl = `http://${ip}:${port}`;

  /**
   * Fetches notifications on component mount, sorted by action time, limited to 50
   */
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

  /**
   * Clears a single notification by ID
   * @param {string} id - Notification ID
   */
  const handleClearNotification = async (id) => {
    try {
      await axios.delete(`${serverBaseUrl}/api/assets/delete-asset-notification/${id}`);
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
      await axios.delete(`${serverBaseUrl}/api/assets/delete-all-asset-notification`);
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
   * Formats the notification title based on action and asset details
   * @param {Object} notification - Notification object
   * @returns {string} - Formatted title
   */
  const formatNotificationTitle = (notification) => {
    const { action, assetCategory, itemNames, subCategory, condition } = notification;
    const itemName = itemNames?.[0] || subCategory || assetCategory || 'item';
  
    switch (action) {
      case "asset approved":
        return `Asset Manager approved purchased ${assetCategory || 'assets'}`;
      case "asset rejected":
        return `Asset Manager rejected ${itemName} purchase`;
      case "issue approved":
        return `Asset Manager approved issuing ${itemName}`;
      case "issue rejected":
        return `Asset Manager rejected issuing ${itemName}`;
      case "service approved":
        return `Asset Manager approved ${itemName} for service`;
      case "service rejected":
        return `Asset Manager rejected ${itemName} for service`;
      case "return approved":
        return `Asset Manager approved ${itemName} return for ${condition || 'N/A'}`;
      case "return rejected":
        return `Asset Manager rejected ${itemName} return for ${condition || 'N/A'}`;
      case "exchange approved":
        return `Asset Manager exchanged ${itemName}`;
      case "exchange rejected":
        return `Asset Manager cancelled exchange ${itemName}`;
      case "asset disposal approved":
        return `Asset Manager approved disposing ${itemName}`;
      case "asset disposal cancelled":
        return `Asset Manager cancelled ${itemName} for disposal`;
      case "condition changed":
        return `Asset Manager changed returned asset condition of ${itemName}`;
      case "asset updation approved":
        return `Asset Manager approved update for ${itemName}`;
      case "asset updation rejected":
        return `Asset Manager rejected update for ${itemName}`;
      case "building upgrade approved":
        return `Asset Manager approved building upgrade for ${itemName}`;
      case "building upgrade rejected":
        return `Asset Manager rejected building upgrade for ${itemName}`;
      case "building disposal cancelled":
        return `Asset Manager cancelled building disposal for ${itemName}`;
      case "building maintenance approved":
        return `Asset Manager approved maintenance for ${itemName}`;
      case "building maintenance rejected":
        return `Asset Manager rejected maintenance for ${itemName}`;
      case "return approved with HOO waiting":
        return `HOO is reviewing ${itemName} return for disposal`;
      case "return approved by HOO":
        return `HOO approved ${itemName} return for disposal`;
      case "return rejected by HOO":
        return `HOO rejected ${itemName} return for disposal`;
      default:
        return `${action} - ${assetCategory}`;
    }
  };

  /**
   * Renders detailed information for an expanded notification
   * @param {Object} notification - Notification object
   * @returns {JSX.Element} - Notification details component
   */
  const renderNotificationDetails = (notification) => {
    const {
      _id,
      rejectedAssetId,
      action,
      assetType,
      assetCategory,
      actionTime,
      itemName,
      itemNames,
      subCategory,
      quantity,
      location,
      supplierName,
      purchaseDate,
      billNo,
      receivedBy,
      rejectionRemarks,
      condition,
      changedCondition,
    } = notification;
  
    return (
      <div className='notification-table'>
        <p><strong>Action Time:</strong> {new Date(actionTime).toLocaleString()}</p>
        {action.includes("asset approved") || action.includes("asset rejected") ? (
          <>
            <p><strong>Asset Type:</strong> {assetType || "N/A"}</p>
            <p><strong>Asset Category:</strong> {assetCategory || "N/A"}</p>
            <p><strong>Supplier Name:</strong> {supplierName || "N/A"}</p>
            <p><strong>Purchase Date:</strong> {purchaseDate ? new Date(purchaseDate).toLocaleDateString() : "N/A"}</p>
            <p><strong>Bill No:</strong> {billNo || "N/A"}</p>
            <p><strong>Received By:</strong> {receivedBy || "N/A"}</p>
            {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
          </>
        ) : action.includes("building maintenance approved") || action.includes("building maintenance rejected") ? (
          <>
            <p><strong>Asset Type:</strong> {assetType || "N/A"}</p>
            <p><strong>Asset Category:</strong> {assetCategory || "N/A"}</p>
            <p><strong>Sub Category:</strong> {subCategory || "N/A"}</p>
            <p><strong>Location:</strong> {location || "N/A"}</p>
            {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
          </>
        ) : action.includes("issue") || action.includes("service") || action.includes("exchange") ? (
          <>
            <p><strong>Item:</strong> {itemName || itemNames?.join(", ") || "N/A"}</p>
            <p><strong>Subcategory:</strong> {subCategory || "N/A"}</p>
            {quantity && <p><strong>Quantity:</strong> {quantity}</p>}
            {location && <p><strong>Location:</strong> {location}</p>}
            {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
          </>
        ) : action.includes("return") ? (
          <>
            <p><strong>Item:</strong> {itemName || itemNames?.join(", ") || "N/A"}</p>
            <p><strong>Subcategory:</strong> {subCategory || "N/A"}</p>
            <p><strong>Returned From:</strong> {location || "N/A"}</p>
            <p><strong>Condition:</strong> {condition || "N/A"}</p>
            {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
          </>
        ) : action.includes("building disposal cancelled") ? (
          <>
            <p><strong>Subcategory:</strong> {subCategory || "N/A"}</p>
            {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
          </>
        ) : action.includes("asset disposal") ? (
          <>
            <p><strong>Item:</strong> {itemName || itemNames?.join(", ") || "N/A"}</p>
            {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
          </>
        ) : action.includes("condition changed") ? (
          <>
            <p><strong>Item:</strong> {itemName || itemNames?.join(", ") || "N/A"}</p>
            <p><strong>Returned From:</strong> {location || "N/A"}</p>
            <p><strong>Initial Condition:</strong> {condition || "N/A"}</p>
            <p><strong>Changed Condition:</strong> {changedCondition || "N/A"}</p>
          </>
        ) : (
          <>
            <p><strong>Item:</strong> {itemName || itemNames?.join(", ") || subCategory || "N/A"}</p>
            {quantity && <p><strong>Quantity:</strong> {quantity}</p>}
            {location && <p><strong>Location:</strong> {location}</p>}
            {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
          </>
        )}

        {(action.includes("rejected") || action.includes("cancelled") || action.includes("rejected by HOO")) ? (
          <button
            className='update-button'
            onClick={async () => {
              await handleClearNotification(_id);

              let tab = "";
              if (action.includes("building maintenance")) tab = "service";
              else if (action.includes("building upgrade")) tab = "building-upgrade";
              else if (action.includes("building disposal")) tab = "disposable";
              else if (action.includes("return")) tab = "returned";
              else if (action.includes("issue")) {
                window.location.href = `/assetissue?username=${encodeURIComponent(username)}&rejectedId=${rejectedAssetId || _id}&assetType=${assetType}`;
                return;
              }
              else if (action.includes("service")) tab = "assetstore";
              else if (action.includes("updation")) {
                window.location.href = `/entrystaffassetupdation?username=${encodeURIComponent(username)}&rejectedId=${rejectedAssetId || _id}&assetType=${assetType}`;
                return;
              }              

              window.location.href = `/assetstore?username=${encodeURIComponent(username)}&rejectedId=${rejectedAssetId || _id}&tab=${tab}`;
            }}
          >
            Update
          </button>
        ) : null}
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
        <title>CASFOS - Storekeeper Dashboard</title>
      </Helmet>

      {/* Sidebar Navigation */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">STOREKEEPER</span>
        </a>
        <ul className="side-menu top">
          <li className="active">
            <a href={`/storekeeperdashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/assetstore?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Store</span>
            </a>
          </li>
          <li>
            <a href={`/assetissue?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Asset Issue</span>
            </a>
          </li>
          <li>
            <a href={`/assetreturn?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Asset Return</span>
            </a>
          </li>
          <li>
            <a href={`/storekeeperassetupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Asset Updation</span>
            </a>
          </li>
          <li>
            <a href={`/viewasset?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Asset View</span>
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
              <br></br>
              <br></br>
              <p>Central Academy for State Forest Service - Asset Management System</p>
            </div>
          </section>
          <section id="about" className="content-section">
            <div className="section-container">
              <h2 className="section-title">About Us</h2>
              <div className="about-content">
                <div className="about-text">
                  <p>
                    The Central Academy for State Forest Service, Coimbatore (erstwhile State Forest Service College) is a premier institution under the Directorate of Forest Education, Ministry of Environment, Forests, and Climate Change. It imparts professional training to newly recruited Range Forest Officers (RFOs) and in-service training to State Forest Service Officers at ACF and DCF ranks.
                  </p>
                  <p>
                    Established on January 25, 1980, the Academy was created to meet the growing demand for trained forest officers, spurred by Social Forestry Projects during the IV and V Five-Year Plans. Previously, officers were trained at the Indian Forest College, Dehradun, and Burnihat. CASFOS Coimbatore continues to uphold excellence in forestry education.
                  </p>
                  <p className="update-info">
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
                    CASFOS Coimbatore is a cornerstone of forestry education, offering professional training to State Forest Officers (ACF, FRO) and workshops on forest policy, wildlife, and environmental conservation.
                  </p>
                  <h3 className="subsection-title">Mandate</h3>
                  <ul className="mandate-list">
                    <li>Deliver professional training to prepare officers for forestry challenges.</li>
                    <li>Enhance management skills through in-service courses.</li>
                    <li>Conduct workshops on emerging forestry research and technology.</li>
                    <li>Align forest education with ecological and environmental standards.</li>
                  </ul>
                  <h3 className="subsection-title">Genesis of Forest Training</h3>
                  <p>
                    Forestry education in India began in 1867, with a forest school established in Dehradun (1878). The Madras Forest College, founded in Coimbatore in 1912, was the second Rangers College, training foresters for South India. Revived in 1945 and renamed the Southern Forest Rangers College (SFRC) in 1955, it trained over 4,000 rangers until 1987. CASFOS Coimbatore was established in 1980 and integrated under IGNFA in 2022.
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
                <div className="history-text-continued">
                  <p className="update-info">
                  </p>
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

export default StorekeeperDashboard;