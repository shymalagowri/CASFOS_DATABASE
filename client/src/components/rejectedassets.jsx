import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/RejectedAssetEntry.css";

const RejectedAsset = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  // Fetch rejected assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/assets/rejectedassets");
        setAssets(response.data);
      } catch (error) {
        console.error("Error fetching rejected assets:", error);
      }
    };
    fetchAssets();
  }, []);

  // Handle view data in popup
  const handleView = (asset) => {
    setSelectedAsset(asset);
  };

  // Handle close action (delete asset)
  const handleClose = async (id) => {
    try {
      console.log("Attempting to delete asset with ID:", id); // Debug log
      const response = await axios.delete(`http://localhost:3001/api/assets/deleteRejectedAsset/${id}`);

      if (response.status === 200 && response.data.success) {
        setAssets(assets.filter((asset) => asset._id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "The Rejected Asset has been deleted.",
          icon: "success",
          confirmButtonText: "OK"
        });
      } else {
        Swal.fire({
          title: "Warning!",
          text: response.data.message || "Deletion completed but with an unexpected response.",
          icon: "warning",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error("Error deleting asset:", error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.message || "Failed to delete the rejected asset.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  return (
    <>
      <div className="rejected">
        <Helmet>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
          <link rel="stylesheet" href="style.css" />
          <title>CASFOS</title>
        </Helmet>

        <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">DATA ENTRY STAFF</span>
          </a>
          <ul className="side-menu top">
            <li><a href={`/dataentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
            <li><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
            <li><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
            <li className="active"><a href={`/rejectedassets?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Rejected Assets</span></a></li>
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
              <div className="overview">
                <h1>Rejected Assets</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Asset Type</th>
                      <th>Asset Category</th>
                      <th>Supplier Name</th>
                      <th>Purchase Date</th>
                      <th>View</th>
                      <th>Close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset._id}>
                        <td>{asset.assetType || "N/A"}</td>
                        <td>{asset.assetCategory || "N/A"}</td>
                        <td>{asset.supplierName || "N/A"}</td>
                        <td>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}</td>
                        <td>
                          <button className="action-button view-button" onClick={() => handleView(asset)}>View</button>
                        </td>
                        <td>
                          <button className="action-button close-button" onClick={() => handleClose(asset._id)}>Close</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </section>

        {/* Popup for viewing asset details */}
        {selectedAsset && (
          <div id="popup" className="popup" style={{ display: "block" }}>
            <div className="popup-content" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <h3>Asset Details</h3>
              <div style={{ textAlign: "left", padding: "10px" }}>
                {selectedAsset.assetCategory === "Building" ? (
                  <>
                    <p><strong>Asset Type:</strong> {selectedAsset.assetType || "N/A"}</p>
                    <p><strong>Asset Category:</strong> {selectedAsset.assetCategory || "N/A"}</p>
                    <p><strong>Entry Date:</strong> {selectedAsset.entryDate ? new Date(selectedAsset.entryDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Sub Category:</strong> {selectedAsset.subCategory || "N/A"}</p>
                    <p><strong>Location:</strong> {selectedAsset.location || "N/A"}</p>
                    <p><strong>Type:</strong> {selectedAsset.type || "N/A"}</p>
                    <p><strong>Building No:</strong> {selectedAsset.buildingNo || "N/A"}</p>
                    <p><strong>Plinth Area:</strong> {selectedAsset.plinthArea || "N/A"}</p>
                    <p><strong>Status:</strong> {selectedAsset.status || "N/A"}</p>
                    <p><strong>Date of Construction:</strong> {selectedAsset.dateOfConstruction ? new Date(selectedAsset.dateOfConstruction).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Cost of Construction:</strong> {selectedAsset.costOfConstruction || "N/A"}</p>
                    <p><strong>Remarks:</strong> {selectedAsset.remarks || "N/A"}</p>
                    <p><strong>Rejection Remarks:</strong> {selectedAsset.rejectionRemarks || "N/A"}</p>
                  </>
                ) : selectedAsset.assetCategory === "Land" ? (
                  <>
                    <p><strong>Asset Type:</strong> {selectedAsset.assetType || "N/A"}</p>
                    <p><strong>Asset Category:</strong> {selectedAsset.assetCategory || "N/A"}</p>
                    <p><strong>Entry Date:</strong> {selectedAsset.entryDate ? new Date(selectedAsset.entryDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Sub Category:</strong> {selectedAsset.subCategory || "N/A"}</p>
                    <p><strong>Location:</strong> {selectedAsset.location || "N/A"}</p>
                    <p><strong>Status:</strong> {selectedAsset.status || "N/A"}</p>
                    <p><strong>Date of Possession:</strong> {selectedAsset.dateOfPossession ? new Date(selectedAsset.dateOfPossession).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Controller/Custody:</strong> {selectedAsset.controllerOrCustody || "N/A"}</p>
                    <p><strong>Details:</strong> {selectedAsset.details || "N/A"}</p>
                    <p><strong>Rejection Remarks:</strong> {selectedAsset.rejectionRemarks || "N/A"}</p>
                  </>
                ) : (
                  // For other categories (Permanent/Consumable)
                  <>
                    <p><strong>Asset Type:</strong> {selectedAsset.assetType || "N/A"}</p>
                    <p><strong>Asset Category:</strong> {selectedAsset.assetCategory || "N/A"}</p>
                    <p><strong>Entry Date:</strong> {selectedAsset.entryDate ? new Date(selectedAsset.entryDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Purchase Date:</strong> {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Supplier Name:</strong> {selectedAsset.supplierName || "N/A"}</p>
                    <p><strong>Supplier Address:</strong> {selectedAsset.supplierAddress || "N/A"}</p>
                    <p><strong>Source:</strong> {selectedAsset.source || "N/A"}</p>
                    <p><strong>Mode of Purchase:</strong> {selectedAsset.modeOfPurchase || "N/A"}</p>
                    <p><strong>Bill No:</strong> {selectedAsset.billNo || "N/A"}</p>
                    <p><strong>Received By:</strong> {selectedAsset.receivedBy || "N/A"}</p>
                    <p><strong>Bill Photo URL:</strong> {selectedAsset.billPhotoUrl || "N/A"}</p>
                    {selectedAsset.items && selectedAsset.items.length > 0 && (
                      <>
                        <h4>Items:</h4>
                        {selectedAsset.items.map((item, index) => (
                          <div key={index} style={{ marginLeft: "20px", marginBottom: "10px" }}>
                            <p><strong>Item {index + 1}:</strong></p>
                            <p>  Name: {item.itemName || "N/A"}</p>
                            <p>  Sub Category: {item.subCategory || "N/A"}</p>
                            <p>  Description: {item.itemDescription || "N/A"}</p>
                            <p>  Quantity Received: {item.quantityReceived || "N/A"}</p>
                            <p>  Unit Price: {item.unitPrice || "N/A"}</p>
                            <p>  Overall Price: {item.overallPrice || "N/A"}</p>
                            <p>  AMC Date: {item.amcDate ? new Date(item.amcDate).toLocaleDateString() : "N/A"}</p>
                            <p>  Item Photo URL: {item.itemPhotoUrl || "N/A"}</p>
                            <p>  Item IDs: {item.itemIds && item.itemIds.length > 0 ? item.itemIds.join(", ") : "N/A"}</p>
                          </div>
                        ))}
                      </>
                    )}
                    <p><strong>Rejection Remarks:</strong> {selectedAsset.rejectionRemarks || "N/A"}</p>
                  </>
                )}
              </div>
              <button className="action-button popup-close-button" onClick={() => setSelectedAsset(null)}>Close Popup</button>
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
    fontSize: "18px",
  },
};

export default RejectedAsset;