/**
 * This file contains the main controller logic for asset-related operations in the application.
 * It handles all CRUD and workflow actions for assets, including:
 *   - Storing, approving, and rejecting temporary asset entries
 *   - Managing permanent and consumable assets, buildings, land, and store stock
 *   - Handling asset issues, returns, services, disposals, exchanges, and upgrades
 *   - Managing notifications and reporting/statistics endpoints
 *   - Uploading and linking PDF and image files for asset documentation
 *   - Filtering and aggregating asset data for analytics and dashboards
 * The controller interacts with multiple Mongoose models and is used by Express routes.
 */

// Import required Mongoose models for various asset-related collections
const RejectedAsset = require("../model/RejectedAsset");
const StoreReturn = require("../model/StoreReturn")
const StoreConsumable = require("../model/StoreConsumable");
const StorePermanent = require("../model/StorePermanent");
const DeadStockRegister = require("../model/DeadStockRegister"); 
const ReturnedPermanent = require("../model/ReturnedPermanent");
const ReturnedConsumable = require("../model/ReturnedConsumable");
const TempAsset = require("../model/TempAsset");
const Permanent = require("../model/PermanentAsset");
const Consumable = require("../model/ConsumableAsset");
const IssuedPermanent = require("../model/IssuedPermanent");
const IssuedConsumable = require("../model/IssuedConsumable");
const TempDispose = require("../model/TempDispose");
const ServicedAsset = require("../model/ServicedAsset");
const TempServiced = require("../model/TempServiced")
const DisposedAsset = require("../model/DisposedAsset");
const Building = require("../model/Building");
const ExchangedConsumable = require("../model/ExchangedConsumables");
const Land = require("../model/Land");
const BuildingMaintenance = require("../model/BuildingMaintenance");
const TempIssue = require("../model/TempIssue");
const AssetNotification = require("../model/AssetNotification");
const TempBuildingMaintenance = require("../model/TempBuildingMaintenance");
const PendingAssetUpdate = require("../model/PendingAssetUpdate");
const TempBuildingUpgrade = require("../model/TempBuildingUpgrade");

// Import Node.js file system and path modules for file operations
const fs = require("fs").promises;
const path = require("path");
require('dotenv').config();
// Import Mongoose for MongoDB interactions
const mongoose = require('mongoose');

// Get server configuration from environment variables
const port = process.env.PORT;
const ip = process.env.IP;
const serverBaseUrl = `http://${ip}:${port}`;
/**
 * Controller to store a temporary asset entry
 * Handles validation and storage for different asset categories (Building, Land, Permanent/Consumable)
 */
exports.storeTempAsset = async (req, res) => {
  try {
    // Destructure request body to get asset details
    const {
      assetType, assetCategory, entryDate, purchaseDate, supplierName,
      supplierAddress, source, modeOfPurchase, billNo, receivedBy, items,
      billPhotoUrl, subCategory, location, type, buildingNo, approvedEstimate, plinthArea,
      status, dateOfConstruction, costOfConstruction, remarks,
      dateOfPossession, controllerOrCustody, details, approvedBuildingPlanUrl,
      kmzOrkmlFileUrl
    } = req.body;

    // Normalize today's date to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set tomorrow's date for validation
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Required field validation
    if (!assetType) throw new Error("Asset Type is required");
    if (!assetCategory) throw new Error("Asset Category is required");
    if (!entryDate) throw new Error("Entry Date is required");
    if (new Date(entryDate) >= tomorrow) throw new Error("Entry Date cannot be tomorrow or in the future");

    // Initialize asset data object
    let assetData = {};

    // Handle Building-specific validation and data
    if (assetCategory === "Building") {
      if (!subCategory) throw new Error("Building Sub Category is required");
      if (!buildingNo) throw new Error("Building No is required");
      if (dateOfConstruction && new Date(dateOfConstruction) > today) throw new Error("Date of Construction cannot be in the future");

      // Build asset data for Building
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        type: type || undefined,
        buildingNo,
        approvedEstimate: approvedEstimate ? Number(approvedEstimate) : undefined,
        plinthArea: plinthArea,
        status,
        dateOfConstruction: dateOfConstruction || undefined,
        costOfConstruction: costOfConstruction ? Number(costOfConstruction) : undefined,
        remarks: remarks || undefined,
        approvedBuildingPlanUrl: approvedBuildingPlanUrl || undefined,
        kmzOrkmlFileUrl: kmzOrkmlFileUrl || undefined
      };
    }
    // Handle Land-specific validation and data
    else if (assetCategory === "Land") {
      if (!subCategory) throw new Error("Land Sub Category is required");
      if (dateOfPossession && new Date(dateOfPossession) > today) throw new Error("Date of Possession cannot be in the future");

      // Build asset data for Land
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        status,
        dateOfPossession: dateOfPossession || undefined,
        controllerOrCustody: controllerOrCustody || undefined,
        details: details || undefined,
      };
    }
    // Handle Permanent/Consumable asset categories
    else {
      if (!purchaseDate) throw new Error("Purchase Date is required");
      if (new Date(purchaseDate) >= today) throw new Error("Purchase Date cannot be in the future");

      // Parse items array
      const parsedItems = items ? JSON.parse(items) : [];
      if (parsedItems.length === 0) throw new Error("At least one item is required");

      // Validate each item
      for (const item of parsedItems) {
        if (!item.itemName) throw new Error("Item Name is required in one or more items");
        if (!item.itemDescription) throw new Error(`Item ${item.itemName}: Item Description is required`);

        const quantityReceived = Number(item.quantityReceived);
        const unitPrice = Number(item.unitPrice);

        if (!quantityReceived || quantityReceived <= 0) throw new Error(`Item ${item.itemName}: Quantity Received must be greater than 0`);
        if (!unitPrice || unitPrice <= 0) throw new Error(`Item ${item.itemName}: Unit Price must be greater than 0`);

        if (assetType === "Permanent" && item.itemIds && item.itemIds.length !== quantityReceived) throw new Error(`Item ${item.itemName}: Number of Item IDs must match Quantity Received`);
        if (assetType === "Permanent" && item.itemIds && item.itemIds.some(id => !id)) throw new Error(`Item ${item.itemName}: All Item IDs must be provided`);

        // Validate AMC dates
        if (item.amcFromDate && item.amcToDate) {
          const fromDate = new Date(item.amcFromDate);
          const toDate = new Date(item.amcToDate);
          if (fromDate > toDate) {
            throw new Error(`AMC From Date (${item.amcFromDate}) cannot be later than AMC To Date (${item.amcToDate}) for item: ${item.itemName}`);
          }
        }

        // Check for duplicate itemIds in TempAsset
        if (assetType === "Permanent" && item.itemIds && item.itemIds.length > 0) {
          const tempExistingItems = await TempAsset.find({
            assetCategory,
            "items.itemName": item.itemName,
            "items.itemIds": { $in: item.itemIds },
          });

          const duplicateIds = [];
          tempExistingItems.forEach((doc) => {
            doc.items.forEach((existingItem) => {
              if (existingItem.itemName === item.itemName) {
                const overlaps = existingItem.itemIds.filter((id) => item.itemIds.includes(id));
                duplicateIds.push(...overlaps);
              }
            });
          });

          if (duplicateIds.length > 0) {
            return res.status(400).json({
              success: false,
              message: `Duplicate item IDs found for item: ${item.itemName} in TempAsset`,
              duplicateIds: [...new Set(duplicateIds)],
            });
          }

          // Check for duplicate itemIds in Permanent
          const permExistingItems = await Permanent.find({
            assetCategory,
            "items.itemName": item.itemName,
            "items.itemIds": { $in: item.itemIds },
          });

          permExistingItems.forEach((doc) => {
            doc.items.forEach((existingItem) => {
              if (existingItem.itemName === item.itemName) {
                const overlaps = existingItem.itemIds.filter((id) => item.itemIds.includes(id));
                duplicateIds.push(...overlaps);
              }
            });
          });

          if (duplicateIds.length > 0) {
            return res.status(400).json({
              success: false,
              message: `Duplicate item IDs found for item: ${item.itemName} in Permanent`,
              duplicateIds: [...new Set(duplicateIds)],
            });
          }
        }
      }

      // Build asset data for Permanent/Consumable
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        purchaseDate,
        supplierName,
        supplierAddress: supplierAddress || undefined,
        source,
        modeOfPurchase,
        billNo: billNo || undefined,
        receivedBy,
        billPhotoUrl: billPhotoUrl || undefined,
        items: parsedItems,
      };
    }

    // Filter out undefined values
    const filteredAssetData = Object.fromEntries(
      Object.entries(assetData).filter(([_, value]) => value !== undefined)
    );

    // Create and save new TempAsset
    const newAsset = new TempAsset(filteredAssetData);
    const savedAsset = await newAsset.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: `${assetCategory || "Asset"} saved successfully`,
      data: savedAsset,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message).join(", ");
      res.status(400).json({
        success: false,
        message: messages,
      });
    } else {
      // Handle other errors
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Controller to fetch all temporary assets
 */
exports.getAllAssets = async (req, res) => {
  try {
    // Fetch all TempAsset documents
    const assets = await TempAsset.find();
    // Send success response with assets
    res.status(200).json(assets);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error fetching assets", error });
  }
};

/**
 * Controller to fetch all permanent assets
 */
exports.getAllPermanentAssets = async (req, res) => {
  try {
    // Fetch all Permanent documents
    const assets = await Permanent.find();
    // Send success response with assets
    res.status(200).json(assets);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error fetching permanent assets", error });
  }
};

/**
 * Controller to fetch a single permanent asset by ID
 */
exports.getPermanentAssetById = async (req, res) => {
  try {
    // Find Permanent asset by ID
    const asset = await Permanent.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Permanent asset not found" });
    }
    // Send success response with asset
    res.status(200).json(asset);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error fetching permanent asset", error });
  }
};

/**
 * Controller to update a permanent asset
 */
exports.updatePermanentAsset = async (req, res) => {
  try {
    const { id } = req.params;
    // Update Permanent asset and return updated document
    const updatedAsset = await Permanent.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedAsset) {
      return res.status(404).json({ message: "Permanent asset not found" });
    }
    // Send success response with updated asset
    res.status(200).json(updatedAsset);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error updating permanent asset", error });
  }
};

/**
 * Controller to fetch all consumable assets
 */
exports.getAllConsumableAssets = async (req, res) => {
  try {
    // Fetch all Consumable documents
    const assets = await Consumable.find();
    // Send success response with assets
    res.status(200).json(assets);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error fetching consumable assets", error });
  }
};

/**
 * Controller to fetch a single consumable asset by ID
 */
exports.getConsumableAssetById = async (req, res) => {
  try {
    // Find Consumable asset by ID
    const asset = await Consumable.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Consumable asset not found" });
    }
    // Send success response with asset
    res.status(200).json(asset);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error fetching consumable asset", error });
  }
};

/**
 * Controller to update a consumable asset
 */
exports.updateConsumableAsset = async (req, res) => {
  try {
    const { id } = req.params;
    // Update Consumable asset and return updated document
    const updatedAsset = await Consumable.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedAsset) {
      return res.status(404).json({ message: "Consumable asset not found" });
    }
    // Send success response with updated asset
    res.status(200).json(updatedAsset);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error updating consumable asset", error });
  }
};

/**
 * Controller to handle file uploads
 */
exports.uploadFile = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Generate file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Send success response with file URL
    res.status(200).json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    console.error(error);
    // Handle errors
    res.status(500).json({ message: "Failed to upload file" });
  }
};

/**
 * Controller to handle invoice uploads
 */
exports.uploadInvoice = async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Generate image URL
  const filePath = req.file.path;
  const imageUrl = `http://${ip}:${port}/${filePath}`;

  // Send response with image URL
  res.json({ imageUrl });
};

/**
 * Controller to upload signed returned receipt PDF
 */
exports.uploadSignedReturnedReceipt = async (req, res) => {
  console.log("Uploading signed receipt...");
  const { assetId, assetType, itemIds,source } = req.body;
  try {
    // Validate required fields
    if (!req.file || !assetId || !assetType) {
      return res.status(400).json({ success: false, message: "Signed PDF, asset ID, and asset type are required" });
    }

    // Generate signed PDF URL
    const serverBaseUrl = `http://${ip}:${port}`;
    const signedPdfUrl = `${serverBaseUrl}/uploads/${req.file.filename}`;
    if(source==="store")
    {
if (itemIds) {
      const parsedItemIds = JSON.parse(itemIds);
      
      const storeReturn = await StoreReturn.findOne({
        itemIds: { $all: parsedItemIds },
      });
      if (!storeReturn) {
        return res.status(404).json({ success: false, message: "Store return entry not found" });
      }

      // Update StoreReturn with signed PDF URL
      storeReturn.signedPdfUrl = signedPdfUrl;
      await storeReturn.save();

      // Send success response
      return res.status(200).json({ success: true, signedPdfUrl, storeReturnId: storeReturn._id });
    } else {
      console.log("eneterd");
      const storeReturn = await StoreReturn.findByIdAndUpdate(
        { _id: assetId },
        { signedPdfUrl },
        { new: true }
      );
      console.log("Store return updated:", storeReturn);
    }
          return res.status(200).json({ success: true, signedPdfUrl });

  }
    // Handle store-sourced returns
     else {
      console.log("Updating returned asset with signed receipt...");
      console.log(req.body);
      let asset;
      if(assetType=== "Permanent") {
      asset = await ReturnedPermanent.findByIdAndUpdate(
        assetId,
        { signedPdfUrl },
        { new: true }
      );
    }
    else{
      asset = await ReturnedConsumable.findByIdAndUpdate(
        assetId,
        { signedPdfUrl },
        { new: true }
      );
    }
      if (!asset) {
        return res.status(404).json({ success: false, message: "Asset not found" });
      }

      // Send success response
      return res.status(200).json({ success: true, signedPdfUrl });
    }
  } catch (error) {
    console.error("Error uploading signed receipt:", error);
    // Handle errors
    res.status(500).json({ success: false, message: "Failed to upload signed receipt" });
  }
};

/**
 * Controller to fetch store items
 */
exports.getStoreItems = async (req, res) => {
  try {
    const { assetType, assetCategory, subCategory } = req.body;
    // Select appropriate store model based on assetType
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    
    // Build query
    let query = { assetCategory };
    if (subCategory) {
      query.subCategory = subCategory;
    }
    
    // Fetch items
    const items = await StoreModel.find(query);
    // Send success response with items
    res.status(200).json({ items });
  } catch (error) {
    console.error("Failed to fetch store items:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch store items" });
  }
};

/**
 * Controller to check in-stock quantity for an item
 */
exports.checkInStock = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, itemDescription } = req.body;
    // Select appropriate store model
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    // Find store item
    const storeItem = await StoreModel.findOne({ itemName, itemDescription, assetCategory });
    // Send response with in-stock quantity
    res.status(200).json({ inStock: storeItem ? storeItem.inStock : 0 });
  } catch (error) {
    console.error(error);
    // Handle errors
    res.status(500).json({ message: "Failed to check in-stock quantity" });
  }
};

/**
 * Controller to fetch available item IDs in store
 */
exports.getAvailableIds = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;
    // Select appropriate store model
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    // Find store item
    const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    // Send response with item IDs (empty array for Consumable)
    res.status(200).json({ itemIds: (assetType === "Permanent" && storeItem) ? storeItem.itemIds : [] });
  } catch (error) {
    console.error("Failed to fetch available IDs:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch available IDs" });
  }
};

/**
 * Controller to fetch issued item IDs and quantities
 */
exports.getIssuedIds = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, location } = req.body;
    // Select appropriate issued model
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;
    // Find issued item
    const issuedItem = await IssuedModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    // Find issue for specific location
    const issue = issuedItem?.issues.find(issue => issue.issuedTo === location);
    // Send response with issued IDs and quantity
    res.status(200).json({
      issuedIds: (assetType === "Permanent" && issue) ? issue.issuedIds : [],
      quantity: issue ? issue.quantity : 0
    });
  } catch (error) {
    console.error("Failed to fetch issued IDs:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch issued IDs" });
  }
};

/**
 * Controller to fetch store item details (unit price) by itemId
 */
exports.getStoreItemDetails = async (req, res) => {
  try {
    const { itemId } = req.body;

    // Validate input
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    // Fetch purchase record containing itemId
    const purchaseRecord = await Permanent.findOne({ "items.itemIds": itemId })
      .sort({ purchaseDate: -1 }) // Get latest purchase
      .select("items");

    if (!purchaseRecord) {
      return res.status(404).json({ message: "No purchase record found for this itemId", unitPrice: 0 });
    }

    // Find specific item with itemId
    const item = purchaseRecord.items.find((i) => i.itemIds && i.itemIds.includes(itemId));

    if (!item) {
      return res.status(404).json({ message: "Item with this itemId not found in purchase record", unitPrice: 0 });
    }

    // Send response with unit price
    res.status(200).json({ unitPrice: item.unitPrice || 0 });
  } catch (error) {
    console.error("Failed to fetch store item details:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch store item details", error: error.message });
  }
};

/**
 * Controller to fetch store consum  consumable assets by year or month
 */
exports.getStoreConsumableAssets = async (req, res) => {
  try {
    const { year } = req.query;
    // Define consumable asset categories
    const consumableAssetCategories = [
      "Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items",
      "Sanitory Items", "Sports Goods", "Beds and Pillows", "Instruments"
    ];
    // Create category index mapping
    const categoryMapping = consumableAssetCategories.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});
    let result;
    const categoryCount = consumableAssetCategories.length;

    // Initialize result array based on year parameter
    if (year === "all") {
      result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 2024-2035
    } else {
      result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 12 months
    }

    // Fetch all StoreConsumable assets
    const assets = await StoreConsumable.find({});

    // Aggregate in-stock quantities by category and time period
    assets.forEach((asset) => {
      const category = asset.assetCategory;
      const createdDate = asset.createdAt ? new Date(asset.createdAt) : new Date();
      if (categoryMapping.hasOwnProperty(category)) {
        const categoryIndex = categoryMapping[category];
        const inStock = asset.inStock || 0;
        if (year === "all") {
          const yearIndex = createdDate.getFullYear() - 2024;
          if (yearIndex >= 0 && yearIndex < 12) {
            result[yearIndex][categoryIndex] += inStock;
          }
        } else if (createdDate.getFullYear() === parseInt(year)) {
          const monthIndex = createdDate.getMonth();
          result[monthIndex][categoryIndex] += inStock;
        }
      }
    });

    // Send response with aggregated data
    res.status(200).json({
      data: result,
      categories: consumableAssetCategories
    });
  } catch (error) {
    console.error("Error fetching store consumable assets:", error);
    // Handle errors
    res.status(500).json({ error: "Error fetching store consumable assets: " + error.message });
  }
};

/**
 * Controller to update quantities in DeadStockRegister
 */
