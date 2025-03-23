import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const AssetIssue = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [storeItems, setStoreItems] = useState([]);
  const [availableIds, setAvailableIds] = useState([]);
  const [inStock, setInStock] = useState(0);
  const [issueItems, setIssueItems] = useState([]);

  const permanentAssetOptions = ["Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods", "Fabrics", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"];
  const consumableAssetOptions = ["Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items", "Sanitory Items", "Sports Goods", "Fabrics", "Instruments"];
  const issuedToOptions = ["faculty_chamber", "officer_quarters", "staff_quarters", "corbett_hall", "champion_hall", "gis_lab", "van_vatika", "hostel", "officers_mess", "van_sakthi", "library", "classroom", "office_room", "officers_lounge", "gymnasium"];

  useEffect(() => {
    if (assetType && assetCategory) {
      const fetchStoreItems = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getStoreItems", { assetType, assetCategory });
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
          const stockResponse = await axios.post("http://localhost:3001/api/assets/checkInStock", {
            assetType,
            assetCategory,
            itemName,
            itemDescription,
          });
          setInStock(stockResponse.data.inStock || 0);

          if (assetType === "Permanent") {
            const idResponse = await axios.post("http://localhost:3001/api/assets/getAvailableIds", {
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

  const addIssueItem = () => {
    setIssueItems([...issueItems, { issuedTo: "", quantity: 0, selectedIds: [] }]);
  };

  const handleIssueItemChange = (index, field, value) => {
    const updatedIssueItems = issueItems.map((item, i) => {
      if (i === index) {
        if (field === "quantity") {
          const newQuantity = parseInt(value, 10) || 0;
          const limitedIds = item.selectedIds.slice(0, newQuantity); // Limit selectedIds to new quantity
          return { ...item, quantity: newQuantity, selectedIds: limitedIds };
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
                  : item.selectedIds // Prevent adding more IDs than quantity
                : item.selectedIds.filter((selectedId) => selectedId !== id),
            }
          : item
      )
    );
  };

  const handleSelectAll = (index, checked) => {
    const usedIds = issueItems
      .filter((_, i) => i !== index)
      .flatMap((item) => item.selectedIds);
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

  const handleSubmitIssue = async () => {
    if (!selectedItem || issueItems.length === 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select an item and add at least one issue!" });
      return;
    }

    const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
    for (const issue of issueItems) {
      if (!issue.issuedTo || issue.quantity <= 0 || (assetType === "Permanent" && issue.selectedIds.length !== issue.quantity)) {
        Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields and ensure selected IDs match the quantity for Permanent assets!" });
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

    const issueData = {
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      issues: issueItems.map((issue) => ({
        issuedTo: issue.issuedTo,
        quantity: issue.quantity,
        issuedIds: assetType === "Permanent" ? issue.selectedIds : undefined, // Only include IDs for Permanent
      })),
    };

    try {
      await axios.post("http://localhost:3001/api/assets/issue", issueData);
      Swal.fire({ icon: "success", title: "Success!", text: "Items issued successfully!" });
      resetIssueForm();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: error.response?.data?.message || "Failed to issue items!" });
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
        <link rel="stylesheet" href="style.css" />
        <title>CASFOS - Asset Issue</title>
      </Helmet>

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">DATA ENTRY STAFF</span>
        </a>
        <ul className="side-menu top">
          <li><a href={`/dataentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
          <li><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
          <li className="active"><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
          <li><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
          <li><a href={`/rejectedassets?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Rejected Assets</span></a></li>
          <li><a href={`/facultyentry?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty Entry</span></a></li>
          <li><a href={`/facultyupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty Updation</span></a></li>
        </ul>
        <ul className="side-menu">
          <li><a href="/" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></a></li>
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

        <main>
          <div style={styles.container}>
            <h2>Asset Issue System</h2>
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
                                {option.replace("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                              </option>
                            ))}
                        </select>
                      </div>
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
          </div>
        </main>
      </section>
    </>
  );
};

const styles = {
  container: { width: "100%", margin: "20px auto", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff" },
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