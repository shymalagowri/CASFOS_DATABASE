import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/style.css";

function PrincipalAssetUpdation() {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const [permanentAssets, setPermanentAssets] = useState([]);
  const [consumableAssets, setConsumableAssets] = useState([]);
  const [activeTab, setActiveTab] = useState("permanent");
  const [popupData, setPopupData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAsset, setEditedAsset] = useState({});
  const [billPhotoUrl, setBillPhotoUrl] = useState('');
  const [itemPhotoUrls, setItemPhotoUrls] = useState({});
  const [warrantyPhotoUrls, setWarrantyPhotoUrls] = useState({});
  const [amcPhotoUrls, setAmcPhotoUrls] = useState({});
  const [permanentSearchTerm, setPermanentSearchTerm] = useState("");
  const [consumableSearchTerm, setConsumableSearchTerm] = useState("");
  const [displayPermanentSearchTerm, setDisplayPermanentSearchTerm] = useState("");
  const [displayConsumableSearchTerm, setDisplayConsumableSearchTerm] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const serverBaseUrl = `http://${ip}:${port}`;

  // Fetch permanent assets
  useEffect(() => {
    if (activeTab === "permanent") {
      axios.get(`${serverBaseUrl}/api/assets/permanent`)
        .then(response => {
          setPermanentAssets(response.data);
        })
        .catch(error => {
          console.error("Error fetching permanent assets:", error);
          Swal.fire("Error!", "Failed to load permanent assets", "error");
        });
    }
  }, [activeTab]);

  // Fetch consumable assets
  useEffect(() => {
    if (activeTab === "consumable") {
      axios.get(`${serverBaseUrl}/api/assets/consumable`)
        .then(response => {
          setConsumableAssets(response.data);
        })
        .catch(error => {
          console.error("Error fetching consumable assets:", error);
          Swal.fire("Error!", "Failed to load consumable assets", "error");
        });
    }
  }, [activeTab]);

  // Debounce for permanent search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDisplayPermanentSearchTerm(permanentSearchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [permanentSearchTerm]);

  // Debounce for consumable search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDisplayConsumableSearchTerm(consumableSearchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [consumableSearchTerm]);

  // Filter and sort permanent assets
  const filteredPermanentAssets = permanentAssets
    .filter(asset => {
      const firstItem = asset.items?.[0] || {};
      return firstItem.itemName?.toLowerCase().includes(displayPermanentSearchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const aName = a.items?.[0]?.itemName || "";
      const bName = b.items?.[0]?.itemName || "";
      return aName.localeCompare(bName);
    });

  // Filter and sort consumable assets
  const filteredConsumableAssets = consumableAssets
    .filter(asset => {
      const firstItem = asset.items?.[0] || {};
      return firstItem.itemName?.toLowerCase().includes(displayConsumableSearchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const aName = a.items?.[0]?.itemName || "";
      const bName = b.items?.[0]?.itemName || "";
      return aName.localeCompare(bName);
    });

  const handleEditClick = (asset) => {
    setEditedAsset(JSON.parse(JSON.stringify(asset)));
    setEditMode(true);
    setPopupData(asset);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAsset(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (file, fieldName, index) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/uploadFile`, formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      if (fieldName === "billPhoto") {
        setEditedAsset(prev => ({
          ...prev,
          billPhotoUrl: response.data.fileUrl
        }));
      } else if (fieldName === "itemPhoto") {
        setEditedAsset(prev => {
          const newItems = [...prev.items];
          newItems[index] = {
            ...newItems[index],
            itemPhotoUrl: response.data.fileUrl
          };
          return {
            ...prev,
            items: newItems
          };
        });
      } else if (fieldName === "warrantyPhoto") {
        setEditedAsset(prev => {
          const newItems = [...prev.items];
          newItems[index] = {
            ...newItems[index],
            warrantyPhotoUrl: response.data.fileUrl
          };
          return {
            ...prev,
            items: newItems
          };
        });
      } else if (fieldName === "amcPhoto") {
        setEditedAsset(prev => {
          const newItems = [...prev.items];
          newItems[index] = {
            ...newItems[index],
            amcPhotoUrl: response.data.fileUrl
          };
          return {
            ...prev,
            items: newItems
          };
        });
      }
    } catch (error) {
      console.error("File upload failed:", error);
      Swal.fire("Error!", "File upload failed. Please try again.", "error");
    }
  };

  const handleItemChange = (index, field, value) => {
    setEditedAsset(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleDateChange = (name, dateString) => {
    setEditedAsset(prev => ({
      ...prev,
      [name]: new Date(dateString)
    }));
  };

  const handleItemDateChange = (index, field, dateString) => {
    handleItemChange(index, field, new Date(dateString));
  };

  const saveChanges = async () => {
    try {
      const endpoint = activeTab === "permanent" 
        ? `${serverBaseUrl}/api/assets/permanent/${editedAsset._id}`
        : `${serverBaseUrl}/api/assets/consumable/${editedAsset._id}`;

      const response = await axios.put(endpoint, editedAsset);
      
      if (response.status === 200) {
        Swal.fire("Success!", "Asset updated successfully", "success");
        if (activeTab === "permanent") {
          setPermanentAssets(prev => 
            prev.map(asset => asset._id === editedAsset._id ? response.data : asset)
          );
        } else {
          setConsumableAssets(prev => 
            prev.map(asset => asset._id === editedAsset._id ? response.data : asset)
          );
        }
        setEditMode(false);
        setPopupData(null);
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to update asset", "error");
      console.error("Error updating asset:", error);
    }
  };

  const renderAssetCard = (asset) => {
    const firstItem = asset.items?.[0] || {};
    return (
      <div key={asset._id} style={componentStyles.card}>
        <div style={componentStyles.cardHeader}>
          <h3>{firstItem.itemName || "Unnamed Asset"}</h3>
          <span style={componentStyles.assetTypeBadge}>{asset.assetType}</span>
        </div>
        <div style={componentStyles.cardBody}>
          <p><strong>Category:</strong> {asset.assetCategory || "N/A"}</p>
          <p><strong>Sub Category:</strong> {firstItem.subCategory || "N/A"}</p>
          <p><strong>Purchase Date:</strong> {new Date(asset.purchaseDate).toLocaleDateString()}</p>
          <p><strong>Supplier:</strong> {asset.supplierName}</p>
          <p><strong>Bill No:</strong> {asset.billNo}</p>
          {asset.assetType === "Permanent" && (
            <p><strong>Item IDs:</strong> {firstItem.itemIds?.join(", ") || "N/A"}</p>
          )}
          {asset.assetType === "Consumable" && (
            <p><strong>Quantity:</strong> {firstItem.quantityReceived}</p>
          )}
        </div>
        <div style={componentStyles.cardFooter}>
          <button 
            style={componentStyles.viewButton} 
            onClick={() => setPopupData(asset)}
          >
            View Details
          </button>
          <button 
            style={componentStyles.editButton}
            onClick={() => handleEditClick(asset)}
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  const renderImagePreview = (url) => {
    if (!url) return null;
    return (
      <div style={componentStyles.imagePreviewContainer}>
        <img 
          src={url} 
          alt="Preview" 
          style={componentStyles.imagePreview}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "http://via.placeholder.com/100?text=Image+Not+Available";
          }}
        />
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={componentStyles.imageLink}
        >
          View Full Image
        </a>
      </div>
    );
  };

  const renderAssetDetails = (asset) => {
    if (!asset) return null;
    
    return (
      <div style={componentStyles.assetDetails}>
        <h3>{asset.assetType} Asset Details</h3>
        
        {editMode ? (
          <>
            {/* General Asset Information */}
            <div style={componentStyles.section}>
              <h4>General Information</h4>
              <div style={componentStyles.formRow}>
                <div style={componentStyles.formGroup}>
                  <label>Asset Type:</label>
                  <input
                    type="text"
                    name="assetType"
                    value={editedAsset.assetType || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                    disabled
                  />
                </div>
                <div style={componentStyles.formGroup}>
                  <label>Asset Category:</label>
                  <input
                    type="text"
                    name="assetCategory"
                    value={editedAsset.assetCategory || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formRow}>
                <div style={componentStyles.formGroup}>
                  <label>Entry Date:</label>
                  <input
                    type="date"
                    name="entryDate"
                    value={editedAsset.entryDate ? new Date(editedAsset.entryDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleDateChange("entryDate", e.target.value)}
                    style={componentStyles.input}
                  />
                </div>
                <div style={componentStyles.formGroup}>
                  <label>Purchase Date:</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={editedAsset.purchaseDate ? new Date(editedAsset.purchaseDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleDateChange("purchaseDate", e.target.value)}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formRow}>
                <div style={componentStyles.formGroup}>
                  <label>Source:</label>
                  <select
                    name="source"
                    value={editedAsset.source || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  >
                    <option value="GEM">GEM</option>
                    <option value="Local">Local</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={componentStyles.formGroup}>
                  <label>Mode of Purchase:</label>
                  <select
                    name="modeOfPurchase"
                    value={editedAsset.modeOfPurchase || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  >
                    <option value="Tender">Tender</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div style={componentStyles.formRow}>
                <div style={componentStyles.formGroup}>
                  <label>Supplier Name:</label>
                  <input
                    type="text"
                    name="supplierName"
                    value={editedAsset.supplierName || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
                <div style={componentStyles.formGroup}>
                  <label>Supplier Address:</label>
                  <input
                    type="text"
                    name="supplierAddress"
                    value={editedAsset.supplierAddress || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formRow}>
                <div style={componentStyles.formGroup}>
                  <label>Bill No:</label>
                  <input
                    type="text"
                    name="billNo"
                    value={editedAsset.billNo || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
                <div style={componentStyles.formGroup}>
                  <label>Received By:</label>
                  <input
                    type="text"
                    name="receivedBy"
                    value={editedAsset.receivedBy || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formGroup}>
                <label>Bill Photo:</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(e.target.files[0], "billPhoto", 0);
                    }
                  }}
                  style={componentStyles.input}
                />
                {renderImagePreview(editedAsset.billPhotoUrl)}
              </div>
            </div>

            {/* Items Section */}
            <div style={componentStyles.section}>
              <h4>Items</h4>
              {editedAsset.items?.map((item, index) => (
                <div key={index} style={componentStyles.itemEditContainer}>
                  <div style={componentStyles.itemHeader}>
                    <h5>Item {index + 1}</h5>
                  </div>
                  
                  <div style={componentStyles.formRow}>
                    <div style={componentStyles.formGroup}>
                      <label>Item Name:</label>
                      <input
                        type="text"
                        value={item.itemName || ""}
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label>Sub Category:</label>
                      <input
                        type="text"
                        value={item.subCategory || ""}
                        onChange={(e) => handleItemChange(index, "subCategory", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                  </div>

                  <div style={componentStyles.formGroup}>
                    <label>Item Description:</label>
                    <textarea
                      value={item.itemDescription || ""}
                      onChange={(e) => handleItemChange(index, "itemDescription", e.target.value)}
                      style={componentStyles.textarea}
                    />
                  </div>

                  <div style={componentStyles.formRow}>
                    <div style={componentStyles.formGroup}>
                      <label>Quantity Received:</label>
                      <input
                        type="number"
                        value={item.quantityReceived || ""}
                        onChange={(e) => handleItemChange(index, "quantityReceived", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label>Unit Price:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice || ""}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label>Total Price:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.totalPrice || ""}
                        onChange={(e) => handleItemChange(index, "totalPrice", e.target.value)}
                        style={componentStyles.input}
                        disabled
                      />
                    </div>
                  </div>

                  {/* AMC Information */}
                  <div style={componentStyles.subSection}>
                    <h6>AMC Information</h6>
                    <div style={componentStyles.formRow}>
                      <div style={componentStyles.formGroup}>
                        <label>AMC From Date:</label>
                        <input
                          type="date"
                          value={item.amcFromDate ? new Date(item.amcFromDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleItemDateChange(index, "amcFromDate", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                      <div style={componentStyles.formGroup}>
                        <label>AMC To Date:</label>
                        <input
                          type="date"
                          value={item.amcToDate ? new Date(item.amcToDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleItemDateChange(index, "amcToDate", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                    </div>

                    <div style={componentStyles.formRow}>
                      <div style={componentStyles.formGroup}>
                        <label>AMC Cost:</label>
                        <input
                          type="number"
                          value={item.amcCost || ""}
                          onChange={(e) => handleItemChange(index, "amcCost", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                      <div style={componentStyles.formGroup}>
                        <label>AMC Photo:</label>
                        <input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileUpload(e.target.files[0], "amcPhoto", index);
                            }
                          }}
                          style={componentStyles.input}
                        />
                        {renderImagePreview(item.amcPhotoUrl)}
                      </div>
                    </div>
                  </div>

                  {/* Warranty Information */}
                  <div style={componentStyles.subSection}>
                    <h6>Warranty Information</h6>
                    <div style={componentStyles.formRow}>
                      <div style={componentStyles.formGroup}>
                        <label>Warranty Number:</label>
                        <input
                          type="text"
                          value={item.warrantyNumber || ""}
                          onChange={(e) => handleItemChange(index, "warrantyNumber", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                      <div style={componentStyles.formGroup}>
                        <label>Warranty Valid Until:</label>
                        <input
                          type="date"
                          value={item.warrantyValidUpto ? new Date(item.warrantyValidUpto).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleItemDateChange(index, "warrantyValidUpto", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                    </div>

                    <div style={componentStyles.formGroup}>
                      <label>Warranty Photo:</label>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleFileUpload(e.target.files[0], "warrantyPhoto", index);
                          }
                        }}
                        style={componentStyles.input}
                      />
                      {renderImagePreview(item.warrantyPhotoUrl)}
                    </div>
                  </div>

                  <div style={componentStyles.formGroup}>
                    <label>Item Photo:</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(e.target.files[0], "itemPhoto", index);
                        }
                      }}
                      style={componentStyles.input}
                    />
                    {renderImagePreview(item.itemPhotoUrl)}
                  </div>

                  {asset.assetType === "Permanent" && (
                    <div style={componentStyles.formGroup}>
                      <label>Item IDs (comma separated):</label>
                      <input
                        type="text"
                        value={item.itemIds?.join(", ") || ""}
                        onChange={(e) => handleItemChange(index, "itemIds", e.target.value.split(",").map(id => id.trim()))}
                        style={componentStyles.input}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          // View Mode
          <>
            <div style={componentStyles.section}>
              <h4>General Information</h4>
              <div style={componentStyles.detailRow}>
                <div style={componentStyles.detailGroup}>
                  <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p>
                  <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p>
                  <p><strong>Entry Date:</strong> {new Date(asset.entryDate).toLocaleDateString()}</p>
                  <p><strong>Purchase Date:</strong> {new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div style={componentStyles.detailGroup}>
                  <p><strong>Source:</strong> {asset.source || "N/A"}</p>
                  <p><strong>Mode of Purchase:</strong> {asset.modeOfPurchase || "N/A"}</p>
                  <p><strong>Bill No:</strong> {asset.billNo || "N/A"}</p>
                  <p><strong>Received By:</strong> {asset.receivedBy || "N/A"}</p>
                </div>
              </div>

              <div style={componentStyles.detailRow}>
                <div style={componentStyles.detailGroup}>
                  <p><strong>Supplier Name:</strong> {asset.supplierName || "N/A"}</p>
                  <p><strong>Supplier Address:</strong> {asset.supplierAddress || "N/A"}</p>
                </div>
              </div>

              {asset.billPhotoUrl && (
                <div style={componentStyles.detailGroup}>
                  <p><strong>Bill Photo:</strong></p>
                  {renderImagePreview(asset.billPhotoUrl)}
                </div>
              )}
            </div>

            {/* Items Section */}
            <div style={componentStyles.section}>
              <h4>Items</h4>
              {asset.items?.map((item, index) => (
                <div key={index} style={componentStyles.itemViewContainer}>
                  <div style={componentStyles.itemHeader}>
                    <h5>Item {index + 1}</h5>
                  </div>
                  
                  <div style={componentStyles.detailRow}>
                    <div style={componentStyles.detailGroup}>
                      <p><strong>Name:</strong> {item.itemName || "N/A"}</p>
                      <p><strong>Sub Category:</strong> {item.subCategory || "N/A"}</p>
                      <p><strong>Description:</strong> {item.itemDescription || "N/A"}</p>
                    </div>
                    <div style={componentStyles.detailGroup}>
                      <p><strong>Quantity:</strong> {item.quantityReceived || "N/A"}</p>
                      <p><strong>Unit Price:</strong> {item.unitPrice || "N/A"}</p>
                      <p><strong>Total Price:</strong> {item.totalPrice || "N/A"}</p>
                    </div>
                  </div>

                  {/* AMC Information */}
                  {(item.amcFromDate || item.amcToDate || item.amcCost) && (
                    <div style={componentStyles.subSection}>
                      <h3>AMC Information</h3>
                      <div style={componentStyles.detailRow}>
                        <div style={componentStyles.detailGroup}>
                          {item.amcFromDate && <p><strong>From:</strong> {new Date(item.amcFromDate).toLocaleDateString()}</p>}
                          {item.amcToDate && <p><strong>To:</strong> {new Date(item.amcToDate).toLocaleDateString()}</p>}
                          {item.amcCost && <p><strong>Cost:</strong> {item.amcCost}</p>}
                        </div>
                        {item.amcPhotoUrl && (
                          <div style={componentStyles.detailGroup}>
                            <p><strong>AMC Photo:</strong></p>
                            {renderImagePreview(item.amcPhotoUrl)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warranty Information */}
                  {(item.warrantyNumber || item.warrantyValidUpto) && (
                    <div style={componentStyles.subSection}>
                      <h3>Warranty Information</h3>
                      <div style={componentStyles.detailRow}>
                        <div style={componentStyles.detailGroup}>
                          {item.warrantyNumber && <p><strong>Number:</strong> {item.warrantyNumber}</p>}
                          {item.warrantyValidUpto && <p><strong>Valid Until:</strong> {new Date(item.warrantyValidUpto).toLocaleDateString()}</p>}
                        </div>
                        {item.warrantyPhotoUrl && (
                          <div style={componentStyles.detailGroup}>
                            <p><strong>Warranty Photo:</strong></p>
                            {renderImagePreview(item.warrantyPhotoUrl)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.itemPhotoUrl && (
                    <div style={componentStyles.detailGroup}>
                      <p><strong>Item Photo:</strong></p>
                      {renderImagePreview(item.itemPhotoUrl)}
                    </div>
                  )}

                  {asset.assetType === "Permanent" && item.itemIds?.length > 0 && (
                    <div style={componentStyles.detailGroup}>
                      <p><strong>Item IDs:</strong> {item.itemIds.join(", ")}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="asset-updation">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <title>CASFOS - Asset Updation</title>

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">PRINCIPAL</span>
        </a>
        <ul className="side-menu top">
            <li ><a href={`/principaldashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li className="active"><a href={`/principalassetupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Updation</span></a></li>
            <li><a href={`/principalassetview?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset View</span></a></li>
            <li><a href={`/principalfacultyupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Faculty Updation</span></a></li>
            <li><a href={`/principalfacultyview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li>
          </ul>
        <ul className="side-menu">
          <li><Link to="/login" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></Link></li>
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

        <h2 style={componentStyles.title}>Asset Updation</h2>
        <div style={componentStyles.tabContainer}>
          <button 
            style={activeTab === "permanent" ? componentStyles.activeTab : componentStyles.tab} 
            onClick={() => setActiveTab("permanent")}
          >
            Permanent Assets
          </button>
          <button 
            style={activeTab === "consumable" ? componentStyles.activeTab : componentStyles.tab} 
            onClick={() => setActiveTab("consumable")}
          >
            Consumable Assets
          </button>
        </div>

        <div style={componentStyles.container}>
          {/* Search inputs */}
          {activeTab === "permanent" && (
            <div style={componentStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search permanent assets by item name..."
                value={permanentSearchTerm}
                onChange={(e) => setPermanentSearchTerm(e.target.value)}
                style={componentStyles.searchInput}
              />
            </div>
          )}

          {activeTab === "consumable" && (
            <div style={componentStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search consumable assets by item name..."
                value={consumableSearchTerm}
                onChange={(e) => setConsumableSearchTerm(e.target.value)}
                style={componentStyles.searchInput}
              />
            </div>
          )}

          <div style={componentStyles.cardContainer}>
            {activeTab === "permanent" && (
              filteredPermanentAssets.length > 0 ? (
                filteredPermanentAssets.map(renderAssetCard)
              ) : (
                <div style={componentStyles.noResults}>
                  {permanentSearchTerm 
                    ? `No permanent assets found matching "${permanentSearchTerm}"` 
                    : "No permanent assets available"}
                </div>
              )
            )}
            {activeTab === "consumable" && (
              filteredConsumableAssets.length > 0 ? (
                filteredConsumableAssets.map(renderAssetCard)
              ) : (
                <div style={componentStyles.noResults}>
                  {consumableSearchTerm 
                    ? `No consumable assets found matching "${consumableSearchTerm}"` 
                    : "No consumable assets available"}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {popupData && (
        <div style={componentStyles.popupOverlay}>
          <div style={componentStyles.popupContent}>
            <h3>{popupData.assetType} Asset Details</h3>
            <div style={componentStyles.popupScrollableContent}>
              {renderAssetDetails(popupData)}
            </div>
            <div style={componentStyles.popupButtons}>
              {editMode ? (
                <>
                  <button 
                    style={componentStyles.saveButton}
                    onClick={saveChanges}
                  >
                    Save Changes
                  </button>
                  <button 
                    style={componentStyles.cancelButton}
                    onClick={() => {
                      setEditMode(false);
                      setPopupData(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  style={componentStyles.closeButton}
                  onClick={() => setPopupData(null)}
                >
                  Close
                </button>
              )}
            </div>
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
  },
  noResults: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "18px"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "transform 0.2s",
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
  imagePreviewContainer: {
    marginTop: '5px',
    textAlign: 'center',
  },
  imagePreview: {
    width: '300px',       // Reduced from likely larger size
    height: '150px',      // Reduced from likely larger size
    objectFit: 'contain', // Ensures image fits nicely in the container
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '2px',
    backgroundColor: '#f5f5f5',
  },
  imageLink: {
    display: 'block',
    marginTop: '5px',
    color: '#007BFF',
    textDecoration: 'none',
    fontSize: '12px',     // Smaller font for the link
  },
  cardFooter: {
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eee",
  },
  viewButton: { 
    padding: "8px 16px", 
    backgroundColor: "#007BFF", 
    color: "#fff", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer" 
  },
  editButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  nav: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "10px 20px" 
  },
  headTitle: { 
    fontSize: "20px", 
    fontWeight: "bold" 
  },
  usernameContainer: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    fontSize: "14px", 
    color: "#555" 
  },
  userIcon: { 
    fontSize: "30px", 
    color: "#007BFF" 
  },
  username: { 
    fontWeight: "bold", 
    fontSize: "18px" 
  },
  title: { 
    fontSize: "28px", 
    fontWeight: "bold", 
    marginTop: "50px", 
    marginBottom: "15px", 
    marginLeft: "20px", 
    color: "#333" 
  },
  tabContainer: { 
    display: "flex", 
    gap: "10px", 
    marginBottom: "20px", 
    marginLeft: "20px" 
  },
  tab: { 
    padding: "10px 20px", 
    backgroundColor: "#ddd", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer" 
  },
  activeTab: { 
    padding: "10px 20px", 
    backgroundColor: "#007BFF", 
    color: "#fff", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer" 
  },
  container: { 
    maxWidth: "1200px", 
    margin: "15px auto", 
    padding: "20px", 
    borderRadius: "10px", 
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
    backgroundColor: "#fff" 
  },
  assetDetails: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    minHeight: "80px",
  },
  itemContainer: {
    border: "1px solid #eee",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  popupOverlay: { 
    position: "fixed", 
    top: 0, 
    left: 0, 
    width: "100%", 
    height: "100%", 
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 1000 
  },
  popupContent: { 
    backgroundColor: "#fff", 
    padding: "20px", 
    borderRadius: "8px", 
    width: "700px", 
    maxWidth: "90%", 
    maxHeight: "80vh", 
    display: "flex", 
    flexDirection: "column", 
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" 
  },
  popupScrollableContent: { 
    maxHeight: "60vh", 
    overflowY: "auto", 
    paddingRight: "10px" 
  },
  popupButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "15px",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  closeButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default PrincipalAssetUpdation;