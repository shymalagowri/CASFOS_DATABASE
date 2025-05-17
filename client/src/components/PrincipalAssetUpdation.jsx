/**
 * PrincipalAssetUpdation.jsx
 *
 * This React component provides an interface for the Principal to view and update asset records
 * in the CASFOS Asset Management System.
 *
 * Overview:
 * - Displays a tabbed interface for managing Permanent and Consumable assets.
 * - Shows asset details in a card-based layout with search functionality for filtering by item name.
 * - Allows viewing detailed asset information in a popup, with an edit mode for updating asset fields.
 * - Supports file uploads for bill, item, warranty, and AMC photos, with image previews.
 * - Includes debounced search for improved performance and sorting of assets alphabetically.
 * - Provides a responsive UI with sidebar navigation, styled cards, and modals for viewing/editing.
 * - Integrates with backend APIs for fetching assets, uploading files, and updating records.
 * - Designed for Principal users to efficiently manage and update asset details as part of the asset management workflow.
 */
import React, { useEffect, useState } from "react"; // Import React and hooks for state and side effects management
import axios from "axios"; // Import axios for making HTTP requests to the backend API
import { useLocation, Link } from "react-router-dom"; // Import useLocation for URL query params and Link for navigation
import Swal from "sweetalert2"; // Import SweetAlert2 for displaying user feedback modals
import "../styles/Style.css"; // Import global CSS styles for the application

