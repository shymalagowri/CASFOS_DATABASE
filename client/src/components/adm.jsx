import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const AssetStore = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const [activeTab, setActiveTab] = useState("store");
  const [billPhotoUrl, setBillPhotoUrl] = useState("");
  const [itemPhotoUrls, setItemPhotoUrls] = useState({});
  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserAddress, setPurchaserAddress] = useState("");
  const [billNo, setBillNo] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [items, setItems] = useState([]);
  const [returnedAssets, setReturnedAssets] = useState([]);
  const [servicedData, setServicedData] = useState({ itemName: "", subCategory: "", itemDescription: "", itemIds: [], serviceNo: "", serviceDate: "", serviceAmount: 0 });
  const [disposableData, setDisposableData] = useState({ itemName: "", subCategory: "", itemDescription: "", itemIds: [], purchaseValue: 0, bookValue: 0, inspectionDate: "", condemnationDate: "", remark: "", disposalValue: 0 });
  const [storeItems, setStoreItems] = useState([]);
  const [servicableItems, setServicableItems] = useState([]);
  const [disposableItems, setDisposableItems] = useState([]);

  const permanentAssetOptions = ["Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods", "Fabrics", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"];
  const consumableAssetOptions = ["Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items", "Sanitory Items", "Sports Goods", "Fabrics", "Instruments"];
  const conditionOptions = ["Servicable", "Disposable"];

  const subCategoryOptions = {
    Furniture: ["Wood", "Steel", "Plastic", "Others"],
    Vehicle: ["Two-wheeler", "Three-wheeler", "Four-wheeler", "Bus", "Others"],
    Building: [
      "Vana Vigyan", "Store and Godown Building", "Garages", "Pavilion", "Gym Building",
      "Chandan Hostel", "Vana Vatika", "Executive Hostel", "Ladies Hostel", "Officer Trainees Mess",
      "Residential Quarters", "Others"
    ],
    Instruments: ["Laboratory", "Field Exercise Instruments", "Garden Instruments", "Others"],
    Fabrics: ["Curtains", "Carpets", "Others"],
    Electrical: ["Appliance", "Others"],
    Electronics: ["Audio/Visual Equipment", "ICT Equipment", "Others"],
    Land: ["Land with Building", "Land without Building", "Others"],
  };

  const itemNameOptions = {
    "Residential Quarters": [
      "Type-A5", "Type-A2", "Type-5", "Type-4", "Type-3", "Type-2", "Type-D", "Others"
    ],
    Appliance: [
      "Fan", "Light", "AC", "Water Purifier", "Geysers", "Fridge", "Vacuum Cleaners", "Others"
    ],
    "Audio/Visual Equipment": [
      "Camera", "Projector", "Television", "Speakers", "Microphone", "CCTV", "Audio Mixers", "Others"
    ],
    "ICT Equipment": [
      "Computer System", "Laptop", "Printers", "Scanners", "Xerox Machine", "Server", "Others"
    ],
  };

  // Fetch store items
  useEffect(() => {
    if ((activeTab === "serviced" || activeTab === "disposable" || activeTab === "store") && assetType && assetCategory) {
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
  }, [assetType, assetCategory, activeTab]);

  // Fetch returned assets
  useEffect(() => {
    if (activeTab === "returned" && assetType && assetCategory) {
      const fetchReturnedAssets = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getReturnedAssets", { assetType, assetCategory, condition: "Servicable" });
          const flatAssets = response.data.flatMap(asset =>
            asset.returnIds.map(id => ({
              assetType: asset.assetType,
              assetCategory: asset.assetCategory,
              itemName: asset.itemName,
              subCategory: asset.subCategory,
              itemDescription: asset.itemDescription,
              returnedFromLocation: asset.location,
              itemId: id,
              condition: "Servicable"
            }))
          );
          setReturnedAssets(flatAssets);
        } catch (error) {
          console.error("Failed to fetch returned assets:", error);
          setReturnedAssets([]);
        }
      };
      fetchReturnedAssets();
    }
  }, [assetType, assetCategory, activeTab]);

  // Fetch disposable items
  useEffect(() => {
    if (activeTab === "disposable" && assetType && assetCategory && disposableData.itemName && disposableData.subCategory && disposableData.itemDescription) {
      const fetchDisposableItems = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getDisposableItems", {
            assetType,
            assetCategory,
            itemName: disposableData.itemName,
            subCategory: disposableData.subCategory,
            itemDescription: disposableData.itemDescription,
          });
          setDisposableItems(response.data.itemIds || []);
        } catch (error) {
          console.error("Failed to fetch disposable items:", error);
          setDisposableItems([]);
        }
      };
      fetchDisposableItems();
    }
  }, [assetType, assetCategory, disposableData.itemName, disposableData.subCategory, disposableData.itemDescription, activeTab]);

  // Fetch purchase value for disposable items
  useEffect(() => {
    if (activeTab === "disposable" && assetType && assetCategory && disposableData.itemName && disposableData.subCategory && disposableData.itemDescription) {
      const fetchPurchaseValue = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getStoreItemDetails", {
            assetType,
            assetCategory,
            itemName: disposableData.itemName,
            subCategory: disposableData.subCategory,
            itemDescription: disposableData.itemDescription,
          });
          setDisposableData(prev => ({ ...prev, purchaseValue: response.data.unitPrice || 0 }));
        } catch (error) {
          console.error("Failed to fetch purchase value:", error);
          setDisposableData(prev => ({ ...prev, purchaseValue: 0 }));
        }
      };
      fetchPurchaseValue();
    }
  }, [assetType, assetCategory, disposableData.itemName, disposableData.subCategory, disposableData.itemDescription, activeTab]);

  // Store/Receipt Entry Functions
  const addItem = () => {
    setItems([...items, { 
      itemName: "", 
      subCategory: "", 
      customSubCategory: "", 
      itemDescription: "", 
      quantityReceived: 0, 
      inStock: 0, 
      unitPrice: 0, 
      overallPrice: 0, 
      itemPhoto: null, 
      itemIds: [], 
      showIdInputs: false, 
      customItemName: "" 
    }]);
  };

  const toggleIdInputs = (index) => {
    setItems((prevItems) => prevItems.map((item, i) => i === index ? { ...item, showIdInputs: !item.showIdInputs, itemIds: Array(parseInt(item.quantityReceived) || 0).fill("") } : item));
  };

  const handleItemIdChange = (itemIndex, idIndex, value) => {
    setItems((prevItems) => prevItems.map((item, i) => i === itemIndex ? { ...item, itemIds: item.itemIds.map((id, j) => (j === idIndex ? value : id)) } : item));
  };

 const handleItemChange = (index, field, value) => {
  const updatedItems = items.map((item, i) => {
    if (i === index) {
      let updatedItem = { ...item };

      // Handle specific field changes
      if (field === "subCategory") {
        // Reset itemName and customSubCategory when subCategory changes
        updatedItem = { ...updatedItem, [field]: value, itemName: "", customSubCategory: value === "Others" ? item.customSubCategory : "", customItemName: "" };
      } else if (field === "itemName" && value !== "Others") {
        updatedItem = { ...updatedItem, [field]: value, customItemName: "" };
      } else if (field === "quantityReceived" || field === "unitPrice") {
        const parsedValue = field === "quantityReceived" ? parseInt(value, 10) || 0 : parseFloat(value) || 0;
        updatedItem = { ...updatedItem, [field]: parsedValue };
        // Calculate overallPrice automatically
        const quantity = field === "quantityReceived" ? parsedValue : (parseInt(item.quantityReceived, 10) || 0);
        const unitPrice = field === "unitPrice" ? parsedValue : (parseFloat(item.unitPrice) || 0);
        updatedItem.overallPrice = quantity * unitPrice;
      } else {
        updatedItem = { ...updatedItem, [field]: value };
      }

      return updatedItem;
    }
    return item;
  });
  setItems(updatedItems);
};
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
      items: JSON.stringify(items.map(item => ({
        itemName: item.itemName === "Others" && item.customItemName ? item.customItemName : item.itemName,
        subCategory: item.subCategory === "Others" && item.customSubCategory ? item.customSubCategory : item.subCategory,
        itemDescription: item.itemDescription,
        quantityReceived: item.quantityReceived,
        inStock: item.quantityReceived,
        unitPrice: item.unitPrice,
        overallPrice: item.overallPrice,
        itemIds: item.itemIds,
      }))),
      billPhotoUrl
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

  const handleFileUpload = async (file, fieldName) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://localhost:3001/api/assets/uploadFile", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (fieldName === "billPhoto") setBillPhotoUrl(response.data.fileUrl);
      else setItemPhotoUrls((prev) => ({ ...prev, [fieldName]: response.data.fileUrl }));
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

  // Returned Assets Functions
  const handleConditionChange = (index, value) => {
    setReturnedAssets((prev) => prev.map((item, i) => i === index ? { ...item, condition: value } : item));
  };

  const handleSaveReturnedAsset = async (index) => {
    const asset = returnedAssets[index];
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemId, condition } = asset;
    try {
      if (condition === "Servicable") {
        await axios.post("http://localhost:3001/api/assets/saveServicable", { assetType, assetCategory, itemName, subCategory, itemDescription, itemId });
      } else if (condition === "Disposable") {
        await axios.post("http://localhost:3001/api/assets/saveDisposable", { assetType, assetCategory, itemName, subCategory, itemDescription, itemId });
      }
      setReturnedAssets((prev) => prev.filter((_, i) => i !== index));
      Swal.fire({ icon: "success", title: "Success!", text: "Asset condition saved!" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save asset condition!" });
      console.error(error);
    }
  };

  // Serviced Assets Functions
  const handleServicedChange = (field, value) => {
    setServicedData(prev => ({ ...prev, [field]: value }));
  };

  const handleServicedIdSelection = (id, checked) => {
    setServicedData(prev => ({
      ...prev,
      itemIds: checked ? [...prev.itemIds, id] : prev.itemIds.filter(itemId => itemId !== id),
    }));
  };

  const handleSubmitServiced = async () => {
    if (!servicedData.itemName || !servicedData.subCategory || !servicedData.itemDescription || servicedData.itemIds.length === 0 || !servicedData.serviceNo || !servicedData.serviceDate || servicedData.serviceAmount <= 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields and select at least one ID!" });
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/assets/saveServiced", {
        assetType,
        assetCategory,
        itemName: servicedData.itemName,
        subCategory: servicedData.subCategory,
        itemDescription: servicedData.itemDescription,
        itemIds: servicedData.itemIds,
        serviceNo: servicedData.serviceNo,
        serviceDate: servicedData.serviceDate,
        serviceAmount: servicedData.serviceAmount,
      });
      Swal.fire({ icon: "success", title: "Success!", text: "Serviced asset saved!" });
      setServicedData({ itemName: "", subCategory: "", itemDescription: "", itemIds: [], serviceNo: "", serviceDate: "", serviceAmount: 0 });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save serviced asset!" });
      console.error(error);
    }
  };

  // Disposable Assets Functions
  const handleDisposableChange = (field, value) => {
    setDisposableData(prev => ({ ...prev, [field]: value }));
  };

  const handleDisposableIdSelection = (id, checked) => {
    setDisposableData(prev => ({
      ...prev,
      itemIds: checked ? [...prev.itemIds, id] : prev.itemIds.filter(itemId => itemId !== id),
    }));
  };

  const handleSubmitDisposable = async () => {
    if (!disposableData.itemName || !disposableData.subCategory || !disposableData.itemDescription || disposableData.itemIds.length === 0 || disposableData.purchaseValue <= 0 || disposableData.bookValue < 0 || !disposableData.inspectionDate || !disposableData.condemnationDate || !disposableData.remark || disposableData.disposalValue < 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields and select at least one ID!" });
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/assets/saveDisposableAsset", {
        assetType,
        assetCategory,
        itemName: disposableData.itemName,
        subCategory: disposableData.subCategory,
        itemDescription: disposableData.itemDescription,
        itemIds: disposableData.itemIds,
        purchaseValue: disposableData.purchaseValue,
        bookValue: disposableData.bookValue,
        inspectionDate: disposableData.inspectionDate,
        condemnationDate: disposableData.condemnationDate,
        remark: disposableData.remark,
        disposalValue: disposableData.disposalValue,
      });
      Swal.fire({ icon: "success", title: "Success!", text: "Disposable asset saved!" });
      setDisposableData({ itemName: "", subCategory: "", itemDescription: "", itemIds: [], purchaseValue: 0, bookValue: 0, inspectionDate: "", condemnationDate: "", remark: "", disposalValue: 0 });
      setDisposableItems([]);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save disposable asset!" });
      console.error(error);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="style.css" />
        <title>CASFOS - Asset Store</title>
      </Helmet>

      <section id="sidebar">
        <a href="#" className="brand"><span className="text">DATA ENTRY STAFF</span></a>
        <ul className="side-menu top">
          <li><a href={`/dataentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
          <li className="active"><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
          <li><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
          <li><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
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
          <button style={activeTab === "store" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("store")}>Store/Receipt Entry</button>
          <button style={activeTab === "returned" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("returned")}>Returned Assets</button>
          <button style={activeTab === "serviced" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("serviced")}>Serviced Assets</button>
          <button style={activeTab === "disposable" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("disposable")}>Disposable Assets</button>
        </div>

        <main>
          <div style={styles.container}>
            <h2>Asset Store System</h2>

            {activeTab === "store" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
                  <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
                  <div style={styles.inputGroup}><label>Entry Date:</label><input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={styles.input} /></div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Purchase Date:</label><input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Purchaser Name:</label><input type="text" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Purchaser Address:</label><input type="text" value={purchaserAddress} onChange={(e) => setPurchaserAddress(e.target.value)} style={styles.input} /></div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Bill No:</label><input type="text" value={billNo} onChange={(e) => setBillNo(e.target.value)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Bill Photo:</label><input type="file" onChange={handleBillPhotoChange} />{billPhotoUrl && <img src={billPhotoUrl} alt="Bill Photo" width="100" />}</div>
                  <div style={styles.inputGroup}><label>Received By:</label><input type="text" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} style={styles.input} /></div>
                </div>

                <h3>Items</h3>
                {items.map((item, index) => (
                  <div key={index} style={styles.itemContainer}>
                    <div style={styles.itemRow}>
                      <div style={styles.inputGroup}>
                        <label>Item Sub Category:</label>
                        <select
                          value={item.subCategory}
                          onChange={(e) => handleItemChange(index, "subCategory", e.target.value)}
                          style={styles.input}
                          disabled={!subCategoryOptions[assetCategory]}
                        >
                          <option value="">Select Sub Category</option>
                          {subCategoryOptions[assetCategory]?.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                      {item.subCategory === "Others" && (
                        <div style={styles.inputGroup}>
                          <label>Custom Sub Category:</label>
                          <input
                            type="text"
                            value={item.customSubCategory}
                            onChange={(e) => handleItemChange(index, "customSubCategory", e.target.value)}
                            style={styles.input}
                          />
                        </div>
                      )}
                      <div style={styles.inputGroup}>
                        <label>Item Name:</label>
                        {itemNameOptions[item.subCategory] ? (
                          <select
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                            style={styles.input}
                          >
                            <option value="">Select Item Name</option>
                            {itemNameOptions[item.subCategory].map((name) => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                            style={styles.input}
                          />
                        )}
                      </div>
                      {itemNameOptions[item.subCategory] && item.itemName === "Others" && (
                        <div style={styles.inputGroup}>
                          <label>Custom Item Name:</label>
                          <input
                            type="text"
                            value={item.customItemName}
                            onChange={(e) => handleItemChange(index, "customItemName", e.target.value)}
                            style={styles.input}
                          />
                        </div>
                      )}
                    </div>
                    <div style={styles.itemRow}>
                      <div style={styles.inputGroup}>
                        <label>Item Description:</label>
                        <input
                          type="text"
                          value={item.itemDescription}
                          onChange={(e) => handleItemChange(index, "itemDescription", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Quantity Received:</label>
                        <input
                          type="number"
                          value={item.quantityReceived}
                          onChange={(e) => handleItemChange(index, "quantityReceived", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>In Stock:</label>
                        <input type="number" value={item.inStock} disabled style={styles.input} />
                      </div>
                    </div>
                    <div style={styles.itemRow}>
                      <div style={styles.inputGroup}>
                        <label>Unit Price:</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Overall Price:</label>
                        <input
                          type="number"
                          value={item.overallPrice}
                          onChange={(e) => handleItemChange(index, "overallPrice", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Item Photo {index + 1}:</label>
                        <input type="file" onChange={(e) => handleItemPhotoChange(e, index)} />
                        {itemPhotoUrls[`itemPhoto${index}`] && <img src={itemPhotoUrls[`itemPhoto${index}`]} alt={`Item Photo ${index + 1}`} width="100" />}
                      </div>
                    </div>
                    <div style={styles.itemRow}>
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
                  <button onClick={addItem} style={styles.button}><FaPlus /> Add Item</button>
                  <button onClick={handleSubmitStore} style={styles.button}>Submit</button>
                </div>
              </div>
            )}

            {activeTab === "returned" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
                  <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Asset Type</th>
                      <th>Asset Category</th>
                      <th>Sub Category</th>

                      <th>Item Name</th>
                      <th>Item Description</th>
                      <th>Returned From</th>
                      <th>Item ID</th>
                      <th>Servicable or Not</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedAssets.map((asset, index) => (
                      <tr key={index}>
                        <td>{asset.assetType}</td>
                        <td>{asset.assetCategory}</td>
                        <td>{asset.subCategory}</td>

                        <td>{asset.itemName}</td>
                        <td>{asset.itemDescription}</td>
                        <td>{asset.returnedFromLocation}</td>
                        <td>{asset.itemId}</td>
                        <td>
                          <select value={asset.condition} onChange={(e) => handleConditionChange(index, e.target.value)} style={styles.input}>
                            <option value="Servicable">Servicable</option>
                            <option value="Disposable">Disposable</option>
                          </select>
                        </td>
                        <td><button onClick={() => handleSaveReturnedAsset(index)} style={styles.button}>Save</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "serviced" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
                  <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
                  <div style={styles.inputGroup}>
                    <label>Item:</label>
                    <select value={`${servicedData.itemName} - ${servicedData.subCategory} - ${servicedData.itemDescription}`} onChange={(e) => {
                      const [itemName, subCategory, itemDescription] = e.target.value.split(" - ");
                      setServicedData(prev => ({ ...prev, itemName, subCategory, itemDescription }));
                    }} style={styles.input}>
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
                  <div style={styles.inputGroup}><label>Service No:</label><input type="text" value={servicedData.serviceNo} onChange={(e) => handleServicedChange("serviceNo", e.target.value)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Service Date:</label><input type="date" value={servicedData.serviceDate} onChange={(e) => handleServicedChange("serviceDate", e.target.value)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Service Amount:</label><input type="number" value={servicedData.serviceAmount} onChange={(e) => handleServicedChange("serviceAmount", parseFloat(e.target.value) || 0)} style={styles.input} /></div>
                </div>
                <div style={styles.inputGroup}>
                  <label>Select Servicable Item IDs:</label>
                  <div style={styles.checkboxContainer}>
                    {servicableItems.map((id) => (
                      <label key={id} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={servicedData.itemIds.includes(id)}
                          onChange={(e) => handleServicedIdSelection(id, e.target.checked)}
                        />
                        {id}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={styles.buttonContainer}>
                  <button onClick={handleSubmitServiced} style={styles.button}>Submit</button>
                </div>
              </div>
            )}

            {activeTab === "disposable" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
                  <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
                  <div style={styles.inputGroup}>
                    <label>Item:</label>
                    <select value={`${disposableData.itemName} - ${disposableData.subCategory} - ${disposableData.itemDescription}`} onChange={(e) => {
                      const [itemName, subCategory, itemDescription] = e.target.value.split(" - ");
                      setDisposableData(prev => ({ ...prev, itemName, subCategory, itemDescription }));
                    }} style={styles.input}>
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
                  <div style={styles.inputGroup}><label>Purchase Value:</label><input type="number" value={disposableData.purchaseValue} disabled style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Book Value:</label><input type="number" value={disposableData.bookValue} onChange={(e) => handleDisposableChange("bookValue", parseFloat(e.target.value) || 0)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Inspection Date:</label><input type="date" value={disposableData.inspectionDate} onChange={(e) => handleDisposableChange("inspectionDate", e.target.value)} style={styles.input} /></div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Condemnation Date:</label><input type="date" value={disposableData.condemnationDate} onChange={(e) => handleDisposableChange("condemnationDate", e.target.value)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Remark:</label><input type="text" value={disposableData.remark} onChange={(e) => handleDisposableChange("remark", e.target.value)} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label>Disposal Value:</label><input type="number" value={disposableData.disposalValue} onChange={(e) => handleDisposableChange("disposalValue", parseFloat(e.target.value) || 0)} style={styles.input} /></div>
                </div>
                <div style={styles.inputGroup}>
                  <label>Select Disposable Item IDs:</label>
                  <div style={styles.checkboxContainer}>
                    {disposableItems.map((id) => (
                      <label key={id} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={disposableData.itemIds.includes(id)}
                          onChange={(e) => handleDisposableIdSelection(id, e.target.checked)}
                        />
                        {id}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={styles.buttonContainer}>
                  <button onClick={handleSubmitDisposable} style={styles.button}>Submit</button>
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
  table: { width: "100%", borderCollapse: "collapse" },
  "table th, table td": { border: "1px solid #ddd", padding: "8px", textAlign: "left" },
  "table th": { backgroundColor: "#f4f4f4" },
};

export default AssetStore;