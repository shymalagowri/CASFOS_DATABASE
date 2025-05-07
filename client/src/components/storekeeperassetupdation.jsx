
/**
 * Overview:
 * This is a React component for a Storekeeper Asset Updation page in an asset management system.
 * It allows storekeepers to view, edit, and update permanent and consumable assets, as well as manage
 * condition changes for returned assets. Key features include:
 * - Tabbed interface for Permanent, Consumable, and Condition Change views.
 * - Asset cards with search functionality and sorting by item name.
 * - Detailed asset view/edit popup with support for file uploads (bill, item, warranty, AMC photos).
 * - Handling of rejected updates with automatic population of previously rejected data.
 * - API integration using axios for fetching assets, pending updates, and submitting changes.
 * - SweetAlert2 for user notifications and confirmations.
 * - Responsive design with a sidebar for navigation and a modern UI styled via CSS and inline styles.
 * 
 * The component uses React Router for navigation, URL parameter parsing, and state management with useState/useEffect hooks.
 * It communicates with a backend API at 'http://${ip}:${port}' for asset-related operations.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/style.css';

// Role options for condition change dropdown
const CONDITION_OPTIONS = {
  Permanent: ['Good', 'To Be Serviced', 'To Be Disposed'],
  Consumable: ['Good', 'To Be Exchanged', 'To Be Disposed'],
};

// Map backend condition to display values
const CONDITION_DISPLAY_MAP = {
  Good: 'Good',
  service: 'To Be Serviced',
  dispose: 'To Be Disposed',
  exchange: 'To Be Exchanged',
};

const StorekeeperAssetUpdation = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // State management
  const [isRejectedUpdate, setIsRejectedUpdate] = useState(false);
  const [permanentAssets, setPermanentAssets] = useState([]);
  const [consumableAssets, setConsumableAssets] = useState([]);
  const [returnedAssets, setReturnedAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('permanent');
  const [popupData, setPopupData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAsset, setEditedAsset] = useState({});
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [permanentSearchTerm, setPermanentSearchTerm] = useState('');
  const [consumableSearchTerm, setConsumableSearchTerm] = useState('');
  const [returnedSearchTerm, setReturnedSearchTerm] = useState('');
  const [displayPermanentSearchTerm, setDisplayPermanentSearchTerm] = useState('');
  const [displayConsumableSearchTerm, setDisplayConsumableSearchTerm] = useState('');
  const [displayReturnedSearchTerm, setDisplayReturnedSearchTerm] = useState('');

  // Router and URL params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username') || 'Guest';
  const rejectedId = queryParams.get('rejectedId');
  const assetType = queryParams.get('assetType');
  const serverBaseUrl = `http://${ip}:${port}`;

  /**
   * Checks if an asset has a pending update
   * @param {string} assetId - The ID of the asset
   * @returns {boolean} - True if the asset has a pending update
   */
  const isPendingUpdate = (assetId) => {
    return pendingUpdates.some((update) => update.assetId.toString() === assetId.toString());
  };
  const [showAddIdPopup, setShowAddIdPopup] = useState(false);
  const [showRemoveIdPopup, setShowRemoveIdPopup] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [newItemId, setNewItemId] = useState("");
  const [selectedIdsToRemove, setSelectedIdsToRemove] = useState([]);
  
  // Add these handler functions
  const handleAddIdClick = (index) => {
    setCurrentItemIndex(index);
    setShowAddIdPopup(true);
    setNewItemId("");
  };
  
  const handleRemoveIdClick = (index) => {
    setCurrentItemIndex(index);
    setSelectedIdsToRemove([]);
    setShowRemoveIdPopup(true);
  };
  
  const handleAddId = () => {
    if (!newItemId.trim()) return;
    
    setEditedAsset(prev => {
      const newItems = [...prev.items];
      const currentIds = newItems[currentItemIndex].itemIds || [];
      newItems[currentItemIndex] = {
        ...newItems[currentItemIndex],
        itemIds: [...currentIds, newItemId.trim()]
      };
      return { ...prev, items: newItems };
    });
    
    setShowAddIdPopup(false);
  };
  
  const handleRemoveIds = () => {
    setEditedAsset(prev => {
      const newItems = [...prev.items];
      const currentIds = newItems[currentItemIndex].itemIds || [];
      newItems[currentItemIndex] = {
        ...newItems[currentItemIndex],
        itemIds: currentIds.filter(id => !selectedIdsToRemove.includes(id))
      };
      return { ...prev, items: newItems };
    });
    
    setShowRemoveIdPopup(false);
  };
  
  const toggleIdSelection = (id) => {
    setSelectedIdsToRemove(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };
  
  /**
   * Fetches assets and pending updates on component mount
   */
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const [permResponse, consResponse] = await Promise.all([
          axios.get(`${serverBaseUrl}/api/assets/permanent`),
          axios.get(`${serverBaseUrl}/api/assets/consumable`),
        ]);
        setPermanentAssets(permResponse.data);
        setConsumableAssets(consResponse.data);
      } catch (error) {
        console.error('Error fetching assets:', error);
        Swal.fire('Error!', 'Failed to load assets.', 'error');
      }
    };

    const fetchPendingUpdates = async () => {
      try {
        const response = await axios.get(`${serverBaseUrl}/api/assets/pendingUpdates`);
        setPendingUpdates(response.data.filter((update) => update.status === 'pending'));
      } catch (error) {
        console.error('Error fetching pending updates:', error);
      }
    };

    fetchAssets();
    fetchPendingUpdates();
  }, []);

  /**
   * Handles rejected update logic when rejectedId and assetType are present
   */
  useEffect(() => {
    const handleRejectedUpdate = async () => {
      if (!rejectedId || !assetType || (!permanentAssets.length && !consumableAssets.length)) return;

      setIsRejectedUpdate(true);
      setActiveTab(assetType.toLowerCase());

      try {
        const response = await axios.get(`${serverBaseUrl}/api/assets/rejected-asset/${rejectedId}`);
        const rejectedAsset = response.data;

        if (!rejectedAsset) {
          throw new Error('Rejected asset not found');
        }

        const assetList = assetType === 'Permanent' ? permanentAssets : consumableAssets;
        const originalAsset = assetList.find((a) => a._id === rejectedAsset.data.assetId.toString());

        if (originalAsset) {
          setPopupData(originalAsset);
          setEditedAsset(rejectedAsset.data.updatedData);
          setEditMode(true);
        } else {
          throw new Error('Original asset not found');
        }
      } catch (error) {
        console.error('Error fetching rejected asset:', error);
        Swal.fire('Error!', error.message || 'Failed to load rejected asset data.', 'error');
      }
    };

    handleRejectedUpdate();
  }, [rejectedId, assetType, permanentAssets, consumableAssets]);

  /**
   * Fetches approved returned assets when conditionChange tab is active
   */
  useEffect(() => {
    if (activeTab !== 'conditionChange') return;

    const fetchReturnedAssets = async () => {
      try {
        const [permResponse, consResponse] = await Promise.all([
          axios.get(`${serverBaseUrl}/api/assets/getReturnedForConditionChange`, {
            params: { assetType: 'Permanent', approved: 'yes' },
          }),
          axios.get(`${serverBaseUrl}/api/assets/getReturnedForConditionChange`, {
            params: { assetType: 'Consumable', approved: 'yes' },
          }),
        ]);

        const permAssets = permResponse.data.map((asset) => ({ ...asset, assetType: 'Permanent' }));
        const consAssets = consResponse.data.map((asset) => ({ ...asset, assetType: 'Consumable' }));
        setReturnedAssets([...permAssets, ...consAssets]);
      } catch (error) {
        console.error('Error fetching returned assets:', error);
        Swal.fire('Error!', 'Failed to load returned assets.', 'error');
      }
    };

    fetchReturnedAssets();
  }, [activeTab]);

  /**
   * Debounce search terms for performance
   */
  useEffect(() => {
    const handler = setTimeout(() => setDisplayPermanentSearchTerm(permanentSearchTerm), 300);
    return () => clearTimeout(handler);
  }, [permanentSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => setDisplayConsumableSearchTerm(consumableSearchTerm), 300);
    return () => clearTimeout(handler);
  }, [consumableSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => setDisplayReturnedSearchTerm(returnedSearchTerm), 300);
    return () => clearTimeout(handler);
  }, [returnedSearchTerm]);

  // Filter and sort assets
  const filteredPermanentAssets = permanentAssets
    .filter((asset) =>
      asset.items?.[0]?.itemName?.toLowerCase().includes(displayPermanentSearchTerm.toLowerCase())
    )
    .sort((a, b) => (a.items?.[0]?.itemName || '').localeCompare(b.items?.[0]?.itemName || ''));

  const filteredConsumableAssets = consumableAssets
    .filter((asset) =>
      asset.items?.[0]?.itemName?.toLowerCase().includes(displayConsumableSearchTerm.toLowerCase())
    )
    .sort((a, b) => (a.items?.[0]?.itemName || '').localeCompare(b.items?.[0]?.itemName || ''));

  const filteredReturnedAssets = returnedAssets
    .filter((asset) => asset.itemName?.toLowerCase().includes(displayReturnedSearchTerm.toLowerCase()))
    .sort((a, b) => (a.itemName || '').localeCompare(b.itemName || ''));

  /**
   * Initiates edit mode for an asset
   * @param {Object} asset - The asset to edit
   */
  const handleEditClick = (asset) => {
    setEditedAsset(JSON.parse(JSON.stringify(asset)));
    setEditMode(true);
    setPopupData(asset);
  };

  /**
   * Handles input changes for general asset fields
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAsset((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles file uploads for asset photos
   * @param {File} file - The file to upload
   * @param {string} fieldName - The field to update (billPhoto, itemPhoto, etc.)
   * @param {number} index - Item index for item-specific uploads
   */
  const handleFileUpload = async (file, fieldName, index) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/uploadFile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEditedAsset((prev) => {
        if (fieldName === 'billPhoto') {
          return { ...prev, billPhotoUrl: response.data.fileUrl };
        }
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [`${fieldName}Url`]: response.data.fileUrl };
        return { ...prev, items: newItems };
      });
    } catch (error) {
      console.error('File upload failed:', error);
      Swal.fire('Error!', 'File upload failed. Please try again.', 'error');
    }
  };

  /**
   * Handles changes to item-specific fields
   * @param {number} index - Item index
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleItemChange = (index, field, value) => {
    setEditedAsset((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  /**
   * Handles date changes for general asset fields
   * @param {string} name - Field name
   * @param {string} dateString - New date value
   */
  const handleDateChange = (name, dateString) => {
    setEditedAsset((prev) => ({ ...prev, [name]: new Date(dateString) }));
  };

  /**
   * Handles date changes for item-specific fields
   * @param {number} index - Item index
   * @param {string} field - Field name
   * @param {string} dateString - New date value
   */
  const handleItemDateChange = (index, field, dateString) => {
    handleItemChange(index, field, new Date(dateString));
  };

  /**
   * Submits asset changes for approval
   */
  const saveChanges = async () => {
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/submitForApproval`, {
        assetId: editedAsset._id,
        assetType: activeTab === 'permanent' ? 'Permanent' : 'Consumable',
        originalData: popupData,
        updatedData: editedAsset,
      });

      if (response.status === 200) {
        Swal.fire('Success!', 'Asset update submitted for approval.', 'success');
        if (isRejectedUpdate && rejectedId) {
          await axios.delete(`${serverBaseUrl}/api/assets/rejected-asset/${rejectedId}`);
        }
        clearRejectedUpdate();

        const updatesResponse = await axios.get(`${serverBaseUrl}/api/assets/pendingUpdates`);
        setPendingUpdates(updatesResponse.data.filter((update) => update.status === 'pending'));
      }
    } catch (error) {
      console.error('Error submitting asset update:', error);
      Swal.fire('Error!', 'Failed to submit asset update for approval.', 'error');
    }
  };

  /**
   * Handles condition changes for returned assets
   * @param {string} assetId - The ID of the asset
   * @param {string} newCondition - The new condition to set
   */
  const handleConditionChange = async (assetId, newCondition) => {
    const asset = returnedAssets.find((a) => a._id === assetId);
    if (!asset) return;

    const conditionMap = {
      Good: 'Good',
      'To Be Serviced': 'service',
      'To Be Disposed': 'dispose',
      'To Be Exchanged': 'exchange',
    };
    const backendCondition = conditionMap[newCondition];

    if (!backendCondition) {
      Swal.fire('Error!', 'Invalid condition selected.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change the condition of ${asset.itemName} to ${newCondition}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${serverBaseUrl}/api/assets/updateReturnCondition/${asset._id}`, {
          condition: backendCondition,
          assetType: asset.assetType,
        });

        if (response.status === 200 && response.data.success) {
          setReturnedAssets((prev) =>
            prev.map((a) =>
              a._id === asset._id ? { ...a, status: backendCondition, newCondition } : a
            )
          );
          Swal.fire('Success!', `Condition changed to ${newCondition}.`, 'success');
        } else {
          throw new Error(response.data.message || 'Failed to update condition');
        }
      } catch (error) {
        console.error('Error updating condition:', error);
        Swal.fire('Error!', `Failed to update condition: ${error.message}`, 'error');
      }
    }
  };

  /**
   * Clears rejected update state and URL params
   */
  const clearRejectedUpdate = () => {
    setEditMode(false);
    setPopupData(null);
    setIsRejectedUpdate(false);
    window.history.replaceState(
      null,
      '',
      `/storekeeperassetupdation?username=${encodeURIComponent(username)}`
    );
  };

  /**
   * Renders an asset card for permanent/consumable assets
   * @param {Object} asset - The asset to render
   * @returns {JSX.Element} - The asset card component
   */
  const renderAssetCard = (asset) => {
    const firstItem = asset.items?.[0] || {};
    return (
      <div key={asset._id} style={componentStyles.card}>
        <div style={componentStyles.cardHeader}>
          <h3>{firstItem.itemName || 'Unnamed Asset'}</h3>
          <span style={componentStyles.assetTypeBadge}>{asset.assetType}</span>
        </div>
        <div style={componentStyles.cardBody}>
          <p>
            <strong>Category:</strong> {asset.assetCategory || 'N/A'}
          </p>
          <p>
            <strong>Sub Category:</strong> {firstItem.subCategory || 'N/A'}
          </p>
          <p>
            <strong>Purchase Date:</strong> {new Date(asset.purchaseDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Supplier:</strong> {asset.supplierName || 'N/A'}
          </p>
          <p>
            <strong>Bill No:</strong> {asset.billNo || 'N/A'}
          </p>
          {asset.assetType === 'Permanent' && (
            <p>
              <strong>Item IDs:</strong> {firstItem.itemIds?.join(', ') || 'N/A'}
            </p>
          )}
          {asset.assetType === 'Consumable' && (
            <p>
              <strong>Quantity:</strong> {firstItem.quantityReceived || 'N/A'}
            </p>
          )}
        </div>
        <div style={componentStyles.cardFooter}>
          <button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>
            View Details
          </button>
          {isPendingUpdate(asset._id) ? (
            <span style={componentStyles.pendingBadge}>Update Under Approval</span>
          ) : (
            <button style={componentStyles.editButton} onClick={() => handleEditClick(asset)}>
              Edit
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renders a card for returned assets
   * @param {Object} asset - The returned asset to render
   * @returns {JSX.Element} - The returned asset card component
   */
  const renderReturnedAssetCard = (asset) => {
    const currentDropdownCondition = asset.newCondition || CONDITION_DISPLAY_MAP[asset.status] || 'Good';

    return (
      <div key={asset._id} style={componentStyles.card}>
        <div style={componentStyles.cardHeader}>
          <h3>{asset.itemName || 'Unnamed Asset'}</h3>
          <span style={componentStyles.assetTypeBadge}>{asset.assetType}</span>
        </div>
        <div style={componentStyles.cardBody}>
          <p>
            <strong>Category:</strong> {asset.assetCategory || 'N/A'}
          </p>
          <p>
            <strong>Sub Category:</strong> {asset.subCategory || 'N/A'}
          </p>
          <p>
            <strong>Location:</strong> {asset.location || 'N/A'}
          </p>
          {asset.assetType === 'Permanent' && (
            <p>
              <strong>Item ID:</strong> {asset.itemId || 'N/A'}
            </p>
          )}
          {asset.assetType === 'Consumable' && (
            <p>
              <strong>Return Quantity:</strong> {asset.returnQuantity || 'N/A'}
            </p>
          )}
          <p>
            <strong>Current Condition:</strong> {CONDITION_DISPLAY_MAP[asset.status] || asset.status || 'N/A'}
          </p>
          <div style={componentStyles.conditionSelect}>
            <label>
              <strong>Change Condition:</strong>
            </label>
            <select
              value={currentDropdownCondition}
              onChange={(e) => handleConditionChange(asset._id, e.target.value)}
              style={componentStyles.select}
            >
              {CONDITION_OPTIONS[asset.assetType].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={componentStyles.cardFooter}>
          <button style={componentStyles.viewButton} onClick={() => setPopupData(asset)}>
            View Details
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renders an image preview with a link to the full image
   * @param {string} url - The image URL
   * @returns {JSX.Element|null} - The image preview component or null
   */
  const renderImagePreview = (url) => {
    if (!url) return null;
    return (
      <div style={componentStyles.imagePreviewContainer}>
        <img src={url} alt="Preview" style={componentStyles.imagePreview} />
        <a href={url} target="_blank" rel="noopener noreferrer" style={componentStyles.imageLink}>
          View Full Image
        </a>
      </div>
    );
  };

  /**
   * Renders detailed asset information for the popup
   * @param {Object} asset - The asset to display
   * @returns {JSX.Element|null} - The asset details component or null
   */
  const renderAssetDetails = (asset) => {
    if (!asset) return null;

    return (
      <div style={{ padding: '10px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '24px', color: '#333' }}>
          {asset.assetType} Asset Details
        </h3>
        {activeTab === 'conditionChange' ? (
          <div style={{ ...componentStyles.assetDetails, padding: '20px', backgroundColor: '#fff', borderRadius: '5px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>{asset.assetType} Returned Asset Details</h3>
            <div style={componentStyles.section}>
              <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>General Information</h4>
              <div style={componentStyles.detailRow}>
                <div style={componentStyles.detailGroup}>
                  <p>
                    <strong>Asset Type:</strong> {asset.assetType || 'N/A'}
                  </p>
                  <p>
                    <strong>Category:</strong> {asset.assetCategory || 'N/A'}
                  </p>
                  <p>
                    <strong>Item Name:</strong> {asset.itemName || 'N/A'}
                  </p>
                  <p>
                    <strong>Sub Category:</strong> {asset.subCategory || 'N/A'}
                  </p>
                </div>
                <div style={componentStyles.detailGroup}>
                  <p>
                    <strong>Description:</strong> {asset.itemDescription || 'N/A'}
                  </p>
                  <p>
                    <strong>Location:</strong> {asset.location || 'N/A'}
                  </p>
                  {asset.assetType === 'Permanent' && (
                    <p>
                      <strong>Item ID:</strong> {asset.itemId || 'N/A'}
                    </p>
                  )}
                  {asset.assetType === 'Consumable' && (
                    <p>
                      <strong>Return Quantity:</strong> {asset.returnQuantity || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
              <div style={componentStyles.detailRow}>
                <div style={componentStyles.detailGroup}>
                  <p>
                    <strong>Status:</strong> {CONDITION_DISPLAY_MAP[asset.status] || asset.status || 'N/A'}
                  </p>
                  <p>
                    <strong>Remark:</strong> {asset.remark || 'N/A'}
                  </p>
                </div>
                <div style={componentStyles.detailGroup}>
                  {asset.pdfUrl && (
                    <p>
                      <strong>Receipt PDF:</strong>{' '}
                      <a href={asset.pdfUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </p>
                  )}
                  {asset.signedPdfUrl && (
                    <p>
                      <strong>Signed PDF:</strong>{' '}
                      <a href={asset.signedPdfUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={componentStyles.assetDetails}>
            {editMode ? (
              <div style={{ ...componentStyles.editForm, backgroundColor: '#fff', padding: '20px', borderRadius: '5px' }}>
                <div style={componentStyles.section}>
                  <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>General Information</h4>
                  <div style={componentStyles.formRow}>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Asset Type:</label>
                      <input
                        type="text"
                        name="assetType"
                        value={editedAsset.assetType || ''}
                        onChange={handleInputChange}
                        style={componentStyles.input}
                        disabled
                      />
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Asset Category:</label>
                      <input
                        type="text"
                        name="assetCategory"
                        value={editedAsset.assetCategory || ''}
                        onChange={handleInputChange}
                        style={componentStyles.input}
                      />
                    </div>
                  </div>
                  <div style={componentStyles.formRow}>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Entry Date:</label>
                      <input
                        type="date"
                        name="entryDate"
                        value={
                          editedAsset.entryDate
                            ? new Date(editedAsset.entryDate).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => handleDateChange('entryDate', e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Purchase Date:</label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={
                          editedAsset.purchaseDate
                            ? new Date(editedAsset.purchaseDate).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => handleDateChange('purchaseDate', e.target.value)}
                        style={componentStyles.input}
                      />
                    </div>
                  </div>
                  <div style={componentStyles.formRow}>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Source:</label>
                      <select
                        name="source"
                        value={editedAsset.source || ''}
                        onChange={handleInputChange}
                        style={componentStyles.input}
                      >
                        <option value="GEM">GEM</option>
                        <option value="Local">Local</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Mode of Purchase:</label>
                      <select
                        name="modeOfPurchase"
                        value={editedAsset.modeOfPurchase || ''}
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
                      <label style={componentStyles.label}>Supplier Name:</label>
                      <input
                        type="text"
                        name="supplierName"
                        value={editedAsset.supplierName || ''}
                        onChange={handleInputChange}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Supplier Address:</label>
                      <input
                        type="text"
                        name="supplierAddress"
                        value={editedAsset.supplierAddress || ''}
                        onChange={handleInputChange}
                        style={componentStyles.input}
                      />
                    </div>
                  </div>
                  <div style={componentStyles.formRow}>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Bill No:</label>
                      <input
                        type="text"
                        name="billNo"
                        value={editedAsset.billNo || ''}
                        onChange={handleInputChange}
                        style={componentStyles.input}
                      />
                    </div>
                    <div style={componentStyles.formGroup}>
                      <label style={componentStyles.label}>Received By:</label>
                      <input
                        type="text"
                        name="receivedBy"
                        value={editedAsset.receivedBy || ''}
                        onChange={handleInputChange}
                        style={componentStyles.input}
                      />
                    </div>
                  </div>
                  <div style={componentStyles.formGroup}>
                    <label style={componentStyles.label}>Bill Photo:</label>
                    <input
                      type="file"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'billPhoto', 0)}
                      style={componentStyles.input}
                    />
                    {renderImagePreview(editedAsset.billPhotoUrl)}
                  </div>
                </div>
                <div style={componentStyles.section}>
                  <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>Items</h4>
                  {editedAsset.items?.map((item, index) => (
                    <div key={index} style={componentStyles.itemEditContainer}>
                      <div style={{ ...componentStyles.itemHeader, fontSize: '16px', fontWeight: '600' }}>
                        Item {index + 1}
                      </div>
                      <div style={componentStyles.formRow}>
                        <div style={componentStyles.formGroup}>
                          <label style={componentStyles.label}>Item Name:</label>
                          <input
                            type="text"
                            value={item.itemName || ''}
                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                            style={componentStyles.input}
                          />
                        </div>
                        <div style={componentStyles.formGroup}>
                          <label style={componentStyles.label}>Sub Category:</label>
                          <input
                            type="text"
                            value={item.subCategory || ''}
                            onChange={(e) => handleItemChange(index, 'subCategory', e.target.value)}
                            style={componentStyles.input}
                          />
                        </div>
                      </div>
                      <div style={componentStyles.formGroup}>
                        <label style={componentStyles.label}>Item Description:</label>
                        <textarea
                          value={item.itemDescription || ''}
                          onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                          style={componentStyles.textarea}
                        />
                      </div>
                      <div style={componentStyles.formRow}>
                        <div style={componentStyles.formGroup}>
                          <label style={componentStyles.label}>Quantity Received:</label>
                          <input
                            type="number"
                            value={item.quantityReceived || ''}
                            onChange={(e) => handleItemChange(index, 'quantityReceived', e.target.value)}
                            style={componentStyles.input}
                          />
                        </div>
                        <div style={componentStyles.formGroup}>
                          <label style={componentStyles.label}>Unit Price:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice || ''}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            style={componentStyles.input}
                          />
                        </div>
                        <div style={componentStyles.formGroup}>
                          <label style={componentStyles.label}>Total Price:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.totalPrice || ''}
                            onChange={(e) => handleItemChange(index, 'totalPrice', e.target.value)}
                            style={componentStyles.input}
                            disabled
                          />
                        </div>
                      </div>
                      <div style={componentStyles.subSection}>
                        <h6 style={{ fontSize: '14px', marginBottom: '10px' }}>AMC Information</h6>
                        <div style={componentStyles.formRow}>
                          <div style={componentStyles.formGroup}>
                            <label style={componentStyles.label}>AMC From Date:</label>
                            <input
                              type="date"
                              value={
                                item.amcFromDate
                                  ? new Date(item.amcFromDate).toISOString().split('T')[0]
                                  : ''
                              }
                              onChange={(e) => handleItemDateChange(index, 'amcFromDate', e.target.value)}
                              style={componentStyles.input}
                            />
                          </div>
                          <div style={componentStyles.formGroup}>
                            <label style={componentStyles.label}>AMC To Date:</label>
                            <input
                              type="date"
                              value={
                                item.amcToDate
                                  ? new Date(item.amcToDate).toISOString().split('T')[0]
                                  : ''
                              }
                              onChange={(e) => handleItemDateChange(index, 'amcToDate', e.target.value)}
                              style={componentStyles.input}
                            />
                          </div>
                        </div>
                        <div style={componentStyles.formRow}>
                          <div style={componentStyles.formGroup}>
                            <label style={componentStyles.label}>AMC Cost:</label>
                            <input
                              type="number"
                              value={item.amcCost || ''}
                              onChange={(e) => handleItemChange(index, 'amcCost', e.target.value)}
                              style={componentStyles.input}
                            />
                          </div>
                          <div style={componentStyles.formGroup}>
                            <label style={componentStyles.label}>AMC Photo:</label>
                            <input
                              type="file"
                              onChange={(e) =>
                                e.target.files[0] && handleFileUpload(e.target.files[0], 'amcPhoto', index)
                              }
                              style={componentStyles.input}
                            />
                            {renderImagePreview(item.amcPhotoUrl)}
                          </div>
                        </div>
                      </div>
                      <div style={componentStyles.subSection}>
                        <h6 style={{ fontSize: '14px', marginBottom: '10px' }}>Warranty Information</h6>
                        <div style={componentStyles.formRow}>
                          <div style={componentStyles.formGroup}>
                            <label style={componentStyles.label}>Warranty Number:</label>
                            <input
                              type="text"
                              value={item.warrantyNumber || ''}
                              onChange={(e) => handleItemChange(index, 'warrantyNumber', e.target.value)}
                              style={componentStyles.input}
                            />
                          </div>
                          <div style={componentStyles.formGroup}>
                            <label style={componentStyles.label}>Warranty Valid Until:</label>
                            <input
                              type="date"
                              value={
                                item.warrantyValidUpto
                                  ? new Date(item.warrantyValidUpto).toISOString().split('T')[0]
                                  : ''
                              }
                              onChange={(e) =>
                                handleItemDateChange(index, 'warrantyValidUpto', e.target.value)
                              }
                              style={componentStyles.input}
                            />
                          </div>
                        </div>
                        <div style={componentStyles.formGroup}>
                          <label style={componentStyles.label}>Warranty Photo:</label>
                          <input
                            type="file"
                            onChange={(e) =>
                              e.target.files[0] && handleFileUpload(e.target.files[0], 'warrantyPhoto', index)
                            }
                            style={componentStyles.input}
                          />
                          {renderImagePreview(item.warrantyPhotoUrl)}
                        </div>
                      </div>
                      <div style={componentStyles.formGroup}>
                        <label style={componentStyles.label}>Item Photo:</label>
                        <input
                          type="file"
                          onChange={(e) =>
                            e.target.files[0] && handleFileUpload(e.target.files[0], 'itemPhoto', index)
                          }
                          style={componentStyles.input}
                        />
                        {renderImagePreview(item.itemPhotoUrl)}
                      </div>
                      {asset.assetType === 'Permanent' && (
                        <div style={componentStyles.formGroup}>
                          <label style={componentStyles.label}>Item IDs:</label>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button 
                              type="button" 
                              onClick={() => handleAddIdClick(index)}
                              style={componentStyles.smallButton}
                            >
                              Add ID
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveIdClick(index)}
                              style={componentStyles.smallButton}
                              disabled={!item.itemIds || item.itemIds.length === 0}
                            >
                              Remove ID
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.itemIds?.join(", ") || ""}
                            readOnly
                            style={componentStyles.input}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ ...componentStyles.viewDetails, padding: '20px', backgroundColor: '#fff', borderRadius: '5px' }}>
                <div style={componentStyles.section}>
                  <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>General Information</h4>
                  <div style={componentStyles.detailRow}>
                    <div style={componentStyles.detailGroup}>
                      <p>
                        <strong>Asset Type:</strong> {asset.assetType || 'N/A'}
                      </p>
                      <p>
                        <strong>Asset Category:</strong> {asset.assetCategory || 'N/A'}
                      </p>
                      <p>
                        <strong>Entry Date:</strong> {new Date(asset.entryDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Purchase Date:</strong> {new Date(asset.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={componentStyles.detailGroup}>
                      <p>
                        <strong>Source:</strong> {asset.source || 'N/A'}
                      </p>
                      <p>
                        <strong>Mode of Purchase:</strong> {asset.modeOfPurchase || 'N/A'}
                      </p>
                      <p>
                        <strong>Bill No:</strong> {asset.billNo || 'N/A'}
                      </p>
                      <p>
                        <strong>Received By:</strong> {asset.receivedBy || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div style={componentStyles.detailRow}>
                    <div style={componentStyles.detailGroup}>
                      <p>
                        <strong>Supplier Name:</strong> {asset.supplierName || 'N/A'}
                      </p>
                      <p>
                        <strong>Supplier Address:</strong> {asset.supplierAddress || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {asset.billPhotoUrl && (
                    <div style={componentStyles.detailGroup}>
                      <p>
                        <strong>Bill Photo:</strong>
                      </p>
                      {renderImagePreview(asset.billPhotoUrl)}
                    </div>
                  )}
                </div>
                <div style={componentStyles.section}>
                  <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>Items</h4>
                  {asset.items?.map((item, index) => (
                    <div key={index} style={componentStyles.itemViewContainer}>
                      <div style={{ ...componentStyles.itemHeader, fontSize: '16px', fontWeight: '600' }}>
                        Item {index + 1}
                      </div>
                      <div style={componentStyles.detailRow}>
                        <div style={componentStyles.detailGroup}>
                          <p>
                            <strong>Name:</strong> {item.itemName || 'N/A'}
                          </p>
                          <p>
                            <strong>Sub Category:</strong> {item.subCategory || 'N/A'}
                          </p>
                          <p>
                            <strong>Description:</strong> {item.itemDescription || 'N/A'}
                          </p>
                        </div>
                        <div style={componentStyles.detailGroup}>
                          <p>
                            <strong>Quantity:</strong> {item.quantityReceived || 'N/A'}
                          </p>
                          <p>
                            <strong>Unit Price:</strong> {item.unitPrice || 'N/A'}
                          </p>
                          <p>
                            <strong>Total Price:</strong> {item.totalPrice || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {(item.amcFromDate || item.amcToDate || item.amcCost) && (
                        <div style={componentStyles.subSection}>
                          <h6 style={{ fontSize: '14px', marginBottom: '10px' }}>AMC Information</h6>
                          <div style={componentStyles.detailRow}>
                            <div style={componentStyles.detailGroup}>
                              {item.amcFromDate && (
                                <p>
                                  <strong>From:</strong>{' '}
                                  {new Date(item.amcFromDate).toLocaleDateString()}
                                </p>
                              )}
                              {item.amcToDate && (
                                <p>
                                  <strong>To:</strong> {new Date(item.amcToDate).toLocaleDateString()}
                                </p>
                              )}
                              {item.amcCost && (
                                <p>
                                  <strong>Cost:</strong> {item.amcCost}
                                </p>
                              )}
                            </div>
                            {item.amcPhotoUrl && (
                              <div style={componentStyles.detailGroup}>
                                <p>
                                  <strong>AMC Photo:</strong>
                                </p>
                                {renderImagePreview(item.amcPhotoUrl)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {(item.warrantyNumber || item.warrantyValidUpto) && (
                        <div style={componentStyles.subSection}>
                          <h6 style={{ fontSize: '14px', marginBottom: '10px' }}>Warranty Information</h6>
                          <div style={componentStyles.detailRow}>
                            <div style={componentStyles.detailGroup}>
                              {item.warrantyNumber && (
                                <p>
                                  <strong>Number:</strong> {item.warrantyNumber}
                                </p>
                              )}
                              {item.warrantyValidUpto && (
                                <p>
                                  <strong>Valid Until:</strong>{' '}
                                  {new Date(item.warrantyValidUpto).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {item.warrantyPhotoUrl && (
                              <div style={componentStyles.detailGroup}>
                                <p>
                                  <strong>Warranty Photo:</strong>
                                </p>
                                {renderImagePreview(item.warrantyPhotoUrl)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {item.itemPhotoUrl && (
                        <div style={componentStyles.detailGroup}>
                          <p>
                            <strong>Item Photo:</strong>
                          </p>
                          {renderImagePreview(item.itemPhotoUrl)}
                        </div>
                      )}
                      {asset.assetType === 'Permanent' && item.itemIds?.length > 0 && (
                        <div style={componentStyles.detailGroup}>
                          <p>
                            <strong>Item IDs:</strong> {item.itemIds.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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

      {/* Sidebar Navigation */}
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
          <li>
            <a href={`/assetreturn?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Asset Return</span>
            </a>
          </li>
          <li className="active">
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

      {/* Main Content */}
      <section id="content" style={componentStyles.content}>
        <nav style={componentStyles.nav}>
          <i className="bx bx-menu" />
          <div style={componentStyles.usernameContainer}>
            <i className="bx bxs-user-circle" style={componentStyles.userIcon} />
            <span style={componentStyles.username}>{username}</span>
          </div>
        </nav>

        <h2 style={componentStyles.title}>Asset Updation</h2>
        <div style={componentStyles.tabContainer}>
          <button
            style={activeTab === 'permanent' ? componentStyles.activeTab : componentStyles.tab}
            onClick={() => setActiveTab('permanent')}
          >
            Permanent Assets
          </button>
          <button
            style={activeTab === 'consumable' ? componentStyles.activeTab : componentStyles.tab}
            onClick={() => setActiveTab('consumable')}
          >
            Consumable Assets
          </button>
         
        </div>

        <div style={componentStyles.container}>
          {/* Search Inputs */}
          {activeTab === 'permanent' && (
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
          {activeTab === 'consumable' && (
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
          {activeTab === 'conditionChange' && (
            <div style={componentStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search returned assets by item name..."
                value={returnedSearchTerm}
                onChange={(e) => setReturnedSearchTerm(e.target.value)}
                style={componentStyles.searchInput}
              />
            </div>
          )}

          {/* Asset Cards */}
          <div style={componentStyles.cardContainer}>
            {activeTab === 'permanent' &&
              (filteredPermanentAssets.length > 0 ? (
                filteredPermanentAssets.map(renderAssetCard)
              ) : (
                <div style={componentStyles.noResults}>
                  {permanentSearchTerm
                    ? `No permanent assets found matching "${permanentSearchTerm}"`
                    : 'No permanent assets available'}
                </div>
              ))}
            {activeTab === 'consumable' &&
              (filteredConsumableAssets.length > 0 ? (
                filteredConsumableAssets.map(renderAssetCard)
              ) : (
                <div style={componentStyles.noResults}>
                  {consumableSearchTerm
                    ? `No consumable assets found matching "${consumableSearchTerm}"`
                    : 'No consumable assets available'}
                </div>
              ))}
            {activeTab === 'conditionChange' &&
              (filteredReturnedAssets.length > 0 ? (
                filteredReturnedAssets.map(renderReturnedAssetCard)
              ) : (
                <div style={componentStyles.noResults}>
                  {returnedSearchTerm
                    ? `No returned assets found matching "${returnedSearchTerm}"`
                    : 'No approved returned assets available'}
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Asset Details Popup */}
      {popupData && (
        <div style={componentStyles.popupOverlay}>
          <div style={componentStyles.popupContent}>
            <div style={componentStyles.popupScrollableContent}>{renderAssetDetails(popupData)}</div>
            <div style={componentStyles.popupButtons}>
              {editMode ? (
                <>
                  <button style={componentStyles.saveButton} onClick={saveChanges}>
                    Save Changes
                  </button>
                  <button style={componentStyles.cancelButton} onClick={clearRejectedUpdate}>
                    Cancel
                  </button>
                </>
              ) : (
                <button style={componentStyles.closeButton} onClick={() => setPopupData(null)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {showAddIdPopup && (
        <div style={componentStyles.popupOverlay}>
          <div style={componentStyles.popupContent}>
            <h3>Add New Item ID</h3>
            <div style={{ margin: '20px 0' }}>
              <input
                type="text"
                value={newItemId}
                onChange={(e) => setNewItemId(e.target.value)}
                placeholder="Enter new item ID"
                style={componentStyles.input}
                autoFocus
              />
            </div>
            <div style={componentStyles.popupButtons}>
              <button 
                style={componentStyles.saveButton} 
                onClick={handleAddId}
                disabled={!newItemId.trim()}
              >
                Add ID
              </button>
              <button 
                style={componentStyles.cancelButton} 
                onClick={() => setShowAddIdPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveIdPopup && (
        <div style={componentStyles.popupOverlay}>
          <div style={componentStyles.popupContent}>
            <h3>Remove Item IDs</h3>
            <div style={{ margin: '20px 0', maxHeight: '300px', overflowY: 'auto' }}>
              {editedAsset.items[currentItemIndex]?.itemIds?.length > 0 ? (
                editedAsset.items[currentItemIndex].itemIds.map(id => (
                  <div key={id} style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIdsToRemove.includes(id)}
                        onChange={() => toggleIdSelection(id)}
                        style={{ marginRight: '10px' }}
                      />
                      {id}
                    </label>
                  </div>
                ))
              ) : (
                <p>No item IDs available</p>
              )}
            </div>
            <div style={componentStyles.popupButtons}>
              <button 
                style={componentStyles.saveButton} 
                onClick={handleRemoveIds}
                disabled={selectedIdsToRemove.length === 0}
              >
                Remove Selected
              </button>
              <button 
                style={componentStyles.cancelButton} 
                onClick={() => setShowRemoveIdPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component styles
const componentStyles = {
  content: {},
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  searchContainer: {
    padding: '10px 20px',
    marginBottom: '15px',
    backgroundColor: '#fff',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    ':focus': { borderColor: '#007BFF' },
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '18px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s',
  },
  cardHeader: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
  },
  cardBody: {
    padding: '15px',
    fontSize: '14px',
    color: '#333',
  },
  conditionSelect: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  select: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
  },
  imagePreviewContainer: {
    marginTop: '10px',
    textAlign: 'center',
    maxWidth: '300px',
  },
  imagePreview: {
    width: '100%',
    maxWidth: '250px',
    height: 'auto',
    maxHeight: '150px',
    objectFit: 'contain',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '5px',
    backgroundColor: '#f5f5f5',
  },
  imageLink: {
    display: 'block',
    marginTop: '5px',
    color: '#007BFF',
    textDecoration: 'none',
    fontSize: '12px',
  },
  cardFooter: {
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #eee',
  },
  viewButton: {
    padding: '8px 16px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
  },
  headTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  usernameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#555',
  },
  userIcon: {
    fontSize: '30px',
    color: '#007BFF',
  },
  username: {
    fontWeight: 'bold',
    fontSize: '18px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginTop: '50px',
    marginBottom: '15px',
    marginLeft: '20px',
    color: '#333',
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    marginLeft: '20px',
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: '#ddd',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  activeTab: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  container: {
    maxWidth: '1200px',
    margin: '15px auto',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  assetDetails: {
    padding: '20px',
    margin: '10px 0',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
  },
  formGroup: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    ':focus': { borderColor: '#007BFF', boxShadow: '0 0 5px rgba(0,123,255,0.3)' },
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minHeight: '100px',
    fontSize: '14px',
    outline: 'none',
    ':focus': { borderColor: '#007BFF', boxShadow: '0 0 5px rgba(0,123,255,0.3)' },
  },
  itemContainer: {
    border: '1px solid #eee',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '15px',
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    width: '900px',
    maxWidth: '95%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  popupScrollableContent: {
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: '0 15px',
  },
  popupButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  closeButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  detailGroup: {
    minWidth: '250px',
    padding: '10px',
    marginBottom: '10px',
  },
  itemEditContainer: {
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '5px',
    marginBottom: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  itemHeader: {
    marginBottom: '10px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    flexWrap: 'wrap',
  },
  subSection: {
    marginTop: '15px',
  },
  itemViewContainer: {
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '5px',
    marginBottom: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  smallButton: {
    padding: '5px 10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#5a6268'
    }
  },
  pendingBadge: {
    padding: '6px 12px',
    backgroundColor: '#ffd700',
    color: '#333',
    borderRadius: '15px',
    fontWeight: 'bold',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  editForm: {},
  viewDetails: {},
  label: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    marginBottom: '5px',
    display: 'block',
  },
};

export default StorekeeperAssetUpdation;
