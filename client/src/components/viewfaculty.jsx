import React, { useEffect, useState } from "react";
import "../styles/style.css";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import "../styles/viewFaculty.css"

const ViewFaculty = () => {
  const [facultyType, setFacultyType] = useState("");
    const [name, setName] = useState("");
    const [yearOfAllotment, setYearOfAllotment] = useState("");
    const [email, setEmail] = useState("");
    const [domainKnowledge, setDomainKnowledge] = useState("");
    const [areaOfExpertise, setAreaOfExpertise] = useState("");
    const [institution, setInstitution] = useState("");
    const [tableData, setTableData] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState(null);
  const location = useLocation(); 
    const queryParams = new URLSearchParams(location.search); // Create URLSearchParams object
    const username = queryParams.get("username") || "Guest"; 
      useEffect(() => {
    
    const handleApplyFilter = async () => {
      try {
        const response = await axios.post("http://localhost:3001/api/faculty/filterFaculties", {
          facultyType,
          name,
          yearOfAllotment,
          email,
          domainKnowledge,
          areaOfExpertise,
          institution,
        });
  
        
if (response.data.length > 0) {
  const transformedData = response.data.map((item) => ({
    name: item.name,
    photograph: item.photograph || "N/A",
    facultyType: item.facultyType || "N/A",
    mobileNumber: item.mobileNumber || "N/A",
    email: item.email || "N/A",
    yearOfAllotment: item.yearOfAllotment || "N/A",
   
  }));

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
    handleApplyFilter();
  },[facultyType, name, email]);
    const renderPopupContent = (data) => {
      const renderValue = (value, key) => {
        if (key === "photograph" && typeof value === "string") {
          // Ensure correct URL format for the image
          const imageUrl = `http://localhost:3001/uploads/${value.split("\\").pop()}`;
          return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }} />;
        }
    
        if (Array.isArray(value)) {
          return (
            <ul>
              {value.map((item, index) => (
                <li key={index}>{renderValue(item, key)}</li>
              ))}
            </ul>
          );
        }
    
        if (typeof value === "object" && value !== null) {
          return (
            <ul>
              {Object.entries(value)
                .filter(([key]) => key !== "_id")
                .map(([key, val]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</strong> {renderValue(val, key)}
                  </li>
                ))}
            </ul>
          );
        }
    
        return value?.toString() || "-";
      };
    
      return Object.entries(data)
        .filter(([key]) => key !== "_id")
        .map(([key, value]) => (
          <tr key={key}>
            <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>
              {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:
            </td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td>
          </tr>
        ));
    };
    
      
    const handleClearFilter = () => {
      setFacultyType("");
      setName("");
      setYearOfAllotment("");
      setEmail("");
      setDomainKnowledge("");
      setAreaOfExpertise("");
      setInstitution("");
      setTableData([]);
      setMessage("");
    };
  
    const handleViewDetails = (faculty) => {
      setSelectedFaculty(faculty);
    };
  
    const closePopup = () => {
      setSelectedFaculty(null);
    };
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
    const generateFacultyPDF = async () => {
      const input = document.querySelector(".faculty-table");
      if (!input) {
        alert("No data to generate PDF.");
        return;
      }
    
      const allHeaders = Array.from(input.querySelectorAll("thead th")).map(th => th.innerText);
      const ignoreIndexes = ["Photograph", "View"].map(header => allHeaders.indexOf(header)).filter(index => index !== -1);
    
      // Extract headers excluding ignored columns
      const headers = allHeaders.filter((_, index) => !ignoreIndexes.includes(index));
    
      // Extract table rows dynamically, excluding ignored columns
      const rows = Array.from(input.querySelectorAll("tbody tr")).map(tr =>
        Array.from(tr.querySelectorAll("td"))
          .map(td => td.innerText)
          .filter((_, index) => !ignoreIndexes.includes(index))
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
    
      // Faculty Report Title
      const reportY = logoY + logoHeight + 20;
      pdf.setFontSize(27);
      pdf.text("Faculty Report", titleX, reportY, { align: "center" });
    
      // Add Table Below the Title
      pdf.autoTable({
        startY: reportY + 10, // Position below the title
        head: [headers],
        body: rows,
        theme: "grid",
        styles: { fontSize: 14, cellPadding: 5 },
        headStyles: { fillColor: [22, 160, 133], fontSize: 16 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: "auto" } },
      });
    
      pdf.save("faculty_report.pdf");
    };
    
    const generateFacultyCSV = () => {
      if (tableData.length === 0) {
        alert("No data to generate CSV.");
        return;
      }
    
      const formatDate = (dateString) => {
        if (dateString === "N/A") return "N/A";
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };
    
      const formattedData = tableData.map((row) => {
        const { photograph, ...rest } = row;
        return {
          ...rest,
          yearOfAllotment: formatDate(row.yearOfAllotment),
        };
      });
    
      const csv = Papa.unparse(formattedData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
    
      link.href = URL.createObjectURL(blob);
      link.download = "faculty_report.csv";
      link.click();
    };
        
  return (
    <>
    <div className="faculty-view">
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
            <li >
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
            <li className="active">
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
            <span className="text">Faculty View with Filters</span>
          </div>
          <div className="filter-container">
  <div className="filter-grid">
    <div className="filter-item">
      <label htmlFor="facultyType">Faculty Type:</label>
      <input
        id="facultyType"
        placeholder="Faculty Type"
        value={facultyType}
        onChange={(e) => setFacultyType(e.target.value)}
      />
    </div>
    <div className="filter-item">
      <label htmlFor="name">Name:</label>
      <input
        id="name"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
    <div className="filter-item">
      <label htmlFor="yearOfAllotment">Year of Allotment:</label>
      <input
        id="yearOfAllotment"
        placeholder="Year of Allotment"
        value={yearOfAllotment}
        onChange={(e) => setYearOfAllotment(e.target.value)}
      />
    </div>
    <div className="filter-item">
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
    <div className="filter-item">
      <label htmlFor="domainKnowledge">Domain Knowledge:</label>
      <input
        id="domainKnowledge"
        placeholder="Domain Knowledge"
        value={domainKnowledge}
        onChange={(e) => setDomainKnowledge(e.target.value)}
      />
    </div>
    <div className="filter-item">
      <label htmlFor="areaOfExpertise">Area of Expertise:</label>
      <input
        id="areaOfExpertise"
        placeholder="Area of Expertise"
        value={areaOfExpertise}
        onChange={(e) => setAreaOfExpertise(e.target.value)}
      />
    </div>
    <div className="filter-item">
      <label htmlFor="institution">Institution:</label>
      <input
        id="institution"
        placeholder="Institution"
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
      />
    </div>
    
  </div>
  <div className="button-container">
  <button className="btn clear" onClick={handleClearFilter}>
    Clear Filter
  </button>
  <button className="btn generate" onClick={generateFacultyPDF}>
    Generate PDF
  </button>
  <button className="btn generate" onClick={generateFacultyCSV}>
    Generate CSV
  </button>
</div>
</div>

          {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}
          {tableData.length > 0 && (
            <table className="faculty-table" style={{ marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Photograph</th> {/* New Column for Image */}

                  <th>Faculty Type</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Year of Allotment</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name}</td>
          <td>
            {row.photograph ? (
              <img 
                src={`http://localhost:3001/uploads/${row.photograph.split("\\").pop()}`} 
                alt="Photograph"
                style={{ width: "50px", height: "50px", borderRadius: "5px", objectFit: "cover" }}
              />
            ) : (
              "No Image"
            )}
          </td>

                    <td>{row.facultyType}</td>
                    <td>{row.mobileNumber}</td>
                    <td>{row.email}</td>
                    <td>{row.yearOfAllotment}</td>
                    <td>
                      <button className="btn view" onClick={() => handleViewDetails(row)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
            </main>
          {/* MAIN */}
        </section>
        {selectedFaculty && (
  <div className="popup">
    <div className="popup-content">
      <h3>Faculty Details</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
        {renderPopupContent(selectedFaculty)}

        </tbody>
      </table>
      <button className="btn close" onClick={closePopup}>Close</button>
    </div>
  </div>
)}
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


export default ViewFaculty;
