const RejectedAsset = require("../model/RejectedAsset");
const PurchasedPermanent = require("../model/PermanentAsset");
const StoreReturn = require("../model/StoreReturn")
const PurchasedConsumable = require("../model/ConsumableAsset");
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
const TempDispose = require("../model/tempDispose");
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
const fs = require("fs").promises;
const path = require("path");
const mongoose = require('mongoose');
const port = process.env.PORT
const ip = process.env.IP
const serverBaseUrl = `http://${ip}:${port}`;
exports.storeTempAsset = async (req, res) => {
  try {
    const {
      assetType, assetCategory, entryDate, purchaseDate, supplierName,
      supplierAddress, source, modeOfPurchase, billNo, receivedBy, items,
      billPhotoUrl, subCategory, location, type, buildingNo, approvedEstimate, plinthArea,
      status, dateOfConstruction, costOfConstruction, remarks,
      dateOfPossession, controllerOrCustody, details, approvedBuildingPlanUrl,
      kmzOrkmlFileUrl
    } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set to start of tomorrow

    // Required field validation
    if (!assetType) throw new Error("Asset Type is required");
    if (!assetCategory) throw new Error("Asset Category is required");
    if (!entryDate) throw new Error("Entry Date is required");
    if (new Date(entryDate) >= tomorrow) throw new Error("Entry Date cannot be tomorrow or in the future"); // Modified condition

    let assetData = {};

    // Building-specific validation
    if (assetCategory === "Building") {
      if (!subCategory) throw new Error("Building Sub Category is required");
      if (!buildingNo) throw new Error("Building No is required");
      if (dateOfConstruction && new Date(dateOfConstruction) > today) throw new Error("Date of Construction cannot be in the future");

      assetData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        type: type || undefined,
        buildingNo,
        approvedEstimate: approvedEstimate ? Number(approvedEstimate) : undefined,
        plinthArea: plinthArea ,
        status,
        dateOfConstruction: dateOfConstruction || undefined,
        costOfConstruction: costOfConstruction ? Number(costOfConstruction) : undefined,
        remarks: remarks || undefined,
        approvedBuildingPlanUrl: approvedBuildingPlanUrl || undefined,
        kmzOrkmlFileUrl: kmzOrkmlFileUrl || undefined
      };
    }
    // Land-specific validation
    else if (assetCategory === "Land") {
      if (!subCategory) throw new Error("Land Sub Category is required");
      if (dateOfPossession && new Date(dateOfPossession) > today) throw new Error("Date of Possession cannot be in the future");

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
    // Other asset categories (Permanent/Consumable items)
    else {
      if (!purchaseDate) throw new Error("Purchase Date is required");
      if (new Date(purchaseDate) >= today) throw new Error("Purchase Date cannot be in the future");

      const parsedItems = items ? JSON.parse(items) : [];
      if (parsedItems.length === 0) throw new Error("At least one item is required");

      // Item-specific validation
      for (const item of parsedItems) {
        if (!item.itemName) throw new Error("Item Name is required in one or more items");
        if (!item.itemDescription) throw new Error(`Item ${item.itemName}: Item Description is required`);

        const quantityReceived = Number(item.quantityReceived);
        const unitPrice = Number(item.unitPrice);

        if (!quantityReceived || quantityReceived <= 0) throw new Error(`Item ${item.itemName}: Quantity Received must be greater than 0`);
        if (!unitPrice || unitPrice <= 0) throw new Error(`Item ${item.itemName}: Unit Price must be greater than 0`);

        if (assetType === "Permanent" && item.itemIds && item.itemIds.length !== quantityReceived) throw new Error(`Item ${item.itemName}: Number of Item IDs must match Quantity Received`);
        if (assetType === "Permanent" && item.itemIds && item.itemIds.some(id => !id)) throw new Error(`Item ${item.itemName}: All Item IDs must be provided`);

        // AMC date validation
        if (item.amcFromDate && item.amcToDate) {
          const fromDate = new Date(item.amcFromDate);
          const toDate = new Date(item.amcToDate);
          if (fromDate > toDate) {
            throw new Error(`AMC From Date (${item.amcFromDate}) cannot be later than AMC To Date (${item.amcToDate}) for item: ${item.itemName}`);
          }
        }

        // Check for duplicate itemIds
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

    const filteredAssetData = Object.fromEntries(
      Object.entries(assetData).filter(([_, value]) => value !== undefined)
    );

    const newAsset = new TempAsset(filteredAssetData);
    const savedAsset = await newAsset.save();

    res.status(201).json({
      success: true,
      message: `${assetCategory || "Asset"} saved successfully`,
      data: savedAsset,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message).join(", ");
      res.status(400).json({
        success: false,
        message: messages,
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
};

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await TempAsset.find();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assets", error });
  }
};

exports.getAllPermanentAssets = async (req, res) => {
  try {
    const assets = await Permanent.find();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching permanent assets", error });
  }
};


exports.getPermanentAssetById = async (req, res) => {
  try {
    const asset = await Permanent.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Permanent asset not found" });
    }
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching permanent asset", error });
  }
};

// Update permanent asset
exports.updatePermanentAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAsset = await Permanent.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedAsset) {
      return res.status(404).json({ message: "Permanent asset not found" });
    }
    res.status(200).json(updatedAsset);
  } catch (error) {
    res.status(500).json({ message: "Error updating permanent asset", error });
  }
};

exports.getAllConsumableAssets = async (req, res) => {
  try {
    const assets = await Consumable.find();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching consumable assets", error });
  }
};


// Get single consumable asset
exports.getConsumableAssetById = async (req, res) => {
  try {
    const asset = await Consumable.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Consumable asset not found" });
    }
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching consumable asset", error });
  }
};


// Update consumable asset
exports.updateConsumableAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAsset = await Consumable.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedAsset) {
      return res.status(404).json({ message: "Consumable asset not found" });
    }
    res.status(200).json(updatedAsset);
  } catch (error) {
    res.status(500).json({ message: "Error updating consumable asset", error });
  }
};


exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(200).json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload file" });
  }
};

exports.uploadInvoice = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const imageUrl = `http://${ip}:${port}/${filePath}`;

  res.json({ imageUrl });
};
exports.uploadSignedReturnedReceipt = async (req, res) => {
  const { assetId, assetType, itemIds } = req.body;
  console.log("en")
  try {
    if (!req.file || !assetId || !assetType) {
      return res.status(400).json({ success: false, message: "Signed PDF, asset ID, and asset type are required" });
    }

    const serverBaseUrl = process.env.SERVER_BASE_URL || `http://${ip}:${port}`;
    const signedPdfUrl = `${serverBaseUrl}/uploads/${req.file.filename}`;
    console.log(assetId)
    console.log(itemIds)
    if (itemIds) {
      const parsedItemIds = JSON.parse(itemIds);
      const storeReturn = await StoreReturn.findOne({
        itemIds: { $all: parsedItemIds },
      });
      if (!storeReturn) {
        console.log("not")
        return res.status(404).json({ success: false, message: "Store return entry not found" });
      }

      storeReturn.signedPdfUrl = signedPdfUrl;
      await storeReturn.save();
      console.log("saved")
      res.status(200).json({ success: true, signedPdfUrl, storeReturnId: storeReturn._id });
    } else {
      // Handle returned-sourced or Consumable assets
      const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
      const asset = await ReturnedModel.findByIdAndUpdate(
        assetId,
        { signedPdfUrl },
        { new: true }
      );
      if (!asset) {
        console.log("nottt")
        return res.status(404).json({ success: false, message: "Asset not found" });
      }

      res.status(200).json({ success: true, signedPdfUrl });
    }
  } catch (error) {
    console.log(error);
    console.error("Error uploading signed receipt:", error);
    res.status(500).json({ success: false, message: "Failed to upload signed receipt" });
  }
};
exports.getStoreItems = async (req, res) => {
  try {
    const { assetType, assetCategory } = req.body;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const items = await StoreModel.find({ assetCategory });
    res.status(200).json({ items });
  } catch (error) {
    console.error("Failed to fetch store items:", error);
    res.status(500).json({ message: "Failed to fetch store items" });
  }
};

exports.checkInStock = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, itemDescription } = req.body;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const storeItem = await StoreModel.findOne({ itemName, itemDescription, assetCategory });
    res.status(200).json({ inStock: storeItem ? storeItem.inStock : 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to check in-stock quantity" });
  }
};


exports.getAvailableIds = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    res.status(200).json({ itemIds: (assetType === "Permanent" && storeItem) ? storeItem.itemIds : [] });
  } catch (error) {
    console.error("Failed to fetch available IDs:", error);
    res.status(500).json({ message: "Failed to fetch available IDs" });
  }
};


exports.getIssuedIds = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, location } = req.body;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;
    const issuedItem = await IssuedModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    const issue = issuedItem?.issues.find(issue => issue.issuedTo === location);
    res.status(200).json({
      issuedIds: (assetType === "Permanent" && issue) ? issue.issuedIds : [],
      quantity: issue ? issue.quantity : 0
    });
  } catch (error) {
    console.error("Failed to fetch issued IDs:", error);
    res.status(500).json({ message: "Failed to fetch issued IDs" });
  }
};



exports.getStoreItemDetails = async (req, res) => {
  try {
    const { itemId } = req.body;

    // Validate input
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    // Fetch the purchase record containing the itemId in items.itemIds
    const purchaseRecord = await Permanent.findOne({ "items.itemIds": itemId })
      .sort({ purchaseDate: -1 }) // Get the latest purchase
      .select("items"); // Only fetch the items array to optimize

    if (!purchaseRecord) {
      return res.status(404).json({ message: "No purchase record found for this itemId", unitPrice: 0 });
    }

    // Find the specific item within the items array that contains the itemId
    const item = purchaseRecord.items.find((i) => i.itemIds && i.itemIds.includes(itemId));

    if (!item) {
      return res.status(404).json({ message: "Item with this itemId not found in purchase record", unitPrice: 0 });
    }

    res.status(200).json({ unitPrice: item.unitPrice || 0 });
  } catch (error) {
    console.error("Failed to fetch store item details:", error);
    res.status(500).json({ message: "Failed to fetch store item details", error: error.message });
  }
};



