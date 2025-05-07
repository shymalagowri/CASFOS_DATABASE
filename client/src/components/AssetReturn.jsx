/**
 * Overview:
 * The `AssetReturn` component is a React functional component designed for managing asset returns in an Asset Management System.
 * It allows users to return assets (Permanent or Consumable) by selecting asset details, specifying return quantities, and handling
 * asset IDs for Permanent assets. The component supports editing rejected returns, fetching data from a backend API, and displaying
 * user-friendly alerts using SweetAlert2. It integrates with React Router for navigation and uses Axios for API requests.
 * Key features include:
 * - Dynamic dropdowns for asset type, category, and item selection.
 * - Location-based issued quantity retrieval.
 * - Handling of asset IDs for Permanent assets with a "Select All" option.
 * - Form validation and error handling.
 * - Styling with inline styles and integration with an external CSS file.
 * - Sidebar navigation for storekeeper functionalities.
 * - Support for editing previously rejected returns using a `rejectedId` query parameter.
 * 
 * Dependencies: React, react-helmet, axios, react-router-dom, sweetalert2
 * Backend API: Assumes endpoints for fetching store items, issued locations, issued IDs, and handling returns.
 */

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

// Component definition
const AssetReturn = () => {
  // State and navigation setup
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const rejectedId = queryParams.get("rejectedId");

  // Component state
  const [issuedLocations, setIssuedLocations] = useState([]);
  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [storeItems, setStoreItems] = useState([]);
  const [returnItem, setReturnItem] = useState({
    location: "",
    returnQuantity: 0,
    issuedQuantity: 0,
    returnIds: [],
  });
  const [issuedIds, setIssuedIds] = useState([]);
  const [isEditingRejected, setIsEditingRejected] = useState(false);

  // Asset options
  const permanentAssetOptions = [
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

  // Fetch issued locations when asset details change
  useEffect(() => {
    if (assetType && assetCategory && selectedItem) {
      const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
      const fetchIssuedLocations = async () => {
        try {
          const response = await axios.post(
            `http://${ip}:${port}/api/assets/getIssuedLocations`,
            {
              assetType,
              assetCategory,
              itemName,
              subCategory,
              itemDescription,
            }
          );
          setIssuedLocations(response.data.locations || []);
        } catch (error) {
          console.error("Failed to fetch issued locations:", error);
          setIssuedLocations([]);
        }
      };
      fetchIssuedLocations();
    }
  }, [assetType, assetCategory, selectedItem]);

  // Fetch store items when asset type or category changes
  useEffect(() => {
    if (assetType && assetCategory) {
      const fetchStoreItems = async () => {
        try {
          const response = await axios.post(
            `http://${ip}:${port}/api/assets/getStoreItems`,
            { assetType, assetCategory }
          );
          setStoreItems(response.data.items || []);
        } catch (error) {
          console.error("Failed to fetch store items:", error);
          setStoreItems([]);
        }
      };
      fetchStoreItems();
    }
  }, [assetType, assetCategory]);

  // Fetch issued IDs and quantities when location is selected
  useEffect(() => {
    if (assetType && assetCategory && selectedItem && returnItem.location) {
      const [itemName, subCategory, itemDescription] = selectedItem.split(" - ");
      const fetchIssuedData = async () => {
        try {
          const response = await axios.post(
            `http://${ip}:${port}/api/assets/getIssuedIds`,
            {
              assetType,
              assetCategory,
              itemName,
              subCategory,
              itemDescription,
              location: returnItem.location,
            }
          );
          setIssuedIds(assetType === "Permanent" ? response.data.issuedIds || [] : []);
          setReturnItem((prev) => ({
            ...prev,
            issuedQuantity: response.data.quantity || 0,
          }));
        } catch (error) {
          console.error("Failed to fetch issued data:", error);
          setIssuedIds([]);
          setReturnItem((prev) => ({ ...prev, issuedQuantity: 0 }));
        }
      };
      fetchIssuedData();
    }
  }, [assetType, assetCategory, selectedItem, returnItem.location]);

  // Load rejected return data if rejectedId is provided
  useEffect(() => {
    if (rejectedId) {
      const fetchRejectedReturn = async () => {
        try {
          const response = await axios.get(
            `http://${ip}:${port}/api/assets/rejected-asset/${rejectedId}`
          );
          const rejectedAsset = response.data.data;

          const returnIds =
            rejectedAsset.returnIds ||
            rejectedAsset.issuedIds ||
            (rejectedAsset.itemId ? [rejectedAsset.itemId] : []);

          setAssetType(rejectedAsset.assetType || "Permanent");
          setAssetCategory(rejectedAsset.assetCategory || "");
          setSelectedItem(
            `${rejectedAsset.itemName} - ${rejectedAsset.subCategory} - ${rejectedAsset.itemDescription}`
          );
          setReturnItem({
            location: rejectedAsset.location || "",
            returnQuantity: returnIds.length,
            issuedQuantity: rejectedAsset.quantity || 0,
            returnIds,
          });
          setIsEditingRejected(true);
          Swal.fire({
            icon: "info",
            title: "Editing Rejected Return",
            text: "You are now editing a rejected return. Update the details and resubmit.",
          });
        } catch (error) {
          console.error("Failed to fetch rejected return:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load rejected return data.",
          });
        }
      };
      fetchRejectedReturn();
    }
  }, [rejectedId]);

  // Handlers for form inputs
  const handleReturnItemChange = (field, value) => {
    setReturnItem((prev) => {
      if (field === "returnQuantity") {
        const newQuantity = parseInt(value, 10) || 0;
        const limitedIds = prev.returnIds.slice(0, newQuantity);
        return { ...prev, returnQuantity: newQuantity, returnIds: limitedIds };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleReturnIdSelection = (id, checked) => {
    setReturnItem((prev) => {
      if (checked && prev.returnIds.length >= prev.returnQuantity) {
        return prev;
      }
      return {
        ...prev,
        returnIds: checked
          ? [...prev.returnIds, id]
          : prev.returnIds.filter((selectedId) => selectedId !== id),
      };
    });
  };

  const handleSelectAll = (checked) => {
    setReturnItem((prev) => {
      const maxSelectable = prev.returnQuantity;
      return {
        ...prev,
        returnIds: checked
          ? issuedIds.slice(0, Math.min(maxSelectable, issuedIds.length))
          : [],
      };
    });
  };

  // Submit return form
  const handleSubmitReturn = async () => {
    if (!selectedItem || !returnItem.location || returnItem.returnQuantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please fill all fields and ensure return quantity is greater than 0!",
      });
      return;
    }

    if (returnItem.returnQuantity > returnItem.issuedQuantity) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Return quantity cannot exceed issued quantity!",
      });
      return;
    }

    if (
      assetType === "Permanent" &&
      returnItem.returnIds.length !== returnItem.returnQuantity
    ) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Selected IDs must match return quantity for Permanent assets!",
      });
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
      returnIds: assetType === "Permanent" ? returnItem.returnIds : undefined,
    };

    try {
      await axios.post(`http://${ip}:${port}/api/assets/return`, returnData);
      if (isEditingRejected && rejectedId) {
        await axios.delete(
          `http://${ip}:${port}/api/assets/rejected-asset/${rejectedId}`
        );
      }
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Items returned successfully!",
      });
      resetReturnForm();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to return items!",
      });
      console.error(error);
    }
  };

  // Reset form fields
  const resetReturnForm = () => {
    setAssetCategory("");
    setSelectedItem("");
    setReturnItem({ location: "", returnQuantity: 0, issuedQuantity: 0, returnIds: [] });
    setIssuedIds([]);
    setIssuedLocations([]);
    setIsEditingRejected(false);
  };

  // Inline styles
  const styles = {
    container: {
      width: "100%",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
    },
    formContainer: { display: "flex", flexDirection: "column", gap: "20px" },
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" },
    input: { padding: "8px", borderRadius: "5px", border: "1px solid #ddd", width: "100%" },
    inputGroup: { display: "flex", flexDirection: "column" },
    buttonContainer: { display: "flex", gap: "10px", justifyContent: "flex-start" },
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
    },
    usernameContainer: { display: "flex", alignItems: "center", gap: "10px" },
    userIcon: { fontSize: "30px", color: "#007BFF" },
    username: { fontWeight: "bold", fontSize: "18px" },
    checkboxContainer: {
      display: "flex",
      flexDirection: "column",
      maxHeight: "150px",
      overflowY: "auto",
      border: "1px solid #ddd",
      padding: "10px",
      borderRadius: "5px",
    },
    checkboxLabel: { margin: "5px 0" },
  };

  // JSX structure
  return (
    <>
      {/* Helmet for metadata */}
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="style.css" />
        <title>CASFOS - Asset Return</title>
      </Helmet>

      {/* Sidebar navigation */}
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
          <li>
            <a href={`/assetissue?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Asset Issue</span>
            </a>
          </li>
          <li className="active">
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
        <nav>
          <i className="bx bx-menu" />
          <form action="#">
            <div className="form-input"></div>
          </form>
          <div style={styles.usernameContainer}>
            <i className="bx bxs-user-circle" style={styles.userIcon}></i>
            <span style={styles.username}>{username}</span>
          </div>
        </nav>

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
                <strong>Editing Rejected Return</strong>: Update the details below and resubmit.
              </div>
            )}
            <div style={styles.formContainer}>
              {/* Asset selection */}
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
                    {(assetType === "Permanent"
                      ? permanentAssetOptions
                      : consumableAssetOptions
                    ).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
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
              {/* Quantity and location */}
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label>Location:</label>
                  <select
                    value={returnItem.location}
                    onChange={(e) => handleReturnItemChange("location", e.target.value)}
                    style={styles.input}
                  >
                    <option value="">Select Location</option>
                    {issuedLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label>Issued Quantity:</label>
                  <input
                    type="number"
                    value={returnItem.issuedQuantity}
                    disabled
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label>Return Quantity:</label>
                  <input
                    type="number"
                    value={returnItem.returnQuantity}
                    onChange={(e) =>
                      handleReturnItemChange("returnQuantity", e.target.value)
                    }
                    style={styles.input}
                  />
                </div>
              </div>
              {/* Return IDs for Permanent assets */}
              {assetType === "Permanent" && (
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Select Return IDs:</label>
                    <div style={styles.checkboxContainer}>
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            returnItem.returnIds.length === issuedIds.length &&
                            issuedIds.length > 0
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        Select All
                      </label>
                      {issuedIds.map((id) => (
                        <label key={id} style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={returnItem.returnIds.includes(id)}
                            onChange={(e) =>
                              handleReturnIdSelection(id, e.target.checked)
                            }
                            disabled={
                              returnItem.returnIds.length >=
                                returnItem.returnQuantity &&
                              !returnItem.returnIds.includes(id)
                            }
                          />
                          {id}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Submit button */}
              <div style={styles.buttonContainer}>
                <button onClick={handleSubmitReturn} style={styles.button}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

// Export component
export default AssetReturn;