import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const AssetReturn = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [storeItems, setStoreItems] = useState([]);
  const [returnItem, setReturnItem] = useState({ location: "", returnQuantity: 0, condition: "", issuedQuantity: 0, returnIds: [] });
  const [issuedIds, setIssuedIds] = useState([]);

  const permanentAssetOptions = ["Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods", "Fabrics", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"];
  const consumableAssetOptions = ["Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items", "Sanitory Items", "Sports Goods", "Fabrics", "Instruments"];
  const issuedToOptions = ["faculty_chamber", "officer_quarters", "staff_quarters", "corbett_hall", "champion_hall", "gis_lab", "van_vatika", "hostel", "officers_mess", "van_sakthi", "library", "classroom", "office_room", "officers_lounge", "gymnasium"];
  const conditionOptions = ["Good", "Servicable"];

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
    if (assetType && assetCategory && selectedItem && returnItem.location) {
      const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
      const fetchIssuedData = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getIssuedIds", { 
            assetType, 
            assetCategory, 
            itemName, 
            subCategory, 
            itemDescription, 
            location: returnItem.location 
          });
          if (assetType === "Permanent") {
            setIssuedIds(response.data.issuedIds || []);
          } else {
            setIssuedIds([]); // No IDs for Consumable
          }
          setReturnItem((prev) => ({ ...prev, issuedQuantity: response.data.quantity || 0 }));
        } catch (error) {
          console.error("Failed to fetch issued data:", error);
          setIssuedIds([]);
          setReturnItem((prev) => ({ ...prev, issuedQuantity: 0 }));
        }
      };
      fetchIssuedData();
    }
  }, [assetType, assetCategory, selectedItem, returnItem.location]);

  const handleReturnItemChange = (field, value) => {
    setReturnItem((prev) => {
      if (field === "returnQuantity") {
        const newQuantity = parseInt(value, 10) || 0;
        const limitedIds = prev.returnIds.slice(0, newQuantity); // Limit returnIds to new quantity
        return { ...prev, returnQuantity: newQuantity, returnIds: limitedIds };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleReturnIdSelection = (id, checked) => {
    setReturnItem((prev) => {
      if (checked && prev.returnIds.length >= prev.returnQuantity) {
        return prev; // Prevent adding more IDs than returnQuantity
      }
      return {
        ...prev,
        returnIds: checked ? [...prev.returnIds, id] : prev.returnIds.filter((selectedId) => selectedId !== id),
      };
    });
  };
  const handleSelectAll = (checked) => {
    setReturnItem((prev) => {
      const maxSelectable = prev.returnQuantity;
      return {
        ...prev,
        returnIds: checked ? issuedIds.slice(0, Math.min(maxSelectable, issuedIds.length)) : [],
      };
    });
  };
  const handleSubmitReturn = async () => {
    if (!selectedItem || !returnItem.location || returnItem.returnQuantity <= 0 || !returnItem.condition) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields and ensure return quantity is greater than 0!" });
      return;
    }

    if (returnItem.returnQuantity > returnItem.issuedQuantity) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Return quantity cannot exceed issued quantity!" });
      return;
    }

    if (assetType === "Permanent" && returnItem.returnIds.length !== returnItem.returnQuantity) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Selected IDs must match return quantity for Permanent assets!" });
      return;
    }

    const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
    const returnData = { 
      assetType, 
      assetCategory, 
      itemName, 
      subCategory, 
      itemDescription, 
      location: returnItem.location, 
      returnQuantity: returnItem.returnQuantity, 
      condition: returnItem.condition, 
      returnIds: assetType === "Permanent" ? returnItem.returnIds : undefined // Only include IDs for Permanent
    };

    try {
      await axios.post("http://localhost:3001/api/assets/return", returnData);
      Swal.fire({ icon: "success", title: "Success!", text: "Items returned successfully!" });
      resetReturnForm();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: error.response?.data?.message || "Failed to return items!" });
      console.error(error);
    }
  };

  const resetReturnForm = () => {
    setAssetCategory("");
    setSelectedItem("");
    setReturnItem({ location: "", returnQuantity: 0, condition: "", issuedQuantity: 0, returnIds: [] });
    setIssuedIds([]);
  };

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="style.css" />
        <title>CASFOS - Asset Return</title>
      </Helmet>

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">DATA ENTRY STAFF</span>
        </a>
        <ul className="side-menu top">
          <li><a href={`/dataentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
          <li><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
          <li><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
          <li className="active"><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
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
            <h2>Asset Return System</h2>
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
                  <label>Location:</label>
                  <select value={returnItem.location} onChange={(e) => handleReturnItemChange("location", e.target.value)} style={styles.input}>
                    <option value="">Select Location</option>
                    {issuedToOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label>Issued Quantity:</label>
                  <input type="number" value={returnItem.issuedQuantity} disabled style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label>Return Quantity:</label>
                  <input type="number" value={returnItem.returnQuantity} onChange={(e) => handleReturnItemChange("returnQuantity", e.target.value)} style={styles.input} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label>Condition:</label>
                  <select value={returnItem.condition} onChange={(e) => handleReturnItemChange("condition", e.target.value)} style={styles.input}>
                    <option value="">Select Condition</option>
                    {conditionOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {assetType === "Permanent" && (
  <div style={styles.inputGroup}>
    <label>Select Return IDs:</label>
    <div style={styles.checkboxContainer}>
      <label>
        <input
          type="checkbox"
          checked={returnItem.returnIds.length === issuedIds.length && issuedIds.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
        Select All
      </label>
      {issuedIds.map((id) => (
        <label key={id} style={styles.checkboxLabel}>
          <input 
            type="checkbox" 
            checked={returnItem.returnIds.includes(id)} 
            onChange={(e) => handleReturnIdSelection(id, e.target.checked)}
            disabled={returnItem.returnIds.length >= returnItem.returnQuantity && !returnItem.returnIds.includes(id)}
          />
          {id}
        </label>
      ))}
    </div>
  </div>
)}
              </div>
              <div style={styles.buttonContainer}>
                <button onClick={handleSubmitReturn} style={styles.button}>Submit</button>
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
  inputGroup: { display: "flex", flexDirection: "column" },
  buttonContainer: { display: "flex", gap: "10px", justifyContent: "flex-start" },
  button: { padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  checkboxContainer: { display: "flex", flexDirection: "column", maxHeight: "150px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" },
  checkboxLabel: { margin: "5px 0" },
};

export default AssetReturn;