exports.getStoreConsumableAssets = async (req, res) => {
  try {
    const { year } = req.query;
    const consumableAssetCategories = [
      "Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items",
      "Sanitory Items", "Sports Goods", "Beds and Pillows", "Instruments"
    ];
    const categoryMapping = consumableAssetCategories.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});
    let result;
    const categoryCount = consumableAssetCategories.length;
    if (year === "all") {
      result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 2024-2035
    } else {
      result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 12 months
    }
    const assets = await StoreConsumable.find({});
    // console.log("Fetched StoreConsumable assets:", assets);
    assets.forEach((asset) => {
      const category = asset.assetCategory;
      const createdDate = asset.createdAt ? new Date(asset.createdAt) : new Date(); // Fallback to current date
      if (categoryMapping.hasOwnProperty(category)) {
        const categoryIndex = categoryMapping[category];
        const inStock = asset.inStock || 0;
        if (year === "all") {
          const yearIndex = createdDate.getFullYear() - 2024; // Start from 2024
          if (yearIndex >= 0 && yearIndex < 12) {
            result[yearIndex][categoryIndex] += inStock;
          }
        } else if (createdDate.getFullYear() === parseInt(year)) {
          const monthIndex = createdDate.getMonth();
          result[monthIndex][categoryIndex] += inStock;
        }
      }
    });
    // console.log("Resulting data array:", result); // Debug log
    res.status(200).json({
      data: result,
      categories: consumableAssetCategories
    });
  } catch (error) {
    console.error("Error fetching store consumable assets:", error);
    res.status(500).json({ error: "Error fetching store consumable assets: " + error.message });
  }
};


exports.updateDeadStockQuantities = async (req, res) => {
  try {
    const deadStockItems = await DeadStockRegister.find();

    for (const item of deadStockItems) {
      let servicableQuantity = 0;
      let overallQuantity = 0;

      if (item.assetType === "Permanent") {
        // Calculate overall quantity from Permanent model (case-insensitive)
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

        // Calculate serviceable quantity from ReturnedPermanent (case-insensitive)
        const serviceablePermanent = await ReturnedPermanent.find({
          itemName: { $regex: new RegExp(`^${item.itemName}$`, "i") },
          itemDescription: { $regex: new RegExp(`^${item.itemDescription}$`, "i") },
          approved: "yes",
          status: "service",
        });
        servicableQuantity = serviceablePermanent.length; // Number of serviceable documents
      } else if (item.assetType === "Consumable") {
        // Calculate overall quantity from Consumable model (case-insensitive)
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

        // Calculate serviceable quantity from ReturnedConsumable (case-insensitive)
        const serviceableConsumable = await ReturnedConsumable.find({
          itemName: { $regex: new RegExp(`^${item.itemName}$`, "i") },
          itemDescription: { $regex: new RegExp(`^${item.itemDescription}$`, "i") },
          approved: "yes",
          status: "service",
        });
        servicableQuantity = serviceableConsumable.reduce((sum, doc) => sum + (doc.returnQuantity || 0), 0);
      }

      // Update the DeadStockRegister document with both quantities
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

    res.status(200).json({ message: "Dead stock quantities updated successfully" });
  } catch (error) {
    console.error("Error updating dead stock quantities:", error);
    res.status(500).json({ message: "Failed to update dead stock quantities", error: error.message });
  }
};


exports.issue = async (req, res) => {
  try {
    const {
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      issuedTo,
      location, // New field
      quantity,
      issuedIds,
      acknowledged,
      pdfBase64,
    } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ message: "PDF data is required" });
    }

    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const parsedQuantity = parseInt(quantity, 10);
    let parsedIssuedIds = assetType === "Permanent" && issuedIds ? JSON.parse(issuedIds) : undefined;

    const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    if (!storeItem || storeItem.inStock < parsedQuantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    if (assetType === "Permanent") {
      if (!parsedIssuedIds || !Array.isArray(parsedIssuedIds) || !parsedIssuedIds.every((id) => storeItem.itemIds.includes(id))) {
        return res.status(400).json({ message: "Some issued IDs are not in stock" });
      }
    }

    storeItem.inStock -= parsedQuantity;
    if (assetType === "Permanent") {
      storeItem.itemIds = storeItem.itemIds.filter((id) => !parsedIssuedIds.includes(id));
    }
    await storeItem.save();

    const filename = `pdf-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    const pdfPath = path.join(__dirname, "../uploads", filename);
    await fs.writeFile(pdfPath, Buffer.from(pdfBase64, "base64"));
    const pdfUrl = `${serverBaseUrl}/uploads/${filename}`;

    const tempIssue = new TempIssue({
      assetType,
      assetCategory,
      itemName,
      subCategory: subCategory || "",
      itemDescription,
      issuedTo,
      location, // New field
      quantity: parsedQuantity,
      issuedIds: parsedIssuedIds,
      pdfUrl,
      acknowledged: acknowledged || "no",
    });

    await tempIssue.save();
    res.status(201).json({ message: "Receipt stored successfully", pdfUrl });
  } catch (error) {
    console.error("Failed to store temp issue:", error);
    res.status(500).json({ message: "Failed to store receipt" });
  }
};


exports.getTempIssues = async (req, res) => {
  try {
    const tempIssues = await TempIssue.find();
    res.status(200).json(tempIssues);
  } catch (error) {
    console.error("Failed to fetch temp issues:", error);
    res.status(500).json({ message: "Failed to fetch temp issues" });
  }
};


exports.getAcknowledgedTempIssues = async (req, res) => {
  try {
    const tempIssues = await TempIssue.find({ acknowledged: "yes", rejected: "no" });
    res.status(200).json(tempIssues);
  } catch (error) {
    console.error("Failed to fetch acknowledged temp issues:", error);
    res.status(500).json({ message: "Failed to fetch acknowledged temp issues" });
  }
};
exports.acknowledgeTempIssue = async (req, res) => {
  try {
    // Multer will throw an error if the file is invalid, so we check req.file first
    if (!req.file) {
      return res.status(400).json({ message: "A valid PDF, JPEG, or PNG file is required" });
    }

    const { tempIssueId } = req.body;
    const signedPdfUrl = `${serverBaseUrl}/uploads/${req.file.filename}`;
    const tempIssue = await TempIssue.findById(tempIssueId);

    if (!tempIssue) {
      return res.status(404).json({ message: "Temp issue not found" });
    }

    tempIssue.signedPdfUrl = signedPdfUrl;
    tempIssue.acknowledged = "yes";
    await tempIssue.save();

    res.status(200).json({ message: "Receipt acknowledged successfully", signedPdfUrl });
  } catch (error) {
    console.error("Failed to acknowledge temp issue:", error);
    if (error.message === "Only PDF, JPEG, and PNG files are allowed!") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to acknowledge receipt" });
  }
};


exports.return = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, location, returnQuantity,  returnIds } = req.body;

    // Validate assetType
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ message: "Valid asset type (Permanent or Consumable) is required" });
    }

    // Select models based on assetType
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    // Validate required fields
    if (!assetCategory || !itemName || !itemDescription || !location || !returnQuantity ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Find the issued item
    const query = { assetCategory, itemName, itemDescription };
    if (assetType === "Permanent") {
      query.subCategory = subCategory; // Only include subCategory for Permanent
    }
    const issuedItem = await IssuedModel.findOne(query);
    if (!issuedItem) {
      return res.status(400).json({ message: "Item not found in issued records" });
    }

    // Find the specific issue record for the location
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
    // Handle all conditions by adding to Returned collection with approval pending
    if (assetType === "Permanent") {
      // Create a separate ReturnedPermanent document for each returnId
      for (const returnId of returnIds) {
        const newReturned = new ReturnedModel({
          assetType,
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          location,
          itemId: returnId, // Single ID for Permanent
          approved: null, // Pending approval
        });
        await newReturned.save();
      }
    } else {
      // For Consumable, create a single ReturnedConsumable document with quantity
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

    res.status(201).json({ message: "Items returned successfully, pending approval" });
  } catch (error) {
    console.error("Failed to return items:", error);
    res.status(500).json({ message: "Failed to return items" });
  }
};

exports.storeReturnedReceipt = async (req, res) => {
  const { assetId, pdfBase64, assetType, itemIds, assetCategory, itemName, subCategory, itemDescription, source, returnedQuantity } = req.body;

  try {
    if (!assetId || !pdfBase64 || !assetType) {
      return res.status(400).json({ success: false, message: "Asset ID, PDF data, and asset type are required" });
    }

    const filename = `returned-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    const pdfPath = path.join(__dirname, "../Uploads", filename);
    await fs.mkdir(path.dirname(pdfPath), { recursive: true });
    await fs.writeFile(pdfPath, Buffer.from(pdfBase64, "base64"));

    const serverBaseUrl = process.env.SERVER_BASE_URL || `http://${ip}:${port}`;
    const pdfUrl = `${serverBaseUrl}/uploads/${filename}`;

    if (source === "store") {
      let storeReturn;

      if (assetType === "Permanent" && itemIds) {
        // Check for existing StoreReturn with any of the itemIds
        storeReturn = await StoreReturn.findOne({
          itemIds: { $in: itemIds },
          assetType,
          originalStoreId: assetId,
        });

        if (storeReturn) {
          // Update existing StoreReturn
          storeReturn.pdfUrl = pdfUrl;
          storeReturn.signedPdfUrl = null; // Reset signedPdfUrl to require new upload
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
        // Check for existing StoreReturn with matching fields
        storeReturn = await StoreReturn.findOne({
          assetType,
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          originalStoreId: assetId,
        });

        if (storeReturn) {
          // Update existing StoreReturn
          storeReturn.pdfUrl = pdfUrl;
          storeReturn.signedPdfUrl = null; // Reset signedPdfUrl
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

      res.status(201).json({ success: true, pdfUrl, storeReturnId: storeReturn._id });
    } else {
      // Handle returned-sourced assets
      const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
      const asset = await ReturnedModel.findByIdAndUpdate(
        assetId,
        { pdfUrl },
        { new: true }
      );

      if (!asset) {
        return res.status(404).json({ success: false, message: "Asset not found" });
      }

      res.status(201).json({ success: true, pdfUrl });
    }
  } catch (error) {
    console.error("Error storing receipt:", error);
    res.status(500).json({ success: false, message: "Failed to store receipt" });
  }
};
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
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ message: "Invalid asset type" });
    }

    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

    if (source === "store") {
      // Handle store-sourced assets
      const storeReturn = await StoreReturn.findById(_id);
      if (!storeReturn) {
        return res.status(404).json({ message: "Store return entry not found" });
      }

      const storeItem = await StoreModel.findById(storeReturn.originalStoreId);
      if (!storeItem) {
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

        // Remove itemIds from Store
        storeItem.itemIds = storeItem.itemIds.filter((id) => !itemIds.includes(id));
        storeItem.inStock -= itemIds.length;
        await storeItem.save();

        // Delete StoreReturn entry
        await StoreReturn.deleteOne({ _id });

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

        // Update Store stock
        storeItem.inStock -= returnedQuantity;
        await storeItem.save();

        // Delete StoreReturn entry
        await StoreReturn.deleteOne({ _id });

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

      res.status(200).json({
        message: "Returned status submitted for approval",
        asset: updatedAsset,
      });
    }
  } catch (error) {
    console.error("Failed to save returned status:", error);
    res.status(500).json({ message: "Failed to save returned status", error: error.message });
  }
};

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

    // Update the ReturnedPermanent document
    const updatedAsset = await ReturnedPermanent.updateOne(
      { _id },
      { $set: { status } }
    );

    // Check if the document was found and updated
    if (updatedAsset.matchedCount === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json({ message: `Asset status updated to ${status}` });
  } catch (error) {
    console.error("Failed to update asset status:", error);
    res.status(500).json({ message: "Failed to update asset status" });
  }
};


