/**
 * Overview:
 * This is a React component named `AssetView` designed for a principal dashboard in an asset management system.
 * It provides a tabbed interface to view and filter asset-related data across different categories:
 * Purchase, Store/Issue, Service/Return, Disposal, and Dead Stock Register.
 * 
 * Key Features:
 * - Tab-based navigation for different asset views.
 * - Dynamic filtering for each tab with customizable fields (e.g., asset type, category, dates).
 * - Sorting functionality for table columns.
 * - Data export to PDF and Excel formats using `jsPDF` and `XLSX` libraries.
 * - Detailed pop-up view for individual asset records.
 * - Support for building-specific data (maintenance and condemnation records).
 * - Responsive UI with a sidebar for navigation.
 * 
 * Dependencies:
 * - React, React Router (`useLocation` for query params).
 * - Axios for API requests.
 * - jsPDF and jspdf-autotable for PDF generation.
 * - XLSX for Excel export.
 * - External CSS files (`style.css`, `viewAsset.css`) for styling.
 * - Boxicons for sidebar icons.
 * 
 * State Management:
 * - Uses `useState` for managing filters, table data, active tab, and UI states (e.g., zoomed image, selected details).
 * - Uses `useEffect` to fetch data based on active tab and filter changes.
 * 
 * API Integration:
 * - Communicates with a backend server (assumed at `http://${ip}:${port}`) to fetch filtered data for each tab.
 * 
 * Styling:
 * - Inline styles for dynamic elements (e.g., tables, pop-ups).
 * - External CSS for consistent dashboard styling.
 * 
 * Limitations:
 * - Assumes a specific backend API structure.
 * - Hardcoded options for asset types, categories, and locations.
 * - No pagination for large datasets.
 * 
 * Future Improvements:
 * - Add pagination or infinite scrolling for large datasets.
 * - Implement error boundaries for better error handling.
 * - Modularize filter components for reusability.
 * - Add loading states for API calls.
 * - Support dynamic options fetched from the backend.
 */
