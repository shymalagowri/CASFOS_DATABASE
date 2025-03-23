import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import { FaPencilAlt, FaPlus } from 'react-icons/fa';
import axios from "axios";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import debounce from "lodash.debounce";

const AssetManagement = () => {
  const location2 = useLocation();
  const queryParams = new URLSearchParams(location2.search);
  const username = queryParams.get("username") || "Guest";
  const navigate = useNavigate();
  const [billPhotoUrl, setBillPhotoUrl] = useState("");
  const [itemPhotoUrls, setItemPhotoUrls] = useState({});

  // Inventory Management State
  const [activeTab, setActiveTab] = useState("store");
  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserAddress, setPurchaserAddress] = useState("");
  const [billNo, setBillNo] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [items, setItems] = useState([]); // For Store tab
  const [issueItems, setIssueItems] = useState([]); // For Issue tab
  const [returnItem, setReturnItem] = useState({ location: "", returnQuantity: 0, condition: "", issuedQuantity: 0, returnIds: [] }); // For Return tab
  const [storeItems, setStoreItems] = useState([]); // Fetched store items
  const [selectedItem, setSelectedItem] = useState(""); // Selected item
  const [availableIds, setAvailableIds] = useState([]); // For Issue tab
  const [inStock, setInStock] = useState(0); // New state for inStock in Issue tab
  const [issuedIds, setIssuedIds] = useState([]); // For Return tab

  const permanentAssetOptions = [
    "Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods",
    "Curtains", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"
  ];
  const consumableAssetOptions = [
    "Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items",
    "Sanitory Items", "Sports Goods", "Beds and Pillows", "Instruments"
  ];

  const issuedToOptions = [
    "faculty_chamber", "officer_quarters", "staff_quarters", "corbett_hall",
    "champion_hall", "gis_lab", "van_vatika", "hostel", "officers_mess",
    "van_sakthi", "library", "classroom", "office_room", "officers_lounge", "gymnasium"
  ];

  const conditionOptions = ["Servicable", "Non-servicable"];

  // Fetch store items
  useEffect(() => {
    if ((activeTab === "issue" || activeTab === "return") && assetType && assetCategory) {
      const fetchStoreItems = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getStoreItems", {
            assetType,
            assetCategory,
          });
          setStoreItems(response.data.items || []);
        } catch (error) {
          console.error("Failed to fetch store items:", error);
          setStoreItems([]);
        }
      };
      fetchStoreItems();
    }
  }, [assetType, assetCategory, activeTab]);

  // Fetch available IDs and inStock for Issue tab
  useEffect(() => {
    if (activeTab === "issue" && assetType && assetCategory && selectedItem) {
      const [itemName, itemDescription] = selectedItem.split(" - ");
      const fetchAvailableIds = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getAvailableIds", {
            assetType,
            assetCategory,
            itemName,
            itemDescription,
          });
          const fetchedIds = response.data.itemIds || [];
          setAvailableIds(fetchedIds);
          setInStock(fetchedIds.length); // Option 1: Use length of availableIds as inStock
          // Option 2: If backend returns inStock explicitly, uncomment below
          // setInStock(response.data.inStock || fetchedIds.length);
        } catch (error) {
          console.error("Failed to fetch available IDs:", error);
          setAvailableIds([]);
          setInStock(0);
        }
      };
      fetchAvailableIds();
    }
  }, [assetType, assetCategory, selectedItem, activeTab]);

  // Fetch issued IDs for Return tab
  useEffect(() => {
    if (activeTab === "return" && assetType && assetCategory && selectedItem && returnItem.location) {
      const [itemName, itemDescription] = selectedItem.split(" - ");
      const fetchIssuedIds = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getIssuedIds", {
            assetType,
            assetCategory,
            itemName,
            itemDescription,
            location: returnItem.location,
          });
          setIssuedIds(response.data.issuedIds || []);
          setReturnItem((prev) => ({ ...prev, issuedQuantity: response.data.quantity || 0 }));
        } catch (error) {
          console.error("Failed to fetch issued IDs:", error);
          setIssuedIds([]);
          setReturnItem((prev) => ({ ...prev, issuedQuantity: 0 }));
        }
      };
      fetchIssuedIds();
    }
  }, [assetType, assetCategory, selectedItem, returnItem.location, activeTab]);

  // Add new item (Store tab)
  const addItem = () => {
    setItems([...items, {
      itemName: "",
      itemDescription: "",
      quantityReceived: 0,
      inStock: 0,
      unitPrice: 0,
      overallPrice: 0,
      itemPhoto: null,
      itemIds: [],
      showIdInputs: false,
    }]);
  };

  // Add new issue item (Issue tab)
  const addIssueItem = () => {
    setIssueItems([...issueItems, { issuedTo: "", quantity: 0, selectedIds: [] }]);
  };

  // Toggle ID input fields (Store tab)
  const toggleIdInputs = (index) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, showIdInputs: !item.showIdInputs, itemIds: Array(parseInt(item.quantityReceived) || 0).fill("") } : item
      )
    );
  };

  // Handle item ID changes (Store tab)
  const handleItemIdChange = (itemIndex, idIndex, value) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === itemIndex
          ? { ...item, itemIds: item.itemIds.map((id, j) => (j === idIndex ? value : id)) }
          : item
      )
    );
  };

  // Handle item field changes (Store tab)
  const handleItemChange = (index, field, value) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: field === "quantityReceived" ? parseInt(value, 10) || 0 : value } : item
    );
    setItems(updatedItems);
  };

  // Handle issue item field changes (Issue tab)
  const handleIssueItemChange = (index, field, value) => {
    const updatedIssueItems = issueItems.map((item, i) =>
      i === index ? { ...item, [field]: field === "quantity" ? parseInt(value, 10) || 0 : value } : item
    );
    setIssueItems(updatedIssueItems);
  };

  // Handle ID selection (Issue tab)
  const handleIdSelection = (index, id, checked) => {
    setIssueItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
            ...item,
            selectedIds: checked
              ? [...item.selectedIds, id]
              : item.selectedIds.filter((selectedId) => selectedId !== id),
          }
          : item
      )
    );
  };

  // Handle Select All (Issue tab) with filtered available IDs
  const handleSelectAll = (index, checked) => {
    const usedIds = issueItems
      .filter((_, i) => i !== index)
      .flatMap((item) => item.selectedIds);
    const filteredAvailableIds = availableIds.filter((id) => !usedIds.includes(id));
    setIssueItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, selectedIds: checked ? filteredAvailableIds : [] } : item
      )
    );
  };

  // Handle return item field changes (Return tab)
  const handleReturnItemChange = (field, value) => {
    setReturnItem((prev) => ({
      ...prev,
      [field]: field === "returnQuantity" ? parseInt(value, 10) || 0 : value,
    }));
  };

  // Handle ID selection (Return tab)
  const handleReturnIdSelection = (id, checked) => {
    setReturnItem((prev) => ({
      ...prev,
      returnIds: checked
        ? [...prev.returnIds, id]
        : prev.returnIds.filter((selectedId) => selectedId !== id),
    }));
  };

  // Submit inventory data (Store tab)
  const handleSubmitStore = async () => {
    const formData = {
      assetType,
      assetCategory,
      entryDate,
      purchaseDate,
      purchaserName,
      purchaserAddress,
      billNo,
      receivedBy,
      items: JSON.stringify(items.map(item => ({ ...item, showIdInputs: undefined }))),
      billPhotoUrl,
    };

    try {
      const response = await axios.post("http://localhost:3001/api/assets/store", formData);
      Swal.fire({ icon: "success", title: "Success!", text: "Inventory saved successfully!" });
      resetStoreForm();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save inventory!" });
      console.error(error);
    }
  };

  // Submit issue data (Issue tab)
  const handleSubmitIssue = async () => {
    if (!selectedItem || issueItems.length === 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select an item and add at least one issue!" });
      return;
    }

    const [itemName, itemDescription] = selectedItem.split(" - ");
    for (const issue of issueItems) {
      if (issue.selectedIds.length > issue.quantity) {
        Swal.fire({ icon: "warning", title: "Warning", text: "Selected IDs exceed quantity to be issued!" });
        return;
      }
    }

    const totalSelectedIds = issueItems.flatMap(issue => issue.selectedIds);
    if (new Set(totalSelectedIds).size !== totalSelectedIds.length) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Duplicate IDs selected across locations!" });
      return;
    }

    const issueData = {
      assetType,
      assetCategory,
      itemName,
      itemDescription,
      issues: issueItems.map(issue => ({
        issuedTo: issue.issuedTo,
        quantity: issue.quantity,
        issuedIds: issue.selectedIds,
      })),
    };

    try {
      const response = await axios.post("http://localhost:3001/api/assets/issue", issueData);
      Swal.fire({ icon: "success", title: "Success!", text: "Items issued successfully!" });
      resetIssueForm();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to issue items!" });
      console.error(error);
    }
  };

  // Submit return data (Return tab)
  const handleSubmitReturn = async () => {
    if (!selectedItem || !returnItem.location || returnItem.returnQuantity <= 0 || !returnItem.condition || returnItem.returnIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields, ensure return quantity is greater than 0, and select at least one ID!" });
      return;
    }

    if (returnItem.returnIds.length > returnItem.returnQuantity) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Selected IDs exceed return quantity!" });
      return;
    }

    const [itemName, itemDescription] = selectedItem.split(" - ");
    const returnData = {
      assetType,
      assetCategory,
      itemName,
      itemDescription,
      location: returnItem.location,
      returnQuantity: returnItem.returnQuantity,
      condition: returnItem.condition,
      returnIds: returnItem.returnIds,
    };

    try {
      const response = await axios.post("http://localhost:3001/api/assets/return", returnData);
      Swal.fire({ icon: "success", title: "Success!", text: "Items returned successfully!" });
      resetReturnForm();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to return items!" });
      console.error(error);
    }
  };

  // Reset Store form
  const resetStoreForm = () => {
    setAssetCategory("");
    setEntryDate("");
    setPurchaseDate("");
    setPurchaserName("");
    setPurchaserAddress("");
    setBillNo("");
    setBillPhotoUrl("");
    setReceivedBy("");
    setItems([]);
    setItemPhotoUrls({});
  };

  // Reset Issue form
  const resetIssueForm = () => {
    setAssetCategory("");
    setSelectedItem("");
    setIssueItems([]);
    setAvailableIds([]);
    setInStock(0);
  };

  // Reset Return form
  const resetReturnForm = () => {
    setAssetCategory("");
    setSelectedItem("");
    setReturnItem({ location: "", returnQuantity: 0, condition: "", issuedQuantity: 0, returnIds: [] });
    setIssuedIds([]);
  };

  // Handle file uploads
  const handleFileUpload = async (file, fieldName) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:3001/api/assets/uploadFile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (fieldName === "billPhoto") {
        setBillPhotoUrl(response.data.fileUrl);
      } else {
        setItemPhotoUrls((prev) => ({ ...prev, [fieldName]: response.data.fileUrl }));
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
    }
  };

  const handleBillPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, "billPhoto");
  };

  const handleItemPhotoChange = (e, index) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, `itemPhoto${index}`);
  };

  return (
    <>
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
          <li className="active"><a href={`/assetentry?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Entry</span></a></li>
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

        <div style={styles.menuBar}>
          <button style={activeTab === "store" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("store")}>Store</button>
          <button style={activeTab === "issue" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("issue")}>Issue</button>
          <button style={activeTab === "return" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("return")}>Return</button>
        </div>

        <main>
          <div style={styles.container}>
            <h2>Asset Management System</h2>

            {activeTab === "store" && (
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
                    <label>Entry Date:</label>
                    <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={styles.input} />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Purchase Date:</label>
                    <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} style={styles.input} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Purchaser Name:</label>
                    <input type="text" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} style={styles.input} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Purchaser Address:</label>
                    <input type="text" value={purchaserAddress} onChange={(e) => setPurchaserAddress(e.target.value)} style={styles.input} />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Bill No:</label>
                    <input type="text" value={billNo} onChange={(e) => setBillNo(e.target.value)} style={styles.input} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Bill Photo:</label>
                    <input type="file" onChange={handleBillPhotoChange} />
                    {billPhotoUrl && <img src={billPhotoUrl} alt="Bill Photo" width="100" />}
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Received By:</label>
                    <input type="text" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} style={styles.input} />
                  </div>
                </div>

                <h3>Items</h3>
                {items.map((item, index) => (
                  <div key={index} style={styles.itemContainer}>
                    <div style={styles.itemRow}>
                      <div style={styles.inputGroup}>
                        <label>Item Name:</label>
                        <input type="text" value={item.itemName} onChange={(e) => handleItemChange(index, "itemName", e.target.value)} style={styles.input} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Item Description:</label>
                        <input type="text" value={item.itemDescription} onChange={(e) => handleItemChange(index, "itemDescription", e.target.value)} style={styles.input} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Quantity Received:</label>
                        <input type="number" value={item.quantityReceived} onChange={(e) => handleItemChange(index, "quantityReceived", e.target.value)} style={styles.input} />
                      </div>
                    </div>
                    <div style={styles.itemRow}>
                      <div style={styles.inputGroup}>
                        <label>In Stock:</label>
                        <input type="number" value={item.inStock} disabled style={styles.input} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Unit Price:</label>
                        <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)} style={styles.input} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Overall Price:</label>
                        <input type="number" value={item.overallPrice} onChange={(e) => handleItemChange(index, "overallPrice", e.target.value)} style={styles.input} />
                      </div>
                    </div>
                    <div style={styles.itemRow}>
                      <div style={styles.inputGroup}>
                        <label>Item Photo {index + 1}:</label>
                        <input type="file" onChange={(e) => handleItemPhotoChange(e, index)} />
                        {itemPhotoUrls[`itemPhoto${index}`] && <img src={itemPhotoUrls[`itemPhoto${index}`]} alt={`Item Photo ${index + 1}`} width="100" />}
                      </div>
                      <div style={styles.inputGroup}>
                        <button onClick={() => toggleIdInputs(index)} style={styles.button}>
                          {item.showIdInputs ? "Hide IDs" : "Assign IDs"}
                        </button>
                      </div>
                    </div>
                    {item.showIdInputs && (
                      <div style={styles.itemRow}>
                        {item.itemIds.map((id, idIndex) => (
                          <div key={idIndex} style={styles.inputGroup}>
                            <label>ID {idIndex + 1}:</label>
                            <input
                              type="text"
                              value={id}
                              onChange={(e) => handleItemIdChange(index, idIndex, e.target.value)}
                              style={styles.input}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
  


                <div style={styles.buttonContainer}>
                  <button onClick={addItem} style={styles.button}>Add Item</button>
                  <button onClick={handleSubmitStore} style={styles.button}>Submit</button>
                </div>
              </div>
            )}

            {activeTab === "issue" && (
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
                    <label>Item Name:</label>
                    <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} style={styles.input}>
                      <option value="">Select Item</option>
                      {storeItems.map((item) => (
                        <option key={`${item.itemName}-${item.itemDescription}`} value={`${item.itemName} - ${item.itemDescription}`}>
                          {`${item.itemName} - ${item.itemDescription}`}
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
                            {issuedToOptions.map((option) => (
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
                      <div style={styles.inputGroup}>
                        <label>Select Item IDs:</label>
                        <div style={styles.checkboxContainer}>
                          <label>
                            <input
                              type="checkbox"
                              checked={issue.selectedIds.length === filteredAvailableIds.length}
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
                              />
                              {id}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div style={styles.buttonContainer}>
                  <button onClick={addIssueItem} style={styles.button}><FaPlus /> Add Issue</button>
                  <button onClick={handleSubmitIssue} style={styles.button}>Submit</button>
                </div>
              </div>
            )}

            {activeTab === "return" && (
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
                    <label>Item Name:</label>
                    <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} style={styles.input}>
                      <option value="">Select Item</option>
                      {storeItems.map((item) => (
                        <option key={`${item.itemName}-${item.itemDescription}`} value={`${item.itemName} - ${item.itemDescription}`}>
                          {`${item.itemName} - ${item.itemDescription}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Location:</label>
                    <select
                      value={returnItem.location}
                      onChange={(e) => handleReturnItemChange("location", e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Select Location</option>
                      {issuedToOptions.map((option) => (
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
                      onChange={(e) => handleReturnItemChange("returnQuantity", e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Condition:</label>
                    <select
                      value={returnItem.condition}
                      onChange={(e) => handleReturnItemChange("condition", e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Select Condition</option>
                      {conditionOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label>Select Return IDs:</label>
                    <div style={styles.checkboxContainer}>
                      {issuedIds.map((id) => (
                        <label key={id} style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={returnItem.returnIds.includes(id)}
                            onChange={(e) => handleReturnIdSelection(id, e.target.checked)}
                          />
                          {id}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={styles.buttonContainer}>
                  <button onClick={handleSubmitReturn} style={styles.button}>Submit</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </section>
    </>
  );
};

const styles = {
  menuBar: { width: "100%", backgroundColor: "#f4f4f4", padding: "10px 0", display: "flex", justifyContent: "center", gap: "20px", position: "fixed", top: "60px", left: 0, zIndex: 1000, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" },
  container: { width: "100%", margin: "80px auto 20px", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff" },
  tab: { padding: "10px 20px", border: "none", backgroundColor: "#ddd", cursor: "pointer", borderRadius: "5px", fontSize: "16px" },
  activeTab: { padding: "10px 20px", border: "none", backgroundColor: "#007BFF", color: "#fff", cursor: "pointer", borderRadius: "5px", fontSize: "16px" },
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

export default AssetManagement;