exports.getReturnedAssets = async (req, res) => {
  try {
    const { assetType, assetCategory, status } = req.body;
    console.log(assetType,assetCategory,status)
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ message: "Invalid assetType. Must be 'Permanent' or 'Consumable'." });
    }

    const Model = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const query = { assetType, status };
    if (assetCategory) {
      query.assetCategory = assetCategory;
    }

    const returnedAssets = await Model.find(query);
    console.log(returnedAssets)

    res.status(200).json(returnedAssets);
  } catch (error) {
    console.error("Failed to fetch returned assets:", error);
    res.status(500).json({ message: "Failed to fetch returned assets" });
  }
};

exports.getStoreItemsForReturn = async (req, res) => {
  try {
    const { assetType, assetCategory } = req.body;
    console.log("asbh")
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({
        message: "Invalid assetType. Must be 'Permanent' or 'Consumable'.",
      });
    }

    const Model = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const query = {};
    if (assetCategory) {
      query.assetCategory = assetCategory;
    }

    const storeItems = await Model.find(query);

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
    res.status(500).json({ message: "Failed to fetch store items" });
  }
};


exports.getReturnedForApproval = async (req, res) => {
  const { assetType } = req.query;

  try {
    const Model = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    // Find assets where approved is null and status is not "returned" (case insensitive)
    const assets = await Model.find({
      approved: null,
      status: {
        $ne: "returned",
        $not: /^returned$/i // Additional check for case insensitivity or typos
      },
      hooapproval: { $ne: "waiting" } // Exclude assets with hooapproval set to "waiting"
    });

    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching returned assets for approval:", error);
    res.status(500).json({ message: "Failed to fetch returned assets" });
  }
};


exports.getReturnedForConditionChange = async (req, res) => {
  const { assetType, approved } = req.query;

  try {
    // Validate assetType
    if (!["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Invalid asset type. Must be 'Permanent' or 'Consumable'." });
    }

    // Select the appropriate model
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    // Fetch assets with approved: "yes"
    const query = approved ? { approved } : {};
    const assets = await ReturnedModel.find(query);

    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching returned assets for condition change:", error);
    res.status(500).json({ success: false, message: "Failed to fetch returned assets", error: error.message });
  }
};



exports.updateReturnCondition = async (req, res) => {
  const { id } = req.params; // Asset ID from URL
  const { condition, assetType } = req.body;


  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid asset ID" });
    }
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type (Permanent or Consumable) is required" });
    }

    const validConditions = assetType === "Permanent"
      ? ["Good", "service", "dispose"]
      : ["Good", "exchange", "dispose"];

    if (!condition || !validConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: `Valid condition (${validConditions.join(", ")}) is required for ${assetType} assets`,
      });
    }

    // Start a transaction


    try {
      // Select the appropriate model
      const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
      const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

      // Find the returned asset
      const returnedAsset = await ReturnedModel.findById(id);
      if (!returnedAsset) {

        return res.status(404).json({ success: false, message: `Returned ${assetType} asset not found` });
      }

      if (condition === "Good") {
        // For Permanent assets
        if (assetType === "Permanent") {
          // Find the item in StorePermanent
          const storeItem = await StoreModel.findOne({
            itemName: returnedAsset.itemName,
            assetCategory: returnedAsset.assetCategory,
            subCategory: returnedAsset.subCategory
          });

          if (storeItem) {
            // Add the item ID back to stock
            storeItem.itemIds.push(returnedAsset.itemId);
            storeItem.inStock += 1;
            await storeItem.save();
          } else {
            // Create new entry if not found (shouldn't normally happen)
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
        // For Consumable assets
        else {
          const storeItem = await StoreModel.findOne({
            itemName: returnedAsset.itemName,
            assetCategory: returnedAsset.assetCategory,
            subCategory: returnedAsset.subCategory
          });

          if (storeItem) {
            // Increase the stock quantity
            storeItem.inStock += returnedAsset.returnQuantity || 1;
            await storeItem.save();
          } else {
            // Create new entry if not found
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


        return res.status(200).json({
          success: true,
          message: "Asset condition is Good. Asset has been moved back to stock.",
        });
      }
      else {
        // For other conditions (service, dispose, exchange)
        returnedAsset.status = condition;
        await returnedAsset.save();

    

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
    res.status(500).json({
      success: false,
      message: "Failed to update condition",
      error: error.message,
    });
  }
};

exports.updateReturnConditiontemp = async (req, res) => {
  const { id } = req.params; // Asset ID from URL
  const { condition, assetType } = req.body;


  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid asset ID" });
    }
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type (Permanent or Consumable) is required" });
    }

    const validConditions = assetType === "Permanent"
      ? ["Good", "service", "dispose"]
      : ["Good", "exchange", "dispose"];

    if (!condition || !validConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: `Valid condition (${validConditions.join(", ")}) is required for ${assetType} assets`,
      });
    }

    // Start a transaction
 

    try {
      // Select the appropriate model
      const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

      // Find the returned asset
      const returnedAsset = await ReturnedModel.findById(id);
      if (!returnedAsset) {
      
        return res.status(404).json({ success: false, message: `Returned ${assetType} asset not found` });
      }

      const oldCondition = returnedAsset.status;
      // For other conditions (service, dispose, exchange)
      returnedAsset.status = condition;
      await returnedAsset.save();

    

      // notification
      const temp = {
        ...returnedAsset.toObject(),
        oldCondition,
        condition
      };

      storeAssetNotification(temp, 'condition changed', new Date());

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
    res.status(500).json({
      success: false,
      message: "Failed to update condition",
      error: error.message,
    });
  }
};


exports.getIssuedLocations = async (req, res) => {
  const { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;
  try {
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type is required" });
    }
    if (!assetCategory || !itemName || !itemDescription) {
      return res.status(400).json({ success: false, message: "All required asset details are missing" });
    }

    const Model = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;
    const query = {
      assetType,
      assetCategory,
      itemName,
      itemDescription,
    };
    if (assetType === "Permanent" && subCategory) {
      query.subCategory = subCategory;
    }

    const issuedRecords = await Model.find(query);
    const locations = [...new Set(issuedRecords.flatMap(record => record.issues.map(issue => issue.issuedTo)))];

    res.status(200).json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching issued locations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch issued locations" });
  }
};


exports.saveServiced = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemIds, serviceNo, serviceDate, serviceAmount } = req.body;

    // Create new temporary service entry
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

    if (assetType === "Permanent") {
      await ReturnedPermanent.updateMany( // Changed from updateOne to updateMany
        {
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          itemId: { $in: itemIds }, // Match all documents where itemId is in itemIds array
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

    res.status(201).json({
      success: true,
      message: "Service request saved for approval",
      data: newTempService,
    });
  } catch (error) {
    console.error("Failed to save service request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save service request",
      error: error.message,
    });
  }
};



exports.saveMaintenance = async (req, res) => {
  try {
    const { assetType, assetCategory, buildingNo, yearOfMaintenance, cost, description, custody, agency } = req.body;
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
    res.status(201).json({ message: "Building maintenance saved successfully" });
  } catch (error) {
    console.error("Failed to save maintenance:", error);
    res.statusrealty500.json({ message: "Failed to save maintenance" });
  }
};