exports.updateDeadStockQuantities = async (req, res) => {
  try {
    // Fetch all DeadStockRegister items
    const deadStockItems = await DeadStockRegister.find();

    for (const item of deadStockItems) {
      let servicableQuantity = 0;
      let overallQuantity = 0;

      if (item.assetType === "Permanent") {
        // Calculate overall quantity from Permanent assets
        const permanentAssets = await Permanent.find({
          "items.itemName": { $regex: new RegExp(`^${item.itemName}$`, "i") },
          "items.itemDescription": { $regex: new RegExp(`^${item.itemDescription}$`, "i") },
        });
        overallQuantity = permanentAssets.reduce((sum, asset) => {
          const matchingItems = asset.items.filter(
            (i) =>
              i.itemName.toLowerCase() === item.itemName.toLowerCase() &&
              i.itemDescription.toLowerCase() === item.itemDescription.toLowerCase()
          );
          return sum + matchingItems.reduce((subSum, i) => subSum + (i.quantityReceived || 0), 0);
        }, 0);

        // Calculate serviceable quantity from ReturnedPermanent
        const serviceablePermanent = await ReturnedPermanent.find({
          itemName: { $regex: new RegExp(`^${item.itemName}$`, "i") },
          itemDescription: { $regex: new RegExp(`^${item.itemDescription}$`, "i") },
          approved: "yes",
          status: "service",
        });
        servicableQuantity = serviceablePermanent.length;
      } else if (item.assetType === "Consumable") {
        // Calculate overall quantity from Consumable assets
        const consumableAssets = await Consumable.find({
          "items.itemName": { $regex: new RegExp(`^${item.itemName}$`, "i") },
          "items.itemDescription": { $regex: new RegExp(`^${item.itemDescription}$`, "i") },
        });

        overallQuantity = consumableAssets.reduce((sum, asset) => {
          const matchingItems = asset.items.filter(
            (i) =>
              i.itemName.toLowerCase() === item.itemName.toLowerCase() &&
              i.itemDescription.toLowerCase() === item.itemDescription.toLowerCase()
          );
          return sum + matchingItems.reduce((subSum, i) => subSum + (i.quantityReceived || 0), 0);
        }, 0);

        // Calculate serviceable quantity from ReturnedConsumable
        const serviceableConsumable = await ReturnedConsumable.find({
          itemName: { $regex: new RegExp(`^${item.itemName}$`, "i") },
          itemDescription: { $regex: new RegExp(`^${item.itemName}$`, "i") },
          approved: "yes",
          status: "service",
        });
        servicableQuantity = serviceableConsumable.reduce((sum, doc) => sum + (doc.returnQuantity || 0), 0);
      }

      // Update DeadStockRegister with calculated quantities
      await DeadStockRegister.updateOne(
        { _id: item._id },
        {
          $set: {
            servicableQuantity,
            overallQuantity,
          },
        }
      );
    }

    // Send success response
    res.status(200).json({ message: "Dead stock quantities updated successfully" });
  } catch (error) {
    console.error("Error updating dead stock quantities:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to update dead stock quantities", error: error.message });
  }
};

/**
 * Controller to issue assets from store
 */
exports.issue = async (req, res) => {
  try {
    // Destructure request body
    const {
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      issuedTo,
      location,
      quantity,
      issuedIds,
      acknowledged,
      pdfBase64,
    } = req.body;

    // Validate PDF data
    if (!pdfBase64) {
      return res.status(400).json({ message: "PDF data is required" });
    }

    // Select appropriate store model
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const parsedQuantity = parseInt(quantity, 10);
    let parsedIssuedIds = assetType === "Permanent" && issuedIds ? JSON.parse(issuedIds) : undefined;

    // Check stock availability
    const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    if (!storeItem || storeItem.inStock < parsedQuantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Validate issued IDs for Permanent assets
    if (assetType === "Permanent") {
      if (!parsedIssuedIds || !Array.isArray(parsedIssuedIds) || !parsedIssuedIds.every((id) => storeItem.itemIds.includes(id))) {
        return res.status(400).json({ message: "Some issued IDs are not in stock" });
      }
    }

    // Update store stock
    storeItem.inStock -= parsedQuantity;
    if (assetType === "Permanent") {
      storeItem.itemIds = storeItem.itemIds.filter((id) => !parsedIssuedIds.includes(id));
    }
    await storeItem.save();

    // Save PDF file
    const filename = `pdf-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    const pdfPath = path.join(__dirname, "../uploads", filename);
    await fs.writeFile(pdfPath, Buffer.from(pdfBase64, "base64"));
    const pdfUrl = `${serverBaseUrl}/uploads/${filename}`;

    // Create new TempIssue
    const tempIssue = new TempIssue({
      assetType,
      assetCategory,
      itemName,
      subCategory: subCategory || "",
      itemDescription,
      issuedTo,
      location,
      quantity: parsedQuantity,
      issuedIds: parsedIssuedIds,
      pdfUrl,
      acknowledged: acknowledged || "no",
    });

    await tempIssue.save();
    // Send success response
    res.status(201).json({ message: "Receipt stored successfully", pdfUrl });
  } catch (error) {
    console.error("Failed to store temp issue:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to store receipt" });
  }
};

/**
 * Controller to fetch all temporary issues
 */
exports.getTempIssues = async (req, res) => {
  try {
    // Fetch all TempIssue documents
    const tempIssues = await TempIssue.find();
    // Send success response
    res.status(200).json(tempIssues);
  } catch (error) {
    console.error("Failed to fetch temp issues:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch temp issues" });
  }
};

/**
 * Controller to fetch acknowledged temporary issues
 */
exports.getAcknowledgedTempIssues = async (req, res) => {
  try {
    // Fetch TempIssue documents with acknowledged: "yes" and rejected: "no"
    const tempIssues = await TempIssue.find({ acknowledged: "yes", rejected: "no" });
    // Send success response
    res.status(200).json(tempIssues);
  } catch (error) {
    console.error("Failed to fetch acknowledged temp issues:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch acknowledged temp issues" });
  }
};

/**
 * Controller to acknowledge a temporary issue
 */
exports.acknowledgeTempIssue = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: "A valid PDF, JPEG, or PNG file is required" });
    }

    const { tempIssueId } = req.body;
    // Generate signed PDF URL
    const signedPdfUrl = `${serverBaseUrl}/uploads/${req.file.filename}`;
    // Find TempIssue by ID
    const tempIssue = await TempIssue.findById(tempIssueId);

    if (!tempIssue) {
      return res.status(404).json({ message: "Temp issue not found" });
    }

    // Update TempIssue with signed PDF and acknowledged status
    tempIssue.signedPdfUrl = signedPdfUrl;
    tempIssue.acknowledged = "yes";
    await tempIssue.save();

    // Send success response
    res.status(200).json({ message: "Receipt acknowledged successfully", signedPdfUrl });
  } catch (error) {
    console.error("Failed to acknowledge temp issue:", error);
    if (error.message === "Only PDF, JPEG, and PNG files are allowed!") {
      return res.status(400).json({ message: error.message });
    }
    // Handle other errors
    res.status(500).json({ message: "Failed to acknowledge receipt" });
  }
};

/**
 * Controller to handle asset returns
 */
exports.return = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, location, returnQuantity, returnIds } = req.body;

    // Validate assetType
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ message: "Valid asset type (Permanent or Consumable) is required" });
    }

    // Select appropriate models
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    // Validate required fields
    if (!assetCategory || !itemName || !itemDescription || !location || !returnQuantity) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Find issued item
    const query = { assetCategory, itemName, itemDescription };
    if (assetType === "Permanent") {
      query.subCategory = subCategory;
    }
    const issuedItem = await IssuedModel.findOne(query);
    if (!issuedItem) {
      return res.status(400).json({ message: "Item not found in issued records" });
    }

    // Validate return quantity
    const issue = issuedItem.issues.find(issue => issue.issuedTo === location);
    if (!issue || issue.quantity < returnQuantity) {
      return res.status(400).json({ message: "Invalid return quantity" });
    }

    // Validate returnIds for Permanent assets
    if (assetType === "Permanent") {
      if (!returnIds || !Array.isArray(returnIds) || returnIds.length !== returnQuantity) {
        return res.status(400).json({ message: "returnIds must match returnQuantity for Permanent assets" });
      }
      if (!returnIds.every(id => issue.issuedIds.includes(id))) {
        return res.status(400).json({ message: "Invalid return IDs" });
      }
    }

    // Update issued item
    issue.quantity -= returnQuantity;
    if (assetType === "Permanent") {
      issue.issuedIds = issue.issuedIds.filter(id => !returnIds.includes(id));
    }
    if (issue.quantity === 0) {
      issuedItem.issues = issuedItem.issues.filter(i => i.issuedTo !== location);
    }
    if (issuedItem.issues.length === 0) {
      await IssuedModel.deleteOne({ _id: issuedItem._id });
    } else {
      await issuedItem.save();
    }

    // Create Returned entries
    if (assetType === "Permanent") {
      // Create separate ReturnedPermanent document for each returnId
      for (const returnId of returnIds) {
        const newReturned = new ReturnedModel({
          assetType,
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          location,
          itemId: returnId,
          approved: null,
        });
        await newReturned.save();
      }
    } else {
      // Create single ReturnedConsumable document
      const newReturned = new ReturnedModel({
        assetType,
        assetCategory,
        itemName,
        itemDescription,
        location,
        returnQuantity,
        approved: null,
      });
      await newReturned.save();
    }

    // Send success response
    res.status(201).json({ message: "Items returned successfully, pending approval" });
  } catch (error) {
    console.error("Failed to return items:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to return items" });
  }
};

/**
 * Controller to store returned receipt PDF
 */
exports.storeReturnedReceipt = async (req, res) => {
  const { assetId, pdfBase64, assetType, itemIds, assetCategory, itemName, subCategory, itemDescription, source, returnedQuantity } = req.body;

  try {
    // Validate required fields
    if (!assetId || !pdfBase64 || !assetType) {
      return res.status(400).json({ success: false, message: "Asset ID, PDF data, and asset type are required" });
    }

    // Save PDF file
    const filename = `returned-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    const pdfPath = path.join(__dirname, "../uploads", filename);
    await fs.mkdir(path.dirname(pdfPath), { recursive: true });
    await fs.writeFile(pdfPath, Buffer.from(pdfBase64, "base64"));

    // Generate PDF URL
    const serverBaseUrl = process.env.SERVER_BASE_URL || `http://${ip}:${port}`;
    const pdfUrl = `${serverBaseUrl}/uploads/${filename}`;

    if (source === "store") {
      let storeReturn;

      if (assetType === "Permanent" && itemIds) {
        // Check for existing StoreReturn
        console.log("Checking for existing StoreReturn with itemIds:", itemIds);
        storeReturn = await StoreReturn.findOne({
         assetType,
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
        });

        if (storeReturn) {
          // Update existing StoreReturn
          storeReturn.itemIds = itemIds; // <-- update itemIds to new array
          storeReturn.pdfUrl = pdfUrl;
          storeReturn.signedPdfUrl = null;
          await storeReturn.save();
        } else {
          // Create new StoreReturn
          storeReturn = new StoreReturn({
            assetType,
            assetCategory,
            itemName,
            subCategory,
            itemDescription,
            location: "Store",
            itemIds,
            pdfUrl,
            source: "store",
            originalStoreId: assetId,
          });
          await storeReturn.save();
        }
      } else if (assetType === "Consumable") {
        // Check for existing StoreReturn
        console.log(assetId)
        storeReturn = await StoreReturn.findOne({
          assetType,
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
        });

        if (storeReturn) {
          // Update existing StoreReturn
          storeReturn.pdfUrl = pdfUrl;
          storeReturn.signedPdfUrl = null;
          storeReturn.returnedQuantity = returnedQuantity;
          await storeReturn.save();
        } else {
          // Create new StoreReturn
          storeReturn = new StoreReturn({
            assetType,
            assetCategory,
            itemName,
            subCategory,
            itemDescription,
            location: "Store",
            returnedQuantity,
            pdfUrl,
            source: "store",
            originalStoreId: assetId,
          });
          await storeReturn.save();
        }
      } else {
        return res.status(400).json({ success: false, message: "Invalid data for store-sourced asset" });
      }

      // Send success response
      res.status(201).json({ success: true, pdfUrl, storeReturnId: storeReturn._id });
    } else {
      // Handle non-store sourced returns
      const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
      const asset = await ReturnedModel.findByIdAndUpdate(
        assetId,
        { pdfUrl },
        { new: true }
      );

      if (!asset) {
        return res.status(404).json({ success: false, message: "Asset not found" });
      }

      // Send success response
      res.status(201).json({ success: true, pdfUrl });
    }
  } catch (error) {
    console.error("Error storing receipt:", error);
    // Handle errors
    res.status(500).json({ success: false, message: "Failed to store receipt" });
  }
};

/**
 * Controller to save returned status
 */
exports.saveReturnedStatus = async (req, res) => {
  const {
    _id,
    status,
    remark,
    pdfUrl,
    signedPdfUrl,
    assetType,
    returnedQuantity,
    source,
    returnedFrom,
    itemIds,
  } = req.body;

  try {
    // Validate assetType
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ message: "Invalid asset type" });
    }

    // Select appropriate models
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

    if (source === "store") {
      // Handle store-sourced returns
      const storeReturn = await StoreReturn.findById(_id);
      if (!storeReturn) {
        console.error("Store return entry not found for ID:", _id);
        return res.status(404).json({ message: "Store return entry not found" });
      }

      // Find store item
      const storeItem = await StoreModel.findById(storeReturn.originalStoreId);
      if (!storeItem) {
        console.error("Store item not found for ID:", storeReturn.originalStoreId);
        return res.status(404).json({ message: "Store item not found" });
      }

      if (assetType === "Permanent" && itemIds) {
        // Validate itemIds
        const missingIds = itemIds.filter((id) => !storeItem.itemIds.includes(id));
        if (missingIds.length > 0) {
          return res.status(400).json({
            message: `Item IDs not found in store: ${missingIds.join(", ")}`,
          });
        }

        // Create ReturnedPermanent entries
        const newReturnedEntries = await Promise.all(
          itemIds.map(async (itemId) => {
            const newEntry = new ReturnedModel({
              assetType,
              assetCategory: storeReturn.assetCategory,
              itemName: storeReturn.itemName,
              subCategory: storeReturn.subCategory,
              itemDescription: storeReturn.itemDescription,
              location: returnedFrom || "Store",
              itemId,
              status,
              remark,
              pdfUrl: storeReturn.pdfUrl,
              signedPdfUrl: storeReturn.signedPdfUrl,
              approved: null,
              source: "store",
            });
            await newEntry.save();
            return newEntry;
          })
        );

        // Update store stock
        storeItem.itemIds = storeItem.itemIds.filter((id) => !itemIds.includes(id));
        storeItem.inStock -= itemIds.length;
        await storeItem.save();

        // Delete StoreReturn entry
        await StoreReturn.deleteOne({ _id });

        // Send success response
        res.status(200).json({
          message: "Returned status submitted for approval",
          assets: newReturnedEntries,
        });
      } else if (assetType === "Consumable") {
        // Validate quantity
        if (returnedQuantity > storeItem.inStock) {
          return res.status(400).json({ message: "Returned quantity exceeds available stock" });
        }

        // Create ReturnedConsumable entry
        const newReturned = new ReturnedModel({
          assetType,
          assetCategory: storeReturn.assetCategory,
          itemName: storeReturn.itemName,
          subCategory: storeReturn.subCategory,
          itemDescription: storeReturn.itemDescription,
          location: returnedFrom || "Store",
          status,
          remark,
          pdfUrl: storeReturn.pdfUrl,
          signedPdfUrl: storeReturn.signedPdfUrl,
          returnQuantity: returnedQuantity,
          approved: null,
          source: "store",
        });
        await newReturned.save();

        // Update store stock
        storeItem.inStock -= returnedQuantity;
        await storeItem.save();

        // Delete StoreReturn entry
        await StoreReturn.deleteOne({ _id });

        // Send success response
        res.status(200).json({
          message: "Returned status submitted for approval",
          asset: newReturned,
        });
      } else {
        return res.status(400).json({ message: "Invalid data for store-sourced asset" });
      }
    } else {
      // Handle non-store sourced returns
      const updatedAsset = await ReturnedModel.findByIdAndUpdate(
        _id,
        {
          status,
          remark,
          pdfUrl,
          signedPdfUrl,
          ...(assetType === "Consumable" && { returnQuantity: returnedQuantity }),
          approved: null,
        },
        { new: true, runValidators: true }
      );

      if (!updatedAsset) {
        return res.status(404).json({ message: "Returned asset not found" });
      }

      // Send success response
      res.status(200).json({
        message: "Returned status submitted for approval",
        asset: updatedAsset,
      });
    }
  } catch (error) {
    console.error("Failed to save returned status:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to save returned status", error: error.message });
  }
};

/**
 * Controller to save status for ReturnedPermanent assets
 */
exports.saveReturnedPermanentStatus = async (req, res) => {
  try {
    const { _id, status } = req.body;

    // Validate input
    if (!_id || !status) {
      return res.status(400).json({ message: "Missing _id or status in request" });
    }
    if (!["service", "dispose"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be 'service' or 'dispose'" });
    }

    // Update ReturnedPermanent status
    const updatedAsset = await ReturnedPermanent.updateOne(
      { _id },
      { $set: { status } }
    );

    // Check if document was found
    if (updatedAsset.matchedCount === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Send success response
    res.status(200).json({ message: `Asset status updated to ${status}` });
  } catch (error) {
    console.error("Failed to update asset status:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to update asset status" });
  }
};

/**
 * Controller to fetch returned assets by type, category, and status
 */
exports.getReturnedAssets = async (req, res) => {
  try {
    const { assetType, assetCategory, status } = req.body;
    // Validate assetType
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ message: "Invalid assetType. Must be 'Permanent' or 'Consumable'." });
    }

    // Select appropriate model
    const Model = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    // Build query
    const query = { assetType, status };
    if (assetCategory) {
      query.assetCategory = assetCategory;
    }

    // Fetch returned assets
    const returnedAssets = await Model.find(query);

    // Send success response
    res.status(200).json(returnedAssets);
  } catch (error) {
    console.error("Failed to fetch returned assets:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch returned assets" });
  }
};

/**
 * Controller to fetch store items available for return
 */
exports.getStoreItemsForReturn = async (req, res) => {
  try {
    const { assetType, assetCategory } = req.body;
    // Validate assetType
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({
        message: "Invalid assetType. Must be 'Permanent' or 'Consumable'.",
      });
    }

    // Select appropriate model
    const Model = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    // Build query
    const query = {};
    if (assetCategory) {
      query.assetCategory = assetCategory;
    }

    // Fetch store items
    const storeItems = await Model.find(query);

    // Send success response with formatted items
    res.status(200).json(
      storeItems.map((item) => ({
        _id: item._id,
        assetType,
        assetCategory: item.assetCategory,
        itemName: item.itemName,
        subCategory: item.subCategory,
        itemDescription: item.itemDescription,
        inStock: item.inStock,
        itemIds: item.itemIds || [],
        location: item.location || "Store",
      }))
    );
  } catch (error) {
    console.error("Failed to fetch store items:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch store items" });
  }
};

/**
 * Controller to fetch returned assets pending approval
 */
exports.getReturnedForApproval = async (req, res) => {
  const { assetType } = req.query;

  try {
    // Select appropriate model
    const Model = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    // Fetch assets pending approval
    const assets = await Model.find({
      approved: null,
      status: {
        $ne: "returned",
        $not: /^returned$/i
      },
      hooapproval: { $ne: "waiting" }
    });

    // Send success response
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching returned assets for approval:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch returned assets" });
  }
};

/**
 * Controller to fetch returned assets for condition change
 */
exports.getReturnedForConditionChange = async (req, res) => {
  const { assetType, approved } = req.query;

  try {
    // Validate assetType
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Invalid asset type. Must be 'Permanent' or 'Consumable'." });
    }

    // Select appropriate model
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    // Build query
    const query = approved ? { approved } : {};
    // Fetch assets
    const assets = await ReturnedModel.find(query);

    // Send success response
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching returned assets for condition change:", error);
    // Handle errors
    res.status(500).json({ success: false, message: "Failed to fetch returned assets", error: error.message });
  }
};

/**
 * Controller to update return condition for assets
 */
