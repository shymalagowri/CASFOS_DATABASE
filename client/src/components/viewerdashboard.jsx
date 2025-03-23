import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const ViewerDashboard = () => {
  const [linelabels, setlineLabels] = useState(['IT', 'Store', 'Electricals', 'Furniture']);
  const [lineChartData, setLineChartData] = useState([[], [], [], []]); // Initialize with 4 empty arrays
  const [assetData, setAssetData] = useState([]);
  const [internalData, setInternalData] = useState([]);
  const [externalData, setExternalData] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedFacultyYear, setSelectedFacultyYear] = useState("All");
  const [sessionData, setSessionData] = useState([]);
  const [selectedSessionYear, setSelectedSessionYear] = useState("All");
  const [sessionLabels, setSessionLabels] = useState([]);
  
const [selectedLocation, setSelectedLocation] = useState("All");
const [newlabels, setnewLabels] = useState([]);
const [Facultylabels, setFacultyLabels] = useState([]);

  const [labels, setLabels] = useState([]);
  const [userCounts, setUserCounts] = useState({ adminCount: 0, dataEntryCount: 0, viewerCount: 0 });
  const location = useLocation(); 
  const queryParams = new URLSearchParams(location.search); // Create URLSearchParams object
  const username = queryParams.get("username") || "Guest"; // Extract username from URL
  // Fetch data from the backend
  const handleFacultyYearChange = (event) => {
    setSelectedFacultyYear(event.target.value);
  };
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        let url = "http://localhost:3001/api/faculty/sessions";
        if (selectedSessionYear !== "All") {
          url += `?year=${selectedSessionYear}`;
        } else {
          url += `?year=All`;
        }
  
        const sessionRes = await axios.get(url);
        console.log("Ss",sessionRes);
        setSessionData(sessionRes.data.sessionCounts);
        
        // Set labels based on selected year
        const labels = selectedSessionYear === "All" 
          ? [...Array(11)].map((_, i) => (2025 + i).toString()) 
          : [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
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
        // Fetch asset entries
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
  // Make sure fetchFacultyData runs on component mount and dropdown change
useEffect(() => {
  const fetchFacultyData = async () => {
    try {
      let url = "http://localhost:3001/api/faculty/monthly";
      if (selectedFacultyYear !== "All") {
        url += `?year=${selectedFacultyYear}`;
      }
      else{
        url += `?year=All`;
      }

      const facultyRes = await axios.get(url);
      setInternalData(facultyRes.data.internal);
      setExternalData(facultyRes.data.external);
      console.log("fac",facultyRes.data);
      const labels = selectedFacultyYear === "All" ? 
        [...Array(11)].map((_, i) => (2025 + i).toString()) : 
        [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
      setFacultyLabels(labels);

    
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    }
  };

  fetchFacultyData(); // Ensure data is fetched when the component loads

}, [selectedFacultyYear]); // Fetch again when selectedFacultyYear changes

  const fetchFilteredData = async () => {
    try {
      let url = "http://localhost:3001/api/assets/types?";
  
      if (selectedLocation !== "All") {
        url += `location=${selectedLocation}&`;
      }
      if (selectedYear !== "All") {
        url += `year=${selectedYear}`;
      } else {
        url += `year=all`; // Signal the backend to return yearly data
      }
  
      console.log(selectedYear);
      console.log(selectedLocation);
  
      const response = await axios.get(url);
      const data = response.data; // Will be a 2D array with 11 rows (2025-2035) or 12 rows (months)
  
      console.log(data);
  
      const assetTypes = ["IT", "Store", "Electrical", "Furniture"];
      const newLineChartData = assetTypes.map((_, idx) =>
        data.map((row) => row[idx])
      );
  
      setlineLabels(assetTypes);
      setLineChartData(newLineChartData);
  
      if (selectedYear === "All") {
        setnewLabels([...Array(11)].map((_, i) => (2025 + i).toString())); // 2025 to 2035
      } else {
        setnewLabels([
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]);
      }
    } catch (error) {
      console.error("Error fetching asset data:", error);
    }
  };
  

  // Fetch data when location or year changes
  useEffect(() => {
    fetchFilteredData();
  }, [selectedLocation, selectedYear]);

  const generateSessionChartConfig = () => ({
    labels: sessionLabels,
    datasets: [
      {
        label: "Total Sessions Handled",
        data: sessionData,
        backgroundColor: "rgba(9, 172, 248, 0.6)",
        borderColor: "rgb(6, 213, 254)",
        borderWidth: 1,
      },
    ],
  });
  
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
  const generateFacultyChartConfig = () => ({
    labels: Facultylabels,
    datasets: [
      {
        label: "Internal Faculty",
        data: internalData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "External Faculty",
        data: externalData,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  });


  const salesData = [
    {
      id: 1,
      value: userCounts.adminCount || "0", // Dynamic value for Admin
      title: "Admin",
      bgColor: "#bfecff",
      iconColor: "#5ccbff",
      iconClass: "fas fa-user-shield", // Font Awesome icon for Admin
    },
    {
      id: 2,
      value: userCounts.dataEntryCount || "0", // Dynamic value for Data Entry Staff
      title: "Data Entry Staff",
      bgColor: "#FFF3D2",
      iconColor: "#FFA85C",
      iconClass: "fas fa-keyboard", // Font Awesome icon for Data Entry Staff
    },
    {
      id: 3,
      value: userCounts.viewerCount || "0", // Dynamic value for Data Viewer
      title: "Data Viewer",
      bgColor: "#D2FFD2",
      iconColor: "#5CFF5C",
      iconClass: "fas fa-eye", // Font Awesome icon for Data Viewer
    },
  ];
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  
  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };
  console.log("hi",selectedYear);
  let filteredLineChartData=[];
  if(selectedYear=="All")
  {
    const startYear =2025
    const currentYear= new Date().getFullYear(); // Get the current month index (0-based)
    // Filter labels and data only up to the current month
    filteredLineChartData = lineChartData.map((data) => data.slice(0, currentYear-startYear  + 1));

  }
  else{
    const currentMonthIndex = new Date().getMonth(); // Get the current month index (0-based)
    // Filter labels and data only up to the current month
    filteredLineChartData = lineChartData.map((data) => data.slice(0, currentMonthIndex  + 1));
  }
  


const lineChartConfig = {
  labels: newlabels,
  datasets: filteredLineChartData.map((data, idx) => ({
    label: linelabels[idx], // Dynamically set the asset type name (e.g., IT, Store, etc.)
    data: data, // The filtered data for this asset type
    borderColor: idx === 0 ? "#4bc0c0" : idx === 1 ? "#ff5733" : idx === 2 ? "#f1c40f" : "#3498db",
    backgroundColor: idx === 0 ? "rgba(75, 192, 192, 0.2)" : idx === 1 ? "rgba(255, 87, 51, 0.2)" : idx === 2 ? "rgba(241, 196, 15, 0.2)" : "rgba(52, 152, 219, 0.2)",
    tension: 0.4,
    pointRadius: 5,
    pointHoverRadius: 8,
  })),
  
};
const lineChartOptions = {
  responsive: true,
  
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: {
          size: 14,
        },
      },
    },
    title: {
      display: true,
      font: {
        size: 18,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "#f2f2f2",
      },
      ticks: {
        min:0,
        stepSize:10,
      },
    },
  },
};

  return (
    <>
      <div>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="style.css" />
        <title>CASFOS</title>
        <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">VIEWER</span>
          </a>
          <ul className="side-menu top">
            <li className="active">
            <a href={`/viewerdashboard?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li>
            <a href={`/viewasset?username=${encodeURIComponent(username)}`}>
            <i className="bx bxs-shopping-bag-alt" />
                <span className="text">Asset View</span>
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
              <a href="/" className="logout">
                <i className="bx bxs-log-out-circle" />
                <span className="text">Logout</span>
              </a>
            </li>
          </ul>
        </section>
        {/* SIDEBAR */}
        {/* CONTENT */}
        <section id="content">
          {/* NAVBAR */}
          <nav>
            <i className="bx bx-menu" />
            <span className="head-title">Dashboard</span>
            <form action="#">
              <div className="form-input"></div>
            </form>
            <div style={styles.usernameContainer}>
              <i className="bx bxs-user-circle" style={styles.userIcon}></i>
              <span style={styles.username}>{username}</span>
            </div>
          </nav>
          {/* NAVBAR */}
          {/* MAIN */}
          <main>
           
           
          
       
          
      {/* Add Font Awesome link */}
      <Helmet>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          rel="stylesheet"
        />
      </Helmet>

      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Total Registered Users</h2>
        </div>
        <p style={styles.subtitle}>User's Summary</p>
        <div style={styles.cardContainer}>
          {salesData.map((item) => (
            <div key={item.id} style={{ ...styles.card, backgroundColor: item.bgColor }}>
              <div style={{ ...styles.icon, backgroundColor: item.iconColor }}>
                <i className={item.iconClass} style={styles.iconStyle}></i>
              </div>
              <h3>{item.value}</h3>
              <p>{item.title}</p>
              <span style={styles.change}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.container2}>
      <div className="chart-container">
      <h3  style={{ textAlign:"center", color:"#28a745"}}>Overall Assets Count in Each Type</h3>

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

    <label style={{ marginTop: "20px" }}>
      Location:
      <select value={selectedLocation} onChange={handleLocationChange}>
        <option value="All">All</option>
        <option value="faculty_chamber">Faculty Chamber</option>
    <option value="officer_quarters">Officer Quarters</option>
    <option value="staff_quarters">Staff Quarters</option>
    <option value="corbett_hall">Corbett Hall</option>
    <option value="champion_hall">Champion Hall</option>
    <option value="gis_lab">GIS Lab</option>
    <option value="van_vatika">Van Vatika</option>
    <option value="hostel">Hostel</option>
    <option value="officers_mess">Officers Mess</option>
    <option value="van_sakthi">Van Sakthi</option>
    <option value="library">Library</option>
    <option value="classroom">Classroom</option>
    <option value="office_room">Office Room</option>
    <option value="officers_lounge">Officer's Lounge</option>
    <option value="gymnasium">Gymnasium</option>
      </select>
    </label>
  </div>

  <Line data={lineChartConfig} options={lineChartOptions} />
  
  </div>

          </div>
          
      <div className="analytics-container" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
      <div className="module" style={moduleStyle}>
                <h3 style={titleStyle}>Count of Faculties Entered</h3>
                <div className="filters">

    <label style={{ marginTop: "20px" }}>
      Year:
                <select onChange={handleFacultyYearChange} value={selectedFacultyYear}>
          <option value="All">All</option>
          {/* You can add other specific years if required */}
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          {/* Add more years if needed */}
        </select>
        </label></div>
                <Bar
                  data={generateFacultyChartConfig()}
                />
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
        {/* Add more years if needed */}
      </select>
    </label>
  </div>
  <Bar data={generateSessionChartConfig()} />
</div>

            </div>
            </main>
          {/* MAIN */}
        </section>
        {/* CONTENT */}
      </div>
            
    </>
    
  );
};

const styles = {
  usernameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#555",
  },
  userIcon: {
    fontSize: "30px",
    color: "#007BFF",
  },
  username: {
    fontWeight: "bold",
    fontSize: "18px", // Increased font size for username
  },
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  container2: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  
  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  cardContainer: {
    display: "flex",
    gap: "15px",
  },
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
  change: {
    color: "#666",
    fontSize: "12px",
  },
};
const moduleStyle2={
  width: "60%",
  padding: "10px",
  backgroundColor: "white",
  borderRadius: "15px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
}
const moduleStyle = {
  width: "45%",
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "15px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
};
const moduleStyle3 = {
  width: "50%",
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

export default ViewerDashboard;