exports.saveMaintenanceTemp = async (req, res) => {
  try {
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
      enteredBy, // Added from frontend
    } = req.body;

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
    res.status(201).json({ message: "Building maintenance submitted for approval" });
  } catch (error) {
    console.error("Failed to save temporary maintenance:", error);
    res.status(500).json({ message: "Failed to submit maintenance for approval" });
  }
};

// Fetch all pending maintenance entries for admin approval
exports.getPendingMaintenance = async (req, res) => {
  try {
    const pendingMaintenance = await TempBuildingMaintenance.find({ status: "pending" });
    res.status(200).json({ data: pendingMaintenance });
  } catch (error) {
    console.error("Failed to fetch pending maintenance:", error);
    res.status(500).json({ message: "Failed to fetch pending maintenance" });
  }
};


exports.getServicableItems = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, itemDescription } = req.body;
    // Fetch items from ReturnedPermanent where status is "service"
    const servicableItems = await ReturnedPermanent.find({
      assetType,
      assetCategory,
      itemName,
      itemDescription,
      status: "service",
      approved: "yes",
      $or: [{ servicedEntry: "no" }, { servicedEntry: null }],    });
    const itemIds = servicableItems.map(item => item.itemId);

    res.status(200).json({ itemIds });
  } catch (error) {
    console.error("Failed to fetch servicable items:", error);
    res.status(500).json({ message: "Failed to fetch servicable items" });
  }
};

exports.getTempServiced = async (req, res) => {
  try {
    const tempServicedAssets = await TempServiced.find();
    res.status(200).json(tempServicedAssets);
  } catch (error) {
    console.error("Error fetching temp serviced assets:", error);
    res.status(500).json({ message: "Failed to fetch temp serviced assets" });
  }
};


exports.requestDisposal = async (req, res) => {
  try {
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
      methodOfDisposal, // New field
    } = req.body;

    if (!methodOfDisposal || !["Sold", "Auctioned", "Destroyed", "Other"].includes(methodOfDisposal)) {
      return res.status(400).json({ message: "Method of Disposal is required and must be one of: Sold, Auctioned, Destroyed, Other" });
    }

    if (assetCategory === "Building") {
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
        methodOfDisposal, // Add to Building disposal
      });
      await newDisposed.save();

      res.status(201).json({ message: "Building disposal request created successfully" });
    } else {
      let availableQuantity = 0;
      if (assetType === "Consumable") {
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
        methodOfDisposal, // Add to non-Building disposal
      });
      await newDisposed.save();

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

      res.status(201).json({ message: "Disposal request created successfully" });
    }
  } catch (error) {
    console.error("Failed to create disposal request:", error);
    res.status(500).json({ message: "Failed to create disposal request", error: error.message });
  }
};


exports.getDisposableItems = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;

    // Fetch items from ReturnedPermanent with status "dispose"
    const disposableItems = await ReturnedPermanent.find({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      status: "dispose",
      approved: "yes"
    });

    // Extract itemIds from the matching documents
    const itemIds = disposableItems.map(item => item.itemId);

    res.status(200).json({ itemIds });
  } catch (error) {
    console.error("Failed to fetch disposable items:", error);
    res.status(500).json({ message: "Failed to fetch disposable items" });
  }
};



exports.getTempDisposeAssets = async (req, res) => {
  try {
    const tempDisposeAssets = await TempDispose.find();
    res.status(200).json(tempDisposeAssets);
  } catch (error) {
    console.error("Failed to fetch TempDispose assets:", error);
    res.status(500).json({ message: "Failed to fetch disposal assets" });
  }
};


exports.getAvailableDisposableQuantity = async (req, res) => {
  try {
    // Trim input fields to remove extra spaces
    let { assetType, assetCategory, itemName, subCategory, itemDescription } = req.body;
    assetType = assetType?.trim();
    assetCategory = assetCategory?.trim();
    itemName = itemName?.trim();
    subCategory = subCategory?.trim();
    itemDescription = itemDescription?.trim();

    // Log trimmed request body for debugging

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

      // Log returned items count

      // Fetch unit price from Consumable collection using aggregation to trim fields
      const consumablePipeline = [
        { $match: { assetCategory: assetCategory || { $exists: true } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.itemName": { $regex: `^${itemName}$`, $options: "i" }, // Case-insensitive, exact match
            ...(subCategory && { "items.subCategory": { $regex: `^${subCategory}$`, $options: "i" } }),
            ...(itemDescription && { "items.itemDescription": { $regex: `^${itemDescription}$`, $options: "i" } }),
          },
        },
        { $sort: { createdAt: -1 } }, // Most recent first
        { $limit: 1 },
        {
          $project: {
            unitPrice: "$items.unitPrice",
          },
        },
      ];

      const consumableResult = await Consumable.aggregate(consumablePipeline);
      const purchaseValue = consumableResult[0]?.unitPrice || 0;

      // Log aggregation result

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

      // Log returned items count

      // Fetch unit price from Permanent collection using aggregation to trim fields
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

      // Log aggregation result

      return res.status(200).json({
        availableQuantity,
        itemIds,
        purchaseValue,
      });
    }
  } catch (error) {
    console.error("Failed to fetch available quantity:", error);
    res.status(500).json({ message: "Failed to fetch available quantity" });
  }
};

exports.disposeAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await TempDispose.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found in TempDispose" });
    }

    // Always save to DisposedAsset (for both Building and non-Building)
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

    const disposedAsset = new DisposedAsset(disposedAssetData);
    await disposedAsset.save();

    if (asset.assetCategory === "Building") {
      // Building-specific handling (already saved to DisposedAsset above)
      // No additional logic needed here
    } else {
      // Handle non-building disposal (store in DeadStockRegister)
      const { assetType, assetCategory, subCategory, itemName, itemDescription, quantity, itemIds, remark, methodOfDisposal } = asset;

      // Check if entry exists in DeadStockRegister
      let deadStockEntry = await DeadStockRegister.findOne({
        assetType,
        assetCategory,
        assetSubCategory: subCategory,
        itemName,
        itemDescription,
      });

      if (deadStockEntry) {
        deadStockEntry.condemnedQuantity += assetType === "Permanent" ? itemIds.length : quantity;
        deadStockEntry.methodOfDisposal = methodOfDisposal; // Update method if needed
        if (remark) deadStockEntry.remarks = remark; // Update remarks if provided
        await deadStockEntry.save();
      } else {
        // Calculate OverallQuantity from Permanent/Consumable
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

    res.status(200).json({ success: true, message: "Asset disposed successfully" });
  } catch (error) {
    console.error("Failed to dispose asset:", error);
    res.status(500).json({ message: "Failed to dispose asset" });
  }
};
// Cancel disposal (move from TempDispose to ReturnedPermanent)
exports.cancelDisposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionRemarks } = req.body;

    const asset = await TempDispose.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found in TempDispose" });
    }

    if (!rejectionRemarks || rejectionRemarks.trim() === "") {
      return res.status(400).json({ message: "Rejection remarks are required" });
    }

    if (asset.assetCategory === "Building") {
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
        methodOfDisposal: asset.methodOfDisposal, // Add to RejectedAsset
        rejectionRemarks,
        approved: "no",
      });
      await rejectedAsset.save();

      await TempDispose.findByIdAndDelete(id);

      const temp = {
        ...asset.toObject(),
        rejectedAssetId: rejectedAsset._id,
        rejectionRemarks,
      };
      await storeAssetNotification(temp, "building disposal cancelled", new Date());

      return res.status(200).json({ success: true, message: "Building disposal cancelled successfully" });
    } else {
      if (asset.assetType === "Permanent") {
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

      await TempDispose.findByIdAndDelete(id);

      const temp = {
        ...asset.toObject(),
        rejectedAssetId: rejectedAsset._id,
        rejectionRemarks,
      };
      await storeAssetNotification(temp, "asset disposal cancelled", new Date());

      res.status(200).json({ success: true, message: "Disposal cancelled successfully" });
    }
  } catch (error) {
    console.error("Failed to cancel disposal:", error);
    res.status(500).json({ message: "Failed to cancel disposal" });
  }
};



