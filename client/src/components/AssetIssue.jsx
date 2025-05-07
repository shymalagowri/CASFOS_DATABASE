import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";

// Component definition
const AssetIssue = () => {
  // Constants and Hooks
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const serverBaseUrl = `http://${ip}:${port}`;
  const rejectedId = queryParams.get("rejectedId");
  const fileInputRefs = useRef({});

  // State Variables
  const [isEditingRejected, setIsEditingRejected] = useState(false);
  const [activeTab, setActiveTab] = useState("issue");
  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [storeItems, setStoreItems] = useState([]);
  const [availableIds, setAvailableIds] = useState([]);
  const [inStock, setInStock] = useState(0);
  const [issueItems, setIssueItems] = useState([]);
  const [tempIssues, setTempIssues] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Asset Options
  const permanentAssetOptions = [
    "Furniture",
    "Vehicle",
    "Instruments",
    "Sports and Goods",
    "Fabrics",
    "Electrical",
    "Electronics",
    "Photograph Items",
    "ICT Goods",
  ];
  const consumableAssetOptions = [
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
  const issuedToOptions = [
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
    "name",
  ];

  // Effect to handle rejected asset editing
  useEffect(() => {
    if (rejectedId) {
      const fetchRejectedAsset = async () => {
        try {
          const response = await axios.get(`${serverBaseUrl}/api/assets/rejected-asset/${rejectedId}`);
          const rejectedAsset = response.data.data;

          setAssetType(rejectedAsset.assetType || "Permanent");
          setAssetCategory(rejectedAsset.assetCategory || "");
          setSelectedItem(`${rejectedAsset.itemName} - ${rejectedAsset.subCategory} - ${rejectedAsset.itemDescription}`);

          const issuedToParts = rejectedAsset.issuedTo.match(/^(.*) \((.*)\)$/) || [
            null,
            rejectedAsset.issuedTo,
          ];
          const issuedTo = issuedToParts[1] === "name" || issuedToOptions.includes(issuedToParts[1])
            ? issuedToParts[1]
            : "name";
          const name = issuedTo === "name" ? issuedToParts[1] : "";
          const designation = issuedTo === "name" ? issuedToParts[2] : "";

          setIssueItems([
            {
              issuedTo,
              name,
              designation,
              location: rejectedAsset.location || "",
              quantity: rejectedAsset.quantity || 0,
              selectedIds: rejectedAsset.issuedIds || [],
            },
          ]);

          setIsEditingRejected(true);
          await Swal.fire({
            icon: "info",
            title: "Editing Rejected Issue",
            text: "You are now editing a rejected issue. Update the details and resubmit.",
          });
        } catch (error) {
          console.error("Failed to fetch rejected asset:", error);
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load rejected issue data.",
          });
        }
      };
      fetchRejectedAsset();
    }
  }, [rejectedId]);

  // Effect to fetch store items based on asset type and category
  useEffect(() => {
    if (assetType && assetCategory) {
      const fetchStoreItems = async () => {
        try {
          const response = await axios.post(`${serverBaseUrl}/api/assets/getStoreItems`, {
            assetType,
            assetCategory,
          });
          setStoreItems(response.data.items || []);
        } catch (error) {
          console.error("Failed to fetch store items:", error);
          setStoreItems([]);
        }
      };
      fetchStoreItems();
    }
  }, [assetType, assetCategory]);

  // Effect to fetch stock and available IDs for selected item
  useEffect(() => {
    if (assetType && assetCategory && selectedItem) {
      const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
      const fetchStock = async () => {
        try {
          const stockResponse = await axios.post(`${serverBaseUrl}/api/assets/checkInStock`, {
            assetType,
            assetCategory,
            itemName,
            itemDescription,
          });
          setInStock(stockResponse.data.inStock || 0);

          if (assetType === "Permanent") {
            const idResponse = await axios.post(`${serverBaseUrl}/api/assets/getAvailableIds`, {
              assetType,
              assetCategory,
              itemName,
              subCategory,
              itemDescription,
            });
            setAvailableIds(idResponse.data.itemIds || []);
          } else {
            setAvailableIds([]);
          }
        } catch (error) {
          console.error("Failed to fetch stock or IDs:", error);
          setInStock(0);
          setAvailableIds([]);
        }
      };
      fetchStock();
    }
  }, [assetType, assetCategory, selectedItem]);

  // Effect to fetch temporary issues for acknowledgment tab
  useEffect(() => {
    if (activeTab === "acknowledge") {
      const fetchTempIssues = async () => {
        try {
          const response = await axios.get(`${serverBaseUrl}/api/assets/getTempIssues`);
          setTempIssues(response.data || []);
        } catch (error) {
          console.error("Failed to fetch temp issues:", error);
          setTempIssues([]);
        }
      };
      fetchTempIssues();
    }
  }, [activeTab]);

  // Handler Functions
  // Add a new issue item to the list
  const addIssueItem = () => {
    setIssueItems([
      ...issueItems,
      { issuedTo: "", name: "", designation: "", location: "", quantity: 0, selectedIds: [] },
    ]);
  };

  // Remove an issue item from the list
  const removeIssueItem = (index) => {
    setIssueItems(issueItems.filter((_, i) => i !== index));
  };

  // Update issue item fields
  const handleIssueItemChange = (index, field, value) => {
    const updatedIssueItems = issueItems.map((item, i) => {
      if (i === index) {
        if (field === "quantity") {
          const newQuantity = parseInt(value, 10) || 0;
          const limitedIds = item.selectedIds.slice(0, newQuantity);
          return { ...item, quantity: newQuantity, selectedIds: limitedIds };
        } else if (field === "issuedTo") {
          return {
            ...item,
            [field]: value,
            name: value === "name" ? item.name : "",
            designation: value === "name" ? item.designation : "",
            location: value === "name" ? item.location : "",
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setIssueItems(updatedIssueItems);
  };

  // Handle individual ID selection for permanent assets
  const handleIdSelection = (index, id, checked) => {
    setIssueItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              selectedIds: checked
                ? item.selectedIds.length < item.quantity
                  ? [...item.selectedIds, id]
                  : item.selectedIds
                : item.selectedIds.filter((selectedId) => selectedId !== id),
            }
          : item
      )
    );
  };

  // Handle select all IDs for an issue item
  const handleSelectAll = (index, checked) => {
    const usedIds = issueItems.filter((_, i) => i !== index).flatMap((item) => item.selectedIds);
    const filteredAvailableIds = availableIds.filter((id) => !usedIds.includes(id));
    const maxSelectable = issueItems[index].quantity;
    setIssueItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              selectedIds: checked
                ? filteredAvailableIds.slice(0, Math.min(maxSelectable, filteredAvailableIds.length))
                : [],
            }
          : item
      )
    );
  };

  // Generate PDF receipt for an issued asset
  const generateReceiptPDF = (issueData, issue) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = "#007BFF";
    const secondaryColor = "#00C4B4";
    const textColor = "#333333";

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#FFFFFF");
    doc.text("Asset Issue Receipt", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 105, 25, { align: "center" });

    // Body
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.setFont("helvetica", "italic");
    doc.text("CASFOS Asset Management System", 10, 40);
    doc.setFont("helvetica", "normal");

    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Asset Details", 10, 55);

    const details = [
      ["Asset Type", issueData.assetType || "N/A"],
      ["Asset Category", issueData.assetCategory || "N/A"],
      ["Item Name", issueData.itemName || "N/A"],
      ["Sub Category", issueData.subCategory || "N/A"],
      ["Item Description", issueData.itemDescription || "N/A"],
      ["Issued To", issue.issuedTo === "name" ? `${issue.name} (${issue.designation})` : issue.issuedTo || "N/A"],
      ...(issue.issuedTo === "name" ? [["Location", issue.location || "N/A"]] : []),
      ["Quantity", issue.quantity || "N/A"],
    ];

    if (issueData.assetType === "Permanent" && issue.selectedIds.length > 0) {
      details.push(["Item IDs", issue.selectedIds.join(", ")]);
    }

    let yPos = 65;
    doc.setFontSize(11);
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 10, yPos);
      doc.setFont("helvetica", "normal");
      const splitValue = doc.splitTextToSize(value, 170);
      doc.text(splitValue, 50, yPos);
      yPos += splitValue.length * 5 + 2;
    });

    // Footer
    doc.setDrawColor(secondaryColor);
    doc.line(10, yPos + 5, 200, yPos + 5);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signature", 10, yPos + 20);
    doc.setFont("helvetica", "normal");
    doc.text("Name: _____________________________", 10, yPos + 30);
    doc.text("Date: _____________________________", 10, yPos + 40);
    doc.text("Signature: ________________________", 140, yPos + 30, { align: "right" });

    doc.setFillColor(secondaryColor);
    doc.rect(0, 280, 210, 10, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(10);
    doc.text("Thank you for using CASFOS Asset Management System", 105, 285, { align: "center" });

    return doc.output("blob");
  };

  // Submit issued assets and generate receipts
  const handleSubmitIssue = async () => {
    if (!selectedItem || issueItems.length === 0) {
      await Swal.fire({ icon: "warning", title: "Warning", text: "Please select an item and add at least one issue!" });
      return;
    }

    const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
    for (const issue of issueItems) {
      if (
        !issue.issuedTo ||
        issue.quantity <= 0 ||
        (issue.issuedTo === "name" && (!issue.name || !issue.location || !issue.designation)) ||
        (assetType === "Permanent" && issue.selectedIds.length !== issue.quantity)
      ) {
        await Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields correctly!" });
        return;
      }
    }

    const totalSelectedIds = issueItems.flatMap((issue) => issue.selectedIds);
    if (assetType === "Permanent" && new Set(totalSelectedIds).size !== totalSelectedIds.length) {
      await Swal.fire({ icon: "warning", title: "Warning", text: "Duplicate IDs selected across locations!" });
      return;
    }

    const totalIssuedQuantity = issueItems.reduce((sum, issue) => sum + issue.quantity, 0);
    if (totalIssuedQuantity > inStock) {
      await Swal.fire({ icon: "warning", title: "Warning", text: "Total issued quantity exceeds available stock!" });
      return;
    }

    const issueData = { assetType, assetCategory, itemName, subCategory, itemDescription };

    try {
      for (const issue of issueItems) {
        const pdfBlob = generateReceiptPDF(issueData, issue);
        const reader = new FileReader();
        const base64Data = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(pdfBlob);
        });

        const issuedToValue = issue.issuedTo === "name" ? `${issue.name}_${issue.designation}` : issue.issuedTo;
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const filename = `${date}_${issuedToValue}_${itemName}.pdf`;

        await axios.post(`${serverBaseUrl}/api/assets/storeTempIssue`, {
          assetType: issueData.assetType,
          assetCategory: issueData.assetCategory,
          itemName: issueData.itemName,
          subCategory: issueData.subCategory,
          itemDescription: issueData.itemDescription,
          issuedTo: issue.issuedTo === "name" ? `${issue.name} (${issue.designation})` : issue.issuedTo,
          location: issue.location,
          quantity: issue.quantity,
          issuedIds: issueData.assetType === "Permanent" ? JSON.stringify(issue.selectedIds) : undefined,
          acknowledged: "no",
          pdfBase64: base64Data,
        });

        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 100);

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (isEditingRejected && rejectedId) {
        await axios.delete(`${serverBaseUrl}/api/assets/rejected-asset/${rejectedId}`);
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "All receipts generated and downloaded successfully!",
      }).then(() => {
        window.history.replaceState(null, "", `/assetissue?username=${encodeURIComponent(username)}`);
        window.location.reload();
      });

      resetIssueForm();
      setIsEditingRejected(false);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to generate receipts!",
      });
      console.error(error);
    }
  };

  // Acknowledge a temporary issue by uploading a signed receipt
  const handleAcknowledgeDone = async (tempIssueId) => {
    const file = uploadedFiles[tempIssueId];

    if (!file) {
      await Swal.fire({ icon: "error", title: "Oops...", text: "Please upload a signed receipt first!" });
      return;
    }

    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExtensions = [".pdf", ".jpeg", ".jpg", ".png"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedMimeTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      await Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Only PDF, JPEG, and PNG files are allowed!",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tempIssueId", tempIssueId);

    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/acknowledgeTempIssue`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedTempIssues = tempIssues.map((issue) =>
        issue._id === tempIssueId
          ? {
              ...issue,
              acknowledged: "yes",
              signedPdfUrl: response.data.signedPdfUrl.startsWith("http")
                ? response.data.signedPdfUrl
                : `${serverBaseUrl}${response.data.signedPdfUrl}`,
            }
          : issue
      );

      const newUploadedFiles = { ...uploadedFiles };
      delete newUploadedFiles[tempIssueId];

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Receipt acknowledged!",
      });

      setTempIssues(updatedTempIssues);
      setUploadedFiles(newUploadedFiles);
    } catch (error) {
      console.error("Acknowledge error:", error);
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to acknowledge receipt!",
      });
    }
  };

  // Handle file upload for signed receipt
  const handleFileChange = async (tempIssueId, file) => {
    if (!file) return;

    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExtensions = [".pdf", ".jpeg", ".jpg", ".png"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isValidMimeType = allowedMimeTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidMimeType || !isValidExtension) {
      await Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Only PDF, JPEG, and PNG files are allowed!",
      });
      if (fileInputRefs.current[tempIssueId]) {
        fileInputRefs.current[tempIssueId].value = "";
      }
      return;
    }

    setUploadedFiles({
      ...uploadedFiles,
      [tempIssueId]: file,
    });
  };

  // Reset the issue form after submission
  const resetIssueForm = () => {
    setAssetCategory("");
    setSelectedItem("");
    setIssueItems([]);
    setAvailableIds([]);
    setInStock(0);
  };

  // JSX Rendering
  return (
    <>
      {/* Helmet for SEO and metadata */}
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <title>CASFOS - Asset Issue</title>
      </Helmet>

      {/* Sidebar Navigation */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">STOREKEEPER</span>
        </a>
        <ul className="side-menu top">
          <li>
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
          <li className="active">
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

      <section id="content">
        {/* Navigation Bar */}
        <nav>
          <i className="bx bx-menu" />
          <form action="#"><div className="form-input"></div></form>

          <div style={styles.usernameContainer}>
            <i className="bx bxs-user-circle" style={styles.userIcon}></i>
            <span style={styles.username}>{username}</span>
          </div>
        </nav>

        {/* Tab Menu */}
        <div style={styles.menuBar}>
          <button
            style={activeTab === "issue" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("issue")}
          >
            Issue
          </button>
          <button
            style={activeTab === "acknowledge" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("acknowledge")}
          >
            Acknowledge
          </button>
        </div>

        {/* Main Content Area */}
        <main>
          <div style={styles.container}>
            <h2>Asset Management System</h2>
            {isEditingRejected && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeeba",
                  borderRadius: "5px",
                  marginBottom: "15px",
                  color: "#856404",
                }}
              >
                <strong>Editing Rejected Issue</strong>: Update the details below and resubmit.
              </div>
            )}
            {activeTab === "issue" && (
              <div style={styles.formContainer}>
                {/* Asset Selection Form */}
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Asset Type:</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      style={styles.input}
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Consumable">Consumable</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Asset Category:</label>
                    <select
                      value={assetCategory}
                      onChange={(e) => setAssetCategory(e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Select Category</option>
                      {(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Item:</label>
                    <select
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Select Item</option>
                      {storeItems.map((item) => (
                        <option
                          key={`${item.itemName}-${item.subCategory}-${item.itemDescription}`}
                          value={`${item.itemName} - ${item.subCategory} - ${item.itemDescription}`}
                        >
                          {`${item.itemName} - ${item.subCategory} - ${item.itemDescription}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>In Stock:</label>
                    <input type="number" value={inStock} disabled style={styles.input} />
                  </div>
                </div>
                <h3>Issue Details</h3>
                {/* Issue Items List */}
                {issueItems.map((issue, index) => {
                  const usedIds = issueItems
                    .filter((_, i) => i !== index)
                    .flatMap((item) => item.selectedIds);
                  const filteredAvailableIds = availableIds.filter((id) => !usedIds.includes(id));
                  const usedLocations = issueItems
                    .filter((_, i) => i !== index)
                    .map((item) => item.issuedTo);

                  return (
                    <div key={index} style={styles.itemContainer}>
                      <div style={styles.itemRow}>
                        <div style={styles.inputGroup}>
                          <label>Issued To:</label>
                          <select
                            value={issue.issuedTo}
                            onChange={(e) => handleIssueItemChange(index, "issuedTo", e.target.value)}
                            style={styles.input}
                          >
                            <option value="">Select Location</option>
                            {issuedToOptions
                              .filter((option) => !usedLocations.includes(option))
                              .map((option) => (
                                <option key={option} value={option}>
                                  {option === "name"
                                    ? "Name"
                                    : option
                                        .replace("_", " ")
                                        .split(" ")
                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ")}
                                </option>
                              ))}
                          </select>
                        </div>
                        {issue.issuedTo === "name" && (
                          <>
                            <div style={styles.inputGroup}>
                              <label>Name:</label>
                              <input
                                type="text"
                                value={issue.name}
                                onChange={(e) => handleIssueItemChange(index, "name", e.target.value)}
                                style={styles.input}
                              />
                            </div>
                            <div style={styles.inputGroup}>
                              <label>Designation:</label>
                              <input
                                type="text"
                                value={issue.designation}
                                onChange={(e) =>
                                  handleIssueItemChange(index, "designation", e.target.value)
                                }
                                style={styles.input}
                              />
                            </div>
                            <div style={styles.inputGroup}>
                              <label>Location:</label>
                              <input
                                type="text"
                                value={issue.location}
                                onChange={(e) => handleIssueItemChange(index, "location", e.target.value)}
                                style={styles.input}
                              />
                            </div>
                          </>
                        )}
                        <div style={styles.inputGroup}>
                          <label>Quantity:</label>
                          <input
                            type="number"
                            value={issue.quantity}
                            onChange={(e) => handleIssueItemChange(index, "quantity", e.target.value)}
                            style={styles.input}
                          />
                        </div>
                      </div>
                      {assetType === "Permanent" && (
                        <div style={styles.inputGroup}>
                          <label>Select Item IDs:</label>
                          <div style={styles.checkboxContainer}>
                            <label>
                              <input
                                type="checkbox"
                                checked={
                                  issue.selectedIds.length === filteredAvailableIds.length &&
                                  filteredAvailableIds.length > 0
                                }
                                onChange={(e) => handleSelectAll(index, e.target.checked)}
                              />
                              Select All
                            </label>
                            {filteredAvailableIds.map((id) => (
                              <label key={id} style={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={issue.selectedIds.includes(id)}
                                  onChange={(e) => handleIdSelection(index, id, e.target.checked)}
                                  disabled={
                                    issue.selectedIds.length >= issue.quantity &&
                                    !issue.selectedIds.includes(id)
                                  }
                                />
                                {id}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={styles.buttonContainer}>
                        <button 
                          onClick={() => removeIssueItem(index)} 
                          style={styles.removeButton}
                          title="Remove Issue"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div style={styles.buttonContainer}>
                  <button onClick={addIssueItem} style={styles.button}>
                    <FaPlus /> Add Issue
                  </button>
                  <button onClick={handleSubmitIssue} style={styles.button}>
                    Submit
                  </button>
                </div>
              </div>
            )}

            {activeTab === "acknowledge" && (
              <div style={styles.formContainer}>
                <h3 style={styles.sectionTitle}>Acknowledge Receipts</h3>
                <div style={styles.cardContainer}>
                  {tempIssues.map((issue) => (
                    <div key={issue._id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <h3>{issue.itemName || "Unnamed Item"}</h3>
                        <span style={styles.assetTypeBadge}>{issue.assetType || "N/A"}</span>
                      </div>
                      <div style={styles.cardBody}>
                        <p>
                          <strong>Category:</strong> {issue.assetCategory || "N/A"}
                        </p>
                        <p>
                          <strong>Sub Category:</strong> {issue.subCategory || "N/A"}
                        </p>
                        <p>
                          <strong>Description:</strong> {issue.itemDescription || "N/A"}
                        </p>
                        <p>
                          <strong>Issued To:</strong> {issue.issuedTo || "N/A"}
                        </p>
                        <p>
                          <strong>Location:</strong> {issue.location || "N/A"}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {issue.quantity || "N/A"}
                        </p>
                        {issue.issuedIds && (
                          <p>
                            <strong>Item IDs:</strong>{" "}
                            {(() => {
                              let ids;
                              if (Array.isArray(issue.issuedIds)) {
                                ids = issue.issuedIds;
                              } else if (typeof issue.issuedIds === "string") {
                                try {
                                  ids = JSON.parse(issue.issuedIds);
                                } catch (e) {
                                  ids = [issue.issuedIds];
                                }
                              } else {
                                ids = [];
                              }
                              return ids.join(", ") || "N/A";
                            })()}
                          </p>
                        )}
                        <div style={styles.actionGroup}>
                          <a
                            href={
                              issue.pdfUrl.startsWith("http")
                                ? issue.pdfUrl
                                : `${serverBaseUrl}${issue.pdfUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.downloadLink}
                          >
                            Download Receipt
                          </a>
                        </div>
                        {issue.acknowledged === "no" ? (
                          <div style={styles.uploadGroup}>
                            <label style={styles.uploadLabel}>
                              <strong>Upload Signed Receipt:</strong>
                            </label>
                            <input
                              type="file"
                              accept="application/pdf,image/jpeg,image/png"
                              onChange={(e) => handleFileChange(issue._id, e.target.files[0])}
                              ref={(el) => (fileInputRefs.current[issue._id] = el)}
                              style={styles.fileInput}
                            />
                            <button
                              onClick={() => handleAcknowledgeDone(issue._id)}
                              disabled={!uploadedFiles[issue._id]}
                              style={
                                uploadedFiles[issue._id] ? styles.doneButton : styles.disabledDoneButton
                              }
                            >
                              Done
                            </button>
                            {uploadedFiles[issue._id] && (
                              <p style={styles.fileInfo}>
                                Selected: {uploadedFiles[issue._id].name} (
                                {(uploadedFiles[issue._id].size / 1024).toFixed(2)} KB)
                              </p>
                            )}
                          </div>
                        ) : (
                          <div style={styles.actionGroup}>
                            <p>
                              <strong>Signed Receipt:</strong>
                            </p>
                            <a
                              href={
                                issue.signedPdfUrl.startsWith("http")
                                  ? issue.signedPdfUrl
                                  : `${serverBaseUrl}${issue.signedPdfUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.viewLink}
                            >
                              View Signed Receipt
                            </a>
                          </div>
                        )}
                      </div>
                      <div style={styles.cardFooter}>
                        <span
                          style={
                            issue.acknowledged === "yes"
                              ? styles.statusAcknowledged
                              : styles.statusPending
                          }
                        >
                          {issue.acknowledged === "yes" ? "Acknowledged" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </section>
    </>
  );
};

// Styles Object
const styles = {
  menuBar: {
    width: "100%",
    backgroundColor: "#f4f4f4",
    padding: "10px 0",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    position: "fixed",
    top: "60px",
    left: 0,
    zIndex: 1000,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#ddd",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
    transition: "background-color 0.3s",
  },
  fileInfo: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
    wordBreak: "break-word",
  },
  activeTab: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
    transition: "background-color 0.3s",
  },
  container: {
    width: "100%",
    margin: "80px auto 20px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    width: "100%",
    fontSize: "14px",
  },
  itemContainer: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "15px",
    marginBottom: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-start",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    transition: "background-color 0.3s",
  },
  removeButton: {
    padding: "10px 20px",
    backgroundColor: "#DC3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    transition: "background-color 0.3s",
  },
  usernameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userIcon: {
    fontSize: "30px",
    color: "#007BFF",
  },
  username: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  checkboxContainer: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "150px",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "5px",
  },
  checkboxLabel: {
    margin: "5px 0",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: "20px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    background: "linear-gradient(135deg, #007BFF, #00C4B4)",
    color: "#fff",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  },
  assetTypeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardBody: {
    padding: "15px",
    fontSize: "14px",
    color: "#444",
    flexGrow: 1,
    lineHeight: "1.6",
  },
  actionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "15px",
  },
  downloadLink: {
    display: "inline-block",
    padding: "8px 15px",
    backgroundColor: "#28A745",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    textAlign: "center",
    transition: "background-color 0.3s",
  },
  uploadGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginTop: "10px",
  },
  uploadLabel: {
    fontWeight: "bold",
    color: "#333",
  },
  fileInput: {
    padding: "5px",
    border: "1px dashed #007BFF",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
  },
  viewLink: {
    display: "inline-block",
    padding: "8px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    textAlign: "center",
    transition: "background-color 0.3s",
  },
  cardFooter: {
    padding: "10px 15px",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #eee",
    textAlign: "right",
  },
  statusAcknowledged: {
    color: "#28A745",
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  statusPending: {
    color: "#FFC107",
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  doneButton: {
    padding: "8px 15px",
    backgroundColor: "#28A745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.3s",
  },
  disabledDoneButton: {
    padding: "8px 15px",
    backgroundColor: "#6C757D",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "not-allowed",
    marginTop: "10px",
    opacity: 0.7,
  },
};

export default AssetIssue;