import React, { act, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/style.css";
import "../styles/viewAsset.css";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const AssetView = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const [zoomedImage, setZoomedImage] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [buildingCondemnationData, setBuildingCondemnationData] = useState([]); // For building condemnation data
  const [activeTab, setActiveTab] = useState("purchase");
  const [buildingMaintenanceData, setBuildingMaintenanceData] = useState([]); // For building maintenance data
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
    itemId: "",
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
    buildingNo: "",
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
  const methodOfDisposalOptions = ["", "Sold", "Auctioned", "Destroyed", "Other"];
  const [tableData, setTableData] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [deadStockFilters, setDeadStockFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    methodOfDisposal: "",
    customMethodOfDisposal: "",
  });
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
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  
    const sortedData = [...tableData].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
  
      // Handle date fields
      if (key === "purchaseDate" || key === "issuedDate" || key === "serviceDate" || key === "inspectionDate" || key === "condemnationDate" || key === "dateOfConstruction" || key === "dateOfPossession") {
        aValue = aValue ? new Date(aValue) : null;
        bValue = bValue ? new Date(bValue) : null;
      }
  
      // Handle numeric fields
      if (["quantityReceived", "inStock", "quantityIssued", "serviceAmount", "purchaseValue", "bookValue", "disposalValue", "costOfConstruction", "servicableQuantity", "condemnedQuantity"].includes(key)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
  
      // Handle arrays (e.g., itemIds, issuedIds)
      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        aValue = aValue.join(", ");
        bValue = bValue.join(", ");
      }
  
      // Handle null or undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return direction === "asc" ? 1 : -1;
      if (!bValue) return direction === "asc" ? -1 : 1;
  
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  
    setTableData(sortedData);
  };
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
  const conditionOptions = ["", "InService", "Serviced", "Returned", "Exchanged"];
  const locationOptions = [
    "store",
    "all_issued",
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
      if (["purchase", "storeIssue", "deadStock"].includes(activeTab)) {
        setBuildingMaintenanceData([]);
        setBuildingCondemnationData([]);
      }
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
            ...(purchaseFilters.assetCategory !== "Building" && purchaseFilters.assetCategory !== "Land" ? { itemName: purchaseFilters.itemName } : {}),
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
            buildingNo: serviceReturnFilters.buildingNo, // Include new filter
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
        case "deadStock":
          // First, update quantities by calling a custom endpoint
          try {
            await axios.post(`http://${ip}:${port}/api/assets/updateDeadStockQuantities`);
          } catch (error) {
            console.error("Error updating dead stock quantities:", error);
          }

          // Then fetch filtered data
          endpoint = "/api/assets/filterDeadStock";
          filters = {
            ...deadStockFilters,
            assetType: deadStockFilters.assetType === "Others" ? deadStockFilters.customAssetType : deadStockFilters.assetType,
            assetCategory: deadStockFilters.assetCategory === "Others" ? deadStockFilters.customAssetCategory : deadStockFilters.assetCategory,
            subCategory: deadStockFilters.subCategory === "Others" ? deadStockFilters.customSubCategory : deadStockFilters.subCategory,
            methodOfDisposal: deadStockFilters.methodOfDisposal === "Other" ? deadStockFilters.customMethodOfDisposal : deadStockFilters.methodOfDisposal,
          };
          break;
        default:
          return;
      }

      try {
        const response = await axios.post(`http://${ip}:${port}${endpoint}`, filters);
        if (activeTab === "serviceReturn") {
          setTableData(response.data.serviceReturn || []);
          setBuildingMaintenanceData(response.data.buildingMaintenance || []);
          setMessage(
            response.data.serviceReturn.length === 0 && response.data.buildingMaintenance.length === 0
              ? "No matching records found."
              : ""
          );
        } else if (activeTab === "disposal") {
          setTableData(response.data.disposal || []);
          setBuildingCondemnationData(response.data.buildingCondemnation || []);
          setMessage(
            response.data.disposal.length === 0 && response.data.buildingCondemnation.length === 0
              ? "No matching records found."
              : ""
          );
        } else {
          setTableData(response.data);
          setMessage(response.data.length === 0 ? "No matching records found." : "");
        }
      } catch (error) {
        setTableData([]);
        setBuildingMaintenanceData([]);
        setBuildingCondemnationData([]);
        setMessage("Error fetching data.");
        console.error(error);
      }
    };

    fetchData();
  }, [activeTab, purchaseFilters, storeIssueFilters, serviceReturnFilters, disposalFilters, deadStockFilters]);
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
          itemId: "",
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
          buildingNo: ""
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
      case "deadStock":
        setDeadStockFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          methodOfDisposal: "",
          customMethodOfDisposal: "",
        });
        break;
      default:
        break;
    }
    setTableData([]);
    setMessage("");
  };

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
    const pdf = new jsPDF("l", "mm", "a3"); // Landscape A3 size (420mm x 297mm)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = { left: 10, right: 10 }; // Define margins to constrain content
  
    let logoBase64;
    try {
      logoBase64 = await getBase64ImageFromUrl("images/CASFOS-Coimbatore.jpg");
    } catch (error) {
      console.error("Error loading logo image", error);
    }
  
    const logoWidth = 50;
    const logoHeight = 50;
    const logoX = margin.left;
    const logoY = 10;
  
    if (logoBase64) {
      pdf.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
    }
  
    const titleX = pageWidth / 2;
    const titleY = logoY + logoHeight / 2;
  
    pdf.setFontSize(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("Central Academy for State Forest Service", titleX, titleY, { align: "center" });
  
    const currentDateTime = new Date();
    const dateString = currentDateTime.toLocaleDateString();
    const timeString = currentDateTime.toLocaleTimeString();
  
    pdf.setFontSize(17);
    pdf.text(`Date: ${dateString}`, pageWidth - 60, logoY + 20);
    pdf.text(`Time: ${timeString}`, pageWidth - 60, logoY + 30);
  
    const assetReportY = logoY + logoHeight + 20;
    pdf.setFontSize(27);
    pdf.text(
      `${activeTab === "deadStock" ? "Dead Stock Register" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Asset Report`,
      titleX,
      assetReportY,
      { align: "center" }
    );
  
    let startY = assetReportY + 10;
  
    if (activeTab === "purchase") {
      if (!tableData || !Array.isArray(tableData) || !purchaseFilters) {
        console.error("Required data for 'purchase' tab is missing");
        return;
      }
      let tableColumn = [];
      let tableRows = [];
  
      if (purchaseFilters.assetCategory === "Building") {
        tableColumn = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Building No",
          "Cost of Construction",
          "Date of Construction",
          "Details",
        ];
        tableRows = tableData.map((row) => {
          const details = [
            `Type: ${row.type || "N/A"}`,
            `Plinth Area: ${row.plinthArea || "N/A"}`,
            `Approved Estimate: ${row.approvedEstimate || "N/A"}`,
            `Remarks: ${row.remarks || "N/A"}`,
            `Approved Building Plan URL: ${row.approvedBuildingPlanUrl || "N/A"}`,
            `KMZ/KML File URL: ${row.kmzOrkmlFileUrl || "N/A"}`,
          ].join("\n");
          return [
            row.assetType || "N/A",
            row.assetCategory || "N/A",
            row.subCategory || "N/A",
            row.buildingNo || "N/A",
            row.costOfConstruction || "N/A",
            row.dateOfConstruction ? new Date(row.dateOfConstruction).toLocaleDateString() : "N/A",
            details,
          ];
        });
      } else if (purchaseFilters.assetCategory === "Land") {
        tableColumn = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Date of Possession",
          "Controller/Custody",
          "Details",
        ];
        tableRows = tableData.map((row) => {
          const details = [`Details: ${row.details || "N/A"}`].join("\n");
          return [
            row.assetType || "N/A",
            row.assetCategory || "N/A",
            row.subCategory || "N/A",
            row.dateOfPossession ? new Date(row.dateOfPossession).toLocaleDateString() : "N/A",
            row.controllerOrCustody || "N/A",
            details,
          ];
        });
      } else {
        tableColumn = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Item Name",
          "Purchase Date",
          "Quantity Received",
          "Total Price",
          "Details",
        ];
        tableRows = tableData.map((row) => {
          const details = [
            `Bill No: ${row.billNo || "N/A"}`,
            `Supplier Name: ${row.supplierName || "N/A"}`,
            `Supplier Address: ${row.supplierAddress || "N/A"}`,
            `Source: ${row.source || "N/A"}`,
            `Mode of Purchase: ${row.modeOfPurchase || "N/A"}`,
            `Received By: ${row.receivedBy || "N/A"}`,
            `Item Description: ${row.itemDescription || "N/A"}`,
            `Unit Price: ${row.unitPrice || "N/A"}`,
            `AMC From Date: ${row.amcFromDate ? new Date(row.amcFromDate).toLocaleDateString() : "N/A"}`,
            `AMC To Date: ${row.amcToDate ? new Date(row.amcToDate).toLocaleDateString() : "N/A"}`,
            `AMC Cost: ${row.amcCost || "N/A"}`,
            `Warranty Number: ${row.warrantyNumber || "N/A"}`,
            `Warranty Valid Upto: ${row.warrantyValidUpto ? new Date(row.warrantyValidUpto).toLocaleDateString() : "N/A"}`,
            `Item IDs: ${(row.itemIds || []).join(", ") || "N/A"}`,
          ].join("\n");
          return [
            row.assetType || "N/A",
            row.assetCategory || "N/A",
            row.subCategory || "N/A",
            row.itemName || "N/A",
            row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : "N/A",
            row.quantityReceived || "N/A",
            row.totalPrice || "N/A",
            details,
          ];
        });
      }
  
      pdf.autoTable({
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: margin,
      });
      startY = pdf.lastAutoTable.finalY; // Update startY
    } else if (activeTab === "storeIssue" && storeIssueFilters?.location === "store") {
      if (!tableData || !Array.isArray(tableData) || !storeIssueFilters) {
        console.error("Required data for 'storeIssue' tab (store) is missing");
        return;
      }
      const tableColumn = ["Asset Category", "Sub Category", "Item Name", "Item Description", "In Stock", "Item IDs"];
      const tableRows = tableData.map((row) => [
        row.assetCategory || "N/A",
        row.subCategory || "N/A",
        row.itemName || "N/A",
        row.itemDescription || "N/A",
        row.inStock || "N/A",
        row.itemIds?.join(", ") || "N/A",
      ]);
  
      pdf.autoTable({
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: margin,
      });
      startY = pdf.lastAutoTable.finalY;
    } else if (activeTab === "storeIssue" && storeIssueFilters?.location !== "store") {
      if (!tableData || !Array.isArray(tableData) || !storeIssueFilters) {
        console.error("Required data for 'storeIssue' tab (non-store) is missing");
        return;
      }
      const tableColumn = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Item Description",
        "Location",
        "Quantity Issued",
        "Issued Date",
        "Issued IDs",
      ];
      const tableRows = tableData.map((row) => [
        row.assetType || "N/A",
        row.assetCategory || "N/A",
        row.subCategory || "N/A",
        row.itemName || "N/A",
        row.itemDescription || "N/A",
        row.location || "N/A",
        row.quantityIssued || "N/A",
        row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : "N/A",
        row.issuedIds?.join(", ") || "N/A",
      ]);
  
      pdf.autoTable({
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: margin,
      });
      startY = pdf.lastAutoTable.finalY;
    } else if (activeTab === "serviceReturn") {
      if (!tableData || !Array.isArray(tableData) || !serviceReturnFilters || !totalCost) {
        console.error("Required data for 'serviceReturn' tab is missing");
        return;
      }
      if (totalCost.serviceCost || totalCost.maintenanceCost) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        if (totalCost.serviceCost) {
          pdf.text(`Total Service Cost: ₹${totalCost.serviceCost}`, pageWidth - 60, startY);
          startY += 10;
        }
        if (totalCost.maintenanceCost) {
          pdf.text(`Total Maintenance Cost: ₹${totalCost.maintenanceCost}`, pageWidth - 60, startY);
          startY += 10;
        }
      }
  
      const tableColumn = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Location",
        "Condition",
        ...(serviceReturnFilters.condition === "InService"
          ? ["Item ID"]
          : serviceReturnFilters.condition === "Exchanged"
          ? ["Returned Quantity"]
          : ["Item IDs", "Service No", "Service Date", "Service Amount"]),
      ];
      const tableRows = tableData.map((row) => {
        if (serviceReturnFilters.condition === "InService") {
          return [
            row.assetType || "N/A",
            row.assetCategory || "N/A",
            row.subCategory || "N/A",
            row.itemName || "N/A",
            row.location || "N/A",
            row.condition || "N/A",
            row.itemId || "N/A",
          ];
        } else if (serviceReturnFilters.condition === "Exchanged") {
          return [
            row.assetType || "N/A",
            row.assetCategory || "N/A",
            row.subCategory || "N/A",
            row.itemName || "N/A",
            row.location || "N/A",
            row.condition || "N/A",
            row.returnedQuantity || "N/A",
          ];
        } else {
          return [
            row.assetType || "N/A",
            row.assetCategory || "N/A",
            row.subCategory || "N/A",
            row.itemName || "N/A",
            row.location || "N/A",
            row.condition || "N/A",
            (row.itemIds || []).join(", ") || "N/A",
            row.serviceNo || "N/A",
            row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A",
            row.serviceAmount || "N/A",
          ];
        }
      });
  
      pdf.autoTable({
        startY: startY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: margin,
      });
      startY = pdf.lastAutoTable.finalY;
  
      if (serviceReturnFilters.assetCategory === "Building" && buildingMaintenanceData?.length > 0) {
        pdf.addPage();
        pdf.setFontSize(27);
        pdf.text("Building Maintenance Records", pageWidth / 2, 20, { align: "center" });
        startY = totalCost.maintenanceCost ? 40 : 30;
        if (totalCost.maintenanceCost) {
          pdf.setFontSize(14);
          pdf.text(`Total Maintenance Cost: ₹${totalCost.maintenanceCost}`, pageWidth - 60, 30);
        }
  
        const buildingTableColumn = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Building No",
          "Year of Maintenance",
          "Cost",
          "Description",
          "Custody",
          "Agency",
        ];
        const buildingTableRows = buildingMaintenanceData.map((row) => [
          row.assetType || "N/A",
          row.assetCategory || "N/A",
          row.subCategory || "N/A",
          row.buildingNo || "N/A",
          row.yearOfMaintenance ? new Date(row.yearOfMaintenance).toLocaleDateString() : "N/A",
          row.cost || "N/A",
          row.description || "N/A",
          row.custody || "N/A",
          row.agency || "N/A",
        ]);
  
        pdf.autoTable({
          startY,
          head: [buildingTableColumn],
          body: buildingTableRows,
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
          headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          margin: margin,
        });
        startY = pdf.lastAutoTable.finalY;
      }
    } else if (activeTab === "disposal") {
      if (!tableData || !Array.isArray(tableData) || !disposalFilters || !totalCost) {
        console.error("Required data for 'disposal' tab is missing");
        return;
      }
      if (totalCost.serviceCost || totalCost.demolitionEstimate) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        if (totalCost.serviceCost) {
          pdf.text(`Total Disposal Value: ₹${totalCost.serviceCost}`, pageWidth - 60, startY);
          startY += 10;
        }
        if (totalCost.demolitionEstimate) {
          pdf.text(`Total Demolition Estimate: ₹${totalCost.demolitionEstimate}`, pageWidth - 60, startY);
          startY += 10;
        }
      }
  
      const tableColumn = [
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
      ];
      const tableRows = tableData.map((row) => [
        row.assetType || "N/A",
        row.assetCategory || "N/A",
        row.subCategory || "N/A",
        row.itemName || "N/A",
        row.itemIds?.length > 0 ? `${row.itemIds.join(", ")} (${row.quantity || "N/A"})` : row.quantity || "N/A",        row.purchaseValue || "N/A",
        row.bookValue || "N/A",
        row.inspectionDate ? new Date(row.inspectionDate).toLocaleDateString() : "N/A",
        row.condemnationDate ? new Date(row.condemnationDate).toLocaleDateString() : "N/A",
        row.remark || "N/A",
        row.disposalValue || "N/A",
      ]);
  
      pdf.autoTable({
        startY: startY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: margin,
      });
      startY = pdf.lastAutoTable.finalY;
  
      if (disposalFilters.assetCategory === "Building" && buildingCondemnationData?.length > 0) {
        pdf.addPage();
        pdf.setFontSize(27);
        pdf.text("Building Condemnation Records", pageWidth / 2, 20, { align: "center" });
        startY = totalCost.demolitionEstimate ? 40 : 30;
        if (totalCost.demolitionEstimate) {
          pdf.setFontSize(14);
          pdf.text(`Total Demolition Estimate: ₹${totalCost.demolitionEstimate}`, pageWidth - 60, 30);
        }
  
        const buildingTableColumn = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Condemnation Year",
          "Certificate Obtained",
          "Authority",
          "Date of Reference",
          "Agency",
          "Agency Reference Number",
          "Date",
          "Demolition Period",
          "Demolition Estimate",
        ];
        const buildingTableRows = buildingCondemnationData.map((row) => [
          row.assetType || "N/A",
          row.assetCategory || "N/A",
          row.subCategory || "N/A",
          row.condemnationYear || "N/A",
          row.certificateObtained || "N/A",
          row.authority || "N/A",
          row.dateOfReferenceUrl || "N/A",
          row.agency || "N/A",
          row.agencyReferenceNumberUrl || "N/A",
          row.date ? new Date(row.date).toLocaleDateString() : "N/A",
          row.demolitionPeriod || "N/A",
          row.demolitionEstimate || "N/A",
        ]);
  
        pdf.autoTable({
          startY,
          head: [buildingTableColumn],
          body: buildingTableRows,
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
          headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          margin: margin,
        });
        startY = pdf.lastAutoTable.finalY;
      }
    } else if (activeTab === "deadStock") {
      if (!tableData || !Array.isArray(tableData)) {
        console.error("Required data for 'deadStock' tab is missing");
        return;
      }
      const tableColumn = [
        "S.No",
        "Article Type",
        "Article Category",
        "Article Sub Category",
        "Article Name",
        "No. of Articles Serviceable",
        "No. of Articles Condemned",
        "Balance",
        "Method of Disposal",
        "Reason for Condemnation",
        "Initial",
        "Remarks",
      ];
      const tableRows = tableData.map((row, index) => {
        const balance = (row.overallQuantity || 0) - (row.servicableQuantity || 0) - (row.condemnedQuantity || 0);
        return [
          index + 1,
          row.assetType || "N/A",
          row.assetCategory || "N/A",
          row.assetSubCategory || "N/A",
          row.itemName || "N/A",
          row.servicableQuantity || "N/A",
          row.condemnedQuantity || "N/A",
          balance >= 0 ? balance : 0,
          row.methodOfDisposal || "N/A",
          row.remarks || "N/A",
       
        ];
      });
  
      pdf.autoTable({
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: margin,
      });
      startY = pdf.lastAutoTable.finalY;
    }
  
    pdf.save(`${activeTab === "deadStock" ? "dead_stock_register" : activeTab}_asset_report.pdf`);
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
  
    if (activeTab === "purchase") {
      if (purchaseFilters.assetCategory === "Building") {
        wsData.push([
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Building No",
          "Cost of Construction",
          "Date of Construction",
          "Type",
          "Plinth Area",
          "Approved Estimate",
          "Remarks",
          "Approved Building Plan URL",
          "KMZ/KML File URL",
        ]);
        tableData.forEach((row) => {
          wsData.push([
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.buildingNo || "N/A",
            row.costOfConstruction || "N/A",
            row.dateOfConstruction ? new Date(row.dateOfConstruction).toLocaleDateString() : "N/A",
            row.type || "N/A",
            row.plinthArea || "N/A",
            row.approvedEstimate || "N/A",
            row.remarks || "N/A",
            row.approvedBuildingPlanUrl || "N/A",
            row.kmzOrkmlFileUrl || "N/A",
          ]);
        });
      } }else if (activeTab === "storeIssue" && storeIssueFilters.location === "store") {
      const headers = ["Asset Category", "Sub Category", "Item Name", "Item Description", "In Stock", "Item IDs"];
      const data = tableData.map((row) => [
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.inStock,
        row.itemIds?.join(", ") || "",
      ]);
  
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "Store Assets");
    } else if (activeTab === "storeIssue" && storeIssueFilters.location !== "store") {
      const headers = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Item Description",
        "Location",
        "Quantity Issued",
        "Issued Date",
        "Issued IDs",
      ];
      const data = tableData.map((row) => [
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
  
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "Issued Assets");
    } else if (activeTab === "serviceReturn") {
      const headers = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Location",
        "Condition",
        ...(serviceReturnFilters.condition === "InService"
          ? ["Item ID"]
          : serviceReturnFilters.condition === "Exchanged"
          ? ["Returned Quantity"]
          : ["Item IDs", "Service No", "Service Date", "Service Amount"]),
      ];
      const data = tableData.map((row) => {
        if (serviceReturnFilters.condition === "InService") {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            row.itemId || "N/A",
          ];
        } else if (serviceReturnFilters.condition === "Exchanged") {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            row.returnedQuantity || "N/A",
          ];
        } else {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            (row.itemIds || []).join(", ") || "N/A",
            row.serviceNo || "N/A",
            row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A",
            row.serviceAmount || "N/A",
          ];
        }
      });
  
      const wsData = [];
      if (totalCost.serviceCost) {
        wsData.push(["Total Service Cost", `₹${totalCost.serviceCost}`]);
      }
      if (totalCost.maintenanceCost) {
        wsData.push(["Total Maintenance Cost", `₹${totalCost.maintenanceCost}`]);
      }
      if (wsData.length > 0) {
        wsData.push([]); // Empty row for spacing
      }
      wsData.push(headers, ...data);
  
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "ServiceReturn Assets");
  
      if (serviceReturnFilters.assetCategory === "Building" && buildingMaintenanceData.length > 0) {
        const buildingHeaders = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Building No",
          "Year of Maintenance",
          "Cost",
          "Description",
          "Custody",
          "Agency",
        ];
        const buildingData = buildingMaintenanceData.map((row) => [
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.buildingNo,
          new Date(row.yearOfMaintenance).toLocaleDateString(),
          row.cost,
          row.description,
          row.custody,
          row.agency,
        ]);
  
        const buildingWsData = [];
        if (totalCost.maintenanceCost) {
          buildingWsData.push(["Total Maintenance Cost", `₹${totalCost.maintenanceCost}`]);
          buildingWsData.push([]); // Empty row for spacing
        }
        buildingWsData.push(buildingHeaders, ...buildingData);
  
        const buildingWs = XLSX.utils.aoa_to_sheet(buildingWsData);
        buildingWs["!cols"] = buildingHeaders.map((header, index) => {
          const maxLength = Math.max(
            header.length,
            ...buildingData.map((row) => (row[index] ? row[index].toString().length : 0))
          );
          return { wch: Math.min(maxLength + 5, 50) };
        });
        XLSX.utils.book_append_sheet(wb, buildingWs, "Building Maintenance");
      }
    } else if (activeTab === "disposal") {
      const headers = [
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
      ];
      const data = tableData.map((row) => [
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemIds?.length > 0 ? `${row.itemIds.join(", ")} (${row.quantity || "N/A"})` : row.quantity || "",        row.purchaseValue,
        row.bookValue,
        new Date(row.inspectionDate).toLocaleDateString(),
        new Date(row.condemnationDate).toLocaleDateString(),
        row.remark,
        row.disposalValue,
      ]);
  
      const wsData = [];
      if (totalCost.serviceCost) {
        wsData.push(["Total Disposal Value", `₹${totalCost.serviceCost}`]);
      }
      if (totalCost.demolitionEstimate) {
        wsData.push(["Total Demolition Estimate", `₹${totalCost.demolitionEstimate}`]);
      }
      if (wsData.length > 0) {
        wsData.push([]); // Empty row for spacing
      }
      wsData.push(headers, ...data);
  
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "Disposal Assets");
  
      if (disposalFilters.assetCategory === "Building" && buildingCondemnationData.length > 0) {
        const buildingHeaders = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Condemnation Year",
          "Certificate Obtained",
          "Authority",
          "Date of Reference",
          "Agency",
          "Agency Reference Number",
          "Date",
          "Demolition Period",
          "Demolition Estimate",
        ];
        const buildingData = buildingCondemnationData.map((row) => [
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.condemnationYear,
          row.certificateObtained || "N/A",
          row.authority || "N/A",
          row.dateOfReferenceUrl || "N/A",
          row.agency || "N/A",
          row.agencyReferenceNumberUrl || "N/A",
          row.date ? new Date(row.date).toLocaleDateString() : "N/A",
          row.demolitionPeriod || "N/A",
          row.demolitionEstimate || "N/A",
        ]);
  
        const buildingWsData = [];
        if (totalCost.demolitionEstimate) {
          buildingWsData.push(["Total Demolition Estimate", `₹${totalCost.demolitionEstimate}`]);
          buildingWsData.push([]); // Empty row for spacing
        }
        buildingWsData.push(buildingHeaders, ...buildingData);
  
        const buildingWs = XLSX.utils.aoa_to_sheet(buildingWsData);
        buildingWs["!cols"] = buildingHeaders.map((header, index) => {
          const maxLength = Math.max(
            header.length,
            ...buildingData.map((row) => (row[index] ? row[index].toString().length : 0))
          );
          return { wch: Math.min(maxLength + 5, 50) };
        });
        XLSX.utils.book_append_sheet(wb, buildingWs, "Building Condemnation");
      }
    } else if (activeTab === "deadStock") {
      const headers = [
        "S.No",
        "Article Type",
        "Article Category",
        "Article Sub Category",
        "Article Name",
        "No. of Articles Serviceable",
        "No. of Articles Condemned",
        "Balance",
        "Method of Disposal",
        "Reason for Condemnation",
        "Initial",
        "Remarks",
      ];
      const data = tableData.map((row, index) => {
        const balance = row.overallQuantity - row.servicableQuantity - row.condemnedQuantity;
        return [
          index + 1,
          row.assetType,
          row.assetCategory,
          row.assetSubCategory,
          row.itemName,
          row.servicableQuantity,
          row.condemnedQuantity,
          balance >= 0 ? balance : 0,
          row.methodOfDisposal,
          row.remarks || "N/A",
          "",
          "",
        ];
      });
  
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "DeadStock Assets");
    }
  
    XLSX.writeFile(wb, `${activeTab === "deadStock" ? "dead_stock_register" : activeTab}_assets.xlsx`);
  };
  const showDetails = (row) => {
    setSelectedDetails(row);
  };

  const closeDetails = () => {
    setSelectedDetails(null);
  };

  // Calculate total costs
  const calculateTotalCost = () => {
    let serviceCost = 0;
    let maintenanceCost = 0;
    let demolitionEstimate = 0;
    let purchaseCost = 0;
    let disposalValue = 0;
    let storeIssueValue = 0;
  
    if (activeTab === "purchase") {
      purchaseCost = tableData.reduce((sum, row) => {
        // Only include costOfConstruction if "Building" is explicitly selected
        if (purchaseFilters.assetCategory === "Building" && row.assetCategory === "Building") {
          return sum + (parseFloat(row.costOfConstruction) || 0);
        }
        // Include totalPrice for Land if "Land" is selected
        else if (purchaseFilters.assetCategory === "Land" && row.assetCategory === "Land") {
          return sum + (parseFloat(row.items?.[0]?.totalPrice) || 0);
        }
        // Include totalPrice for other categories only if not Building or Land, or if no specific category is filtered
        else if (
          purchaseFilters.assetCategory !== "Building" && 
          purchaseFilters.assetCategory !== "Land" && 
          row.assetCategory !== "Building" && 
          row.assetCategory !== "Land"
        ) {
          return sum + (parseFloat(row.totalPrice) || 0);
        }
        return sum; // If none of the conditions match, don't add anything
      }, 0);
    }else if (activeTab === "serviceReturn") {
      if (serviceReturnFilters.condition !== "InService" && serviceReturnFilters.condition !== "Exchanged") {
        serviceCost = tableData.reduce((sum, row) => sum + (parseFloat(row.serviceAmount) || 0), 0);
      }
      if (serviceReturnFilters.assetCategory === "Building") {
        maintenanceCost = buildingMaintenanceData.reduce((sum, row) => sum + (parseFloat(row.cost) || 0), 0);
      }
    } else if (activeTab === "disposal") {
      disposalValue = tableData.reduce((sum, row) => sum + (parseFloat(row.disposalValue) || 0), 0);
      if (disposalFilters.assetCategory === "Building") {
        demolitionEstimate = buildingCondemnationData.reduce((sum, row) => sum + (parseFloat(row.demolitionEstimate) || 0), 0);
      }
    } else if (activeTab === "storeIssue" && storeIssueFilters.location !== "store") {
      storeIssueValue = tableData.reduce((sum, row) => {
        const quantity = parseFloat(row.quantityIssued) || 0;
        const unitPrice = parseFloat(row.unitPrice) || 0;
        return sum + (quantity * unitPrice);
      }, 0);
    }
  
    return {
      purchaseCost: purchaseCost > 0 ? purchaseCost.toLocaleString("en-IN", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : null,
      serviceCost: serviceCost > 0 ? serviceCost.toLocaleString("en-IN", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : null,
      maintenanceCost: maintenanceCost > 0 ? maintenanceCost.toLocaleString("en-IN", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : null,
      demolitionEstimate: demolitionEstimate > 0 ? demolitionEstimate.toLocaleString("en-IN", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : null,
      disposalValue: disposalValue > 0 ? disposalValue.toLocaleString("en-IN", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : null,
      storeIssueValue: storeIssueValue > 0 ? storeIssueValue.toLocaleString("en-IN", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : null,
    };
  };
  

  const totalCost = calculateTotalCost();

  return (
    <div className="admin-asset-view">
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">PRINCIPAL</span>
        </a>
        <ul className="side-menu top">
          <li >
            <a href={`/principaldashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/principalassetupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Updation</span>
            </a>
          </li>
          <li className="active">
            <a href={`/principalassetview?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Asset View</span>
            </a>
          </li>
          <li>
            <a href={`/principalfacultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Faculty Updation</span>
            </a>
          </li>
          <li>
            <a href={`/principalfacultyview?username=${encodeURIComponent(username)}`}>
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

      <main style={styles.mainContent}>
        <div className="dash-content">
          <div className="title">
            <span className="text">Asset View</span>
          </div>

          <div className="admin-asset-tabs" style={{ marginBottom: "20px" }}>
            <button className={activeTab === "purchase" ? "active" : ""} onClick={() => setActiveTab("purchase")}>
              Purchase
            </button>
            <button className={activeTab === "storeIssue" ? "active" : ""} onClick={() => setActiveTab("storeIssue")}>
              Store/Issue
            </button>
            <button className={activeTab === "serviceReturn" ? "active" : ""} onClick={() => setActiveTab("serviceReturn")}>
              Service/Return
            </button>
            <button className={activeTab === "disposal" ? "active" : ""} onClick={() => setActiveTab("disposal")}>
              Disposal
            </button>
            <button className={activeTab === "deadStock" ? "active" : ""} onClick={() => setActiveTab("deadStock")}>
              Dead Stock Register
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
            {activeTab === "deadStock" && (
              <div className="admin-asset-filter-grid">
                <div className="admin-asset-filter-item">
                  <label>Article Type</label>
                  <select
                    value={deadStockFilters.assetType}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("assetType", e.target.value)}
                  >
                    {assetTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Article Type"}
                      </option>
                    ))}
                  </select>
                  {deadStockFilters.assetType === "Others" && (
                    <input
                      type="text"
                      value={deadStockFilters.customAssetType}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customAssetType", e.target.value)}
                      placeholder="Enter custom article type"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Article Category</label>
                  <select
                    value={deadStockFilters.assetCategory}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("assetCategory", e.target.value)}
                  >
                    {deadStockFilters.assetType === "Permanent"
                      ? permanentAssetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Category"}
                        </option>
                      ))
                      : deadStockFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select Category"}
                          </option>
                        ))
                        : [<option key="" value="">Select Article Type First</option>]}
                  </select>
                  {deadStockFilters.assetCategory === "Others" && (
                    <input
                      type="text"
                      value={deadStockFilters.customAssetCategory}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customAssetCategory", e.target.value)}
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Article Sub Category</label>
                  <select
                    value={deadStockFilters.subCategory}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("subCategory", e.target.value)}
                    disabled={!deadStockFilters.assetCategory || deadStockFilters.assetCategory === "Others"}
                  >
                    {subCategoryOptions[deadStockFilters.assetCategory]?.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Sub Category"}
                      </option>
                    )) || [<option key="" value="">Select Category First</option>]}
                  </select>
                  {deadStockFilters.subCategory === "Others" && (
                    <input
                      type="text"
                      value={deadStockFilters.customSubCategory}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customSubCategory", e.target.value)}
                      placeholder="Enter custom sub category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Article Name</label>
                  <input
                    type="text"
                    value={deadStockFilters.itemName}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("itemName", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Method of Disposal</label>
                  <select
                    value={deadStockFilters.methodOfDisposal}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("methodOfDisposal", e.target.value)}
                  >
                    {methodOfDisposalOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Method"}
                      </option>
                    ))}
                  </select>
                  {deadStockFilters.methodOfDisposal === "Other" && (
                    <input
                      type="text"
                      value={deadStockFilters.customMethodOfDisposal}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customMethodOfDisposal", e.target.value)}
                      placeholder="Enter custom method"
                    />
                  )}
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
                        {option || "All Conditions"}
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
                <div className="admin-asset-filter-item">
      <label>Building No</label>
      <input
        type="text"
        value={serviceReturnFilters.buildingNo}
        onChange={(e) => handleFilterChange(setServiceReturnFilters)("buildingNo", e.target.value)}
        placeholder="Enter Building No"
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
              <div style={{ marginBottom: "20px", position: "relative" }}>
                <button onClick={generatePDF} style={styles.exportButton}>
                  Export to PDF
                </button>
                <button onClick={generateExcel} style={styles.exportButton}>
                  Export to Excel
                </button>
                {(totalCost.purchaseCost || 
  (activeTab === "serviceReturn" && totalCost.serviceCost) || 
  (activeTab === "serviceReturn" && totalCost.maintenanceCost) || 
  (activeTab === "disposal" && totalCost.demolitionEstimate) || 
  (activeTab === "disposal" && totalCost.disposalValue) || 
  totalCost.storeIssueValue) && (
  <div style={styles.totalCostContainer}>
    {totalCost.purchaseCost && activeTab === "purchase" && purchaseFilters.assetCategory !== "Building" && (
      <div style={{ marginBottom: "10px" }}>
        <span style={styles.totalCostLabel}>Total Purchase Cost:</span>
        <span style={styles.totalCostValue}>₹{totalCost.purchaseCost}</span>
      </div>
    )}
    {totalCost.purchaseCost && activeTab === "purchase" && purchaseFilters.assetCategory === "Building" && (
      <div style={{ marginBottom: "10px" }}>
        <span style={styles.totalCostLabel}>Total Construction Cost:</span>
        <span style={styles.totalCostValue}>₹{totalCost.purchaseCost}</span>
      </div>
    )}
    {totalCost.serviceCost && activeTab === "serviceReturn" && (
      <div style={{ marginBottom: "10px" }}>
        <span style={styles.totalCostLabel}>Total Service Cost:</span>
        <span style={styles.totalCostValue}>₹{totalCost.serviceCost}</span>
      </div>
    )}
    {totalCost.maintenanceCost && activeTab === "serviceReturn" && serviceReturnFilters.assetCategory ==="Building" (
      <div style={{ marginBottom: "10px" }}>
        <span style={styles.totalCostLabel}>Total Maintenance Cost:</span>
        <span style={styles.totalCostValue}>₹{totalCost.maintenanceCost}</span>
      </div>
    )}
    {totalCost.demolitionEstimate && activeTab === "disposal" && (
      <div style={{ marginBottom: "10px" }}>
        <span style={styles.totalCostLabel}>Total Demolition Estimate:</span>
        <span style={styles.totalCostValue}>₹{totalCost.demolitionEstimate}</span>
      </div>
    )}
    {totalCost.disposalValue && activeTab === "disposal" && (
      <div>
        <span style={styles.totalCostLabel}>Total Disposal Value:</span>
        <span style={styles.totalCostValue}>₹{totalCost.disposalValue}</span>
      </div>
    )}
    {totalCost.storeIssueValue && activeTab === "storeIssue" && (
      <div>
        <span style={styles.totalCostLabel}>Total Store Issue Value:</span>
        <span style={styles.totalCostValue}>₹{totalCost.storeIssueValue}</span>
      </div>
    )}
  </div>
)}
              </div>
              <table className="admin-asset-table">
              <thead className="admin-asset-table-header">
  <tr>
    {activeTab === "purchase" && purchaseFilters.assetCategory === "Building" && (
      <>
        <th onClick={() => handleSort("assetType")}>
          Asset Type {sortConfig.key === "assetType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("subCategory")}>
          Sub Category {sortConfig.key === "subCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("buildingNo")}>
          Building No {sortConfig.key === "buildingNo" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("type")}>
          Type {sortConfig.key === "type" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("purchaseDate")}>
          Purchase Date {sortConfig.key === "purchaseDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("costOfConstruction")}>
          Cost of Construction {sortConfig.key === "costOfConstruction" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("plinthArea")}>
          Plinth Area {sortConfig.key === "plinthArea" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th>Details</th>
      </>
    )}
    {activeTab === "purchase" && purchaseFilters.assetCategory === "Land" && (
      <>
        <th onClick={() => handleSort("assetType")}>
          Asset Type {sortConfig.key === "assetType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("subCategory")}>
          Sub Category {sortConfig.key === "subCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("dateOfPossession")}>
          Date of Possession {sortConfig.key === "dateOfPossession" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("controllerOrCustody")}>
          Controller/Custody {sortConfig.key === "controllerOrCustody" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("purchaseDate")}>
          Purchase Date {sortConfig.key === "purchaseDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("totalPrice")}>
          Total Price {sortConfig.key === "totalPrice" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th>Details</th>
      </>
    )}
    {activeTab === "purchase" && purchaseFilters.assetCategory !== "Building" && purchaseFilters.assetCategory !== "Land" && (
      <>
        <th onClick={() => handleSort("assetType")}>
          Asset Type {sortConfig.key === "assetType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("assetCategory")}>
          Asset Category {sortConfig.key === "assetCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("subCategory")}>
          Sub Category {sortConfig.key === "subCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemName")}>
          Item Name {sortConfig.key === "itemName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("purchaseDate")}>
          Purchase Date {sortConfig.key === "purchaseDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("quantityReceived")}>
          Quantity Received {sortConfig.key === "quantityReceived" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("totalPrice")}>
          Total Price {sortConfig.key === "totalPrice" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th>Details</th>
      </>
    )}
    {activeTab === "deadStock" && (
      <>
        <th onClick={() => handleSort("assetType")}>
          Article Type {sortConfig.key === "assetType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("assetCategory")}>
          Article Category {sortConfig.key === "assetCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("assetSubCategory")}>
          Article Sub Category {sortConfig.key === "assetSubCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemName")}>
          Article Name {sortConfig.key === "itemName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("servicableQuantity")}>
          No. of Articles Serviceable {sortConfig.key === "servicableQuantity" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("condemnedQuantity")}>
          No. of Articles Condemned {sortConfig.key === "condemnedQuantity" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th>Balance</th>
        <th onClick={() => handleSort("methodOfDisposal")}>
          Method of Disposal {sortConfig.key === "methodOfDisposal" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("remarks")}>
          Reason for Condemnation {sortConfig.key === "remarks" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
      </>
    )}
    {activeTab === "storeIssue" && storeIssueFilters.location === "store" && (
      <>
        <th onClick={() => handleSort("assetCategory")}>
          Asset Category {sortConfig.key === "assetCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("subCategory")}>
          Sub Category {sortConfig.key === "subCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemName")}>
          Item Name {sortConfig.key === "itemName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemDescription")}>
          Item Description {sortConfig.key === "itemDescription" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("inStock")}>
          In Stock {sortConfig.key === "inStock" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemIds")}>
          Item IDs {sortConfig.key === "itemIds" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
      </>
    )}
    {activeTab === "storeIssue" && storeIssueFilters.location !== "store" && (
      <>
        <th onClick={() => handleSort("assetType")}>
          Asset Type {sortConfig.key === "assetType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("assetCategory")}>
          Asset Category {sortConfig.key === "assetCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("subCategory")}>
          Sub Category {sortConfig.key === "subCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemName")}>
          Item Name {sortConfig.key === "itemName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemDescription")}>
          Item Description {sortConfig.key === "itemDescription" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("location")}>
          Location {sortConfig.key === "location" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("quantityIssued")}>
          Quantity Issued {sortConfig.key === "quantityIssued" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("issuedDate")}>
          Issued Date {sortConfig.key === "issuedDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("issuedIds")}>
          Issued IDs {sortConfig.key === "issuedIds" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
      </>
    )}
    {activeTab === "serviceReturn" && (
      <>
        <th onClick={() => handleSort("assetType")}>
          Asset Type {sortConfig.key === "assetType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("assetCategory")}>
          Asset Category {sortConfig.key === "assetCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("subCategory")}>
          Sub Category {sortConfig.key === "subCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemName")}>
          Item Name {sortConfig.key === "itemName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("location")}>
          Location {sortConfig.key === "location" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("condition")}>
          Condition {sortConfig.key === "condition" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        {serviceReturnFilters.condition === "InService" ? (
          <th onClick={() => handleSort("itemId")}>
            Item ID {sortConfig.key === "itemId" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </th>
        ) : serviceReturnFilters.condition === "Exchanged" ? (
          <th onClick={() => handleSort("returnedQuantity")}>
            Returned Quantity {sortConfig.key === "returnedQuantity" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </th>
        ) : (
          <>
            <th onClick={() => handleSort("itemIds")}>
              Item IDs {sortConfig.key === "itemIds" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("serviceNo")}>
              Service No {sortConfig.key === "serviceNo" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("serviceDate")}>
              Service Date {sortConfig.key === "serviceDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("serviceAmount")}>
              Service Amount {sortConfig.key === "serviceAmount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
          </>
        )}
      </>
    )}
    {activeTab === "disposal" && (
      <>
        <th onClick={() => handleSort("assetType")}>
          Asset Type {sortConfig.key === "assetType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("assetCategory")}>
          Asset Category {sortConfig.key === "assetCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("subCategory")}>
          Sub Category {sortConfig.key === "subCategory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemName")}>
          Item Name {sortConfig.key === "itemName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("itemIds")}>
  Item IDs (Quantity) {sortConfig.key === "itemIds" && (sortConfig.direction === "asc" ? "↑" : "↓")}
</th>
        <th onClick={() => handleSort("purchaseValue")}>
          Purchase Value {sortConfig.key === "purchaseValue" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("bookValue")}>
          Book Value {sortConfig.key === "bookValue" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("inspectionDate")}>
          Inspection Date {sortConfig.key === "inspectionDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("condemnationDate")}>
          Condemnation Date {sortConfig.key === "condemnationDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("remark")}>
          Remark {sortConfig.key === "remark" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("disposalValue")}>
          Disposal Value {sortConfig.key === "disposalValue" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </th>
      </>
    )}
  </tr>
</thead>
                <tbody className="admin-asset-table-body">
                  {tableData.map((row, index) => (
                    <tr key={index} className="admin-asset-table-row" style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      {activeTab === "purchase" && purchaseFilters.assetCategory === "Building" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.buildingNo || "N/A"}</td>
                          <td>{row.type || "N/A"}</td>
                          <td>{row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : "N/A"}</td>
                          <td>{row.costOfConstruction || "N/A"}</td>
                          <td>{row.plinthArea || "N/A"}</td>
                          <td>
                            <button onClick={() => showDetails(row)} style={styles.viewDetailsButton}>
                              View Details
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab === "purchase" && purchaseFilters.assetCategory === "Land" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.dateOfPossession ? new Date(row.dateOfPossession).toLocaleDateString() : "N/A"}</td>
                          <td>{row.controllerOrCustody || "N/A"}</td>
                          <td>{row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : "N/A"}</td>
                          <td>{row.items?.[0]?.totalPrice || "N/A"}</td>
                          <td>
                            <button onClick={() => showDetails(row)} style={styles.viewDetailsButton}>
                              View Details
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab === "purchase" && purchaseFilters.assetCategory !== "Building" && purchaseFilters.assetCategory !== "Land" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.assetCategory}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.itemName || "N/A"}</td>
                          <td>{row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : "N/A"}</td>
                          <td>{row.quantityReceived || "N/A"}</td>
                          <td>{row.totalPrice || "N/A"}</td>
                          <td>
                            <button onClick={() => showDetails(row)} style={styles.viewDetailsButton}>
                              View Details
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab === "deadStock" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.assetCategory}</td>
                          <td>{row.assetSubCategory}</td>
                          <td>{row.itemName}</td>
                          <td>{row.servicableQuantity}</td>
                          <td>{row.condemnedQuantity}</td>
                          <td>{row.overallQuantity - row.servicableQuantity - row.condemnedQuantity >= 0 ? row.overallQuantity - row.servicableQuantity - row.condemnedQuantity : 0}</td>
                          <td>{row.methodOfDisposal}</td>
                          <td>{row.remarks || "N/A"}</td>
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
                          <td>{row.condition}</td>
                          {serviceReturnFilters.condition === "InService" ? (
                            <td>{row.itemId || "N/A"}</td>
                          ) : serviceReturnFilters.condition === "Exchanged" ? (
                            <td>{row.returnedQuantity || "N/A"}</td>
                          ) : (
                            <>
                              <td>{(row.itemIds || []).join(", ") || "N/A"}</td>
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
                          <td>{row.itemIds?.length > 0 ? `${row.itemIds.join(", ")} (${row.quantity || "N/A"})` : row.quantity || "N/A"}</td>                                             <td>{row.purchaseValue}</td>
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
          {serviceReturnFilters.assetCategory === "Building" && buildingMaintenanceData.length > 0 && (
  <>
    <h3 style={{ marginTop: "20px" }}>Building Maintenance Records</h3>
    <table className="admin-asset-table">
      <thead className="admin-asset-table-header">
        <tr>
          <th>Asset Type</th>
          <th>Asset Category</th>
          <th>Sub Category</th>
          <th>Building No</th>
          <th>Year of Maintenance</th>
          <th>Cost</th>
          <th>Description</th>
          <th>Custody</th>
          <th>Agency</th>
        </tr>
      </thead>
      <tbody className="admin-asset-table-body">
        {buildingMaintenanceData.map((row, index) => (
          <tr key={index} className="admin-asset-table-row" style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
            <td>{row.assetType}</td>
            <td>{row.assetCategory}</td>
            <td>{row.subCategory}</td>
            <td>{row.buildingNo}</td>
            <td>{new Date(row.yearOfMaintenance).toLocaleDateString()}</td>
            <td>{row.cost}</td>
            <td>{row.description}</td>
            <td>{row.custody}</td>
            <td>{row.agency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}
{disposalFilters.assetCategory === "Building" && buildingCondemnationData.length > 0 && activeTab==="disposal" && (
  <>
    <h3 style={{ marginTop: "20px" }}>Building Condemnation Records</h3>
    <table className="admin-asset-table">
      <thead className="admin-asset-table-header">
        <tr>
          <th>Asset Type</th>
          <th>Asset Category</th>
          <th>Sub Category</th>
          <th>Condemnation Year</th>
          <th>Certificate Obtained</th>
          <th>Authority</th>
          <th>Date of Reference</th>
          <th>Agency</th>
          <th>Agency Reference Number</th>
          <th>Date</th>
          <th>Demolition Period</th>
          <th>Demolition Estimate</th>
        </tr>
      </thead>
      <tbody className="admin-asset-table-body">
        {buildingCondemnationData.map((row, index) => (
          <tr key={index} className="admin-asset-table-row" style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
            <td>{row.assetType}</td>
            <td>{row.assetCategory}</td>
            <td>{row.subCategory}</td>
            <td>{row.condemnationYear}</td>
            <td>{row.certificateObtained || "N/A"}</td>
            <td>{row.authority || "N/A"}</td>
            <td>{row.dateOfReferenceUrl ? <a href={row.dateOfReferenceUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A"}</td>
            <td>{row.agency || "N/A"}</td>
            <td>{row.agencyReferenceNumberUrl ? <a href={row.agencyReferenceNumberUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A"}</td>
            <td>{row.date ? new Date(row.date).toLocaleDateString() : "N/A"}</td>
            <td>{row.demolitionPeriod || "N/A"}</td>
            <td>{row.demolitionEstimate || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}
          {selectedDetails && (
            <div style={styles.popupContainer}>
              <div style={styles.popupContent}>
                <h2>Asset Details</h2>
                <div style={styles.tableContainer}>
                  {selectedDetails.assetCategory === "Building" ? (
                    <>
                      <table style={{ ...styles.detailsTable, ...tableStyles.detailsTable }}>
                        <tbody>
                          {[
                            { label: "Asset Type", value: selectedDetails.assetType },
                            { label: "Asset Category", value: selectedDetails.assetCategory },
                            { label: "Sub Category", value: selectedDetails.subCategory },
                            { label: "Building No", value: selectedDetails.buildingNo || "N/A" },
                            { label: "Type", value: selectedDetails.type || "N/A" },
                            { label: "Entry Date", value: selectedDetails.entryDate ? new Date(selectedDetails.entryDate).toLocaleDateString() : "N/A" },
                            { label: "Date of Construction", value: selectedDetails.dateOfConstruction ? new Date(selectedDetails.dateOfConstruction).toLocaleDateString() : "N/A" },
                            { label: "Cost of Construction", value: selectedDetails.costOfConstruction ? `₹${selectedDetails.costOfConstruction.toLocaleString()}` : "N/A" },
                            { label: "Plinth Area", value: selectedDetails.plinthArea || "N/A" },
                            { label: "Approved Estimate", value: selectedDetails.approvedEstimate || "N/A" },
                            { label: "Remarks", value: selectedDetails.remarks || "N/A" },
                            { label: "Approved Building Plan", value: selectedDetails.approvedBuildingPlanUrl ? <a href={selectedDetails.approvedBuildingPlanUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                            { label: "KMZ/KML File", value: selectedDetails.kmzOrkmlFileUrl ? <a href={selectedDetails.kmzOrkmlFileUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                      
                          ].map((item, index) => (
                            <tr key={index} style={index % 2 === 0 ? tableStyles.evenRow : tableStyles.oddRow}>
                              <td style={{ fontWeight: "bold", width: "40%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.label}</td>
                              <td style={{ width: "60%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Upgrades Table */}
                      {selectedDetails.upgrades && selectedDetails.upgrades.length > 0 ? (
                        <div style={{ marginTop: "20px", width: "100%" }}>
                          <h3 style={{ marginBottom: "10px" }}>Upgrades</h3>
                          <table style={{ ...styles.detailsTable, ...tableStyles.detailsTable, width: "100%" }}>
                            <thead>
                              <tr style={{ backgroundColor: "#007BFF", color: "#fff" }}>
                                <th style={{ padding: "10px" }}>Year</th>
                                <th style={{ padding: "10px" }}>Estimate</th>
                                <th style={{ padding: "10px" }}>Approved Estimate</th>
                                <th style={{ padding: "10px" }}>Date of Completion</th>
                                <th style={{ padding: "10px" }}>Defect Liability Period</th>
                                <th style={{ padding: "10px" }}>Execution Agency</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDetails.upgrades.map((upgrade, index) => (
                                <tr key={index} style={index % 2 === 0 ? tableStyles.evenRow : tableStyles.oddRow}>
                                  <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{upgrade.year || "N/A"}</td>
                                  <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{upgrade.estimate ? `₹${upgrade.estimate.toLocaleString()}` : "N/A"}</td>
                                  <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{upgrade.approvedEstimate ? `₹${upgrade.approvedEstimate.toLocaleString()}` : "N/A"}</td>
                                  <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{upgrade.dateOfCompletion ? new Date(upgrade.dateOfCompletion).toLocaleDateString() : "N/A"}</td>
                                  <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{upgrade.defectliabiltyPeriod || "N/A"}</td>
                                  <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{upgrade.executionAgency || "N/A"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ marginTop: "20px" }}>No upgrades available.</p>
                      )}
                    </>
                  ) : selectedDetails.assetCategory === "Land" ? (
                    <table style={{ ...styles.detailsTable, ...tableStyles.detailsTable }}>
                      <tbody>
                        {[
                          { label: "Asset Type", value: selectedDetails.assetType },
                          { label: "Asset Category", value: selectedDetails.assetCategory },
                          { label: "Sub Category", value: selectedDetails.subCategory },
                          { label: "Location", value: selectedDetails.location || "N/A" },
                          { label: "Status", value: selectedDetails.status || "N/A" },
                          { label: "Entry Date", value: selectedDetails.entryDate ? new Date(selectedDetails.entryDate).toLocaleDateString() : "N/A" },
                          { label: "Date of Possession", value: selectedDetails.dateOfPossession ? new Date(selectedDetails.dateOfPossession).toLocaleDateString() : "N/A" },
                          { label: "Controller/Custody", value: selectedDetails.controllerOrCustody || "N/A" },
                          { label: "Details", value: selectedDetails.details || "N/A" },
      
                        ].map((item, index) => (
                          <tr key={index} style={index % 2 === 0 ? tableStyles.evenRow : tableStyles.oddRow}>
                            <td style={{ fontWeight: "bold", width: "40%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.label}</td>
                            <td style={{ width: "60%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <>
                      <table style={{ ...styles.detailsTable, ...tableStyles.detailsTable }}>
                        <tbody>
                          {[
                            { label: "Asset Type", value: selectedDetails.assetType },
                            { label: "Asset Category", value: selectedDetails.assetCategory },
                            { label: "Sub Category", value: selectedDetails.subCategory },
                            { label: "Item Name", value: selectedDetails.itemName },
                            { label: "Entry Date", value: selectedDetails.entryDate ? new Date(selectedDetails.entryDate).toLocaleDateString() : "N/A" },
                            { label: "Purchase Date", value: selectedDetails.purchaseDate ? new Date(selectedDetails.purchaseDate).toLocaleDateString() : "N/A" },
                            { label: "Supplier Name", value: selectedDetails.supplierName },
                            { label: "Supplier Address", value: selectedDetails.supplierAddress || "N/A" },
                            { label: "Source", value: selectedDetails.source },
                            { label: "Mode of Purchase", value: selectedDetails.modeOfPurchase },
                            { label: "Bill No", value: selectedDetails.billNo },
                            { label: "Received By", value: selectedDetails.receivedBy },
                            { label: "Bill Photo", value: selectedDetails.billPhotoUrl ? <a href={selectedDetails.billPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                            { label: "Item Description", value: selectedDetails.itemDescription || "N/A" },
                          ].map((item, index) => (
                            <tr key={index} style={index % 2 === 0 ? tableStyles.evenRow : tableStyles.oddRow}>
                              <td style={{ fontWeight: "bold", width: "40%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.label}</td>
                              <td style={{ width: "60%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <table style={tableStyles.advancedTable} className="admin-asset-table">
                        <tbody>
                          {[
                            { label: "Quantity Received", value: selectedDetails.quantityReceived },
                            { label: "Unit Price", value: selectedDetails.unitPrice },
                            { label: "Total Price", value: selectedDetails.totalPrice },
                            { label: "AMC From Date", value: selectedDetails.amcFromDate ? new Date(selectedDetails.amcFromDate).toLocaleDateString() : "N/A" },
                            { label: "AMC To Date", value: selectedDetails.amcToDate ? new Date(selectedDetails.amcToDate).toLocaleDateString() : "N/A" },
                            { label: "AMC Cost", value: selectedDetails.amcCost || "N/A" },
                            { label: "AMC Photo", value: selectedDetails.amcPhotoUrl ? <a href={selectedDetails.amcPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                            { label: "Item Photo", value: selectedDetails.itemPhotoUrl ? <a href={selectedDetails.itemPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                            { label: "Warranty Number", value: selectedDetails.warrantyNumber || "N/A" },
                            { label: "Warranty Valid Upto", value: selectedDetails.warrantyValidUpto ? new Date(selectedDetails.warrantyValidUpto).toLocaleDateString() : "N/A" },
                            { label: "Warranty Photo", value: selectedDetails.warrantyPhotoUrl ? <a href={selectedDetails.warrantyPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                            { label: "Item IDs", value: (selectedDetails.itemIds || []).length > 0 ? <span style={tableStyles.itemIdBox}>{selectedDetails.itemIds.join(", ")}</span> : "N/A" },
      
                          ].map((item, index) => (
                            <tr key={index} style={index % 2 === 0 ? tableStyles.evenRow : tableStyles.oddRow}>
                              <td style={{ fontWeight: "bold", width: "40%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.label}</td>
                              <td style={{ width: "60%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
                <div style={styles.closeButtonContainer}>
                  <button onClick={closeDetails} style={styles.closeButton}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {zoomedImage && (
            <div style={styles.zoomedImageContainer}>
              <img src={zoomedImage} alt="Zoomed Bill" style={styles.zoomedImage} />
              <button onClick={() => setZoomedImage(null)} style={styles.closeButton}>
                Close
              </button>
            </div>
          )}
        </div>
      </main>
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
  },
  viewDetailsButton: {
    padding: "5px 10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  zoomedImageContainer: {
    position: "fixed",
    top: "60px",
    left: "250px",
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  zoomedImage: {
    maxWidth: "90%",
    maxHeight: "80%",
    objectFit: "contain",
  },
  popupContainer: {
    position: "fixed",
    top: "0px",
    left: "250px",
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "900px",
    maxHeight: "80%", // Increased to accommodate content
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "relative", // Added for button positioning
  },
  tableContainer: {
    maxHeight: "calc(80% - 80px)", // Adjust height to leave space for button
    overflowY: "auto", // Scrollable content
    width: "100%",
  },
  closeButtonContainer: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)", // Center horizontally
    padding: "10px",
  },
  closeButton: {
    padding: "10px 20px",
    backgroundColor: "#ff4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  linkStyle: {
    color: "#007BFF", // Blue color for links
    textDecoration: "underline", // Optional: adds underline for better link visibility
  },
  totalCostContainer: {
    position: "absolute",
    top: "0",
    right: "0",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  totalCostLabel: {
    fontWeight: "bold",
    color: "#333",
    marginRight: "5px",
  },
  totalCostValue: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  detailsTable: {
    width: "48%", // Each table takes up roughly half the container with spacing
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  detailLabel: {
    padding: "8px",
    fontWeight: "bold",
    border: "1px solid #ddd",
    width: "40%", // Adjusted for better fit in narrower tables
  },
  detailValue: {
    padding: "8px",
    border: "1px solid #ddd",
    width: "60%",
  },
  evenRow: {
    backgroundColor: "#f2f2f2",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  // tableContainer: {
  //   display: "flex",
  //   justifyContent: "space-between",
  //   gap: "20px", // Space between the two tables
  // },
  mainContent: {
    marginLeft: "280px", // Width of the sidebar
    padding: "20px",
  },
};

const tableStyles = {
  advancedTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  detailsTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  actionCell: {
    display: "flex",
    gap: "5px",
    justifyContent: "center",
  },
  itemIdBox: {
    border: "1px solid #007BFF",
    padding: "5px 10px",
    borderRadius: "4px",
    backgroundColor: "#f0f8ff",
    display: "inline-block",
    maxWidth: "100%",
    wordBreak: "break-word",
  },
  
};


export default AssetView;