exports.getBuildingUpgrades = async (req, res) => {
  try {
    const { subCategory } = req.body;
    const buildings = await Building.find({ subCategory }).select("upgrades");
    res.json({ buildings });
  } catch (error) {
    console.error("Error fetching building upgrades:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.addBuildingUpgrade = async (req, res) => {
  try {
    const { subCategory, upgrades } = req.body;

    // Validate required fields
    if (!subCategory || !upgrades) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Search for the subcategory in the Building collection
    const buildingExists = await Building.findOne({ 
      subCategory: subCategory 
    });

    if (!buildingExists) {
      return res.status(404).json({ message: "Building subcategory not found" });
    }

    const tempUpgrade = new TempBuildingUpgrade({
      subCategory,
      upgrades
    });

    await tempUpgrade.save();
    res.json({ message: "Upgrade submitted for approval", tempUpgrade });
  } catch (error) {
    console.error("Error adding temporary building upgrade:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTempBuildingUpgrades = async (req, res) => {
  try {
    const upgrades = await TempBuildingUpgrade.find();
    res.status(200).json(upgrades);
  } catch (error) {
    console.error("Failed to fetch temporary building upgrades:", error);
    res.status(500).json({ message: "Failed to fetch temporary building upgrades" });
  }
};

exports.submitForApproval = async (req, res) => {
  const { assetId, assetType, originalData, updatedData } = req.body;
  try {
    const pendingUpdate = new PendingAssetUpdate({
      assetId,
      assetType,
      originalData,
      updatedData,
    });
    await pendingUpdate.save();
    res.status(200).json({ success: true, message: "Update submitted for approval" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




exports.approveAsset = async (req, res) => {


  try {
    const { id } = req.params;
    const tempAsset = await TempAsset.findById(id);

    if (!tempAsset) {

      return res.status(404).json({
        success: false,
        message: "Asset not found in temporary storage"
      });
    }

    const { assetCategory, assetType } = tempAsset;
    let savedAssets = [];

    // Helper function to normalize strings for comparison
    const normalizeString = (str) => {
      return str.trim().replace(/\s+/g, ' ').toLowerCase();
    };

    if (assetCategory === "Building") {
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
        kmzOrkmlFileUrl
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
        kmzOrkmlFileUrl
      });

      savedAssets.push(await newBuilding.save());

    } else if (assetCategory === "Land") {
      const {
        entryDate,
        subCategory,
        location,
        status,
        dateOfPossession,
        controllerOrCustody,
        details
      } = tempAsset;

      const newLand = new Land({
        assetType,
        assetCategory,
        entryDate,
        subCategory: subCategory?.trim(),
        location: location?.trim(),
        status: status?.trim(),
        dateOfPossession,
        controllerOrCustody: controllerOrCustody?.trim(),
        details: details?.trim()
      });

      savedAssets.push(await newLand.save());

    } else {
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
        items
      } = tempAsset;

      const PurchaseModel = assetType === "Permanent" ? Permanent : Consumable;
      const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

      for (const item of items) {
        // Normalize item details for comparison
        const normalizedItemName = normalizeString(item.itemName);
        const normalizedDescription = normalizeString(item.itemDescription);

        // Create purchase record with cleaned data
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
          items: [{
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
            itemIds: assetType === "Permanent" ? item.itemIds?.map(id => id?.trim()) : undefined
          }]
        });

        const savedAsset = await newPurchase.save();
        savedAssets.push(savedAsset);

        // Find matching item using aggregation for case/space insensitivity
        const [existingItem] = await StoreModel.aggregate([
          {
            $match: {
              assetCategory,
              $expr: {
                $and: [
                  {
                    $eq: [
                      { $trim: { input: { $toLower: "$itemName" } } },
                      normalizedItemName
                    ]
                  },
                  {
                    $eq: [
                      { $trim: { input: { $toLower: "$itemDescription" } } },
                      normalizedDescription
                    ]
                  }
                ]
              }
            }
          }
        ]);

        if (existingItem) {
          // Update existing item
          await StoreModel.updateOne(
            { _id: existingItem._id },
            {
              $inc: { inStock: item.quantityReceived },
              $set: {
                ...(assetType === "Permanent" && item.itemIds && {
                  itemIds: [...new Set([
                    ...(existingItem.itemIds || []),
                    ...item.itemIds.map(id => id?.trim())
                  ])]
                })
              }
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
              itemIds: item.itemIds?.map(id => id?.trim())
            })
          });
          await newStoreItem.save();
        }
      }
    }

    // Delete temporary asset
    await TempAsset.deleteOne({ _id: id });


    // notification
    storeAssetNotification(tempAsset, 'asset approved', new Date());

    return res.status(201).json({
      success: true,
      message: `${assetCategory} inventory saved successfully`,
      count: savedAssets.length,
      assets: savedAssets
    });

  } catch (error) {
    console.error("Failed to approve and save asset:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save asset",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } 
};



exports.rejectAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionRemarks } = req.body;

    if (!rejectionRemarks) {
      return res.status(400).json({
        success: false,
        message: "Rejection remarks are required",
      });
    }

    const tempAsset = await TempAsset.findById(id);
    if (!tempAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found in temporary storage",
      });
    }

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
            totalPrice: item.totalPrice || undefined, // Added
            amcFromDate: item.amcFromDate || undefined, // Added
            amcToDate: item.amcToDate || undefined, // Added
            amcCost: item.amcCost || undefined, // Added
            amcPhotoUrl: item.amcPhotoUrl || undefined, // Added
            itemPhotoUrl: item.itemPhotoUrl || undefined,
            warrantyNumber: item.warrantyNumber || undefined, // Added
            warrantyValidUpto: item.warrantyValidUpto || undefined, // Added
            warrantyPhotoUrl: item.warrantyPhotoUrl || undefined, // Added
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
      approvedEstimate: tempAsset.approvedEstimate || undefined, // Added for Building
      approvedBuildingPlanUrl: tempAsset.approvedBuildingPlanUrl || undefined, // Added for Building
      kmzOrkmlFileUrl: tempAsset.kmzOrkmlFileUrl || undefined, // Added for Building
      rejectionRemarks,
    };
    const rejectedAsset = new RejectedAsset(rejectedAssetData);
    await rejectedAsset.save();

    await TempAsset.deleteOne({ _id: id });

    // Pass the rejectedAsset _id to the notification
    const temp = {
      ...tempAsset.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id, // Add the rejected asset ID
    };

    await storeAssetNotification(temp, "asset rejected", new Date());

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


exports.getPendingUpdates = async (req, res) => {
  try {
    const updates = await PendingAssetUpdate.find({ status: "pending" });
    res.status(200).json(updates);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getRejectedUpdates = async (req, res) => {
  try {
    const updates = await PendingAssetUpdate.find({ status: "rejected" });
    res.status(200).json(updates);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.approveUpdate = async (req, res) => {
  const { id } = req.params;
  try {
    const update = await PendingAssetUpdate.findById(id);
    if (!update) return res.status(404).json({ success: false, message: "Update not found" });

    const Model = update.assetType === "Permanent" ? Permanent : Consumable;
    await Model.findByIdAndUpdate(update.assetId, update.updatedData);
    await PendingAssetUpdate.findByIdAndUpdate(id, { status: "approved" });

    // Store notification
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

    res.status(200).json({ success: true, message: "Update approved and applied" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectUpdate = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks } = req.body;
  try {
    const update = await PendingAssetUpdate.findById(id);
    if (!update) return res.status(404).json({ success: false, message: "Update not found" });

    await PendingAssetUpdate.findByIdAndUpdate(
      id,
      { status: "rejected", rejectionRemarks },
      { new: true }
    );
    const rejectedAsset = new RejectedAsset({
      assetType: update.assetType,
      assetCategory: update.updatedData.assetCategory,
      rejectionRemarks: rejectionRemarks || "No remarks provided",
      updatedData: update.updatedData, // Store the entire updatedData object
      subCategory: update.updatedData.items?.[0]?.subCategory || update.updatedData.subCategory,
      assetId:update.assetId,
    });

    // Save the rejected asset
    await rejectedAsset.save();
    // Store notification
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

    res.status(200).json({ success: true, message: "Update rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.approveIssue = async (req, res) => {
  try {
    const tempIssue = await TempIssue.findById(req.params.id);
    if (!tempIssue || tempIssue.acknowledged !== "yes") {
      return res.status(400).json({ message: "Issue not found or not acknowledged" });
    }

    const IssuedModel = tempIssue.assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;

    let issuedItem = await IssuedModel.findOne({
      assetCategory: tempIssue.assetCategory,
      itemName: tempIssue.itemName,
      subCategory: tempIssue.subCategory,
      itemDescription: tempIssue.itemDescription,
    });
    if (issuedItem) {
      const existingIssueIndex = issuedItem.issues.findIndex((issue) => issue.issuedTo === tempIssue.issuedTo && issue.location === tempIssue.location);
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
          location: tempIssue.location, // New field
          quantity: tempIssue.quantity,
          issuedIds: tempIssue.assetType === "Permanent" ? tempIssue.issuedIds : undefined,
          issuedDate: new Date(),
        });
      }
      await issuedItem.save();
    } else {
      const newIssued = new IssuedModel({
        assetType: tempIssue.assetType,
        assetCategory: tempIssue.assetCategory,
        itemName: tempIssue.itemName,
        subCategory: tempIssue.subCategory,
        itemDescription: tempIssue.itemDescription,
        issues: [{
          issuedTo: tempIssue.issuedTo,
          location: tempIssue.location, // New field
          quantity: tempIssue.quantity,
          issuedIds: tempIssue.assetType === "Permanent" ? tempIssue.issuedIds : undefined,
          issuedDate: new Date(),
        }],
      });
      await newIssued.save();
    }

    await TempIssue.findByIdAndDelete(req.params.id);

    // Assuming storeAssetNotification is defined elsewhere
    storeAssetNotification(tempIssue, 'issue approved', new Date());

    res.status(200).json({ success: true, message: "Issue approved successfully" });
  } catch (error) {
    console.error("Failed to approve issue:", error);
    res.status(500).json({ message: "Failed to approve issue" });
  }
};

exports.rejectIssue = async (req, res) => {
  try {
    const { rejectionRemarks } = req.body;
    const tempIssue = await TempIssue.findById(req.params.id);
    if (!tempIssue || tempIssue.acknowledged !== "yes") {
      return res.status(400).json({ message: "Issue not found or not acknowledged" });
    }
    const StoreModel = tempIssue.assetType === "Permanent" ? StorePermanent : StoreConsumable;
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

    tempIssue.rejected = "yes";
    tempIssue.rejectionRemarks = rejectionRemarks;
    await tempIssue.save();
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
    await TempIssue.findByIdAndDelete(req.params.id);

    const temp = {
      ...tempIssue.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id, 
    };
    await storeAssetNotification(temp, "issue rejected", new Date());
    res.status(200).json({ success: true, message: "Issue rejected successfully" });
  } catch (error) {
    console.error("Failed to reject issue:", error);
    res.status(500).json({ message: "Failed to reject issue" });
  }
};

exports.approveReturn = async (req, res) => {
  const { id } = req.params;
  const { condition, assetType, returnedQuantity } = req.body;

  try {
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({ success: false, message: "Valid asset type is required" });
    }

    if (!condition || !["Good", "service", "dispose", "exchange"].includes(condition)) {
      return res.status(400).json({ success: false, message: "Valid condition (Good, service, dispose, or exchange) is required" });
    }

    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    if (condition === "Good") {
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
      await ReturnedModel.deleteOne({ _id: id });
      storeAssetNotification(asset, "return approved", new Date());
      return res.status(200).json({ success: true, message: "Return approved and added to stock" });
    }

    if (condition === "dispose") {
      asset.hooapproval = "waiting";
      await asset.save();
      storeAssetNotification(asset, "return approved with HOO waiting", new Date());
      return res.status(200).json({ success: true, message: "Return marked for HOO approval" });
    }

    asset.approved = "yes";
    asset.status = condition;
    await asset.save();

    if (assetType === "Consumable" && condition === "exchange") {
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

    storeAssetNotification(asset, "return approved", new Date());
    res.status(200).json({ success: true, message: "Return approved" });
  } catch (error) {
    console.error("Error approving return:", error);
    res.status(500).json({ success: false, message: "Failed to approve return" });
  }
};
exports.rejectReturn = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks, assetType } = req.body;

  try {
    if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
      return res.status(400).json({
        success: false,
        message: "Valid asset type is required",
      });
    }

    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;

    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    asset.hooapproval = null;
    await asset.save();

    if (asset.location === "Store") {
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
      const issueIndex = issuedItem.issues.findIndex(
        (issue) => issue.issuedTo === asset.location
      );
      if (issueIndex === -1) {
        issuedItem.issues.push({
          issuedTo: asset.location,
          quantity: assetType === "Permanent" ? 1 : asset.returnQuantity,
          ...(assetType === "Permanent" ? { issuedIds: [asset.itemId] } : {}),
        });
      } else {
        issuedItem.issues[issueIndex].quantity +=
          assetType === "Permanent" ? 1 : asset.returnQuantity;
        if (assetType === "Permanent") {
          issuedItem.issues[issueIndex].issuedIds.push(asset.itemId);
        }
      }
      await issuedItem.save();
    }

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

    asset.approved = "no";
    asset.rejectionRemarks = rejectionRemarks;
    await asset.save();
    await ReturnedModel.deleteOne({ _id: id });

    const temp = {
      ...asset.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
    };
    await storeAssetNotification(temp, "return rejected", new Date());

    res.status(200).json({
      success: true,
      message: "Return rejected and sent back to appropriate collection",
    });
  } catch (error) {
    console.error("Error rejecting return:", error);
    res.status(500).json({ success: false, message: "Failed to reject return" });
  }
};

exports.approveService = async (req, res) => {
  try {
    const { id } = req.params;
    const tempAsset = await TempServiced.findById(id);
    if (!tempAsset) {
      return res.status(404).json({ message: "Temporary serviced asset not found" });
    }

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

    if (assetType === "Permanent") {
      await ReturnedPermanent.deleteMany({
        assetCategory,
        itemName,
        subCategory,
        itemDescription,
        itemId: { $in: itemIds }
      });
    }

    // Remove from TempServiced
    await TempServiced.findByIdAndDelete(id);

    // notification
    storeAssetNotification(tempAsset, 'service approved', new Date());

    res.status(200).json({ success: true, message: "Service approved and stock updated" });
  } catch (error) {
    console.error("Failed to approve service:", error);
    res.status(500).json({ message: "Failed to approve service" });
  }
};

exports.rejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionRemarks } = req.body;
    const tempAsset = await TempServiced.findById(id);
    if (!tempAsset) {
      return res.status(404).json({ message: "Temporary serviced asset not found" });
    }

    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemIds, serviceNo, serviceDate, serviceAmount } = tempAsset;

    // Save to RejectedAsset
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

    // Update existing ReturnedPermanent documents
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

    // Remove from TempServiced
    await TempServiced.findByIdAndDelete(id);

    // Notification with rejectedAssetId
    const temp = {
      ...tempAsset.toObject(),
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
    };
    await storeAssetNotification(temp, "service rejected", new Date());

    res.status(200).json({ success: true, message: "Service rejected and returned assets updated" });
  } catch (error) {
    console.error("Failed to reject service:", error);
    res.status(500).json({ message: "Failed to reject service" });
  }
};

