import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";

const AssetIssue = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const serverBaseUrl = "http://localhost:3001"; // Define server base URL

  const [activeTab, setActiveTab] = useState("issue");
  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [storeItems, setStoreItems] = useState([]);
  const [availableIds, setAvailableIds] = useState([]);
  const [inStock, setInStock] = useState(0);
  const [issueItems, setIssueItems] = useState([]);
  const [tempIssues, setTempIssues] = useState([]);

  const permanentAssetOptions = ["Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods", "Fabrics", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"];
  const consumableAssetOptions = ["Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items", "Sanitory Items", "Sports Goods", "Fabrics", "Instruments"];
  const issuedToOptions = ["faculty_chamber", "officer_quarters", "staff_quarters", "corbett_hall", "champion_hall", "gis_lab", "van_vatika", "hostel", "officers_mess", "van_sakthi", "library", "classroom", "office_room", "officers_lounge", "gymnasium", "name"];

  useEffect(() => {
    if (assetType && assetCategory) {
      const fetchStoreItems = async () => {
        try {
          const response = await axios.post(`${serverBaseUrl}/api/assets/getStoreItems`, { assetType, assetCategory });
          setStoreItems(response.data.items || []);
        } catch (error) {
          console.error("Failed to fetch store items:", error);
          setStoreItems([]);
        }
      };
      fetchStoreItems();
    }
  }, [assetType, assetCategory]);

  useEffect(() => {
    if (assetType && assetCategory && selectedItem) {
      const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
      const fetchStock = async () => {
        try {
          const stockResponse = await axios.post(`${serverBaseUrl}/api/assets/checkInStock`, { assetType, assetCategory, itemName, itemDescription });
          setInStock(stockResponse.data.inStock || 0);

          if (assetType === "Permanent") {
            const idResponse = await axios.post(`${serverBaseUrl}/api/assets/getAvailableIds`, { assetType, assetCategory, itemName, subCategory, itemDescription });
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

  const addIssueItem = () => {
    setIssueItems([...issueItems, { issuedTo: "", name: "", designation: "", quantity: 0, selectedIds: [] }]);
  };

  const handleIssueItemChange = (index, field, value) => {
    const updatedIssueItems = issueItems.map((item, i) => {
      if (i === index) {
        if (field === "quantity") {
          const newQuantity = parseInt(value, 10) || 0;
          const limitedIds = item.selectedIds.slice(0, newQuantity);
          return { ...item, quantity: newQuantity, selectedIds: limitedIds };
        } else if (field === "issuedTo" && value !== "name") {
          return { ...item, [field]: value, name: "", designation: "" };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setIssueItems(updatedIssueItems);
  };

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

  const handleSelectAll = (index, checked) => {
    const usedIds = issueItems.filter((_, i) => i !== index).flatMap((item) => item.selectedIds);
    const filteredAvailableIds = availableIds.filter((id) => !usedIds.includes(id));
    const maxSelectable = issueItems[index].quantity;
    setIssueItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              selectedIds: checked ? filteredAvailableIds.slice(0, Math.min(maxSelectable, filteredAvailableIds.length)) : [],
            }
          : item
      )
    );
  };

  const generateReceiptPDF = (issueData, issue) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Asset Issue Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Asset Type: ${issueData.assetType}`, 20, 40);
    doc.text(`Asset Category: ${issueData.assetCategory}`, 20, 50);
    doc.text(`Item Name: ${issueData.itemName}`, 20, 60);
    doc.text(`Sub Category: ${issueData.subCategory}`, 20, 70);
    doc.text(`Item Description: ${issueData.itemDescription}`, 20, 80);
    doc.text(`Issued To: ${issue.issuedTo === "name" ? `${issue.name} (${issue.designation})` : issue.issuedTo}`, 20, 90);
    doc.text(`Quantity: ${issue.quantity}`, 20, 100);
    if (issueData.assetType === "Permanent") {
      doc.text(`Item IDs: ${issue.selectedIds.join(", ")}`, 20, 110);
    }
    doc.text("Signature: ____________________", 150, 280, { align: "right" });
    return doc.output("blob");
  };

  const handleSubmitIssue = async () => {
    if (!selectedItem || issueItems.length === 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select an item and add at least one issue!" });
      return;
    }
  
    const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
    for (const issue of issueItems) {
      if (!issue.issuedTo || issue.quantity <= 0 || (issue.issuedTo === "name" && (!issue.name || !issue.designation)) || (assetType === "Permanent" && issue.selectedIds.length !== issue.quantity)) {
        Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields correctly!" });
        return;
      }
    }
  
    const totalSelectedIds = issueItems.flatMap((issue) => issue.selectedIds);
    if (assetType === "Permanent" && new Set(totalSelectedIds).size !== totalSelectedIds.length) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Duplicate IDs selected across locations!" });
      return;
    }
  
    const totalIssuedQuantity = issueItems.reduce((sum, issue) => sum + issue.quantity, 0);
    if (totalIssuedQuantity > inStock) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Total issued quantity exceeds available stock!" });
      return;
    }
  
    const issueData = { assetType, assetCategory, itemName, subCategory, itemDescription };
    
    try {
      // Process issues sequentially
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
  
        // Upload to server
        await axios.post(`${serverBaseUrl}/api/assets/storeTempIssue`, {
          assetType: issueData.assetType,
          assetCategory: issueData.assetCategory,
          itemName: issueData.itemName,
          subCategory: issueData.subCategory,
          itemDescription: issueData.itemDescription,
          issuedTo: issue.issuedTo === "name" ? `${issue.name} (${issue.designation})` : issue.issuedTo,
          quantity: issue.quantity,
          issuedIds: issueData.assetType === "Permanent" ? JSON.stringify(issue.selectedIds) : undefined,
          acknowledged: "no",
          pdfBase64: base64Data,
        });
  
        // Force download
        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 100);
  
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      }
  
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "All receipts generated and downloaded successfully!",
      }).then(() => {
        window.location.reload();
      });
  
      resetIssueForm();
    } catch (error) {
      Swal.fire({ 
        icon: "error", 
        title: "Oops...", 
        text: error.response?.data?.message || "Failed to generate receipts!" 
      });
      console.error(error);
    }
  };
  const handleAcknowledgeUpload = async (tempIssueId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tempIssueId", tempIssueId);

    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/acknowledgeTempIssue`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const signedPdfUrl = response.data.signedPdfUrl.startsWith("http") ? response.data.signedPdfUrl : `${serverBaseUrl}${response.data.signedPdfUrl}`;
      setTempIssues(tempIssues.map((issue) => (issue._id === tempIssueId ? { ...issue, acknowledged: "yes", signedPdfUrl } : issue)));
      Swal.fire({ icon: "success", title: "Success!", text: "Signed PDF uploaded and acknowledged!" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to upload signed PDF!" });
      console.error(error);
    }
  };

  const resetIssueForm = () => {
    setAssetCategory("");
    setSelectedItem("");
    setIssueItems([]);
    setAvailableIds([]);
    setInStock(0);
  };

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <title>CASFOS - Asset Issue</title>
      </Helmet>

      <section id="sidebar">
        <a href="#" className="brand"><span className="text">DATA ENTRY STAFF</span></a>
        <ul className="side-menu top">
            <li className="active"><a href={`/assetentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li ><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
            <li><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
            <li><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
            <li><a href={`/viewasset?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Asset View</span></a></li>
          </ul>
        <ul className="side-menu">
          <li><a href="/" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></a></li>
        </ul>
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

        <div style={styles.menuBar}>
          <button style={activeTab === "issue" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("issue")}>Issue</button>
          <button style={activeTab === "acknowledge" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("acknowledge")}>Acknowledge</button>
        </div>

        <main>
          <div style={styles.container}>
            <h2>Asset Management System</h2>

            {activeTab === "issue" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Asset Type:</label>
                    <select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}>
                      <option value="Permanent">Permanent</option>
                      <option value="Consumable">Consumable</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Asset Category:</label>
                    <select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}>
                      <option value="">Select Category</option>
                      {(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Item:</label>
                    <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} style={styles.input}>
                      <option value="">Select Item</option>
                      {storeItems.map((item) => (
                        <option key={`${item.itemName}-${item.subCategory}-${item.itemDescription}`} value={`${item.itemName} - ${item.subCategory} - ${item.itemDescription}`}>
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
                {issueItems.map((issue, index) => {
                  const usedIds = issueItems.filter((_, i) => i !== index).flatMap((item) => item.selectedIds);
                  const filteredAvailableIds = availableIds.filter((id) => !usedIds.includes(id));
                  const usedLocations = issueItems.filter((_, i) => i !== index).map((item) => item.issuedTo);

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
                                  {option === "name" ? "Name" : option.replace("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
                                onChange={(e) => handleIssueItemChange(index, "designation", e.target.value)}
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
                                checked={issue.selectedIds.length === filteredAvailableIds.length && filteredAvailableIds.length > 0}
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
                                  disabled={issue.selectedIds.length >= issue.quantity && !issue.selectedIds.includes(id)}
                                />
                                {id}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={styles.buttonContainer}>
                  <button onClick={addIssueItem} style={styles.button}><FaPlus /> Add Issue</button>
                  <button onClick={handleSubmitIssue} style={styles.button}>Submit</button>
                </div>
              </div>
            )}

            {activeTab === "acknowledge" && (
              <div style={styles.formContainer}>
                <h3>Acknowledge Receipts</h3>
                {tempIssues.map((issue) => (
                  <div key={issue._id} style={styles.itemContainer}>
                    <p><strong>Asset Type:</strong> {issue.assetType}</p>
                    <p><strong>Asset Category:</strong> {issue.assetCategory}</p>
                    <p><strong>Item Name:</strong> {issue.itemName}</p>
                    <p><strong>Sub Category:</strong> {issue.subCategory}</p>
                    <p><strong>Item Description:</strong> {issue.itemDescription}</p>
                    <p><strong>Issued To:</strong> {issue.issuedTo}</p>
                    <p><strong>Quantity:</strong> {issue.quantity}</p>
                    {issue.issuedIds && <p><strong>Item IDs:</strong> {issue.issuedIds.join(", ")}</p>}
                    <p><strong>Receipt:</strong> <a href={issue.pdfUrl.startsWith("http") ? issue.pdfUrl : `${serverBaseUrl}${issue.pdfUrl}`} target="_blank" rel="noopener noreferrer">Download</a></p>
                    {issue.acknowledged === "no" ? (
                      <div style={styles.inputGroup}>
                        <label>Upload Signed Receipt:</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleAcknowledgeUpload(issue._id, e.target.files[0])}
                          style={styles.input}
                        />
                      </div>
                    ) : (
                      <p><strong>Signed Receipt:</strong> <a href={issue.signedPdfUrl.startsWith("http") ? issue.signedPdfUrl : `${serverBaseUrl}${issue.signedPdfUrl}`} target="_blank" rel="noopener noreferrer">View</a></p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </section>
    </>
  );
};

const styles = {
  menuBar: { width: "100%", backgroundColor: "#f4f4f4", padding: "10px 0", display: "flex", justifyContent: "center", gap: "20px", position: "fixed", top: "60px", left: 0, zIndex: 1000, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" },
  tab: { padding: "10px 20px", border: "none", backgroundColor: "#ddd", cursor: "pointer", borderRadius: "5px", fontSize: "16px" },
  activeTab: { padding: "10px 20px", border: "none", backgroundColor: "#007BFF", color: "#fff", cursor: "pointer", borderRadius: "5px", fontSize: "16px" },
  container: { width: "100%", margin: "80px auto 20px", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff" },
  formContainer: { display: "flex", flexDirection: "column", gap: "20px" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" },
  input: { padding: "8px", borderRadius: "5px", border: "1px solid #ddd", width: "100%" },
  itemContainer: { border: "1px solid #ddd", padding: "15px", borderRadius: "5px", marginBottom: "20px" },
  itemRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" },
  inputGroup: { display: "flex", flexDirection: "column" },
  buttonContainer: { display: "flex", gap: "10px", justifyContent: "flex-start" },
  button: { padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  checkboxContainer: { display: "flex", flexDirection: "column", maxHeight: "150px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" },
  checkboxLabel: { margin: "5px 0" },
};

export default AssetIssue;