exports.updateReturnCondition = async (req, res) => {
  const { id } = req.params;
  const { condition, assetType } = req.body;

  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid asset ID" });
    }
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type (Permanent or Consumable) is required" });
    }

    // Define valid conditions based on assetType
    const validConditions = assetType === "Permanent"
      ? ["Good", "service", "dispose"]
      : ["Good", "exchange", "dispose"];

    if (!condition || !validConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: `Valid condition (${validConditions.join(", ")}) is required for ${assetType} assets`,
      });
    }

    try {
      // Select appropriate models
      const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
      const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

      // Find returned asset
      const returnedAsset = await ReturnedModel.findById(id);
      if (!returnedAsset) {
        return res.status(404).json({ success: false, message: `Returned ${assetType} asset not found` });
      }

      if (condition === "Good") {
        // Handle Permanent assets
        if (assetType === "Permanent") {
          // Find or create store item
          const storeItem = await StoreModel.findOne({
            itemName: returnedAsset.itemName,
            assetCategory: returnedAsset.assetCategory,
            subCategory: returnedAsset.subCategory
          });

          if (storeItem) {
            storeItem.itemIds.push(returnedAsset.itemId);
            storeItem.inStock += 1;
            await storeItem.save();
          } else {
            await StoreModel.create([{
              assetCategory: returnedAsset.assetCategory,
              itemName: returnedAsset.itemName,
              subCategory: returnedAsset.subCategory,
              itemDescription: returnedAsset.itemDescription || "No description",
              inStock: 1,
              itemIds: [returnedAsset.itemId]
            }]);
          }
        }
        // Handle Consumable assets
        else {
          const storeItem = await StoreModel.findOne({
            itemName: returnedAsset.itemName,
            assetCategory: returnedAsset.assetCategory,
            subCategory: returnedAsset.subCategory
          });

          if (storeItem) {
            storeItem.inStock += returnedAsset.returnQuantity || 1;
            await storeItem.save();
          } else {
            await StoreModel.create([{
              assetCategory: returnedAsset.assetCategory,
              itemName: returnedAsset.itemName,
              subCategory: returnedAsset.subCategory,
              itemDescription: returnedAsset.itemDescription || "No description",
              inStock: returnedAsset.returnQuantity || 1,
              itemIds: []
            }]);
          }
        }

        // Remove from returned collection
        await ReturnedModel.findByIdAndDelete(id);

        // Send success response
        return res.status(200).json({
          success: true,
          message: "Asset condition is Good. Asset has been moved back to stock.",
        });
      } else {
        // Update condition for other statuses
        returnedAsset.status = condition;
        await returnedAsset.save();

        // Send success response
        return res.status(200).json({
          success: true,
          message: "Condition updated successfully",
          updatedAsset: returnedAsset,
        });
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating return condition:", error);
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to update condition",
      error: error.message,
    });
  }
};

/**
 * Controller to update return condition with notification
 */
exports.updateReturnConditiontemp = async (req, res) => {
  const { id } = req.params;
  const { condition, assetType } = req.body;

  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid asset ID" });
    }
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type (Permanent or Consumable) is required" });
    }

    // Define valid conditions
    const validConditions = assetType === "Permanent"
      ? ["Good", "service", "dispose"]
      : ["Good", "exchange", "dispose"];

    if (!condition || !validConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: `Valid condition (${validConditions.join(", ")}) is required for ${assetType} assets`,
      });
    }

    try {
      // Select appropriate model
      const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

      // Find returned asset
      const returnedAsset = await ReturnedModel.findById(id);
      if (!returnedAsset) {
        return res.status(404).json({ success: false, message: `Returned ${assetType} asset not found` });
      }

      // Store old condition
      const oldCondition = returnedAsset.status;
      // Update condition
      returnedAsset.status = condition;
      await returnedAsset.save();

      // Create notification
      const temp = {
        ...returnedAsset.toObject(),
        oldCondition,
        condition
      };

      storeAssetNotification(temp, 'condition changed', new Date());

      // Send success response
      return res.status(200).json({
        success: true,
        message: "Condition updated successfully",
        updatedAsset: returnedAsset,
      });

    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating return condition:", error);
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to update condition",
      error: error.message,
    });
  }
};

/**
 * Controller to fetch issued locations for an item
 */
exports.getIssuedLocations = async (req, res) => {
  const { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;
  try {
    // Validate inputs
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type is required" });
    }
    if (!assetCategory || !itemName || !itemDescription) {
      return res.status(400).json({ success: false, message: "All required asset details are missing" });
    }

    // Select appropriate model
    const Model = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;
    // Build query
    const query = {
      assetType,
      assetCategory,
      itemName,
      itemDescription,
    };
    if (assetType === "Permanent" && subCategory) {
      query.subCategory = subCategory;
    }

    // Fetch issued records
    const issuedRecords = await Model.find(query);
    // Extract unique locations
    const locations = [...new Set(issuedRecords.flatMap(record => record.issues.map(issue => issue.issuedTo)))];

    // Send success response
    res.status(200).json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching issued locations:", error);
    // Handle errors
    res.status(500).json({ success: false, message: "Failed to fetch issued locations" });
  }
};

/**
 * Controller to save serviced asset request
 */
exports.saveServiced = async (req, res) => {
  try {
    // Destructure request body
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemIds, serviceNo, serviceDate, serviceAmount } = req.body;

    // Create new TempServiced entry
    const newTempService = new TempServiced({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemIds: assetType === "Permanent" ? itemIds : undefined,
      serviceNo,
      serviceDate,
      serviceAmount,
    });
    await newTempService.save();

    // Update ReturnedPermanent for Permanent assets
    if (assetType === "Permanent") {
      await ReturnedPermanent.updateMany(
        {
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          itemId: { $in: itemIds },
        },
        {
          $set: {
            servicedEntry: "yes",
            servicedRejection: null,
            servicedRejectionRemarks: null,
          },
        }
      );
    }

    // Send success response
    res.status(201).json({
      success: true,
      message: "Service request saved for approval",
      data: newTempService,
    });
  } catch (error) {
    console.error("Failed to save service request:", error);
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to save service request",
      error: error.message,
    });
  }
};

/**
 * Controller to save building maintenance record
 */
exports.saveMaintenance = async (req, res) => {
  try {
    // Destructure request body
    const { assetType, assetCategory, buildingNo, yearOfMaintenance, cost, description, custody, agency } = req.body;
    // Create new BuildingMaintenance entry
    const newMaintenance = new BuildingMaintenance({
      assetType,
      assetCategory,
      buildingNo,
      yearOfMaintenance,
      cost,
      description,
      custody,
      agency
    });
    await newMaintenance.save();
    // Send success response
    res.status(201).json({ message: "Building maintenance saved successfully" });
  } catch (error) {
    console.error("Failed to save maintenance:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to save maintenance" });
  }
};

/**
 * Controller to save temporary building maintenance request
 */
exports.saveMaintenanceTemp = async (req, res) => {
  try {
    // Destructure request body
    const {
      assetType,
      subCategory,
      assetCategory,
      buildingNo,
      yearOfMaintenance,
      cost,
      description,
      custody,
      agency,
      enteredBy,
    } = req.body;

    // Create new TempBuildingMaintenance entry
    const newTempMaintenance = new TempBuildingMaintenance({
      assetType,
      assetCategory,
      subCategory,
      buildingNo,
      yearOfMaintenance,
      cost,
      description,
      custody,
      agency,
      enteredBy,
    });

    await newTempMaintenance.save();
    // Send success response
    res.status(201).json({ message: "Building maintenance submitted for approval" });
  } catch (error) {
    console.error("Failed to save temporary maintenance:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to submit maintenance for approval" });
  }
};

/**
 * Controller to fetch pending building maintenance requests
 */
exports.getPendingMaintenance = async (req, res) => {
  try {
    // Fetch TempBuildingMaintenance with pending status
    const pendingMaintenance = await TempBuildingMaintenance.find({ status: "pending" });
    // Send success response
    res.status(200).json({ data: pendingMaintenance });
  } catch (error) {
    console.error("Failed to fetch pending maintenance:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch pending maintenance" });
  }
};

/**
 * Controller to fetch serviceable items
 */
exports.getServicableItems = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, itemDescription } = req.body;
    // Fetch ReturnedPermanent items with service status
    const servicableItems = await ReturnedPermanent.find({
      assetType,
      assetCategory,
      itemName,
      itemDescription,
      status: "service",
      approved: "yes",
      $or: [{ servicedEntry: "no" }, { servicedEntry: null }],
    });
    // Extract itemIds
    const itemIds = servicableItems.map(item => item.itemId);

    // Send success response
    res.status(200).json({ itemIds });
  } catch (error) {
    console.error("Failed to fetch servicable items:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch servicable items" });
  }
};

/**
 * Controller to fetch temporary serviced assets
 */
exports.getTempServiced = async (req, res) => {
  try {
    // Fetch all TempServiced documents
    const tempServicedAssets = await TempServiced.find();
    // Send success response
    res.status(200).json(tempServicedAssets);
  } catch (error) {
    console.error("Error fetching temp serviced assets:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch temp serviced assets" });
  }
};

/**
 * Controller to request asset disposal
 */
exports.requestDisposal = async (req, res) => {
  try {
    // Destructure request body
    const {
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemIds,
      quantity,
      purchaseValue,
      bookValue,
      inspectionDate,
      condemnationDate,
      remark,
      disposalValue,
      condemnationYear,
      certificateObtained,
      authority,
      dateOfReferenceUrl,
      agency,
      agencyReferenceNumberUrl,
      date,
      demolitionPeriod,
      demolitionEstimate,
      methodOfDisposal,
    } = req.body;

    // Validate methodOfDisposal
    if (!methodOfDisposal || !["Sold", "Auctioned", "Destroyed", "Other"].includes(methodOfDisposal)) {
      return res.status(400).json({ message: "Method of Disposal is required and must be one of: Sold, Auctioned, Destroyed, Other" });
    }

    if (assetCategory === "Building") {
      // Create TempDispose for Building
      const newDisposed = new TempDispose({
        assetType,
        assetCategory,
        subCategory,
        condemnationYear,
        certificateObtained,
        authority,
        dateOfReferenceUrl,
        agency,
        agencyReferenceNumberUrl,
        date,
        demolitionPeriod,
        demolitionEstimate,
        methodOfDisposal,
      });
      await newDisposed.save();

      // Send success response
      res.status(201).json({ message: "Building disposal request created successfully" });
    } else {
      let availableQuantity = 0;
      if (assetType === "Consumable") {
        // Check available quantity for Consumable
        const returnedItems = await ReturnedConsumable.find({
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          approved: "yes",
          disposedEntry: { $ne: "yes" },
        });
        availableQuantity = returnedItems.reduce((sum, item) => sum + (item.returnQuantity || 0), 0);

        if (quantity > availableQuantity) {
          return res.status(400).json({
            message: `Requested quantity (${quantity}) exceeds available approved quantity (${availableQuantity})`,
          });
        }
      } else if (assetType === "Permanent") {
        // Check available items for Permanent
        const approvedItems = await ReturnedPermanent.find({
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          itemId: { $in: itemIds },
          approved: "yes",
          disposedEntry: { $ne: "yes" },
        });

        if (approvedItems.length !== itemIds.length) {
          const unapprovedIds = itemIds.filter((id) => !approvedItems.some((item) => item.itemId === id));
          return res.status(400).json({
            message: `Some items are not approved for disposal or already marked for disposal`,
            unapprovedItemIds: unapprovedIds,
          });
        }
      }

      // Create TempDispose for non-Building assets
      const newDisposed = new TempDispose({
        assetType,
        assetCategory,
        itemName,
        subCategory,
        itemDescription,
        itemIds: assetType === "Permanent" ? itemIds : undefined,
        quantity,
        purchaseValue,
        bookValue,
        inspectionDate,
        condemnationDate,
        remark,
        disposalValue,
        methodOfDisposal,
      });
      await newDisposed.save();

      // Update Returned collections
      if (assetType === "Permanent") {
        await ReturnedPermanent.updateMany(
          {
            assetCategory,
            itemName,
            subCategory,
            itemDescription,
            itemId: { $in: itemIds },
            approved: "yes",
          },
          {
            $set: {
              disposedEntry: "yes",
              rejectedDisposal: null,
              disposalRemarks: null,
            },
          }
        );
      } else if (assetType === "Consumable") {
        await ReturnedConsumable.updateMany(
          {
            assetCategory,
            itemName,
            subCategory,
            itemDescription,
            approved: "yes",
            returnQuantity: { $gt: 0 },
          },
          {
            $set: {
              disposedEntry: "yes",
              rejectedDisposal: null,
              disposalRemarks: null,
            },
          }
        );
      }

      // Send success response
      res.status(201).json({ message: "Disposal request created successfully" });
    }
  } catch (error) {
    console.error("Failed to create disposal request:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to create disposal request", error: error.message });
  }
};

/**
 * Controller to fetch disposable items
 */
exports.getDisposableItems = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;

    // Fetch ReturnedPermanent items with dispose status
    const disposableItems = await ReturnedPermanent.find({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      status: "dispose",
      approved: "yes"
    });

    // Extract itemIds
    const itemIds = disposableItems.map(item => item.itemId);

    // Send success response
    res.status(200).json({ itemIds });
  } catch (error) {
    console.error("Failed to fetch disposable items:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch disposable items" });
  }
};

/**
 * Controller to fetch temporary dispose assets
 */
exports.getTempDisposeAssets = async (req, res) => {
  try {
    // Fetch all TempDispose documents
    const tempDisposeAssets = await TempDispose.find();
    // Send success response
    res.status(200).json(tempDisposeAssets);
  } catch (error) {
    console.error("Failed to fetch TempDispose assets:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch disposal assets" });
  }
};

/**
 * Controller to fetch available quantity for disposal
 */
