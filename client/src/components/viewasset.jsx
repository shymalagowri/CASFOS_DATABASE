import React, { useEffect, useState } from "react";
import "../styles/style.css";
import "../styles/viewAsset.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const ViewAsset = () => {
  const [assetType, setAssetType] = useState("");
  const [location, setLocation] = useState("");
  const [accessories, setAccessories] = useState("");
  const [amcFromDate, setAmcFromDate] = useState("");
  const [amcToDate, setAmcToDate] = useState("");
  const [purchaserName, setPurchaserName] = useState("");  // New state
  const [purchaseDateFrom, setPurchaseDateFrom] = useState(""); // New state
  const [purchaseDateTo, setPurchaseDateTo] = useState(""); // New state
  const [tableData, setTableData] = useState([]);
  const [message, setMessage] = useState("");
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]); // New state for permissions
  const [loading, setLoading] = useState(false); // Loading state to control fetching

  const location1 = useLocation();
  const queryParams = new URLSearchParams(location1.search); // Create URLSearchParams object
  const username = queryParams.get("username") || "Guest";
  const role = "viewer";

  // Use useEffect to handle data fetching when any filter changes
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        // Example API call to get user permissions
        const response = await axios.get(`http://localhost:3001/api/users/access/${username}/${role}`); // Make sure the API endpoint is correct
        const userData = response.data;
        console.log(userData);
        if (userData && userData.access) {
          setUserPermissions(userData.access); // Set user access based on the API response
        }
        setLoading(true); // Mark as loaded after fetching permissions
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        setLoading(true); // Mark as loaded after fetching permissions
      }
    };

    fetchUserPermissions();
  }, [username]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3001/api/assets/filterAssets",
          {
            assetType,
            location,
            accessories,
            amcFromDate,
            amcToDate,
            purchaserName,      // Added new field
            purchaseDateFrom,   // Added new field
            purchaseDateTo,     // Added new field
            userPermissions,
          }
        );
        console.log(response.data);
  
        if (response.data.length > 0) {
          const transformedData = response.data.flatMap((item) =>
            Object.entries(item.data).map(([accessory, details]) => ({
              assetType: item.assetType,
              location: item.location,
              accessory,
              quantity: details.quantity || "N/A",
              purchaserName: details.purchaserName || "N/A", // Added
              purchaseDate: details.purchaseDate
                ? new Date(details.purchaseDate).toLocaleDateString()
                : "N/A", // Added
              vendor: details.vendor || "N/A",
              deliveryDate: details.deliveryDate
                ? new Date(details.deliveryDate).toLocaleDateString()
                : "N/A",
              amcDate: details.amcDate
                ? new Date(details.amcDate).toLocaleDateString()
                : "N/A",
              invoicePicture: details.invoicePicture || "N/A",
              joined: item.joined
                ? new Date(item.joined).toLocaleDateString()
                : "N/A",
              maintenanceDate: item.maintenance_date || "N/A",
            }))
          );
  
          setTableData(transformedData);
          setMessage("");
        } else {
          setTableData([]);
          setMessage("No matching records found.");
        }
      } catch (error) {
        setTableData([]);
        setMessage("No matching records.");
      }
    };
  
    fetchData();
  }, [assetType, location, accessories, amcFromDate, amcToDate, purchaserName, purchaseDateFrom, purchaseDateTo, loading]); // Updated dependencies
  
  const handleClearFilter = () => {
    setAssetType("");
    setLocation("");
    setAccessories("");
    setAmcFromDate("");
    setAmcToDate("");
    setPurchaserName("");   // Added
    setPurchaseDateFrom(""); // Added
    setPurchaseDateTo("");   // Added
    setTableData([]);
    setMessage("");
  };
  
// Utility function to convert an image URL to a Base64 data URL
const getBase64ImageFromUrl = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // This is important if the image is from a different origin
    img.setAttribute("crossOrigin", "anonymous");

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = imageUrl;
  });
};

