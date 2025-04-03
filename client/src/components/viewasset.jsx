import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/style.css";
import "../styles/viewAsset.css";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx"; // Replace `import { CSVLink } from "react-csv";`

const AssetView = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const [zoomedImage, setZoomedImage] = useState(null); // New state for zoomed image URL
  const [activeTab, setActiveTab] = useState("purchase");
  const [purchaseFilters, setPurchaseFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    purchaseDateFrom: "",
    purchaseDateTo: "",
    supplierName: "",
    source: "",
    customSource: "",
    modeOfPurchase: "",
    customModeOfPurchase: "",
    billNo: "",
    receivedBy: "",
    amcDateFrom: "",
    amcDateTo: "",
  });
  const [storeIssueFilters, setStoreIssueFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    itemDescription: "",
    location: "store",
    issuedDateFrom: "",
    issuedDateTo: "",
    itemId: "", // Added here
  });
  const [serviceReturnFilters, setServiceReturnFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    location: "",
    condition: "",
    serviceDateFrom: "",
    serviceDateTo: "",
    serviceNo: "",
    serviceAmountFrom: "",
    serviceAmountTo: "",
  });
  const [disposalFilters, setDisposalFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    inspectionDateFrom: "",
    inspectionDateTo: "",
    condemnationDateFrom: "",
    condemnationDateTo: "",
    remark: "",
    purchaseValueFrom: "",
    purchaseValueTo: "",
    bookValueFrom: "",
    bookValueTo: "",
    disposalValueFrom: "",
    disposalValueTo: "",
  });
  const [tableData, setTableData] = useState([]);
  const [message, setMessage] = useState("");

  const assetTypeOptions = ["", "Permanent", "Consumable", "Others"];
  const permanentAssetOptions = [
    "",
    "Furniture",
    "Vehicle",
    "Building",
    "Instruments",
    "Sports and Goods",
    "Fabrics",
    "Electrical",
    "Electronics",
    "Photograph Items",
    "Land",
    "ICT Goods",
  ];
  const consumableAssetOptions = [
    "",
    "Stationery",
    "IT",
    "Electrical",
    "Plumbing",
    "Glassware/Laboratory Items",
    "Sanitory Items",
    "Sports Goods",
    "Fabrics",
    "Instruments",
  ];
  const sourceOptions = ["", "GEM", "Local", "Other"];
  const modeOfPurchaseOptions = ["", "Tender", "Quotation", "Others"];
  const conditionOptions = ["", "InService", "Serviced", "Servicable"]; // Added "Servicable"
  const locationOptions = [
    "store",
    "all_issued", // Added here
    "faculty_chamber",
    "officer_quarters",
    "staff_quarters",
    "corbett_hall",
    "champion_hall",
    "gis_lab",
    "van_vatika",
    "hostel",
    "officers_mess",
    "van_sakthi",
    "library",
    "classroom",
    "office_room",
    "officers_lounge",
    "gymnasium",
  ];
  const subCategoryOptions = {
    Furniture: ["", "Wood", "Steel", "Plastic", "Others"],
    Vehicle: ["", "Two-wheeler", "Three-wheeler", "Four-wheeler", "Bus", "Others"],
    Building: [
      "",
      "Vana Vigyan",
      "Store and Godown Building",
      "Garages",
      "Pavilion",
      "Gym Building",
      "Chandan Hostel",
      "Vana Vatika",
      "Executive Hostel",
      "Ladies Hostel",
      "Officer Trainees Mess",
      "Residential Quarters",
      "Others",
    ],
    Instruments: ["", "Laboratory", "Field Exercise Instruments", "Garden Instruments", "Others"],
    Fabrics: ["", "Curtains", "Carpets", "Others"],
    Electrical: ["", "Appliance", "Others"],
    Electronics: ["", "Audio/Visual Equipment", "ICT Equipment", "Others"],
    Land: ["", "Land with Building", "Land without Building", "Others"],
  };

  useEffect(() => {
    const fetchData = async () => {
      let endpoint = "";
      let filters = {};

      switch (activeTab) {
        case "purchase":
          endpoint = "/api/assets/filterPurchase";
          filters = {
            ...purchaseFilters,
            assetType: purchaseFilters.assetType === "Others" ? purchaseFilters.customAssetType : purchaseFilters.assetType,
            assetCategory: purchaseFilters.assetCategory === "Others" ? purchaseFilters.customAssetCategory : purchaseFilters.assetCategory,
            subCategory: purchaseFilters.subCategory === "Others" ? purchaseFilters.customSubCategory : purchaseFilters.subCategory,
            source: purchaseFilters.source === "Other" ? purchaseFilters.customSource : purchaseFilters.source,
            modeOfPurchase: purchaseFilters.modeOfPurchase === "Others" ? purchaseFilters.customModeOfPurchase : purchaseFilters.modeOfPurchase,
          };
          break;
        case "storeIssue":
          endpoint = "/api/assets/filterStoreIssue";
          filters = {
            ...storeIssueFilters,
            assetType: storeIssueFilters.assetType === "Others" ? storeIssueFilters.customAssetType : storeIssueFilters.assetType,
            assetCategory: storeIssueFilters.assetCategory === "Others" ? storeIssueFilters.customAssetCategory : storeIssueFilters.assetCategory,
            subCategory: storeIssueFilters.subCategory === "Others" ? storeIssueFilters.customSubCategory : storeIssueFilters.subCategory,
          };
          break;
        case "serviceReturn":
          endpoint = "/api/assets/filterServiceReturn";
          filters = {
            ...serviceReturnFilters,
            assetType: serviceReturnFilters.assetType === "Others" ? serviceReturnFilters.customAssetType : serviceReturnFilters.assetType,
            assetCategory: serviceReturnFilters.assetCategory === "Others" ? serviceReturnFilters.customAssetCategory : serviceReturnFilters.assetCategory,
            subCategory: serviceReturnFilters.subCategory === "Others" ? serviceReturnFilters.customSubCategory : serviceReturnFilters.subCategory,
          };
          break;
        case "disposal":
          endpoint = "/api/assets/filterDisposal";
          filters = {
            ...disposalFilters,
            assetType: disposalFilters.assetType === "Others" ? disposalFilters.customAssetType : disposalFilters.assetType,
            assetCategory: disposalFilters.assetCategory === "Others" ? disposalFilters.customAssetCategory : disposalFilters.assetCategory,
            subCategory: disposalFilters.subCategory === "Others" ? disposalFilters.customSubCategory : disposalFilters.subCategory,
          };
          break;
        default:
          return;
      }

      try {
        const response = await axios.post(`http://localhost:3001${endpoint}`, filters);
        setTableData(response.data);
        setMessage(response.data.length === 0 ? "No matching records found." : "");
      } catch (error) {
        setTableData([]);
        setMessage("Error fetching data.");
        console.error(error);
      }
    };

    fetchData();
  }, [activeTab, purchaseFilters, storeIssueFilters, serviceReturnFilters, disposalFilters]);

  const handleFilterChange = (filterSetter) => (field, value) => {
    filterSetter((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "assetType" && value !== "Others" ? { customAssetType: "" } : {}),
      ...(field === "assetCategory" && value !== "Others" ? { customAssetCategory: "" } : {}),
      ...(field === "subCategory" && value !== "Others" ? { customSubCategory: "" } : {}),
      ...(field === "source" && value !== "Other" ? { customSource: "" } : {}),
      ...(field === "modeOfPurchase" && value !== "Others" ? { customModeOfPurchase: "" } : {}),
    }));
  };

  const handleClearFilter = () => {
    switch (activeTab) {
      case "purchase":
        setPurchaseFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          purchaseDateFrom: "",
          purchaseDateTo: "",
          supplierName: "",
          source: "",
          customSource: "",
          modeOfPurchase: "",
          customModeOfPurchase: "",
          billNo: "",
          receivedBy: "",
          amcDateFrom: "",
          amcDateTo: "",
        });
        break;
      case "storeIssue":
        setStoreIssueFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          itemDescription: "",
          location: "store",
          issuedDateFrom: "",
          issuedDateTo: "",
          itemId: "", // Added here
        });
        break;
      case "serviceReturn":
        setServiceReturnFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          location: "",
          condition: "",
          serviceDateFrom: "",
          serviceDateTo: "",
          serviceNo: "",
          serviceAmountFrom: "",
          serviceAmountTo: "",
        });
        break;
      case "disposal":
        setDisposalFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          inspectionDateFrom: "",
          inspectionDateTo: "",
          condemnationDateFrom: "",
          condemnationDateTo: "",
          remark: "",
          purchaseValueFrom: "",
          purchaseValueTo: "",
          bookValueFrom: "",
          bookValueTo: "",
          disposalValueFrom: "",
          disposalValueTo: "",
        });
        break;
      default:
        break;
    }
    setTableData([]);
    setMessage("");
  };

  // Generate PDF
  // Utility function to convert an image URL to a Base64 data URL (from Code 2)