exports.getAvailableDisposableQuantity = async (req, res) => {
  try {
    // Trim input fields
    let { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;
    assetType = assetType?.trim();
    assetCategory = assetCategory?.trim();
    itemName = itemName?.trim();
    subCategory = subCategory?.trim();
    itemDescription = itemDescription?.trim();

    if (assetType === "Consumable") {
      // Fetch available quantity from ReturnedConsumable
      const returnedQuery = {
        assetCategory: assetCategory || { $exists: true },
        itemName: itemName || { $exists: true },
        approved: "yes",
        status: "dispose",
        $or: [{ disposedEntry: "no" }, { disposedEntry: null }],
      };
      if (itemDescription) returnedQuery.itemDescription = itemDescription;

      const returnedItems = await ReturnedConsumable.find(returnedQuery);
      const availableQuantity = returnedItems.reduce((sum, item) => sum + (item.returnQuantity || 0), 0);

      // Fetch unit price from Consumable
      const consumablePipeline = [
        { $match: { assetCategory: assetCategory || { $exists: true } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.itemName": { $regex: `^${itemName}$`, $options: "i" },
            ...(subCategory && { "items.subCategory": { $regex: `^${subCategory}$`, $options: "i" } }),
            ...(itemDescription && { "items.itemDescription": { $regex: `^${itemDescription}$`, $options: "i" } }),
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
        {
          $project: {
            unitPrice: "$items.unitPrice",
          },
        },
      ];

      const consumableResult = await Consumable.aggregate(consumablePipeline);
      const purchaseValue = consumableResult[0]?.unitPrice || 0;

      // Send response for Consumable
      return res.status(200).json({
        availableQuantity,
        purchaseValue,
      });
    } else {
      // Fetch available items from ReturnedPermanent
      const returnedQuery = {
        assetCategory: assetCategory || { $exists: true },
        itemName: itemName || { $exists: true },
        approved: "yes",
        status: "dispose",
        $or: [{ disposedEntry: "no" }, { disposedEntry: null }],
      };
      if (subCategory) returnedQuery.subCategory = subCategory;
      if (itemDescription) returnedQuery.itemDescription = itemDescription;

      const availableItems = await ReturnedPermanent.find(returnedQuery);
      const availableQuantity = availableItems.length;
      const itemIds = availableItems.map((item) => item.itemId);

      // Fetch unit price from Permanent
      const permanentPipeline = [
        { $match: { assetCategory: assetCategory || { $exists: true } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.itemName": { $regex: `^${itemName}$`, $options: "i" },
            ...(subCategory && { "items.subCategory": { $regex: `^${subCategory}$`, $options: "i" } }),
            ...(itemDescription && { "items.itemDescription": { $regex: `^${itemDescription}$`, $options: "i" } }),
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
        {
          $project: {
            unitPrice: "$items.unitPrice",
          },
        },
      ];

      const permanentResult = await Permanent.aggregate(permanentPipeline);
      const purchaseValue = permanentResult[0]?.unitPrice || 0;

      // Send response for Permanent
      return res.status(200).json({
        availableQuantity,
        itemIds,
        purchaseValue,
      });
    }
  } catch (error) {
    console.error("Failed to fetch available quantity:", error);
    // Handle errors
    res.status(500).json({ message: "Failed to fetch available quantity" });
  }
};

































































/**
 * Controller to dispose of an asset from TempDispose
 * Moves asset to DisposedAsset, updates DeadStockRegister for non-Building assets, and removes from Returned collections
 * @param {Object} req - Express request object with asset ID in params
 * @param {Object} res - Express response object
 */
exports.disposeAsset = async (req, res) => {
  try {
    const { id } = req.params;
    // Find temporary dispose asset by ID
    const asset = await TempDispose.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found in TempDispose" });
    }

    // Prepare data for DisposedAsset (common for all asset types)
    const disposedAssetData = {
      assetType: asset.assetType,
      assetCategory: asset.assetCategory,
      subCategory: asset.subCategory,
      condemnationYear: asset.condemnationYear,
      certificateObtained: asset.certificateObtained,
      authority: asset.authority,
      dateOfReferenceUrl: asset.dateOfReferenceUrl,
      agency: asset.agency,
      agencyReferenceNumberUrl: asset.agencyReferenceNumberUrl,
      date: asset.date,
      demolitionPeriod: asset.demolitionPeriod,
      demolitionEstimate: asset.demolitionEstimate,
      methodOfDisposal: asset.methodOfDisposal,
      // Non-Building specific fields
      itemName: asset.itemName,
      itemDescription: asset.itemDescription,
      quantity: asset.quantity,
      itemIds: asset.itemIds,
      purchaseValue: asset.purchaseValue,
      bookValue: asset.bookValue,
      inspectionDate: asset.inspectionDate,
      condemnationDate: asset.condemnationDate,
      remark: asset.remark,
      disposalValue: asset.disposalValue,
    };

    // Save to DisposedAsset collection
    const disposedAsset = new DisposedAsset(disposedAssetData);
    await disposedAsset.save();

    if (asset.assetCategory === "Building") {
      // No additional handling needed for Building assets
    } else {
      // Handle non-Building disposal (Permanent/Consumable)
      const { assetType, assetCategory, subCategory, itemName, itemDescription, quantity, itemIds, remark, methodOfDisposal } = asset;

      // Check for existing DeadStockRegister entry
      let deadStockEntry = await DeadStockRegister.findOne({
        assetType,
        assetCategory,
        assetSubCategory: subCategory,
        itemName,
        itemDescription,
      });

      if (deadStockEntry) {
        // Update existing DeadStockRegister entry
        deadStockEntry.condemnedQuantity += assetType === "Permanent" ? itemIds.length : quantity;
        deadStockEntry.methodOfDisposal = methodOfDisposal;
        if (remark) deadStockEntry.remarks = remark;
        await deadStockEntry.save();
      } else {
        // Calculate overall quantity for new DeadStockRegister entry
        let overallQuantity = 0;
        if (assetType === "Permanent") {
          const permanentAssets = await Permanent.find({
            assetCategory,
            "items.itemName": itemName,
            "items.description": itemDescription,
          });
          overallQuantity = permanentAssets.reduce((total, asset) => {
            const matchingItems = asset.items.filter(
              (item) => item.itemName === itemName && item.subCategory === subCategory
            );
            return total + matchingItems.reduce((sum, item) => sum + (item.quantityReceived || 0), 0);
          }, 0);
        } else {
          const consumableAssets = await Consumable.find({
            assetCategory,
            "items.itemName": itemName,
            "items.description": itemDescription,
          });
          overallQuantity = consumableAssets.reduce((total, asset) => {
            const matchingItems = asset.items.filter(
              (item) => item.itemName === itemName && item.subCategory === subCategory
            );
            return total + matchingItems.reduce((sum, item) => sum + (item.quantityReceived || 0), 0);
          }, 0);
        }

        // Calculate serviceable quantity
        let servicableQuantity = 0;
        if (assetType === "Permanent") {
          const returnedAssets = await ReturnedPermanent.find({
            assetCategory,
            itemName,
            itemDescription,
            status: "service",
            approved: "yes",
          });
          servicableQuantity = returnedAssets.length;
        } else {
          const returnedAssets = await ReturnedConsumable.find({
            assetCategory,
            itemName,
            itemDescription,
            status: "service",
            approved: "yes",
          });
          servicableQuantity = returnedAssets.reduce((total, asset) => total + (asset.returnQuantity || 0), 0);
        }

        // Create new DeadStockRegister entry
        deadStockEntry = new DeadStockRegister({
          assetType,
          assetCategory,
          assetSubCategory: subCategory,
          itemName,
          itemDescription,
          servicableQuantity,
          condemnedQuantity: assetType === "Permanent" ? itemIds.length : quantity,
          overallQuantity,
          methodOfDisposal,
          remarks: remark,
        });
        await deadStockEntry.save();
      }

      // Remove from Returned collections
      if (assetType === "Permanent") {
        await ReturnedPermanent.deleteMany({
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          itemId: { $in: itemIds },
          disposedEntry: "yes",
        });
      } else {
        await ReturnedConsumable.deleteMany({
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          returnQuantity: { $lte: 0 },
          disposedEntry: "yes",
        });
      }
    }

    // Delete from TempDispose
    await TempDispose.findByIdAndDelete(id);

    // Send notification
    await storeAssetNotification(asset, "asset disposal approved", new Date());

    // Send success response
    res.status(200).json({ success: true, message: "Asset disposed successfully" });
  } catch (error) {
    console.error("Failed to dispose asset:", error);
    res.status(500).json({ message: "Failed to dispose asset" });
  }
};

/**
 * Controller to cancel a disposal request
 * Moves asset back to Returned collections or RejectedAsset for Buildings
 * @param {Object} req - Express request object with asset ID in params and rejection remarks in body
 * @param {Object} res - Express response object
 */
exports.cancelDisposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionRemarks } = req.body;

    // Find temporary dispose asset
    const asset = await TempDispose.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found in TempDispose" });
    }

    // Validate rejection remarks
    if (!rejectionRemarks || rejectionRemarks.trim() === "") {
      return res.status(400).json({ message: "Rejection remarks are required" });
    }

    if (asset.assetCategory === "Building") {
      // Handle Building disposal cancellation
      const rejectedAsset = new RejectedAsset({
        assetType: asset.assetType,
        assetCategory: asset.assetCategory,
        subCategory: asset.subCategory,
        condemnationYear: asset.condemnationYear,
        certificateObtained: asset.certificateObtained,
        authority: asset.authority,
        dateOfReferenceUrl: asset.dateOfReferenceUrl,
        agency: asset.agency,
        agencyReferenceNumberUrl: asset.agencyReferenceNumberUrl,
        date: asset.date,
        demolitionPeriod: asset.demolitionPeriod,
        demolitionEstimate: asset.demolitionEstimate,
        methodOfDisposal: asset.methodOfDisposal,
        rejectionRemarks,
        approved: "no",
      });
      await rejectedAsset.save();

      // Delete from TempDispose
      await TempDispose.findByIdAndDelete(id);

      // Send notification
      const temp = {
        ...asset.toObject(),
        rejectedAssetId: rejectedAsset._id,
        rejectionRemarks,
      };
      await storeAssetNotification(temp, "building disposal cancelled", new Date());

      // Send success response
      return res.status(200).json({ success: true, message: "Building disposal cancelled successfully" });
    } else {
      // Handle non-Building (Permanent/Consumable) disposal cancellation
      if (asset.assetType === "Permanent") {
        // Update ReturnedPermanent entries
        await ReturnedPermanent.updateMany(
          {
            assetCategory: asset.assetCategory,
            itemName: asset.itemName,
            subCategory: asset.subCategory,
            itemDescription: asset.itemDescription,
            itemId: { $in: asset.itemIds },
            disposedEntry: "yes",
          },
          {
            $set: {
              disposedEntry: null,
              rejectedDisposal: "yes",
              disposalRemarks: rejectionRemarks,
            },
          }
        );
      } else {
        // Update ReturnedConsumable entries
        await ReturnedConsumable.updateMany(
          {
            assetCategory: asset.assetCategory,
            itemName: asset.itemName,
            subCategory: asset.subCategory,
            itemDescription: asset.itemDescription,
            disposedEntry: "yes",
          },
          {
            $set: {
              disposedEntry: null,
              rejectedDisposal: "yes",
              disposalRemarks: rejectionRemarks,
            },
            $inc: { returnQuantity: asset.quantity },
          }
        );
      }

      // Save to RejectedAsset
      const rejectedAsset = new RejectedAsset({
        assetType: asset.assetType,
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        subCategory: asset.subCategory,
        itemDescription: asset.itemDescription,
        itemIds: asset.itemIds,
        quantity: asset.quantity,
        purchaseValue: asset.purchaseValue,
        bookValue: asset.bookValue,
        inspectionDate: asset.inspectionDate,
        condemnationDate: asset.condemnationDate,
        remark: asset.remark,
        disposalValue: asset.disposalValue,
        methodOfDisposal: asset.methodOfDisposal,
        rejectionRemarks,
        approved: "no",
      });
      await rejectedAsset.save();

      // Delete from TempDispose
      await TempDispose.findByIdAndDelete(id);

      // Send notification
      const temp = {
        ...asset.toObject(),
        rejectedAssetId: rejectedAsset._id,
        rejectionRemarks,
      };
      await storeAssetNotification(temp, "asset disposal cancelled", new Date());

      // Send success response
      res.status(200).json({ success: true, message: "Disposal cancelled successfully" });
    }
  } catch (error) {
    console.error("Failed to cancel disposal:", error);
    res.status(500).json({ message: "Failed to cancel disposal" });
  }
};

/**
 * Controller to fetch building upgrades
 * Retrieves upgrades for buildings with a specific subCategory
 * @param {Object} req - Express request object with subCategory in body
 * @param {Object} res - Express response object
 */
