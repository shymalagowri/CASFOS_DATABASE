/**
 * Overview:
 * The `HooAssetApproval` component is a React functional component designed for the Head of Office (HOO) to approve or reject
 * returned assets in the CASFOS Asset Management System. It fetches assets awaiting HOO approval from a backend API, displays
 * them in a table, and allows the HOO to view detailed asset information in a popup. The component supports approving assets
 * directly or rejecting them with remarks provided through a SweetAlert2 input prompt. It includes a sidebar for navigation and
 * uses inline styles along with external CSS for styling.
 * 
 * Key Features:
 * - Fetches and displays assets awaiting HOO approval.
 * - Allows viewing detailed asset information (e.g., type, category, condition, PDFs) in a popup.
 * - Supports approving assets with a single click.
 * - Prompts for rejection remarks via SweetAlert2 when rejecting an asset.
 * - Includes sidebar navigation for HOO functionalities (e.g., User Approval, Faculty Approval).
 * - Provides user feedback through SweetAlert2 for success and error states.
 * 
 * Dependencies: React, react-helmet, axios, sweetalert2, react-router-dom
 * Backend API: Assumes endpoints for fetching returned assets, approving, and rejecting assets by HOO.
 */

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import "../styles/Style.css";
import "../styles/AssetApproval.css";

