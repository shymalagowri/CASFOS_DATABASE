import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const AssetManagerDashboard = () => {
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // Existing dashboard states
  const [assetData, setAssetData] = useState([]);
  const [internalData, setInternalData] = useState([]);
  const [externalData, setExternalData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedFacultyYear, setSelectedFacultyYear] = useState("All");
  const [sessionData, setSessionData] = useState([]);
  const [selectedSessionYear, setSelectedSessionYear] = useState("All");
  const [sessionLabels, setSessionLabels] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [facultyLabels, setFacultyLabels] = useState([]);
  const [labels, setLabels] = useState([]);
  const [userCounts, setUserCounts] = useState({ adminCount: 0, dataEntryCount: 0, viewerCount: 0 });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const [permanentLabels, setPermanentLabels] = useState([]);
  const [permanentChartData, setPermanentChartData] = useState([]);
  const [permanentCategories, setPermanentCategories] = useState([]);
  const [consumableLabels, setConsumableLabels] = useState([]);
  const [consumableChartData, setConsumableChartData] = useState([]);
  const [consumableCategories, setConsumableCategories] = useState([]);
  const [issuedPermanentLabels, setIssuedPermanentLabels] = useState([]);
  const [issuedPermanentChartData, setIssuedPermanentChartData] = useState([]);
  const [issuedPermanentCategories, setIssuedPermanentCategories] = useState([]);
  const [issuedConsumableLabels, setIssuedConsumableLabels] = useState([]);
  const [issuedConsumableChartData, setIssuedConsumableChartData] = useState([]);
  const [issuedConsumableCategories, setIssuedConsumableCategories] = useState([]);

  // Format notification title based on action type
  const formatNotificationTitle = (notification) => {
    const { action, assetCategory, itemNames, subCategory } = notification;
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
      case "return approved for service":
        return `Asset Manager approved ${itemName} for service`;
      case "return approved for disposal":
        return `Asset Manager approved ${itemName} for disposal`;
      case "return rejected":
        return `Asset Manager rejected ${itemName} return`;
      default:
        return `${action} - ${assetCategory}`;
    }
  };

  // Fetch notifications sorted by action time (newest first)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://${ip}:${port}/api/assets/get-asset-notification`);
        // Sort by actionTime descending (newest first) and limit to 10
        const sortedNotifications = response.data
          .sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime))
          .slice(0, 10);
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Clear a single notification
  const handleClearNotification = async (id) => {
    try {
      await axios.delete(`http://${ip}:${port}/api/assets/delete-asset-notification/${id}`);
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error("Error clearing notification:", error);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      await axios.delete(`http://${ip}:${port}/api/assets/delete-asset-notification/all`);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  // Toggle expand/collapse of notification
  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  // Render notification details based on action type
  const renderNotificationDetails = (notification) => {
    const { action, supplierName, purchaseDate, billNo, receivedBy, itemNames, subCategory, quantity, location, rejectionRemarks, actionTime } = notification;

    return (
      <div style={styles.notificationDetails}>
        <p><strong>Action Time:</strong> {new Date(actionTime).toLocaleString()}</p>
        {action.includes("asset") && (
          <>
            <p><strong>Supplier Name:</strong> {supplierName || "N/A"}</p>
            <p><strong>Purchase Date:</strong> {purchaseDate ? new Date(purchaseDate).toLocaleDateString() : "N/A"}</p>
            <p><strong>Bill No:</strong> {billNo || "N/A"}</p>
            <p><strong>Received By:</strong> {receivedBy || "N/A"}</p>
          </>
        )}
        <p><strong>Items:</strong> {itemNames?.join(", ") || subCategory || "N/A"}</p>
        {quantity && <p><strong>Quantity:</strong> {quantity}</p>}
        {location && <p><strong>Location:</strong> {location}</p>}
        {rejectionRemarks && <p><strong>Remarks:</strong> {rejectionRemarks}</p>}
      </div>
    );
  };

  // Existing useEffect hooks for fetching data
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        let url = `http://${ip}:${port}/api/faculty/sessions`;
        if (selectedSessionYear !== "All") url += `?year=${selectedSessionYear}`;
        else url += `?year=All`;
        const sessionRes = await axios.get(url);
        setSessionData(sessionRes.data.sessionCounts);
        const labels = selectedSessionYear === "All"
          ? [...Array(11)].map((_, i) => (2025 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        setSessionLabels(labels);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };
    fetchSessionData();
  }, [selectedSessionYear]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const userRes = await axios.get(`http://${ip}:${port}/api/users/count`);
        setUserCounts(userRes.data.data);
        const assetRes = await axios.get(`http://${ip}:${port}/api/assets/monthly`);
        setLabels(assetRes.data.labels);
        setAssetData(assetRes.data.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        let url = `http://${ip}:${port}/api/faculty/monthly`;
        if (selectedFacultyYear !== "All") url += `?year=${selectedFacultyYear}`;
        else url += `?year=All`;
        const facultyRes = await axios.get(url);
        setInternalData(facultyRes.data.internal);
        setExternalData(facultyRes.data.external);
        const labels = selectedFacultyYear === "All"
          ? [...Array(11)].map((_, i) => (2025 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        setFacultyLabels(labels);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    };
    fetchFacultyData();
  }, [selectedFacultyYear]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        // Permanent assets
        let permanentUrl = `http://${ip}:${port}/api/assets/purchased-types?assetType=Permanent`;
        if (selectedLocation !== "All") permanentUrl += `&location=${selectedLocation}`;
        if (selectedYear !== "All") permanentUrl += `&year=${selectedYear}`;
        else permanentUrl += `&year=all`;

        const permanentResponse = await axios.get(permanentUrl);
        const { data: permanentData, categories: permanentCats } = permanentResponse.data;
        setPermanentChartData(permanentData);
        setPermanentCategories(permanentCats);
        setPermanentLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

        // Consumable assets
        let consumableUrl = `http://${ip}:${port}/api/assets/store-consumables`;
        if (selectedYear !== "All") consumableUrl += `?year=${selectedYear}`;
        else consumableUrl += `?year=all`;

        const consumableResponse = await axios.get(consumableUrl);
        const { data: consumableData, categories: consumableCats } = consumableResponse.data;
        setConsumableChartData(consumableData);
        setConsumableCategories(consumableCats);
        setConsumableLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

        // Issued Permanent assets
        let issuedPermanentUrl = `http://${ip}:${port}/api/assets/issued-permanent`;
        if (selectedYear !== "All") issuedPermanentUrl += `?year=${selectedYear}`;
        else issuedPermanentUrl += `?year=all`;

        const issuedPermanentResponse = await axios.get(issuedPermanentUrl);
        const { data: issuedPermanentData, categories: issuedPermanentCats } = issuedPermanentResponse.data;
        setIssuedPermanentChartData(issuedPermanentData);
        setIssuedPermanentCategories(issuedPermanentCats);
        setIssuedPermanentLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

        // Issued Consumable assets
        let issuedConsumableUrl = `http://${ip}:${port}/api/assets/issued-consumable`;
        if (selectedYear !== "All") issuedConsumableUrl += `?year=${selectedYear}`;
        else issuedConsumableUrl += `?year=all`;

        const issuedConsumableResponse = await axios.get(issuedConsumableUrl);
        const { data: issuedConsumableData, categories: issuedConsumableCats } = issuedConsumableResponse.data;
        setIssuedConsumableChartData(issuedConsumableData);
        setIssuedConsumableCategories(issuedConsumableCats);
        setIssuedConsumableLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
      } catch (error) {
        console.error("Error fetching asset data:", error);
      }
    };
    fetchFilteredData();
  }, [selectedLocation, selectedYear]);

  // Filter chart data
  const filterChartData = (data, labels, isYearly) => {
    if (isYearly) {
      const currentYear = new Date().getFullYear();
      const startYear = 2024;
      const endIndex = Math.min(currentYear - startYear + 1, data.length);
      return {
        filteredData: data.slice(0, endIndex),
        filteredLabels: labels.slice(0, endIndex),
      };
    } else {
      const currentMonthIndex = new Date().getMonth();
      return {
        filteredData: data.slice(0, currentMonthIndex + 1),
        filteredLabels: labels.slice(0, currentMonthIndex + 1),
      };
    }
  };

  // Chart configurations
  const permanentChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(permanentChartData, permanentLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: permanentCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map(row => row[idx]),
        borderColor: `hsl(${idx * 30}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 30}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const consumableChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(consumableChartData, consumableLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: consumableCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map(row => row[idx]),
        borderColor: `hsl(${idx * 40}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 40}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const issuedPermanentChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(issuedPermanentChartData, issuedPermanentLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: issuedPermanentCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map(row => row[idx]),
        borderColor: `hsl(${idx * 50}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 50}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const issuedConsumableChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(issuedConsumableChartData, issuedConsumableLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: issuedConsumableCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map(row => row[idx]),
        borderColor: `hsl(${idx * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 14 } } },
      title: { display: true, font: { size: 18 } },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f2f2f2" }, ticks: { min: 0, stepSize: 10 } },
    },
  };

  const generateSessionChartConfig = () => ({
    labels: sessionLabels,
    datasets: [{
      label: "Total Sessions Handled",
      data: sessionData,
      backgroundColor: "rgba(9, 172, 248, 0.6)",
      borderColor: "rgb(6, 213, 254)",
      borderWidth: 1,
    }],
  });

  const generateFacultyChartConfig = () => ({
    labels: facultyLabels,
    datasets: [
      { label: "Internal Faculty", data: internalData, backgroundColor: "rgba(75, 192, 192, 0.6)", borderColor: "rgba(75, 192, 192, 1)", borderWidth: 1 },
      { label: "External Faculty", data: externalData, backgroundColor: "rgba(255, 99, 132, 0.6)", borderColor: "rgba(255, 99, 132, 1)", borderWidth: 1 },
    ],
  });

  const salesData = [
    { id: 1, value: userCounts.adminCount || "0", title: "Admin", bgColor: "#bfecff", iconColor: "#5ccbff", iconClass: "fas fa-user-shield" },
    { id: 2, value: userCounts.dataEntryCount || "0", title: "Data Entry Staff", bgColor: "#FFF3D2", iconColor: "#FFA85C", iconClass: "fas fa-keyboard" },
    { id: 3, value: userCounts.viewerCount || "0", title: "Data Viewer", bgColor: "#D2FFD2", iconColor: "#5CFF5C", iconClass: "fas fa-eye" },
  ];

  const handleYearChange = (event) => setSelectedYear(event.target.value);
  const handleLocationChange = (event) => setSelectedLocation(event.target.value);
  const handleFacultyYearChange = (event) => setSelectedFacultyYear(event.target.value);

  return (
    <>
      <div>
        <Helmet>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
          <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
          <link rel="stylesheet" href="style.css" />
          <title>CASFOS</title>
        </Helmet>

        <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">ASSET MANAGER</span>
          </a>
          <ul className="side-menu top">
            <li className="active"><a href={`/assetmanagerdashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li ><a href={`/adminassetapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Approval</span></a></li>
            <li><a href={`/assetupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Updation</span></a></li>
            <li><a href={`/managerassetview?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset View</span></a></li>
          </ul>
          <ul className="side-menu">
            <li><a href="/login" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></a></li>
          </ul>
        </section>

        <section id="content">
          <nav>
            <i className="bx bx-menu" />
            <span className="head-title">Dashboard</span>
            <form action="#"><div className="form-input"></div></form>
            <div style={styles.usernameContainer}>
            <i className="bx bxs-user-circle" style={styles.userIcon}></i>
            <span style={styles.username}>{username}</span>
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
      </div>
    </>
  );
};

const styles = {
  notificationPanel: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    maxHeight: "500px",
    overflowY: "auto",
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    padding: "10px 0",
    zIndex: 1,
  },
  notificationList: {
    maxHeight: "400px",
    overflowY: "auto",
    paddingRight: "5px",
  },
  notificationBanner: {
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  notificationSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    flex: 1,
    fontWeight: "bold",
    display: "flex",
    flexDirection: "column",
  },
  notificationTime: {
    fontSize: "0.8em",
    color: "#666",
    fontWeight: "normal",
    marginTop: "5px",
  },
  clearAllButton: {
    padding: "8px 15px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  expandButton: {
    padding: "5px 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
    minWidth: "30px",
  },
  clearButton: {
    padding: "5px 10px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    minWidth: "30px",
  },
  notificationDetails: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    fontSize: "0.9em",
  },
  noNotifications: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
  },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  container: { maxWidth: "800px", margin: "20px auto", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  subtitle: { color: "#666", fontSize: "14px", marginBottom: "20px" },
  cardContainer: { display: "flex", gap: "15px" },
  card: {
    flex: "1",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    margin: "0 auto 10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  iconStyle: {
    fontSize: "24px",
    color: "#fff",
  },
};

const moduleStyle = { width: "45%", padding: "20px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center" };
const titleStyle = { marginBottom: "15px", fontSize: "1.2em", color: "#28a745" };

export default AssetManagerDashboard;