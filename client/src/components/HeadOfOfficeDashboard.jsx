import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import '../styles/DashStyle.css';

const NOTIFICATION_ACTIONS = {
  acknowledge: 'acknowledge-hoo-hoo',
};

const HOODashboard = () => {
  const port = import.meta.env.VITE_API_PORT || '3000';
  const ip = import.meta.env.VITE_API_IP || 'localhost';
  // State Management
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [acknowledgeStatus, setAcknowledgeStatus] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Router and URL Parameters
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

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${serverBaseUrl}/api/faculty/notifyhoo-false`);
        const sortedNotifications = response.data
          .sort((a, b) => new Date(b.notificationDate) - new Date(a.notificationDate))
          .slice(0, 50);
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifyhoo-false notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  // Notification Handlers
  const handleClearNotification = async (id) => {
    try {
      await axios.delete(`${serverBaseUrl}/api/faculty/delete-notification/${id}`);
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
      await axios.delete(`${serverBaseUrl}/api/faculty/delete-all-notifications`);
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

  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  const closePopup = () => {
    setSelectedFaculty(null);
  };

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

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm new password do not match');
      return;
    }

    try {
      const response = await axios.put(`${serverBaseUrl}/api/users/change-password`, {
        name: username,
        role: 'headofoffice',
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        setPasswordMessage('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordMessage('');
        }, 2000);
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    }
  };

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
            className={`update-button ${acknowledgeStatus[notification._id] === 'Acknowledging...' ? 'disabled' : ''}`}
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

  const renderFacultyDetails = (faculty) => {
    const renderValue = (value, key) => {
      if (key === 'photograph' && typeof value === 'string') {
        const imageUrl = `${serverBaseUrl}/Uploads/${value.split('\\').pop()}`;
        return (
          <img
            src={imageUrl}
            alt="Photograph"
            className="faculty-photo"
            style={{ maxWidth: '200px', borderRadius: '8px' }}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/200')}
          />
        );
      }
      if (Array.isArray(value)) {
        return (
          <ul className="faculty-list" style={{ paddingLeft: '20px' }}>
            {value.map((item, idx) => (
              <li key={idx}>{renderValue(item)}</li>
            ))}
          </ul>
        );
      }
      if (typeof value === 'object' && value !== null) {
        return (
          <ul className="faculty-list" style={{ paddingLeft: '20px' }}>
            {Object.entries(value)
              .filter(
                ([key]) =>
                  key !== '_id' &&
                  key !== 'conduct' &&
                  key !== 'notifyhoo' &&
                  key !== 'notifyprincipal' &&
                  key !== 'notifysi'
              )
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
          <h2 style={styles.sectionTitle}>Faculty Details</h2>
          <table className="faculty-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(faculty)
                .filter(
                  ([key]) =>
                    key !== '_id' &&
                    key !== 'conduct' &&
                    key !== 'notifyhoo' &&
                    key !== 'notifyprincipal' &&
                    key !== 'notifysi'
                )
                .map(([key, value]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#2c3e50' }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                    </td>
                    <td style={{ padding: '10px' }}>{renderValue(value, key)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button
            className="close-button"
            onClick={closePopup}
            style={{ marginTop: '20px', padding: '10px 20px' }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Change Password Popup
  const renderChangePasswordPopup = () => {
    return (
      <div className="popup-overlay">
        <div className="notification-popup" style={{ maxWidth: '400px', padding: '20px' }}>
          <h2 style={styles.sectionTitle}>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="oldPassword" style={{ display: 'block', marginBottom: '5px', color: '#2c3e50' }}>
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px', color: '#2c3e50' }}>
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="confirmNewPassword" style={{ display: 'block', marginBottom: '5px', color: '#2c3e50' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                required
              />
            </div>
            {passwordError && (
              <p style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{passwordError}</p>
            )}
            {passwordMessage && (
              <p style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>{passwordMessage}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="submit"
                className="update-button"
                style={{ padding: '10px 20px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Submit
              </button>
              <button
                type="button"
                className="close-button"
                onClick={() => {
                  setShowChangePassword(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setPasswordMessage('');
                  setPasswordError('');
                }}
                style={{ padding: '10px 20px' }}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Styles from PrincipalDashboard
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
    changePasswordLink: {
      color: 'red',
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
              <span className="text">Asset Management</span>
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
          <li>
            <a href="#" onClick={() => setShowChangePassword(true)} style={styles.changePasswordLink}>
              <i className="bx bxs-key" />
              <span className="text">Change Password</span>
            </a>
          </li>
        </ul>
      </section>

      {/* Main Content */}
      <section id="content">
        <nav>
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
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <br />
              <br />
              <p>Central Academy for State Forest Service - Head of Office Dashboard</p>
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
                    alt="Central Academy for State Forest Service logo"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/200')}
                  />
                  <br />
                  <p style={styles.aboutParagraph}>
                    It also conducts General Awareness & Capacity building courses/workshops for other stakeholders on the importance of Forests, Forest Policy, and Law to facilitate smooth interaction between Forest and other departments.
                  </p>
                  <p style={styles.aboutParagraph}>
                    The Academy was set up in the year 1980. Prior to this, the
                    State Forest Service Officers were trained at the
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
                    Next milestone in Forestry Education in India was the establishment of Madras Forest College at Coimbatore in the year 1912 by the then Madras Presidency with Mr. F. L. C. Cowley Brown, IFS, as its first Principal. Mr. F. A. Lodge, then Conservator of Forests in Coimbatore was instrumental in the establishment of this College. It was the second Forest Rangers College in India, after DehraDun. It was set up to meet the rising demand of trained Foresters in the country, especially those from South India.
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

      {/* Change Password Popup */}
      {showChangePassword && renderChangePasswordPopup()}
    </div>
  );
};

export default HOODashboard;