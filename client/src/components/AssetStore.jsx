import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const AssetStore = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const rejectedId = queryParams.get("rejectedId");
  const initialTab = queryParams.get("tab") || "store"; // Add this line
  const [isEditingRejected, setIsEditingRejected] = useState(false);
  const [rejectedAction, setRejectedAction] = useState(""); // To track "service" or "disposal"
  const [customSource, setCustomSource] = useState("");
  const [unitPurchaseValue, setUnitPurchaseValue] = useState(0);
  const [customModeOfPurchase, setCustomModeOfPurchase] = useState("");
  const [remarks, setRemarks] = useState({});
  const [signedReceipts, setSignedReceipts] = useState({}); // For storing signed receipt URLs
  const [amcPhotoUrls, setAmcPhotoUrls] = useState({});
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [activeTab, setActiveTab] = useState(initialTab); // Update this line
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
    subCategory: "", customSubCategory: "", location: "", type: "", customType: "", buildingNo: "", approvedEstimate: "", plinthArea: "", status: "", customStatus: "",dateOfConstruction: "", costOfConstruction: 0, remarks: "", approvedBuildingPlanUrl: "", kmzOrkmlFileUrl: ""
  });
  const [landData, setLandData] = useState({
    subCategory: "", customSubCategory: "", location: "", status: "",customStatus: "",  dateOfPossession: "", controllerOrCustody: "", details: ""
  });
  const [returnedAssets, setReturnedAssets] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState({
    buildingNo: "", yearOfMaintenance: "", cost: 0, description: "", custody: "", agency: ""
  });
  const [disposableData, setDisposableData] = useState({
    itemName: "",
    subCategory: "",
    itemDescription: "",
    itemIds: [],
    quantity: 0,
    purchaseValue: 0,
    bookValue: 0,
    inspectionDate: "",
    condemnationDate: "",
    remark: "",
    disposalValue: 0,
    condemnationYear: "",
    certificateObtained: "",
    authority: "",
    dateOfReferenceUrl: "",
    agency: "",
    agencyReferenceNumberUrl: "",
    date: "",
    demolitionPeriod: "",
    demolitionEstimate: "",
    methodOfDisposal: "", // Add this line
    customMethodOfDisposal: "", // Added new field
  });
  
  const resetAllFields = () => {
    setIsEditingRejected(false);
    setRejectedAction("");
    setCustomSource("");
    setCustomModeOfPurchase("");
    setRemarks({});
    setSignedReceipts({});
    setAmcPhotoUrls({});
    setAvailableQuantity(0);
    setBillPhotoUrl("");
    setItemPhotoUrls({});
    setAssetType("Permanent");
    setAssetCategory("");
    setEntryDate("");
    setPurchaseDate("");
    setSupplierName("");
    setServicedData({
      itemName: "",
      subCategory: "",
      itemDescription: "",
      itemIds: [],
      serviceNo: "",
      serviceDate: "",
      serviceAmount: 0,
    });
    setSupplierAddress("");
    setSource("");
    setModeOfPurchase("");
    setBillNo("");
    setReceivedBy("");
    setServicableItems([]);
    setItems([]);
    setWarrantyPhotoUrls({});
    setBuildingData({
      subCategory: "",
      customSubCategory: "",
      location: "",
      type: "",
      customType: "",
      buildingNo: "",
      approvedEstimate: "",
      plinthArea: "",
      status: "",
      customStatus: "",
      dateOfConstruction: "",
      costOfConstruction: 0,
      remarks: "",
      approvedBuildingPlanUrl: "",
      kmzOrkmlFileUrl: "",
    });
    setLandData({
      subCategory: "",
      customSubCategory: "",
      location: "",
      status: "",
      customStatus: "",
      dateOfPossession: "",
      controllerOrCustody: "",
      details: "",
    });
    setReturnedAssets([]);
    setMaintenanceData({
      buildingNo: "",
      yearOfMaintenance: "",
      cost: 0,
      description: "",
      custody: "",
      agency: "",
    });
    setDisposableData({
      itemName: "",
      subCategory: "",
      itemDescription: "",
      itemIds: [],
      quantity: 0,
      purchaseValue: 0,
      bookValue: 0,
      inspectionDate: "",
      condemnationDate: "",
      remark: "",
      disposalValue: 0,
      condemnationYear: "",
      certificateObtained: "",
      authority: "",
      dateOfReferenceUrl: "",
      agency: "",
      agencyReferenceNumberUrl: "",
      date: "",
      demolitionPeriod: "",
      demolitionEstimate: "",
      methodOfDisposal: "",
      customMethodOfDisposal: "",
    });
    setStoreItems([]);
    setDisposableItems([]);
    setPurchaseValues({});
    setSelectedSubCategory("");
    setBuildingUpgrades([]);
    setUpgradeForms([]);
  };
  const [storeItems, setStoreItems] = useState([]);
  const [disposableItems, setDisposableItems] = useState([]);
  const [purchaseValues, setPurchaseValues] = useState({});
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [buildingUpgrades, setBuildingUpgrades] = useState([]);
  const [upgradeForms, setUpgradeForms] = useState([]);
  const [newUpgrade, setNewUpgrade] = useState({
    year: "",
    estimate: 0,
    approvedEstimate: 0,
    dateOfCompletion: "",
    defectliabiltyPeriod: "",
    executionAgency: "",
    dateOfHandover: "", // Add this
  documentUrl: "",    // Add this
  });
  const handleIdSelection = (index, id) => {
    setReturnedAssets((prev) =>
      prev.map((asset, i) =>
        i === index && asset.source === "store" && asset.assetType === "Permanent"
          ? {
              ...asset,
              selectedIds: asset.selectedIds.includes(id)
                ? asset.selectedIds.filter((selectedId) => selectedId !== id)
                : [...asset.selectedIds, id],
            }
          : asset
      )
    );
  };
  const addUpgradeForm = () => {
    setUpgradeForms(prev => [
      ...prev,
      {
        year: "",
        estimate: 0,
        approvedEstimate: 0,
        dateOfCompletion: "",
        defectliabiltyPeriod: "",
        executionAgency: "",
        dateOfHandover: "", // Add this
      documentUrl: "",    // Add this
      }
    ]);
  };

  const removeUpgradeForm = (index) => {
    setUpgradeForms(prev => prev.filter((_, i) => i !== index));
  };
  const [allItemIds, setAllItemIds] = useState([]);

  // Update this whenever IDs change
  useEffect(() => {
    const ids = items.flatMap(item => 
      assetType === "Permanent" && item.showIdInputs ? item.itemIds : []
    );
    setAllItemIds(ids);
  }, [items, assetType]);
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
  useEffect(() => {
    if (rejectedId) {
      const fetchRejectedAsset = async () => {
        try {
          const response = await axios.get(`http://${ip}:${port}/api/assets/rejected-asset/${rejectedId}`);
          const rejectedAsset = response.data.data;
  
          setAssetType(rejectedAsset.assetType || "Permanent");
          setAssetCategory(rejectedAsset.assetCategory || "");
  
          if (rejectedAsset.serviceNo || rejectedAsset.serviceDate || rejectedAsset.serviceAmount) {
            setRejectedAction("service");
            setActiveTab("serviced");
            setServicedData({
              itemName: rejectedAsset.itemName || "",
              subCategory: rejectedAsset.subCategory || "",
              itemDescription: rejectedAsset.itemDescription || "",
              itemIds: rejectedAsset.itemIds || [],
              serviceNo: rejectedAsset.serviceNo || "",
              serviceDate: rejectedAsset.serviceDate ? rejectedAsset.serviceDate.split("T")[0] : "",
              serviceAmount: rejectedAsset.serviceAmount || 0,
            });
          } else if (
            rejectedAsset.assetCategory === "Building" &&
            (rejectedAsset.condemnationYear || rejectedAsset.certificateObtained || rejectedAsset.authority)
          ) {
            setRejectedAction("disposal");
            setActiveTab("disposable");
            setDisposableData({
              subCategory: rejectedAsset.subCategory || "",
              condemnationYear: rejectedAsset.condemnationYear || "",
              certificateObtained: rejectedAsset.certificateObtained || "",
              authority: rejectedAsset.authority || "",
              dateOfReferenceUrl: rejectedAsset.dateOfReferenceUrl || "",
              agency: rejectedAsset.agency || "",
              agencyReferenceNumberUrl: rejectedAsset.agencyReferenceNumberUrl || "",
              date: rejectedAsset.date ? rejectedAsset.date.split("T")[0] : "",
              demolitionPeriod: rejectedAsset.demolitionPeriod || "",
              demolitionEstimate: rejectedAsset.demolitionEstimate || "",
              itemName: "", // Reset non-building fields
              itemDescription: "",
              itemIds: [],
              quantity: 0,
              purchaseValue: 0,
              bookValue: 0,
              methodOfDisposal: rejectedAsset.methodOfDisposal || "",
              inspectionDate: "",
              condemnationDate: "",
              remark: "",
              disposalValue: 0,
            });
          } else if (
            rejectedAsset.assetCategory === "Building" &&
            rejectedAsset.rejected === "yes" &&
            rejectedAsset.custody
          ) {
            setRejectedAction("maintenance");
            setActiveTab("serviced");
            setMaintenanceData({
              subCategory: rejectedAsset.subCategory || "",
              buildingNo: rejectedAsset.buildingNo || "",
              yearOfMaintenance: rejectedAsset.yearOfMaintenance
                ? rejectedAsset.yearOfMaintenance.split("T")[0]
                : "",
              cost: rejectedAsset.cost || 0,
              description: rejectedAsset.description || "",
              custody: rejectedAsset.custody || "",
              agency: rejectedAsset.agency || "",
            });
            setIsEditingRejected(true);
            Swal.fire({
              icon: "info",
              title: "Editing Rejected Maintenance",
              text: "You are now editing a rejected maintenance entry. Update the details and resubmit.",
            });
          } else if (rejectedAsset.purchaseValue || rejectedAsset.bookValue || rejectedAsset.inspectionDate) {
            setRejectedAction("disposal");
            setActiveTab("disposable");
            setDisposableData({
              itemName: rejectedAsset.itemName || "",
              subCategory: rejectedAsset.subCategory || "",
              itemDescription: rejectedAsset.itemDescription || "",
              itemIds: rejectedAsset.itemIds || [],
              quantity: rejectedAsset.quantity || 0,
              purchaseValue: rejectedAsset.purchaseValue || 0,
              bookValue: rejectedAsset.bookValue || 0,
              inspectionDate: rejectedAsset.inspectionDate ? rejectedAsset.inspectionDate.split("T")[0] : "",
              condemnationDate: rejectedAsset.condemnationDate ? rejectedAsset.condemnationDate.split("T")[0] : "",
              remark: rejectedAsset.remark || "",
              disposalValue: rejectedAsset.disposalValue || 0,
              methodOfDisposal: rejectedAsset.methodOfDisposal || "",
              condemnationYear: "",
              certificateObtained: "",
              authority: "",
              dateOfReferenceUrl: "",
              agency: "",
              agencyReferenceNumberUrl: "",
              date: "",
              demolitionPeriod: "",
              demolitionEstimate: "",
            });
          } else if (rejectedAsset.assetCategory === "Building" && rejectedAsset.upgrades && rejectedAsset.upgrades.length > 0) {
            setRejectedAction("buildingupgrade");
            setActiveTab("buildingupgrade");
            setSelectedSubCategory(rejectedAsset.subCategory || "");
            setUpgradeForms(
              rejectedAsset.upgrades.map((upgrade) => ({
                year: upgrade.year || "",
                estimate: upgrade.estimate || 0,
                approvedEstimate: upgrade.approvedEstimate || 0,
                dateOfCompletion: upgrade.dateOfCompletion ? upgrade.dateOfCompletion.split("T")[0] : "",
                defectliabiltyPeriod: upgrade.defectliabiltyPeriod || "",
                executionAgency: upgrade.executionAgency || "",
                dateOfHandover: upgrade.dateOfHandover ? upgrade.dateOfHandover.split("T")[0] : "",
                documentUrl: upgrade.documentUrl || "",
              }))
            );
          } else {
            setRejectedAction("store");
            setActiveTab("store");
            setEntryDate(rejectedAsset.entryDate ? rejectedAsset.entryDate.split("T")[0] : "");
            setPurchaseDate(rejectedAsset.purchaseDate ? rejectedAsset.purchaseDate.split("T")[0] : "");
            setSupplierName(rejectedAsset.supplierName || "");
            setSupplierAddress(rejectedAsset.supplierAddress || "");
  
            // Handle source
            setSource(sourceOptions.includes(rejectedAsset.source) ? rejectedAsset.source : "Other");
            setCustomSource(sourceOptions.includes(rejectedAsset.source) ? (rejectedAsset.source === "Other" ? "" : "") : rejectedAsset.source || "");
  
            // Handle modeOfPurchase
            setModeOfPurchase(modeOfPurchaseOptions.includes(rejectedAsset.modeOfPurchase) ? rejectedAsset.modeOfPurchase : "Others");
            setCustomModeOfPurchase(modeOfPurchaseOptions.includes(rejectedAsset.modeOfPurchase) ? (rejectedAsset.modeOfPurchase === "Others" ? "" : "") : rejectedAsset.modeOfPurchase || "");
  
            setBillNo(rejectedAsset.billNo || "");
            setReceivedBy(rejectedAsset.receivedBy || "");
            setBillPhotoUrl(rejectedAsset.billPhotoUrl || "");
  
            if (rejectedAsset.assetCategory === "Building") {
              const buildingSubCategoryOptions = subCategoryOptions.Building;
              const buildingTypeOptions = ["Type-A5", "Type-A2", "Type-5", "Type-4", "Type-3", "Type-2", "Type-D", "Others"];
              const statusOptions = ["Permanent", "Lease", "Others"];
  
              setBuildingData({
                subCategory: buildingSubCategoryOptions.includes(rejectedAsset.subCategory) ? rejectedAsset.subCategory : "Others",
                customSubCategory: buildingSubCategoryOptions.includes(rejectedAsset.subCategory) ? (rejectedAsset.subCategory === "Others" ? "" : "") : rejectedAsset.subCategory || "",
                location: rejectedAsset.location || "",
                type: rejectedAsset.subCategory === "Residential Quarters" 
                  ? (buildingTypeOptions.includes(rejectedAsset.type) ? rejectedAsset.type : "Others")
                  : (rejectedAsset.type || ""),
                customType: rejectedAsset.subCategory === "Residential Quarters" 
                  ? (buildingTypeOptions.includes(rejectedAsset.type) ? (rejectedAsset.type === "Others" ? "" : "") : rejectedAsset.type || "")
                  : "",
                buildingNo: rejectedAsset.buildingNo || "",
                plinthArea: rejectedAsset.plinthArea || "",
                status: statusOptions.includes(rejectedAsset.status) ? rejectedAsset.status : "Others",
                customStatus: statusOptions.includes(rejectedAsset.status) ? (rejectedAsset.status === "Others" ? "" : "") : rejectedAsset.status || "",
                dateOfConstruction: rejectedAsset.dateOfConstruction ? rejectedAsset.dateOfConstruction.split("T")[0] : "",
                costOfConstruction: rejectedAsset.costOfConstruction || 0,
                remarks: rejectedAsset.remarks || "",
                approvedEstimate: rejectedAsset.approvedEstimate || "",
                approvedBuildingPlanUrl: rejectedAsset.approvedBuildingPlanUrl || "",
                kmzOrkmlFileUrl: rejectedAsset.kmzOrkmlFileUrl || "",
              });
            } else if (rejectedAsset.assetCategory === "Land") {
              const landSubCategoryOptions = subCategoryOptions.Land;
              const statusOptions = ["Permanent", "Lease", "Others"];
  
              setLandData({
                subCategory: landSubCategoryOptions.includes(rejectedAsset.subCategory) ? rejectedAsset.subCategory : "Others",
                customSubCategory: landSubCategoryOptions.includes(rejectedAsset.subCategory) ? (rejectedAsset.subCategory === "Others" ? "" : "") : rejectedAsset.subCategory || "",
                location: rejectedAsset.location || "",
                status: statusOptions.includes(rejectedAsset.status) ? rejectedAsset.status : "Others",
                customStatus: statusOptions.includes(rejectedAsset.status) ? (rejectedAsset.status === "Others" ? "" : "") : rejectedAsset.status || "",
                dateOfPossession: rejectedAsset.dateOfPossession ? rejectedAsset.dateOfPossession.split("T")[0] : "",
                controllerOrCustody: rejectedAsset.controllerOrCustody || "",
                details: rejectedAsset.details || "",
              });
            } else {
              const currentSubCategoryOptions = subCategoryOptions[rejectedAsset.assetCategory] || ["Generic", "Others"];
              const currentItemNameOptions = itemNameOptions[rejectedAsset.subCategory] || ["Generic", "Others"];
  
              setItems(
                rejectedAsset.items.map((item) => ({
                  itemName: currentItemNameOptions.includes(item.itemName) ? item.itemName : "Others",
                  customItemName: currentItemNameOptions.includes(item.itemName) ? (item.itemName === "Others" ? "" : "") : item.itemName || "",
                  subCategory: currentSubCategoryOptions.includes(item.subCategory) ? item.subCategory : "Others",
                  customSubCategory: currentSubCategoryOptions.includes(item.subCategory) ? (item.subCategory === "Others" ? "" : "") : item.subCategory || "",
                  itemDescription: item.itemDescription || "",
                  quantityReceived: item.quantityReceived || 0,
                  unitPrice: item.unitPrice || 0,
                  totalPrice: item.totalPrice || 0,
                  itemPhoto: null,
                  itemIds: item.itemIds || [],
                  showIdInputs: item.itemIds.length > 0,
                  amcFromDate: item.amcFromDate ? item.amcFromDate.split("T")[0] : "",
                  amcToDate: item.amcToDate ? item.amcToDate.split("T")[0] : "",
                  amcCost: item.amcCost || 0,
                  amcPhoto: null,
                  warrantyNumber: item.warrantyNumber || "",
                  warrantyValidUpto: item.warrantyValidUpto ? item.warrantyValidUpto.split("T")[0] : "",
                  warrantyPhoto: null,
                }))
              );
  
              const newItemPhotoUrls = {};
              const newWarrantyPhotoUrls = {};
              const newAmcPhotoUrls = {};
              rejectedAsset.items.forEach((item, index) => {
                if (item.itemPhotoUrl) newItemPhotoUrls[`itemPhoto${index}`] = item.itemPhotoUrl;
                if (item.warrantyPhotoUrl) newWarrantyPhotoUrls[`warrantyPhoto${index}`] = item.warrantyPhotoUrl;
                if (item.amcPhotoUrl) newAmcPhotoUrls[`amcPhoto${index}`] = item.amcPhotoUrl;
              });
              setItemPhotoUrls(newItemPhotoUrls);
              setWarrantyPhotoUrls(newWarrantyPhotoUrls);
              setAmcPhotoUrls(newAmcPhotoUrls);
            }
          }
  
          setIsEditingRejected(true);
          Swal.fire({
            icon: "info",
            title: "Editing Rejected Asset",
            text: "You are now editing a rejected asset. Update the details and resubmit.",
          });
        } catch (error) {
          console.error("Failed to fetch rejected asset:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load rejected asset data.",
          });
        }
      };
      fetchRejectedAsset();
    }
  }, [rejectedId]);
  const isFutureDate = (dateStr) => {
    if (!dateStr) return false; // No date provided, so no error (handled separately if required)
    const inputDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of today
    inputDate.setHours(0, 0, 0, 0); // Normalize input date
    return inputDate > today; // True if date is after today
  };
  useEffect(() => {
    resetAllFields();
  }, [activeTab]);
  const validateStoreForm = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    let errors = [];
    let allItemIds = []; // To track all IDs for duplicate checking

    // Asset Type and Category
    if (!assetType) errors.push("Asset Type is required.");
    if (!assetCategory) errors.push("Asset Category is required.");
    if (!entryDate) errors.push("Entry Date is required.");
    if (isFutureDate(entryDate)) errors.push("Entry Date cannot be in the future.");

    if (assetCategory === "Building") {
      if (!buildingData.subCategory) errors.push("Building Sub Category is required.");
      if (buildingData.subCategory === "Others" && !buildingData.customSubCategory) errors.push("Custom Sub Category is required for 'Others'.");
      if (buildingData.dateOfConstruction && isFutureDate(buildingData.dateOfConstruction)) errors.push("Date of Construction cannot be in the future.");
    } else if (assetCategory === "Land") {
      if (!landData.subCategory) errors.push("Land Sub Category is required.");
      if (landData.subCategory === "Others" && !landData.customSubCategory) errors.push("Custom Sub Category is required for 'Others'.");
    } else {
      if (!purchaseDate) errors.push("Purchase Date is required.");
      if (isFutureDate(purchaseDate)) errors.push("Purchase Date cannot be in the future.");

      if (items.length === 0) errors.push("At least one item is required.");
      items.forEach((item, index) => {
        if (!item.itemName) errors.push(`Item ${index + 1}: Item Name is required.`);
        if (item.itemName === "Others" && !item.customItemName) errors.push(`Item ${index + 1}: Custom Item Name is required for 'Others'.`);
        if (item.quantityReceived <= 0) errors.push(`Item ${index + 1}: Quantity Received must be greater than 0.`);
        if (item.unitPrice <= 0) errors.push(`Item ${index + 1}: Unit Price must be greater than 0.`);
        if (assetType === "Permanent" && item.showIdInputs && item.itemIds.some(id => !id)) errors.push(`Item ${index + 1}: All Item IDs must be filled.`);

        // AMC and Warranty Date Validation
        // if (item.amcFromDate && isFutureDate(item.amcFromDate)) errors.push(`Item ${index + 1}: AMC From Date cannot be in the future.`);
        // if (item.amcToDate && isFutureDate(item.amcToDate)) errors.push(`Item ${index + 1}: AMC To Date cannot be in the future.`);
        if (item.amcFromDate && item.amcToDate && new Date(item.amcFromDate) > new Date(item.amcToDate)) {
          errors.push(`Item ${index + 1}: AMC From Date cannot be later than AMC To Date.`);
        }
        if (assetType === "Permanent" && item.showIdInputs) {
          // Check for empty IDs
          const emptyIds = item.itemIds.filter(id => !id);
          if (emptyIds.length > 0) {
            errors.push(`Item ${index + 1}: All Item IDs must be filled.`);
          }
          
          // Collect only non-empty IDs for duplicate checking
          const nonEmptyIds = item.itemIds.filter(id => id.trim() !== "");
          allItemIds = [...allItemIds, ...nonEmptyIds];
        }
  
        // if (item.warrantyValidUpto && isFutureDate(item.warrantyValidUpto)) errors.push(`Item ${index + 1}: Warranty Valid Upto cannot be in the future for entry date.`);
      });
      const duplicateIds = findDuplicates(allItemIds);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate Item IDs found: ${duplicateIds.join(", ")}`);
    }
    }

    return errors;
  };
  const findDuplicates = (arr) => {
    const seen = new Set();
    const duplicates = new Set();
    
    for (const item of arr) {
      if (item.trim() === "") continue; // Skip empty strings
      
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    }
    
    return Array.from(duplicates);
  };
  const serverBaseUrl = `http://${ip}:${port}`; // Define server base URL
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
          const response = await axios.post(`http://${ip}:${port}/api/assets/getServicableItems`, {
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
          const response = await axios.post(`http://${ip}:${port}/api/assets/getStoreItems`, { assetType, assetCategory });
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
    if (activeTab === "returned" && assetType) {
      const fetchReturnedAndStoreAssets = async () => {
        try {
          console.log("Fetching returned and store assets");
          const payload = { assetType, status: "returned" };
          if (assetCategory) {
            payload.assetCategory = assetCategory;
          }
  
          // Fetch from Returned collection
          const returnedResponse = await axios.post(
            `${serverBaseUrl}/api/assets/getReturnedAssets`,
            payload
          );
          const returnedAssetsData = returnedResponse.data.map((asset) => ({
            _id: asset._id,
            assetType: asset.assetType,
            assetCategory: asset.assetCategory,
            itemName: asset.itemName,
            subCategory: asset.subCategory,
            itemDescription: asset.itemDescription,
            location: asset.location,
            itemId: assetType === "Permanent" ? asset.itemId : null,
            returnedQuantity: assetType === "Consumable" ? asset.returnQuantity : null,
            condition: asset.status === "service" ? "To Be Serviced" :
                       asset.status === "dispose" ? "To Be Disposed" :
                       asset.status === "exchange" ? "To Be Exchanged" : "Good",
            pdfUrl: asset.pdfUrl || null,
            signedPdfUrl: asset.signedPdfUrl || null,
            isUploaded: !!asset.signedPdfUrl,
            source: "returned",
            selectedIds: [],
            availableIds: [],
          }));
          console.log("hi")
          // Fetch all items from Store collection
          const storeResponse = await axios.post(
            `${serverBaseUrl}/api/assets/getStoreItemsForReturn`,
            { assetType, assetCategory }
          );
          const storeAssetsData = storeResponse.data.map((asset) => ({
            _id: asset._id,
            assetType: asset.assetType,
            assetCategory: asset.assetCategory,
            itemName: asset.itemName,
            subCategory: asset.subCategory,
            itemDescription: asset.itemDescription,
            location: "Store",
            itemId: null,
            returnedQuantity: assetType === "Consumable" ? asset.inStock : null,
            condition: assetType === "Permanent" ? "To Be Serviced" : "To Be Exchanged", // Default condition
            pdfUrl: null,
            signedPdfUrl: null,
            isUploaded: false,
            source: "store",
            selectedIds: [],
            availableIds: assetType === "Permanent" ? asset.itemIds : [],
          }));
  
          // Combine assets
          const combinedAssets = [...returnedAssetsData, ...storeAssetsData];
          setReturnedAssets(combinedAssets);
        } catch (error) {
          console.error("Failed to fetch assets:", error);
          setReturnedAssets([]);
        }
      };
      fetchReturnedAndStoreAssets();
    }
  }, [assetType, assetCategory, activeTab]);
  // Fetch disposable items
  useEffect(() => {
    if (activeTab === "disposable" && assetType && assetCategory && disposableData.itemName) {
      const fetchAvailableQuantity = async () => {
        try {
          const response = await axios.post(`http://${ip}:${port}/api/assets/getAvailableDisposableQuantity`, {
            assetType,
            assetCategory,
            itemName: disposableData.itemName,
            subCategory: disposableData.subCategory,
            itemDescription: disposableData.itemDescription,
          });
          setAvailableQuantity(response.data.availableQuantity || 0);
          setUnitPurchaseValue(response.data.purchaseValue || 0); // Store unit purchase value
          if (assetType === "Permanent") {
            setDisposableItems(response.data.itemIds || []);
          }
        } catch (error) {
          console.error("Failed to fetch available quantity:", error);
          setAvailableQuantity(0);
          setUnitPurchaseValue(0);
          setDisposableData((prev) => ({ ...prev, purchaseValue: 0 }));
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch available quantity or purchase value.",
          });
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
          const response = await axios.post(`http://${ip}:${port}/api/assets/getStoreItemDetails`, {
            itemId,
          });
          newPurchaseValues[itemId] = response.data.unitPrice || 0;
        })
      );
      setPurchaseValues((prev) => ({ ...prev, ...newPurchaseValues }));
  
      // Calculate total purchaseValue as the sum of fetched values
      const totalPurchaseValue = Object.values(newPurchaseValues).reduce((sum, val) => sum + val, 0);
      setDisposableData((prev) => ({ ...prev, purchaseValue: totalPurchaseValue }));
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch purchase values for selected items.",
      });
    }
  };

  // Fetch purchase values when itemIds change in disposable tab
  useEffect(() => {
    if (activeTab === "disposable" && assetType === "Permanent" && disposableData.itemIds.length > 0) {
      fetchPurchaseValues(disposableData.itemIds);
    } else {
      setPurchaseValues({});
      setDisposableData((prev) => ({ ...prev, purchaseValue: 0 }));
    }
  }, [assetType, disposableData.itemIds, activeTab]);

  useEffect(() => {
    if (activeTab === "buildingupgrade" && selectedSubCategory) {
      const fetchBuildingUpgrades = async () => {
        try {
          const response = await axios.post(`http://${ip}:${port}/api/assets/getBuildingUpgrades`, {
            subCategory: selectedSubCategory,
          });
          const buildings = response.data.buildings || [];
          // Flatten upgrades from all buildings with the selected subCategory
          const upgrades = buildings.reduce((acc, building) => [...acc, ...building.upgrades], []);
          setBuildingUpgrades(upgrades);
        } catch (error) {
          console.error("Failed to fetch building upgrades:", error);
          setBuildingUpgrades([]);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch building upgrades.",
          });
        }
      };
      fetchBuildingUpgrades();
    }
  }, [activeTab, selectedSubCategory]);
  const handleDocumentUpload = async (file, index) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`http://${ip}:${port}/api/assets/uploadFile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUpgradeForms(prev => prev.map((form, i) =>
        i === index ? { ...form, documentUrl: response.data.fileUrl } : form
      ));
    } catch (error) {
      console.error("Document upload failed:", error);
      alert("Document upload failed. Please try again.");
    }
  };
  const handleUpgradeFormChange = (index, field, value) => {
    setUpgradeForms(prev => prev.map((form, i) =>
      i === index
        ? {
            ...form,
            [field]: field === "year" || field === "estimate" || field === "approvedEstimate"
              ? parseFloat(value) || 0
              : value
          }
        : form
    ));
  };

  // Submit all upgrades
  const handleSubmitAllUpgrades = async () => {
    if (!selectedSubCategory) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select a sub category first!",
      });
      return;
    }
  
    const invalidForms = upgradeForms.filter(form =>
      !form.year ||
      !form.estimate ||
      !form.approvedEstimate ||
      !form.dateOfCompletion ||
      !form.defectliabiltyPeriod ||
      !form.executionAgency ||
      !form.dateOfHandover // Add validation for new field
    );
  
    if (invalidForms.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please fill all fields in all upgrade forms!",
      });
      return;
    }
  
    
    const subCategoryToSend = selectedSubCategory === "Others" ? buildingData.customSubCategory : selectedSubCategory;
  
    if (!subCategoryToSend) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please provide a valid sub category!",
      });
      return;
    }
  
    try {
      const response = await axios.post(`http://${ip}:${port}/api/assets/addBuildingUpgrades`, {
        subCategory: subCategoryToSend,
        upgrades: upgradeForms.map(form => ({
          year: form.year,
          estimate: form.estimate,
          approvedEstimate: form.approvedEstimate,
          dateOfCompletion: form.dateOfCompletion,
          defectliabiltyPeriod: form.defectliabiltyPeriod,
          executionAgency: form.executionAgency,
          dateOfHandover: form.dateOfHandover, // Add this
          documentUrl: form.documentUrl,     // Add this
        })),
      });
  
      if (isEditingRejected && rejectedId && rejectedAction === "buildingupgrade") {
        await axios.delete(`http://${ip}:${port}/api/assets/rejected-asset/${rejectedId}`);
      }
  
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "All upgrades added successfully!",
      });
      const getResponse = await axios.post(`http://${ip}:${port}/api/assets/getBuildingUpgrades`, {
        subCategory: subCategoryToSend,
      });
      const buildings = getResponse.data.buildings || [];
      const upgrades = buildings.reduce((acc, building) => [...acc, ...building.upgrades], []);
      setBuildingUpgrades(upgrades);
      resetAllFields();
      setIsEditingRejected(false);
      setRejectedAction("");
      window.history.replaceState(null, "", `/assetstore?username=${encodeURIComponent(username)}&tab=buildingupgrade`);
    } catch (error) {
      console.error("Failed to add upgrades:", error);
  
      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Building subcategory not found!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add upgrades.",
        });
      }
    }
  };

  // Handle disposable ID selection and reset purchaseValues


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
      amcPhoto: null,   
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
    if (field === "itemName" || field === "customItemName") {
      if (value.length > 100) {
        Swal.fire({
          icon: "warning",
          title: "Character Limit Exceeded",
          text: "Item Name cannot exceed 100 characters.",
        });
        return;
      }
    }
  
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        let updatedItem = { ...item };
  
        if (field === "subCategory" && assetType === "Permanent") {
          updatedItem = {
            ...updatedItem,
            [field]: value,
            itemName: "",
            customSubCategory: value === "Others" ? item.customSubCategory : "",
          };
        } else if (field === "amcFromDate" || field === "amcToDate") {
          updatedItem[field] = value;
        } else if (field === "amcCost") {
          updatedItem[field] = parseFloat(value) || 0;
        } else {
          updatedItem = { ...updatedItem, [field]: value };
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
      ...(field === "type" && value !== "Others" ? { customType: "" } : {}),
      ...(field === "status" && value !== "Others" ? { customStatus: "" } : {}), // Reset customStatus
    }));
  };

  const handleLandChange = (field, value) => {
    setLandData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "subCategory" && value !== "Others" ? { customSubCategory: "" } : {}),
      ...(field === "status" && value !== "Others" ? { customStatus: "" } : {}), // Reset customStatus
    }));
  };
