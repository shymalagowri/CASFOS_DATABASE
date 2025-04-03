import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
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
  const [customSource, setCustomSource] = useState("");
  const [customModeOfPurchase, setCustomModeOfPurchase] = useState("");
  const [remarks, setRemarks] = useState({}); // For storing remarks for each returned asset
  const [signedReceipts, setSignedReceipts] = useState({}); // For storing signed receipt URLs
  const [amcPhotoUrls, setAmcPhotoUrls] = useState({});
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [activeTab, setActiveTab] = useState("store");
  const [billPhotoUrl, setBillPhotoUrl] = useState("");
  const [itemPhotoUrls, setItemPhotoUrls] = useState({});
  const [assetType, setAssetType] = useState("Permanent");
  const [assetCategory, setAssetCategory] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [servicedData, setServicedData] = useState({ itemName: "", subCategory: "", itemDescription: "", itemIds: [], serviceNo: "", serviceDate: "", serviceAmount: 0 });
  const [supplierAddress, setSupplierAddress] = useState("");
  const [source, setSource] = useState("");
  const [modeOfPurchase, setModeOfPurchase] = useState("");
  const [billNo, setBillNo] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [servicableItems, setServicableItems] = useState([]);
  const [items, setItems] = useState([]);
  const [warrantyPhotoUrls, setWarrantyPhotoUrls] = useState({});
  const [buildingData, setBuildingData] = useState({
    subCategory: "", customSubCategory: "", location: "", type: "", customType: "", buildingNo: "", plinthArea: "", status: "", dateOfConstruction: "", costOfConstruction: 0, remarks: ""
  });
  const [landData, setLandData] = useState({
    subCategory: "", customSubCategory: "", location: "", status: "", dateOfPossession: "", controllerOrCustody: "", details: ""
  });
  const [returnedAssets, setReturnedAssets] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState({
    buildingNo: "", yearOfMaintenance: "", cost: 0, description: "", custody: "", agency: ""
  });
  const [disposableData, setDisposableData] = useState({
    itemName: "", subCategory: "", itemDescription: "", itemIds: [], purchaseValue: 0, bookValue: 0, inspectionDate: "", condemnationDate: "", remark: "", disposalValue: 0
  });
  const [storeItems, setStoreItems] = useState([]);
  const [disposableItems, setDisposableItems] = useState([]);
  // Add missing state for purchaseValues
  const [purchaseValues, setPurchaseValues] = useState({});

  const permanentAssetOptions = ["Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods", "Fabrics", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"];
  const consumableAssetOptions = ["Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items", "Sanitory Items", "Sports Goods", "Fabrics", "Instruments"];
  const sourceOptions = ["GEM", "Local", "Other"];
  const modeOfPurchaseOptions = ["Tender", "Quotation", "Others"];

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
  const serverBaseUrl = "http://localhost:3001"; // Define server base URL
  // Fetch servicable items
  useEffect(() => {
    if (
      activeTab === "serviced" &&
      assetType &&
      assetCategory &&
      servicedData.itemName &&
      assetCategory !== "Building"
    ) {
      const fetchServicableItems = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getServicableItems", {
            assetType,
            assetCategory,
            itemName: servicedData.itemName,
            subCategory: servicedData.subCategory,
            itemDescription: servicedData.itemDescription,
          });
          setServicableItems(response.data.itemIds || []);
        } catch (error) {
          console.error("Failed to fetch servicable items:", error);
          setServicableItems([]);
        }
      };
      fetchServicableItems();
    }
  }, [
    assetType,
    assetCategory,
    servicedData.itemName,
    servicedData.subCategory,
    servicedData.itemDescription,
    activeTab,
  ]);

  // Fetch store items
  useEffect(() => {
    if ((activeTab === "serviced" || activeTab === "disposable" || activeTab === "store") && assetType && assetCategory) {
      const fetchStoreItems = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getStoreItems", { assetType, assetCategory });
          setStoreItems(response.data.items || []);
          console.log(response.data);
        } catch (error) {
          console.error("Failed to fetch store items:", error);
          setStoreItems([]);
        }
      };
      fetchStoreItems();
    }
  }, [assetType, assetCategory, activeTab]);

  useEffect(() => {
    if (activeTab === "returned" && assetType && assetCategory) {
      const fetchReturnedAssets = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getReturnedAssets", {
            assetType,
            assetCategory,
            status: "returned",
          });
          const formattedAssets = response.data.map((asset) => ({
            _id: asset._id,
            assetType: asset.assetType,
            assetCategory: asset.assetCategory,
            itemName: asset.itemName,
            subCategory: asset.subCategory,
            itemDescription: asset.itemDescription,
            returnedFromLocation: asset.location,
            itemId: assetType === "Permanent" ? asset.itemId : null, // Only for Permanent
            returnedQuantity: assetType === "Consumable" ? asset.returnQuantity : null, // Only for Consumable
            condition: assetType === "Permanent" ? "To Be Serviced" : "To Be Exchanged", // Default condition based on type
            pdfUrl: null,
            signedPdfUrl: null,
            isUploaded: false,
          }));
          setReturnedAssets(formattedAssets);
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
    if (activeTab === "disposable" && assetType && assetCategory && disposableData.itemName) {
      const fetchAvailableQuantity = async () => {
        try {
          const response = await axios.post("http://localhost:3001/api/assets/getAvailableDisposableQuantity", {
            assetType,
            assetCategory,
            itemName: disposableData.itemName,
            subCategory: disposableData.subCategory,
            itemDescription: disposableData.itemDescription,
          });
          setAvailableQuantity(response.data.availableQuantity);
          if (assetType === "Permanent") {
            setDisposableItems(response.data.itemIds || []);
          }
        } catch (error) {
          console.error("Failed to fetch available quantity:", error);
          setAvailableQuantity(0);
        }
      };
      fetchAvailableQuantity();
    }
  }, [assetType, assetCategory, disposableData.itemName, disposableData.subCategory, disposableData.itemDescription, activeTab]);

  // Fetch purchase values for selected itemIds
  const fetchPurchaseValues = async (selectedItemIds) => {
    try {
      const newPurchaseValues = {};
      await Promise.all(
        selectedItemIds.map(async (itemId) => {
          const response = await axios.post("http://localhost:3001/api/assets/getStoreItemDetails", {
            itemId,
          });
          newPurchaseValues[itemId] = response.data.unitPrice || 0;
        })
      );
      setPurchaseValues((prev) => ({ ...prev, ...newPurchaseValues }));

      // Update disposableData.purchaseValue with the average or total of fetched values
      const totalPurchaseValue = Object.values(newPurchaseValues).reduce((sum, val) => sum + val, 0);
      const averagePurchaseValue = selectedItemIds.length > 0 ? totalPurchaseValue / selectedItemIds.length : 0;
      setDisposableData((prev) => ({ ...prev, purchaseValue: averagePurchaseValue }));
    } catch (error) {
      console.error("Failed to fetch purchase values:", error);
      setPurchaseValues((prev) => {
        const fallback = {};
        selectedItemIds.forEach((itemId) => {
          fallback[itemId] = 0;
        });
        return { ...prev, ...fallback };
      });
      setDisposableData((prev) => ({ ...prev, purchaseValue: 0 }));
    }
  };

  // Fetch purchase values when itemIds change in disposable tab
  useEffect(() => {
    if (activeTab === "disposable" && assetType === "Permanent" && disposableData.itemIds.length > 0) {
      fetchPurchaseValues(disposableData.itemIds);
    }
  }, [assetType, disposableData.itemIds, activeTab]);

  // Handle disposable ID selection and reset purchaseValues
  const handleDisposableIdSelection = (itemId) => {
    setDisposableData((prev) => {
      const newItemIds = prev.itemIds.includes(itemId)
        ? prev.itemIds.filter((id) => id !== itemId)
        : [...prev.itemIds, itemId];
      setPurchaseValues({}); // Reset purchaseValues for new selection
      return { ...prev, itemIds: newItemIds, purchaseValue: 0 }; // Reset purchaseValue until new fetch
    });
  };

  // Store/Receipt Entry Functions
  const addItem = () => {
    setItems([...items, {
      itemName: "",
      subCategory: "",
      customSubCategory: "",
      itemDescription: "",
      quantityReceived: 0,
      unitPrice: 0,
      totalPrice: 0,
      itemPhoto: null,
      itemIds: [],
      showIdInputs: false,
      customItemName: "",
      amcFromDate: "",  // Add this
      amcToDate: "",    // Add this
      amcCost: 0,       // Add this
      amcPhoto: null,   // Add this
      warrantyNumber: "",
      warrantyValidUpto: "",
      warrantyPhoto: null,
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
        if (field === "subCategory" && assetType === "Permanent") {
          updatedItem = { ...updatedItem, [field]: value, itemName: "", customSubCategory: value === "Others" ? item.customSubCategory : "" };
        } else if (field === "itemName") {
          updatedItem = {
            ...updatedItem,
            [field]: value,
            ...(assetType === "Permanent" ? { customItemName: value === "Others" ? item.customItemName : "" } : {}),
          };
        } else {
          updatedItem = { ...updatedItem, [field]: value };
        }
        // Handle new AMC fields
        if (field === "amcFromDate" || field === "amcToDate") {
          updatedItem[field] = value; // Date fields
        } else if (field === "amcCost") {
          updatedItem[field] = parseFloat(value) || 0; // Numeric field
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };
  const handleBuildingChange = (field, value) => {
    setBuildingData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "subCategory" && value !== "Others" ? { customSubCategory: "" } : {}),
      ...(field === "type" && value !== "Others" ? { customType: "" } : {})
    }));
  };

  const handleLandChange = (field, value) => {
    setLandData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "subCategory" && value !== "Others" ? { customSubCategory: "" } : {})
    }));
  };

  const handleSubmitStore = async () => {
    let formData;
    if (assetCategory === "Building") {
      formData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory: buildingData.subCategory === "Others" ? buildingData.customSubCategory : buildingData.subCategory,
        location: buildingData.location,
        type: buildingData.subCategory === "Residential Quarters" && buildingData.type === "Others" ? buildingData.customType : buildingData.type,
        buildingNo: buildingData.buildingNo,
        plinthArea: buildingData.plinthArea,
        status: buildingData.status,
        dateOfConstruction: buildingData.dateOfConstruction,
        costOfConstruction: buildingData.costOfConstruction,
        remarks: buildingData.remarks
      };
    } else if (assetCategory === "Land") {
      formData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory: landData.subCategory === "Others" ? landData.customSubCategory : landData.subCategory,
        location: landData.location,
        status: landData.status,
        dateOfPossession: landData.dateOfPossession,
        controllerOrCustody: landData.controllerOrCustody,
        details: landData.details
      };
    } else {
      formData = {
        assetType,
        assetCategory,
        entryDate,
        purchaseDate,
        supplierName,
        supplierAddress,
        source: source === "Other" && customSource ? customSource : source,
        modeOfPurchase: modeOfPurchase === "Others" && customModeOfPurchase ? customModeOfPurchase : modeOfPurchase,
        billNo,
        receivedBy,
        items: JSON.stringify(items.map((item, index) => ({
          itemName: item.itemName === "Others" && item.customItemName ? item.customItemName : item.itemName,
          subCategory: item.subCategory === "Others" && item.customSubCategory ? item.customSubCategory : item.subCategory,
          itemDescription: item.itemDescription,
          quantityReceived: item.quantityReceived,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          amcFromDate: item.amcFromDate,  // Add this
          amcToDate: item.amcToDate,      // Add this
          amcCost: item.amcCost,          // Add this
          amcPhotoUrl: amcPhotoUrls[`amcPhoto${index}`] || "",  // Add this
          warrantyNumber: item.warrantyNumber,
          warrantyValidUpto: item.warrantyValidUpto,
          warrantyPhotoUrl: warrantyPhotoUrls[`warrantyPhoto${index}`] || "",
          itemIds: item.itemIds,
        }))),
        billPhotoUrl
      };
    }
    try {
      const response = await axios.post("http://localhost:3001/api/assets/storeTempAsset", formData);
      Swal.fire({ icon: "success", title: "Success!", text: "Inventory saved successfully!" });
      resetStoreForm();
    } catch (error) {
      // Check if the error is a duplicate ID error from the backend
      if (error.response && error.response.status === 400 && error.response.data.message.includes("Duplicate item IDs found")) {
        const { message, duplicateIds } = error.response.data;
        Swal.fire({
          icon: "error",
          title: "Duplicate IDs Detected",
          text: `${message}: ${duplicateIds.join(", ")}`,
        });
      } else {
        // Generic error for other cases
        Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save inventory!" });
      }
      console.error(error);
    }
  };

  const resetStoreForm = () => {
    setAssetCategory("");
    setEntryDate("");
    setPurchaseDate("");
    setSupplierName("");
    setSupplierAddress("");
    setSource("");
    setCustomSource(""); 
    setModeOfPurchase("");
    setCustomModeOfPurchase(""); 
    setBillNo("");
    setBillPhotoUrl("");
    setReceivedBy("");
    setAmcPhotoUrls({}); // Add this
    setItems([]);
    setBuildingData({ subCategory: "", customSubCategory: "", location: "", type: "", customType: "", buildingNo: "", plinthArea: "", status: "", dateOfConstruction: "", costOfConstruction: 0, remarks: "" });
    setLandData({ subCategory: "", customSubCategory: "", location: "", status: "", dateOfPossession: "", controllerOrCustody: "", details: "" });
    setItemPhotoUrls({});
    setWarrantyPhotoUrls({});
  };
  const handleFileUpload = async (file, fieldName, index) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://localhost:3001/api/assets/uploadFile", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (fieldName === "billPhoto") setBillPhotoUrl(response.data.fileUrl);
      else if (fieldName === "itemPhoto") setItemPhotoUrls((prev) => ({ ...prev, [`itemPhoto${index}`]: response.data.fileUrl }));
      else if (fieldName === "warrantyPhoto") setWarrantyPhotoUrls((prev) => ({ ...prev, [`warrantyPhoto${index}`]: response.data.fileUrl }));
      else if (fieldName === "amcPhoto") setAmcPhotoUrls((prev) => ({ ...prev, [`amcPhoto${index}`]: response.data.fileUrl })); // Add this
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
    }
  };
  const handleWarrantyPhotoChange = (e, index) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, "warrantyPhoto", index);
  };
  const handleAmcPhotoChange = (e, index) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, "amcPhoto", index);
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
    setReturnedAssets(prev => prev.map((item, i) => i === index ? { ...item, condition: value } : item));
  };
  
  const handleRemarkChange = (index, value) => {
    setRemarks(prev => ({ ...prev, [index]: value }));
  };
  
  const generateReceiptPDF = (asset, remark) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Returned Asset Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Asset Type: ${asset.assetType}`, 20, 40);
    doc.text(`Asset Category: ${asset.assetCategory}`, 20, 50);
    doc.text(`Item Name: ${asset.itemName}`, 20, 60);
    doc.text(`Sub Category: ${asset.subCategory}`, 20, 70);
    doc.text(`Item Description: ${asset.itemDescription}`, 20, 80);
    doc.text(`Returned From: ${asset.returnedFromLocation}`, 20, 90);
    if (asset.assetType === "Permanent") {
      doc.text(`Item ID: ${asset.itemId}`, 20, 100);
    } else {
      doc.text(`Returned Quantity: ${asset.returnedQuantity}`, 20, 100);
    }
    doc.text(`Condition: ${asset.condition}`, 20, 110);
    doc.text(`Remark: ${remark || "N/A"}`, 20, 120);
    doc.text("Signature: ____________________", 150, 280, { align: "right" });
    return doc.output("blob");
  };
  const handleDownloadReceipt = async (index) => {
    const asset = returnedAssets[index];
    const remark = remarks[index] || "";
    const pdfBlob = generateReceiptPDF(asset, remark);
  
    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read PDF blob"));
        reader.readAsDataURL(pdfBlob);
      });
  
      const response = await axios.post(`${serverBaseUrl}/api/assets/storeReturnedReceipt`, {
        assetId: asset._id,
        pdfBase64: base64Data,
        assetType: asset.assetType,
      });
      
      // Force download immediately after storing
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `receipt_${asset.itemId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
  
      // Update state with the stored URL
      setReturnedAssets(prev => prev.map((item, i) => i === index ? { ...item, pdfUrl: response.data.pdfUrl } : item));
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to generate receipt!" });
      console.error("Error in handleDownloadReceipt:", error);
    }
  };
  const handleUploadSignedReceipt = async (index, file) => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetId", returnedAssets[index]._id);
    formData.append("assetType", returnedAssets[index].assetType);
  
    try {
      const response = await axios.post(`${serverBaseUrl}/api/assets/uploadSignedReturnedReceipt`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const signedPdfUrl = response.data.signedPdfUrl;
      setReturnedAssets(prev => prev.map((item, i) => 
        i === index ? { ...item, signedPdfUrl, isUploaded: true } : item
      ));
      Swal.fire({ icon: "success", title: "Success!", text: "Signed receipt uploaded!" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to upload signed receipt!" });
      console.error(error);
    }
  };
  
  const handleDoneReturnedAsset = async (index) => {
    const asset = returnedAssets[index];
    if (!asset.signedPdfUrl) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please upload signed receipt first!" });
      return;
    }
  
    if (!asset._id || !asset.assetType || (asset.assetType === "Consumable" && !asset.returnedQuantity)) {
      Swal.fire({ icon: "error", title: "Error", text: "Missing required asset data!" });
      return;
    }
  
    try {
      const status =
        asset.assetType === "Permanent"
          ? asset.condition === "To Be Serviced" ? "service" : "dispose"
          : asset.condition === "To Be Exchanged" ? "exchange" : "dispose";
  
      await axios.post(`${serverBaseUrl}/api/assets/saveReturnedStatus`, {
        _id: asset._id,
        status,
        remark: remarks[index] || "",
        pdfUrl: asset.pdfUrl,
        signedPdfUrl: asset.signedPdfUrl,
        assetType: asset.assetType,
        ...(asset.assetType === "Consumable" && { returnedQuantity: asset.returnedQuantity }),
      });
  
      // Do not remove from returnedAssets immediately; wait for approval
      Swal.fire({ icon: "success", title: "Submitted!", text: "Asset condition submitted for approval!" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save asset condition!" });
      console.error(error);
    }
  };
  // Serviced/Maintenance Functions
  const handleMaintenanceChange = (field, value) => {
    setMaintenanceData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitMaintenance = async () => {
    if (assetCategory === "Building") {
      if (!maintenanceData.buildingNo || !maintenanceData.yearOfMaintenance || maintenanceData.cost <= 0 || !maintenanceData.description || !maintenanceData.custody || !maintenanceData.agency) {
        Swal.fire({ icon: "warning", title: "Warning", text: "Please fill all fields!" });
        return;
      }
      try {
        await axios.post("http://localhost:3001/api/assets/saveMaintenance", {
          assetType,
          assetCategory,
          buildingNo: maintenanceData.buildingNo,
          yearOfMaintenance: maintenanceData.yearOfMaintenance,
          cost: maintenanceData.cost,
          description: maintenanceData.description,
          custody: maintenanceData.custody,
          agency: maintenanceData.agency,
        });
        Swal.fire({ icon: "success", title: "Success!", text: "Maintenance saved!" });
        setMaintenanceData({ buildingNo: "", yearOfMaintenance: "", cost: 0, description: "", custody: "", agency: "" });
      } catch (error) {
        Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save maintenance!" });
        console.error(error);
      }
    }
  };

  // Disposable Assets Functions
  const handleDisposableChange = (field, value) => {
    setDisposableData(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === "quantity" && value > availableQuantity ? { quantity: availableQuantity } : {})
    }));
  };

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
  const removeItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
    setItemPhotoUrls((prev) => {
      const updated = { ...prev };
      delete updated[`itemPhoto${index}`];
      return updated;
    });
    setWarrantyPhotoUrls((prev) => {
      const updated = { ...prev };
      delete updated[`warrantyPhoto${index}`];
      return updated;
    });
  };
  const handleSubmitDisposable = async () => {
    if (
      !disposableData.itemName ||
      !disposableData.itemDescription ||
      (assetType === "Permanent" && disposableData.itemIds.length === 0) ||
      (assetType === "Consumable" && (!disposableData.quantity || disposableData.quantity <= 0)) ||
      disposableData.bookValue < 0 ||
      !disposableData.inspectionDate ||
      !disposableData.condemnationDate ||
      !disposableData.remark ||
      disposableData.disposalValue < 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please fill all fields and provide valid quantity/IDs!",
      });
      return;
    }
  
    try {
      await axios.post("http://localhost:3001/api/assets/requestForDisposal", {
        assetType,
        assetCategory,
        itemName: disposableData.itemName,
        subCategory: disposableData.subCategory,
        itemDescription: disposableData.itemDescription,
        itemIds: assetType === "Permanent" ? disposableData.itemIds : undefined,
        quantity: disposableData.quantity,
        purchaseValue: disposableData.purchaseValue,
        bookValue: disposableData.bookValue,
        inspectionDate: disposableData.inspectionDate,
        condemnationDate: disposableData.condemnationDate,
        remark: disposableData.remark,
        disposalValue: disposableData.disposalValue,
      });
      Swal.fire({ icon: "success", title: "Success!", text: "Disposable asset saved!" });
      setDisposableData({
        itemName: "",
        subCategory: "",
        itemDescription: "",
        itemIds: [],
        quantity: 0,  // Added
        purchaseValue: 0,
        bookValue: 0,
        inspectionDate: "",
        condemnationDate: "",
        remark: "",
        disposalValue: 0,
      });
      setDisposableItems([]);
      setPurchaseValues({});
      setAvailableQuantity(0);
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
        <a href="#" className="brand"><span className="text">ASSET ENTRY STAFF</span></a>
        <ul className="side-menu top">
            <li className="active"><a href={`/assetentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li ><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
            <li><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
            <li><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
            <li><a href={`/viewasset?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Asset View</span></a></li>
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
          <button style={activeTab === "serviced" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("serviced")}>Serviced/Maintenance</button>
          <button style={activeTab === "disposable" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("disposable")}>Condemnation</button>
        </div>

        <main>
          <div style={styles.container}>
            <h2>Asset Management System</h2>

            {activeTab === "store" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
                  <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
                  <div style={styles.inputGroup}><label>Entry Date:</label><input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={styles.input} /></div>
                </div>

                {assetCategory && assetCategory !== "Building" && assetCategory !== "Land" && (
                  <>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Purchase Date:</label><input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Supplier Name:</label><input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Supplier Address:</label><input type="text" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>
  <div style={styles.inputGroup}>
    <label>Source:</label>
    <select value={source} onChange={(e) => setSource(e.target.value)} style={styles.input}>
      <option value="">Select Source</option>
      {sourceOptions.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {source === "Other" && (
      <input
        type="text"
        value={customSource}
        onChange={(e) => setCustomSource(e.target.value)}
        placeholder="Enter custom source"
        style={{ ...styles.input, marginTop: "5px" }}
      />
    )}
  </div>
  <div style={styles.inputGroup}>
    <label>Mode of Purchase:</label>
    <select value={modeOfPurchase} onChange={(e) => setModeOfPurchase(e.target.value)} style={styles.input}>
      <option value="">Select Mode</option>
      {modeOfPurchaseOptions.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {modeOfPurchase === "Others" && (
      <input
        type="text"
        value={customModeOfPurchase}
        onChange={(e) => setCustomModeOfPurchase(e.target.value)}
        placeholder="Enter custom mode"
        style={{ ...styles.input, marginTop: "5px" }}
      />
    )}
  </div>
  <div style={styles.inputGroup}>
    <label>Bill No:</label>
    <input type="text" value={billNo} onChange={(e) => setBillNo(e.target.value)} style={styles.input} />
  </div>
</div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Bill Photo:</label><input type="file" onChange={handleBillPhotoChange} />{billPhotoUrl && <img src={billPhotoUrl} alt="Bill Photo" width="100" />}</div>
                      <div style={styles.inputGroup}><label>Received By:</label><input type="text" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} style={styles.input} /></div>
                    </div>
                  </>
                )}

                {assetCategory === "Building" && (
                  <>
                    <h3>Building Details</h3>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label>Sub Category:</label>
                        <select value={buildingData.subCategory} onChange={(e) => handleBuildingChange("subCategory", e.target.value)} style={styles.input}>
                          <option value="">Select Sub Category</option>
                          {subCategoryOptions["Building"]?.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
                        </select>
                      </div>
                      {buildingData.subCategory === "Others" && (
                        <div style={styles.inputGroup}>
                          <label>Custom Sub Category:</label>
                          <input type="text" value={buildingData.customSubCategory} onChange={(e) => handleBuildingChange("customSubCategory", e.target.value)} style={styles.input} />
                        </div>
                      )}
                      <div style={styles.inputGroup}><label>Location:</label><input type="text" value={buildingData.location} onChange={(e) => handleBuildingChange("location", e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label>Type:</label>
                        {buildingData.subCategory === "Residential Quarters" ? (
                          <select value={buildingData.type} onChange={(e) => handleBuildingChange("type", e.target.value)} style={styles.input}>
                            <option value="">Select Type</option>
                            {itemNameOptions["Residential Quarters"].map((type) => (<option key={type} value={type}>{type}</option>))}
                          </select>
                        ) : (
                          <input type="text" value={buildingData.type} onChange={(e) => handleBuildingChange("type", e.target.value)} style={styles.input} />
                        )}
                      </div>
                      {buildingData.subCategory === "Residential Quarters" && buildingData.type === "Others" && (
                        <div style={styles.inputGroup}>
                          <label>Custom Type:</label>
                          <input type="text" value={buildingData.customType} onChange={(e) => handleBuildingChange("customType", e.target.value)} style={styles.input} />
                        </div>
                      )}
                      <div style={styles.inputGroup}><label>Building No:</label><input type="text" value={buildingData.buildingNo} onChange={(e) => handleBuildingChange("buildingNo", e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Plinth Area:</label><input type="text" value={buildingData.plinthArea} onChange={(e) => handleBuildingChange("plinthArea", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Status:</label><input type="text" value={buildingData.status} onChange={(e) => handleBuildingChange("status", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Date of Construction:</label><input type="date" value={buildingData.dateOfConstruction} onChange={(e) => handleBuildingChange("dateOfConstruction", e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Cost of Construction:</label><input type="number" value={buildingData.costOfConstruction} onChange={(e) => handleBuildingChange("costOfConstruction", parseFloat(e.target.value) || 0)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Remarks:</label><input type="text" value={buildingData.remarks} onChange={(e) => handleBuildingChange("remarks", e.target.value)} style={styles.input} /></div>
                    </div>
                  </>
                )}

                {assetCategory === "Land" && (
                  <>
                    <h3>Land Details</h3>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label>Sub Category:</label>
                        <select value={landData.subCategory} onChange={(e) => handleLandChange("subCategory", e.target.value)} style={styles.input}>
                          <option value="">Select Sub Category</option>
                          {subCategoryOptions["Land"]?.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
                        </select>
                      </div>
                      {landData.subCategory === "Others" && (
                        <div style={styles.inputGroup}>
                          <label>Custom Sub Category:</label>
                          <input type="text" value={landData.customSubCategory} onChange={(e) => handleLandChange("customSubCategory", e.target.value)} style={styles.input} />
                        </div>
                      )}
                      <div style={styles.inputGroup}><label>Location:</label><input type="text" value={landData.location} onChange={(e) => handleLandChange("location", e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Status:</label><input type="text" value={landData.status} onChange={(e) => handleLandChange("status", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Date of Possession:</label><input type="date" value={landData.dateOfPossession} onChange={(e) => handleLandChange("dateOfPossession", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Controller/Custody:</label><input type="text" value={landData.controllerOrCustody} onChange={(e) => handleLandChange("controllerOrCustody", e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Details:</label><input type="text" value={landData.details} onChange={(e) => handleLandChange("details", e.target.value)} style={styles.input} /></div>
                    </div>
                  </>
                )}

{assetCategory && assetCategory !== "Building" && assetCategory !== "Land" && (
  <>
    <h3>Items</h3>
    {items.map((item, index) => (
      <div key={index} style={styles.itemContainer}>
        <div style={styles.itemRow}>
          {assetType === "Permanent" && (
            <>
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
            </>
          )}
          <div style={styles.inputGroup}>
            <label>Item Name:</label>
            {assetType === "Permanent" && itemNameOptions[item.subCategory] ? (
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
          {assetType === "Permanent" && itemNameOptions[item.subCategory] && item.itemName === "Others" && (
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
            {itemPhotoUrls[`itemPhoto${index}`] && (
              <img src={itemPhotoUrls[`itemPhoto${index}`]} alt={`Item Photo ${index + 1}`} width="100" />
            )}
          </div>
        </div>
        <div style={styles.itemRow}>
      <div style={styles.inputGroup}>
        <label>AMC From Date:</label>
        <input type="date" value={item.amcFromDate} onChange={(e) => handleItemChange(index, "amcFromDate", e.target.value)} style={styles.input} />
      </div>
      <div style={styles.inputGroup}>
        <label>AMC To Date:</label>
        <input type="date" value={item.amcToDate} onChange={(e) => handleItemChange(index, "amcToDate", e.target.value)} style={styles.input} />
      </div>
      <div style={styles.inputGroup}>
        <label>AMC Cost:</label>
        <input type="number" value={item.amcCost} onChange={(e) => handleItemChange(index, "amcCost", e.target.value)} style={styles.input} />
      </div>
    </div>
        <div style={styles.itemRow}>
        <div style={styles.inputGroup}>
        <label>AMC Photo {index + 1}:</label>
        <input type="file" onChange={(e) => handleAmcPhotoChange(e, index)} />
        {amcPhotoUrls[`amcPhoto${index}`] && <img src={amcPhotoUrls[`amcPhoto${index}`]} alt={`AMC Photo ${index + 1}`} width="100" />}
      </div>
          <div style={styles.inputGroup}>
            <label>Warranty Number:</label>
            <input type="text" value={item.warrantyNumber} onChange={(e) => handleItemChange(index, "warrantyNumber", e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Warranty Valid Upto:</label>
            <input type="date" value={item.warrantyValidUpto} onChange={(e) => handleItemChange(index, "warrantyValidUpto", e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Warranty Photo {index + 1}:</label>
            <input type="file" onChange={(e) => handleWarrantyPhotoChange(e, index)} />
            {warrantyPhotoUrls[`warrantyPhoto${index}`] && <img src={warrantyPhotoUrls[`warrantyPhoto${index}`]} alt={`Warranty Photo ${index + 1}`} width="100" />}
          </div>
        </div>
        {assetType === "Permanent" && (
          <div style={styles.itemRow}>
            <div style={styles.inputGroup}>
              <button onClick={() => toggleIdInputs(index)} style={styles.button}>
                {item.showIdInputs ? "Hide IDs" : "Assign IDs"}
              </button>
            </div>
          </div>
        )}
        {item.showIdInputs && assetType === "Permanent" && (
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
        <div style={styles.itemRow}>
          <div style={styles.inputGroup}>
            <button
              onClick={() => removeItem(index)}
              style={{ ...styles.button, backgroundColor: "#ff4444" }}
            >
              Remove Item
            </button>
          </div>
        </div>
      </div>
    ))}
    <div style={styles.buttonContainer}>
      <button onClick={addItem} style={styles.button}>
        <FaPlus /> Add Item
      </button>
    </div>
  </>
)}

                <div style={styles.buttonContainer}><button onClick={handleSubmitStore} style={styles.button}>Submit</button></div>
              </div>
            )}

{activeTab === "returned" && (
  <div style={styles.formContainer}>
    <div style={styles.formRow}>
      <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
      <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
    </div>
    <div style={styles.cardContainer}>
      {returnedAssets.map((asset, index) => (
        <div key={index} style={styles.card}>
          <div style={styles.cardHeader}>
            <h3>{asset.itemName || "Unnamed Item"}</h3>
            <span style={styles.assetTypeBadge}>{asset.assetType || "N/A"}</span>
          </div>
          <div style={styles.cardBody}>
            <p><strong>Category:</strong> {asset.assetCategory || "N/A"}</p>
            <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
            <p><strong>Description:</strong> {asset.itemDescription || "N/A"}</p>
            <p><strong>Returned From:</strong> {asset.returnedFromLocation || "N/A"}</p>
            {asset.assetType === "Permanent" ? (
              <p><strong>Item ID:</strong> {asset.itemId || "N/A"}</p>
            ) : (
              <p><strong>Returned Quantity:</strong> {asset.returnedQuantity || "N/A"}</p>
            )}
            <div style={styles.conditionSelect}>
              <label><strong>Condition:</strong></label>
              <select
                value={asset.condition}
                onChange={(e) => handleConditionChange(index, e.target.value)}
                style={styles.select}
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
            <div style={styles.inputGroup}>
              <label><strong>Remark:</strong></label>
              <input
                type="text"
                value={remarks[index] || ""}
                onChange={(e) => handleRemarkChange(index, e.target.value)}
                style={styles.input}
                placeholder="Enter remark"
              />
            </div>
            <div style={styles.actionGroup}>
              <button onClick={() => handleDownloadReceipt(index)} style={styles.button}>
                Download Receipt
              </button>
              <div style={styles.uploadGroup}>
                <label style={styles.uploadLabel}><strong>Signed Receipt:</strong></label>
                <input
                  type="file"
                  onChange={(e) => handleUploadSignedReceipt(index, e.target.files[0])}
                  accept="application/pdf"
                  style={styles.fileInput}
                />
                {asset.signedPdfUrl && (
                  <a href={asset.signedPdfUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>View</a>
                )}
              </div>
            </div>
            <div style={styles.doneButtonContainer}>
              <button
                onClick={() => handleDoneReturnedAsset(index)}
                style={{
                  ...styles.button,
                  backgroundColor: asset.signedPdfUrl ? "#007BFF" : "#ccc",
                  cursor: asset.signedPdfUrl ? "pointer" : "not-allowed",
                  width: "100%",
                }}
                disabled={!asset.signedPdfUrl}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

            {activeTab === "serviced" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
                  <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
                </div>
                {assetCategory === "Building" ? (
                  <>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Building No:</label><input type="text" value={maintenanceData.buildingNo} onChange={(e) => handleMaintenanceChange("buildingNo", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Year of Maintenance:</label><input type="date" value={maintenanceData.yearOfMaintenance} onChange={(e) => handleMaintenanceChange("yearOfMaintenance", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Cost:</label><input type="number" value={maintenanceData.cost} onChange={(e) => handleMaintenanceChange("cost", parseFloat(e.target.value) || 0)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Description:</label><input type="text" value={maintenanceData.description} onChange={(e) => handleMaintenanceChange("description", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Custody:</label><input type="text" value={maintenanceData.custody} onChange={(e) => handleMaintenanceChange("custody", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Agency:</label><input type="text" value={maintenanceData.agency} onChange={(e) => handleMaintenanceChange("agency", e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.buttonContainer}><button onClick={handleSubmitMaintenance} style={styles.button}>Submit</button></div>
                  </>
                ) : (
                  <div style={styles.formContainer}>
                    <div style={styles.formRow}>
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
              </div>
            )}

{
  activeTab === "disposable" && assetCategory !== "Land" && (
    <div style={styles.formContainer}>
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
              ? permanentAssetOptions.filter((opt) => opt !== "Land")
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
            value={`${disposableData.itemName} - ${disposableData.subCategory} - ${disposableData.itemDescription}`}
            onChange={(e) => {
              const [itemName, subCategory, itemDescription] = e.target.value.split(" - ");
              setDisposableData((prev) => ({
                ...prev,
                itemName,
                subCategory,
                itemDescription,
              }));
            }}
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
      <div style={styles.formRow}>
        <div style={styles.inputGroup}>
          <label>Available Quantity:</label>
          <input
            type="number"
            value={availableQuantity}
            disabled
            style={styles.input}
          />
        </div>
          <div style={styles.inputGroup}>
            <label>Disposal Quantity:</label>
            <input
              type="number"
              value={disposableData.quantity}
              onChange={(e) => handleDisposableChange("quantity", parseInt(e.target.value) || 0)}
              max={availableQuantity}
              min="0"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Purchase Value:</label>
            <input
              type="number"
              value={disposableData.purchaseValue}
              disabled
              style={styles.input}
            />
          </div>
        
      </div>
      <div style={styles.formRow}>
      <div style={styles.inputGroup}>
          <label>Book Value:</label>
          <input
            type="number"
            value={disposableData.bookValue}
            onChange={(e) => handleDisposableChange("bookValue", parseFloat(e.target.value) || 0)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Inspection Date:</label>
          <input
            type="date"
            value={disposableData.inspectionDate}
            onChange={(e) => handleDisposableChange("inspectionDate", e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Condemnation Date:</label>
          <input
            type="date"
            value={disposableData.condemnationDate}
            onChange={(e) => handleDisposableChange("condemnationDate", e.target.value)}
            style={styles.input}
          />
        </div>
        
      </div>
      <div style={styles.formRow}>
        <div style={styles.inputGroup}>
          <label>Disposal Value:</label>
          <input
            type="number"
            value={disposableData.disposalValue}
            onChange={(e) => handleDisposableChange("disposalValue", parseFloat(e.target.value) || 0)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Remark:</label>
          <input
            type="text"
            value={disposableData.remark}
            onChange={(e) => handleDisposableChange("remark", e.target.value)}
            style={styles.input}
          />
        </div>
      </div>
      {assetType === "Permanent" && assetCategory !== "Building" && (
        <div style={styles.inputGroup}>
          <label>Select Disposable Item IDs (Available: {availableQuantity}):</label>
          <div style={styles.checkboxContainer}>
            {disposableItems.map((id) => (
              <label key={id} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={disposableData.itemIds.includes(id)}
                  onChange={(e) => handleDisposableIdSelection(id)}
                  disabled={disposableData.itemIds.length >= availableQuantity && !disposableData.itemIds.includes(id)}
                />
                {id} {purchaseValues[id] !== undefined ? `- ₹${purchaseValues[id]}` : "- Fetching..."}
              </label>
            ))}
          </div>
        </div>
      )}
      <div style={styles.buttonContainer}>
        <button onClick={handleSubmitDisposable} style={styles.button}>
          Submit
        </button>
      </div>
    </div>
  )
}
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
  // Remove table-specific styles
  // table: { width: "100%", borderCollapse: "collapse" },
  // "table th, table td": { border: "1px solid #ddd", padding: "8px", textAlign: "left" },
  // "table th": { backgroundColor: "#f4f4f4" },
  // Add new card styles
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
    display: "flex",
    flexDirection: "column",
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
    flexGrow: 1,
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
  actionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "15px",
  },
  uploadGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  uploadLabel: {
    fontWeight: "bold",
  },
  fileInput: {
    padding: "5px",
  },
  link: {
    color: "#007BFF",
    textDecoration: "none",
    fontWeight: "bold",
  },
  doneButtonContainer: {
    padding: "15px",
    borderTop: "1px solid #eee",
  },
};

export default AssetStore;