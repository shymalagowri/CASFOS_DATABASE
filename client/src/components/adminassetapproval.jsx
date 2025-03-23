import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/style.css"; // Keep this for sidebar and global styles
import { useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";

function AssetApproval() {
  const [purchasedAssets, setPurchasedAssets] = useState([]);
  const [disposalAssets, setDisposalAssets] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [activeTab, setActiveTab] = useState("purchased");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  // Fetch purchased assets
  useEffect(() => {
    if (activeTab === "purchased") {
      axios
        .get("http://localhost:3001/api/assets/getAllAssets")
        .then((response) => {
          setPurchasedAssets(response.data);
        })
        .catch((error) => {
          console.error("Error fetching purchased assets:", error);
        });
    }
  }, [activeTab]);

  // Fetch disposal assets from TempDispose
  useEffect(() => {
    if (activeTab === "disposal") {
      axios
        .get("http://localhost:3001/api/assets/getTempDisposeAssets")
        .then((response) => {
          setDisposalAssets(response.data);
        })
        .catch((error) => {
          console.error("Error fetching disposal assets:", error);
        });
    }
  }, [activeTab]);

  const approveAsset = (id) => {
    axios
      .post(`http://localhost:3001/api/assets/approve/${id}`)
      .then((response) => {
        if (response.status === 201 && response.data.success) {
          setPurchasedAssets(purchasedAssets.filter((asset) => asset._id !== id));
          Swal.fire("Approved!", "The Asset Entry has been Approved.", "success");
        } else {
          Swal.fire("Warning!", "Approval completed but with an unexpected response.", "warning");
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "An error occurred while approving the asset.";
        Swal.fire("Error!", errorMessage, "error");
      });
  };

  const rejectAsset = async (id) => {
    Swal.fire({
      title: "Reject Asset Entry",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter your remark here...",
      inputAttributes: {
        "aria-label": "Enter your remark here",
      },
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      preConfirm: (remark) => {
        if (!remark) {
          Swal.showValidationMessage("Remark is required for rejection.");
        }
        return remark;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`http://localhost:3001/api/assets/reject/${id}`, {
            rejectionRemarks: result.value,
          });

          if (response.status === 200 && response.data.success) {
            setPurchasedAssets(purchasedAssets.filter((asset) => asset._id !== id));
            Swal.fire("Rejected!", "The Asset Entry has been rejected.", "success");
          } else {
            Swal.fire(
              "Warning!",
              response.data.message || "Rejection completed but with an unexpected response.",
              "warning"
            );
          }
        } catch (error) {
          console.error("Error rejecting asset:", error);
          const errorMessage = error.response?.data?.message || "There was an error processing the rejection.";
          Swal.fire("Error!", errorMessage, "error");
        }
      }
    });
  };

  const disposeAsset = async (id) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/assets/dispose/${id}`);
      if (response.status === 200 && response.data.success) {
        setDisposalAssets(disposalAssets.filter((asset) => asset._id !== id));
        Swal.fire("Disposed!", "The asset has been moved to Disposed Assets.", "success");
      } else {
        Swal.fire("Warning!", "Disposal completed but with an unexpected response.", "warning");
      }
    } catch (error) {
      console.error("Error disposing asset:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while disposing the asset.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const cancelDisposal = async (id) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/assets/cancelDisposal/${id}`);
      if (response.status === 200 && response.data.success) {
        setDisposalAssets(disposalAssets.filter((asset) => asset._id !== id));
        Swal.fire("Cancelled!", "The asset has been returned to Returned Permanent.", "success");
      } else {
        Swal.fire("Warning!", "Cancellation completed but with an unexpected response.", "warning");
      }
    } catch (error) {
      console.error("Error cancelling disposal:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while cancelling the disposal.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const renderPurchasedAssetDetails = (asset) => {
    if (!asset) return null;

    if (asset.assetCategory === "Building") {
      return (
        <div style={componentStyles.assetDetails}>
          <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
          <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
          <p><strong>Entry Date:</strong> {asset.entryDate ? new Date(asset.entryDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
          <p><strong>Location:</strong> {asset.location || "N/A"}</p>
          <p><strong>Type:</strong> {asset.type || "N/A"}</p>
          <p><strong>Building No:</strong> {asset.buildingNo || "N/A"}</p>
          <p><strong>Plinth Area:</strong> {asset.plinthArea || "N/A"}</p>
          <p><strong>Status:</strong> {asset.status || "N/A"}</p>
          <p><strong>Date of Construction:</strong> {asset.dateOfConstruction ? new Date(asset.dateOfConstruction).toLocaleDateString() : "N/A"}</p>
          <p><strong>Cost of Construction:</strong> {asset.costOfConstruction || "N/A"}</p>
          <p><strong>Remarks:</strong> {asset.remarks || "N/A"}</p>
        </div>
      );
    } else if (asset.assetCategory === "Land") {
      return (
        <div style={componentStyles.assetDetails}>
          <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
          <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
          <p><strong>Entry Date:</strong> {asset.entryDate ? new Date(asset.entryDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
          <p><strong>Location:</strong> {asset.location || "N/A"}</p>
          <p><strong>Status:</strong> {asset.status || "N/A"}</p>
          <p><strong>Date of Possession:</strong> {asset.dateOfPossession ? new Date(asset.dateOfPossession).toLocaleDateString() : "N/A"}</p>
          <p><strong>Controller/Custody:</strong> {asset.controllerOrCustody || "N/A"}</p>
          <p><strong>Details:</strong> {asset.details || "N/A"}</p>
        </div>
      );
    } else {
      return (
        <div style={componentStyles.assetDetails}>
          <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
          <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
          <p><strong>Entry Date:</strong> {asset.entryDate ? new Date(asset.entryDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>Purchase Date:</strong> {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>Supplier Name:</strong> {asset.supplierName || "N/A"}</p>
          <p><strong>Supplier Address:</strong> {asset.supplierAddress || "N/A"}</p>
          <p><strong>Source:</strong> {asset.source || "N/A"}</p>
          <p><strong>Mode of Purchase:</strong> {asset.modeOfPurchase || "N/A"}</p>
          <p><strong>Bill No:</strong> {asset.billNo || "N/A"}</p>
          <p><strong>Received By:</strong> {asset.receivedBy || "N/A"}</p>
          <p><strong>Bill Photo URL:</strong> {asset.billPhotoUrl ? <a href={asset.billPhotoUrl} target="_blank" rel="noopener noreferrer">View Bill</a> : "N/A"}</p>
          {asset.items && asset.items.length > 0 && (
            <>
              <h4>Items:</h4>
              {asset.items.map((item, index) => (
                <div key={index} style={{ marginLeft: "20px", marginBottom: "10px" }}>
                  <p><strong>Item {index + 1}:</strong></p>
                  <p>  Name: {item.itemName || "N/A"}</p>
                  <p>  Sub Category: {item.subCategory || "N/A"}</p>
                  <p>  Description: {item.itemDescription || "N/A"}</p>
                  <p>  Quantity Received: {item.quantityReceived || "N/A"}</p>
                  <p>  Unit Price: {item.unitPrice || "N/A"}</p>
                  <p>  Overall Price: {item.overallPrice || "N/A"}</p>
                  <p>  AMC Date: {item.amcDate ? new Date(item.amcDate).toLocaleDateString() : "N/A"}</p>
                  <p>  Item Photo URL: {item.itemPhotoUrl ? <a href={item.itemPhotoUrl} target="_blank" rel="noopener noreferrer">View Photo</a> : "N/A"}</p>
                  <p>  Item IDs: {item.itemIds && item.itemIds.length > 0 ? item.itemIds.join(", ") : "N/A"}</p>
                </div>
              ))}
            </>
          )}
        </div>
      );
    }
  };

  const renderDisposalAssetDetails = (asset) => {
    if (!asset) return null;

    return (
      <div style={componentStyles.assetDetails}>
        <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
        <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
        <p><strong>Item Name:</strong> {asset.itemName || "N/A"}</p>
        <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
        <p><strong>Item Description:</strong> {asset.itemDescription || "N/A"}</p>
        <p><strong>Item IDs:</strong> {asset.itemIds && asset.itemIds.length > 0 ? asset.itemIds.join(", ") : "N/A"}</p>
        <p><strong>Purchase Value:</strong> {asset.purchaseValue || "N/A"}</p>
        <p><strong>Book Value:</strong> {asset.bookValue || "N/A"}</p>
        <p><strong>Inspection Date:</strong> {asset.inspectionDate ? new Date(asset.inspectionDate).toLocaleDateString() : "N/A"}</p>
        <p><strong>Condemnation Date:</strong> {asset.condemnationDate ? new Date(asset.condemnationDate).toLocaleDateString() : "N/A"}</p>
        <p><strong>Remark:</strong> {asset.remark || "N/A"}</p>
        <p><strong>Disposal Value:</strong> {asset.disposalValue || "N/A"}</p>
      </div>
    );
  };

  return (
    <div className="asset-approval">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <title>CASFOS</title>

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">ADMIN</span>
        </a>
        <ul className="side-menu top">
          <li>
            <Link to={`/admindashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </Link>
          </li>
          <li>
            <Link to={`/adminuserapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Registration Approval</span>
            </Link>
          </li>
          <li>
            <Link to={`/usermanagement?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">User Management</span>
            </Link>
          </li>
          <li className="active">
            <Link to={`/adminassetapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Asset Approval</span>
            </Link>
          </li>
          <li>
            <Link to={`/adminfacultyapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty Approval</span>
            </Link>
          </li>
          <li>
            <Link to={`/adminassetview?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Asset View</span>
            </Link>
          </li>
          <li>
            <Link to={`/adminfacultyview?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty View</span>
            </Link>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <Link to="/" className="logout">
              <i className="bx bxs-log-out-circle" />
              <span className="text">Logout</span>
            </Link>
          </li>
        </ul>
      </section>

      <section id="content" style={componentStyles.content}>
        <nav style={componentStyles.nav}>
          <i className="bx bx-menu" />
          <span style={componentStyles.headTitle}>Dashboard</span>
          <form action="#">
            <div style={componentStyles.formInput}></div>
          </form>
          <div style={componentStyles.usernameContainer}>
            <i className="bx bxs-user-circle" style={componentStyles.userIcon}></i>
            <span style={componentStyles.username}>{username}</span>
          </div>
        </nav>

        <h2 style={componentStyles.title}>Asset Approval</h2>
        <div style={componentStyles.tabContainer}>
          <button
            style={activeTab === "purchased" ? componentStyles.activeTab : componentStyles.tab}
            onClick={() => setActiveTab("purchased")}
          >
            Purchased
          </button>
          <button
            style={activeTab === "disposal" ? componentStyles.activeTab : componentStyles.tab}
            onClick={() => setActiveTab("disposal")}
          >
            Disposal
          </button>
        </div>

        <div style={componentStyles.container}>
          {activeTab === "purchased" && (
            <table style={componentStyles.advancedTable}>
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Asset Category</th>
                  <th>Supplier Name</th>
                  <th>Date Purchased</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchasedAssets.map((asset) => (
                  <tr key={asset._id}>
                    <td>{asset.assetType || "N/A"}</td>
                    <td>{asset.assetCategory || "N/A"}</td>
                    <td>{asset.supplierName || "N/A"}</td>
                    <td>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <button
                        style={componentStyles.viewButton}
                        onClick={() => setPopupData(asset)}
                      >
                        View
                      </button>
                    </td>
                    <td style={componentStyles.actionCell}>
                      <button
                        style={componentStyles.approveButton}
                        onClick={() => approveAsset(asset._id)}
                      >
                        Approve
                      </button>
                      <button
                        style={componentStyles.rejectButton}
                        onClick={() => rejectAsset(asset._id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "disposal" && (
            <table style={componentStyles.advancedTable}>
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Asset Category</th>
                  <th>Item Name</th>
                  <th>Condemnation Date</th>
                  <th>Remark</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {disposalAssets.map((asset) => (
                  <tr key={asset._id}>
                    <td>{asset.assetType || "N/A"}</td>
                    <td>{asset.assetCategory || "N/A"}</td>
                    <td>{asset.itemName || "N/A"}</td>
                    <td>{asset.condemnationDate ? new Date(asset.condemnationDate).toLocaleDateString() : "N/A"}</td>
                    <td>{asset.remark || "N/A"}</td>
                    <td>
                      <button
                        style={componentStyles.viewButton}
                        onClick={() => setPopupData(asset)}
                      >
                        View
                      </button>
                    </td>
                    <td style={componentStyles.actionCell}>
                      <button
                        style={componentStyles.disposeButton}
                        onClick={() => disposeAsset(asset._id)}
                      >
                        Dispose
                      </button>
                      <button
                        style={componentStyles.cancelButton}
                        onClick={() => cancelDisposal(asset._id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Popup Modal */}
      {popupData && (
        <div style={componentStyles.popupOverlay}>
          <div style={componentStyles.popupContent}>
            <h3>{activeTab === "purchased" ? `${popupData.assetCategory} Details` : "Disposal Asset Details"}</h3>
            <div style={componentStyles.popupScrollableContent}>
              {activeTab === "purchased" ? renderPurchasedAssetDetails(popupData) : renderDisposalAssetDetails(popupData)}
            </div>
            <button style={componentStyles.popupCloseButton} onClick={() => setPopupData(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const componentStyles = {
  content: {},
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" },
  headTitle: { fontSize: "20px", fontWeight: "bold" },
  formInput: {},
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  title: { fontSize: "28px", fontWeight: "bold", marginTop: "50px", marginBottom: "15px", marginLeft: "20px", color: "#333" },
  tabContainer: { display: "flex", gap: "10px", marginBottom: "20px", marginLeft: "20px" },
  tab: { padding: "10px 20px", backgroundColor: "#ddd", border: "none", borderRadius: "5px", cursor: "pointer" },
  activeTab: { padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  container: { maxWidth: "1200px", margin: "15px auto", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff" },

  // Table and content styles
  advancedTable: { width: "100%", borderCollapse: "collapse" },
  assetDetails: {},

  // Button styles
  viewButton: { padding: "6px 12px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  approveButton: { padding: "6px 12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px" },
  rejectButton: { padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  disposeButton: { padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  cancelButton: { padding: "6px 12px", backgroundColor: "#ffc107", color: "#000", border: "none", borderRadius: "4px", cursor: "pointer" },
  actionCell: { display: "flex", gap: "5px", justifyContent: "center" },

  // Popup styles
  popupOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  popupContent: { backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "500px", maxWidth: "90%", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" },
  popupScrollableContent: { maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" },
  popupCloseButton: { marginTop: "15px", padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", alignSelf: "flex-end" },
};

export default AssetApproval;