// Utility function to format item names
const formatItemName = (name) => {
  if (!name || typeof name !== 'string') return ''; // Handle null/undefined/empty
  // Trim spaces, replace multiple spaces with single, normalize case
  const cleaned = name.trim().replace(/\s+/g, ' ');
  // Capitalize first letter, lowercase the rest
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

const handleSubmitStore = async () => {
  const validationErrors = validateStoreForm();
  if (validationErrors.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "Validation Errors",
      html: validationErrors.join("<br>"),
    });
    return;
  }

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
      approvedEstimate: buildingData.approvedEstimate,
      plinthArea: buildingData.plinthArea || undefined,
      status: buildingData.status === "Others" ? buildingData.customStatus : buildingData.status, // Use customStatus if Others
      dateOfConstruction: buildingData.dateOfConstruction || undefined,
      costOfConstruction: buildingData.costOfConstruction || undefined,
      remarks: buildingData.remarks || undefined,
      approvedBuildingPlanUrl: buildingData.approvedBuildingPlanUrl || undefined,
      kmzOrkmlFileUrl: buildingData.kmzOrkmlFileUrl || undefined,
    };
  } else if (assetCategory === "Land") {
    formData = {
      assetType,
      assetCategory,
      entryDate,
      subCategory: landData.subCategory === "Others" ? landData.customSubCategory : landData.subCategory,
      location: landData.location,
      status: landData.status === "Others" ? landData.customStatus : landData.status, // Use customStatus if Others
      dateOfPossession: landData.dateOfPossession || undefined,
      controllerOrCustody: landData.controllerOrCustody || undefined,
      details: landData.details || undefined,
    };
  } else {
    formData = {
      assetType,
      assetCategory,
      entryDate,
      purchaseDate,
      supplierName,
      supplierAddress: supplierAddress || undefined,
      source: source === "Other" && customSource ? customSource : source,
      modeOfPurchase: modeOfPurchase === "Others" && customModeOfPurchase ? customModeOfPurchase : modeOfPurchase,
      billNo: billNo || undefined,
      receivedBy,
      items: JSON.stringify(
        items.map((item, index) => ({
          itemName: formatItemName(item.itemName === "Others" && item.customItemName ? item.customItemName : item.itemName),
          subCategory: item.subCategory === "Others" && item.customSubCategory ? item.customSubCategory : item.subCategory,
          itemDescription: item.itemDescription,
          quantityReceived: item.quantityReceived,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          amcFromDate: item.amcFromDate || undefined,
          amcToDate: item.amcToDate || undefined,
          amcCost: item.amcCost || undefined,
          amcPhotoUrl: amcPhotoUrls[`amcPhoto${index}`] || undefined,
          warrantyNumber: item.warrantyNumber || undefined,
          warrantyValidUpto: item.warrantyValidUpto || undefined,
          warrantyPhotoUrl: warrantyPhotoUrls[`warrantyPhoto${index}`] || undefined,
          itemIds: item.itemIds,
          itemPhotoUrl: itemPhotoUrls[`itemPhoto${index}`] || undefined,
        }))
      ),
      billPhotoUrl: billPhotoUrl || undefined,
    };
  }

  try {
    const response = await axios.post(`http://${ip}:${port}/api/assets/storeTempAsset`, formData);
    if (isEditingRejected && rejectedId && rejectedAction === "store") {
      await axios.delete(`http://${ip}:${port}/api/assets/rejected-asset/${rejectedId}`);
    }
    Swal.fire({ icon: "success", title: "Success!", text: "Inventory saved successfully!" });
    resetAllFields();
    setIsEditingRejected(false);
    setRejectedAction("");
    window.history.replaceState(null, "", `/assetstore?username=${encodeURIComponent(username)}&tab=store`);
  } catch (error) {
    if (error.response && error.response.data) {
      const { message, duplicateIds } = error.response.data;
      if (duplicateIds) {
        Swal.fire({
          icon: "error",
          title: "Duplicate IDs Detected",
          html: `${message}<br>Duplicate IDs: ${duplicateIds.join(", ")}`,
        });
      } else if (message.includes("AMC From Date")) {
        Swal.fire({
          icon: "error",
          title: "Invalid AMC Dates",
          text: message,
        });
      } else if (message.includes("is not a valid")) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: message || "An unexpected error occurred.",
        });
      }
    } else {
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
  setAmcPhotoUrls({});
  setItems([]);
  setBuildingData({
    subCategory: "",
    customSubCategory: "",
    location: "",
    type: "",
    customType: "",
    buildingNo: "",
    approvedEstimate: "",
    plinthArea: "",
    status: "",
    customStatus: "", // Reset customStatus
    dateOfConstruction: "",
    costOfConstruction: 0,
    remarks: "",
    approvedBuildingPlanUrl: "",
    kmzOrkmlFileUrl: "",
  });
  setLandData({
    subCategory: "",
    customSubCategory: "",
    location: "",
    status: "",
    customStatus: "", // Reset customStatus
    dateOfPossession: "",
    controllerOrCustody: "",
    details: "",
  });
  setItemPhotoUrls({});
  setWarrantyPhotoUrls({});
};
  const handleFileUpload = async (file, fieldName, index) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`http://${ip}:${port}/api/assets/uploadFile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response);
      if (fieldName === "billPhoto") setBillPhotoUrl(response.data.fileUrl);
      else if (fieldName === "itemPhoto") setItemPhotoUrls((prev) => ({ ...prev, [`itemPhoto${index}`]: response.data.fileUrl }));
      else if (fieldName === "warrantyPhoto") setWarrantyPhotoUrls((prev) => ({ ...prev, [`warrantyPhoto${index}`]: response.data.fileUrl }));
      else if (fieldName === "amcPhoto") setAmcPhotoUrls((prev) => ({ ...prev, [`amcPhoto${index}`]: response.data.fileUrl }));
      else if (fieldName === "dateOfReference") setDisposableData((prev) => ({ ...prev, dateOfReferenceUrl: response.data.fileUrl }));
      else if (fieldName === "agencyReferenceNumber") setDisposableData((prev) => ({ ...prev, agencyReferenceNumberUrl: response.data.fileUrl }));
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
    if (file) handleFileUpload(file, "itemPhoto", index);
  };

  // Returned Assets Functions
  const handleConditionChange = (index, value) => {
    setReturnedAssets(prev => prev.map((item, i) => i === index ? { ...item, condition: value } : item));
  };

  const handleRemarkChange = (index, value) => {
    setRemarks(prev => ({ ...prev, [index]: value }));
  };

  const generateReceiptPDF = (asset, remark) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    const primaryColor = "#FF5733";
    const secondaryColor = "#FFC107";
    const textColor = "#333333";
  
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#FFFFFF");
    doc.text("Returned Asset Receipt", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 105, 25, { align: "center" });
  
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  
    doc.setFont("helvetica", "italic");
    doc.text("CASFOS Asset Management System", 10, 40);
    doc.setFont("helvetica", "normal");
  
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);
  
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Returned Asset Details", 10, 55);
  
    const details = [
      ["Asset Type", asset.assetType || "N/A"],
      ["Asset Category", asset.assetCategory || "N/A"],
      ["Item Name", asset.itemName || "N/A"],
      ["Sub Category", asset.subCategory || "N/A"],
      ["Item Description", asset.itemDescription || "N/A"],
      ["Returned From", asset.location || "N/A"],
      ["Condition", asset.condition || "N/A"],
      ["Remark", remark || "N/A"],
    ];
  
    if (asset.assetType === "Permanent") {
      const itemIds = asset.source === "store" ? asset.selectedIds : [asset.itemId];
      details.push(["Item ID(s)", itemIds.join(", ") || "N/A"]);
    } else {
      details.push(["Returned Quantity", asset.returnedQuantity || "N/A"]);
    }
  
    let yPos = 65;
    doc.setFontSize(11);
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 10, yPos);
      doc.setFont("helvetica", "normal");
      const splitValue = doc.splitTextToSize(value, 170);
      doc.text(splitValue, 50, yPos);
      yPos += splitValue.length * 5 + 2;
    });
  
    doc.setDrawColor(secondaryColor);
    doc.line(10, yPos + 5, 200, yPos + 5);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signature", 10, yPos + 20);
    doc.setFont("helvetica", "normal");
    doc.text("Name: _____________________________", 10, yPos + 30);
    doc.text("Date: _____________________________", 10, yPos + 40);
    doc.text("Signature: ________________________", 140, yPos + 30, { align: "right" });
  
    doc.setFillColor(secondaryColor);
    doc.rect(0, 280, 210, 10, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(10);
    doc.text("Thank you for using CASFOS Asset Management System", 105, 285, {
      align: "center",
    });
  
    return doc.output("blob");
  };
  
  const handleUploadSignedReceipt = async (index, file) => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetId", returnedAssets[index]._id);
    formData.append("assetType", returnedAssets[index].assetType);
    if (
      returnedAssets[index].source === "store" &&
      returnedAssets[index].assetType === "Permanent"
    ) {
      formData.append("itemIds", JSON.stringify(returnedAssets[index].selectedIds));
    }
  
    try {
      const response = await axios.post(
        `${serverBaseUrl}/api/assets/uploadSignedReturnedReceipt`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const signedPdfUrl = response.data.signedPdfUrl;
      setReturnedAssets((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, signedPdfUrl, isUploaded: true } : item
        )
      );
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Signed receipt uploaded!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to upload signed receipt!",
      });
      console.error(error);
    }
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
  
      const payload = {
        assetId: asset._id,
        pdfBase64: base64Data,
        assetType: asset.assetType,
        source: asset.source,
      };
  
      if (asset.source === "store") {
        payload.assetCategory = asset.assetCategory;
        payload.itemName = asset.itemName;
        payload.subCategory = asset.subCategory;
        payload.itemDescription = asset.itemDescription;
        if (asset.assetType === "Permanent") {
          payload.itemIds = asset.selectedIds;
        } else {
          payload.returnedQuantity = asset.returnedQuantity;
        }
      }
  
      const response = await axios.post(
        `${serverBaseUrl}/api/assets/storeReturnedReceipt`,
        payload
      );
  
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `receipt_${asset.source}_${asset.itemName || "asset"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
  
      setReturnedAssets((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                pdfUrl: response.data.pdfUrl,
                ...(asset.source === "store" && {
                  _id: response.data.storeReturnId, // Update _id to StoreReturn ID
                }),
              }
            : item
        )
      );
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to generate receipt!" });
      console.error("Error in handleDownloadReceipt:", error);
    }
  };
  
  const handleDoneReturnedAsset = async (index) => {
    const asset = returnedAssets[index];
    if (!asset.signedPdfUrl) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please upload signed receipt first!",
      });
      return;
    }
  
    if (
      !asset._id ||
      !asset.assetType ||
      (asset.assetType === "Consumable" && !asset.returnedQuantity) ||
      (asset.source === "store" &&
        asset.assetType === "Permanent" &&
        asset.selectedIds.length === 0)
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Missing required asset data or selected item IDs!",
      });
      return;
    }
  
    try {
      const status =
        asset.assetType === "Permanent"
          ? asset.condition === "To Be Serviced"
            ? "service"
            : asset.condition === "To Be Disposed"
              ? "dispose"
              : "Good"
          : asset.condition === "To Be Exchanged"
            ? "exchange"
            : asset.condition === "To Be Disposed"
              ? "dispose"
              : "Good";
  
      const response = await axios.post(`${serverBaseUrl}/api/assets/saveReturnedStatus`, {
        _id: asset._id,
        status,
        remark: remarks[index] || "",
        pdfUrl: asset.pdfUrl,
        signedPdfUrl: asset.signedPdfUrl,
        assetType: asset.assetType,
        ...(asset.assetType === "Consumable" && {
          returnedQuantity: asset.returnedQuantity,
        }),
        ...(asset.source === "store" &&
          asset.assetType === "Permanent" && { itemIds: asset.selectedIds }),
        source: asset.source,
        returnedFrom: asset.returnedFrom,
      });
  
      setReturnedAssets((prev) => prev.filter((_, i) => i !== index));
      setRemarks((prev) => {
        const newRemarks = { ...prev };
        delete newRemarks[index];
        return newRemarks;
      });
  
      Swal.fire({
        icon: "success",
        title: "Submitted!",
        text: "Asset condition submitted for approval!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to save asset condition!",
      });
      console.error(error);
    }
  };
  // Serviced/Maintenance Functions
  const handleMaintenanceChange = (field, value) => {
    setMaintenanceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitMaintenance = async () => {
    if (
      assetCategory === "Building" &&
      (!maintenanceData.subCategory || // Validate subcategory
        !maintenanceData.buildingNo ||
        !maintenanceData.yearOfMaintenance ||
        maintenanceData.cost <= 0 ||
        !maintenanceData.description ||
        !maintenanceData.custody ||
        !maintenanceData.agency)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please fill all fields!",
      });
      return;
    }
    if (isFutureDate(maintenanceData.yearOfMaintenance)) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Year of Maintenance cannot be in the future!",
      });
      return;
    }
  
    try {
      await axios.post(`http://${ip}:${port}/api/assets/saveMaintenanceTemp`, {
        assetType,
        assetCategory,
        subCategory: maintenanceData.subCategory, // Add subcategory
        buildingNo: maintenanceData.buildingNo,
        yearOfMaintenance: maintenanceData.yearOfMaintenance,
        cost: maintenanceData.cost,
        description: maintenanceData.description,
        custody: maintenanceData.custody,
        agency: maintenanceData.agency,
        enteredBy: username,
      });
  
      if (isEditingRejected && rejectedId && rejectedAction === "maintenance") {
        await axios.delete(`http://${ip}:${port}/api/assets/rejected-asset/${rejectedId}`);
      }
  
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Maintenance submitted for approval!",
      });
      resetAllFields();
      setIsEditingRejected(false);
      setRejectedAction("");
      window.history.replaceState(
        null,
        "",
        `/assetstore?username=${encodeURIComponent(username)}&tab=serviced`
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to submit maintenance for approval!",
      });
      console.error(error);
    }
  };

  // Disposable Assets Functions