const getBase64ImageFromUrl = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
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
  // Create PDF with A3 Landscape dimensions (from Code 2)
  const pdf = new jsPDF("l", "mm", "a3");
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Convert logo image path to Base64 (from Code 2)
  let logoBase64;
  try {
    logoBase64 = await getBase64ImageFromUrl("images/CASFOS-Coimbatore.jpg");
  } catch (error) {
    console.error("Error loading logo image", error);
  }

  // Logo Position & Size (from Code 2)
  const logoWidth = 50;
  const logoHeight = 50;
  const logoX = 10;
  const logoY = 10;

  if (logoBase64) {
    pdf.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
  }

  // Title Centered (from Code 2)
  const titleX = pageWidth / 2;
  const titleY = logoY + logoHeight / 2;

  pdf.setFontSize(30);
  pdf.setFont("helvetica", "bold");
  pdf.text("Central Academy for State Forest Service", titleX, titleY, { align: "center" });

  // Date & Time at Top Right (from Code 2)
  const currentDateTime = new Date();
  const dateString = currentDateTime.toLocaleDateString();
  const timeString = currentDateTime.toLocaleTimeString();

  pdf.setFontSize(17);
  pdf.text(`Date: ${dateString}`, pageWidth - 60, logoY + 20);
  pdf.text(`Time: ${timeString}`, pageWidth - 60, logoY + 30);

  // Asset Report Title (Just Above the Table, dynamic from activeTab)
  const assetReportY = logoY + logoHeight + 20;
  pdf.setFontSize(27);
  pdf.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Asset Report`, titleX, assetReportY, { align: "center" });

  // Table Content (from Code 1)
  const tableColumn = [];
  const tableRows = [];

  if (activeTab === "purchase") {
    tableColumn.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Purchase Date",
      "Supplier Name",
      "Source",
      "Mode of Purchase",
      "Bill No",
      "Received By",
      "AMC Date",
      "Quantity Received",
      "Unit Price",
      "Overall Price",
      "Item IDs",
    ]);
    tableData.forEach((row) => {
      tableRows.push([
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        new Date(row.purchaseDate).toLocaleDateString(),
        row.supplierName,
        row.source,
        row.modeOfPurchase,
        row.billNo,
        row.receivedBy,
        row.amcDate ? new Date(row.amcDate).toLocaleDateString() : "N/A",
        row.quantityReceived,
        row.unitPrice,
        row.overallPrice,
        row.itemIds?.join(", ") || "",
      ]);
    });
  } else if (activeTab === "storeIssue" && storeIssueFilters.location === "store") {
    tableColumn.push(["Asset Category", "Sub Category", "Item Name", "Item Description", "In Stock", "Item IDs"]);
    tableData.forEach((row) => {
      tableRows.push([
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.inStock,
        row.itemIds?.join(", ") || "",
      ]);
    });
  } else if (activeTab === "storeIssue" && storeIssueFilters.location !== "store") {
    tableColumn.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Item Description",
      "Location",
      "Quantity Issued",
      "Issued Date",
      "Issued IDs",
    ]);
    tableData.forEach((row) => {
      tableRows.push([
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.location,
        row.quantityIssued,
        row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : "N/A",
        row.issuedIds?.join(", ") || "",
      ]);
    });
  } else if (activeTab === "serviceReturn") {
    tableColumn.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Location",
      "Condition",
      ...(serviceReturnFilters.condition === "InService" ? ["Item ID"] : ["Item IDs", "Service No", "Service Date", "Service Amount"]),
    ]);
    tableData.forEach((row) => {
      if (serviceReturnFilters.condition === "InService") {
        tableRows.push([row.assetType, row.assetCategory, row.subCategory, row.itemName, row.location || "N/A", row.condition, row.itemId]);
      } else {
        tableRows.push([
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.itemName,
          row.location || "N/A",
          row.condition,
          row.itemIds?.join(", ") || "",
          row.serviceNo || "N/A",
          row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A",
          row.serviceAmount || "N/A",
        ]);
      }
    });
  } else if (activeTab === "disposal") {
    tableColumn.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Item IDs",
      "Purchase Value",
      "Book Value",
      "Inspection Date",
      "Condemnation Date",
      "Remark",
      "Disposal Value",
    ]);
    tableData.forEach((row) => {
      tableRows.push([
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemIds?.join(", ") || "",
        row.purchaseValue,
        row.bookValue,
        new Date(row.inspectionDate).toLocaleDateString(),
        new Date(row.condemnationDate).toLocaleDateString(),
        row.remark,
        row.disposalValue,
      ]);
    });
  }

  // Add Dynamic Table Below "Asset Report" with improved width
  pdf.autoTable({
    startY: assetReportY + 10, // Position below the "Asset Report" title
    head: tableColumn,
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 12, cellPadding: 4, overflow: "linebreak" }, // Adjusted for clarity
    headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 14 }, // Slightly larger headers
    alternateRowStyles: { fillColor: [240, 240, 240] }, // From Code 1
    columnStyles: tableColumn[0].reduce((acc, _, index) => {
      acc[index] = { cellWidth: Math.max(25, (pageWidth - 20) / tableColumn[0].length) }; // Dynamic width, min 25mm
      return acc;
    }, {}),
    margin: { left: 10, right: 10 }, // Reduced margins to maximize width
  });

  pdf.save(`${activeTab}_asset_report.pdf`);
};

  // Prepare CSV Data
 // Prepare Excel Data and Generate File
const generateExcel = () => {
  const headers = [];
  const data = [];

  if (activeTab === "purchase") {
    headers.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Purchase Date",
      "Supplier Name",
      "Source",
      "Mode of Purchase",
      "Bill No",
      "Received By",
      "AMC Date",
      "Quantity Received",
      "Unit Price",
      "Overall Price",
      "Item IDs",
    ]);
    tableData.forEach((row) => {
      data.push([
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        new Date(row.purchaseDate).toLocaleDateString(),
        row.supplierName,
        row.source,
        row.modeOfPurchase,
        row.billNo,
        row.receivedBy,
        row.amcDate ? new Date(row.amcDate).toLocaleDateString() : "N/A",
        row.quantityReceived,
        row.unitPrice,
        row.overallPrice,
        row.itemIds?.join(", ") || "",
      ]);
    });
  } else if (activeTab === "storeIssue" && storeIssueFilters.location === "store") {
    headers.push(["Asset Category", "Sub Category", "Item Name", "Item Description", "In Stock", "Item IDs"]);
    tableData.forEach((row) => {
      data.push([row.assetCategory, row.subCategory, row.itemName, row.itemDescription, row.inStock, row.itemIds?.join(", ") || ""]);
    });
  } else if (activeTab === "storeIssue" && storeIssueFilters.location !== "store") {
    headers.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Item Description",
      "Location",
      "Quantity Issued",
      "Issued Date",
      "Issued IDs",
    ]);
    tableData.forEach((row) => {
      data.push([
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.location,
        row.quantityIssued,
        row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : "N/A",
        row.issuedIds?.join(", ") || "",
      ]);
    });
  } else if (activeTab === "serviceReturn") {
    headers.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Location",
      "Condition",
      ...(serviceReturnFilters.condition === "InService" ? ["Item ID"] : ["Item IDs", "Service No", "Service Date", "Service Amount"]),
    ]);
    tableData.forEach((row) => {
      if (serviceReturnFilters.condition === "InService") {
        data.push([row.assetType, row.assetCategory, row.subCategory, row.itemName, row.location || "N/A", row.condition, row.itemId]);
      } else {
        data.push([
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.itemName,
          row.location || "N/A",
          row.condition,
          row.itemIds?.join(", ") || "",
          row.serviceNo || "N/A",
          row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A",
          row.serviceAmount || "N/A",
        ]);
      }
    });
  } else if (activeTab === "disposal") {
    headers.push([
      "Asset Type",
      "Asset Category",
      "Sub Category",
      "Item Name",
      "Item IDs",
      "Purchase Value",
      "Book Value",
      "Inspection Date",
      "Condemnation Date",
      "Remark",
      "Disposal Value",
    ]);
    tableData.forEach((row) => {
      data.push([
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemIds?.join(", ") || "",
        row.purchaseValue,
        row.bookValue,
        new Date(row.inspectionDate).toLocaleDateString(),
        new Date(row.condemnationDate).toLocaleDateString(),
        row.remark,
        row.disposalValue,
      ]);
    });
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers[0], ...data]);

  // Set column widths (in characters, 1 char ≈ 8 pixels in Excel)
  const colWidths = headers[0].map((header, index) => {
    const maxLength = Math.max(
      header.length,
      ...data.map((row) => (row[index] ? row[index].toString().length : 0))
    );
    return { wch: Math.min(maxLength + 5, 50) }; // Add padding, cap at 50 chars
  });
  ws["!cols"] = colWidths;

  // Create workbook and append worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${activeTab} Assets`);

  // Export to file
  XLSX.writeFile(wb, `${activeTab}_assets.xlsx`);
};

  return (
    
    <div className="admin-asset-view">
            <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">ADMIN</span>
        </a>
        <ul className="side-menu top">
            <li className="active"><a href={`/assetentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li ><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
            <li><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
            <li><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
            <li><a href={`/viewasset?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Asset View</span></a></li>
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

      <section id="content">
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
        <main>
          <div className="dash-content">
            <div className="title">
              <span className="text">Asset View</span>
            </div>

            <div className="admin-asset-tabs" style={{ marginBottom: "20px" }}>
              <button
                className={activeTab === "purchase" ? "active" : ""}
                onClick={() => setActiveTab("purchase")}
              >
                Purchase
              </button>
              <button
                className={activeTab === "storeIssue" ? "active" : ""}
                onClick={() => setActiveTab("storeIssue")}
              >
                Store/Issue
              </button>
              <button
                className={activeTab === "serviceReturn" ? "active" : ""}
                onClick={() => setActiveTab("serviceReturn")}
              >
                Service/Return
              </button>
              <button
                className={activeTab === "disposal" ? "active" : ""}
                onClick={() => setActiveTab("disposal")}
              >
                Disposal
              </button>
            </div>

            <div className="admin-asset-filter-container">
              {activeTab === "purchase" && (
                <div className="admin-asset-filter-grid">
                  <div className="admin-asset-filter-item">
                    <label>Asset Type</label>
                    <select
                      value={purchaseFilters.assetType}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("assetType", e.target.value)}
                    >
                      {assetTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Asset Type"}
                        </option>
                      ))}
                    </select>
                    {purchaseFilters.assetType === "Others" && (
                      <input
                        type="text"
                        value={purchaseFilters.customAssetType}
                        onChange={(e) => handleFilterChange(setPurchaseFilters)("customAssetType", e.target.value)}
                        placeholder="Enter custom asset type"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Asset Category</label>
                    <select
                      value={purchaseFilters.assetCategory}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("assetCategory", e.target.value)}
                    >
                      {purchaseFilters.assetType === "Permanent"
                        ? permanentAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : purchaseFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                    </select>
                    {purchaseFilters.assetCategory === "Others" && (
                      <input
                        type="text"
                        value={purchaseFilters.customAssetCategory}
                        onChange={(e) => handleFilterChange(setPurchaseFilters)("customAssetCategory", e.target.value)}
                        placeholder="Enter custom category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Sub Category</label>
                    <select
                      value={purchaseFilters.subCategory}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("subCategory", e.target.value)}
                      disabled={!purchaseFilters.assetCategory || purchaseFilters.assetCategory === "Others"}
                    >
                      {subCategoryOptions[purchaseFilters.assetCategory]?.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Sub Category"}
                        </option>
                      )) || [<option key="" value="">Select Category First</option>]}
                    </select>
                    {purchaseFilters.subCategory === "Others" && (
                      <input
                        type="text"
                        value={purchaseFilters.customSubCategory}
                        onChange={(e) => handleFilterChange(setPurchaseFilters)("customSubCategory", e.target.value)}
                        placeholder="Enter custom sub category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={purchaseFilters.itemName}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("itemName", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Purchase Date From</label>
                    <input
                      type="date"
                      value={purchaseFilters.purchaseDateFrom}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("purchaseDateFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Purchase Date To</label>
                    <input
                      type="date"
                      value={purchaseFilters.purchaseDateTo}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("purchaseDateTo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Supplier Name</label>
                    <input
                      type="text"
                      value={purchaseFilters.supplierName}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("supplierName", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Source</label>
                    <select
                      value={purchaseFilters.source}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("source", e.target.value)}
                    >
                      {sourceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Source"}
                        </option>
                      ))}
                    </select>
                    {purchaseFilters.source === "Other" && (
                      <input
                        type="text"
                        value={purchaseFilters.customSource}
                        onChange={(e) => handleFilterChange(setPurchaseFilters)("customSource", e.target.value)}
                        placeholder="Enter custom source"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Mode of Purchase</label>
                    <select
                      value={purchaseFilters.modeOfPurchase}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("modeOfPurchase", e.target.value)}
                    >
                      {modeOfPurchaseOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Mode"}
                        </option>
                      ))}
                    </select>
                    {purchaseFilters.modeOfPurchase === "Others" && (
                      <input
                        type="text"
                        value={purchaseFilters.customModeOfPurchase}
                        onChange={(e) => handleFilterChange(setPurchaseFilters)("customModeOfPurchase", e.target.value)}
                        placeholder="Enter custom mode"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Bill No</label>
                    <input
                      type="text"
                      value={purchaseFilters.billNo}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("billNo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Received By</label>
                    <input
                      type="text"
                      value={purchaseFilters.receivedBy}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("receivedBy", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>AMC Date From</label>
                    <input
                      type="date"
                      value={purchaseFilters.amcDateFrom}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("amcDateFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>AMC Date To</label>
                    <input
                      type="date"
                      value={purchaseFilters.amcDateTo}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("amcDateTo", e.target.value)}
                    />
                  </div>
                  <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                    Clear Filter
                  </button>
                </div>
              )}

              {activeTab === "storeIssue" && (
                <div className="admin-asset-filter-grid">
                  <div className="admin-asset-filter-item">
                    <label>Asset Type</label>
                    <select
                      value={storeIssueFilters.assetType}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("assetType", e.target.value)}
                    >
                      {assetTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Asset Type"}
                        </option>
                      ))}
                    </select>
                    {storeIssueFilters.assetType === "Others" && (
                      <input
                        type="text"
                        value={storeIssueFilters.customAssetType}
                        onChange={(e) => handleFilterChange(setStoreIssueFilters)("customAssetType", e.target.value)}
                        placeholder="Enter custom asset type"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Asset Category</label>
                    <select
                      value={storeIssueFilters.assetCategory}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("assetCategory", e.target.value)}
                    >
                      {storeIssueFilters.assetType === "Permanent"
                        ? permanentAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : storeIssueFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                    </select>
                    {storeIssueFilters.assetCategory === "Others" && (
                      <input
                        type="text"
                        value={storeIssueFilters.customAssetCategory}
                        onChange={(e) => handleFilterChange(setStoreIssueFilters)("customAssetCategory", e.target.value)}
                        placeholder="Enter custom category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Sub Category</label>
                    <select
                      value={storeIssueFilters.subCategory}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("subCategory", e.target.value)}
                      disabled={!storeIssueFilters.assetCategory || storeIssueFilters.assetCategory === "Others"}
                    >
                      {subCategoryOptions[storeIssueFilters.assetCategory]?.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Sub Category"}
                        </option>
                      )) || [<option key="" value="">Select Category First</option>]}
                    </select>
                    {storeIssueFilters.subCategory === "Others" && (
                      <input
                        type="text"
                        value={storeIssueFilters.customSubCategory}
                        onChange={(e) => handleFilterChange(setStoreIssueFilters)("customSubCategory", e.target.value)}
                        placeholder="Enter custom sub category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={storeIssueFilters.itemName}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("itemName", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Item Description</label>
                    <input
                      type="text"
                      value={storeIssueFilters.itemDescription}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("itemDescription", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
      <label>Item ID</label>
      <input
        type="text"
        value={storeIssueFilters.itemId}
        onChange={(e) => handleFilterChange(setStoreIssueFilters)("itemId", e.target.value)}
        placeholder="Enter Item ID"
      />
    </div>
                  <div className="admin-asset-filter-item">
                    <label>Location</label>
                    <select
                      value={storeIssueFilters.location}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("location", e.target.value)}
                    >
                      {locationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Issued Date From</label>
                    <input
                      type="date"
                      value={storeIssueFilters.issuedDateFrom}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("issuedDateFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Issued Date To</label>
                    <input
                      type="date"
                      value={storeIssueFilters.issuedDateTo}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("issuedDateTo", e.target.value)}
                    />
                  </div>
                  <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                    Clear Filter
                  </button>
                </div>
              )}

              {activeTab === "serviceReturn" && (
                <div className="admin-asset-filter-grid">
                  <div className="admin-asset-filter-item">
                    <label>Asset Type</label>
                    <select
                      value={serviceReturnFilters.assetType}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("assetType", e.target.value)}
                    >
                      {assetTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Asset Type"}
                        </option>
                      ))}
                    </select>
                    {serviceReturnFilters.assetType === "Others" && (
                      <input
                        type="text"
                        value={serviceReturnFilters.customAssetType}
                        onChange={(e) => handleFilterChange(setServiceReturnFilters)("customAssetType", e.target.value)}
                        placeholder="Enter custom asset type"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Asset Category</label>
                    <select
                      value={serviceReturnFilters.assetCategory}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("assetCategory", e.target.value)}
                    >
                      {serviceReturnFilters.assetType === "Permanent"
                        ? permanentAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : serviceReturnFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                    </select>
                    {serviceReturnFilters.assetCategory === "Others" && (
                      <input
                        type="text"
                        value={serviceReturnFilters.customAssetCategory}
                        onChange={(e) => handleFilterChange(setServiceReturnFilters)("customAssetCategory", e.target.value)}
                        placeholder="Enter custom category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Sub Category</label>
                    <select
                      value={serviceReturnFilters.subCategory}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("subCategory", e.target.value)}
                      disabled={!serviceReturnFilters.assetCategory || serviceReturnFilters.assetCategory === "Others"}
                    >
                      {subCategoryOptions[serviceReturnFilters.assetCategory]?.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Sub Category"}
                        </option>
                      )) || [<option key="" value="">Select Category First</option>]}
                    </select>
                    {serviceReturnFilters.subCategory === "Others" && (
                      <input
                        type="text"
                        value={serviceReturnFilters.customSubCategory}
                        onChange={(e) => handleFilterChange(setServiceReturnFilters)("customSubCategory", e.target.value)}
                        placeholder="Enter custom sub category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={serviceReturnFilters.itemName}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("itemName", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Location</label>
                    <input
                      type="text"
                      value={serviceReturnFilters.location}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("location", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Condition</label>
                    <select
                      value={serviceReturnFilters.condition}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("condition", e.target.value)}
                    >
                      {conditionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Condition"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Service Date From</label>
                    <input
                      type="date"
                      value={serviceReturnFilters.serviceDateFrom}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceDateFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Service Date To</label>
                    <input
                      type="date"
                      value={serviceReturnFilters.serviceDateTo}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceDateTo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Service No</label>
                    <input
                      type="text"
                      value={serviceReturnFilters.serviceNo}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceNo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Service Amount From</label>
                    <input
                      type="number"
                      value={serviceReturnFilters.serviceAmountFrom}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceAmountFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Service Amount To</label>
                    <input
                      type="number"
                      value={serviceReturnFilters.serviceAmountTo}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceAmountTo", e.target.value)}
                    />
                  </div>
                  <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                    Clear Filter
                  </button>
                </div>
              )}

              {activeTab === "disposal" && (
                <div className="admin-asset-filter-grid">
                  <div className="admin-asset-filter-item">
                    <label>Asset Type</label>
                    <select
                      value={disposalFilters.assetType}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("assetType", e.target.value)}
                    >
                      {assetTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Asset Type"}
                        </option>
                      ))}
                    </select>
                    {disposalFilters.assetType === "Others" && (
                      <input
                        type="text"
                        value={disposalFilters.customAssetType}
                        onChange={(e) => handleFilterChange(setDisposalFilters)("customAssetType", e.target.value)}
                        placeholder="Enter custom asset type"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Asset Category</label>
                    <select
                      value={disposalFilters.assetCategory}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("assetCategory", e.target.value)}
                    >
                      {disposalFilters.assetType === "Permanent"
                        ? permanentAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : disposalFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option || "Select Category"}
                            </option>
                          ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                    </select>
                    {disposalFilters.assetCategory === "Others" && (
                      <input
                        type="text"
                        value={disposalFilters.customAssetCategory}
                        onChange={(e) => handleFilterChange(setDisposalFilters)("customAssetCategory", e.target.value)}
                        placeholder="Enter custom category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Sub Category</label>
                    <select
                      value={disposalFilters.subCategory}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("subCategory", e.target.value)}
                      disabled={!disposalFilters.assetCategory || disposalFilters.assetCategory === "Others"}
                    >
                      {subCategoryOptions[disposalFilters.assetCategory]?.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Sub Category"}
                        </option>
                      )) || [<option key="" value="">Select Category First</option>]}
                    </select>
                    {disposalFilters.subCategory === "Others" && (
                      <input
                        type="text"
                        value={disposalFilters.customSubCategory}
                        onChange={(e) => handleFilterChange(setDisposalFilters)("customSubCategory", e.target.value)}
                        placeholder="Enter custom sub category"
                      />
                    )}
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={disposalFilters.itemName}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("itemName", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Inspection Date From</label>
                    <input
                      type="date"
                      value={disposalFilters.inspectionDateFrom}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("inspectionDateFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Inspection Date To</label>
                    <input
                      type="date"
                      value={disposalFilters.inspectionDateTo}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("inspectionDateTo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Condemnation Date From</label>
                    <input
                      type="date"
                      value={disposalFilters.condemnationDateFrom}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("condemnationDateFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Condemnation Date To</label>
                    <input
                      type="date"
                      value={disposalFilters.condemnationDateTo}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("condemnationDateTo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Remark</label>
                    <input
                      type="text"
                      value={disposalFilters.remark}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("remark", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Purchase Value From</label>
                    <input
                      type="number"
                      value={disposalFilters.purchaseValueFrom}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("purchaseValueFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Purchase Value To</label>
                    <input
                      type="number"
                      value={disposalFilters.purchaseValueTo}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("purchaseValueTo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Book Value From</label>
                    <input
                      type="number"
                      value={disposalFilters.bookValueFrom}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("bookValueFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Book Value To</label>
                    <input
                      type="number"
                      value={disposalFilters.bookValueTo}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("bookValueTo", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Disposal Value From</label>
                    <input
                      type="number"
                      value={disposalFilters.disposalValueFrom}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("disposalValueFrom", e.target.value)}
                    />
                  </div>
                  <div className="admin-asset-filter-item">
                    <label>Disposal Value To</label>
                    <input
                      type="number"
                      value={disposalFilters.disposalValueTo}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("disposalValueTo", e.target.value)}
                    />
                  </div>
                  <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {message && <p className="admin-asset-message">{message}</p>}
            {tableData.length > 0 && (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <button onClick={generatePDF} style={styles.exportButton}>
                    Export to PDF
                  </button>
                  <button onClick={generateExcel} style={styles.exportButton}>
        Export to Excel
      </button>
                </div>
                <table className="admin-asset-table">
                  <thead className="admin-asset-table-header">
                    <tr>
                      {activeTab === "purchase" && (
                        <>
                          <th>Asset Type</th>
                          <th>Asset Category</th>
                          <th>Sub Category</th>
                          <th>Item Name</th>
                          <th>Purchase Date</th>
                          <th>Supplier Name</th>
                          <th>Source</th>
                          <th>Mode of Purchase</th>
                          <th>Bill No</th>
                          <th>Received By</th>
                          <th>AMC Date</th>
                          <th>Quantity Received</th>
                          <th>Unit Price</th>
                          <th>Overall Price</th>
                          <th>Item IDs</th>
                          <th>Bill Photo</th>
                        </>
                      )}
                     
                      {activeTab === "storeIssue" && storeIssueFilters.location === "store" && (
                        <>
                          <th>Asset Category</th>
                          <th>Sub Category</th>
                          <th>Item Name</th>
                          <th>Item Description</th>
                          <th>In Stock</th>
                          <th>Item IDs</th>
                        </>
                      )}

                      {activeTab === "storeIssue" && storeIssueFilters.location !== "store" && (
                        <>
                          <th>Asset Type</th>
                          <th>Asset Category</th>
                          <th>Sub Category</th>
                          <th>Item Name</th>
                          <th>Item Description</th>
                          <th>Location</th>
                          <th>Quantity Issued</th>
                          <th>Issued Date</th>
                          <th>Issued IDs</th>
                        </>
                      )}
                      {activeTab === "serviceReturn" && (
                        <>
                          <th>Asset Type</th>
                          <th>Asset Category</th>
                          <th>Sub Category</th>
                          <th>Item Name</th>
                          <th>Location</th>
                          <th>Condition</th>
                          {serviceReturnFilters.condition === "InService" ? (
                            <th>Item ID</th>
                          ) : (
                            <>
                              <th>Item IDs</th>
                              <th>Service No</th>
                              <th>Service Date</th>
                              <th>Service Amount</th>
                            </>
                          )}
                        </>
                      )}
                      {activeTab === "disposal" && (
                        <>
                          <th>Asset Type</th>
                          <th>Asset Category</th>
                          <th>Sub Category</th>
                          <th>Item Name</th>
                          <th>Item IDs</th>
                          <th>Purchase Value</th>
                          <th>Book Value</th>
                          <th>Inspection Date</th>
                          <th>Condemnation Date</th>
                          <th>Remark</th>
                          <th>Disposal Value</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="admin-asset-table-body">
                    {tableData.map((row, index) => (
                      <tr key={index} className="admin-asset-table-row">
                        {activeTab === "purchase" && (
                          <>
                            <td>{row.assetType}</td>
                            <td>{row.assetCategory}</td>
                            <td>{row.subCategory}</td>
                            <td>{row.itemName}</td>
                            <td>{new Date(row.purchaseDate).toLocaleDateString()}</td>
                            <td>{row.supplierName}</td>
                            <td>{row.source}</td>
                            <td>{row.modeOfPurchase}</td>
                            <td>{row.billNo}</td>
                            <td>{row.receivedBy}</td>
                            <td>{row.amcDate ? new Date(row.amcDate).toLocaleDateString() : "N/A"}</td>
                            <td>{row.quantityReceived}</td>
                            <td>{row.unitPrice}</td>
                            <td>{row.overallPrice}</td>
                            <td>{row.itemIds?.join(", ") || ""}</td>
                            <td>
                            {row.billPhotoUrl ? (
                              <img
                                src={row.billPhotoUrl}
                                alt="Bill"
                                className="admin-asset-table-image"
                                style={{ cursor: "pointer", maxWidth: "50px", maxHeight: "50px" }}
                                onClick={() => setZoomedImage(row.billPhotoUrl)}
                              />
                            ) : (
                              "N/A"
                            )}
                          </td>
                          </>
                        )}
                   
                        {activeTab === "storeIssue" && storeIssueFilters.location === "store" && (
                          <>
                            <td>{row.assetCategory}</td>
                            <td>{row.subCategory}</td>
                            <td>{row.itemName}</td>
                            <td>{row.itemDescription}</td>
                            <td>{row.inStock}</td>
                            <td>{row.itemIds?.join(", ") || ""}</td>
                          </>
                        )}
                        {activeTab === "storeIssue" && storeIssueFilters.location !== "store" && (
                          <>
                            <td>{row.assetType}</td>
                            <td>{row.assetCategory}</td>
                            <td>{row.subCategory}</td>
                            <td>{row.itemName}</td>
                            <td>{row.itemDescription}</td>
                            <td>{row.location}</td>
                            <td>{row.quantityIssued}</td>
                            <td>{row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : "N/A"}</td>
                            <td>{row.issuedIds?.join(", ") || ""}</td>
                          </>
                        )}
                        {activeTab === "serviceReturn" && (
                          <>
                            <td>{row.assetType}</td>
                            <td>{row.assetCategory}</td>
                            <td>{row.subCategory}</td>
                            <td>{row.itemName}</td>
                            <td>{row.location || "N/A"}</td>
                            <td>{serviceReturnFilters.condition || row.condition}</td>
                            {serviceReturnFilters.condition === "InService" ? (
                              <td>{row.itemId}</td>
                            ) : (
                              <>
                                <td>{row.itemIds?.join(", ") || ""}</td>
                                <td>{row.serviceNo || "N/A"}</td>
                                <td>{row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A"}</td>
                                <td>{row.serviceAmount || "N/A"}</td>
                              </>
                            )}
                          </>
                        )}
                        {activeTab === "disposal" && (
                          <>
                            <td>{row.assetType}</td>
                            <td>{row.assetCategory}</td>
                            <td>{row.subCategory}</td>
                            <td>{row.itemName}</td>
                            <td>{row.itemIds?.join(", ") || ""}</td>
                            <td>{row.purchaseValue}</td>
                            <td>{row.bookValue}</td>
                            <td>{new Date(row.inspectionDate).toLocaleDateString()}</td>
                            <td>{new Date(row.condemnationDate).toLocaleDateString()}</td>
                            <td>{row.remark}</td>
                            <td>{row.disposalValue}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {zoomedImage && (
            <div
              style={{
                position: "fixed",
                top: "60px", // Adjust based on your nav height
                left: "250px", // Match sidebar width (adjust if different)
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <img
                src={zoomedImage}
                alt="Zoomed Bill"
                style={{ maxWidth: "90%", maxHeight: "80%", objectFit: "contain" }}
              />
              <button
                onClick={() => setZoomedImage(null)}
                style={{
                  marginTop: "10px",
                  padding: "10px 20px",
                  backgroundColor: "#ff4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Close
              </button>
            </div>
          )}
          </div>
        </main>
      </section>
    </div>
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
    fontSize: "18px",
  },
  exportButton: {
    marginRight: "10px",
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textDecoration: "none",
  },
};

export default AssetView;