exports.getBuildingUpgrades = async (req, res) => {
  try {
    const { subCategory } = req.body;
    // Fetch buildings with matching subCategory, selecting only upgrades
    const buildings = await Building.find({ subCategory }).select("upgrades");
    res.json({ buildings });
  } catch (error) {
    console.error("Error fetching building upgrades:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controller to add a temporary building upgrade
 * Submits upgrade for approval by storing in TempBuildingUpgrade
 * @param {Object} req - Express request object with subCategory and upgrades in body
 * @param {Object} res - Express response object
 */
exports.addBuildingUpgrade = async (req, res) => {
  try {
    const { subCategory, upgrades } = req.body;

    // Validate required fields
    if (!subCategory || !upgrades) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if building with subCategory exists
    const buildingExists = await Building.findOne({ subCategory });
    if (!buildingExists) {
      return res.status(404).json({ message: "Building subcategory not found" });
    }

    // Create new TempBuildingUpgrade entry
    const tempUpgrade = new TempBuildingUpgrade({ subCategory, upgrades });
    await tempUpgrade.save();

    // Send success response
    res.json({ message: "Upgrade submitted for approval", tempUpgrade });
  } catch (error) {
    console.error("Error adding temporary building upgrade:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controller to fetch all temporary building upgrades
 * Retrieves all pending upgrade requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTempBuildingUpgrades = async (req, res) => {
  try {
    // Fetch all TempBuildingUpgrade documents
    const upgrades = await TempBuildingUpgrade.find();
    res.status(200).json(upgrades);
  } catch (error) {
    console.error("Failed to fetch temporary building upgrades:", error);
    res.status(500).json({ message: "Failed to fetch temporary building upgrades" });
  }
};

/**
 * Controller to submit an asset update for approval
 * Stores proposed update in PendingAssetUpdate
 * @param {Object} req - Express request object with assetId, assetType, originalData, and updatedData in body
 * @param {Object} res - Express response object
 */
exports.submitForApproval = async (req, res) => {
  const { assetId, assetType, originalData, updatedData } = req.body;
  try {
    // Create new PendingAssetUpdate entry
    const pendingUpdate = new PendingAssetUpdate({
      assetId,
      assetType,
      originalData,
      updatedData,
    });
    await pendingUpdate.save();

    // Send success response
    res.status(200).json({ success: true, message: "Update submitted for approval" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to approve a temporary asset
 * Moves asset from TempAsset to appropriate collection (Building, Land, Permanent, Consumable) and updates store
 * @param {Object} req - Express request object with asset ID in params
 * @param {Object} res - Express response object
 */
exports.approveAsset = async (req, res) => {
  try {
    const { id } = req.params;
    // Find temporary asset by ID
    const tempAsset = await TempAsset.findById(id);
    if (!tempAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found in temporary storage",
      });
    }

    const { assetCategory, assetType } = tempAsset;
    let savedAssets = [];

    // Helper function to normalize strings
    const normalizeString = (str) => {
      return str.trim().replace(/\s+/g, " ").toLowerCase();
    };

    if (assetCategory === "Building") {
      // Handle Building asset approval
      const {
        entryDate,
        subCategory,
        location,
        status,
        type,
        buildingNo,
        plinthArea,
        approvedEstimate,
        dateOfConstruction,
        costOfConstruction,
        remarks,
        approvedBuildingPlanUrl,
        kmzOrkmlFileUrl,
      } = tempAsset;

      const newBuilding = new Building({
        assetType,
        assetCategory,
        entryDate,
        subCategory: subCategory?.trim(),
        location: location?.trim(),
        type: type?.trim(),
        buildingNo: buildingNo?.trim(),
        plinthArea,
        approvedEstimate,
        status: status?.trim(),
        dateOfConstruction,
        costOfConstruction,
        remarks: remarks?.trim(),
        approvedBuildingPlanUrl,
        kmzOrkmlFileUrl,
      });

      savedAssets.push(await newBuilding.save());
    } else if (assetCategory === "Land") {
      // Handle Land asset approval
      const { entryDate, subCategory, location, status, dateOfPossession, controllerOrCustody, details } = tempAsset;

      const newLand = new Land({
        assetType,
        assetCategory,
        entryDate,
        subCategory: subCategory?.trim(),
        location: location?.trim(),
        status: status?.trim(),
        dateOfPossession,
        controllerOrCustody: controllerOrCustody?.trim(),
        details: details?.trim(),
      });

      savedAssets.push(await newLand.save());
    } else {
      // Handle Permanent/Consumable asset approval
      const {
        entryDate,
        purchaseDate,
        supplierName,
        supplierAddress,
        source,
        modeOfPurchase,
        billNo,
        receivedBy,
        billPhotoUrl,
        items,
      } = tempAsset;

      const PurchaseModel = assetType === "Permanent" ? Permanent : Consumable;
      const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

      for (const item of items) {
        // Normalize item details
        const normalizedItemName = normalizeString(item.itemName);
        const normalizedDescription = normalizeString(item.itemDescription);

        // Create purchase record
        const newPurchase = new PurchaseModel({
          assetType,
          assetCategory,
          entryDate,
          purchaseDate,
          supplierName: supplierName?.trim(),
          supplierAddress: supplierAddress?.trim(),
          source: source?.trim(),
          modeOfPurchase: modeOfPurchase?.trim(),
          billNo: billNo?.trim(),
          receivedBy: receivedBy?.trim(),
          billPhotoUrl,
          items: [
            {
              itemName: item.itemName.trim(),
              subCategory: item.subCategory?.trim(),
              itemDescription: item.itemDescription.trim(),
              quantityReceived: item.quantityReceived,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              amcFromDate: item.amcFromDate,
              amcToDate: item.amcToDate,
              amcCost: item.amcCost,
              amcPhotoUrl: item.amcPhotoUrl,
              warrantyNumber: item.warrantyNumber?.trim(),
              warrantyValidUpto: item.warrantyValidUpto,
              warrantyPhotoUrl: item.warrantyPhotoUrl,
              itemPhotoUrl: item.itemPhotoUrl,
              itemIds: assetType === "Permanent" ? item.itemIds?.map((id) => id?.trim()) : undefined,
            },
          ],
        });

        const savedAsset = await newPurchase.save();
        savedAssets.push(savedAsset);

        // Find matching store item
        const [existingItem] = await StoreModel.aggregate([
          {
            $match: {
              assetCategory,
              $expr: {
                $and: [
                  {
                    $eq: [{ $trim: { input: { $toLower: "$itemName" } } }, normalizedItemName],
                  },
                  {
                    $eq: [
                      { $trim: { input: { $toLower: "$itemDescription" } } },
                      normalizedDescription,
                    ],
                  },
                ],
              },
            },
          },
        ]);

        if (existingItem) {
          // Update existing store item
          await StoreModel.updateOne(
            { _id: existingItem._id },
            {
              $inc: { inStock: item.quantityReceived },
              $set: {
                ...(assetType === "Permanent" &&
                  item.itemIds && {
                    itemIds: [
                      ...new Set([
                        ...(existingItem.itemIds || []),
                        ...item.itemIds.map((id) => id?.trim()),
                      ]),
                    ],
                  }),
              },
            }
          );
        } else {
          // Create new store item
          const newStoreItem = new StoreModel({
            assetCategory,
            itemName: item.itemName.trim(),
            subCategory: item.subCategory?.trim(),
            itemDescription: item.itemDescription.trim(),
            inStock: item.quantityReceived,
            ...(assetType === "Permanent" && {
              itemIds: item.itemIds?.map((id) => id?.trim()),
            }),
          });
          await newStoreItem.save();
        }
      }
    }

    // Delete temporary asset
    await TempAsset.deleteOne({ _id: id });

    // Send notification
    storeAssetNotification(tempAsset, "asset approved", new Date());

    // Send success response
    return res.status(201).json({
      success: true,
      message: `${assetCategory} inventory saved successfully`,
      count: savedAssets.length,
      assets: savedAssets,
    });
  } catch (error) {
    console.error("Failed to approve and save asset:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save asset",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Controller to reject a temporary asset
 * Moves asset to RejectedAsset and deletes from TempAsset
 * @param {Object} req - Express request object with asset ID in params and rejection remarks in body
 * @param {Object} res - Express response object
 */
exports.rejectAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionRemarks } = req.body;

    // Validate rejection remarks
    if (!rejectionRemarks) {
      return res.status(400).json({
        success: false,
        message: "Rejection remarks are required",
      });
    }

    // Find temporary asset
    const tempAsset = await TempAsset.findById(id);
    if (!tempAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found in temporary storage",
      });
    }

    // Prepare data for RejectedAsset
    const rejectedAssetData = {
      assetType: tempAsset.assetType || undefined,
      assetCategory: tempAsset.assetCategory || undefined,
      entryDate: tempAsset.entryDate || undefined,
      subCategory: tempAsset.subCategory || undefined,
      location: tempAsset.location || undefined,
      status: tempAsset.status || undefined,
      purchaseDate: tempAsset.purchaseDate || undefined,
      supplierName: tempAsset.supplierName || undefined,
      supplierAddress: tempAsset.supplierAddress || undefined,
      source: tempAsset.source || undefined,
      modeOfPurchase: tempAsset.modeOfPurchase || undefined,
      billNo: tempAsset.billNo || undefined,
      receivedBy: tempAsset.receivedBy || undefined,
      billPhotoUrl: tempAsset.billPhotoUrl || undefined,
      items: tempAsset.items
        ? tempAsset.items.map((item) => ({
            itemName: item.itemName || undefined,
            subCategory: item.subCategory || undefined,
            itemDescription: item.itemDescription || undefined,
            quantityReceived: item.quantityReceived || undefined,
            unitPrice: item.unitPrice || undefined,
            totalPrice: item.totalPrice || undefined,
            amcFromDate: item.amcFromDate || undefined,
            amcToDate: item.amcToDate || undefined,
            amcCost: item.amcCost || undefined,
            amcPhotoUrl: item.amcPhotoUrl || undefined,
            itemPhotoUrl: item.itemPhotoUrl || undefined,
            warrantyNumber: item.warrantyNumber || undefined,
            warrantyValidUpto: item.warrantyValidUpto || undefined,
            warrantyPhotoUrl: item.warrantyPhotoUrl || undefined,
            itemIds: item.itemIds || [],
          }))
        : [],
      dateOfPossession: tempAsset.dateOfPossession || undefined,
      controllerOrCustody: tempAsset.controllerOrCustody || undefined,
      details: tempAsset.details || undefined,
      type: tempAsset.type || undefined,
      buildingNo: tempAsset.buildingNo || undefined,
      plinthArea: tempAsset.plinthArea || undefined,
      dateOfConstruction: tempAsset.dateOfConstruction || undefined,
      costOfConstruction: tempAsset.costOfConstruction || undefined,
      remarks: tempAsset.remarks || undefined,
      approvedEstimate: tempAsset.approvedEstimate || undefined,
      approvedBuildingPlanUrl: tempAsset.approvedBuildingPlanUrl || undefined,
      kmzOrkmlFileUrl: tempAsset.kmzOrkmlFileUrl || undefined,
      rejectionRemarks,
    };

    // Save to RejectedAsset
    const rejectedAsset = new RejectedAsset(rejectedAssetData);
    await rejectedAsset.save();

    // Delete from TempAsset
    await TempAsset.deleteOne({ _id: id });

    // Send notification
    const temp = {
      ...tempAsset.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
    };
    await storeAssetNotification(temp, "asset rejected", new Date());

    // Send success response
    return res.status(200).json({
      success: true,
      message: `${tempAsset.assetCategory || "Asset"} rejected successfully`,
      data: rejectedAsset,
    });
  } catch (error) {
    console.error("Failed to reject asset:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject asset",
      error: error.message,
    });
  }
};

/**
 * Controller to fetch pending asset updates
 * Retrieves all updates with "pending" status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPendingUpdates = async (req, res) => {
  try {
    // Fetch pending updates
    const updates = await PendingAssetUpdate.find({ status: "pending" });
    res.status(200).json(updates);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to fetch rejected asset updates
 * Retrieves all updates with "rejected" status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRejectedUpdates = async (req, res) => {
  try {
    // Fetch rejected updates
    const updates = await PendingAssetUpdate.find({ status: "rejected" });
    res.status(200).json(updates);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to approve an asset update
 * Applies update to Permanent/Consumable collection and marks update as approved
 * @param {Object} req - Express request object with update ID in params
 * @param {Object} res - Express response object
 */
exports.approveUpdate = async (req, res) => {
  const { id } = req.params;
  try {
    // Find pending update
    const update = await PendingAssetUpdate.findById(id);
    if (!update) return res.status(404).json({ success: false, message: "Update not found" });

    // Select appropriate model
    const Model = update.assetType === "Permanent" ? Permanent : Consumable;
    // Apply update
    await Model.findByIdAndUpdate(update.assetId, update.updatedData);
    // Mark update as approved
    await PendingAssetUpdate.findByIdAndUpdate(id, { status: "approved" });

    // Send notification
    await storeAssetNotification(
      {
        assetType: update.assetType,
        assetCategory: update.updatedData.assetCategory,
        items: update.updatedData.items,
        subCategory: update.updatedData.items?.[0]?.subCategory,
      },
      "asset updation approved",
      new Date()
    );

    // Send success response
    res.status(200).json({ success: true, message: "Update approved and applied" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to reject an asset update
 * Marks update as rejected and stores in RejectedAsset
 * @param {Object} req - Express request object with update ID in params and rejection remarks in body
 * @param {Object} res - Express response object
 */
exports.rejectUpdate = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks } = req.body;
  try {
    // Find pending update
    const update = await PendingAssetUpdate.findById(id);
    if (!update) return res.status(404).json({ success: false, message: "Update not found" });

    // Mark update as rejected
    await PendingAssetUpdate.findByIdAndUpdate(id, { status: "rejected", rejectionRemarks }, { new: true });

    // Save to RejectedAsset
    const rejectedAsset = new RejectedAsset({
      assetType: update.assetType,
      assetCategory: update.updatedData.assetCategory,
      rejectionRemarks: rejectionRemarks || "No remarks provided",
      updatedData: update.updatedData,
      subCategory: update.updatedData.items?.[0]?.subCategory || update.updatedData.subCategory,
      assetId: update.assetId,
    });
    await rejectedAsset.save();

    // Send notification
    await storeAssetNotification(
      {
        assetType: update.assetType,
        assetCategory: update.updatedData.assetCategory,
        items: update.updatedData.items,
        subCategory: update.updatedData.items?.[0]?.subCategory,
        rejectionRemarks,
        assetId: update.assetId,
        rejectedAssetId: rejectedAsset._id,
      },
      "asset updation rejected",
      new Date()
    );

    // Send success response
    res.status(200).json({ success: true, message: "Update rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to approve an issue request
 * Moves issue from TempIssue to IssuedPermanent/IssuedConsumable
 * @param {Object} req - Express request object with issue ID in params
 * @param {Object} res - Express response object
 */
exports.approveIssue = async (req, res) => {
  try {
    // Find temporary issue
    const tempIssue = await TempIssue.findById(req.params.id);
    if (!tempIssue || tempIssue.acknowledged !== "yes") {
      return res.status(400).json({ message: "Issue not found or not acknowledged" });
    }

    // Select appropriate model
    const IssuedModel = tempIssue.assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;

    // Find existing issued item
    let issuedItem = await IssuedModel.findOne({
      assetCategory: tempIssue.assetCategory,
      itemName: tempIssue.itemName,
      subCategory: tempIssue.subCategory,
      itemDescription: tempIssue.itemDescription,
    });

    if (issuedItem) {
      // Update existing issue
      const existingIssueIndex = issuedItem.issues.findIndex(
        (issue) => issue.issuedTo === tempIssue.issuedTo && issue.location === tempIssue.location
      );
      if (existingIssueIndex !== -1) {
        const existingIssue = issuedItem.issues[existingIssueIndex];
        existingIssue.quantity += tempIssue.quantity;
        if (tempIssue.assetType === "Permanent") {
          existingIssue.issuedIds = [...new Set([...existingIssue.issuedIds, ...tempIssue.issuedIds])];
        }
        existingIssue.issuedDate = new Date();
      } else {
        issuedItem.issues.push({
          issuedTo: tempIssue.issuedTo,
          location: tempIssue.location,
          quantity: tempIssue.quantity,
          issuedIds: tempIssue.assetType === "Permanent" ? tempIssue.issuedIds : undefined,
          issuedDate: new Date(),
        });
      }
      await issuedItem.save();
    } else {
      // Create new issued item
      const newIssued = new IssuedModel({
        assetType: tempIssue.assetType,
        assetCategory: tempIssue.assetCategory,
        itemName: tempIssue.itemName,
        subCategory: tempIssue.subCategory,
        itemDescription: tempIssue.itemDescription,
        issues: [
          {
            issuedTo: tempIssue.issuedTo,
            location: tempIssue.location,
            quantity: tempIssue.quantity,
            issuedIds: tempIssue.assetType === "Permanent" ? tempIssue.issuedIds : undefined,
            issuedDate: new Date(),
          },
        ],
      });
      await newIssued.save();
    }

    // Delete from TempIssue
    await TempIssue.findByIdAndDelete(req.params.id);

    // Send notification
    storeAssetNotification(tempIssue, "issue approved", new Date());

    // Send success response
    res.status(200).json({ success: true, message: "Issue approved successfully" });
  } catch (error) {
    console.error("Failed to approve issue:", error);
    res.status(500).json({ message: "Failed to approve issue" });
  }
};

/**
 * Controller to reject an issue request
 * Restores stock and moves issue to RejectedAsset
 * @param {Object} req - Express request object with issue ID in params and rejection remarks in body
 * @param {Object} res - Express response object
 */
exports.rejectIssue = async (req, res) => {
  try {
    const { rejectionRemarks } = req.body;
    // Find temporary issue
    const tempIssue = await TempIssue.findById(req.params.id);
    if (!tempIssue || tempIssue.acknowledged !== "yes") {
      return res.status(400).json({ message: "Issue not found or not acknowledged" });
    }

    // Select appropriate store model
    const StoreModel = tempIssue.assetType === "Permanent" ? StorePermanent : StoreConsumable;
    // Restore stock
    const storeItem = await StoreModel.findOne({
      assetCategory: tempIssue.assetCategory,
      itemName: tempIssue.itemName,
      subCategory: tempIssue.subCategory,
      itemDescription: tempIssue.itemDescription,
    });
    if (storeItem) {
      storeItem.inStock += tempIssue.quantity;
      if (tempIssue.assetType === "Permanent" && tempIssue.issuedIds) {
        storeItem.itemIds = [...new Set([...storeItem.itemIds, ...tempIssue.issuedIds])];
      }
      await storeItem.save();
    }

    // Mark issue as rejected
    tempIssue.rejected = "yes";
    tempIssue.rejectionRemarks = rejectionRemarks;
    await tempIssue.save();

    // Save to RejectedAsset
    const rejectedAsset = new RejectedAsset({
      assetType: tempIssue.assetType,
      assetCategory: tempIssue.assetCategory,
      itemName: tempIssue.itemName,
      subCategory: tempIssue.subCategory,
      itemDescription: tempIssue.itemDescription,
      issuedTo: tempIssue.issuedTo,
      location: tempIssue.location,
      quantity: tempIssue.quantity,
      issuedIds: tempIssue.issuedIds,
      pdfUrl: tempIssue.pdfUrl,
      signedPdfUrl: tempIssue.signedPdfUrl,
      rejectionRemarks,
    });
    await rejectedAsset.save();

    // Delete from TempIssue
    await TempIssue.findByIdAndDelete(req.params.id);

    // Send notification
    const temp = {
      ...tempIssue.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
    };
    await storeAssetNotification(temp, "issue rejected", new Date());

    // Send success response
    res.status(200).json({ success: true, message: "Issue rejected successfully" });
  } catch (error) {
    console.error("Failed to reject issue:", error);
    res.status(500).json({ message: "Failed to reject issue" });
  }
};

/**
 * Controller to approve a return request
 * Updates stock or marks for further approval based on condition
 * @param {Object} req - Express request object with return ID in params and condition, assetType, returnedQuantity in body
 * @param {Object} res - Express response object
 */
exports.approveReturn = async (req, res) => {
  const { id } = req.params;
  const { condition, assetType, returnedQuantity } = req.body;

  try {
    // Validate inputs
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type is required" });
    }
    if (!condition || !["Good", "service", "dispose", "exchange"].includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Valid condition (Good, service, dispose, or exchange) is required",
      });
    }

    // Select appropriate models
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

    // Find returned asset
    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    if (condition === "Good") {
      // Handle Good condition: add to stock
      const storeQuery = {
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        itemDescription: asset.itemDescription,
      };
      if (assetType === "Permanent") {
        storeQuery.subCategory = asset.subCategory;
      }
      let storeItem = await StoreModel.findOne(storeQuery);
      if (!storeItem) {
        storeItem = new StoreModel({
          assetCategory: asset.assetCategory,
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          inStock: 0,
          ...(assetType === "Permanent" ? { subCategory: asset.subCategory, itemIds: [] } : {}),
        });
      }
      storeItem.inStock += assetType === "Permanent" ? 1 : returnedQuantity;
      if (assetType === "Permanent") {
        storeItem.itemIds = [...new Set([...storeItem.itemIds, asset.itemId])];
      }
      await storeItem.save();

      // Delete from Returned collection
      await ReturnedModel.deleteOne({ _id: id });

      // Send notification
      storeAssetNotification(asset, "return approved", new Date());

      // Send success response
      return res.status(200).json({ success: true, message: "Return approved and added to stock" });
    }

    if (condition === "dispose") {
      // Mark for HOO approval
      asset.hooapproval = "waiting";
      await asset.save();

      // Send notification
      storeAssetNotification(asset, "return approved with HOO waiting", new Date());

      // Send success response
      return res.status(200).json({ success: true, message: "Return marked for HOO approval" });
    }

    // Update asset status
    asset.approved = "yes";
    asset.status = condition;
    await asset.save();

    if (assetType === "Consumable" && condition === "exchange") {
      // Handle Consumable exchange
      const exchangedConsumable = new ExchangedConsumable({
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        subCategory: asset.subCategory,
        itemDescription: asset.itemDescription,
        returnedQuantity,
        remark: asset.remark,
        pdfUrl: asset.pdfUrl,
        signedPdfUrl: asset.signedPdfUrl,
        originalReturnedAssetId: asset._id,
        approved: "no",
      });
      await exchangedConsumable.save();
    }

    // Send notification
    storeAssetNotification(asset, "return approved", new Date());

    // Send success response
    res.status(200).json({ success: true, message: "Return approved" });
  } catch (error) {
    console.error("Error approving return:", error);
    res.status(500).json({ success: false, message: "Failed to approve return" });
  }
};

/**
 * Controller to reject a return request
 * Restores asset to stock or issued collection and saves to RejectedAsset
 * @param {Object} req - Express request object with return ID in params and rejectionRemarks, assetType in body
 * @param {Object} res - Express response object
 */
exports.rejectReturn = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks, assetType } = req.body;

  try {
    // Validate assetType
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({
        success: false,
        message: "Valid asset type is required",
      });
    }

    // Select appropriate models
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;

    // Find returned asset
    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    // Reset hooapproval
    asset.hooapproval = null;
    await asset.save();

    if (asset.location === "Store") {
      // Restore to store
      const storeQuery = {
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        itemDescription: asset.itemDescription,
      };
      if (assetType === "Permanent") {
        storeQuery.subCategory = asset.subCategory;
      }
      let storeItem = await StoreModel.findOne(storeQuery);
      if (!storeItem) {
        storeItem = new StoreModel({
          assetCategory: asset.assetCategory,
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          inStock: 0,
          ...(assetType === "Permanent" ? { subCategory: asset.subCategory, itemIds: [] } : {}),
        });
      }
      if (assetType === "Permanent") {
        storeItem.inStock += 1;
        storeItem.itemIds.push(asset.itemId);
      } else {
        storeItem.inStock += asset.returnQuantity;
      }
      await storeItem.save();
    } else {
      // Restore to issued collection
      const issuedQuery = {
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        itemDescription: asset.itemDescription,
      };
      if (assetType === "Permanent") {
        issuedQuery.subCategory = asset.subCategory;
      }
      let issuedItem = await IssuedModel.findOne(issuedQuery);
      if (!issuedItem) {
        issuedItem = new IssuedModel({
          assetCategory: asset.assetCategory,
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          issues: [],
          ...(assetType === "Permanent" ? { subCategory: asset.subCategory } : {}),
        });
      }
      const issueIndex = issuedItem.issues.findIndex((issue) => issue.issuedTo === asset.location);
      if (issueIndex === -1) {
        issuedItem.issues.push({
          issuedTo: asset.location,
          quantity: assetType === "Permanent" ? 1 : asset.returnQuantity,
          ...(assetType === "Permanent" ? { issuedIds: [asset.itemId] } : {}),
        });
      } else {
        issuedItem.issues[issueIndex].quantity += assetType === "Permanent" ? 1 : asset.returnQuantity;
        if (assetType === "Permanent") {
          issuedItem.issues[issueIndex].issuedIds.push(asset.itemId);
        }
      }
      await issuedItem.save();
    }

    // Save to RejectedAsset
    const rejectedAsset = new RejectedAsset({
      assetType: asset.assetType,
      assetCategory: asset.assetCategory,
      itemName: asset.itemName,
      subCategory: asset.subCategory,
      itemDescription: asset.itemDescription,
      location: asset.location,
      status: asset.status,
      returnQuantity: asset.returnQuantity,
      itemId: asset.itemId,
      returnIds: assetType === "Permanent" ? [asset.itemId] : undefined,
      pdfUrl: asset.pdfUrl,
      signedPdfUrl: asset.signedPdfUrl,
      rejectionRemarks,
      approved: "no",
    });
    await rejectedAsset.save();

    // Mark as rejected and delete
    asset.approved = "no";
    asset.rejectionRemarks = rejectionRemarks;
    await asset.save();
    await ReturnedModel.deleteOne({ _id: id });

    // Send notification
    const temp = {
      ...asset.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
    };
    await storeAssetNotification(temp, "return rejected", new Date());

    // Send success response
    res.status(200).json({
      success: true,
      message: "Return rejected and sent back to appropriate collection",
    });
  } catch (error) {
    console.error("Error rejecting return:", error);
    res.status(500).json({ success: false, message: "Failed to reject return" });
  }
};

/**
 * Controller to approve a service request
 * Moves service from TempServiced to ServicedAsset and updates stock
 * @param {Object} req - Express request object with service ID in params
 * @param {Object} res - Express response object
 */
exports.approveService = async (req, res) => {
  try {
    const { id } = req.params;
    // Find temporary serviced asset
    const tempAsset = await TempServiced.findById(id);
    if (!tempAsset) {
      return res.status(404).json({ message: "Temporary serviced asset not found" });
    }

    // Create new ServicedAsset entry
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemIds, serviceNo, serviceDate, serviceAmount } = tempAsset;
    const newServiced = new ServicedAsset({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemIds: assetType === "Permanent" ? itemIds : undefined,
      serviceNo,
      serviceDate,
      serviceAmount,
    });
    await newServiced.save();

    // Update store stock
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    if (storeItem) {
      if (assetType === "Permanent") {
        storeItem.inStock += itemIds.length;
        storeItem.itemIds = [...new Set([...storeItem.itemIds, ...itemIds])];
      } else {
        storeItem.inStock += 1;
      }
      await storeItem.save();
    } else {
      return res.status(400).json({ message: "Item not found in store" });
    }

    // Remove from ReturnedPermanent
    if (assetType === "Permanent") {
      await ReturnedPermanent.deleteMany({
        assetCategory,
        itemName,
        subCategory,
        itemDescription,
        itemId: { $in: itemIds },
      });
    }

    // Delete from TempServiced
    await TempServiced.findByIdAndDelete(id);

    // Send notification
    storeAssetNotification(tempAsset, "service approved", new Date());

    // Send success response
    res.status(200).json({ success: true, message: "Service approved and stock updated" });
  } catch (error) {
    console.error("Failed to approve service:", error);
    res.status(500).json({ message: "Failed to approve service" });
  }
};

/**
 * Controller to reject a service request
 * Updates Returned collections and saves to RejectedAsset
 * @param {Object} req - Express request object with service ID in params and rejection remarks in body
 * @param {Object} res - Express response object
 */
exports.rejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionRemarks } = req.body;
    // Find temporary serviced asset
    const tempAsset = await TempServiced.findById(id);
    if (!tempAsset) {
      return res.status(404).json({ message: "Temporary serviced asset not found" });
    }

    // Save to RejectedAsset
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemIds, serviceNo, serviceDate, serviceAmount } = tempAsset;
    const rejectedAsset = new RejectedAsset({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemIds,
      serviceNo,
      serviceDate,
      serviceAmount,
      rejectionRemarks,
      approved: "no",
    });
    await rejectedAsset.save();

    // Update Returned collections
    if (assetType === "Permanent") {
      await ReturnedPermanent.updateMany(
        {
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          itemId: { $in: itemIds },
        },
        {
          $set: {
            servicedEntry: "no",
            servicedRejection: "yes",
            servicedRejectionRemarks: rejectionRemarks,
          },
        }
      );
    } else if (assetType === "Consumable") {
      const returnedAsset = new ReturnedConsumable({
        assetType,
        assetCategory,
        itemName,
        subCategory,
        itemDescription,
        status: "returned",
        returnQuantity: 1,
        rejectionRemarks,
        servicedEntry: "no",
        servicedRejection: "yes",
      });
      await returnedAsset.save();
    }

    // Delete from TempServiced
    await TempServiced.findByIdAndDelete(id);

    // Send notification
    const temp = {
      ...tempAsset.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
    };
    await storeAssetNotification(temp, "service rejected", new Date());

    // Send success response
    res.status(200).json({ success: true, message: "Service rejected and returned assets updated" });
  } catch (error) {
    console.error("Failed to reject service:", error);
    res.status(500).json({ message: "Failed to reject service" });
  }
};

/**
 * Controller to approve a return by Head of Office (HOO)
 * Approves return for disposal or updates status
 * @param {Object} req - Express request object with return ID in params and assetType in body
 * @param {Object} res - Express response object
 */
exports.approveReturnByHoo = async (req, res) => {
  const { id } = req.params;
  const { assetType } = req.body;

  try {
    // Select appropriate model
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    // Find returned asset
    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    // Validate HOO approval status
    if (asset.hooapproval !== "waiting") {
      return res.status(400).json({ success: false, message: "Asset not awaiting HOO approval" });
    }

    if (assetType === "Consumable") {
      // Move Consumable to DisposedAsset
      const disposedAsset = new DisposedAsset({
        assetType: "Consumable",
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        subCategory: asset.subCategory,
        itemDescription: asset.itemDescription,
        quantity: asset.returnQuantity,
        remark: asset.remark || "Disposed from returned consumable",
        condemnationDate: new Date(),
      });
      await disposedAsset.save();
    }

    // Update asset status
    asset.approved = "yes";
    asset.hooapproval = null;
    await asset.save();

    // Send notification
    storeAssetNotification(asset, "return approved by HOO", new Date());

    // Send success response
    res.status(200).json({ success: true, message: "Return approved by HOO" });
  } catch (error) {
    console.error("Error approving return by HOO:", error);
    res.status(500).json({ success: false, message: "Failed to approve return by HOO" });
  }
};

/**
 * Controller to reject a return by Head of Office (HOO)
 * Restores asset to stock or issued collection
 * @param {Object} req - Express request object with return ID in params and rejectionRemarks, assetType in body
 * @param {Object} res - Express response object
 */
