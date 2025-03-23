import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";

function Analytics() {
  const [assetData, setAssetData] = useState([]);
  const [internalData, setInternalData] = useState([]);
  const [externalData, setExternalData] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [userCounts, setUserCounts] = useState({ adminCount: 0, dataEntryCount: 0, viewerCount: 0 });

  // Fetch data from the backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch asset entries
        const userRes = await axios.get("http://localhost:3001/api/users/count");
        setUserCounts(userRes.data.data);

        const assetRes = await axios.get("http://localhost:3001/api/assets/monthly");
        setLabels(assetRes.data.labels);
        setAssetData(assetRes.data.data);

        // Fetch faculty entries
        const facultyRes = await axios.get("http://localhost:3001/api/faculty/monthly");
        setInternalData(facultyRes.data.internal);
        setExternalData(facultyRes.data.external);
        const totalEntries = assetRes.data.data.map(
            (val, idx) => val + facultyRes.data.internal[idx] + facultyRes.data.external[idx]
          );
          setTotalData(totalEntries);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Bar chart configurations
  const generateChartConfig = (title, data, backgroundColor) => ({
    labels: labels,
    datasets: [
      {
        label: title,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
      },
    ],
  });
  const doughnutChartData = {
    labels: ["Admin", "Data Entry Staff", "Viewer"],
    datasets: [
      {
        data: [
          userCounts.adminCount,
          userCounts.dataEntryCount,
          userCounts.viewerCount,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Doughnut chart options
  const doughnutChartOptions = {
    cutout: "50%", // Reduces the size of the doughnut
    plugins: {
      tooltip: {
        enabled: true, // Disable tooltips to prevent overlap
      },
      datalabels: {
        display: true, // Always show labels
        color: "white", // Label text color
        font: {
          weight: "bold",
          size: 16,
        },
        formatter: (value) => {
          return value; // Display the count directly
        },
        align: "center", // Center align the label
      },
      legend: {
        position: "top", // Position the legend on the right side
        labels: {
          generateLabels: (chart) => {
            return chart.data.labels.map((label, i) => {
              // Customize legend labels to include count
              const count = chart.data.datasets[0].data[i];
              return {
                text: `${label}: ${count}`, // Add count next to label
                fillStyle: chart.data.datasets[0].backgroundColor[i],
                strokeStyle: chart.data.datasets[0].backgroundColor[i],
                lineWidth: 2,
              };
            });
          },
        },
      },
    },
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css" />
      <title>Admin Dashboard Panel</title>
       <style dangerouslySetInnerHTML={{__html: "\n        /* ===== Google Font Import - Poppins ===== */\n@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&display=swap');\n*{\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n    font-family: 'Poppins', sans-serif;\n}\n\n:root{\n    /* ===== Colors ===== */\n    --primary-color: #28a745;\n    --panel-color: #FFF;\n    --text-color: #000;\n    --black-light-color: #707070;\n    --border-color: #e6e5e5;\n    --toggle-color: #DDD;\n    --box1-color: #28a745;\n    --box2-color: #28a745;\n    --box3-color: #28a745;\n    --title-icon-color: #fff;\n    \n    /* ====== Transition ====== */\n    --tran-05: all 0.5s ease;\n    --tran-03: all 0.3s ease;\n    --tran-03: all 0.2s ease;\n}\n\nbody{\n    min-height: 100vh;\n    background-color: var(--primary-color);\n}\nbody.dark{\n    --primary-color: #3A3B3C;\n    --panel-color: #242526;\n    --text-color: #CCC;\n    --black-light-color: #CCC;\n    --border-color: #4D4C4C;\n    --toggle-color: #FFF;\n    --box1-color: #3A3B3C;\n    --box2-color: #3A3B3C;\n    --box3-color: #3A3B3C;\n    --title-icon-color: #CCC;\n}\n/* === Custom Scroll Bar CSS === */\n::-webkit-scrollbar {\n    width: 8px;\n}\n::-webkit-scrollbar-track {\n    background: #f1f1f1;\n}\n::-webkit-scrollbar-thumb {\n    background: var(--primary-color);\n    border-radius: 12px;\n    transition: all 0.3s ease;\n}\n\n::-webkit-scrollbar-thumb:hover {\n    background: #28a745;\n}\n\nbody.dark::-webkit-scrollbar-thumb:hover,\nbody.dark .activity-data::-webkit-scrollbar-thumb:hover{\n    background: #3A3B3C;\n}\n\nnav{\n    position: fixed;\n    top: 0;\n    left: 0;\n    height: 100%;\n    width: 250px;\n    padding: 10px 14px;\n    background-color: var(--panel-color);\n    border-right: 1px solid var(--border-color);\n    transition: var(--tran-05);\n}\nnav.close{\n    width: 73px;\n}\nnav .logo-name{\n    display: flex;\n    align-items: center;\n}\nnav .logo-image{\n    display: flex;\n    justify-content: center;\n    min-width: 45px;\n}\nnav .logo-image img{\n    width: 40px;\n    object-fit: cover;\n    border-radius: 50%;\n}\n\nnav .logo-name .logo_name{\n    font-size: 22px;\n    font-weight: 600;\n    color: var(--text-color);\n    margin-left: 14px;\n    transition: var(--tran-05);\n}\nnav.close .logo_name{\n    opacity: 0;\n    pointer-events: none;\n}\nnav .menu-items{\n    margin-top: 40px;\n    height: calc(100% - 90px);\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n}\n.menu-items li{\n    list-style: none;\n}\n.menu-items li a{\n    display: flex;\n    align-items: center;\n    height: 50px;\n    text-decoration: none;\n    position: relative;\n}\n.nav-links li a:hover:before{\n    content: \"\";\n    position: absolute;\n    left: -7px;\n    height: 5px;\n    width: 5px;\n    border-radius: 50%;\n    background-color: var(--primary-color);\n}\nbody.dark li a:hover:before{\n    background-color: var(--text-color);\n}\n.menu-items li a i{\n    font-size: 24px;\n    min-width: 45px;\n    height: 100%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: var(--black-light-color);\n}\n.menu-items li a .link-name{\n    font-size: 18px;\n    font-weight: 400;\n    color: var(--black-light-color);    \n    transition: var(--tran-05);\n}\nnav.close li a .link-name{\n    opacity: 0;\n    pointer-events: none;\n}\n.nav-links li a:hover i,\n.nav-links li a:hover .link-name{\n    color: var(--primary-color);\n}\nbody.dark .nav-links li a:hover i,\nbody.dark .nav-links li a:hover .link-name{\n    color: var(--text-color);\n}\n.menu-items .logout-mode{\n    padding-top: 10px;\n    border-top: 1px solid var(--border-color);\n}\n.menu-items .mode{\n    display: flex;\n    align-items: center;\n    white-space: nowrap;\n}\n.menu-items .mode-toggle{\n    position: absolute;\n    right: 14px;\n    height: 50px;\n    min-width: 45px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    cursor: pointer;\n}\n.mode-toggle .switch{\n    position: relative;\n    display: inline-block;\n    height: 22px;\n    width: 40px;\n    border-radius: 25px;\n    background-color: var(--toggle-color);\n}\n.switch:before{\n    content: \"\";\n    position: absolute;\n    left: 5px;\n    top: 50%;\n    transform: translateY(-50%);\n    height: 15px;\n    width: 15px;\n    background-color: var(--panel-color);\n    border-radius: 50%;\n    transition: var(--tran-03);\n}\nbody.dark .switch:before{\n    left: 20px;\n}\n\n.dashboard{\n    position: relative;\n    left: 250px;\n    background-color: var(--panel-color);\n    min-height: 100vh;\n    width: calc(100% - 250px);\n    padding: 10px 14px;\n    transition: var(--tran-05);\n}\nnav.close ~ .dashboard{\n    left: 73px;\n    width: calc(100% - 73px);\n}\n.dashboard .top{\n    position: fixed;\n    top: 0;\n    left: 250px;\n    display: flex;\n    width: calc(100% - 250px);\n    justify-content: space-between;\n    align-items: center;\n    padding: 10px 14px;\n    background-color: var(--panel-color);\n    transition: var(--tran-05);\n    z-index: 10;\n}\nnav.close ~ .dashboard .top{\n    left: 73px;\n    width: calc(100% - 73px);\n}\n.dashboard .top .sidebar-toggle{\n    font-size: 26px;\n    color: var(--text-color);\n    cursor: pointer;\n}\n.dashboard .top .search-box{\n    position: relative;\n    height: 45px;\n    max-width: 600px;\n    width: 100%;\n    margin: 0 30px;\n}\n.top .search-box input{\n    position: absolute;\n    border: 1px solid var(--border-color);\n    background-color: var(--panel-color);\n    padding: 0 25px 0 50px;\n    border-radius: 5px;\n    height: 100%;\n    width: 100%;\n    color: var(--text-color);\n    font-size: 15px;\n    font-weight: 400;\n    outline: none;\n}\n.top .search-box i{\n    position: absolute;\n    left: 15px;\n    font-size: 22px;\n    z-index: 10;\n    top: 50%;\n    transform: translateY(-50%);\n    color: var(--black-light-color);\n}\n.top img{\n    width: 40px;\n    border-radius: 50%;\n}\n.dashboard .dash-content{\n    padding-top: 50px;\n}\n.dash-content .title{\n    display: flex;\n    align-items: center;\n    margin: 60px 0 30px 0;\n}\n.dash-content .title i{\n    position: relative;\n    height: 35px;\n    width: 35px;\n    background-color: var(--primary-color);\n    border-radius: 6px;\n    color: var(--title-icon-color);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 24px;\n}\n.dash-content .title .text{\n    font-size: 24px;\n    font-weight: 500;\n    color: var(--text-color);\n    margin-left: 10px;\n}\n.dash-content .boxes{\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    flex-wrap: wrap;\n}\n.dash-content .boxes .box{\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    border-radius: 12px;\n    width: calc(100% / 3 - 15px);\n    padding: 15px 20px;\n    background-color: var(--box1-color);\n    transition: var(--tran-05);\n}\n.boxes .box i{\n    font-size: 35px;\n    color: var(--text-color);\n}\n.boxes .box .text{\n    white-space: nowrap;\n    font-size: 18px;\n    font-weight: 500;\n    color: var(--text-color);\n}\n.boxes .box .number{\n    font-size: 40px;\n    font-weight: 500;\n    color: var(--text-color);\n}\n.boxes .box.box2{\n    background-color: var(--box2-color);\n}\n.boxes .box.box3{\n    background-color: var(--box3-color);\n}\n.dash-content .activity .activity-data{\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    width: 100%;\n}\n.activity .activity-data{\n    display: flex;\n}\n.activity-data .data{\n    display: flex;\n    flex-direction: column;\n    margin: 0 15px;\n}\n.activity-data .data-title{\n    font-size: 20px;\n    font-weight: 500;\n    color: var(--text-color);\n}\n.activity-data .data .data-list{\n    font-size: 18px;\n    font-weight: 400;\n    margin-top: 20px;\n    white-space: nowrap;\n    color: var(--text-color);\n}\n.data.action .data-list button {\n    background-color: #28a745; /* Green background color */\n    color: white; /* White text color */\n    border: none; /* No border */\n    padding: 5px 8px; /* Padding around the button */\n    font-size: 14px; /* Font size */\n    cursor: pointer; /* Pointer cursor on hover */\n    border-radius: 25px; /* Curved edges */\n    transition: background-color 0.3s ease, transform 0.3s ease; /* Smooth transition on hover */\n}\n\n.data.action .data-list button:hover {\n    background-color: #218838; /* Darker green on hover */\n    transform: scale(1.05); /* Slightly larger on hover */\n}\n\n.data.action .data-list button:active {\n    background-color: #1e7e34; /* Even darker green on click */\n    transform: scale(1); /* Reset scale on click */\n}\nhtml {\n    scroll-behavior: smooth; /* Enables smooth scrolling for all anchor links */\n}\n\n\n@media (max-width: 1000px) {\n    nav{\n        width: 73px;\n    }\n    nav.close{\n        width: 250px;\n    }\n    nav .logo_name{\n        opacity: 0;\n        pointer-events: none;\n    }\n    nav.close .logo_name{\n        opacity: 1;\n        pointer-events: auto;\n    }\n    nav li a .link-name{\n        opacity: 0;\n        pointer-events: none;\n    }\n    nav.close li a .link-name{\n        opacity: 1;\n        pointer-events: auto;\n    }\n    nav ~ .dashboard{\n        left: 73px;\n        width: calc(100% - 73px);\n    }\n    nav.close ~ .dashboard{\n        left: 250px;\n        width: calc(100% - 250px);\n    }\n    nav ~ .dashboard .top{\n        left: 73px;\n        width: calc(100% - 73px);\n    }\n    nav.close ~ .dashboard .top{\n        left: 250px;\n        width: calc(100% - 250px);\n    }\n    .activity .activity-data{\n        overflow-X: scroll;\n    }\n}\n\n@media (max-width: 780px) {\n    .dash-content .boxes .box{\n        width: calc(100% / 2 - 15px);\n        margin-top: 15px;\n    }\n}\n@media (max-width: 560px) {\n    .dash-content .boxes .box{\n        width: 100% ;\n    }\n}\n@media (max-width: 400px) {\n    nav{\n        width: 0px;\n    }\n    nav.close{\n        width: 73px;\n    }\n    nav .logo_name{\n        opacity: 0;\n        pointer-events: none;\n    }\n    nav.close .logo_name{\n        opacity: 0;\n        pointer-events: none;\n    }\n    nav li a .link-name{\n        opacity: 0;\n        pointer-events: none;\n    }\n    nav.close li a .link-name{\n        opacity: 0;\n        pointer-events: none;\n    }\n    nav ~ .dashboard{\n        left: 0;\n        width: 100%;\n    }\n    nav.close ~ .dashboard{\n        left: 73px;\n        width: calc(100% - 73px);\n    }\n    nav ~ .dashboard .top{\n        left: 0;\n        width: 100%;\n    }\n    nav.close ~ .dashboard .top{\n        left: 0;\n        width: 100%;\n    }\n}\n    " }} />
      <nav>
        <div className="logo-name">
          <div className="logo-image">
            <img src="images/logo.png" alt="" />
          </div>
          <span className="logo_name">ADMIN</span>
        </div>
        <div className="menu-items">
          <ul className="nav-links">
            <li>
              <Link to="/admindashboard" className="smooth-scroll">
                <i className="uil uil-chart" />
                <span className="link-name">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/adminuserapproval" className="smooth-scroll">
                <i className="uil uil-chart" />
                <span className="link-name">Registration Approval</span>
              </Link>
            </li>
            <li>
              <Link to="/adminassetapproval" className="smooth-scroll">
                <i className="uil uil-chart" />
                <span className="link-name">Asset Approval</span>
              </Link>
            </li>
            <li>
              <a href="/adminfacultyapproval" className="smooth-scroll">
                <i className="uil uil-chart" />
                <span className="link-name">Faculty Approval</span>
              </a>
            </li>
            <li>
              <a href="/analytics" className="smooth-scroll">
                <i className="uil uil-chart" />
                <span className="link-name">Analytics</span>
              </a>
            </li>
            <ul className="logout-mode">
              <li>
                <a href="/">
                  <i className="uil uil-signout" />
                  <span className="link-name">Logout</span>
                </a>
              </li>
            </ul>
          </ul>
        </div>
      </nav>
      <section className="dashboard">
        <div className="top">
          <i className="uil uil-bars sidebar-toggle" />
          <div className="search-box">
            <i className="uil uil-search" />
            <input type="text" placeholder="Search here..." />
          </div>
        </div>
        <div className="dash-content">
          <div className="overview">
            <div className="title">
              <i className="uil uil-tachometer-fast-alt" />
              <span className="text">Dashboard</span>
            </div>
            
          </div>
           {/* Donut Chart */}
           
          
      <div className="analytics-container" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
      <div className="module" style={moduleStyle2}>
          <h3 style={titleStyle}>User Distribution</h3>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "450px" }}>

      <Doughnut
        data={doughnutChartData}
        options={doughnutChartOptions}
      />
      </div>
      </div>
        <div className="module" style={moduleStyle} >
          <h3 style={titleStyle}>Asset Entries</h3>
          <Bar
            data={generateChartConfig("Asset Entries", assetData, "rgba(22, 224, 224, 0.6)")}
          />
        </div>
        <div className="module" style={moduleStyle}>
          <h3 style={titleStyle}>Internal Faculty Entries</h3>
          <Bar
            data={generateChartConfig("Internal Faculty Entries", internalData, "rgba(153, 102, 255, 0.6)")}
          />
        </div>
        <div className="module" style={moduleStyle}>
          <h3 style={titleStyle}>External Faculty Entries</h3>
          <Bar
            data={generateChartConfig("External Faculty Entries", externalData, "rgba(255, 99, 132, 0.6)")}
          />
        </div>
        <div className="module" style={moduleStyle}>
          <h3 style={titleStyle}>Total Data Entries</h3>
          <Bar
            data={generateChartConfig("Total Data Entries in each Month", totalData, "rgba(12, 220, 50, 0.6)")}
          />
        </div>
      </div>
   
        </div>
      </section>
    </div>
  );
}
const moduleStyle2={
    width: "60%",
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
}
const moduleStyle = {
    width: "40%",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };
  
  const titleStyle = {
    marginBottom: "15px",
    fontSize: "1.2em",
    color: "#28a745",
  };
  
export default Analytics;
