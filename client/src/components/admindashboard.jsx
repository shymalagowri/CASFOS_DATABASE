import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import "../styles/amctable.css";

const Dashboard = () => {
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
  const [amcAssets, setAmcAssets] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const assetTypes = ["IT", "Store", "Electrical", "Furniture"];
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

  useEffect(() => {
    const fetchAMCAssets = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/assets/amcmonitor");
        const assets = response.data;
        const currentDate = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(currentDate.getMonth() + 1);
        const filteredAssets = assets.filter(asset => {
          if (!asset.amcDate) return false;
          const amcDate = new Date(asset.amcDate);
          return amcDate >= currentDate && amcDate <= oneMonthLater;
        });
        setAmcAssets(filteredAssets);
      } catch (error) {
        console.error("Error fetching AMC assets:", error);
      }
    };
    fetchAMCAssets();
    const interval = setInterval(fetchAMCAssets, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        let url = "http://localhost:3001/api/faculty/sessions";
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
        const userRes = await axios.get("http://localhost:3001/api/users/count");
        setUserCounts(userRes.data.data);
        const assetRes = await axios.get("http://localhost:3001/api/assets/monthly");
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
        let url = "http://localhost:3001/api/faculty/monthly";
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
        let permanentUrl = "http://localhost:3001/api/assets/purchased-types?assetType=Permanent";
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

        let consumableUrl = "http://localhost:3001/api/assets/store-consumables";
        if (selectedYear !== "All") consumableUrl += `?year=${selectedYear}`;
        else consumableUrl += `?year=all`;

        const consumableResponse = await axios.get(consumableUrl);
        const { data: consumableData, categories: consumableCats } = consumableResponse.data;
        console.log("Consumable data from backend:", consumableData);
        setConsumableChartData(consumableData);
        setConsumableCategories(consumableCats);
        setConsumableLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
      } catch (error) {
        console.error("Error fetching asset data:", error);
      }
    };
    fetchFilteredData();
  }, [selectedLocation, selectedYear]);

  useEffect(() => {
    const fetchIssuedData = async () => {
      try {
        let issuedPermanentUrl = "http://localhost:3001/api/assets/issued-permanent";
        if (selectedYear !== "All") issuedPermanentUrl += `?year=${selectedYear}`;
        else issuedPermanentUrl += `?year=all`;

        const issuedPermanentResponse = await axios.get(issuedPermanentUrl);
        const { data: issuedPermanentData, categories: issuedPermanentCats } = issuedPermanentResponse.data;
        setIssuedPermanentChartData(issuedPermanentData);
        setIssuedPermanentCategories(issuedPermanentCats);
        setIssuedPermanentLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

        let issuedConsumableUrl = "http://localhost:3001/api/assets/issued-consumable";
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
        console.error("Error fetching issued asset data:", error);
      }
    };
    fetchIssuedData();
  }, [selectedYear]);

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
      <div className="dashboard">
        <Helmet>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
          <link rel="stylesheet" href="style.css" />
          <title>CASFOS</title>
        </Helmet>

        <section id="sidebar">
          <a href="#" className="brand"><span className="text">ADMIN</span></a>
          <ul className="side-menu top">
            <li className="active"><a href={`/admindashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li><a href={`/adminuserapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Registration Approval</span></a></li>
            <li><a href={`/usermanagement?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">User Management</span></a></li>
            <li><a href={`/adminassetapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Asset Approval</span></a></li>
            <li><a href={`/adminfacultyapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty Approval</span></a></li>
            <li><a href={`/adminassetview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Asset View</span></a></li>
            <li><a href={`/adminfacultyview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li>
          </ul>
          <ul className="side-menu"><li><a href="/" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></a></li></ul>
        </section>

        <section id="content">
          <nav>
            <i className="bx bx-menu" />
            <span className="head-title">Dashboard</span>
            <div style={styles.usernameContainer}>
              <i className="bx bxs-user-circle" style={styles.userIcon}></i>
              <span style={styles.username}>{username}</span>
            </div>
          </nav>

          <main>
            <Helmet><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet" /></Helmet>

            <div style={styles.rowContainer}>
              <div style={styles.userContainer}>
                <div style={styles.header}><h2>Total Registered Users</h2></div>
                <p style={styles.subtitle}>User's Summary</p>
                <div style={styles.cardContainer}>
                  {salesData.map((item) => (
                    <div key={item.id} style={{ ...styles.card, backgroundColor: item.bgColor }}>
                      <div style={{ ...styles.icon, backgroundColor: item.iconColor }}>
                        <i className={item.iconClass} style={styles.iconStyle}></i>
                      </div>
                      <h3>{item.value}</h3>
                      <p>{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.amcContainer}>
                <h3 style={{ textAlign: "center" }}>
                  Upcoming AMC Expiry <i className="fas fa-exclamation-circle" style={{ color: "red", marginLeft: "8px" }}></i>
                </h3>
                <table className="advanced-table">
                  <thead><tr><th>Asset Type</th><th>Location</th><th>Accessory Name</th><th>AMC Date</th></tr></thead>
                  <tbody>
                    {amcAssets.length > 0 ? (
                      amcAssets.map((asset, index) => (
                        <tr key={index}><td>{asset.assetType}</td><td>{asset.location}</td><td>{asset.accessoryName}</td><td>{asset.amcDate}</td></tr>
                      ))
                    ) : (
                      <tr><td colSpan="4">No upcoming AMC expirations</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Updated Chart Layout */}
            <div className="analytics-container" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
              {/* Row 1: Permanent and Consumable Assets */}
              <div style={moduleStyle}>
                <h3 style={titleStyle}>Permanent Assets in Store</h3>
                <div className="filters">
                  <label style={{ marginTop: "20px" }}>
                    Year:
                    <select value={selectedYear} onChange={handleYearChange}>
                      <option value="All">All</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                  </label>
                </div>
                <Line data={permanentChartConfig()} options={lineChartOptions} />
              </div>

              <div style={moduleStyle}>
                <h3 style={titleStyle}>Consumable Assets in Store</h3>
                <div className="filters">
                  <label style={{ marginTop: "20px" }}>
                    Year:
                    <select value={selectedYear} onChange={handleYearChange}>
                      <option value="All">All</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                  </label>
                </div>
                <Line data={consumableChartConfig()} options={lineChartOptions} />
              </div>

              {/* Row 2: Issued Permanent and Issued Consumable Assets */}
              <div style={moduleStyle}>
                <h3 style={titleStyle}>Issued Permanent Assets</h3>
                <div className="filters">
                  <label style={{ marginTop: "20px" }}>
                    Year:
                    <select value={selectedYear} onChange={handleYearChange}>
                      <option value="All">All</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                  </label>
                </div>
                <Line data={issuedPermanentChartConfig()} options={lineChartOptions} />
              </div>

              <div style={moduleStyle}>
                <h3 style={titleStyle}>Issued Consumable Assets</h3>
                <div className="filters">
                  <label style={{ marginTop: "20px" }}>
                    Year:
                    <select value={selectedYear} onChange={handleYearChange}>
                      <option value="All">All</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                  </label>
                </div>
                <Line data={issuedConsumableChartConfig()} options={lineChartOptions} />
              </div>
            </div>

            {/* Faculty and Session Charts */}
            <div className="analytics-container" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
              <div className="module" style={moduleStyle}>
                <h3 style={titleStyle}>Count of Faculties Entered</h3>
                <div className="filters">
                  <label style={{ marginTop: "20px" }}>
                    Year:
                    <select onChange={handleFacultyYearChange} value={selectedFacultyYear}>
                      <option value="All">All</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </label>
                </div>
                <Bar data={generateFacultyChartConfig()} />
              </div>
              <div className="module" style={moduleStyle}>
                <h3 style={titleStyle}>Total Sessions Handled</h3>
                <div className="filters">
                  <label style={{ marginTop: "20px" }}>
                    Year:
                    <select onChange={(e) => setSelectedSessionYear(e.target.value)} value={selectedSessionYear}>
                      <option value="All">All</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </label>
                </div>
                <Bar data={generateSessionChartConfig()} />
              </div>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

const styles = {
  rowContainer: { display: "flex", flexWrap: "wrap", gap: "20px", margin: "20px 0", justifyContent: "center" },
  userContainer: { flex: 1, padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff", minWidth: "300px" },
  amcContainer: { flex: 1, padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff", minWidth: "300px", maxHeight: "300px", overflowY: "auto" },
  cardContainer: { display: "flex", gap: "15px", flexWrap: "wrap" },
  card: { flex: "1", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", minWidth: "150px" },
  icon: { width: "50px", height: "50px", borderRadius: "50%", margin: "0 auto 10px", display: "flex", justifyContent: "center", alignItems: "center" },
  iconStyle: { fontSize: "24px", color: "#fff" },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  header: { display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px", textAlign: "center" },
  subtitle: { color: "#666", fontSize: "14px", marginBottom: "20px" },
};

const moduleStyle = { width: "45%", padding: "20px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center" };
const titleStyle = { marginBottom: "15px", fontSize: "1.2em", color: "#28a745" };

export default Dashboard;