const generatePDF = async () => {
  const input = document.querySelector(".asset-table");
  if (!input) {
    alert("No data to generate PDF.");
    return;
  }

  const allHeaders = Array.from(input.querySelectorAll("thead th")).map(th => th.innerText);
  const ignoreIndex = allHeaders.indexOf("Invoice Picture");

  // Extract headers, excluding "Invoice Picture"
  const headers = allHeaders.filter((_, index) => index !== ignoreIndex);

  // Extract table rows dynamically, excluding the ignored column
  const rows = Array.from(input.querySelectorAll("tbody tr")).map(tr =>
    Array.from(tr.querySelectorAll("td"))
      .map(td => td.innerText)
      .filter((_, index) => index !== ignoreIndex) // Exclude "Invoice Picture" column
  );


  // Convert logo image path to Base64
  let logoBase64;
  try {
    logoBase64 = await getBase64ImageFromUrl("images/CASFOS-Coimbatore.jpg");
  } catch (error) {
    console.error("Error loading logo image", error);
  }

  // Create PDF with A3 Landscape dimensions
  const pdf = new jsPDF("l", "mm", "a3");
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Add Watermark
  // Reset text color for normal content

  // Logo Position & Size
  const logoWidth = 50;
  const logoHeight = 50;
  const logoX = 10;
  const logoY = 10;

  if (logoBase64) {
    pdf.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
  }

  // Title Centered to Logo
  const titleX = pageWidth / 2;
  const titleY = logoY + logoHeight / 2;

  pdf.setFontSize(30);
  pdf.setFont("helvetica", "bold");
  pdf.text("Central Academy for State Forest Service", titleX, titleY, { align: "center" });

  // Date & Time at Top Right
  const currentDateTime = new Date();
  const dateString = currentDateTime.toLocaleDateString();
  const timeString = currentDateTime.toLocaleTimeString();

  pdf.setFontSize(17);
  pdf.text(`Date: ${dateString}`, pageWidth - 60, logoY + 20);
  pdf.text(`Time: ${timeString}`, pageWidth - 60, logoY + 30);

  // Asset Report Title (Just Above the Table)
  const assetReportY = logoY + logoHeight + 20;
  pdf.setFontSize(27);
  pdf.text("Asset Report", titleX, assetReportY, { align: "center" });

  // Add Dynamic Table Below "Asset Report"
  pdf.autoTable({
    startY: assetReportY + 10, // Position below the "Asset Report" title
    head: [headers],
    body: rows,
    theme: "grid",
    styles: { fontSize: 14, cellPadding: 5 }, // Larger font & better padding
    headStyles: { fillColor: [22, 160, 133], fontSize: 16 }, // Larger headers
    columnStyles: {
      0: { cellWidth: 40 }, // Adjust first column width if needed
      1: { cellWidth: "auto" }, // Auto width for better distribution
    },
  });

  pdf.save("asset_report.pdf");
};



  const generateCSV = () => {
  if (tableData.length === 0) {
    alert("No data to generate CSV.");
    return;
  }

  // Format dates in the MM/DD/YYYY format with leading zeros
  const formatDate = (dateString) => {
    if (dateString === "N/A") return "N/A"; // Handle "N/A" values
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`; // Format as MM/DD/YYYY
  };

  // Format all date fields in the tableData, excluding `joined` and `maintenanceDate`
  const formattedData = tableData.map((row) => {
    const { joined, maintenanceDate, ...rest } = row; // Exclude `joined` and `maintenanceDate`
    return {
      ...rest, // Include all other fields
      purchaseDate: formatDate(row.purchaseDate),
      deliveryDate: formatDate(row.deliveryDate),
      amcDate: formatDate(row.amcDate),
    };
  });

  const csv = Papa.unparse(formattedData); // Convert formatted data to CSV
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "asset_report.csv"; // File name
  link.click();
};
  return (
    <>
      <div className="asset-view">
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
            <li>
              <a href={`/viewerdashboard?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li className="active">
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
            <div className="dash-content">
  <div className="title">
    <span className="text">Asset View</span>
  </div>

  {/* Main Container for Filters & Buttons */}
  <div className="filter-container">
    <div className="filter-grid">
      <div className="filter-item">
        <label htmlFor="assetType">Asset Type:</label>
        <input
          id="assetType"
          type="text"
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          placeholder="Enter asset type"
        />
      </div>
      <div className="filter-item">
        <label htmlFor="location">Location:</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
      </div>
      <div className="filter-item">
        <label htmlFor="accessories">Accessories:</label>
        <input
          id="accessories"
          type="text"
          value={accessories}
          onChange={(e) => setAccessories(e.target.value)}
          placeholder="Enter accessories"
        />
      </div>
      <div className="filter-item">
        <label htmlFor="purchaserName">Purchaser Name:</label>
        <input
          id="purchaserName"
          type="text"
          value={purchaserName}
          onChange={(e) => setPurchaserName(e.target.value)}
          placeholder="Enter purchaser name"
        />
      </div>
      <div className="filter-item">
        <label htmlFor="amcFromDate">AMC From Date:</label>
        <input
          id="amcFromDate"
          type="date"
          value={amcFromDate}
          onChange={(e) => setAmcFromDate(e.target.value)}
        />
      </div>
      <div className="filter-item">
        <label htmlFor="amcToDate">AMC To Date:</label>
        <input
          id="amcToDate"
          type="date"
          value={amcToDate}
          onChange={(e) => setAmcToDate(e.target.value)}
        />
      </div>
      
      <div className="filter-item">
        <label htmlFor="purchaseDateFrom">Purchase Date From:</label>
        <input
          id="purchaseDateFrom"
          type="date"
          value={purchaseDateFrom}
          onChange={(e) => setPurchaseDateFrom(e.target.value)}
        />
      </div>
      <div className="filter-item">
        <label htmlFor="purchaseDateTo">Purchase Date To:</label>
        <input
          id="purchaseDateTo"
          type="date"
          value={purchaseDateTo}
          onChange={(e) => setPurchaseDateTo(e.target.value)}
        />
      </div>
    </div>

    {/* Buttons at the bottom in a horizontal row */}
    <div className="button-container">
      <button className="btn clear" onClick={handleClearFilter}>
        Clear Filter
      </button>
      <button className="btn generate" onClick={generatePDF}>
        Generate PDF
      </button>
      <button className="btn generate" onClick={generateCSV}>
        Generate CSV
      </button>
    </div>
</div>


              {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}
              {tableData.length > 0 && (
                <table className="asset-table" style={{ marginTop: "1rem" }}>
                  <thead>
                    <tr>
                      <th>Asset Type</th>
                      <th>Location</th>
                      <th>Accessory</th>
                      <th>Quantity</th>
                      <th>Purchaser Name</th>
                      <th>Purchase Date</th>
                      <th>Vendor</th>
                      <th>Delivery Date</th>
                      <th>AMC Date</th>
                      <th>Invoice Picture</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.assetType}</td>
                        <td>{row.location}</td>
                        <td>{row.accessory}</td>
                        <td>{row.quantity}</td>
                        <td>{row.purchaserName}</td>
                        <td>{row.purchaseDate}</td>
                        <td>{row.vendor}</td>
                        <td>{row.deliveryDate}</td>
                        <td>{row.amcDate}</td>
                        <td>
  {row.invoicePicture && (
    <img
      src={row.invoicePicture}
      alt="Invoice"
      style={{ width: "100px", height: "auto", cursor: "pointer" }}
      onClick={() => {
        setSelectedImage(row.invoicePicture);
        setImageModalOpen(true);
      }}
    />
  )}
</td>                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
          {/* MAIN */}
        </section>
        {imageModalOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
    onClick={() => setImageModalOpen(false)} // Close modal when clicking outside
  >
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "90%",
        maxHeight: "90%",
        overflow: "auto",
      }}
      onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
    >
      <img
        src={selectedImage}
        alt="Invoice"
        style={{ maxWidth: "100%", maxHeight: "80vh" }}
      />
      <button
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => setImageModalOpen(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
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
  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "1rem",
  },
  btn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  clear: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
  },
  generate: {
    backgroundColor: "#007BFF",
    color: "#fff",
  },
};

export default ViewAsset;