const HooAssetApproval = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const serverBaseUrl = `http://${ip}:${port}`;
  const [waitingAssets, setWaitingAssets] = useState([]);
  const [popupData, setPopupData] = useState(null);

  // Fetch waiting assets on component mount
  useEffect(() => {
    const fetchWaitingAssets = async () => {
      try {
        const response = await axios.get(`${serverBaseUrl}/api/assets/getReturnedAssetsForHoo`);
        setWaitingAssets(response.data.data);
      } catch (error) {
        console.error("Error fetching waiting assets:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load assets awaiting HOO approval.",
        });
      }
    };
    fetchWaitingAssets();
  }, [serverBaseUrl]);

  // Handle approval action
  const handleApprove = async (id, assetType) => {
    try {
      const response = await axios.put(`${serverBaseUrl}/api/assets/approveReturnByHoo/${id}`, {
        assetType,
      });
      setWaitingAssets((prev) => prev.filter((asset) => asset._id !== id));
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Asset approved by HOO.",
      });
    } catch (error) {
      console.error("Error approving asset:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve asset.",
      });
    }
  };

  // Handle rejection action with Swal prompt
  const handleReject = async (id, assetType) => {
    const result = await Swal.fire({
      title: "Reject Asset",
      text: "Please provide remarks for rejection:",
      input: "textarea",
      inputPlaceholder: "Enter rejection remarks...",
      inputAttributes: {
        "aria-label": "Rejection remarks",
      },
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      inputValidator: (value) => {
        if (!value) {
          return "You must provide rejection remarks!";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        const remarks = result.value || "Rejected by HOO";
        await axios.put(`${serverBaseUrl}/api/assets/rejectReturnByHoo/${id}`, {
          rejectionRemarks: remarks,
          assetType,
        });
        setWaitingAssets((prev) => prev.filter((asset) => asset._id !== id));
        Swal.fire({
          icon: "info",
          title: "Rejected",
          text: "Asset rejection notified to entry staff.",
        });
      } catch (error) {
        console.error("Error rejecting asset:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to reject asset.",
        });
      }
    }
  };

  // Render asset details in popup
  const renderAssetDetails = (asset) => {
    if (!asset) return null;

    const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");
    const renderLink = (url, label) =>
      url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#007BFF" }}>
          {label}
        </a>
      ) : "N/A";

    return (
      <table style={componentStyles.detailsTable}>
        <tbody>
          <tr style={componentStyles.evenRow}>
            <td>Asset Type</td>
            <td>{asset.assetType || "N/A"}</td>
          </tr>
          <tr style={componentStyles.oddRow}>
            <td>Asset Category</td>
            <td>{asset.assetCategory || "N/A"}</td>
          </tr>
          <tr style={componentStyles.evenRow}>
            <td>Item Name</td>
            <td>{asset.itemName || "N/A"}</td>
          </tr>
          <tr style={componentStyles.oddRow}>
            <td>Sub Category</td>
            <td>{asset.subCategory || "N/A"}</td>
          </tr>
          <tr style={componentStyles.evenRow}>
            <td>Returned From</td>
            <td>{asset.location || "N/A"}</td>
          </tr>
          {asset.assetType === "Permanent" ? (
            <tr style={componentStyles.oddRow}>
              <td>Item ID</td>
              <td>{asset.itemId || "N/A"}</td>
            </tr>
          ) : (
            <tr style={componentStyles.oddRow}>
              <td>Returned Quantity</td>
              <td>{asset.returnQuantity || "N/A"}</td>
            </tr>
          )}
          <tr style={componentStyles.evenRow}>
            <td>Condition</td>
            <td>{asset.status || "N/A"}</td>
          </tr>
          <tr style={componentStyles.oddRow}>
            <td>Remark</td>
            <td>{asset.remark || "N/A"}</td>
          </tr>
          <tr style={componentStyles.evenRow}>
            <td>Receipt PDF</td>
            <td>{renderLink(asset.pdfUrl, "View Receipt")}</td>
          </tr>
          <tr style={componentStyles.oddRow}>
            <td>Signed Receipt</td>
            <td>{renderLink(asset.signedPdfUrl, "View Signed Receipt")}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="asset-approval">
      <Helmet>
        <title>CASFOS - HOO Asset Approval</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      </Helmet>

      {/* Sidebar */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">HEAD OF OFFICE</span>
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">User Approval</span>
            </a>
          </li>
          <li className="active">
            <a href={`/hooassetapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Faculty Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Faculty Updation</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}>
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

      {/* Main Content */}
      <section id="content" style={componentStyles.content}>
        <nav style={componentStyles.nav}>
          <i className="bx bx-menu" />
          <div style={componentStyles.usernameContainer}>
            <i className="bx bxs-user-circle" style={componentStyles.userIcon}></i>
            <span style={componentStyles.username}>{username}</span>
          </div>
        </nav>

        <h2 style={componentStyles.title}>Asset Disposal Approval</h2>

        <div style={componentStyles.container}>
          <table className="advanced-table">
            <thead>
              <tr>
                <th>Asset Type</th>
                <th>Asset Category</th>
                <th>Item Name</th>
                <th>Returned From</th>
                <th>Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {waitingAssets.length > 0 ? (
                waitingAssets.map((asset) => (
                  <tr key={asset._id}>
                    <td>{asset.assetType || "N/A"}</td>
                    <td>{asset.assetCategory || "N/A"}</td>
                    <td>{asset.itemName || "N/A"}</td>
                    <td>{asset.location || "N/A"}</td>
                    <td>
                      <button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>
                        View
                      </button>
                    </td>
                    <td style={componentStyles.actionCell}>
                      <button
                        style={componentStyles.approveButton}
                        onClick={() => handleApprove(asset._id, asset.assetType)}
                      >
                        Approve
                      </button>
                      <button
                        style={componentStyles.rejectButton}
                        onClick={() => handleReject(asset._id, asset.assetType)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No assets awaiting approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Popup for Details */}
      {popupData && (
        <div style={componentStyles.popupOverlay}>
          <div style={componentStyles.popupContent}>
            <h3>Asset Details</h3>
            <div style={componentStyles.popupScrollableContent}>
              {renderAssetDetails(popupData)}
            </div>
            <button style={componentStyles.popupCloseButton} onClick={() => setPopupData(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const componentStyles = {
  content: {},
  container: {
    maxWidth: "1200px",
    margin: "15px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  title: { fontSize: "28px", fontWeight: "bold", marginTop: "50px", marginBottom: "15px", marginLeft: "20px", color: "#333" },
  viewButton: { padding: "8px 16px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  approveButton: { padding: "8px 16px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  rejectButton: { padding: "8px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  actionCell: { display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" },
  popupOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  popupContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "500px",
    maxWidth: "90%",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  popupScrollableContent: {
    maxHeight: "60vh",
    overflowY: "auto",
    paddingRight: "10px",
  },
  popupCloseButton: {
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    alignSelf: "center",
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
};

export default HooAssetApproval;