function PrincipalAssetUpdation() { // Define the PrincipalAssetUpdation functional component
  const port = import.meta.env.VITE_API_PORT; // Retrieve API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // Retrieve API IP address from environment variables
  const [permanentAssets, setPermanentAssets] = useState([]); // State to store permanent assets
  const [consumableAssets, setConsumableAssets] = useState([]); // State to store consumable assets
  const [activeTab, setActiveTab] = useState("permanent"); // State to track active tab (permanent or consumable)
  const [popupData, setPopupData] = useState(null); // State to store data for asset details popup
  const [editMode, setEditMode] = useState(false); // State to toggle between view and edit modes
  const [editedAsset, setEditedAsset] = useState({}); // State to store asset being edited
  const [billPhotoUrl, setBillPhotoUrl] = useState(''); // State for bill photo URL (unused)
  const [itemPhotoUrls, setItemPhotoUrls] = useState({}); // State for item photo URLs (unused)
  const [warrantyPhotoUrls, setWarrantyPhotoUrls] = useState({}); // State for warranty photo URLs (unused)
  const [amcPhotoUrls, setAmcPhotoUrls] = useState({}); // State for AMC photo URLs (unused)
  const [permanentSearchTerm, setPermanentSearchTerm] = useState(""); // State for permanent assets search input
  const [consumableSearchTerm, setConsumableSearchTerm] = useState(""); // State for consumable assets search input
  const [displayPermanentSearchTerm, setDisplayPermanentSearchTerm] = useState(""); // State for debounced permanent search term
  const [displayConsumableSearchTerm, setDisplayConsumableSearchTerm] = useState(""); // State for debounced consumable search term

  const location = useLocation(); // Get the current location object to access URL query parameters
  const queryParams = new URLSearchParams(location.search); // Parse query parameters from the URL
  const username = queryParams.get("username") || "Guest"; // Extract username from query params, default to "Guest"
  const serverBaseUrl = `http://${ip}:${port}`; // Construct base URL for API requests

  // Fetch permanent assets when activeTab is "permanent"
  useEffect(() => { // useEffect hook to fetch permanent assets
    if (activeTab === "permanent") { // Check if permanent tab is active
      axios.get(`${serverBaseUrl}/api/assets/permanent`) // Fetch permanent assets from API
        .then(response => { // Handle successful response
          setPermanentAssets(response.data); // Update permanentAssets state with response data
        })
        .catch(error => { // Handle errors
          console.error("Error fetching permanent assets:", error); // Log error to console
          Swal.fire("Error!", "Failed to load permanent assets", "error"); // Show error alert
        });
    }
  }, [activeTab]); // Re-run when activeTab changes

  // Fetch consumable assets when activeTab is "consumable"
  useEffect(() => { // useEffect hook to fetch consumable assets
    if (activeTab === "consumable") { // Check if consumable tab is active
      axios.get(`${serverBaseUrl}/api/assets/consumable`) // Fetch consumable assets from API
        .then(response => { // Handle successful response
          setConsumableAssets(response.data); // Update consumableAssets state with response data
        })
        .catch(error => { // Handle errors
          console.error("Error fetching consumable assets:", error); // Log error to console
          Swal.fire("Error!", "Failed to load consumable assets", "error"); // Show error alert
        });
    }
  }, [activeTab]); // Re-run when activeTab changes

  // Debounce for permanent search
  useEffect(() => { // useEffect hook to debounce permanent search input
    const handler = setTimeout(() => { // Set timeout for 300ms
      setDisplayPermanentSearchTerm(permanentSearchTerm); // Update display search term after delay
    }, 300);

    return () => { // Cleanup function
      clearTimeout(handler); // Clear timeout on unmount or change
    };
  }, [permanentSearchTerm]); // Re-run when permanentSearchTerm changes

  // Debounce for consumable search
  useEffect(() => { // useEffect hook to debounce consumable search input
    const handler = setTimeout(() => { // Set timeout for 300ms
      setDisplayConsumableSearchTerm(consumableSearchTerm); // Update display search term after delay
    }, 300);

    return () => { // Cleanup function
      clearTimeout(handler); // Clear timeout on unmount or change
    };
  }, [consumableSearchTerm]); // Re-run when consumableSearchTerm changes

  // Filter and sort permanent assets
  const filteredPermanentAssets = permanentAssets // Filter and sort permanent assets
    .filter(asset => { // Filter assets based on search term
      const firstItem = asset.items?.[0] || {}; // Get first item or empty object
      return firstItem.itemName?.toLowerCase().includes(displayPermanentSearchTerm.toLowerCase()); // Check if item name matches search term
    })
    .sort((a, b) => { // Sort assets alphabetically by item name
      const aName = a.items?.[0]?.itemName || ""; // Get first item name or empty string
      const bName = b.items?.[0]?.itemName || ""; // Get first item name or empty string
      return aName.localeCompare(bName); // Compare names for sorting
    });

  // Filter and sort consumable assets
  const filteredConsumableAssets = consumableAssets // Filter and sort consumable assets
    .filter(asset => { // Filter assets based on search term
      const firstItem = asset.items?.[0] || {}; // Get first item or empty object
      return firstItem.itemName?.toLowerCase().includes(displayConsumableSearchTerm.toLowerCase()); // Check if item name matches search term
    })
    .sort((a, b) => { // Sort assets alphabetically by item name
      const aName = a.items?.[0]?.itemName || ""; // Get first item name or empty string
      const bName = b.items?.[0]?.itemName || ""; // Get first item name or empty string
      return aName.localeCompare(bName); // Compare names for sorting
    });

  const handleEditClick = (asset) => { // Function to handle edit button click
    setEditedAsset(JSON.parse(JSON.stringify(asset))); // Deep copy asset to editedAsset state
    setEditMode(true); // Enable edit mode
    setPopupData(asset); // Open popup with asset details
  };

  const handleInputChange = (e) => { // Function to handle input changes in edit mode
    const { name, value } = e.target; // Get input name and value
    setEditedAsset(prev => ({ // Update editedAsset state
      ...prev,
      [name]: value // Update field with new value
    }));
  };

  const handleFileUpload = async (file, fieldName, index) => { // Function to handle file uploads
    const formData = new FormData(); // Create FormData object for file upload
    formData.append("file", file); // Append file to FormData
    try { // Start try block for API request
      const response = await axios.post(`${serverBaseUrl}/api/assets/uploadFile`, formData, { // Upload file to API
        headers: { "Content-Type": "multipart/form-data" } // Set content type
      });
      
      if (fieldName === "billPhoto") { // Handle bill photo upload
        setEditedAsset(prev => ({ // Update editedAsset with new bill photo URL
          ...prev,
          billPhotoUrl: response.data.fileUrl
        }));
      } else if (fieldName === "itemPhoto") { // Handle item photo upload
        setEditedAsset(prev => { // Update editedAsset with new item photo URL
          const newItems = [...prev.items]; // Copy items array
          newItems[index] = { // Update specific item
            ...newItems[index],
            itemPhotoUrl: response.data.fileUrl // Set new photo URL
          };
          return {
            ...prev,
            items: newItems // Update items array
          };
        });
      } else if (fieldName === "warrantyPhoto") { // Handle warranty photo upload
        setEditedAsset(prev => { // Update editedAsset with new warranty photo URL
          const newItems = [...prev.items]; // Copy items array
          newItems[index] = { // Update specific item
            ...newItems[index],
            warrantyPhotoUrl: response.data.fileUrl // Set new photo URL
          };
          return {
            ...prev,
            items: newItems // Update items array
          };
        });
      } else if (fieldName === "amcPhoto") { // Handle AMC photo upload
        setEditedAsset(prev => { // Update editedAsset with new AMC photo URL
          const newItems = [...prev.items]; // Copy items array
          newItems[index] = { // Update specific item
            ...newItems[index],
            amcPhotoUrl: response.data.fileUrl // Set new photo URL
          };
          return {
            ...prev,
            items: newItems // Update items array
          };
        });
      }
    } catch (error) { // Handle upload errors
      console.error("File upload failed:", error); // Log error to console
      Swal.fire("Error!", "File upload failed. Please try again.", "error"); // Show error alert
    }
  };

  const handleItemChange = (index, field, value) => { // Function to handle item field changes
    setEditedAsset(prev => { // Update editedAsset state
      const newItems = [...prev.items]; // Copy items array
      newItems[index] = { // Update specific item
        ...newItems[index],
        [field]: value // Update field with new value
      };
      return {
        ...prev,
        items: newItems // Update items array
      };
    });
  };

  const handleDateChange = (name, dateString) => { // Function to handle date field changes
    setEditedAsset(prev => ({ // Update editedAsset state
      ...prev,
      [name]: new Date(dateString) // Convert date string to Date object
    }));
  };

  const handleItemDateChange = (index, field, dateString) => { // Function to handle item date field changes
    handleItemChange(index, field, new Date(dateString)); // Update item date field
  };

  const saveChanges = async () => { // Function to save edited asset changes
    try { // Start try block for API request
      const endpoint = activeTab === "permanent" // Determine API endpoint based on active tab
        ? `${serverBaseUrl}/api/assets/permanent/${editedAsset._id}`
        : `${serverBaseUrl}/api/assets/consumable/${editedAsset._id}`;

      const response = await axios.put(endpoint, editedAsset); // Update asset via API
      
      if (response.status === 200) { // Check for successful response
        Swal.fire("Success!", "Asset updated successfully", "success"); // Show success alert
        if (activeTab === "permanent") { // Update permanent assets
          setPermanentAssets(prev => // Update state with new asset data
            prev.map(asset => asset._id === editedAsset._id ? response.data : asset)
          );
        } else { // Update consumable assets
          setConsumableAssets(prev => // Update state with new asset data
            prev.map(asset => asset._id === editedAsset._id ? response.data : asset)
          );
        }
        setEditMode(false); // Exit edit mode
        setPopupData(null); // Close popup
      }
    } catch (error) { // Handle update errors
      Swal.fire("Error!", "Failed to update asset", "error"); // Show error alert
      console.error("Error updating asset:", error); // Log error to console
    }
  };

  const renderAssetCard = (asset) => { // Function to render asset card
    const firstItem = asset.items?.[0] || {}; // Get first item or empty object
    return (
      <div key={asset._id} style={componentStyles.card}> // Card container
        <div style={componentStyles.cardHeader}> // Card header
          <h3>{firstItem.itemName || "Unnamed Asset"}</h3> // Display item name or default
          <span style={componentStyles.assetTypeBadge}>{asset.assetType}</span> // Display asset type
        </div>
        <div style={componentStyles.cardBody}> // Card body
          <p><strong>Category:</strong> {asset.assetCategory || "N/A"}</p> // Display category
          <p><strong>Sub Category:</strong> {firstItem.subCategory || "N/A"}</p> // Display sub category
          <p><strong>Purchase Date:</strong> {new Date(asset.purchaseDate).toLocaleDateString()}</p> // Display purchase date
          <p><strong>Supplier:</strong> {asset.supplierName}</p> // Display supplier name
          <p><strong>Bill No:</strong> {asset.billNo}</p> // Display bill number
          {asset.assetType === "Permanent" && ( // Conditional rendering for permanent assets
            <p><strong>Item IDs:</strong> {firstItem.itemIds?.join(", ") || "N/A"}</p> // Display item IDs
          )}
          {asset.assetType === "Consumable" && ( // Conditional rendering for consumable assets
            <p><strong>Quantity:</strong> {firstItem.quantityReceived}</p> // Display quantity
          )}
        </div>
        <div style={componentStyles.cardFooter}> // Card footer
          <button 
            style={componentStyles.viewButton} 
            onClick={() => setPopupData(asset)} // Open popup with asset details
          >
            View Details
          </button>
          <button 
            style={componentStyles.editButton}
            onClick={() => handleEditClick(asset)} // Enter edit mode
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  const renderImagePreview = (url) => { // Function to render image preview
    if (!url) return null; // Return null if no URL
    return (
      <div style={componentStyles.imagePreviewContainer}> // Image preview container
        <img 
          src={url} 
          alt="Preview" 
          style={componentStyles.imagePreview} // Image styling
          onError={(e) => { // Handle image load error
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = "http://via.placeholder.com/100?text=Image+Not+Available"; // Fallback image
          }}
        />
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={componentStyles.imageLink} // Link styling
        >
          View Full Image
        </a>
      </div>
    );
  };

  const renderAssetDetails = (asset) => { // Function to render asset details
    if (!asset) return null; // Return null if no asset
    
    return (
      <div style={componentStyles.assetDetails}> // Asset details container
        <h3>{asset.assetType} Asset Details</h3> // Asset type title
        
        {editMode ? ( // Edit mode rendering
          <>
            {/* General Asset Information */}
            <div style={componentStyles.section}> // General information section
              <h4>General Information</h4> // Section title
              <div style={componentStyles.formRow}> // Form row
                <div style={componentStyles.formGroup}> // Form group
                  <label>Asset Type:</label> // Label
                  <input
                    type="text"
                    name="assetType"
                    value={editedAsset.assetType || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                    disabled // Disabled input
                  />
                </div>
                <div style={componentStyles.formGroup}> // Form group
                  <label>Asset Category:</label> // Label
                  <input
                    type="text"
                    name="assetCategory"
                    value={editedAsset.assetCategory || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formRow}> // Form row
                <div style={componentStyles.formGroup}> // Form group
                  <label>Entry Date:</label> // Label
                  <input
                    type="date"
                    name="entryDate"
                    value={editedAsset.entryDate ? new Date(editedAsset.entryDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleDateChange("entryDate", e.target.value)}
                    style={componentStyles.input}
                  />
                </div>
                <div style={componentStyles.formGroup}> // Form group
                  <label>Purchase Date:</label> // Label
                  <input
                    type="date"
                    name="purchaseDate"
                    value={editedAsset.purchaseDate ? new Date(editedAsset.purchaseDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleDateChange("purchaseDate", e.target.value)}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formRow}> // Form row
                <div style={componentStyles.formGroup}> // Form group
                  <label>Source:</label> // Label
                  <select
                    name="source"
                    value={editedAsset.source || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  >
                    <option value="GEM">GEM</option> // Option
                    <option value="Local">Local</option> // Option
                    <option value="Other">Other</option> // Option
                  </select>
                </div>
                <div style={componentStyles.formGroup}> // Form group
                  <label>Mode of Purchase:</label> // Label
                  <select
                    name="modeOfPurchase"
                    value={editedAsset.modeOfPurchase || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  >
                    <option value="Tender">Tender</option> // Option
                    <option value="Quotation">Quotation</option> // Option
                    <option value="Others">Others</option> // Option
                  </select>
                </div>
              </div>

              <div style={componentStyles.formRow}> // Form row
                <div style={componentStyles.formGroup}> // Form group
                  <label>Supplier Name:</label> // Label
                  <input
                    type="text"
                    name="supplierName"
                    value={editedAsset.supplierName || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
                <div style={componentStyles.formGroup}> // Form group
                  <label>Supplier Address:</label> // Label
                  <input
                    type="text"
                    name="supplierAddress"
                    value={editedAsset.supplierAddress || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formRow}> // Form row
                <div style={componentStyles.formGroup}> // Form group
                  <label>Bill No:</label> // Label
                  <input
                    type="text"
                    name="billNo"
                    value={editedAsset.billNo || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
                <div style={componentStyles.formGroup}> // Form group
                  <label>Received By:</label> // Label
                  <input
                    type="text"
                    name="receivedBy"
                    value={editedAsset.receivedBy || ""}
                    onChange={handleInputChange}
                    style={componentStyles.input}
                  />
                </div>
              </div>

              <div style={componentStyles.formGroup}> // Form group
                <label>Bill Photo:</label> // Label
                <input
                  type="file"
                  onChange={(e) => { // Handle file selection
                    if (e.target.files[0]) { // Check if file exists
                      handleFileUpload(e.target.files[0], "billPhoto", 0); // Upload file
                    }
                  }}
                  style={componentStyles.input}
                />
                {renderImagePreview(editedAsset.billPhotoUrl)} // Render bill photo preview
              </div>
            </div>

            {/* Items Section */}
            <div style={componentStyles.section}> // Items section
              <h4>Items</h4> // Section title
              {editedAsset.items?.map((item, index) => ( // Map over items
                <div key={index} style={componentStyles.itemEditContainer}> // Item container
                  <div style={componentStyles.itemHeader}> // Item header
                    <h5>Item {index + 1}</h5> // Item title
                  </div>
                  
                  <div style={componentStyles.formRow}> // Form row
                    <div style={componentStyles.formGroup}> // Form group
                      <label>Item Name:</label> // Label
                      <input
                        type="text"
                        value={item.itemName || ""}
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}> // Form group
                      <label>Sub Category:</label> // Label
                      <input
                        type="text"
                        value={item.subCategory || ""}
                        onChange={(e) => handleItemChange(index, "subCategory", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                  </div>

                  <div style={componentStyles.formGroup}> // Form group
                    <label>Item Description:</label> // Label
                    <textarea
                      value={item.itemDescription || ""}
                      onChange={(e) => handleItemChange(index, "itemDescription", e.target.value)}
                      style={componentStyles.textarea}
                    />
                  </div>

                  <div style={componentStyles.formRow}> // Form row
                    <div style={componentStyles.formGroup}> // Form group
                      <label>Quantity Received:</label> // Label
                      <input
                        type="number"
                        value={item.quantityReceived || ""}
                        onChange={(e) => handleItemChange(index, "quantityReceived", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}> // Form group
                      <label>Unit Price:</label> // Label
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice || ""}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}> // Form group
                      <label>Total Price:</label> // Label
                      <input
                        type="number"
                        step="0.01"
                        value={item.totalPrice || ""}
                        onChange={(e) => handleItemChange(index, "totalPrice", e.target.value)}
                        style={componentStyles.input}
                        disabled // Disabled input
                      />
                    </div>
                  </div>

                  {/* AMC Information */}
                  <div style={componentStyles.subSection}> // AMC section
                    <h6>AMC Information</h6> // Section title
                    <div style={componentStyles.formRow}> // Form row
                      <div style={componentStyles.formGroup}> // Form group
                        <label>AMC From Date:</label> // Label
                        <input
                          type="date"
                          value={item.amcFromDate ? new Date(item.amcFromDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleItemDateChange(index, "amcFromDate", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                      <div style={componentStyles.formGroup}> // Form group
                        <label>AMC To Date:</label> // Label
                        <input
                          type="date"
                          value={item.amcToDate ? new Date(item.amcToDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleItemDateChange(index, "amcToDate", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                    </div>

                    <div style={componentStyles.formRow}> // Form row
                      <div style={componentStyles.formGroup}> // Form group
                        <label>AMC Cost:</label> // Label
                        <input
                          type="number"
                          value={item.amcCost || ""}
                          onChange={(e) => handleItemChange(index, "amcCost", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                      <div style={componentStyles.formGroup}> // Form group
                        <label>AMC Photo:</label> // Label
                        <input
                          type="file"
                          onChange={(e) => { // Handle file selection
                            if (e.target.files[0]) { // Check if file exists
                              handleFileUpload(e.target.files[0], "amcPhoto", index); // Upload file
                            }
                          }}
                          style={componentStyles.input}
                        />
                        {renderImagePreview(item.amcPhotoUrl)} // Render AMC photo preview
                      </div>
                    </div>
                  </div>

                  {/* Warranty Information */}
                  <div style={componentStyles.subSection}> // Warranty section
                    <h6>Warranty Information</h6> // Section title
                    <div style={componentStyles.formRow}> // Form row
                      <div style={componentStyles.formGroup}> // Form group
                        <label>Warranty Number:</label> // Label
                        <input
                          type="text"
                          value={item.warrantyNumber || ""}
                          onChange={(e) => handleItemChange(index, "warrantyNumber", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                      <div style={componentStyles.formGroup}> // Form group
                        <label>Warranty Valid Until:</label> // Label
                        <input
                          type="date"
                          value={item.warrantyValidUpto ? new Date(item.warrantyValidUpto).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleItemDateChange(index, "warrantyValidUpto", e.target.value)}
                          style={componentStyles.input}
                        />
                      </div>
                    </div>

                    <div style={componentStyles.formGroup}> // Form group
                      <label>Warranty Photo:</label> // Label
                      <input
                        type="file"
                        onChange={(e) => { // Handle file selection
                          if (e.target.files[0]) { // Check if file exists
                            handleFileUpload(e.target.files[0], "warrantyPhoto", index); // Upload file
                          }
                        }}
                        style={componentStyles.input}
                      />
                      {renderImagePreview(item.warrantyPhotoUrl)} // Render warranty photo preview
                    </div>
                  </div>

                  <div style={componentStyles.formGroup}> // Form group
                    <label>Item Photo:</label> // Label
                    <input
                      type="file"
                      onChange={(e) => { // Handle file selection
                        if (e.target.files[0]) { // Check if file exists
                          handleFileUpload(e.target.files[0], "itemPhoto", index); // Upload file
                        }
                      }}
                      style={componentStyles.input}
                    />
                    {renderImagePreview(item.itemPhotoUrl)} // Render item photo preview
                  </div>

                  {asset.assetType === "Permanent" && ( // Conditional rendering for permanent assets
                    <div style={componentStyles.formGroup}> // Form group
                      <label>Item IDs (comma separated):</label> // Label
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
        ) : ( // View mode rendering
          <>
            <div style={componentStyles.section}> // General information section
              <h4>General Information</h4> // Section title
              <div style={componentStyles.detailRow}> // Detail row
                <div style={componentStyles.detailGroup}> // Detail group
                  <p><strong>Asset Type:</strong> {asset.assetType || "N/A"}</p> // Display asset type
                  <p><strong>Asset Category:</strong> {asset.assetCategory || "N/A"}</p> // Display category
                  <p><strong>Entry Date:</strong> {new Date(asset.entryDate).toLocaleDateString()}</p> // Display entry date
                  <p><strong>Purchase Date:</strong> {new Date(asset.purchaseDate).toLocaleDateString()}</p> // Display purchase date
                </div>
                <div style={componentStyles.detailGroup}> // Detail group
                  <p><strong>Source:</strong> {asset.source || "N/A"}</p> // Display source
                  <p><strong>Mode of Purchase:</strong> {asset.modeOfPurchase || "N/A"}</p> // Display mode of purchase
                  <p><strong>Bill No:</strong> {asset.billNo || "N/A"}</p> // Display bill number
                  <p><strong>Received By:</strong> {asset.receivedBy || "N/A"}</p> // Display received by
                </div>
              </div>

              <div style={componentStyles.detailRow}> // Detail row
                <div style={componentStyles.detailGroup}> // Detail group
                  <p><strong>Supplier Name:</strong> {asset.supplierName || "N/A"}</p> // Display supplier name
                  <p><strong>Supplier Address:</strong> {asset.supplierAddress || "N/A"}</p> // Display supplier address
                </div>
              </div>

              {asset.billPhotoUrl && ( // Conditional rendering for bill photo
                <div style={componentStyles.detailGroup}> // Detail group
                  <p><strong>Bill Photo:</strong></p> // Label
                  {renderImagePreview(asset.billPhotoUrl)} // Render bill photo preview
                </div>
              )}
            </div>

            {/* Items Section */}
            <div style={componentStyles.section}> // Items section
              <h4>Items</h4> // Section title
              {asset.items?.map((item, index) => ( // Map over items
                <div key={index} style={componentStyles.itemViewContainer}> // Item container
                  <div style={componentStyles.itemHeader}> // Item header
                    <h5>Item {index + 1}</h5> // Item title
                  </div>
                  
                  <div style={componentStyles.detailRow}> // Detail row
                    <div style={componentStyles.detailGroup}> // Detail group
                      <p><strong>Name:</strong> {item.itemName || "N/A"}</p> // Display item name
                      <p><strong>Sub Category:</strong> {item.subCategory || "N/A"}</p> // Display sub category
                      <p><strong>Description:</strong> {item.itemDescription || "N/A"}</p> // Display description
                    </div>
                    <div style={componentStyles.detailGroup}> // Detail group
                      <p><strong>Quantity:</strong> {item.quantityReceived || "N/A"}</p> // Display quantity
                      <p><strong>Unit Price:</strong> {item.unitPrice || "N/A"}</p> // Display unit price
                      <p><strong>Total Price:</strong> {item.totalPrice || "N/A"}</p> // Display total price
                    </div>
                  </div>

                  {/* AMC Information */}
                  {(item.amcFromDate || item.amcToDate || item.amcCost) && ( // Conditional rendering for AMC info
                    <div style={componentStyles.subSection}> // AMC section
                      <h3>AMC Information</h3> // Section title
                      <div style={componentStyles.detailRow}> // Detail row
                        <div style={componentStyles.detailGroup}> // Detail group
                          {item.amcFromDate && <p><strong>From:</strong> {new Date(item.amcFromDate).toLocaleDateString()}</p>} // Display AMC from date
                          {item.amcToDate && <p><strong>To:</strong> {new Date(item.amcToDate).toLocaleDateString()}</p>} // Display AMC to date
                          {item.amcCost && <p><strong>Cost:</strong> {item.amcCost}</p>} // Display AMC cost
                        </div>
                        {item.amcPhotoUrl && ( // Conditional rendering for AMC photo
                          <div style={componentStyles.detailGroup}> // Detail group
                            <p><strong>AMC Photo:</strong></p> // Label
                            {renderImagePreview(item.amcPhotoUrl)} // Render AMC photo preview
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warranty Information */}
                  {(item.warrantyNumber || item.warrantyValidUpto) && ( // Conditional rendering for warranty info
                    <div style={componentStyles.subSection}> // Warranty section
                      <h3>Warranty Information</h3> // Section title
                      <div style={componentStyles.detailRow}> // Detail row
                        <div style={componentStyles.detailGroup}> // Detail group
                          {item.warrantyNumber && <p><strong>Number:</strong> {item.warrantyNumber}</p>} // Display warranty number
                          {item.warrantyValidUpto && <p><strong>Valid Until:</strong> {new Date(item.warrantyValidUpto).toLocaleDateString()}</p>} // Display warranty valid until
                        </div>
                        {item.warrantyPhotoUrl && ( // Conditional rendering for warranty photo
                          <div style={componentStyles.detailGroup}> // Detail group
                            <p><strong>Warranty Photo:</strong></p> // Label
                            {renderImagePreview(item.warrantyPhotoUrl)} // Render warranty photo preview
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.itemPhotoUrl && ( // Conditional rendering for item photo
                    <div style={componentStyles.detailGroup}> // Detail group
                      <p><strong>Item Photo:</strong></p> // Label
                      {renderImagePreview(item.itemPhotoUrl)} // Render item photo preview
                    </div>
                  )}

                  {asset.assetType === "Permanent" && item.itemIds?.length > 0 && ( // Conditional rendering for item IDs
                    <div style={componentStyles.detailGroup}> // Detail group
                      <p><strong>Item IDs:</strong> {item.itemIds.join(", ")}</p> // Display item IDs
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

  return ( // Render the component UI
    <div className="asset-updation"> // Main container
      <meta charSet="UTF-8" /> // Set character encoding
      <meta name="viewport" content="width=device-width, initial-scale=1.0" /> // Set responsive viewport
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" /> // Import Boxicons CSS
      <title>CASFOS - Asset Updation</title> // Set page title

      <section id="sidebar"> // Sidebar navigation section
        <a href="#" className="brand"> // Brand logo/link
          <span className="text">PRINCIPAL</span> // Display Principal title
        </a>
        <ul className="side-menu top"> // Top navigation menu
          <li><a href={`/principaldashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li> // Home menu item
          <li className="active"><a href={`/principalassetupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Updation</span></a></li> // Asset Updation menu item (active)
          <li><a href={`/principalassetview?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset View</span></a></li> // Asset View menu item
          <li><a href={`/principalfacultyupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Faculty Updation</span></a></li> // Faculty Updation menu item
          <li><a href={`/principalfacultyview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li> // Faculty View menu item
        </ul>
        <ul className="side-menu"> // Bottom navigation menu
          <li><Link to="/login" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></Link></li> // Logout menu item
        </ul>
      </section>

      <section id="content" style={componentStyles.content}> // Main content section
        <nav style={componentStyles.nav}> // Navigation bar
          <i className="bx bx-menu" /> // Menu toggle icon
          <span style={componentStyles.headTitle}>Dashboard</span> // Dashboard title
          <div style={componentStyles.usernameContainer}> // Username display container
            <i className="bx bxs-user-circle" style={componentStyles.userIcon}></i> // User icon
            <span style={componentStyles.username}>{username}</span> // Display username
          </div>
        </nav>

        <h2 style={componentStyles.title}>Asset Updation</h2> // Section title
        <div style={componentStyles.tabContainer}> // Tab container
          <button 
            style={activeTab === "permanent" ? componentStyles.activeTab : componentStyles.tab} 
            onClick={() => setActiveTab("permanent")} // Switch to permanent tab
          >
            Permanent Assets
          </button>
          <button 
            style={activeTab === "consumable" ? componentStyles.activeTab : componentStyles.tab} 
            onClick={() => setActiveTab("consumable")} // Switch to consumable tab
          >
            Consumable Assets
          </button>
        </div>

        <div style={componentStyles.container}> // Main content container
          {/* Search inputs */}
          {activeTab === "permanent" && ( // Permanent search input
            <div style={componentStyles.searchContainer}> // Search container
              <input
                type="text"
                placeholder="Search permanent assets by item name..."
                value={permanentSearchTerm}
                onChange={(e) => setPermanentSearchTerm(e.target.value)}
                style={componentStyles.searchInput}
              />
            </div>
          )}

          {activeTab === "consumable" && ( // Consumable search input
            <div style={componentStyles.searchContainer}> // Search container
              <input
                type="text"
                placeholder="Search consumable assets by item name..."
                value={consumableSearchTerm}
                onChange={(e) => setConsumableSearchTerm(e.target.value)}
                style={componentStyles.searchInput}
              />
            </div>
          )}

          <div style={componentStyles.cardContainer}> // Card container
            {activeTab === "permanent" && ( // Permanent assets rendering
              filteredPermanentAssets.length > 0 ? ( // Check if assets exist
                filteredPermanentAssets.map(renderAssetCard) // Render asset cards
              ) : (
                <div style={componentStyles.noResults}> // No results message
                  {permanentSearchTerm 
                    ? `No permanent assets found matching "${permanentSearchTerm}"` 
                    : "No permanent assets available"}
                </div>
              )
            )}
            {activeTab === "consumable" && ( // Consumable assets rendering
              filteredConsumableAssets.length > 0 ? ( // Check if assets exist
                filteredConsumableAssets.map(renderAssetCard) // Render asset cards
              ) : (
                <div style={componentStyles.noResults}> // No results message
                  {consumableSearchTerm 
                    ? `No consumable assets found matching "${consumableSearchTerm}"` 
                    : "No consumable assets available"}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {popupData && ( // Render popup if popupData is set
        <div style={componentStyles.popupOverlay}> // Popup overlay
          <div style={componentStyles.popupContent}> // Popup content
            <h3>{popupData.assetType} Asset Details</h3> // Popup title
            <div style={componentStyles.popupScrollableContent}> // Scrollable content
              {renderAssetDetails(popupData)} // Render asset details
            </div>
            <div style={componentStyles.popupButtons}> // Button container
              {editMode ? ( // Edit mode buttons
                <>
                  <button 
                    style={componentStyles.saveButton}
                    onClick={saveChanges} // Save changes
                  >
                    Save Changes
                  </button>
                  <button 
                    style={componentStyles.cancelButton}
                    onClick={() => { // Cancel edit
                      setEditMode(false);
                      setPopupData(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : ( // View mode button
                <button 
                  style={componentStyles.closeButton}
                  onClick={() => setPopupData(null)} // Close popup
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

const componentStyles = { // Inline styles object
  content: {}, // Empty content style
  cardContainer: { // Style for card container
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  searchContainer: { // Style for search container
    padding: "10px 20px",
    marginBottom: "15px",
    backgroundColor: "#fff",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  searchInput: { // Style for search input
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
  noResults: { // Style for no results message
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "18px"
  },
  card: { // Style for asset card
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "transform 0.2s",
  },
  cardHeader: { // Style for card header
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetTypeBadge: { // Style for asset type badge
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
  },
  cardBody: { // Style for card body
    padding: "15px",
    fontSize: "14px",
    color: "#333",
  },
  imagePreviewContainer: { // Style for image preview container
    marginTop: '5px',
    textAlign: 'center',
  },
  imagePreview: { // Style for image preview
    width: '300px',
    height: '150px',
    objectFit: 'contain',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '2px',
    backgroundColor: '#f5f5f5',
  },
  imageLink: { // Style for image link
    display: 'block',
    marginTop: '5px',
    color: '#007BFF',
    textDecoration: 'none',
    fontSize: '12px',
  },
  cardFooter: { // Style for card footer
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eee",
  },
  viewButton: { // Style for view button
    padding: "8px 16px", 
    backgroundColor: "#007BFF", 
    color: "#fff", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer" 
  },
  editButton: { // Style for edit button
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  nav: { // Style for navigation bar
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "10px 20px" 
  },
  headTitle: { // Style for dashboard title
    fontSize: "20px", 
    fontWeight: "bold" 
  },
  usernameContainer: { // Style for username container
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    fontSize: "14px", 
    color: "#555" 
  },
  userIcon: { // Style for user icon
    fontSize: "30px", 
    color: "#007BFF" 
  },
  username: { // Style for username text
    fontWeight: "bold", 
    fontSize: "18px" 
  },
  title: { // Style for section title
    fontSize: "28px", 
    fontWeight: "bold", 
    marginTop: "50px", 
    marginBottom: "15px", 
    marginLeft: "20px", 
    color: "#333" 
  },
  tabContainer: { // Style for tab container
    display: "flex", 
    gap: "10px", 
    marginBottom: "20px", 
    marginLeft: "20px" 
  },
  tab: { // Style for inactive tab
    padding: "10px 20px", 
    backgroundColor: "#ddd", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer" 
  },
  activeTab: { // Style for active tab
    padding: "10px 20px", 
    backgroundColor: "#007BFF", 
    color: "#fff", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer" 
  },
  container: { // Style for main content container
    maxWidth: "1200px", 
    margin: "15px auto", 
    padding: "20px", 
    borderRadius: "10px", 
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
    backgroundColor: "#fff" 
  },
  assetDetails: { // Style for asset details
    padding: "20px",
  },
  formGroup: { // Style for form group
    marginBottom: "15px",
  },
  input: { // Style for input fields
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  textarea: { // Style for textarea
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    minHeight: "80px",
  },
  itemContainer: { // Style for item container (unused)
    border: "1px solid #eee",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  popupOverlay: { // Style for popup overlay
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
  popupContent: { // Style for popup content
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
  popupScrollableContent: { // Style for scrollable popup content
    maxHeight: "60vh", 
    overflowY: "auto", 
    paddingRight: "10px" 
  },
  popupButtons: { // Style for popup buttons
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "15px",
  },
  saveButton: { // Style for save button
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: { // Style for cancel button
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  closeButton: { // Style for close button
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default PrincipalAssetUpdation; // Export the component