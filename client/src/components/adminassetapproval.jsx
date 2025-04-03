import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/style.css";
import { useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";

function AssetApproval() {
  const [purchasedAssets, setPurchasedAssets] = useState([]);
  const [exchangedAssets, setExchangedAssets] = useState([]);
  const [disposalAssets, setDisposalAssets] = useState([]);
  const [returnAssets, setReturnAssets] = useState([]); // Add state for return assets
  const [issueAssets, setIssueAssets] = useState([]); // New state for issued assets
  const [popupData, setPopupData] = useState(null);
  const [serviceAssets, setServiceAssets] = useState([]); // New state for service assets
  const [activeTab, setActiveTab] = useState("purchased");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const serverBaseUrl = "http://localhost:3001"; // Define server base URL
  // Fetch exchanged assets
useEffect(() => {
  if (activeTab === "exchange") {
    axios.get(`${serverBaseUrl}/api/assets/getExchangedForApproval`)
      .then(response => {
        setExchangedAssets(response.data);
      })
      .catch(error => {
        console.error("Error fetching exchanged assets:", error);
        Swal.fire("Error!", "Failed to load exchanged assets", "error");
      });
  }
}, [activeTab]);
useEffect(() => {
  if (activeTab === "service") {
    axios
      .get(`${serverBaseUrl}/api/assets/getTempServiced`)
      .then((response) => {
        setServiceAssets(response.data);
      })
      .catch((error) => {
        console.error("Error fetching service assets:", error);
        Swal.fire("Error!", "Failed to load service assets", "error");
      });
  }
}, [activeTab]);
const approveService = async (id) => {
  try {
    const response = await axios.post(`${serverBaseUrl}/api/assets/approveService/${id}`);
    if (response.status === 200 && response.data.success) {
      setServiceAssets(serviceAssets.filter((asset) => asset._id !== id));
      Swal.fire("Approved!", "The service has been approved and moved to Serviced Assets.", "success");
    }
  } catch (error) {
    Swal.fire("Error!", "Failed to approve service.", "error");
    console.error(error);
  }
};

// Reject service asset
const rejectService = async (id) => {
  Swal.fire({
    title: "Reject Service Entry",
    input: "textarea",
    inputLabel: "Reason for rejection",
    inputPlaceholder: "Enter your remark here...",
    inputAttributes: { "aria-label": "Enter your remark here" },
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
        const response = await axios.post(`${serverBaseUrl}/api/assets/rejectService/${id}`, {
          rejectionRemarks: result.value,
        });
        if (response.status === 200 && response.data.success) {
          setServiceAssets(serviceAssets.filter((asset) => asset._id !== id));
          Swal.fire("Rejected!", "The service has been rejected and moved back to Returned.", "success");
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to reject service.", "error");
        console.error(error);
      }
    }
  });
};

  useEffect(() => {
    if (activeTab === "return") {
      // Fetch both Permanent and Consumable returned assets
      Promise.all([
        axios.get(`${serverBaseUrl}/api/assets/getReturnedForApproval`, { params: { assetType: "Permanent" } }),
        axios.get(`${serverBaseUrl}/api/assets/getReturnedForApproval`, { params: { assetType: "Consumable" } }),
      ])
        .then(([permResponse, consResponse]) => {
          const permAssets = permResponse.data.map((asset) => ({
            ...asset,
            newCondition:
              asset.status === "service" ? "To Be Serviced" :
              asset.status === "dispose" ? "To Be Disposed" :
              "N/A",
          }));
          const consAssets = consResponse.data.map((asset) => ({
            ...asset,
            newCondition:
              asset.status === "exchange" ? "To Be Exchanged" :
              asset.status === "dispose" ? "To Be Disposed" :
              "N/A",
          }));
          setReturnAssets([...permAssets, ...consAssets]);
        })
        .catch((error) => console.error("Error fetching return assets:", error));
    }
  }, [activeTab]);
  const [searchTerm, setSearchTerm] = useState("");
const [displaySearchTerm, setDisplaySearchTerm] = useState("");

useEffect(() => {
  const handler = setTimeout(() => {
    setDisplaySearchTerm(searchTerm);
  }, 300); // 300ms delay

  return () => {
    clearTimeout(handler);
  };
}, [searchTerm]);

// Then use displaySearchTerm in your filter instead of searchTerm
const filteredReturnAssets = returnAssets
  .filter(asset => 
    asset.itemName?.toLowerCase().includes(displaySearchTerm.toLowerCase())
  )
  .sort((a, b) => 
    (a.itemName || "").localeCompare(b.itemName || "")
  );
  const approveReturn = async (id, newCondition) => {
    try {
      const condition =
        newCondition === "To Be Serviced" ? "service" :
        newCondition === "To Be Disposed" ? "dispose" :
        newCondition === "To Be Exchanged" ? "exchange" : null;
  
      if (!condition) {
        Swal.fire("Error!", "Invalid condition selected.", "error");
        return;
      }
  
      const asset = returnAssets.find((a) => a._id === id);
      const response = await axios.post(`${serverBaseUrl}/api/assets/approveReturn/${id}`, {
        condition,
        assetType: asset.assetType,
        ...(asset.assetType === "Consumable" && { returnedQuantity: asset.returnQuantity }),
      });
  
      if (response.status === 200 && response.data.success) {
        setReturnAssets(returnAssets.filter((asset) => asset._id !== id));
        Swal.fire("Approved!", `The return has been approved as ${newCondition}.`, "success");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to approve return.", "error");
      console.error(error);
    }
  };
  const approveExchange = async (id) => {
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/approveExchange/${id}`);
      if (response.status === 200 && response.data.success) {
        setExchangedAssets(exchangedAssets.filter(asset => asset._id !== id));
        Swal.fire("Approved!", "The exchange has been approved and quantity added to stock.", "success");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to approve exchange.", "error");
      console.error(error);
    }
  };
  
  const rejectExchange = async (id) => {
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/rejectExchange/${id}`);
      if (response.status === 200 && response.data.success) {
        setExchangedAssets(exchangedAssets.filter(asset => asset._id !== id));
        Swal.fire("Rejected!", "The exchange has been rejected and moved to disposal.", "success");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to reject exchange.", "error");
      console.error(error);
    }
  };
  const rejectReturn = async (id) => {
    Swal.fire({
      title: "Reject Return",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter your rejection remark here...",
      inputAttributes: { "aria-label": "Enter your rejection remark here" },
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
          const response = await axios.post(`${serverBaseUrl}/api/assets/rejectReturn/${id}`, {
            rejectionRemarks: result.value, // Use the user-entered remark
            assetType: "Permanent" // Adjust dynamically if needed
          });
          if (response.status === 200 && response.data.success) {
            // Filter out assets that are rejected
            setReturnAssets(returnAssets.filter((asset) => asset._id !== id || asset.approved !== "no"));
            Swal.fire("Rejected!", "The return has been rejected.", "success");
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to reject return.", "error");
        }
      }
    });
  };
  
  // Update handleConditionChange (unchanged, but included for clarity)
  const handleConditionChange = (index, value) => {
    setReturnAssets(prev => prev.map((asset, i) => 
      i === index ? { ...asset, newCondition: value } : asset
    ));
    Swal.fire({
      icon: "info",
      title: "Condition Changed",
      text: `Condition changed to ${value}. Entry staff notified.`,
    });
    // Optional: Add backend notification here if needed
  };
  const renderReturnAssetDetails = (asset) => {
    if (!asset) return null;
    return (
      <div style={componentStyles.assetDetails}>
        <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
        <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
        <p><strong>Item Name:</strong> {asset.itemName || "N/A"}</p>
        <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
        <p><strong>Item Description:</strong> {asset.itemDescription || "N/A"}</p>
        <p><strong>Returned From:</strong> {asset.location || "N/A"}</p>
        {asset.assetType === "Permanent" ? (
          <p><strong>Item ID:</strong> {asset.itemId || "N/A"}</p>
        ) : (
          <p><strong>Returned Quantity:</strong> {asset.returnQuantity || "N/A"}</p>
        )}
        <p><strong>Condition:</strong> {asset.status || "N/A"}</p>
        <p><strong>Remark:</strong> {asset.remark || "N/A"}</p>
        <p><strong>Receipt PDF:</strong> <a href={asset.pdfUrl} target="_blank" rel="noopener noreferrer">View Receipt</a></p>
        <p><strong>Signed PDF:</strong> <a href={asset.signedPdfUrl} target="_blank" rel="noopener noreferrer">View Signed</a></p>
      </div>
    );
  };

  const renderServiceAssetDetails = (asset) => {
    if (!asset) return null;
    return (
      <div style={componentStyles.assetDetails}>
        <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
        <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
        <p><strong>Item Name:</strong> {asset.itemName || "N/A"}</p>
        <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
        <p><strong>Item Description:</strong> {asset.itemDescription || "N/A"}</p>
        <p><strong>Item IDs:</strong> {asset.itemIds && asset.itemIds.length > 0 ? asset.itemIds.join(", ") : "N/A"}</p>
        <p><strong>Service No:</strong> {asset.serviceNo || "N/A"}</p>
        <p><strong>Service Date:</strong> {asset.serviceDate ? new Date(asset.serviceDate).toLocaleDateString() : "N/A"}</p>
        <p><strong>Service Amount:</strong> {asset.serviceAmount || "N/A"}</p>
      </div>
    );
  };
  const renderExchangeAssetDetails = (asset) => {
    if (!asset) return null;
    return (
      <div style={componentStyles.assetDetails}>
        <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
        <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
        <p><strong>Item Name:</strong> {asset.itemName || "N/A"}</p>
        <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
        <p><strong>Item Description:</strong> {asset.itemDescription || "N/A"}</p>
        <p><strong>Returned Quantity:</strong> {asset.returnedQuantity || "N/A"}</p>
        <p><strong>Exchange Date:</strong> {asset.exchangeDate ? new Date(asset.exchangeDate).toLocaleDateString() : "N/A"}</p>
        <p><strong>Remark:</strong> {asset.remark || "N/A"}</p>
        <p><strong>Receipt PDF:</strong> {asset.pdfUrl ? <a href={asset.pdfUrl} target="_blank" rel="noopener noreferrer">View</a> : "N/A"}</p>
        <p><strong>Signed PDF:</strong> {asset.signedPdfUrl ? <a href={asset.signedPdfUrl} target="_blank" rel="noopener noreferrer">View</a> : "N/A"}</p>
      </div>
    );
  };
  // Fetch purchased assets
  useEffect(() => {
    if (activeTab === "purchased") {
      axios
        .get(`${serverBaseUrl}/api/assets/getAllAssets`)
        .then((response) => {
          setPurchasedAssets(response.data);
        })
        .catch((error) => {
          console.error("Error fetching purchased assets:", error);
        });
    }
  }, [activeTab]);

  // Fetch disposal assets
  useEffect(() => {
    if (activeTab === "disposal") {
      axios
        .get(`${serverBaseUrl}/api/assets/getTempDisposeAssets`)
        .then((response) => {
          setDisposalAssets(response.data);
        })
        .catch((error) => {
          console.error("Error fetching disposal assets:", error);
        });
    }
  }, [activeTab]);

  // Fetch acknowledged issued assets
  useEffect(() => {
    if (activeTab === "issue") {
      axios
        .get(`${serverBaseUrl}/api/assets/getAcknowledgedTempIssues`)
        .then((response) => {
          setIssueAssets(response.data);
        })
        .catch((error) => {
          console.error("Error fetching acknowledged issue assets:", error);
        });
    }
  }, [activeTab]);

  const approveAsset = (id) => {
    axios
      .post(`${serverBaseUrl}/api/assets/approve/${id}`)
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
      inputAttributes: { "aria-label": "Enter your remark here" },
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
          const response = await axios.post(`${serverBaseUrl}/api/assets/reject/${id}`, {
            rejectionRemarks: result.value,
          });
          if (response.status === 200 && response.data.success) {
            setPurchasedAssets(purchasedAssets.filter((asset) => asset._id !== id));
            Swal.fire("Rejected!", "The Asset Entry has been rejected.", "success");
          } else {
            Swal.fire("Warning!", response.data.message || "Rejection completed but with an unexpected response.", "warning");
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "There was an error processing the rejection.";
          Swal.fire("Error!", errorMessage, "error");
        }
      }
    });
  };

  const disposeAsset = async (id) => {
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/dispose/${id}`);
      if (response.status === 200 && response.data.success) {
        setDisposalAssets(disposalAssets.filter((asset) => asset._id !== id));
        Swal.fire("Disposed!", "The asset has been moved to Disposed Assets.", "success");
      } else {
        Swal.fire("Warning!", "Disposal completed but with an unexpected response.", "warning");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while disposing the asset.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const cancelDisposal = async (id) => {
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/cancelDisposal/${id}`);
      if (response.status === 200 && response.data.success) {
        setDisposalAssets(disposalAssets.filter((asset) => asset._id !== id));
        Swal.fire("Cancelled!", "The asset has been returned to Returned Permanent.", "success");
      } else {
        Swal.fire("Warning!", "Cancellation completed but with an unexpected response.", "warning");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while cancelling the disposal.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const approveIssue = async (id) => {
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/approveIssue/${id}`);
      if (response.status === 200 && response.data.success) {
        setIssueAssets(issueAssets.filter((asset) => asset._id !== id));
        Swal.fire("Approved!", "The issue has been approved and moved to Issued Assets.", "success");
      } else {
        Swal.fire("Warning!", "Approval completed but with an unexpected response.", "warning");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while approving the issue.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const rejectIssue = async (id) => {
    Swal.fire({
      title: "Reject Issue Entry",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter your remark here...",
      inputAttributes: { "aria-label": "Enter your remark here" },
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
          const response = await axios.post(`${serverBaseUrl}/api/assets/rejectIssue/${id}`, {
            rejectionRemarks: result.value,
          });
          if (response.status === 200 && response.data.success) {
            setIssueAssets(issueAssets.filter((asset) => asset._id !== id));
            Swal.fire("Rejected!", "The issue has been rejected.", "success");
          } else {
            Swal.fire("Warning!", response.data.message || "Rejection completed but with an unexpected response.", "warning");
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "There was an error processing the rejection.";
          Swal.fire("Error!", errorMessage, "error");
        }
      }
    });
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
                  <p>  Overall Price: {item.totalPrice || "N/A"}</p>
                  <p>  AMC Date: {item.amcDate ? new Date(item.amcDate).toLocaleDateString() : "N/A"}</p>
                  <p>  Warranty Number: {item.warrantyNumber || "N/A"}</p>

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
        <p><strong>Quantity:</strong>{asset.quantity||"N/A"}</p>
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

  const renderIssueAssetDetails = (asset) => {
    if (!asset) return null;
    return (
      <div style={componentStyles.assetDetails}>
        <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
        <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
        <p><strong>Item Name:</strong> {asset.itemName || "N/A"}</p>
        <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
        <p><strong>Item Description:</strong> {asset.itemDescription || "N/A"}</p>
        <p><strong>Issued To:</strong> {asset.issuedTo || "N/A"}</p>
        <p><strong>Quantity:</strong> {asset.quantity || "N/A"}</p>
        <p><strong>Item IDs:</strong> {asset.issuedIds && asset.issuedIds.length > 0 ? asset.issuedIds.join(", ") : "N/A"}</p>
        <p><strong>Receipt PDF:</strong> <a href={asset.pdfUrl} target="_blank" rel="noopener noreferrer">View Receipt</a></p>
        <p><strong>Signed PDF:</strong> <a href={asset.signedPdfUrl} target="_blank" rel="noopener noreferrer">View Signed</a></p>
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
            <li className="active"><a href={`/assetmanagerdashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li ><a href={`/adminassetapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Approval</span></a></li>
            <li><a href={`/assetupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Updation</span></a></li>
            <li><a href={`/managerassetview?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset View</span></a></li>
          </ul>
        <ul className="side-menu">
          <li><Link to="/" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></Link></li>
        </ul>
      </section>

      <section id="content" style={componentStyles.content}>
        <nav style={componentStyles.nav}>
          <i className="bx bx-menu" />
          <span style={componentStyles.headTitle}>Dashboard</span>
          <div style={componentStyles.usernameContainer}>
            <i className="bx bxs-user-circle" style={componentStyles.userIcon}></i>
            <span style={componentStyles.username}>{username}</span>
          </div>
        </nav>

        <h2 style={componentStyles.title}>Asset Approval</h2>
        <div style={componentStyles.tabContainer}>
  <button style={activeTab === "purchased" ? componentStyles.activeTab : componentStyles.tab} onClick={() => setActiveTab("purchased")}>Purchased</button>
  <button style={activeTab === "issue" ? componentStyles.activeTab : componentStyles.tab} onClick={() => setActiveTab("issue")}>Issue</button>
  <button style={activeTab === "return" ? componentStyles.activeTab : componentStyles.tab} onClick={() => setActiveTab("return")}>Return</button>
  <button style={activeTab === "exchange" ? componentStyles.activeTab : componentStyles.tab} onClick={() => setActiveTab("exchange")}>Exchange</button>
  <button style={activeTab === "service" ? componentStyles.activeTab : componentStyles.tab} onClick={() => setActiveTab("service")}>Service</button>
  <button style={activeTab === "disposal" ? componentStyles.activeTab : componentStyles.tab} onClick={() => setActiveTab("disposal")}>Disposal</button>

</div>

        <div style={componentStyles.container}>
        {activeTab === "exchange" && (
  <table style={componentStyles.advancedTable}>
    <thead>
      <tr>
        <th>Asset Category</th>
        <th>Item Name</th>
        <th>Quantity</th>
        <th>Exchange Date</th>
        <th>Details</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {exchangedAssets.map((asset) => (
        <tr key={asset._id}>
          <td>{asset.assetCategory || "N/A"}</td>
          <td>{asset.itemName || "N/A"}</td>
          <td>{asset.returnedQuantity || "N/A"}</td>
          <td>{asset.exchangeDate ? new Date(asset.exchangeDate).toLocaleDateString() : "N/A"}</td>
          <td><button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>View</button></td>
          <td style={componentStyles.actionCell}>
            <button style={componentStyles.approveButton} onClick={() => approveExchange(asset._id)}>Yes</button>
            <button style={componentStyles.rejectButton} onClick={() => rejectExchange(asset._id)}>No</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}
{activeTab === "service" && (
            <table style={componentStyles.advancedTable}>
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Asset Category</th>
                  <th>Item Name</th>
                  <th>Service Date</th>
                  <th>Service Amount</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {serviceAssets.map((asset) => (
                  <tr key={asset._id}>
                    <td>{asset.assetType || "N/A"}</td>
                    <td>{asset.assetCategory || "N/A"}</td>
                    <td>{asset.itemName || "N/A"}</td>
                    <td>{asset.serviceDate ? new Date(asset.serviceDate).toLocaleDateString() : "N/A"}</td>
                    <td>{asset.serviceAmount || "N/A"}</td>
                    <td><button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>View</button></td>
                    <td style={componentStyles.actionCell}>
                      <button style={componentStyles.approveButton} onClick={() => approveService(asset._id)}>Approve</button>
                      <button style={componentStyles.rejectButton} onClick={() => rejectService(asset._id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                    <td><button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>View</button></td>
                    <td style={componentStyles.actionCell}>
                      <button style={componentStyles.approveButton} onClick={() => approveAsset(asset._id)}>Approve</button>
                      <button style={componentStyles.rejectButton} onClick={() => rejectAsset(asset._id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
{activeTab === "return" && (
  <>
    <div style={componentStyles.searchContainer}>
      <input
        type="text"
        placeholder="Search by item name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={componentStyles.searchInput}
      />
    </div>
    <div style={componentStyles.cardContainer}>
      {filteredReturnAssets.length > 0 ? (
        filteredReturnAssets.map((asset, index) => (
          <div key={asset._id} style={componentStyles.card}>
            <div style={componentStyles.cardHeader}>
              <h3>{asset.itemName || "Unnamed Item"}</h3>
              <span style={componentStyles.assetTypeBadge}>{asset.assetType || "N/A"}</span>
            </div>
            <div style={componentStyles.cardBody}>
              <p><strong>Category:</strong> {asset.assetCategory || "N/A"}</p>
              <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
              <p><strong>Description:</strong> {asset.itemDescription || "N/A"}</p>
              <p><strong>Returned From:</strong> {asset.location || "N/A"}</p>
              {asset.assetType === "Permanent" ? (
                <p><strong>Item ID:</strong> {asset.itemId || "N/A"}</p>
              ) : (
                <p><strong>Returned Quantity:</strong> {asset.returnQuantity || "N/A"}</p>
              )}
              <p><strong>Condition:</strong> {asset.status || "N/A"}</p>
              <p><strong>Remark:</strong> {asset.remark || "N/A"}</p>
              <p><strong>Signed PDF:</strong> {asset.signedPdfUrl ? <a href={asset.signedPdfUrl} target="_blank" rel="noopener noreferrer" style={componentStyles.link}>View</a> : "N/A"}</p>
              <div style={componentStyles.conditionSelect}>
                <label><strong>Change Condition:</strong></label>
                <select
                  value={asset.newCondition || asset.condition}
                  onChange={(e) => handleConditionChange(index, e.target.value)}
                  style={componentStyles.select}
                >
                  {asset.assetType === "Permanent" ? (
                    <>
                      <option value="To Be Serviced">To Be Serviced</option>
                      <option value="To Be Disposed">To Be Disposed</option>
                    </>
                  ) : (
                    <>
                      <option value="To Be Exchanged">To Be Exchanged</option>
                      <option value="To Be Disposed">To Be Disposed</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div style={componentStyles.cardFooter}>
              <button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>View Details</button>
              <div style={componentStyles.actionButtons}>
                <button
                  style={componentStyles.approveButton}
                  onClick={() => approveReturn(asset._id, asset.newCondition)}
                >
                  Approve
                </button>
                <button
                  style={componentStyles.rejectButton}
                  onClick={() => rejectReturn(asset._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={componentStyles.noResults}>
          {searchTerm ? `No items found matching "${searchTerm}"` : "No return assets available"}
        </div>
      )}
    </div>
  </>
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
                    <td><button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>View</button></td>
                    <td style={componentStyles.actionCell}>
                      <button style={componentStyles.disposeButton} onClick={() => disposeAsset(asset._id)}>Dispose</button>
                      <button style={componentStyles.cancelButton} onClick={() => cancelDisposal(asset._id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "issue" && (
            <table style={componentStyles.advancedTable}>
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Asset Category</th>
                  <th>Item Name</th>
                  <th>Issued To</th>
                  <th>Quantity</th>
                  <th>Signed PDF</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {issueAssets.map((asset) => (
                  <tr key={asset._id}>
                    <td>{asset.assetType || "N/A"}</td>
                    <td>{asset.assetCategory || "N/A"}</td>
                    <td>{asset.itemName || "N/A"}</td>
                    <td>{asset.issuedTo || "N/A"}</td>
                    <td>{asset.quantity || "N/A"}</td>
                    <td><a href={asset.signedPdfUrl} target="_blank" rel="noopener noreferrer">View</a></td>
                    <td><button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>View</button></td>
                    <td style={componentStyles.actionCell}>
                      <button style={componentStyles.approveButton} onClick={() => approveIssue(asset._id)}>Approve</button>
                      <button style={componentStyles.rejectButton} onClick={() => rejectIssue(asset._id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {popupData && (
  <div style={componentStyles.popupOverlay}>
    <div style={componentStyles.popupContent}>
      <h3>
        {activeTab === "purchased" 
          ? `${popupData.assetCategory} Details` 
          : activeTab === "disposal" 
          ? "Disposal Asset Details" 
          : activeTab === "issue" 
          ? "Issue Asset Details" 
          : activeTab === "return" 
          ? "Return Asset Details"
          : activeTab === "exchange"
          ? "Exchange Details"
          :activeTab === "service" ? "Service Asset Details" : ""}
      </h3>
      <div style={componentStyles.popupScrollableContent}>
        {activeTab === "purchased" 
          ? renderPurchasedAssetDetails(popupData) 
          : activeTab === "disposal" 
          ? renderDisposalAssetDetails(popupData) 
          : activeTab === "issue" 
          ? renderIssueAssetDetails(popupData) 
          : activeTab === "return" 
          ? renderReturnAssetDetails(popupData)
          : activeTab === "exchange"
          ? renderExchangeAssetDetails(popupData)
          : activeTab === "service" ? renderServiceAssetDetails(popupData) : null}
      </div>
      <button style={componentStyles.popupCloseButton} onClick={() => setPopupData(null)}>Close</button>
    </div>
  </div>
)}
    </div>
  );
}

const componentStyles = {
  content: {},
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "transform 0.2s",
    ":hover": {
      transform: "scale(1.03)", // Note: This won't work directly in inline styles; consider using CSS classes for hover effects
    },
  },
  cardHeader: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetTypeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
  },
  cardBody: {
    padding: "15px",
    fontSize: "14px",
    color: "#333",
  },
  cardFooter: {
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eee",
  },
  link: {
    color: "#007BFF",
    textDecoration: "none",
    fontWeight: "bold",
  },
  conditionSelect: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  select: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
  },
  noResults: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "18px"
  },
  // Ensure existing button styles are compatible
  viewButton: { padding: "8px 16px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  approveButton: { padding: "8px 16px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  rejectButton: { padding: "8px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" },
  headTitle: { fontSize: "20px", fontWeight: "bold" },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
  title: { fontSize: "28px", fontWeight: "bold", marginTop: "50px", marginBottom: "15px", marginLeft: "20px", color: "#333" },
  tabContainer: { display: "flex", gap: "10px", marginBottom: "20px", marginLeft: "20px" },
  tab: { padding: "10px 20px", backgroundColor: "#ddd", border: "none", borderRadius: "5px", cursor: "pointer" },
  activeTab: { padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  container: { maxWidth: "1200px", margin: "15px auto", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff" },
  advancedTable: { width: "100%", borderCollapse: "collapse" },
  assetDetails: {},
  viewButton: { padding: "6px 12px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  approveButton: { padding: "6px 12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px" },
  rejectButton: { padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  disposeButton: { padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  cancelButton: { padding: "6px 12px", backgroundColor: "#ffc107", color: "#000", border: "none", borderRadius: "4px", cursor: "pointer" },
  actionCell: { display: "flex", gap: "5px", justifyContent: "center" },
  popupOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  popupContent: { backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "500px", maxWidth: "90%", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" },
  popupScrollableContent: { maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" },
  popupCloseButton: { marginTop: "15px", padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", alignSelf: "flex-end" },
  searchContainer: {
    padding: "10px 20px",
    marginBottom: "15px",
    backgroundColor: "#fff",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s",
    ":focus": {
      borderColor: "#007BFF"
    }
  }
};

export default AssetApproval;