exports.rejectReturnByHoo = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks, assetType } = req.body;

  try {
    // Select appropriate models
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;

    // Find returned asset
    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    // Validate HOO approval status
    if (asset.hooapproval !== "waiting") {
      return res.status(400).json({ success: false, message: "Asset not awaiting HOO approval" });
    }

    // Reset hooapproval
    asset.hooapproval = null;
    await asset.save();

    if (asset.location === "Store") {
      // Restore to store
      const storeQuery = {
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        itemDescription: asset.itemDescription,
      };
      if (assetType === "Permanent") {
        storeQuery.subCategory = asset.subCategory;
      }
      let storeItem = await StoreModel.findOne(storeQuery);
      if (!storeItem) {
        storeItem = new StoreModel({
          assetCategory: asset.assetCategory,
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          inStock: 0,
          ...(assetType === "Permanent" ? { subCategory: asset.subCategory, itemIds: [] } : {}),
        });
      }
      if (assetType === "Permanent") {
        storeItem.inStock += 1;
        storeItem.itemIds.push(asset.itemId);
      } else {
        storeItem.inStock += asset.returnQuantity;
      }
      await storeItem.save();
    } else {
      // Restore to issued collection
      const issuedQuery = {
        assetCategory: asset.assetCategory,
        itemName: asset.itemName,
        itemDescription: asset.itemDescription,
      };
      if (assetType === "Permanent") {
        issuedQuery.subCategory = asset.subCategory;
      }
      let issuedItem = await IssuedModel.findOne(issuedQuery);
      if (!issuedItem) {
        issuedItem = new IssuedModel({
          assetCategory: asset.assetCategory,
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          issues: [],
          ...(assetType === "Permanent" ? { subCategory: asset.subCategory } : {}),
        });
      }
      const issueIndex = issuedItem.issues.findIndex((issue) => issue.issuedTo === asset.location);
      if (issueIndex === -1) {
        issuedItem.issues.push({
          issuedTo: asset.location,
          quantity: assetType === "Permanent" ? 1 : asset.returnQuantity,
          ...(assetType === "Permanent" ? { issuedIds: [asset.itemId] } : {}),
        });
      } else {
        issuedItem.issues[issueIndex].quantity += assetType === "Permanent" ? 1 : asset.returnQuantity;
        if (assetType === "Permanent") {
          issuedItem.issues[issueIndex].issuedIds.push(asset.itemId);
        }
      }
      await issuedItem.save();
    }

    // Delete from Returned collection
    await ReturnedModel.deleteOne({ _id: id });

    // Send notification
    storeAssetNotification(asset, "return rejected by HOO", new Date(), { rejectionRemarks });

    // Send success response
    res.status(200).json({ success: true, message: "Return rejected by HOO" });
  } catch (error) {
    console.error("Error rejecting return by HOO:", error);
    res.status(500).json({ success: false, message: "Failed to reject return by HOO" });
  }
};

/**
 * Controller to approve or reject a building maintenance request
 * Approves to BuildingMaintenance or rejects to RejectedAsset
 * @param {Object} req - Express request object with id, action, and rejectionRemarks in body
 * @param {Object} res - Express response object
 */
exports.approveOrRejectMaintenance = async (req, res) => {
  try {
    const { id, action, rejectionRemarks } = req.body;
    // Find temporary maintenance entry
    const tempMaintenance = await TempBuildingMaintenance.findById(id);
    if (!tempMaintenance) {
      return res.status(404).json({ message: "Maintenance entry not found" });
    }

    const actionTime = new Date();

    if (action === "approve") {
      // Approve maintenance
      const newMaintenance = new BuildingMaintenance({
        assetType: tempMaintenance.assetType,
        assetCategory: tempMaintenance.assetCategory,
        subCategory: tempMaintenance.subCategory,
        buildingNo: tempMaintenance.buildingNo,
        yearOfMaintenance: tempMaintenance.yearOfMaintenance,
        cost: tempMaintenance.cost,
        description: tempMaintenance.description,
        custody: tempMaintenance.custody,
        agency: tempMaintenance.agency,
      });
      await newMaintenance.save();

      // Delete from TempBuildingMaintenance
      await TempBuildingMaintenance.findByIdAndDelete(id);

      // Send notification
      await storeAssetNotification(
        {
          assetType: tempMaintenance.assetType,
          assetCategory: tempMaintenance.assetCategory,
          subCategory: tempMaintenance.subCategory,
          location: tempMaintenance.custody,
        },
        "building maintenance approved",
        actionTime
      );

      // Send success response
      res.status(200).json({ message: "Maintenance approved and saved" });
    } else if (action === "reject") {
      // Reject maintenance
      const rejectedMaintenance = new RejectedAsset({
        assetType: tempMaintenance.assetType,
        assetCategory: tempMaintenance.assetCategory,
        subCategory: tempMaintenance.subCategory,
        buildingNo: tempMaintenance.buildingNo,
        location: tempMaintenance.custody,
        entryDate: tempMaintenance.createdAt,
        rejectionRemarks: rejectionRemarks || "No remarks provided",
        yearOfMaintenance: tempMaintenance.yearOfMaintenance,
        cost: tempMaintenance.cost,
        description: tempMaintenance.description,
        custody: tempMaintenance.custody,
        agency: tempMaintenance.agency,
      });
      const savedRejected = await rejectedMaintenance.save();

      // Update and delete temp maintenance
      tempMaintenance.status = "rejected";
      await tempMaintenance.save();
      await TempBuildingMaintenance.findByIdAndDelete(id);

      // Send notification
      await storeAssetNotification(
        {
          assetType: tempMaintenance.assetType,
          assetCategory: tempMaintenance.assetCategory,
          subCategory: tempMaintenance.subCategory,
          location: tempMaintenance.custody,
          rejectionRemarks,
          rejectedAssetId: savedRejected._id,
        },
        "building maintenance rejected",
        actionTime
      );

      // Send success response
      res.status(200).json({
        message: "Maintenance rejected",
        rejectedId: savedRejected._id,
      });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Failed to approve/reject maintenance:", error);
    res.status(500).json({ message: "Failed to process approval/rejection" });
  }
};

/**
 * Controller to approve a building upgrade
 * Adds upgrade to Building collection and deletes from TempBuildingUpgrade
 * @param {Object} req - Express request object with upgrade ID in params
 * @param {Object} res - Express response object
 */
exports.approveBuildingUpgrade = async (req, res) => {
  try {
    // Find temporary upgrade
    const tempUpgrade = await TempBuildingUpgrade.findById(req.params.id);
    if (!tempUpgrade) {
      return res.status(404).json({ success: false, message: "Upgrade not found" });
    }

    // Find matching building
    const building = await Building.findOne({ subCategory: tempUpgrade.subCategory });
    if (!building) {
      return res.status(404).json({ success: false, message: "No matching building found" });
    }

    // Add upgrades to building
    building.upgrades.push(...tempUpgrade.upgrades);
    await building.save();

    // Send notification
    await storeAssetNotification(
      {
        assetType: "Permanent",
        assetCategory: "Building",
        subCategory: tempUpgrade.subCategory,
        location: building.location,
        upgrades: tempUpgrade.upgrades,
      },
      "building upgrade approved",
      new Date()
    );

    // Delete from TempBuildingUpgrade
    await TempBuildingUpgrade.findByIdAndDelete(req.params.id);

    // Send success response
    res.status(200).json({ success: true, message: "Upgrade approved and added to building" });
  } catch (error) {
    console.error("Failed to approve building upgrade:", error);
    res.status(500).json({ success: false, message: "Error approving building upgrade" });
  }
};

/**
 * Controller to reject a building upgrade
 * Saves to RejectedAsset and deletes from TempBuildingUpgrade
 * @param {Object} req - Express request object with upgrade ID in params and rejectionRemarks in body
 * @param {Object} res - Express response object
 */
exports.rejectBuildingUpgrade = async (req, res) => {
  try {
    const { rejectionRemarks } = req.body;
    // Find temporary upgrade
    const tempUpgrade = await TempBuildingUpgrade.findById(req.params.id);
    if (!tempUpgrade) {
      return res.status(404).json({ success: false, message: "Upgrade not found" });
    }

    // Find matching building
    const building = await Building.findOne({ subCategory: tempUpgrade.subCategory });
    if (!building) {
      return res.status(404).json({ success: false, message: "No matching building found" });
    }

    // Save to RejectedAsset
    const rejectedAsset = new RejectedAsset({
      assetType: "Permanent",
      assetCategory: "Building",
      subCategory: tempUpgrade.subCategory,
      location: building.location,
      upgrades: tempUpgrade.upgrades,
      rejectionRemarks: rejectionRemarks || "Rejected by Asset Manager",
      buildingNo: building.buildingNo,
      plinthArea: building.plinthArea,
      dateOfConstruction: building.dateOfConstruction,
      costOfConstruction: building.costOfConstruction,
    });
    await rejectedAsset.save();

    // Send notification
    const notificationData = {
      assetType: "Permanent",
      assetCategory: "Building",
      subCategory: tempUpgrade.subCategory,
      location: building.location,
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
      upgrades: tempUpgrade.upgrades,
    };
    await storeAssetNotification(notificationData, "building upgrade rejected", new Date());

    // Delete from TempBuildingUpgrade
    await TempBuildingUpgrade.findByIdAndDelete(req.params.id);

    // Send success response
    res.status(200).json({ success: true, message: "Building upgrade rejected successfully" });
  } catch (error) {
    console.error("Failed to reject building upgrade:", error);
    res.status(500).json({ success: false, message: "Error rejecting building upgrade" });
  }
};

/**
 * Controller to fetch exchanged consumables pending approval
 * Retrieves ExchangedConsumable entries with "no" approval status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getExchangedForApproval = async (req, res) => {
  try {
    // Fetch pending exchanges
    const exchangedItems = await ExchangedConsumable.find({ approved: "no" });
    res.json(exchangedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to approve an exchange request
 * Updates stock and marks exchange as approved
 * @param {Object} req - Express request object with exchange ID in params
 * @param {Object} res - Express response object
 */
exports.approveExchange = async (req, res) => {
  try {
    // Find exchange
    const exchange = await ExchangedConsumable.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ message: "Exchange not found" });
    }

    // Update approval status
    exchange.approved = "yes";
    await exchange.save();

    // Update stock
    const stockItem = await StoreConsumable.findOne({
      assetCategory: exchange.assetCategory,
      itemName: exchange.itemName,
    });
    if (stockItem) {
      stockItem.inStock += exchange.returnedQuantity;
      await stockItem.save();
    }

    // Send notification
    storeAssetNotification(exchange, "exchange approved", new Date());

    // Send success response
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to reject an exchange request
 * Moves back to ReturnedConsumable and deletes exchange
 * @param {Object} req - Express request object with exchange ID in params
 * @param {Object} res - Express response object
 */
exports.rejectExchange = async (req, res) => {
  try {
    // Find exchange
    const exchange = await ExchangedConsumable.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ message: "Exchange not found" });
    }

    // Update approval status
    exchange.approved = "rejected";
    await exchange.save();

    // Create new ReturnedConsumable entry
    const returnedConsumable = new ReturnedConsumable({
      assetType: exchange.assetType,
      assetCategory: exchange.assetCategory,
      itemName: exchange.itemName,
      subCategory: exchange.subCategory,
      itemDescription: exchange.itemDescription,
      returnQuantity: exchange.returnedQuantity,
      status: "dispose",
      approved: "yes",
      pdfUrl: exchange.pdfUrl,
      signedPdfUrl: exchange.signedPdfUrl,
      remark: exchange.remark,
    });
    await returnedConsumable.save();

    // Delete from ExchangedConsumable
    await ExchangedConsumable.findByIdAndDelete(req.params.id);

    // Send notification
    storeAssetNotification(exchange, "exchange rejected", new Date());

    // Send success response
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to fetch all rejected assets and issues
 * Combines RejectedAsset and rejected TempIssue entries
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rejectedassets = async (req, res) => {
  try {
    // Fetch rejected assets and issues
    const rejectedPurchased = await RejectedAsset.find();
    const rejectedIssues = await TempIssue.find({ rejected: "yes" });
    res.status(200).json([...rejectedPurchased, ...rejectedIssues]);
  } catch (error) {
    console.error("Error fetching rejected assets:", error);
    res.status(500).json({ message: "Error fetching rejected assets" });
  }
};

/**
 * Controller to fetch a specific rejected asset
 * Retrieves RejectedAsset by ID
 * @param {Object} req - Express request object with asset ID in params
 * @param {Object} res - Express response object
 */
exports.getRejectedAsset = async (req, res) => {
  try {
    const { id } = req.params;
    // Find rejected asset
    const rejectedAsset = await RejectedAsset.findById(id);
    if (!rejectedAsset) {
      return res.status(404).json({ success: false, message: "Rejected asset not found" });
    }
    res.status(200).json({ success: true, data: rejectedAsset });
  } catch (error) {
    console.error("Failed to fetch rejected asset:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rejected asset", error: error.message });
  }
};

/**
 * Controller to fetch returned assets awaiting HOO approval
 * Retrieves assets from ReturnedPermanent and ReturnedConsumable with "waiting" hooapproval
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReturnedAssetsForHoo = async (req, res) => {
  try {
    // Fetch assets awaiting HOO approval
    const [permanentAssets, consumableAssets] = await Promise.all([
      ReturnedPermanent.find({ hooapproval: "waiting" }).lean(),
      ReturnedConsumable.find({ hooapproval: "waiting" }).lean(),
    ]);

    // Combine results
    const allAssets = [
      ...permanentAssets.map((asset) => ({ ...asset, assetType: "Permanent" })),
      ...consumableAssets.map((asset) => ({ ...asset, assetType: "Consumable" })),
    ];

    // Send success response
    res.status(200).json({ success: true, data: allAssets });
  } catch (error) {
    console.error("Error fetching assets for HOO approval:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assets for HOO approval" });
  }
};

/**
 * Controller to delete a rejected asset
 * Removes RejectedAsset by ID
 * @param {Object} req - Express request object with asset ID in params
 * @param {Object} res - Express response object
 */
exports.deleteRejectedAsset = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete rejected asset
    const deletedAsset = await RejectedAsset.findByIdAndDelete(id);
    if (!deletedAsset) {
      return res.status(404).json({ success: false, message: "Rejected asset not found" });
    }
    res.status(200).json({ success: true, message: "Rejected asset deleted successfully" });
  } catch (error) {
    console.error("Failed to delete rejected asset:", error);
    res.status(500).json({ success: false, message: "Failed to delete rejected asset", error: error.message });
  }
};

/**
 * Controller to fetch rejected asset data
 * Retrieves RejectedAsset by assetType and location
 * @param {Object} req - Express request object with assetTypeParam and locationParam in body
 * @param {Object} res - Express response object
 */
exports.getRejectedAssetData = async (req, res) => {
  const { assetTypeParam, locationParam } = req.body;

  try {
    const assetType = assetTypeParam;
    const location = locationParam;
    // Find rejected asset
    const rejectedAssets = await RejectedAsset.findOne({ assetType, location });

    if (!rejectedAssets) {
      return res.status(200).json({ message: "No rejected assets found" });
    }

    // Return appropriate data field
    if (rejectedAssets.data) {
      return res.status(200).json({
        message: "Rejected assets found",
        data: rejectedAssets.data,
        status: "confirmed",
      });
    } else {
      return res.status(200).json({
        message: "Rejected assets found",
        data: rejectedAssets.previousData,
        status: "confirmed",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching rejected assets" });
  }
};

/**
 * Controller to remove rejected asset and save as new asset
 * Deletes RejectedAsset and creates new Asset record
 * @param {Object} req - Express request object with assetType, location, and data in body
 * @param {Object}.HTTP Status Codesres - Express response object
 */
exports.removeRejectedData = async (req, res) => {
  const { assetType, location, data } = req.body;

  // Validate required fields
  if (!assetType || !location || !data) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    // Delete rejected asset
    const deletedRejectedAsset = await RejectedAsset.findOneAndDelete({ assetType, location });
    if (!deletedRejectedAsset) {
      return res.status(404).json({ success: false, message: "Rejected asset not found." });
    }

    // Create new asset record
    const assetRecord = new Asset({
      assetType,
      location,
      data,
    });
    await assetRecord.save();

    // Send success response
    return res.status(200).json({ success: true, message: "Rejected asset removed, and new asset saved successfully." });
  } catch (error) {
    console.error("Error in removeRejectedData:", error);
    return res.status(500).json({ success: false, message: "Server error occurred while processing the request." });
  }
};













































































/**
 * Controller to fetch asset entries by month
 * Counts ConfirmedAsset entries per month for a given year
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAssetEntriesByMonth = async (req, res) => {
  try {
    // Fetch all ConfirmedAsset documents
    const assets = await ConfirmedAsset.find({});
    // Initialize array to store counts for each month (0-11)
    const monthlyCounts = Array(12).fill(0);

    // Count assets per month
    assets.forEach((asset) => {
      const month = new Date(asset.joined).getUTCMonth(); // Extract month (0-11)
      monthlyCounts[month]++;
    });

    // Send response with month labels and counts
    res.json({
      labels: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      data: monthlyCounts,
    });
  } catch (error) {
    console.error("Error fetching asset entries by month:", error);
    res.status(500).json({ error: 'Error fetching asset data.' });
  }
};

/**
 * Controller to fetch asset types by month or year
 * Aggregates ConfirmedAsset quantities by asset type (IT, store, electrical, furniture) for a specific location and year
 * @param {Object} req - Express request object with location and year in query
 * @param {Object} res - Express response object
 */
exports.getAssetTypeByMonth = async (req, res) => {
  try {
    const { location, year } = req.query;

    // Build query based on location and year
    let query = {};
    if (location) {
      query.location = location;
    }

    // Map asset types to fixed indices
    const assetTypeMapping = {
      IT: 0,
      store: 1,
      electrical: 2,
      furniture: 3,
    };

    // Initialize result array: 12 months for specific year or 11 years (2025-2035) for 'all'
    let result;
    if (year === "all") {
      result = Array.from({ length: 11 }, () => Array(4).fill(0)); // 11 years x 4 types
    } else {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.joined = { $gte: startDate, $lte: endDate };
      result = Array.from({ length: 12 }, () => Array(4).fill(0)); // 12 months x 4 types
    }

    // Fetch assets matching query
    const assets = await ConfirmedAsset.find(query);

    // Aggregate quantities by asset type and time period
    assets.forEach((asset) => {
      const assetType = asset.assetType;
      const joinedDate = new Date(asset.joined);

      if (assetTypeMapping.hasOwnProperty(assetType)) {
        const assetIndex = assetTypeMapping[assetType];
        // Sum quantities from asset.data
        const totalQuantity = Object.values(asset.data).reduce((sum, item) => sum + (item.quantity || 0), 0);

        if (year === "all") {
          const yearIndex = joinedDate.getFullYear() - 2025; // Map to 2025-2035
          if (yearIndex >= 0 && yearIndex < 11) {
            result[yearIndex][assetIndex] += totalQuantity;
          }
        } else {
          const monthIndex = joinedDate.getMonth();
          result[monthIndex][assetIndex] += totalQuantity;
        }
      }
    });

    // Send response with aggregated data
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching asset types by month:", error);
    res.status(500).json({ error: "Error fetching assets: " + error.message });
  }
};

/**
 * Controller to fetch purchased assets by type
 * Aggregates Permanent or Consumable asset quantities by category for a specific year and location
 * @param {Object} req - Express request object with assetType, location, and year in query
 * @param {Object} res - Express response object
 */
exports.getPurchasedAssetsByType = async (req, res) => {
  try {
    const { assetType, location, year } = req.query;

    // Validate assetType
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ error: "Invalid or missing assetType. Must be 'Permanent' or 'Consumable'." });
    }

    // Define category options for Permanent and Consumable assets
    const permanentAssetOptions = [
      "Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods",
      "Curtains", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"
    ];
    const consumableAssetOptions = [
      "Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items",
      "Sanitory Items", "Sports Goods", "Beds and Pillows", "Instruments"
    ];

    // Select model and categories based on assetType
    const PurchaseModel = assetType === "Permanent" ? Permanent : Consumable;
    const assetCategoryMapping = assetType === "Permanent"
      ? permanentAssetOptions.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {})
      : consumableAssetOptions.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});

    // Build query based on location and year
    let query = {};
    if (location && location !== "All") {
      query.location = location;
    }

    // Initialize result array: 12 months or 11 years
    let result;
    const categoryCount = assetType === "Permanent" ? permanentAssetOptions.length : consumableAssetOptions.length;
    if (year === "all") {
      result = Array.from({ length: 11 }, () => Array(categoryCount).fill(0)); // 2025-2035
    } else {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.purchaseDate = { $gte: startDate, $lte: endDate };
      result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 12 months
    }

    // Fetch assets matching query
    const assets = await PurchaseModel.find(query);

    // Aggregate quantities by category and time period
    assets.forEach((asset) => {
      const category = asset.assetCategory;
      const purchaseDate = new Date(asset.purchaseDate);

      if (assetCategoryMapping.hasOwnProperty(category)) {
        const categoryIndex = assetCategoryMapping[category];
        const totalQuantity = asset.items.reduce((sum, item) => sum + (item.quantityReceived || 0), 0);

        if (year === "all") {
          const yearIndex = purchaseDate.getFullYear() - 2025;
          if (yearIndex >= 0 && yearIndex < 11) {
            result[yearIndex][categoryIndex] += totalQuantity;
          }
        } else {
          const monthIndex = purchaseDate.getMonth();
          result[monthIndex][categoryIndex] += totalQuantity;
        }
      }
    });

    // Send response with data and category labels
    res.status(200).json({
      data: result,
      categories: assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions
    });
  } catch (error) {
    console.error("Error fetching purchased assets:", error);
    res.status(500).json({ error: "Error fetching purchased assets: " + error.message });
  }
};