exports.approveReturnByHoo = async (req, res) => {
  const { id } = req.params;
  console.log("hfbid");
  const { assetType } = req.body;

  try {
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;

    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    if (asset.hooapproval !== "waiting") {
      return res.status(400).json({ success: false, message: "Asset not awaiting HOO approval" });
    }

    // For Consumables, move to DisposedAsset
    if (assetType === "Consumable") {
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

    // For Permanent, set approved status (further processing can be added if needed)
    asset.approved = "yes";
    asset.hooapproval = null;
    await asset.save();

    storeAssetNotification(asset, "return approved by HOO", new Date());
    res.status(200).json({ success: true, message: "Return approved by HOO" });
  } catch (error) {
    console.error("Error approving return by HOO:", error);
    res.status(500).json({ success: false, message: "Failed to approve return by HOO" });
  }
};

exports.rejectReturnByHoo = async (req, res) => {
  const { id } = req.params;
  const { rejectionRemarks, assetType } = req.body;

  try {
    const ReturnedModel = assetType === "Permanent" ? ReturnedPermanent : ReturnedConsumable;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;

    const asset = await ReturnedModel.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    if (asset.hooapproval !== "waiting") {
      return res.status(400).json({ success: false, message: "Asset not awaiting HOO approval" });
    }

    // Reset hooapproval
    asset.hooapproval = null;
    await asset.save();

    if (asset.location === "Store") {
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
      const issueIndex = issuedItem.issues.findIndex(
        (issue) => issue.issuedTo === asset.location
      );
      if (issueIndex === -1) {
        issuedItem.issues.push({
          issuedTo: asset.location,
          quantity: assetType === "Permanent" ? 1 : asset.returnQuantity,
          ...(assetType === "Permanent" ? { issuedIds: [asset.itemId] } : {}),
        });
      } else {
        issuedItem.issues[issueIndex].quantity +=
          assetType === "Permanent" ? 1 : asset.returnQuantity;
        if (assetType === "Permanent") {
          issuedItem.issues[issueIndex].issuedIds.push(asset.itemId);
        }
      }
      await issuedItem.save();
    }

    await ReturnedModel.deleteOne({ _id: id });

    storeAssetNotification(asset, "return rejected by HOO", new Date(), { rejectionRemarks });
    res.status(200).json({ success: true, message: "Return rejected by HOO" });
  } catch (error) {
    console.error("Error rejecting return by HOO:", error);
    res.status(500).json({ success: false, message: "Failed to reject return by HOO" });
  }
};



exports.approveOrRejectMaintenance = async (req, res) => {
  try {
    const { id, action, rejectionRemarks } = req.body; // Include rejectionRemarks for rejection case
    const tempMaintenance = await TempBuildingMaintenance.findById(id);

    if (!tempMaintenance) {
      return res.status(404).json({ message: "Maintenance entry not found" });
    }

    const actionTime = new Date();

    if (action === "approve") {
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
      await TempBuildingMaintenance.findByIdAndDelete(id);

      // Store approval notification
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

      res.status(200).json({ message: "Maintenance approved and saved" });
    } else if (action === "reject") {
      // Store rejected maintenance in RejectedAsset
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

      // Update tempMaintenance status and delete it
      tempMaintenance.status = "rejected";
      await tempMaintenance.save();
      await TempBuildingMaintenance.findByIdAndDelete(id);

      // Store rejection notification
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



exports.approveBuildingUpgrade = async (req, res) => {
  try {
    const tempUpgrade = await TempBuildingUpgrade.findById(req.params.id);
    if (!tempUpgrade) {
      return res.status(404).json({ success: false, message: 'Upgrade not found' });
    }

    // Find the building with matching subCategory
    const building = await Building.findOne({ subCategory: tempUpgrade.subCategory });
    if (!building) {
      return res.status(404).json({ success: false, message: 'No matching building found' });
    }

    // Add the upgrade to the building's upgrades array
    building.upgrades.push(...tempUpgrade.upgrades);
    await building.save();

    // Notify about the approval
    await storeAssetNotification({
      assetType: "Permanent",
      assetCategory: "Building",
      subCategory: tempUpgrade.subCategory,
      location: building.location,
      upgrades: tempUpgrade.upgrades, // Optional: include upgrades for reference
    }, "building upgrade approved", new Date());

    // Delete the temporary upgrade record
    await TempBuildingUpgrade.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Upgrade approved and added to building' });
  } catch (error) {
    console.error("Failed to approve building upgrade:", error);
    res.status(500).json({ success: false, message: 'Error approving building upgrade' });
  }
};

// Reject building upgrade
exports.rejectBuildingUpgrade = async (req, res) => {
  try {
    const { rejectionRemarks } = req.body;
    const tempUpgrade = await TempBuildingUpgrade.findById(req.params.id);
    if (!tempUpgrade) {
      return res.status(404).json({ success: false, message: 'Upgrade not found' });
    }

    // Find the building with matching subCategory (for reference, not modification)
    const building = await Building.findOne({ subCategory: tempUpgrade.subCategory });
    if (!building) {
      return res.status(404).json({ success: false, message: 'No matching building found' });
    }

    // Store the rejected upgrade in RejectedAsset
    const rejectedAsset = new RejectedAsset({
      assetType: "Permanent",
      assetCategory: "Building",
      subCategory: tempUpgrade.subCategory,
      location: building.location,
      upgrades: tempUpgrade.upgrades, // Store the rejected upgrade details
      rejectionRemarks: rejectionRemarks || "Rejected by Asset Manager",
      buildingNo: building.buildingNo,
      plinthArea: building.plinthArea,
      dateOfConstruction: building.dateOfConstruction,
      costOfConstruction: building.costOfConstruction,
    });
    await rejectedAsset.save();

    // Notify about the rejection
    const notificationData = {
      assetType: "Permanent",
      assetCategory: "Building",
      subCategory: tempUpgrade.subCategory,
      location: building.location,
      rejectionRemarks,
      rejectedAssetId: rejectedAsset._id,
      upgrades: tempUpgrade.upgrades, // Optional: include upgrades for reference
    };
    await storeAssetNotification(notificationData, "building upgrade rejected", new Date());

    // Delete the temporary upgrade record
    await TempBuildingUpgrade.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Building upgrade rejected successfully' });
  } catch (error) {
    console.error("Failed to reject building upgrade:", error);
    res.status(500).json({ success: false, message: 'Error rejecting building upgrade' });
  }
};

exports.getExchangedForApproval = async (req, res) => {
  try {
    const exchangedItems = await ExchangedConsumable.find({ approved: "no" });
    res.json(exchangedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Approve exchange
exports.approveExchange = async (req, res) => {
  try {
    const exchange = await ExchangedConsumable.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ message: "Exchange not found" });
    }

    // Update approved status
    exchange.approved = "yes";
    await exchange.save();

    // Add quantity back to stock
    const stockItem = await StoreConsumable.findOne({
      assetCategory: exchange.assetCategory,
      itemName: exchange.itemName,
    });

    if (stockItem) {
      stockItem.inStock += exchange.returnedQuantity;
      await stockItem.save();
    }

    // Delete the exchange record (optional, kept as per original logic)

    // Notification
    storeAssetNotification(exchange, "exchange approved", new Date());

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Reject exchange
exports.rejectExchange = async (req, res) => {
  try {
    const exchange = await ExchangedConsumable.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ message: "Exchange not found" });
    }

    // Update approved status
    exchange.approved = "rejected";
    await exchange.save();

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

    // Delete the exchange record
    await ExchangedConsumable.findByIdAndDelete(req.params.id);

    // Notification
    storeAssetNotification(exchange, "exchange rejected", new Date());

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectedassets = async (req, res) => {
  try {
    const rejectedPurchased = await RejectedAsset.find();
    const rejectedIssues = await TempIssue.find({ rejected: "yes" });
    res.status(200).json([...rejectedPurchased, ...rejectedIssues]);
  } catch (error) {
    console.error("Error fetching rejected assets:", error);
    res.status(500).json({ message: "Error fetching rejected assets" });
  }
};

exports.getRejectedAsset = async (req, res) => {
  try {
    const { id } = req.params;
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
exports.getReturnedAssetsForHoo = async (req, res) => {
  try {
    // Fetch assets from both Permanent and Consumable collections with hooapproval: "waiting"
    const [permanentAssets, consumableAssets] = await Promise.all([
      ReturnedPermanent.find({ hooapproval: "waiting" }).lean(),
      ReturnedConsumable.find({ hooapproval: "waiting" }).lean(),
    ]);

    // Combine and format the results
    const allAssets = [
      ...permanentAssets.map(asset => ({ ...asset, assetType: "Permanent" })),
      ...consumableAssets.map(asset => ({ ...asset, assetType: "Consumable" })),
    ];

    res.status(200).json({ success: true, data: allAssets });
  } catch (error) {
    console.error("Error fetching assets for HOO approval:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assets for HOO approval" });
  }
};


// Delete rejected asset
exports.deleteRejectedAsset = async (req, res) => {
  try {
    const { id } = req.params;
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

exports.getRejectedAssetData = async (req, res) => {
  const { assetTypeParam, locationParam } = req.body;

  try {
    const assetType = assetTypeParam;
    const location = locationParam;
    const rejectedAssets = await RejectedAsset.findOne({ assetType, location });

    if (!rejectedAssets) {
      return res.status(200).json({ message: "No rejected assets found" });
    }

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


exports.removeRejectedData = async (req, res) => {
    const { assetType, location, data } = req.body;
  
    if (!assetType || !location || !data) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
  
    try {
      const deletedRejectedAsset = await RejectedAsset.findOneAndDelete({ assetType, location });
  
      if (!deletedRejectedAsset) {
        return res.status(404).json({ success: false, message: "Rejected asset not found." });
      }
  
      const assetRecord = new Asset({
        assetType,
        location,
        data,
      });
  
      await assetRecord.save();
  
      return res.status(200).json({ success: true, message: "Rejected asset removed, and new asset saved successfully." });
    } catch (error) {
      console.error("Error in removeRejectedData:", error);
      return res.status(500).json({ success: false, message: "Server error occurred while processing the request." });
    }
  };

  
exports.getAssetEntriesByMonth = async (req, res) => {
    try {
      const assets = await ConfirmedAsset.find({});
      const monthlyCounts = Array(12).fill(0);
  
      assets.forEach((asset) => {
        const month = new Date(asset.joined).getUTCMonth(); // Extract month
        monthlyCounts[month]++;
      });
  
      res.json({
        labels: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
        data: monthlyCounts,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching asset data.' });
    }
  };
  
  exports.getAssetTypeByMonth = async (req, res) => {
    try {
      const { location, year } = req.query;

  
      let query = {};
      if (location) {
        query.location = location;
      }
  
      // Asset type mapping to fixed index positions
      const assetTypeMapping = {
        IT: 0,
        store: 1,
        electrical: 2,
        furniture: 3,
      };
  
      // Initialize result array (either 12 months or 11 years)
      let result;
      if (year === "all") {
        result = Array.from({ length: 11 }, () => Array(4).fill(0)); // 11 rows for years (2025-2035)
      } else {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        query.joined = { $gte: startDate, $lte: endDate };
        result = Array.from({ length: 12 }, () => Array(4).fill(0)); // 12 rows for months
      }
  
      const assets = await ConfirmedAsset.find(query);
  
      assets.forEach((asset) => {
        const assetType = asset.assetType; // e.g., "electrical"
        const joinedDate = new Date(asset.joined);
  
        if (assetTypeMapping.hasOwnProperty(assetType)) {
          const assetIndex = assetTypeMapping[assetType];
  
          // Sum up the total quantity in the `data` object
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
  
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error fetching assets: " + error.message });
    }
  };

  
  exports.getPurchasedAssetsByType = async (req, res) => {
    try {
      const { assetType, location, year } = req.query;
  
      if (!assetType || !["Permanent", "Consumable"].includes(assetType)) {
        return res.status(400).json({ error: "Invalid or missing assetType. Must be 'Permanent' or 'Consumable'." });
      }
  
      const permanentAssetOptions = [
        "Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods",
        "Curtains", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"
      ];
      const consumableAssetOptions = [
        "Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items",
        "Sanitory Items", "Sports Goods", "Beds and Pillows", "Instruments"
      ];
  
      const PurchaseModel = assetType === "Permanent" ? Permanent : Consumable; // Fixed model reference
      const assetCategoryMapping = assetType === "Permanent"
        ? permanentAssetOptions.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {})
        : consumableAssetOptions.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});
  
      let query = {};
      if (location && location !== "All") {
        query.location = location;
      }
  
      let result;
      const categoryCount = assetType === "Permanent" ? permanentAssetOptions.length : consumableAssetOptions.length;
      if (year === "all") {
        result = Array.from({ length: 11 }, () => Array(categoryCount).fill(0));
      } else {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        query.purchaseDate = { $gte: startDate, $lte: endDate };
        result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0));
      }
  
      const assets = await PurchaseModel.find(query);
  
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
  
      res.status(200).json({
        data: result,
        categories: assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions
      });
    } catch (error) {
      console.error("Error fetching purchased assets:", error);
      res.status(500).json({ error: "Error fetching purchased assets: " + error.message });
    }
  };
  
  


  
// Get Issued Permanent Assets by Month/Year
exports.getIssuedPermanentAssets = async (req, res) => {
    try {
      const { year, location } = req.query;
  
      const permanentAssetCategories = [
        "Furniture", "Vehicle", "Building", "Instruments", "Sports and Goods",
        "Curtains", "Electrical", "Electronics", "Photograph Items", "Land", "ICT Goods"
      ];
      const categoryMapping = permanentAssetCategories.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});
  
      let query = {};
      if (location && location !== "All") {
        query["issues.issuedTo"] = location;
      }
  
      let result;
      const categoryCount = permanentAssetCategories.length;
      if (year === "all") {
        result = Array.from({ length: 11 }, () => Array(categoryCount).fill(0)); // Years 2025-2035
      } else {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        query["issues.issuedDate"] = { $gte: startDate, $lte: endDate };
        result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 12 months
      }
  
      const issuedAssets = await IssuedPermanent.find(query);
  
      issuedAssets.forEach((asset) => {
        const category = asset.assetCategory;
        if (categoryMapping.hasOwnProperty(category)) {
          const categoryIndex = categoryMapping[category];
          asset.issues.forEach((issue) => {
            const issuedDate = new Date(issue.issuedDate);
            const totalQuantity = issue.quantity || 0;
  
            if (year === "all") {
              const yearIndex = issuedDate.getFullYear() - 2025; // Start from 2025
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
  
      res.status(200).json({
        data: result,
        categories: permanentAssetCategories
      });
    } catch (error) {
      console.error("Error fetching issued permanent assets:", error);
      res.status(500).json({ error: "Error fetching issued permanent assets: " + error.message });
    }
  };
  
  
  exports.getIssuedConsumableAssets = async (req, res) => {
    try {
      const { year, location } = req.query;
  
      const consumableAssetCategories = [
        "Stationery", "IT", "Electrical", "Plumbing", "Glassware/Laboratory Items",
        "Sanitory Items", "Sports Goods", "Beds and Pillows", "Instruments"
      ];
      const categoryMapping = consumableAssetCategories.reduce((acc, cat, idx) => ({ ...acc, [cat]: idx }), {});
  
      let query = {};
      if (location && location !== "All") {
        query["issues.issuedTo"] = location;
      }
  
      let result;
      const categoryCount = consumableAssetCategories.length;
      if (year === "all") {
        result = Array.from({ length: 11 }, () => Array(categoryCount).fill(0)); // Years 2025-2035
      } else {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        query["issues.issuedDate"] = { $gte: startDate, $lte: endDate };
        result = Array.from({ length: 12 }, () => Array(categoryCount).fill(0)); // 12 months
      }
  
      const issuedAssets = await IssuedConsumable.find(query);
  
      issuedAssets.forEach((asset) => {
        const category = asset.assetCategory;
        if (categoryMapping.hasOwnProperty(category)) {
          const categoryIndex = categoryMapping[category];
          asset.issues.forEach((issue) => {
            const issuedDate = new Date(issue.issuedDate);
            const totalQuantity = issue.quantity || 0;
  
            if (year === "all") {
              const yearIndex = issuedDate.getFullYear() - 2025; // Start from 2025
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
  
      res.status(200).json({
        data: result,
        categories: consumableAssetCategories
      });
    } catch (error) {
      console.error("Error fetching issued consumable assets:", error);
      res.status(500).json({ error: "Error fetching issued consumable assets: " + error.message });
    }
  };
  

  
  
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
  
      let result = [];
  
      // Base query for all models
      let query = {};
      if (assetType) query.assetType = { $regex: assetType, $options: "i" };
      if (assetCategory) query.assetCategory = { $regex: assetCategory, $options: "i" };
      if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };
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
  
      // Query Building model only if assetCategory is explicitly "Building"
      if (assetCategory === "Building") {
        const buildingQuery = { ...query };
        if (purchaseDateFrom || purchaseDateTo) {
          // Map purchaseDate to dateOfConstruction for Buildings
          delete buildingQuery.purchaseDate;
          buildingQuery.dateOfConstruction = {};
          if (purchaseDateFrom) buildingQuery.dateOfConstruction.$gte = new Date(purchaseDateFrom);
          if (purchaseDateTo) buildingQuery.dateOfConstruction.$lte = new Date(purchaseDateTo);
        }
  
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
            // Building-specific fields
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
  
      // Query Land model only if assetCategory is explicitly "Land"
      if (assetCategory === "Land") {
        const landQuery = { ...query };
        if (purchaseDateFrom || purchaseDateTo) {
          // Map purchaseDate to dateOfPossession for Land
          delete landQuery.purchaseDate;
          landQuery.dateOfPossession = {};
          if (purchaseDateFrom) landQuery.dateOfPossession.$gte = new Date(purchaseDateFrom);
          if (purchaseDateTo) landQuery.dateOfPossession.$lte = new Date(purchaseDateTo);
        }
  
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
            // Land-specific fields
            dateOfPossession: asset.dateOfPossession || null,
            controllerOrCustody: asset.controllerOrCustody || "N/A",
            details: asset.details || "N/A",
            location: asset.location || "N/A",
            status: asset.status || "N/A",
          }))
        );
      }
  
      // Query Permanent model only if assetCategory is not "Building" or "Land" or if no assetCategory is specified
      if (!assetCategory || (assetCategory !== "Building" && assetCategory !== "Land")) {
        const permanentQuery = { ...query };
        if (itemName) permanentQuery["items.itemName"] = { $regex: itemName, $options: "i" };
        if (subCategory) permanentQuery["items.subCategory"] = { $regex: subCategory, $options: "i" };
        if (amcDateFrom || amcDateTo) {
          permanentQuery["items.amcFromDate"] = {};
          permanentQuery["items.amcToDate"] = {};
          if (amcDateFrom) permanentQuery["items.amcFromDate"].$gte = new Date(amcDateFrom);
          if (amcDateTo) permanentQuery["items.amcToDate"].$lte = new Date(amcDateTo);
        }
  
        const permanentAssets = await Permanent.find(permanentQuery).lean();
        result = result.concat(
          permanentAssets.flatMap((asset) => {
            if (!Array.isArray(asset.items)) {
              console.warn("Permanent asset with missing or invalid items:", asset);
              return [];
            }
            return asset.items
              .filter((item) => !itemName || item.itemName.match(new RegExp(itemName, "i")))
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
  
      // Query Consumable model only if assetCategory is not "Building" or "Land" or if no assetCategory is specified
      if (!assetCategory || (assetCategory !== "Building" && assetCategory !== "Land")) {
        const consumableQuery = { ...query };
        if (itemName) consumableQuery["items.itemName"] = { $regex: itemName, $options: "i" };
        if (subCategory) consumableQuery["items.subCategory"] = { $regex: subCategory, $options: "i" };
        if (amcDateFrom || amcDateTo) {
          consumableQuery["items.amcFromDate"] = {};
          consumableQuery["items.amcToDate"] = {};
          if (amcDateFrom) consumableQuery["items.amcFromDate"].$gte = new Date(amcDateFrom);
          if (amcDateTo) consumableQuery["items.amcToDate"].$lte = new Date(amcDateTo);
        }
  
        const consumableAssets = await Consumable.find(consumableQuery).lean();
        result = result.concat(
          consumableAssets.flatMap((asset) => {
            if (!Array.isArray(asset.items)) {
              console.warn("Consumable asset with missing or invalid items:", asset);
              return [];
            }
            return asset.items
              .filter((item) => !itemName || item.itemName.match(new RegExp(itemName, "i")))
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
  
      res.status(200).json(result);
    } catch (error) {
      console.error("Error filtering purchase assets:", error);
      res.status(500).json({ message: "Error filtering purchase assets", error: error.stack });
    }
  };

  
  exports.filterStoreIssue = async (req, res) => {
    try {
      const filters = req.body;
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
        if (!filters.assetType || filters.assetType === "") {
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
  
        result = [...permanentAssets, ...consumableAssets].flatMap((asset) =>
          asset.issues
            .filter((issue) =>
              filters.location === "all_issued" || issue.issuedTo.match(new RegExp(filters.location, "i"))
            )
            .map((issue) => {
              let matchingIssuedIds = issue.issuedIds;
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
  
      res.json(result);
    } catch (error) {
      console.error("Error filtering store/issue assets:", error);
      res.status(500).json({ message: "Error filtering store/issue assets" });
    }
  };
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
        buildingNo, // New filter for building number
      } = req.body;
  
      let query = {};
      if (assetType) query.assetType = { $regex: assetType, $options: "i" };
      if (assetCategory) query.assetCategory = { $regex: assetCategory, $options: "i" };
      if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };
      if (itemName) query.itemName = { $regex: itemName, $options: "i" };
      if (location) query.location = { $regex: location, $options: "i" };
  
      let result = [];
      let buildingMaintenanceResult = [];
  
      if (condition === "InService") {
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
        // All conditions except "dispose" (including Serviced)
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
  
      res.status(200).json({ serviceReturn: result, buildingMaintenance: buildingMaintenanceResult });
    } catch (error) {
      console.error("Error filtering service/return assets:", error);
      res.status(500).json({ message: "Error filtering service/return assets", error: error.message });
    }
  };
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
  
      const assets = await DisposedAsset.find(query);
  
      const disposalData = assets.filter((asset) => asset.assetCategory !== "Building");
      const buildingCondemnationData = assets.filter((asset) => asset.assetCategory === "Building");
  
      res.status(200).json({
        disposal: disposalData,
        buildingCondemnation: buildingCondemnationData,
      });
    } catch (error) {
      console.error("Error filtering disposal assets:", error);
      res.status(500).json({ message: "Error filtering disposal assets" });
    }
  };
  

  
exports.filterDeadStock = async (req, res) => {
    try {
      const {
        assetType,
        assetCategory,
        subCategory,
        itemName,
        methodOfDisposal,
      } = req.body;
  
      const query = {};
      if (assetType) query.assetType = assetType;
      if (assetCategory) query.assetCategory = assetCategory;
      if (subCategory) query.assetSubCategory = subCategory;
      if (itemName) query.itemName = { $regex: itemName, $options: "i" };
      if (methodOfDisposal) query.methodOfDisposal = methodOfDisposal;
  
      const deadStockItems = await DeadStockRegister.find(query);
      res.status(200).json(deadStockItems);
    } catch (error) {
      console.error("Error filtering dead stock:", error);
      res.status(500).json({ message: "Failed to filter dead stock", error: error.message });
    }
  };


  
  exports.getAssetNotification = async (req, res) => {
    try {
      const data = await AssetNotification.find();
      res.status(200).json(data);
    } catch (error) {
      console.error("Failed to fetch temp issues:", error);
      res.status(500).json({ message: "Failed to fetch temp issues" });
    }
  };
  
  
  // delete single asset notification by id
  exports.deleteAssetNotificationbyId = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedNotification = await AssetNotification.findByIdAndDelete(id);
  
      if (!deletedNotification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message
      });
    }
  }
  
  // delete all notifications
  exports.deleteAllAssetNotifications = async (req, res) => {
    try {
      // Option 1: Delete all notifications
      const deleteResult = await AssetNotification.deleteMany({});
  
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'No notifications found to delete'
        });
      }
  
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
  

async function storeAssetNotification(data, action, actionTime) {
  try {
    const itemNames =
      Array.isArray(data.items) && data.items.every((item) => typeof item === "object")
        ? data.items.map((item) => item.itemName)
        : data.itemName;

    const actionData = {
      assetType: data.assetType,
      assetCategory: data.assetCategory,
      action,
      actionTime,
      itemNames,
    };

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
          case "return rejected by HOO": // Add this case
            
            Object.assign(actionData, {
              subCategory: data.subCategory,
              location: data.location,
              condition: data.status,
            });
            if (action === "return rejected" || action === "return approved by HOO") {
              actionData.rejectionRemarks = data.rejectionRemarks || data.rejectionRemarks;
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

      case "building disposal cancelled": // New case for building disposal cancellation
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

    const assetAction = new AssetNotification(actionData);
    await assetAction.save();

    return assetAction;
  } catch (error) {
    console.error("Error storing asset action:", error.message);
    throw error;
  }
}