// Disposable Assets Functions
const handleDisposableIdSelection = (itemId) => {
  setDisposableData((prev) => {
    let newItemIds;
    if (prev.itemIds.includes(itemId)) {
      newItemIds = prev.itemIds.filter((id) => id !== itemId); // Deselect ID
    } else if (prev.itemIds.length < availableQuantity) {
      newItemIds = [...prev.itemIds, itemId]; // Select ID if within limit
    } else {
      return prev; // Prevent adding more IDs than availableQuantity
    }

    const newQuantity = assetType === "Permanent" && assetCategory !== "Building" 
      ? newItemIds.length 
      : prev.quantity; // Update quantity for permanent assets

    return { 
      ...prev, 
      itemIds: newItemIds, 
      quantity: newQuantity,
      purchaseValue: 0 // Reset purchaseValue until new fetch
    };
  });
};const handleDisposableChange = (field, value) => {
  setDisposableData((prev) => {
    // For quantity changes
    if (field === "quantity") {
      const newQuantity = Math.min(
        parseInt(value) || 0,  // Convert to number, default to 0 if NaN
        availableQuantity     // Don't exceed available quantity
      );
      
      // For permanent assets (non-building), quantity is controlled by itemIds.length
      if (assetType === "Permanent" && assetCategory !== "Building") {
        return prev; // Ignore manual quantity changes
      }
      
      // For consumable assets or building category
      return {
        ...prev,
        [field]: newQuantity,
        purchaseValue: unitPurchaseValue * newQuantity, // Calculate total purchaseValue
      };
    }
    
    // For method of disposal changes
    if (field === "methodOfDisposal") {
      return {
        ...prev,
        [field]: value,
        ...(value !== "Other" ? { customMethodOfDisposal: "" } : {}),
      };
    }
    
    // For all other fields
    return {
      ...prev,
      [field]: value,
    };
  });
};
const validateDisposableSubmit = () => {
  if (assetType === "Permanent" && assetCategory !== "Building") {
    if (disposableData.itemIds.length !== disposableData.quantity) {
      alert(`Please select exactly ${disposableData.quantity} items for disposal`);
      return false;
    }
  }
  return true;
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
    if (isFutureDate(servicedData.serviceDate)) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Service Date cannot be in the future!" });
      return;
    }

    try {
      await axios.post(`http://${ip}:${port}/api/assets/saveServiced`, {
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
      if (isEditingRejected && rejectedId && rejectedAction === "service") {
        await axios.delete(`http://${ip}:${port}/api/assets/rejected-asset/${rejectedId}`);
      }
      Swal.fire({ icon: "success", title: "Success!", text: "Serviced asset saved!" });
      resetAllFields();
      setIsEditingRejected(false);
      setRejectedAction("");
      window.history.replaceState(null, "", `/assetstore?username=${encodeURIComponent(username)}&tab=serviced`);
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
    if (assetCategory === "Building") {
      if (
        !disposableData.subCategory ||
        !disposableData.condemnationYear ||
        !disposableData.certificateObtained ||
        !disposableData.authority ||
        !disposableData.date ||
        !disposableData.demolitionPeriod ||
        !disposableData.demolitionEstimate ||
        !disposableData.methodOfDisposal ||
        (disposableData.methodOfDisposal === "Other" && !disposableData.customMethodOfDisposal)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "Please fill all fields, including custom method of disposal if 'Other' is selected!",
        });
        return;
      }
      if (isFutureDate(disposableData.date)) {
        Swal.fire({ icon: "warning", title: "Warning", text: "Date cannot be in the future!" });
        return;
      }
  
      try {
        await axios.post(`http://${ip}:${port}/api/assets/requestForDisposal`, {
          assetType,
          assetCategory,
          subCategory: disposableData.subCategory,
          condemnationYear: disposableData.condemnationYear,
          certificateObtained: disposableData.certificateObtained,
          authority: disposableData.authority,
          dateOfReferenceUrl: disposableData.dateOfReferenceUrl,
          agency: disposableData.agency,
          agencyReferenceNumberUrl: disposableData.agencyReferenceNumberUrl,
          date: disposableData.date,
          demolitionPeriod: disposableData.demolitionPeriod,
          demolitionEstimate: disposableData.demolitionEstimate,
          methodOfDisposal:
            disposableData.methodOfDisposal === "Other"
              ? disposableData.customMethodOfDisposal
              : disposableData.methodOfDisposal,
        });
        Swal.fire({ icon: "success", title: "Success!", text: "Building condemnation request submitted!" });
        resetAllFields();
        window.history.replaceState(
          null,
          "",
          `/assetstore?username=${encodeURIComponent(username)}&tab=disposable`
        );
      } catch (error) {
        Swal.fire({ icon: "error", title: "Oops...", text: "Failed to submit building condemnation request!" });
        console.error(error);
      }
    } else {
      if (
        !disposableData.itemName ||
        !disposableData.itemDescription ||
        disposableData.quantity <= 0 ||
        disposableData.bookValue < 0 ||
        !disposableData.inspectionDate ||
        !disposableData.condemnationDate ||
        !disposableData.remark ||
        disposableData.disposalValue < 0 ||
        !disposableData.methodOfDisposal ||
        (disposableData.methodOfDisposal === "Other" && !disposableData.customMethodOfDisposal) ||
        (assetType === "Permanent" && disposableData.itemIds.length !== disposableData.quantity)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text:
            assetType === "Permanent" && disposableData.itemIds.length !== disposableData.quantity
              ? "The number of selected Item IDs must match the disposal quantity!"
              : "Please fill all fields and provide valid quantity/IDs!",
        });
        return;
      }
      if (isFutureDate(disposableData.inspectionDate)) {
        Swal.fire({ icon: "warning", title: "Warning", text: "Inspection Date cannot be in the future!" });
        return;
      }
      if (isFutureDate(disposableData.condemnationDate)) {
        Swal.fire({ icon: "warning", title: "Warning", text: "Condemnation Date cannot be in the future!" });
        return;
      }
  
      try {
        await axios.post(`http://${ip}:${port}/api/assets/requestForDisposal`, {
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
          methodOfDisposal:
            disposableData.methodOfDisposal === "Other"
              ? disposableData.customMethodOfDisposal
              : disposableData.methodOfDisposal,
        });
        Swal.fire({ icon: "success", title: "Success!", text: "Disposable asset saved!" });
        resetAllFields();
        window.history.replaceState(
          null,
          "",
          `/assetstore?username=${encodeURIComponent(username)}&tab=disposable`
        );
      } catch (error) {
        Swal.fire({ icon: "error", title: "Oops...", text: "Failed to save disposable asset!" });
        console.error(error);
      }
    }
  };

  const handleApprovedBuildingPlanChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.post(
          `http://${ip}:${port}/api/assets/uploadFile`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setBuildingData((prev) => ({
          ...prev,
          approvedBuildingPlanUrl: response.data.fileUrl,
        }));
      } catch (error) {
        console.error("File upload failed:", error);
        alert("File upload failed. Please try again.");
      }
    }
  };

  const handleKmzOrKmlFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.post(
          `http://${ip}:${port}/api/assets/uploadFile`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setBuildingData((prev) => ({
          ...prev,
          kmzOrkmlFileUrl: response.data.fileUrl,
        }));
      } catch (error) {
        console.error("File upload failed:", error);
        alert("File upload failed. Please try again.");
      }
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="style.css" />
        <title>CASFOS - Asset Store</title>
      </Helmet>

      <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">STOREKEEPER</span>
          </a>
          <ul className="side-menu top">
            <li><a href={`/storekeeperdashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li  className="active"><a href={`/assetstore?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">Asset Store</span></a></li>
            <li><a href={`/assetissue?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Asset Issue</span></a></li>
            <li><a href={`/assetreturn?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Return</span></a></li>
            <li><a href={`/storekeeperassetupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Asset Updation</span></a></li>
            <li><a href={`/viewasset?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Asset View</span></a></li>
          </ul>
          <ul className="side-menu">
            <li><a href="/login" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></a></li>
          </ul>
        </section>
      <section id="content">
        <nav>
          <i className="bx bx-menu" />
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
          <button style={activeTab === "buildingupgrade" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("buildingupgrade")}>Building Upgrade</button>
        </div>

        <main>
          <div style={styles.container}>
            <h2>Asset Management System</h2>
            {isEditingRejected && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeeba",
                  borderRadius: "5px",
                  marginBottom: "15px",
                  color: "#856404",
                }}
              >
                <strong>
                  Editing Rejected{" "}
                  {rejectedAction === "service" ? "Service" : rejectedAction === "disposal" ? "Disposal" : "Store"}{" "}
                  Entry
                </strong>
                : Update the details below and resubmit.
              </div>
            )}
            {activeTab === "store" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}><label>Asset Type:</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={styles.input}><option value="Permanent">Permanent</option><option value="Consumable">Consumable</option></select></div>
                  <div style={styles.inputGroup}><label>Asset Category:</label><select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} style={styles.input}><option value="">Select Category</option>{(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map((option) => (<option key={option} value={option}>{option}</option>))}</select></div>
                  <div style={styles.inputGroup}><label>Entry Date:</label><input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={styles.input} max={new Date().toISOString().split("T")[0]} /></div>
                </div>

                {assetCategory && assetCategory !== "Building" && assetCategory !== "Land" && (
                  <>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Purchase Date:</label><input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} style={styles.input} max={new Date().toISOString().split("T")[0]} /></div>
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
                        <select
                          value={buildingData.subCategory}
                          onChange={(e) => handleBuildingChange("subCategory", e.target.value)}
                          style={styles.input}
                        >
                          <option value="">Select Sub Category</option>
                          {subCategoryOptions["Building"]?.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                      {buildingData.subCategory === "Others" && (
                        <div style={styles.inputGroup}>
                          <label>Custom Sub Category:</label>
                          <input
                            type="text"
                            value={buildingData.customSubCategory}
                            onChange={(e) => handleBuildingChange("customSubCategory", e.target.value)}
                            style={styles.input}
                          />
                        </div>
                      )}
                      <div style={styles.inputGroup}>
                        <label>Location:</label>
                        <input
                          type="text"
                          value={buildingData.location}
                          onChange={(e) => handleBuildingChange("location", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label>Type:</label>
                        {buildingData.subCategory === "Residential Quarters" ? (
                          <select
                            value={buildingData.type}
                            onChange={(e) => handleBuildingChange("type", e.target.value)}
                            style={styles.input}
                          >
                            <option value="">Select Type</option>
                            {itemNameOptions["Residential Quarters"].map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={buildingData.type}
                            onChange={(e) => handleBuildingChange("type", e.target.value)}
                            style={styles.input}
                          />
                        )}
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Building No:</label>
                        <input
                          type="text"
                          value={buildingData.buildingNo}
                          onChange={(e) => handleBuildingChange("buildingNo", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      {buildingData.subCategory === "Residential Quarters" &&
                        buildingData.type === "Others" ? (
                        <div style={styles.inputGroup}>
                          <label>Custom Type:</label>
                          <input
                            type="text"
                            value={buildingData.customType}
                            onChange={(e) => handleBuildingChange("customType", e.target.value)}
                            style={styles.input}
                          />
                        </div>
                      ) : (
                        <div style={styles.inputGroup}>
                          <label>Approved Estimate:</label>
                          <input
                            type="number"
                            value={buildingData.approvedEstimate}
                            onChange={(e) => handleBuildingChange("approvedEstimate", e.target.value)}
                            style={styles.input}
                          />
                        </div>
                      )}
                    </div>
                    <div style={styles.formRow}>
                      {buildingData.subCategory === "Residential Quarters" &&
                        buildingData.type === "Others" && (
                          <div style={styles.inputGroup}>
                            <label>Approved Estimate:</label>
                            <input
                              type="number"
                              value={buildingData.approvedEstimate}
                              onChange={(e) => handleBuildingChange("approvedEstimate", e.target.value)}
                              style={styles.input}
                            />
                          </div>
                        )}
                      <div style={styles.inputGroup}>
                        <label>Plinth Area:</label>
                        <input
                          type="text"
                          value={buildingData.plinthArea}
                          onChange={(e) => handleBuildingChange("plinthArea", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
        <label>Status:</label>
        <select
          value={buildingData.status}
          onChange={(e) => handleBuildingChange("status", e.target.value)}
          style={styles.input}
        >
          <option value="">Select Status</option>
          <option value="Permanent">Permanent</option>
          <option value="Lease">Lease</option>
          <option value="Others">Others</option>
        </select>
      </div>
      {buildingData.status === "Others" && (
        <div style={styles.inputGroup}>
          <label>Custom Status:</label>
          <input
            type="text"
            value={buildingData.customStatus}
            onChange={(e) => handleBuildingChange("customStatus", e.target.value)}
            style={styles.input}
            placeholder="Enter custom status"
          />
        </div>
      )}
                      <div style={styles.inputGroup}>
                        <label>Date of Construction:</label>
                        <input
                          type="date"
                          value={buildingData.dateOfConstruction}
                          onChange={(e) => handleBuildingChange("dateOfConstruction", e.target.value)}
                          style={styles.input}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label>Cost of Construction:</label>
                        <input
                          type="number"
                          value={buildingData.costOfConstruction}
                          onChange={(e) =>
                            handleBuildingChange("costOfConstruction", parseFloat(e.target.value) || 0)
                          }
                          onFocus={(e) => e.target.select()}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label>Remarks:</label>
                        <input
                          type="text"
                          value={buildingData.remarks}
                          onChange={(e) => handleBuildingChange("remarks", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label>Approved Building Plan:</label>
                        <input type="file" onChange={handleApprovedBuildingPlanChange} />
                        {buildingData.approvedBuildingPlanUrl && (
                          <a
                            href={buildingData.approvedBuildingPlanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Plan
                          </a>
                        )}
                      </div>
                      <div style={styles.inputGroup}>
                        <label>KMZ/KML File:</label>
                        <input type="file" onChange={handleKmzOrKmlFileChange} />
                        {buildingData.kmzOrkmlFileUrl && (
                          <a
                            href={buildingData.kmzOrkmlFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View File
                          </a>
                        )}
                      </div>
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
                    <div style={styles.inputGroup}>
        <label>Status:</label>
        <select
          value={landData.status}
          onChange={(e) => handleLandChange("status", e.target.value)}
          style={styles.input}
        >
          <option value="">Select Status</option>
          <option value="Permanent">Permanent</option>
          <option value="Lease">Lease</option>
          <option value="Others">Others</option>
        </select>
      </div>
      {landData.status === "Others" && (
        <div style={styles.inputGroup}>
          <label>Custom Status:</label>
          <input
            type="text"
            value={landData.customStatus}
            onChange={(e) => handleLandChange("customStatus", e.target.value)}
            style={styles.input}
            placeholder="Enter custom status"
          />
        </div>
      )}               <div style={styles.inputGroup}><label>Date of Possession:</label><input type="date" value={landData.dateOfPossession} onChange={(e) => handleLandChange("dateOfPossession", e.target.value)} style={styles.input} max={new Date().toISOString().split("T")[0]} /></div>
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
                              onFocus={(e) => e.target.select()}
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
                              onFocus={(e) => e.target.select()}
                              style={styles.input}
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label>Total Price:</label>
                            <input
                              type="number"
                              value={item.totalPrice}
                              onChange={(e) => handleItemChange(index, "totalPrice", e.target.value)}
                              onFocus={(e) => e.target.select()}
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
                            <input type="number" value={item.amcCost} onChange={(e) => handleItemChange(index, "amcCost", e.target.value)} onFocus={(e) => e.target.select()} style={styles.input} />
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
    {item.itemIds.map((id, idIndex) => {
      // Skip duplicate check for empty IDs
      const isEmpty = !id || id.trim() === "";
      const isDuplicate = !isEmpty && allItemIds.filter(itemId => itemId === id).length > 1;
      
      return (
        <div key={idIndex} style={styles.inputGroup}>
          <label>ID {idIndex + 1}:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => handleItemIdChange(index, idIndex, e.target.value)}
            style={{
              ...styles.input,
              borderColor: isDuplicate ? 'red' : '#ddd',
              backgroundColor: isDuplicate ? '#fff0f0' : 'white'
            }}
          />
          {isDuplicate && (
            <span style={{ color: 'red', fontSize: '12px' }}>Duplicate ID</span>
          )}
        </div>
      );
    })}
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
          {(assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions).map(
            (option) => (
              <option key={option} value={option}>
                {option}
              </option>
            )
          )}
        </select>
      </div>
    </div>
    <div style={styles.cardContainer}>
      {returnedAssets.map((asset, index) => (
        <div key={index} style={styles.card}>
          <div style={styles.cardHeader}>
            <h3>{asset.itemName || "Unnamed Item"}</h3>
            <span style={styles.assetTypeBadge}>
              {asset.source === "returned" ? "Returned" : "Store"} - {asset.assetType}
            </span>
          </div>
          <div style={styles.cardBody}>
            <p><strong>Category:</strong> {asset.assetCategory || "N/A"}</p>
            <p><strong>Sub Category:</strong> {asset.subCategory || "N/A"}</p>
            <p><strong>Description:</strong> {asset.itemDescription || "N/A"}</p>
            <p><strong>Returned From:</strong> {asset.location || "N/A"}</p>
            {asset.assetType === "Permanent" && asset.source === "returned" && (
              <p><strong>Item ID:</strong> {asset.itemId || "N/A"}</p>
            )}
            {asset.assetType === "Consumable" && (
              <p><strong>Returned Quantity:</strong> {asset.returnedQuantity || "N/A"}</p>
            )}
            {asset.assetType === "Permanent" && asset.source === "store" && (
              <div style={styles.inputGroup}>
                <label><strong>Select Item IDs:</strong></label>
                <div style={styles.checkboxContainer}>
                  {asset.availableIds.map((id) => (
                    <label key={id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={asset.selectedIds.includes(id)}
                        onChange={() => handleIdSelection(index, id)}
                      />
                      {id}
                    </label>
                  ))}
                </div>
              </div>
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
                    <option value="Good">Good</option>
                    <option value="To Be Serviced">To Be Serviced</option>
                    <option value="To Be Disposed">To Be Disposed</option>
                  </>
                ) : (
                  <>
                    <option value="Good">Good</option>
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
              <button
                onClick={() => handleDownloadReceipt(index)}
                style={styles.button}
                disabled={
                  asset.source === "store" &&
                  asset.assetType === "Permanent" &&
                  asset.selectedIds.length === 0
                }
              >
                Download Receipt
              </button>
              <div style={styles.uploadGroup}>
                <label style={styles.uploadLabel}><strong>Signed Receipt:</strong></label>
                <input
                  type="file"
                  onChange={(e) => handleUploadSignedReceipt(index, e.target.files[0])}
                  accept="application/pdf,image/jpeg,image/png"
                  style={styles.fileInput}
                />
                {asset.signedPdfUrl && (
                  <a
                    href={asset.signedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    View
                  </a>
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
                disabled={
                  !asset.signedPdfUrl ||
                  (asset.source === "store" &&
                    asset.assetType === "Permanent" &&
                    asset.selectedIds.length === 0)
                }
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
                      <div style={styles.inputGroup}>
            <label>Building Sub Category:</label>
            <select
              value={maintenanceData.subCategory}
              onChange={(e) => handleMaintenanceChange("subCategory", e.target.value)}
              style={styles.input}
            >
              <option value="">Select Sub Category</option>
              {subCategoryOptions["Building"].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
                      <div style={styles.inputGroup}><label>Year of Maintenance:</label><input type="date" value={maintenanceData.yearOfMaintenance} onChange={(e) => handleMaintenanceChange("yearOfMaintenance", e.target.value)} style={styles.input} max={new Date().toISOString().split("T")[0]} /></div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}><label>Description:</label><input type="text" value={maintenanceData.description} onChange={(e) => handleMaintenanceChange("description", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Custody:</label><input type="text" value={maintenanceData.custody} onChange={(e) => handleMaintenanceChange("custody", e.target.value)} style={styles.input} /></div>
                      <div style={styles.inputGroup}><label>Agency:</label><input type="text" value={maintenanceData.agency} onChange={(e) => handleMaintenanceChange("agency", e.target.value)} style={styles.input} /></div>
                    </div>
                    <div style={styles.formRow}>

                    <div style={styles.inputGroup}><label>Cost:</label><input type="number" value={maintenanceData.cost} onChange={(e) => handleMaintenanceChange("cost", parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} style={styles.input} /></div>
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
                      <div style={styles.inputGroup}><label>Service Date:</label><input type="date" value={servicedData.serviceDate} onChange={(e) => handleServicedChange("serviceDate", e.target.value)} style={styles.input} max={new Date().toISOString().split("T")[0]} /></div>
                      <div style={styles.inputGroup}><label>Service Amount:</label><input type="number" value={servicedData.serviceAmount} onChange={(e) => handleServicedChange("serviceAmount", parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} style={styles.input} /></div>
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
  activeTab === "disposable" && (
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
              ? permanentAssetOptions
              : consumableAssetOptions
            ).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {assetCategory === "Building" ? (
        <>
          {/* Building-specific fields */}
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label>Sub Category:</label>
              <select
                value={disposableData.subCategory}
                onChange={(e) => handleDisposableChange("subCategory", e.target.value)}
                style={styles.input}
              >
                <option value="">Select Sub Category</option>
                {subCategoryOptions["Building"].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label>Condemnation Year:</label>
              <input
                type="number"
                value={disposableData.condemnationYear || ""}
                onChange={(e) => handleDisposableChange("condemnationYear", parseInt(e.target.value) || "")}
                style={styles.input}
                onFocus={(e) => e.target.select()}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Certificate Obtained:</label>
              <select
                value={disposableData.certificateObtained || ""}
                onChange={(e) => handleDisposableChange("certificateObtained", e.target.value)}
                style={styles.input}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label>Authority:</label>
              <input
                type="text"
                value={disposableData.authority || ""}
                onChange={(e) => handleDisposableChange("authority", e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Date of Reference (File Upload):</label>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0], "dateOfReference")}
                style={styles.input}
              />
              {disposableData.dateOfReferenceUrl && (
                <a href={disposableData.dateOfReferenceUrl} target="_blank" rel="noopener noreferrer">
                  View File
                </a>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label>Agency:</label>
              <input
                type="text"
                value={disposableData.agency || ""}
                onChange={(e) => handleDisposableChange("agency", e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label>Agency Reference Number (File Upload):</label>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0], "agencyReferenceNumber")}
                style={styles.input}
              />
              {disposableData.agencyReferenceNumberUrl && (
                <a href={disposableData.agencyReferenceNumberUrl} target="_blank" rel="noopener noreferrer">
                  View File
                </a>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label>Date:</label>
              <input
                type="date"
                value={disposableData.date || ""}
                onChange={(e) => handleDisposableChange("date", e.target.value)}
                style={styles.input}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Demolition Period:</label>
              <input
                type="text"
                value={disposableData.demolitionPeriod || ""}
                onChange={(e) => handleDisposableChange("demolitionPeriod", e.target.value)}
                style={styles.input}
                placeholder="e.g., 3 months"
              />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label>Demolition Estimate:</label>
              <input
                type="number"
                value={disposableData.demolitionEstimate || ""}
                onChange={(e) => handleDisposableChange("demolitionEstimate", parseFloat(e.target.value) || "")}
                style={styles.input}
                onFocus={(e) => e.target.select()}
                min="0"
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Method of Disposal:</label>
              <select
                value={
                  ["Sold", "Auctioned", "Destroyed", "Other"].includes(disposableData.methodOfDisposal)
                    ? disposableData.methodOfDisposal
                    : ""
                }
                onChange={(e) => handleDisposableChange("methodOfDisposal", e.target.value)}
                style={styles.input}
              >
                <option value="" disabled>Select Method</option>
                <option value="Sold">Sold</option>
                <option value="Auctioned">Auctioned</option>
                <option value="Destroyed">Destroyed</option>
                <option value="Other">Other</option>
              </select>
              {disposableData.methodOfDisposal === "Other" && (
                <input
                  type="text"
                  value={disposableData.customMethodOfDisposal || ""}
                  onChange={(e) => handleDisposableChange("customMethodOfDisposal", e.target.value)}
                  placeholder="Enter custom method"
                  style={{ ...styles.input, marginTop: "5px" }}
                />
              )}
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button onClick={handleSubmitDisposable} style={styles.button}>
              Submit
            </button>
          </div>
        </>
      ) : (
        /* Fields for non-Building categories */
        <>
          <div style={styles.formRow}>
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
                    itemIds: [], // Reset itemIds on item change
                    quantity: 0, // Reset quantity
                  }));
                  setPurchaseValues({}); // Reset purchase values
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
            <div style={styles.inputGroup}>
              <label>Method of Disposal:</label>
              <select
                value={
                  ["Sold", "Auctioned", "Destroyed", "Other"].includes(disposableData.methodOfDisposal)
                    ? disposableData.methodOfDisposal
                    : ""
                }
                onChange={(e) => handleDisposableChange("methodOfDisposal", e.target.value)}
                style={styles.input}
              >
                <option value="" disabled>Select Method</option>
                <option value="Sold">Sold</option>
                <option value="Auctioned">Auctioned</option>
                <option value="Destroyed">Destroyed</option>
                <option value="Other">Other</option>
              </select>
              {disposableData.methodOfDisposal === "Other" && (
                <input
                  type="text"
                  value={disposableData.customMethodOfDisposal || ""}
                  onChange={(e) => handleDisposableChange("customMethodOfDisposal", e.target.value)}
                  placeholder="Enter custom method"
                  style={{ ...styles.input, marginTop: "5px" }}
                />
              )}
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
    onChange={(e) => handleDisposableChange("quantity", e.target.value)}
    onFocus={(e) => e.target.select()}
    max={availableQuantity}
    min="1"
    style={styles.input}
    disabled={assetType === "Permanent" && assetCategory !== "Building"} // Disable only for Permanent non-Building
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
                onFocus={(e) => e.target.select()}
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
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Condemnation Date:</label>
              <input
                type="date"
                value={disposableData.condemnationDate}
                onChange={(e) => handleDisposableChange("condemnationDate", e.target.value)}
                style={styles.input}
                max={new Date().toISOString().split("T")[0]}
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
                onFocus={(e) => e.target.select()}
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
             <label>Select Disposable Item IDs (Available: {availableQuantity}, Selected: {disposableData.itemIds.length}):</label>
    <div style={styles.checkboxContainer}>
      {disposableItems.map((id) => (
        <label key={id} style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={disposableData.itemIds.includes(id)}
            onChange={() => handleDisposableIdSelection(id)}
            disabled={
              !disposableData.itemIds.includes(id) &&
              disposableData.itemIds.length >= availableQuantity
            }
          />
          {id} {purchaseValues[id] !== undefined ? `- ₹${purchaseValues[id]}` : "- Loading..."}
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
        </>
      )}
    </div>
  )
}
            {activeTab === "buildingupgrade" && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label>Building Sub Category:</label>
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Select Sub Category</option>
                      {subCategoryOptions["Building"].map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  {selectedSubCategory === "Others" && (
                    <div style={styles.inputGroup}>
                      <label>Custom Sub Category:</label>
                      <input
                        type="text"
                        value={buildingData.customSubCategory}
                        onChange={(e) => handleBuildingChange("customSubCategory", e.target.value)}
                        style={styles.input}
                        placeholder="Enter custom sub category"
                      />
                    </div>
                  )}
                </div>

                {/* Show Add Upgrade button only when a subcategory is selected */}
                {selectedSubCategory && (
                  <div style={styles.buttonContainer}>
                    <button onClick={() => addUpgradeForm()} style={styles.button}>
                      <FaPlus /> Add Upgrade
                    </button>
                  </div>
                )}

                {/* Multiple Upgrade Forms */}
                {upgradeForms.length > 0 && (
                  <div style={styles.formContainer}>
                    <h3>Enter Upgrade Details</h3>
                    {upgradeForms.map((form, index) => (
                      <div key={index} style={{ ...styles.formContainer, border: "1px solid #ddd", padding: "15px", marginBottom: "15px" }}>
                        <h4>Upgrade {index + 1}</h4>
                        <div style={styles.formRow}>
                          <div style={styles.inputGroup}>
                            <label>Year:</label>
                            <input
                              type="number"
                              value={form.year}
                              onChange={(e) => handleUpgradeFormChange(index, "year", e.target.value)}
                              onFocus={(e) => e.target.select()}
                              style={styles.input}
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label>Estimate:</label>
                            <input
                              type="number"
                              value={form.estimate}
                              onChange={(e) => handleUpgradeFormChange(index, "estimate", e.target.value)}
                              onFocus={(e) => e.target.select()}
                              style={styles.input}
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label>Approved Estimate:</label>
                            <input
                              type="number"
                              value={form.approvedEstimate}
                              onChange={(e) => handleUpgradeFormChange(index, "approvedEstimate", e.target.value)}
                              onFocus={(e) => e.target.select()}
                              style={styles.input}
                            />
                          </div>
                        </div>
                        <div style={styles.formRow}>
                          <div style={styles.inputGroup}>
                            <label>Date of Completion:</label>
                            <input type="date" value={form.dateOfCompletion} onChange={(e) => handleUpgradeFormChange(index, "dateOfCompletion", e.target.value)} style={styles.input}  />
                          </div>
                          <div style={styles.inputGroup}>
                            <label>Defect Liability Period:</label>
                            <input
                              type="text"
                              value={form.defectliabiltyPeriod}
                              onChange={(e) => handleUpgradeFormChange(index, "defectliabiltyPeriod", e.target.value)}
                              style={styles.input}
                              placeholder="e.g., 1 year"
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label>Execution Agency:</label>
                            <input
                              type="text"
                              value={form.executionAgency}
                              onChange={(e) => handleUpgradeFormChange(index, "executionAgency", e.target.value)}
                              style={styles.input}
                            />
                          </div>
                        </div>
                        <div style={styles.formRow}>
      <div style={styles.inputGroup}>
        <label>Date of Handover:</label>
        <input
          type="date"
          value={form.dateOfHandover}
          onChange={(e) => handleUpgradeFormChange(index, "dateOfHandover", e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Document:</label>
        <input
          type="file"
          onChange={(e) => handleDocumentUpload(e.target.files[0], index)}
          style={styles.input}
        />
        {form.documentUrl && (
          <a href={form.documentUrl} target="_blank" rel="noopener noreferrer">
            View Document
          </a>
        )}
      </div>
    </div>
                        <div style={styles.buttonContainer}>
                          <button
                            onClick={() => removeUpgradeForm(index)}
                            style={{ ...styles.button, backgroundColor: "#ff4444" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={styles.buttonContainer}>
                      <button onClick={handleSubmitAllUpgrades} style={styles.button}>Submit All Upgrades</button>
                    </div>
                  </div>
                )}

                {/* Display Existing Upgrades */}
                {selectedSubCategory && buildingUpgrades.length > 0 && (
  <div style={styles.tableContainer}>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.tableHeader}>Year</th>
          <th style={styles.tableHeader}>Estimate</th>
          <th style={styles.tableHeader}>Approved Estimate</th>
          <th style={styles.tableHeader}>Date of Completion</th>
          <th style={styles.tableHeader}>Defect Liability Period</th>
          <th style={styles.tableHeader}>Execution Agency</th>
          <th style={styles.tableHeader}>Date of Handover</th> {/* Add this */}
          <th style={styles.tableHeader}>Document</th> {/* Add this */}
        </tr>
      </thead>
      <tbody>
        {buildingUpgrades.map((upgrade, index) => (
          <tr key={index} style={styles.tableRow}>
            <td style={styles.tableCell}>{upgrade.year}</td>
            <td style={styles.tableCell}>{upgrade.estimate}</td>
            <td style={styles.tableCell}>{upgrade.approvedEstimate}</td>
            <td style={styles.tableCell}>{new Date(upgrade.dateOfCompletion).toLocaleDateString()}</td>
            <td style={styles.tableCell}>{upgrade.defectliabiltyPeriod}</td>
            <td style={styles.tableCell}>{upgrade.executionAgency}</td>
            <td style={styles.tableCell}>{upgrade.dateOfHandover ? new Date(upgrade.dateOfHandover).toLocaleDateString() : "N/A"}</td> {/* Add this */}
            <td style={styles.tableCell}>
              {upgrade.documentUrl ? (
                <a href={upgrade.documentUrl} target="_blank" rel="noopener noreferrer">View</a>
              ) : "N/A"}
            </td> {/* Add this */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

                {selectedSubCategory && buildingUpgrades.length === 0 && (
                  <p style={{ textAlign: "center", marginTop: "20px" }}>No upgrades found for this sub category.</p>
                )}
              </div>
            )}
          </div>
        </main>
      </section>
    </>
  );
};

const styles = {
  menuBar: {
    width: "100%",
    backgroundColor: "#f4f4f4",
    padding: "10px 0",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    position: "fixed",
    top: "60px",
    left: "150px",
    zIndex: 1000,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  container: {
    width: "100%",
    margin: "80px auto 20px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#ddd",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
  },
  activeTab: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    width: "100%",
  },
  itemContainer: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    marginBottom: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-start",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  usernameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userIcon: {
    fontSize: "30px",
    color: "#007BFF",
  },
  username: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  checkboxContainer: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "150px",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "5px",
  },
  checkboxLabel: {
    margin: "5px 0",
  },
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
  tableContainer: {
    marginTop: "20px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },
  tableHeader: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "10px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
  },
  tableRow: {
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: "10px",
    textAlign: "left",
  },
};

export default AssetStore;