/**
 * Controller to fetch issued Permanent assets by month or year
 * Aggregates IssuedPermanent asset quantities by category for a specific year and location
 * @param {Object} req - Express request object with year and location in query
 * @param {Object} res - Express response object
 */
exports.getIssuedPermanentAssets = async (req, res) => {
  try {
    const { year, location } = req.query;

    // Define Permanent asset categories
    const permanentAssetCategories = [
      "Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods",
      "Curtains", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"
    ];
    const categoryMapping = permanentAssetCategories.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});

    // Build query based on location and year
    let query = {};
    if (location && location !== "All") {
      query["issues.issuedTo"] = location;
    }

    // Initialize result array: 12 months or 11 years
    let result;
    const categoryCount = permanentAssetCategories.length;
    if (year === "all") {
      result = Array.from({ length: 11 }, () => Array(categoryCount).fill(0)); // 2025-2035
    } else {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query["issues.issuedDate"] = { $gte: startDate, $lte: endDate };
      result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 12 months
    }

    // Fetch issued Permanent assets
    const issuedAssets = await IssuedPermanent.find(query);

    // Aggregate quantities by category and time period
    issuedAssets.forEach((asset) => {
      const category = asset.assetCategory;
      if (categoryMapping.hasOwnProperty(category)) {
        const categoryIndex = categoryMapping[category];
        asset.issues.forEach((issue) => {
          const issuedDate = new Date(issue.issuedDate);
          const totalQuantity = issue.quantity || 0;

          if (year === "all") {
            const yearIndex = issuedDate.getFullYear() - 2025;
            if (yearIndex >= 0 && yearIndex < 11) {
              result[yearIndex][categoryIndex] += totalQuantity;
            }
          } else if (issuedDate.getFullYear() === parseInt(year)) {
            const monthIndex = issuedDate.getMonth();
            result[monthIndex][categoryIndex] += totalQuantity;
          }
        });
      }
    });

    // Send response with data and category labels
    res.status(200).json({
      data: result,
      categories: permanentAssetCategories
    });
  } catch (error) {
    console.error("Error fetching issued permanent assets:", error);
    res.status(500).json({ error: "Error fetching issued permanent assets: " + error.message });
  }
};

/**
 * Controller to fetch issued Consumable assets by month or year
 * Aggregates IssuedConsumable asset quantities by category for a specific year and location
 * @param {Object} req - Express request object with year and location in query
 * @param {Object} res - Express response object
 */
exports.getIssuedConsumableAssets = async (req, res) => {
  try {
    const { year, location } = req.query;

    // Define Consumable asset categories
    const consumableAssetCategories = [
      "Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items",
      "Sanitory Items", "Sports Goods", "Beds and Pillows", "Instruments"
    ];
    const categoryMapping = consumableAssetCategories.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});

    // Build query based on location and year
    let query = {};
    if (location && location !== "All") {
      query["issues.issuedTo"] = location;
    }

    // Initialize result array: 12 months or 11 years
    let result;
    const categoryCount = consumableAssetCategories.length;
    if (year === "all") {
      result = Array.from({ length: 11 }, () => Array(categoryCount).fill(0)); // 2025-2035
    } else {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query["issues.issuedDate"] = { $gte: startDate, $lte: endDate };
      result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 12 months
    }

    // Fetch issued Consumable assets
    const issuedAssets = await IssuedConsumable.find(query);

    // Aggregate quantities by category and time period
    issuedAssets.forEach((asset) => {
      const category = asset.assetCategory;
      if (categoryMapping.hasOwnProperty(category)) {
        const categoryIndex = categoryMapping[category];
        asset.issues.forEach((issue) => {
          const issuedDate = new Date(issue.issuedDate);
          const totalQuantity = issue.quantity || 0;

          if (year === "all") {
            const yearIndex = issuedDate.getFullYear() - 2025;
            if (yearIndex >= 0 && yearIndex < 11) {
              result[yearIndex][categoryIndex] += totalQuantity;
            }
          } else if (issuedDate.getFullYear() === parseInt(year)) {
            const monthIndex = issuedDate.getMonth();
            result[monthIndex][categoryIndex] += totalQuantity;
          }
        });
      }
    });

    // Send response with data and category labels
    res.status(200).json({
      data: result,
      categories: consumableAssetCategories
    });
  } catch (error) {
    console.error("Error fetching issued consumable assets:", error);
    res.status(500).json({ error: "Error fetching issued consumable assets: " + error.message });
  }
};

/**
 * Controller to filter purchased assets
 * Retrieves assets from Building, Land, Permanent, and Consumable models based on provided filters
 * @param {Object} req - Express request object with filter parameters in body
 * @param {Object} res - Express response object
 */
exports.filterPurchase = async (req, res) => {
  try {
    const {
      assetType,
      assetCategory,
      subCategory,
      itemName,
      purchaseDateFrom,
      purchaseDateTo,
      supplierName,
      source,
      modeOfPurchase,
      billNo,
      receivedBy,
      amcDateFrom,
      amcDateTo,
    } = req.body;

    // Initialize result array
    let result = [];

    // Build base query for all models
    let query = {};
    if (assetType) query.assetType = { $regex: assetType, $options: "i" };
    if (assetCategory) query.assetCategory = { $regex: assetCategory, $options: "i" };
    if (supplierName) query.supplierName = { $regex: supplierName, $options: "i" };
    if (source) query.source = { $regex: source, $options: "i" };
    if (modeOfPurchase) query.modeOfPurchase = { $regex: modeOfPurchase, $options: "i" };
    if (billNo) query.billNo = { $regex: billNo, $options: "i" };
    if (receivedBy) query.receivedBy = { $regex: receivedBy, $options: "i" };

    // Handle purchase date range
    if (purchaseDateFrom || purchaseDateTo) {
      query.purchaseDate = {};
      if (purchaseDateFrom) query.purchaseDate.$gte = new Date(purchaseDateFrom);
      if (purchaseDateTo) query.purchaseDate.$lte = new Date(purchaseDateTo);
    }

    // Query Building model if assetCategory is "Building"
    if (assetCategory === "Building") {
      const buildingQuery = { ...query };
      if (subCategory && subCategory.trim() !== "") {
        buildingQuery.subCategory = { $regex: subCategory, $options: "i" };
      }
      if (purchaseDateFrom || purchaseDateTo) {
        delete buildingQuery.purchaseDate;
        buildingQuery.dateOfConstruction = {};
        if (purchaseDateFrom) buildingQuery.dateOfConstruction.$gte = new Date(purchaseDateFrom);
        if (purchaseDateTo) buildingQuery.dateOfConstruction.$lte = new Date(purchaseDateTo);
      }

      // Fetch and map Building assets
      const buildingAssets = await Building.find(buildingQuery).lean();
      result = result.concat(
        buildingAssets.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory || "N/A",
          itemName: asset.buildingNo || "Building",
          entryDate: asset.entryDate,
          purchaseDate: asset.dateOfConstruction || asset.entryDate,
          supplierName: "N/A",
          supplierAddress: "N/A",
          source: "N/A",
          modeOfPurchase: "N/A",
          billNo: "N/A",
          receivedBy: "N/A",
          billPhotoUrl: asset.approvedBuildingPlanUrl || "N/A",
          itemDescription: asset.remarks || asset.type || "N/A",
          quantityReceived: 1,
          unitPrice: asset.costOfConstruction || 0,
          totalPrice: asset.costOfConstruction || 0,
          amcFromDate: null,
          amcToDate: null,
          amcCost: null,
          amcPhotoUrl: "N/A",
          itemPhotoUrl: asset.kmzOrkmlFileUrl || "N/A",
          warrantyNumber: "N/A",
          warrantyValidUpto: null,
          warrantyPhotoUrl: "N/A",
          itemIds: [],
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
          buildingNo: asset.buildingNo || "N/A",
          type: asset.type || "N/A",
          plinthArea: asset.plinthArea || "N/A",
          costOfConstruction: asset.costOfConstruction || 0,
          approvedEstimate: asset.approvedEstimate || "N/A",
          dateOfConstruction: asset.dateOfConstruction || null,
          remarks: asset.remarks || "N/A",
          approvedBuildingPlanUrl: asset.approvedBuildingPlanUrl || "N/A",
          kmzOrkmlFileUrl: asset.kmzOrkmlFileUrl || "N/A",
          upgrades: asset.upgrades || [],
        }))
      );
    }

    // Query Land model if assetCategory is "Land"
    if (assetCategory === "Land") {
      const landQuery = { ...query };
      if (subCategory && subCategory.trim() !== "") {
        landQuery.subCategory = { $regex: subCategory, $options: "i" };
      }
      if (purchaseDateFrom || purchaseDateTo) {
        delete landQuery.purchaseDate;
        landQuery.dateOfPossession = {};
        if (purchaseDateFrom) landQuery.dateOfPossession.$gte = new Date(purchaseDateFrom);
        if (purchaseDateTo) landQuery.dateOfPossession.$lte = new Date(purchaseDateTo);
      }

      // Fetch and map Land assets
      const landAssets = await Land.find(landQuery).lean();
      result = result.concat(
        landAssets.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory || "N/A",
          itemName: asset.location || "Land Parcel",
          entryDate: asset.entryDate,
          purchaseDate: asset.dateOfPossession || asset.entryDate,
          supplierName: "N/A",
          supplierAddress: "N/A",
          source: "N/A",
          modeOfPurchase: "N/A",
          billNo: "N/A",
          receivedBy: "N/A",
          billPhotoUrl: "N/A",
          itemDescription: asset.details || "N/A",
          quantityReceived: 1,
          unitPrice: 0,
          totalPrice: 0,
          amcFromDate: null,
          amcToDate: null,
          amcCost: null,
          amcPhotoUrl: "N/A",
          itemPhotoUrl: "N/A",
          warrantyNumber: "N/A",
          warrantyValidUpto: null,
          warrantyPhotoUrl: "N/A",
          itemIds: [],
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
          dateOfPossession: asset.dateOfPossession || null,
          controllerOrCustody: asset.controllerOrCustody || "N/A",
          details: asset.details || "N/A",
          location: asset.location || "N/A",
          status: asset.status || "N/A",
        }))
      );
    }

    // Query Permanent model if not exclusively Building or Land
    if (!assetCategory || (assetCategory !== "Building" && assetCategory !== "Land")) {
      const permanentQuery = { ...query };
      if (itemName) permanentQuery["items.itemName"] = { $regex: itemName, $options: "i" };
      if (subCategory && subCategory.trim() !== "") {
        permanentQuery["items.subCategory"] = { $regex: subCategory, $options: "i" };
      }
      if (amcDateFrom || amcDateTo) {
        permanentQuery["items.amcFromDate"] = {};
        permanentQuery["items.amcToDate"] = {};
        if (amcDateFrom) permanentQuery["items.amcFromDate"].$gte = new Date(amcDateFrom);
        if (amcDateTo) permanentQuery["items.amcToDate"].$lte = new Date(amcDateTo);
      }

      // Fetch and map Permanent assets
      const permanentAssets = await Permanent.find(permanentQuery).lean();
      result = result.concat(
        permanentAssets.flatMap((asset) => {
          if (!Array.isArray(asset.items)) {
            console.warn("Permanent asset with missing or invalid items:", asset);
            return [];
          }
          return asset.items
            .filter((item) => !itemName || item.itemName.match(new RegExp(itemName, "i")))
            .filter((item) => !subCategory || (item.subCategory && item.subCategory.match(new RegExp(subCategory, "i"))))
            .map((item) => ({
              assetType: asset.assetType,
              assetCategory: asset.assetCategory,
              subCategory: item.subCategory || "N/A",
              itemName: item.itemName,
              entryDate: asset.entryDate,
              purchaseDate: asset.purchaseDate,
              supplierName: asset.supplierName || "N/A",
              supplierAddress: asset.supplierAddress || "N/A",
              source: asset.source || "N/A",
              modeOfPurchase: asset.modeOfPurchase || "N/A",
              billNo: asset.billNo || "N/A",
              receivedBy: asset.receivedBy || "N/A",
              billPhotoUrl: asset.billPhotoUrl || "N/A",
              itemDescription: item.itemDescription || "N/A",
              quantityReceived: item.quantityReceived || 0,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || item.quantityReceived * item.unitPrice || 0,
              amcFromDate: item.amcFromDate || null,
              amcToDate: item.amcToDate || null,
              amcCost: item.amcCost || null,
              amcPhotoUrl: item.amcPhotoUrl || "N/A",
              itemPhotoUrl: item.itemPhotoUrl || "N/A",
              warrantyNumber: item.warrantyNumber || "N/A",
              warrantyValidUpto: item.warrantyValidUpto || null,
              warrantyPhotoUrl: item.warrantyPhotoUrl || "N/A",
              itemIds: item.itemIds || [],
              createdAt: asset.createdAt,
              updatedAt: asset.updatedAt,
            }));
        })
      );
    }

    // Query Consumable model if not exclusively Building or Land
    if (!assetCategory || (assetCategory !== "Building" && assetCategory !== "Land")) {
      const consumableQuery = { ...query };
      if (itemName) consumableQuery["items.itemName"] = { $regex: itemName, $options: "i" };
      if (subCategory && subCategory.trim() !== "") {
        consumableQuery["items.subCategory"] = { $regex: subCategory, $options: "i" };
      }
      if (amcDateFrom || amcDateTo) {
        consumableQuery["items.amcFromDate"] = {};
        consumableQuery["items.amcToDate"] = {};
        if (amcDateFrom) consumableQuery["items.amcFromDate"].$gte = new Date(amcDateFrom);
        if (amcDateTo) consumableQuery["items.amcToDate"].$lte = new Date(amcDateTo);
      }

      // Fetch and map Consumable assets
      const consumableAssets = await Consumable.find(consumableQuery).lean();
      result = result.concat(
        consumableAssets.flatMap((asset) => {
          if (!Array.isArray(asset.items)) {
            return [];
          }
          return asset.items
            .filter((item) => !itemName || item.itemName.match(new RegExp(itemName, "i")))
            .filter((item) => !subCategory || (item.subCategory && item.subCategory.match(new RegExp(subCategory, "i"))))
            .map((item) => ({
              assetType: asset.assetType,
              assetCategory: asset.assetCategory,
              subCategory: item.subCategory || "N/A",
              itemName: item.itemName,
              entryDate: asset.entryDate,
              purchaseDate: asset.purchaseDate,
              supplierName: asset.supplierName || "N/A",
              supplierAddress: asset.supplierAddress || "N/A",
              source: asset.source || "N/A",
              modeOfPurchase: asset.modeOfPurchase || "N/A",
              billNo: asset.billNo || "N/A",
              receivedBy: asset.receivedBy || "N/A",
              billPhotoUrl: asset.billPhotoUrl || "N/A",
              itemDescription: item.itemDescription || "N/A",
              quantityReceived: item.quantityReceived || 0,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || item.quantityReceived * item.unitPrice || 0,
              amcFromDate: item.amcFromDate || null,
              amcToDate: item.amcToDate || null,
              amcCost: item.amcCost || null,
              amcPhotoUrl: item.amcPhotoUrl || "N/A",
              itemPhotoUrl: item.itemPhotoUrl || "N/A",
              warrantyNumber: item.warrantyNumber || "N/A",
              warrantyValidUpto: item.warrantyValidUpto || null,
              warrantyPhotoUrl: item.warrantyPhotoUrl || "N/A",
              itemIds: [],
              createdAt: asset.createdAt,
              updatedAt: asset.updatedAt,
            }));
        })
      );
    }

    // Send response with filtered results
    res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering purchase assets:", error);
    res.status(500).json({ message: "Error filtering purchase assets", error: error.stack });
  }
};

/**
 * Controller to filter store and issued assets
 * Retrieves assets from StorePermanent, StoreConsumable, IssuedPermanent, and IssuedConsumable based on filters
 * @param {Object} req - Express request object with filter parameters in body
 * @param {Object} res - Express response object
 */
exports.filterStoreIssue = async (req, res) => {
  try {
    const filters = req.body;
    // Build query based on filters
    const query = {};
    if (filters.assetCategory && filters.assetCategory.trim() !== "")
      query.assetCategory = { $regex: filters.assetCategory, $options: "i" };
    if (filters.subCategory && filters.subCategory.trim() !== "")
      query.subCategory = { $regex: filters.subCategory, $options: "i" };
    if (filters.itemName && filters.itemName.trim() !== "")
      query.itemName = { $regex: filters.itemName, $options: "i" };
    if (filters.itemDescription && filters.itemDescription.trim() !== "")
      query.itemDescription = { $regex: filters.itemDescription, $options: "i" };

    let result = [];

    if (filters.location === "store") {
      // Handle store assets
      if (!filters.assetType || filters.assetType === "") {
        // Fetch both Permanent and Consumable store assets
        const permanentAssets = await StorePermanent.find(query).lean();
        const consumableAssets = await StoreConsumable.find(query).lean();
        result = [...permanentAssets, ...consumableAssets].map((asset) => ({
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory || "N/A",
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          inStock: asset.inStock,
          itemIds: asset.itemIds || [],
        }));
      } else if (filters.assetType === "Permanent") {
        // Fetch Permanent store assets
        const assets = await StorePermanent.find(query).lean();
        result = assets.map((asset) => ({
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory || "N/A",
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          inStock: asset.inStock,
          itemIds: asset.itemIds || [],
        }));
      } else if (filters.assetType === "Consumable") {
        // Fetch Consumable store assets
        const assets = await StoreConsumable.find(query).lean();
        result = assets.map((asset) => ({
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory || "N/A",
          itemName: asset.itemName,
          itemDescription: asset.itemDescription,
          inStock: asset.inStock,
          itemIds: [],
        }));
      }
      // Filter by itemId if provided
      if (filters.itemId && filters.itemId.trim() !== "") {
        result = result
          .map((asset) => {
            const matchingItemIds = asset.itemIds.filter((id) =>
              id.includes(filters.itemId)
            );
            if (matchingItemIds.length > 0) {
              return { ...asset, itemIds: matchingItemIds };
            }
            return null;
          })
          .filter((asset) => asset !== null);
      }
    } else {
      // Handle issued assets
      const issueQuery = { ...query };
      if (filters.location && filters.location !== "all_issued" && filters.location.trim() !== "")
        issueQuery["issues.issuedTo"] = { $regex: filters.location, $options: "i" };
      if (filters.issuedDateFrom || filters.issuedDateTo) {
        issueQuery["issues.issuedDate"] = {};
        if (filters.issuedDateFrom) issueQuery["issues.issuedDate"].$gte = new Date(filters.issuedDateFrom);
        if (filters.issuedDateTo) issueQuery["issues.issuedDate"].$lte = new Date(filters.issuedDateTo);
      }
      if (filters.itemId && filters.itemId.trim() !== "")
        issueQuery["issues.issuedIds"] = { $elemMatch: { $regex: filters.itemId, $options: "i" } };

      // Fetch issued assets based on assetType
      let permanentAssets = [];
      let consumableAssets = [];
      if (!filters.assetType || filters.assetType === "") {
        permanentAssets = await IssuedPermanent.find(issueQuery).lean();
        consumableAssets = await IssuedConsumable.find(issueQuery).lean();
      } else if (filters.assetType === "Permanent") {
        permanentAssets = await IssuedPermanent.find(issueQuery).lean();
      } else if (filters.assetType === "Consumable") {
        consumableAssets = await IssuedConsumable.find(issueQuery).lean();
      }

      // Map issued assets to result format
      result = [...permanentAssets, ...consumableAssets].flatMap((asset) =>
        asset.issues
          .filter((issue) =>
            filters.location === "all_issued" || issue.issuedTo.match(new RegExp(filters.location, "i"))
          )
          .map((issue) => {
            let matchingIssuedIds = issue.issuedIds || [];
            if (filters.itemId && filters.itemId.trim() !== "") {
              matchingIssuedIds = issue.issuedIds.filter((id) =>
                id.includes(filters.itemId)
              );
              if (matchingIssuedIds.length === 0) return null;
            }
            return {
              assetType: asset.assetType,
              assetCategory: asset.assetCategory,
              subCategory: asset.subCategory || "N/A",
              itemName: asset.itemName,
              itemDescription: asset.itemDescription,
              location: issue.issuedTo || "N/A",
              quantityIssued: issue.quantity || 0,
              issuedDate: issue.issuedDate || null,
              issuedIds: matchingIssuedIds,
            };
          })
          .filter((issue) => issue !== null)
      );
    }

    // Send response with filtered results
    res.json(result);
  } catch (error) {
    console.error("Error filtering store/issue assets:", error);
    res.status(500).json({ message: "Error filtering store/issue assets" });
  }
};

/**
 * Controller to filter service and return assets
 * Retrieves assets from ReturnedPermanent, ReturnedConsumable, ExchangedConsumable, ServicedAsset, and BuildingMaintenance based on filters
 * @param {Object} req - Express request object with filter parameters in body
 * @param {Object} res - Express response object
 */
exports.filterServiceReturn = async (req, res) => {
  try {
    const {
      assetType,
      assetCategory,
      subCategory,
      itemName,
      location,
      condition,
      serviceDateFrom,
      serviceDateTo,
      serviceNo,
      serviceAmountFrom,
      serviceAmountTo,
      buildingNo,
    } = req.body;

    // Build base query
    let query = {};
    if (assetType) query.assetType = { $regex: assetType, $options: "i" };
    if (assetCategory) query.assetCategory = { $regex: assetCategory, $options: "i" };
    if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };
    if (itemName) query.itemName = { $regex: itemName, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };

    let result = [];
    let buildingMaintenanceResult = [];

    if (condition === "InService") {
      // Fetch assets in service
      query.status = "service";
      const inServiceAssets = await ReturnedPermanent.find(query);
      result = inServiceAssets.map((asset) => ({
        assetType: asset.assetType,
        assetCategory: asset.assetCategory,
        subCategory: asset.subCategory,
        itemName: asset.itemName,
        location: asset.location || "N/A",
        condition: "InService",
        itemId: asset.itemId,
        itemIds: asset.itemId ? [asset.itemId] : [],
        servicedEntry: asset.servicedEntry,
        servicedRejection: asset.servicedRejection,
        servicedRejectionRemarks: asset.servicedRejectionRemarks,
      }));
    } else if (condition === "Serviced") {
      // Fetch serviced assets
      let serviceQuery = { ...query };
      if (serviceNo) serviceQuery.serviceNo = { $regex: serviceNo, $options: "i" };
      if (serviceDateFrom || serviceDateTo) {
        serviceQuery.serviceDate = {};
        if (serviceDateFrom) serviceQuery.serviceDate.$gte = new Date(serviceDateFrom);
        if (serviceDateTo) serviceQuery.serviceDate.$lte = new Date(serviceDateTo);
      }
      if (serviceAmountFrom || serviceAmountTo) {
        serviceQuery.serviceAmount = {};
        if (serviceAmountFrom) serviceQuery.serviceAmount.$gte = Number(serviceAmountFrom);
        if (serviceAmountTo) serviceQuery.serviceAmount.$lte = Number(serviceAmountTo);
      }

      const servicedAssets = await ServicedAsset.find(serviceQuery);
      result = servicedAssets.map((asset) => ({
        assetType: asset.assetType,
        assetCategory: asset.assetCategory,
        subCategory: asset.subCategory,
        itemName: asset.itemName,
        location: "N/A",
        condition: "Serviced",
        itemIds: asset.itemIds || [],
        serviceNo: asset.serviceNo,
        serviceDate: asset.serviceDate,
        serviceAmount: asset.serviceAmount,
      }));
    } else if (condition === "Returned") {
      // Fetch returned assets
      const returnedPermanent = await ReturnedPermanent.find({ ...query, status: "returned" });
      const returnedConsumable = await ReturnedConsumable.find({ ...query, status: "returned" });
      result = [
        ...returnedPermanent.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: asset.location || "N/A",
          condition: "Returned",
          itemIds: asset.itemId ? [asset.itemId] : [],
          remark: asset.remark,
          approved: asset.approved,
        })),
        ...returnedConsumable.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: asset.location || "N/A",
          condition: "Returned",
          itemIds: [],
          returnedQuantity: asset.returnQuantity,
          remark: asset.remark,
          approved: asset.approved,
        })),
      ];
    } else if (condition === "Exchanged") {
      // Fetch exchanged consumable assets
      const exchangedConsumable = await ExchangedConsumable.find({ ...query, approved: "yes" });
      result = exchangedConsumable.map((asset) => ({
        assetType: asset.assetType,
        assetCategory: asset.assetCategory,
        subCategory: asset.subCategory || "N/A",
        itemName: asset.itemName,
        location: asset.location || "N/A",
        condition: "Exchanged",
        returnedQuantity: asset.returnedQuantity,
        exchangeDate: asset.exchangeDate,
        remark: asset.remark,
      }));
    } else {
      // Fetch all conditions except "dispose"
      const returnedPermanent = await ReturnedPermanent.find({
        ...query,
        status: { $ne: "dispose" },
      });
      const returnedConsumable = await ReturnedConsumable.find({
        ...query,
        status: { $ne: "dispose" },
      });
      const exchangedConsumable = await ExchangedConsumable.find({ ...query, approved: "yes" });
      const servicedAssets = await ServicedAsset.find(query);

      result = [
        ...returnedPermanent.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: asset.location || "N/A",
          condition: asset.status === "service" ? "InService" : "Returned",
          itemIds: asset.itemId ? [asset.itemId] : [],
          ...(asset.status === "service" && {
            servicedEntry: asset.servicedEntry,
            servicedRejection: asset.servicedRejection,
            servicedRejectionRemarks: asset.servicedRejectionRemarks,
          }),
          remark: asset.remark,
          approved: asset.approved,
        })),
        ...returnedConsumable.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: asset.location || "N/A",
          condition: "Returned",
          itemIds: [],
          returnedQuantity: asset.returnQuantity,
          remark: asset.remark,
          approved: asset.approved,
        })),
        ...exchangedConsumable.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory || "N/A",
          itemName: asset.itemName,
          location: asset.location || "N/A",
          condition: "Exchanged",
          returnedQuantity: asset.returnedQuantity,
          exchangeDate: asset.exchangeDate,
          remark: asset.remark,
        })),
        ...servicedAssets.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: "N/A",
          condition: "Serviced",
          itemIds: asset.itemIds || [],
          serviceNo: asset.serviceNo,
          serviceDate: asset.serviceDate,
          serviceAmount: asset.serviceAmount,
        })),
      ];
    }

    // Fetch building maintenance data if assetCategory is "Building"
    if (assetCategory === "Building") {
      let buildingQuery = { assetCategory: "Building" };
      if (subCategory) buildingQuery.subCategory = { $regex: subCategory, $options: "i" };
      if (buildingNo) buildingQuery.buildingNo = { $regex: buildingNo, $options: "i" };
      if (serviceDateFrom || serviceDateTo) {
        buildingQuery.yearOfMaintenance = {};
        if (serviceDateFrom) buildingQuery.yearOfMaintenance.$gte = new Date(serviceDateFrom);
        if (serviceDateTo) buildingQuery.yearOfMaintenance.$lte = new Date(serviceDateTo);
      }
      if (serviceAmountFrom || serviceAmountTo) {
        buildingQuery.cost = {};
        if (serviceAmountFrom) buildingQuery.cost.$gte = Number(serviceAmountFrom);
        if (serviceAmountTo) buildingQuery.cost.$lte = Number(serviceAmountTo);
      }

      // Fetch and map building maintenance data
      const buildingMaintenance = await BuildingMaintenance.find(buildingQuery);
      buildingMaintenanceResult = buildingMaintenance.map((building) => ({
        assetType: building.assetType,
        assetCategory: building.assetCategory,
        subCategory: building.subCategory,
        buildingNo: building.buildingNo,
        yearOfMaintenance: building.yearOfMaintenance,
        cost: building.cost,
        description: building.description,
        custody: building.custody,
        agency: building.agency,
      }));
    }

    // Send response with service/return and building maintenance results
    res.status(200).json({ serviceReturn: result, buildingMaintenance: buildingMaintenanceResult });
  } catch (error) {
    console.error("Error filtering service/return assets:", error);
    res.status(500).json({ message: "Error filtering service/return assets", error: error.message });
  }
};

/**
 * Controller to filter disposed assets
 * Retrieves DisposedAsset entries based on provided filters, separating building condemnation data
 * @param {Object} req - Express request object with filter parameters in body
 * @param {Object} res - Express response object
 */
exports.filterDisposal = async (req, res) => {
  try {
    const {
      assetType,
      assetCategory,
      subCategory,
      itemName,
      inspectionDateFrom,
      inspectionDateTo,
      condemnationDateFrom,
      condemnationDateTo,
      remark,
      purchaseValueFrom,
      purchaseValueTo,
      bookValueFrom,
      bookValueTo,
      disposalValueFrom,
      disposalValueTo,
    } = req.body;

    // Build query based on filters
    let query = {};
    if (assetType) query.assetType = { $regex: assetType, $options: "i" };
    if (assetCategory) query.assetCategory = { $regex: assetCategory, $options: "i" };
    if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };
    if (itemName) query.itemName = { $regex: itemName, $options: "i" };
    if (remark) query.remark = { $regex: remark, $options: "i" };
    if (inspectionDateFrom || inspectionDateTo) {
      query.inspectionDate = {};
      if (inspectionDateFrom) query.inspectionDate.$gte = new Date(inspectionDateFrom);
      if (inspectionDateTo) query.inspectionDate.$lte = new Date(inspectionDateTo);
    }
    if (condemnationDateFrom || condemnationDateTo) {
      query.condemnationDate = {};
      if (condemnationDateFrom) query.condemnationDate.$gte = new Date(condemnationDateFrom);
      if (condemnationDateTo) query.condemnationDate.$lte = new Date(condemnationDateTo);
    }
    if (purchaseValueFrom || purchaseValueTo) {
      query.purchaseValue = {};
      if (purchaseValueFrom) query.purchaseValue.$gte = Number(purchaseValueFrom);
      if (purchaseValueTo) query.purchaseValue.$lte = Number(purchaseValueTo);
    }
    if (bookValueFrom || bookValueTo) {
      query.bookValue = {};
      if (bookValueFrom) query.bookValue.$gte = Number(bookValueFrom);
      if (bookValueTo) query.bookValue.$lte = Number(bookValueTo);
    }
    if (disposalValueFrom || disposalValueTo) {
      query.disposalValue = {};
      if (disposalValueFrom) query.disposalValue.$gte = Number(disposalValueFrom);
      if (disposalValueTo) query.disposalValue.$lte = Number(disposalValueTo);
    }

    // Fetch disposed assets
    const assets = await DisposedAsset.find(query);

    // Separate disposal and building condemnation data
    const disposalData = assets.filter((asset) => asset.assetCategory !== "Building");
    const buildingCondemnationData = assets.filter((asset) => asset.assetCategory === "Building");

    // Send response with separated data
    res.status(200).json({
      disposal: disposalData,
      buildingCondemnation: buildingCondemnationData,
    });
  } catch (error) {
    console.error("Error filtering disposal assets:", error);
    res.status(500).json({ message: "Error filtering disposal assets" });
  }
};

/**
 * Controller to filter dead stock entries
 * Retrieves DeadStockRegister entries based on provided filters
 * @param {Object} req - Express request object with filter parameters in body
 * @param {Object} res - Express response object
 */
exports.filterDeadStock = async (req, res) => {
  try {
    const {
      assetType,
      assetCategory,
      subCategory,
      itemName,
      methodOfDisposal,
    } = req.body;

    // Build query based on filters
    const query = {};
    if (assetType) query.assetType = assetType;
    if (assetCategory) query.assetCategory = assetCategory;
    if (subCategory) query.assetSubCategory = subCategory;
    if (itemName) query.itemName = { $regex: itemName, $options: "i" };
    if (methodOfDisposal) query.methodOfDisposal = methodOfDisposal;

    // Fetch dead stock entries
    const deadStockItems = await DeadStockRegister.find(query);

    // Send response with filtered results
    res.status(200).json(deadStockItems);
  } catch (error) {
    console.error("Error filtering dead stock:", error);
    res.status(500).json({ message: "Failed to filter dead stock", error: error.message });
  }
};

/**
 * Controller to fetch all asset notifications
 * Retrieves all AssetNotification entries
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAssetNotification = async (req, res) => {
  try {
    // Fetch all asset notifications
    const data = await AssetNotification.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch asset notifications:", error);
    res.status(500).json({ message: "Failed to fetch asset notifications" });
  }
};

/**
 * Controller to delete a single asset notification by ID
 * Removes an AssetNotification entry by its ID
 * @param {Object} req - Express request object with notification ID in params
 * @param {Object} res - Express response object
 */
exports.deleteAssetNotificationbyId = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete notification by ID
    const deletedNotification = await AssetNotification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message
    });
  }
};

/**
 * Controller to delete all asset notifications
 * Removes all AssetNotification entries
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAllAssetNotifications = async (req, res) => {
  try {
    // Delete all notifications
    const deleteResult = await AssetNotification.deleteMany({});

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No notifications found to delete'
      });
    }

    // Send success response with deleted count
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} notifications`,
      data: deleteResult
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notifications',
      error: error.message
    });
  }
};

/**
 * Helper function to store asset notifications
 * Creates and saves an AssetNotification entry based on action type and data
 * @param {Object} data - Asset data to include in notification
 * @param {string} action - Action type (e.g., "asset approved", "issue rejected")
 * @param {Date} actionTime - Timestamp of the action
 * @returns {Object} Saved notification
 */
async function storeAssetNotification(data, action, actionTime) {
  try {
    // Extract item names from data
    const itemNames =
      Array.isArray(data.items) && data.items.every((item) => typeof item === "object")
        ? data.items.map((item) => item.itemName)
        : data.itemName;

    // Initialize base notification data
    const actionData = {
      assetType: data.assetType,
      assetCategory: data.assetCategory,
      action,
      actionTime,
      itemNames,
    };

    // Add action-specific data
    switch (action) {
      case "asset approved":
      case "asset rejected":
        Object.assign(actionData, {
          supplierName: data.supplierName,
          subCategory: data.subCategory,
          purchaseDate: data.purchaseDate,
          billNo: data.billNo,
          receivedBy: data.receivedBy,
        });
        if (action === "asset rejected") {
          actionData.rejectionRemarks = data.rejectionRemarks;
          actionData.rejectedAssetId = data.rejectedAssetId;
        }
        break;

      case "issue approved":
      case "issue rejected":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          quantity: data.quantity,
          location: data.issuedTo,
        });
        if (action === "issue rejected") {
          actionData.rejectionRemarks = data.rejectionRemarks;
          actionData.rejectedAssetId = data.rejectedAssetId;
        }
        break;

      case "service approved":
      case "service rejected":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          quantity: data.quantity,
        });
        if (action === "service rejected") {
          actionData.rejectionRemarks = data.rejectionRemarks;
          actionData.rejectedAssetId = data.rejectedAssetId;
        }
        break;

      case "exchange approved":
      case "exchange rejected":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          quantity: data.returnedQuantity,
        });
        break;

      case "return approved":
      case "return rejected":
      case "return approved with HOO waiting":
      case "return approved by HOO":
      case "return rejected by HOO":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          location: data.location,
          condition: data.status,
        });
        if (action === "return rejected" || action === "return rejected by HOO") {
          actionData.rejectionRemarks = data.rejectionRemarks;
          actionData.rejectedAssetId = data.rejectedAssetId || data._id;
        }
        break;

      case "asset disposal approved":
      case "asset disposal cancelled":
        Object.assign(actionData, { subCategory: data.subCategory });
        if (action === "asset disposal cancelled") {
          actionData.rejectionRemarks = data.rejectionRemarks || "Cancelled";
          actionData.rejectedAssetId = data.rejectedAssetId;
        }
        break;

      case "building disposal cancelled":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          rejectionRemarks: data.rejectionRemarks || "Cancelled",
          rejectedAssetId: data.rejectedAssetId,
        });
        break;

      case "condition changed":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          condition: data.oldCondition,
          changedCondition: data.condition,
          location: data.location,
        });
        break;

      case "asset updation approved":
      case "asset updation rejected":
        Object.assign(actionData, {
          subCategory: data.subCategory || (data.updatedData?.items?.[0]?.subCategory),
        });
        if (action === "asset updation rejected") {
          actionData.rejectionRemarks = data.rejectionRemarks;
          actionData.rejectedAssetId = data.rejectedAssetId;
        }
        break;

      case "building upgrade approved":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          location: data.location,
        });
        break;

      case "building upgrade rejected":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          location: data.location,
          rejectionRemarks: data.rejectionRemarks,
          rejectedAssetId: data.rejectedAssetId,
        });
        break;

      case "building maintenance approved":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          location: data.location,
        });
        break;

      case "building maintenance rejected":
        Object.assign(actionData, {
          subCategory: data.subCategory,
          location: data.location,
          rejectionRemarks: data.rejectionRemarks,
          rejectedAssetId: data.rejectedAssetId,
        });
        break;

      default:
        throw new Error("Invalid action type");
    }

    // Save notification
    const assetAction = new AssetNotification(actionData);
    await assetAction.save();

    return assetAction;
  } catch (error) {
    console.error("Error storing asset action:", error.message);
    throw error;
  }
};