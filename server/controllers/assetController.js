const Asset = require("../model/Asset");
const ConfirmedAsset = require("../model/ConfirmedAsset");
const UpdatesAsset = require("../model/UpdatesAsset");
const RejectedAsset = require("../model/RejectedAsset");
const PurchasedPermanent = require("../model/PermanentAsset");
const PurchasedConsumable = require("../model/ConsumableAsset");
const StorePermanent = require("../model/StorePermanent");
const StoreConsumable = require("../model/StoreConsumable");
const ReturnedPermanent = require("../model/ReturnedPermanent");
const ReturnedConsumable = require("../model/ReturnedConsumable");
const TempAsset = require("../model/TempAsset");
const Permanent = require("../model/PermanentAsset");
const Consumable = require("../model/ConsumableAsset");
const IssuedPermanent = require("../model/IssuedPermanent");
const IssuedConsumable = require("../model/IssuedConsumable");
const ServicableAsset = require("../model/ServicableAsset");
const TempDispose = require("../model/tempDispose");
const DisposableAsset = require("../model/DisposableAsset");
const ServicedAsset = require("../model/ServicedAsset");
const DisposedAsset = require("../model/DisposedAsset");
const Building = require("../model/Building");
const Land = require("../model/Land");
const BuildingMaintenance = require("../model/BuildingMaintenance");

// Store asset data temporarily in the database
exports.storeTempAssets = async (req, res) => {
  try {
    const {
      assetType, assetCategory, entryDate, purchaseDate, supplierName,
      supplierAddress, source, modeOfPurchase, billNo, receivedBy, items,
      billPhotoUrl, subCategory, location, type, buildingNo, plinthArea,
      status, dateOfConstruction, costOfConstruction, remarks,
      dateOfPossession, controllerOrCustody, details,
    } = req.body;

    let assetData = {};

    if (assetCategory === "Building") {
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        type,
        buildingNo,
        plinthArea,
        status,
        dateOfConstruction,
        costOfConstruction,
        remarks,
      };
    } else if (assetCategory === "Land") {
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        status,
        dateOfPossession,
        controllerOrCustody,
        details,
      };
    } else {
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        purchaseDate,
        supplierName,
        supplierAddress,
        source,
        modeOfPurchase,
        billNo,
        receivedBy,
        billPhotoUrl,
        items: items ? JSON.parse(items) : undefined,
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.storeTempAsset = async (req, res) => {
  try {
    const {
      assetType, assetCategory, entryDate, purchaseDate, supplierName,
      supplierAddress, source, modeOfPurchase, billNo, receivedBy, items,
      billPhotoUrl, subCategory, location, type, buildingNo, plinthArea,
      status, dateOfConstruction, costOfConstruction, remarks,
      dateOfPossession, controllerOrCustody, details,
    } = req.body;

    let assetData = {};

    // For Permanent items, verify itemIds uniqueness per itemName in TempAsset and Permanent
    if (assetType === "Permanent" && items) {
      const parsedItems = JSON.parse(items);
      for (const item of parsedItems) {
        if (item.itemIds && item.itemIds.length > 0) {
          // Check TempAsset for duplicates
          const tempExistingItems = await TempAsset.find({
            assetCategory,
            "items.itemName": item.itemName,
            "items.itemIds": { $in: item.itemIds },
          });

          if (tempExistingItems.length > 0) {
            const duplicateIds = [];
            tempExistingItems.forEach((doc) => {
              doc.items.forEach((existingItem) => {
                if (existingItem.itemName === item.itemName) {
                  const overlaps = existingItem.itemIds.filter((id) =>
                    item.itemIds.includes(id)
                  );
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
          }

          // Check Permanent for duplicates
          const permExistingItems = await Permanent.find({
            assetCategory,
            "items.itemName": item.itemName,
            "items.itemIds": { $in: item.itemIds },
          });

          if (permExistingItems.length > 0) {
            const duplicateIds = [];
            permExistingItems.forEach((doc) => {
              doc.items.forEach((existingItem) => {
                if (existingItem.itemName === item.itemName) {
                  const overlaps = existingItem.itemIds.filter((id) =>
                    item.itemIds.includes(id)
                  );
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
      }
    }

    // Proceed with building assetData
    if (assetCategory === "Building") {
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        type,
        buildingNo,
        plinthArea,
        status,
        dateOfConstruction,
        costOfConstruction,
        remarks,
      };
    } else if (assetCategory === "Land") {
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        status,
        dateOfPossession,
        controllerOrCustody,
        details,
      };
    } else {
      assetData = {
        assetType,
        assetCategory,
        entryDate,
        purchaseDate,
        supplierName,
        supplierAddress,
        source,
        modeOfPurchase,
        billNo,
        receivedBy,
        billPhotoUrl,
        items: items ? JSON.parse(items) : undefined,
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.store = async (req, res) => {
  try {
    const {
      assetType, assetCategory, entryDate, purchaseDate, supplierName, supplierAddress,
      source, modeOfPurchase, billNo, receivedBy, items, billPhotoUrl, subCategory,
      location, type, buildingNo, plinthArea, status, dateOfConstruction,
      costOfConstruction, remarks, dateOfPossession, controllerOrCustody, details,
    } = req.body;

    if (assetCategory === "Building") {
      const newBuilding = new Building({
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        type,
        buildingNo,
        plinthArea,
        status,
        dateOfConstruction,
        costOfConstruction,
        remarks,
      });
      await newBuilding.save();
      res.status(201).json({ message: "Building saved successfully" });
    } else if (assetCategory === "Land") {
      const newLand = new Land({
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        status,
        dateOfPossession,
        controllerOrCustody,
        details,
      });
      await newLand.save();
      res.status(201).json({ message: "Land saved successfully" });
    } else {
      const parsedItems = JSON.parse(items);
      const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
      const PurchaseModel = assetType === "Permanent" ? Permanent : Consumable;

      const newPurchase = new PurchaseModel({
        assetType,
        assetCategory,
        entryDate,
        purchaseDate,
        supplierName,
        supplierAddress,
        source,
        modeOfPurchase,
        billNo,
        receivedBy,
        billPhotoUrl,
        items: parsedItems,
      });
      await newPurchase.save();

      for (const item of parsedItems) {
        const storeItem = await StoreModel.findOne({
          assetCategory,
          itemName: item.itemName,
          subCategory: item.subCategory,
          itemDescription: item.itemDescription,
        });
        if (storeItem) {
          storeItem.inStock += item.quantityReceived;
          if (assetType === "Permanent") {
            storeItem.itemIds = [...new Set([...storeItem.itemIds, ...item.itemIds])];
          }
          await storeItem.save();
        } else {
          const newStoreItem = new StoreModel({
            assetCategory,
            itemName: item.itemName,
            subCategory: item.subCategory,
            itemDescription: item.itemDescription,
            inStock: item.quantityReceived,
            itemIds: assetType === "Permanent" ? item.itemIds : undefined,
          });
          await newStoreItem.save();
        }
      }
      res.status(201).json({ message: "Inventory saved successfully" });
    }
  } catch (error) {
    console.error("Failed to save inventory:", error);
    res.status(500).json({ message: "Failed to save inventory", error: error.message });
  }
};

// Alternative store function from second file (renamed to avoid conflict)
exports.storeBasic = async (req, res) => {
  try {
    const {
      assetType,
      assetCategory,
      entryDate,
      purchaseDate,
      purchaserName,
      purchaserAddress,
      billNo,
      receivedBy,
      items,
      billPhotoUrl,
    } = req.body;

    const parsedItems = JSON.parse(items);

    for (const item of parsedItems) {
      const { itemName, itemDescription, quantityReceived, unitPrice, overallPrice, itemPhotoUrl } = item;
      const quantityReceivedNum = parseInt(quantityReceived, 10);

      const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
      const PurchaseModel = assetType === "Permanent" ? Permanent : Consumable;

      let storeItem = await StoreModel.findOne({ assetCategory, itemName, itemDescription });

      if (storeItem) {
        storeItem.inStock = parseInt(storeItem.inStock, 10) + quantityReceivedNum;
        await storeItem.save();
      } else {
        storeItem = new StoreModel({
          assetCategory,
          itemName,
          itemDescription,
          inStock: quantityReceivedNum,
        });
        await storeItem.save();
      }

      const purchaseData = {
        assetType,
        assetCategory,
        entryDate,
        purchaseDate,
        purchaserName,
        purchaserAddress,
        billNo,
        receivedBy,
        billPhotoUrl,
        itemName,
        itemDescription,
        quantityReceived: quantityReceivedNum,
        unitPrice,
        overallPrice,
        itemPhotoUrl,
      };
      const newPurchase = new PurchaseModel(purchaseData);
      await newPurchase.save();
    }

    res.status(201).json({ message: "Inventory saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save inventory" });
  }
};

// Add purchased permanent/consumable assets
exports.addPurchasedData = async (req, res) => {
  try {
    const {
      assetType,
      assetCategory,
      entryDate,
      purchaseDate,
      purchaserName,
      purchaserAddress,
      billNo,
      receivedBy,
      billPhotoUrl,
      items,
    } = req.body;

    console.log("Request Body:", req.body);

    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const PurchaseModel = assetType === "Permanent" ? PurchasedPermanent : PurchasedConsumable;

    if (
      !assetType || !assetCategory || !entryDate || !purchaseDate || !purchaserName ||
      !purchaserAddress || !billNo || !receivedBy || !items
    ) {
      console.error("Missing required fields or invalid items format");
      return res.status(400).json({ message: "Missing required fields or invalid items format" });
    }

    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
    } catch (error) {
      console.error("Error parsing items:", error);
      return res.status(400).json({ message: "Invalid items format" });
    }

    const isValidItems = parsedItems.every(item =>
      item.itemName && item.itemDescription && item.quantityReceived && item.unitPrice && item.overallPrice
    );

    if (!isValidItems) {
      console.error("Invalid items format");
      return res.status(400).json({ message: "Invalid items format" });
    }

    const purchasedItems = parsedItems.map(item => ({
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      quantityReceived: Number(item.quantityReceived),
      unitPrice: Number(item.unitPrice),
      overallPrice: Number(item.overallPrice),
      itemPhotoUrl: item.itemPhoto || null,
      itemsSNo: item.itemsSNo || [],
    }));

    console.log("Purchased Items:", purchasedItems);

    const newPurchase = new PurchaseModel({
      assetType,
      assetCategory,
      entryDate,
      purchaseDate,
      purchaserName,
      purchaserAddress,
      billNo,
      receivedBy,
      billPhotoUrl,
      items: purchasedItems,
    });

    await newPurchase.save();

    if (assetType === "Permanent") {
      let lastItemGroupSno = await StorePermanent.findOne().sort({ assetGroupSNo: -1 });
      lastItemGroupSno = lastItemGroupSno ? parseInt(lastItemGroupSno.assetGroupSNo.replace("AG-", ""), 10) : 1000;

      const storePromises = parsedItems.map(async (item) => {
        lastItemGroupSno++;
        const assetGroupSNo = `AG-${lastItemGroupSno}`;

        const storeItem = new StoreModel({
          assetCategory: assetCategory,
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          inStock: Number(item.quantityReceived),
          assetGroupSNo: assetGroupSNo,
          billNo: billNo,
          stockItemsSNo: item.itemsSNo,
          issuedItemsSNo: [],
        });

        return storeItem.save();
      });

      await Promise.all(storePromises);
    } else if (assetType === "Consumable") {
      console.log("I'm into consumable block");
      let lastItemGroupSno = await StoreConsumable.findOne().sort({ assetGroupSNo: -1 });
      lastItemGroupSno = lastItemGroupSno ? parseInt(lastItemGroupSno.assetGroupSNo.replace("AG-", ""), 10) : 1000;

      const storePromises = parsedItems.map(async (item) => {
        lastItemGroupSno++;
        const assetGroupSNo = `AG-${lastItemGroupSno}`;

        const storeItem = new StoreModel({
          assetCategory: assetCategory,
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          inStock: Number(item.quantityReceived),
          assetGroupSNo: assetGroupSNo,
          billNo: billNo,
          stockItemsSNo: item.itemsSNo,
          issuedItemsSNo: [],
        });

        return storeItem.save();
      });

      await Promise.all(storePromises);
    }

    res.status(201).json({ message: "Data saved successfully", data: newPurchase });
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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

exports.issue = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, issues } = req.body;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
    const IssuedModel = assetType === "Permanent" ? IssuedPermanent : IssuedConsumable;

    const totalQuantity = issues.reduce((sum, issue) => sum + issue.quantity, 0);
    const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    if (!storeItem || storeItem.inStock < totalQuantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    if (assetType === "Permanent") {
      const issuedIds = issues.flatMap((issue) => issue.issuedIds);
      if (!issuedIds.every((id) => storeItem.itemIds.includes(id))) {
        return res.status(400).json({ message: "Some issued IDs are not in stock" });
      }
      storeItem.itemIds = storeItem.itemIds.filter((id) => !issuedIds.includes(id));
    }

    storeItem.inStock -= totalQuantity;
    await storeItem.save();

    let issuedItem = await IssuedModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    if (issuedItem) {
      issues.forEach((newIssue) => {
        const existingIssueIndex = issuedItem.issues.findIndex(
          (issue) => issue.issuedTo === newIssue.issuedTo
        );
        if (existingIssueIndex !== -1) {
          const existingIssue = issuedItem.issues[existingIssueIndex];
          existingIssue.quantity += newIssue.quantity;
          if (assetType === "Permanent") {
            existingIssue.issuedIds = [...new Set([...existingIssue.issuedIds, ...newIssue.issuedIds])];
          }
          existingIssue.issuedDate = new Date();
        } else {
          issuedItem.issues.push({
            issuedTo: newIssue.issuedTo,
            quantity: newIssue.quantity,
            issuedIds: assetType === "Permanent" ? newIssue.issuedIds : undefined,
            issuedDate: new Date(),
          });
        }
      });
      await issuedItem.save();
    } else {
      const newIssued = new IssuedModel({
        assetType,
        assetCategory,
        itemName,
        subCategory,
        itemDescription,
        issues: issues.map((issue) => ({
          issuedTo: issue.issuedTo,
          quantity: issue.quantity,
          issuedIds: assetType === "Permanent" ? issue.issuedIds : undefined,
          issuedDate: new Date(),
        })),
      });
      await newIssued.save();
    }

    res.status(201).json({ message: "Items issued successfully" });
  } catch (error) {
    console.error("Failed to issue items:", error);
    res.status(500).json({ message: "Failed to issue items" });
  }
};

exports.return = async (req, res) => {
  try {
    const { assetCategory, itemName, subCategory, itemDescription, location, returnQuantity, condition, returnIds } = req.body;

    // Always use Permanent models since assetType is always Permanent
    const StoreModel = StorePermanent;
    const IssuedModel = IssuedPermanent;
    const ReturnedModel = ReturnedPermanent;

    const issuedItem = await IssuedModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
    if (!issuedItem) {
      return res.status(400).json({ message: "Item not found in issued records" });
    }

    const issue = issuedItem.issues.find(issue => issue.issuedTo === location);
    if (!issue || issue.quantity < returnQuantity) {
      return res.status(400).json({ message: "Invalid return quantity" });
    }
    if (!returnIds.every(id => issue.issuedIds.includes(id))) {
      return res.status(400).json({ message: "Invalid return IDs" });
    }

    // Reduce the issued quantity and update issuedIds
    issue.quantity -= returnQuantity;
    issue.issuedIds = issue.issuedIds.filter(id => !returnIds.includes(id));

    if (issue.quantity === 0) {
      issuedItem.issues = issuedItem.issues.filter(i => i.issuedTo !== location);
    }
    if (issuedItem.issues.length === 0) {
      await IssuedModel.deleteOne({ _id: issuedItem._id });
    } else {
      await issuedItem.save();
    }

    if (condition === "Good") {
      const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
      if (!storeItem) {
        return res.status(400).json({ message: "Item not found in store" });
      }
      storeItem.inStock += returnQuantity;
      storeItem.itemIds = [...new Set([...storeItem.itemIds, ...returnIds])];
      await storeItem.save();
    } else if (condition === "Servicable") {
      // Create a separate ReturnedPermanent document for each returnId
      for (const returnId of returnIds) {
        const newReturned = new ReturnedModel({
          assetType: "Permanent", // Hardcoded as Permanent
          assetCategory,
          itemName,
          subCategory,
          itemDescription,
          location,
          itemId: returnId, // Single ID instead of array
          status: "returned" // Set status as 'service' for Servicable condition
        });
        await newReturned.save();
      }
    }

    res.status(201).json({ message: "Items returned successfully" });
  } catch (error) {
    console.error("Failed to return items:", error);
    res.status(500).json({ message: "Failed to return items" });
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

exports.getReturnedAssets = async (req, res) => {
  try {
    const { assetType, assetCategory, status } = req.body; // Include status from request body
    // Fetch assets with the specified assetType, assetCategory, and status
    const returnedAssets = await ReturnedPermanent.find({ assetType, assetCategory, status });

    if (!returnedAssets || returnedAssets.length === 0) {
      return res.status(404).json({ message: "No returned assets found" });
    }

    res.status(200).json(returnedAssets);
  } catch (error) {
    console.error("Failed to fetch returned assets:", error);
    res.status(500).json({ message: "Failed to fetch returned assets" });
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

exports.saveServicable = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemId } = req.body;

    const existingServicable = await ServicableAsset.findOne({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemId,
    });

    if (existingServicable) {
      console.log(`ServicableAsset with itemId ${itemId} already exists, skipping creation`);
      if (assetType === "Permanent") {
        await ReturnedPermanent.deleteOne({ assetCategory, itemName, subCategory, itemDescription, returnIds: itemId });
      }
      return res.status(200).json({ message: "Servicable asset already exists" });
    }

    const newServicable = new ServicableAsset({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemId,
    });
    await newServicable.save();

    if (assetType === "Permanent") {
      await ReturnedPermanent.deleteOne({ assetCategory, itemName, subCategory, itemDescription, returnIds: itemId });
    }

    res.status(201).json({ message: "Servicable asset saved" });
  } catch (error) {
    console.error("Failed to save servicable asset:", error);
    res.status(500).json({ message: "Failed to save servicable asset" });
  }
};

exports.saveDisposable = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemId } = req.body;
    const newDisposable = new DisposableAsset({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemId,
    });
    await newDisposable.save();
    if (assetType === "Permanent") {
      await ReturnedPermanent.deleteOne({ assetCategory, itemName, subCategory, itemDescription, returnIds: itemId });
    }
    res.status(201).json({ message: "Disposable asset saved" });
  } catch (error) {
    console.error("Failed to save disposable asset:", error);
    res.status(500).json({ message: "Failed to save disposable asset" });
  }
};

exports.saveServiced = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemIds, serviceNo, serviceDate, serviceAmount } = req.body;
    const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;

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

    if (assetType === "Permanent") {
      const storeItem = await StoreModel.findOne({ assetCategory, itemName, subCategory, itemDescription });
      if (storeItem) {
        storeItem.inStock += itemIds.length;
        storeItem.itemIds = [...new Set([...storeItem.itemIds, ...itemIds])];
        await storeItem.save();
      } else {
        return res.status(400).json({ message: "Item not found in store" });
      }
      await ReturnedPermanent.deleteMany({ assetCategory, itemName, subCategory, itemDescription, itemId: { $in: itemIds } });
    }

    res.status(201).json({ message: "Serviced asset saved and returned to store" });
  } catch (error) {
    console.error("Failed to save serviced asset:", error);
    res.status(500).json({ message: "Failed to save serviced asset" });
  }
};

exports.requestDisposal = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, subCategory, itemDescription, itemIds, purchaseValue, bookValue, inspectionDate, condemnationDate, remark, disposalValue } = req.body;

    const newDisposed = new TempDispose({
      assetType,
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemIds: assetType === "Permanent" ? itemIds : undefined,
      purchaseValue,
      bookValue,
      inspectionDate,
      condemnationDate,
      remark,
      disposalValue,
    });
    await newDisposed.save();

    await ReturnedPermanent.deleteMany({
      assetCategory,
      itemName,
      subCategory,
      itemDescription,
      itemId: { $in: itemIds },
    });

    res.status(201).json({ message: "Disposable asset saved successfully" });
  } catch (error) {
    console.error("Failed to save disposable asset:", error);
    res.status(500).json({ message: "Failed to save disposable asset" });
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

exports.disposeAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await TempDispose.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found in TempDispose" });
    }

    const disposedAsset = new DisposedAsset({
      assetType: asset.assetType,
      assetCategory: asset.assetCategory,
      itemName: asset.itemName,
      subCategory: asset.subCategory,
      itemDescription: asset.itemDescription,
      itemIds: asset.itemIds,
      purchaseValue: asset.purchaseValue,
      bookValue: asset.bookValue,
      inspectionDate: asset.inspectionDate,
      condemnationDate: asset.condemnationDate,
      remark: asset.remark,
      disposalValue: asset.disposalValue,
    });

    await disposedAsset.save();
    await TempDispose.findByIdAndDelete(id);

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
    const asset = await TempDispose.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found in TempDispose" });
    }

    // Assuming ReturnedPermanent needs individual item entries
    const returnedAssets = asset.itemIds.map((itemId) => ({
      assetType: asset.assetType,
      assetCategory: asset.assetCategory,
      itemName: asset.itemName,
      subCategory: asset.subCategory,
      itemDescription: asset.itemDescription,
      itemId,
      status: "returned", // Reset status to "returned"
    }));

    await ReturnedPermanent.insertMany(returnedAssets);
    await TempDispose.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Disposal cancelled and returned successfully" });
  } catch (error) {
    console.error("Failed to cancel disposal:", error);
    res.status(500).json({ message: "Failed to cancel disposal" });
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
      status: "dispose"
    });

    // Extract itemIds from the matching documents
    const itemIds = disposableItems.map(item => item.itemId);

    res.status(200).json({ itemIds });
  } catch (error) {
    console.error("Failed to fetch disposable items:", error);
    res.status(500).json({ message: "Failed to fetch disposable items" });
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

exports.getServicableItems = async (req, res) => {
  try {
    const { assetType, assetCategory, itemName, itemDescription } = req.body;

    // Fetch items from ReturnedPermanent where status is "service"
    const servicableItems = await ReturnedPermanent.find({
      assetType,
      assetCategory,
      itemName,
      itemDescription,
      status: "service", // Filter for items with status "service"
    });

    // Extract itemIds from the results
    const itemIds = servicableItems.map(item => item.itemId);

    res.status(200).json({ itemIds });
  } catch (error) {
    console.error("Failed to fetch servicable items:", error);
    res.status(500).json({ message: "Failed to fetch servicable items" });
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

    let query = {};
    if (assetCategory) query.assetCategory = { $regex: assetCategory, $options: "i" };
    if (subCategory) query["items.subCategory"] = { $regex: subCategory, $options: "i" };
    if (itemName) query["items.itemName"] = { $regex: itemName, $options: "i" };
    if (supplierName) query.supplierName = { $regex: supplierName, $options: "i" };
    if (source) query.source = { $regex: source, $options: "i" };
    if (modeOfPurchase) query.modeOfPurchase = { $regex: modeOfPurchase, $options: "i" };
    if (billNo) query.billNo = { $regex: billNo, $options: "i" };
    if (receivedBy) query.receivedBy = { $regex: receivedBy, $options: "i" };
    if (purchaseDateFrom || purchaseDateTo) {
      query.purchaseDate = {};
      if (purchaseDateFrom) query.purchaseDate.$gte = new Date(purchaseDateFrom);
      if (purchaseDateTo) query.purchaseDate.$lte = new Date(purchaseDateTo);
    }
    if (amcDateFrom || amcDateTo) {
      query["items.amcDate"] = {};
      if (amcDateFrom) query["items.amcDate"].$gte = new Date(amcDateFrom);
      if (amcDateTo) query["items.amcDate"].$lte = new Date(amcDateTo);
    }

    let result = [];

    if (!assetType || assetType === "" || assetType === "Permanent") {
      const permanentAssets = await Permanent.find(query).lean();
      console.log("Permanent Assets Found:", permanentAssets.length);
      result = permanentAssets.flatMap((asset) => {
        if (!Array.isArray(asset.items)) {
          console.warn("Asset with missing or invalid items:", asset);
          return [];
        }
        return asset.items
          .filter((item) => !itemName || item.itemName.match(new RegExp(itemName, "i")))
          .map((item) => ({
            assetType: asset.assetType,
            assetCategory: asset.assetCategory,
            subCategory: item.subCategory || "N/A",
            itemName: item.itemName,
            purchaseDate: asset.purchaseDate,
            supplierName: asset.supplierName,
            source: asset.source,
            modeOfPurchase: asset.modeOfPurchase,
            billNo: asset.billNo,
            receivedBy: asset.receivedBy,
            amcDate: item.amcDate || null,
            quantityReceived: item.quantityReceived,
            unitPrice: item.unitPrice,
            overallPrice: item.overallPrice,
            itemIds: item.itemIds || [],
            billPhotoUrl: asset.billPhotoUrl,
          }));
      });
    }

    if (!assetType || assetType === "" || assetType === "Consumable") {
      const consumableAssets = await Consumable.find(query).lean();
      console.log("Consumable Assets Found:", consumableAssets.length);
      result = result.concat(
        consumableAssets.flatMap((asset) => {
          if (!Array.isArray(asset.items)) {
            console.warn("Asset with missing or invalid items:", asset);
            return [];
          }
          return asset.items
            .filter((item) => !itemName || item.itemName.match(new RegExp(itemName, "i")))
            .map((item) => ({
              assetType: asset.assetType,
              assetCategory: asset.assetCategory,
              subCategory: item.subCategory || "N/A",
              itemName: item.itemName,
              purchaseDate: asset.purchaseDate,
              supplierName: asset.supplierName,
              source: asset.source,
              modeOfPurchase: asset.modeOfPurchase,
              billNo: asset.billNo,
              receivedBy: asset.receivedBy,
              amcDate: item.amcDate || null,
              quantityReceived: item.quantityReceived,
              unitPrice: item.unitPrice,
              overallPrice: item.overallPrice,
              itemIds: [],
              billPhotoUrl: asset.billPhotoUrl,
            }));
        })
      );
    }

    console.log("Total Results:", result.length);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering purchase assets:", error);
    res.status(500).json({ message: "Error filtering purchase assets", error: error.message });
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
    } = req.body;

    let query = {};
    if (assetType) query.assetType = { $regex: assetType, $options: "i" };
    if (assetCategory) query.assetCategory = { $regex: assetCategory, $options: "i" };
    if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };
    if (itemName) query.itemName = { $regex: itemName, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };

    let result = [];
    if (condition === "InService") {
      if (location) query.location = { $regex: location, $options: "i" };
      const returnedAssets = await ReturnedPermanent.find({ ...query, condition: "Servicable" });
      const servicableAssets = await ServicableAsset.find(query);

      result = servicableAssets.map((asset) => ({
        assetType: asset.assetType,
        assetCategory: asset.assetCategory,
        subCategory: asset.subCategory,
        itemName: asset.itemName,
        location: returnedAssets.find(
          (r) =>
            r.assetCategory.toLowerCase().includes(asset.assetCategory.toLowerCase()) &&
            r.itemName.toLowerCase().includes(asset.itemName.toLowerCase()) &&
            r.subCategory.toLowerCase().includes(asset.subCategory.toLowerCase()) &&
            r.itemDescription.toLowerCase().includes(asset.itemDescription.toLowerCase())
        )?.location || "N/A",
        condition: "InService",
        itemId: asset.itemId,
      }));
    } else if (condition === "Serviced") {
      if (serviceNo) query.serviceNo = { $regex: serviceNo, $options: "i" };
      if (serviceDateFrom || serviceDateTo) {
        query.serviceDate = {};
        if (serviceDateFrom) query.serviceDate.$gte = new Date(serviceDateFrom);
        if (serviceDateTo) query.serviceDate.$lte = new Date(serviceDateTo);
      }
      if (serviceAmountFrom || serviceAmountTo) {
        query.serviceAmount = {};
        if (serviceAmountFrom) query.serviceAmount.$gte = Number(serviceAmountFrom);
        if (serviceAmountTo) query.serviceAmount.$lte = Number(serviceAmountTo);
      }
      const servicedAssets = await ServicedAsset.find(query);
      result = servicedAssets.map((asset) => ({
        assetType: asset.assetType,
        assetCategory: asset.assetCategory,
        subCategory: asset.subCategory,
        itemName: asset.itemName,
        location: "N/A",
        condition: "Serviced",
        itemIds: asset.itemIds,
        serviceNo: asset.serviceNo,
        serviceDate: asset.serviceDate,
        serviceAmount: asset.serviceAmount,
      }));
    } else {
      const returnedAssets = await ReturnedPermanent.find(query);
      const servicableAssets = await ServicableAsset.find(query);
      const servicedAssets = await ServicedAsset.find(query);

      result = [
        ...returnedAssets.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: asset.location,
          condition: asset.condition,
          itemIds: asset.returnIds,
        })),
        ...servicableAssets.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: returnedAssets.find(
            (r) =>
              r.assetCategory.toLowerCase().includes(asset.assetCategory.toLowerCase()) &&
              r.itemName.toLowerCase().includes(asset.itemName.toLowerCase()) &&
              r.subCategory.toLowerCase().includes(asset.subCategory.toLowerCase()) &&
              r.itemDescription.toLowerCase().includes(asset.itemDescription.toLowerCase())
          )?.location || "N/A",
          condition: "InService",
          itemId: asset.itemId,
        })),
        ...servicedAssets.map((asset) => ({
          assetType: asset.assetType,
          assetCategory: asset.assetCategory,
          subCategory: asset.subCategory,
          itemName: asset.itemName,
          location: "N/A",
          condition: "Serviced",
          itemIds: asset.itemIds,
          serviceNo: asset.serviceNo,
          serviceDate: asset.serviceDate,
          serviceAmount: asset.serviceAmount,
        })),
      ];
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering service/return assets:", error);
    res.status(500).json({ message: "Error filtering service/return assets" });
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
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error filtering disposal assets:", error);
    res.status(500).json({ message: "Error filtering disposal assets" });
  }
};

exports.saveAsset = async (req, res) => {
  try {
    console.log("entered");
    const { assetType, items } = req.body;
    console.log(assetType);
    console.log(items);
    console.log(req.body);
    if (assetType === "Permanent") {
      const permanentAsset = new Permanent(req.body);
      await permanentAsset.save();
      res.status(201).json({ message: "Permanent asset saved successfully", data: permanentAsset });
    } else if (assetType === "Consumable") {
      if (!items || items.length === 0) {
        return res.status(400).json({ message: "At least one item is required for Consumable assets" });
      }
      const consumableAsset = new Consumable(req.body);
      await consumableAsset.save();
      console.log("done");
      res.status(201).json({ message: "Consumable asset saved successfully", data: consumableAsset });
    } else {
      res.status(400).json({ message: "Invalid asset type" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error saving asset", error: error.message });
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
  console.log("entered");
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const imageUrl = `http://localhost:3001/${filePath}`;

  res.json({ imageUrl });
};

exports.saveAssetData = async (req, res) => {
  const { assetType, location, data, dataAdded } = req.body;
  if (!assetType || !location || !data) {
    return res.status(400).send("Asset Type, Location, and Data are required.");
  }
  try {
    const existingAsset = await ConfirmedAsset.findOne({ assetType, location });
    if (existingAsset) {
      const previousData = existingAsset.data;
      const combinedData = { ...data };
      Object.entries(dataAdded).forEach(([key, value]) => {
        if (combinedData[key] !== undefined) {
          combinedData[key].quantity += value.quantity || 0;
        } else {
          combinedData[key] = {
            quantity: value.quantity || 0,
            purchaserName: value.purchaserName || "",
            purchaseDate: value.purchaseDate ? new Date(value.purchaseDate) : null,
            vendor: value.vendor || "",
            deliveryDate: value.deliveryDate ? new Date(value.deliveryDate) : null,
            amcDate: value.amcDate ? new Date(value.amcDate) : null,
            invoicePicture: value.invoicePicture || "",
          };
        }
      });

      const isDifferent = JSON.stringify(combinedData) !== JSON.stringify(previousData);
      if (isDifferent) {
        const update = new UpdatesAsset({
          assetType,
          location,
          previousData,
          newData: combinedData,
          addedQuantity: dataAdded,
        });
        await update.save();
        return res.status(200).send("Asset data updated successfully, changes recorded.");
      }

      return res.status(200).send("No changes detected.");
    } else {
      const assetRecord = new Asset({
        assetType,
        location,
        data: Object.fromEntries(
          Object.entries(dataAdded).map(([key, value]) => [
            key,
            {
              quantity: value.quantity || 0,
              purchaserName: value.purchaserName || "",
              purchaseDate: value.purchaseDate ? new Date(value.purchaseDate) : null,
              vendor: value.vendor || "",
              deliveryDate: value.deliveryDate ? new Date(value.deliveryDate) : null,
              amcDate: value.amcDate ? new Date(value.amcDate) : null,
              invoicePicture: value.invoicePicture || "",
            },
          ])
        ),
      });
      await assetRecord.save();
      return res.status(200).send("Asset data saved successfully.");
    }
  } catch (error) {
    console.error("Error saving or updating asset data:", error);
    res.status(500).send("Failed to save or update data.");
  }
};

exports.deleteAssetData = async (req, res) => {
  const { assetType, location, dataToDelete } = req.body;

  if (!assetType || !location || !dataToDelete) {
    return res.status(400).send("Asset Type, Location, and dataToDelete are required.");
  }

  try {
    const asset = await ConfirmedAsset.findOne({ assetType, location });

    if (asset) {
      const existingData = JSON.parse(JSON.stringify(asset.data));
      const newData = JSON.parse(JSON.stringify(existingData));

      let isDataModified = false;

      Object.keys(dataToDelete).forEach((key) => {
        if (existingData[key]) {
          const newQuantity = existingData[key].quantity - dataToDelete[key];

          if (newQuantity <= 0) {
            delete newData[key];
          } else {
            newData[key].quantity = newQuantity;
          }

          isDataModified = true;
        }
      });

      if (isDataModified) {
        const updatedAsset = new UpdatesAsset({
          assetType,
          location,
          previousData: existingData,
          newData: newData,
          deletedQuantity: dataToDelete,
        });

        await updatedAsset.save();
        return res.status(200).send({ success: true, message: "Asset data updated and saved to UpdatedAsset." });
      } else {
        return res.status(400).send({ success: false, message: "No matching data to modify." });
      }
    } else {
      return res.status(404).send({ success: false, message: "Asset not found." });
    }
  } catch (error) {
    console.error("Error updating asset data:", error);
    res.status(500).send({ success: false, message: "Error updating asset data." });
  }
};

exports.getAssetData = async (req, res) => {
  const { assetType, location } = req.body;

  try {
    const update1 = await UpdatesAsset.findOne({ assetType, location });
    if (update1) {
      return res.status(200).json({
        message: "Asset Updation is waiting for Admin's approval",
        data: update1.data,
        status: "pending",
      });
    }
    const confirmedAsset = await ConfirmedAsset.findOne({ assetType, location });
    if (confirmedAsset) {
      return res.status(200).json({
        message: "Data found in confirmed assets",
        data: confirmedAsset.data,
        status: "confirmed",
      });
    }
    const rejectedAsset = await RejectedAsset.findOne({ assetType, location });
    if (rejectedAsset) {
      return res.status(200).json({
        message: "Data Entry is rejected",
        data: rejectedAsset.data,
        status: "rejected",
      });
    }
    const asset = await Asset.findOne({ assetType, location });
    if (asset) {
      return res.status(200).json({
        message: "Asset entry waiting for Admin's approval",
        data: asset.data,
        status: "pending",
      });
    }

    return res.status(200).json({ message: "No data found" });
  } catch (err) {
    console.error("Error fetching asset data:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.rejectUpdatedAsset = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  if (!remark) {
    return res.status(400).json({ message: "Remark is required for rejection." });
  }

  try {
    const asset = await UpdatesAsset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    const rejectedAsset = new RejectedAsset({ ...asset.toObject(), remark });
    await rejectedAsset.save();

    await UpdatesAsset.findByIdAndDelete(id);

    res.status(200).json({ message: "Asset rejected successfully with remark." });
  } catch (error) {
    console.error("Error rejecting asset:", error);
    res.status(500).json({ message: "Error rejecting asset.", error });
  }
};

exports.rejectAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionRemarks } = req.body;

    if (!rejectionRemarks) {
      return res.status(400).json({
        success: false,
        message: "Rejection remarks are required"
      });
    }

    const tempAsset = await TempAsset.findById(id);
    if (!tempAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found in temporary storage"
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
      items: tempAsset.items ? tempAsset.items.map(item => ({
        itemName: item.itemName || undefined,
        subCategory: item.subCategory || undefined,
        itemDescription: item.itemDescription || undefined,
        quantityReceived: item.quantityReceived || undefined,
        unitPrice: item.unitPrice || undefined,
        overallPrice: item.overallPrice || undefined,
        amcDate: item.amcDate || undefined,
        itemPhotoUrl: item.itemPhotoUrl || undefined,
        itemIds: item.itemIds || []
      })) : [],
      dateOfPossession: tempAsset.dateOfPossession || undefined,
      controllerOrCustody: tempAsset.controllerOrCustody || undefined,
      details: tempAsset.details || undefined,
      type: tempAsset.type || undefined,
      buildingNo: tempAsset.buildingNo || undefined,
      plinthArea: tempAsset.plinthArea || undefined,
      dateOfConstruction: tempAsset.dateOfConstruction || undefined,
      costOfConstruction: tempAsset.costOfConstruction || undefined,
      remarks: tempAsset.remarks || undefined,
      rejectionRemarks
    };

    const rejectedAsset = new RejectedAsset(rejectedAssetData);
    await rejectedAsset.save();

    await TempAsset.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: `${tempAsset.assetCategory || 'Asset'} rejected successfully`,
      data: rejectedAsset
    });
  } catch (error) {
    console.error("Failed to reject asset:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject asset",
      error: error.message
    });
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
    let savedAsset;

    if (assetCategory === "Building") {
      const {
        entryDate,
        subCategory,
        location,
        status,
        type,
        buildingNo,
        plinthArea,
        dateOfConstruction,
        costOfConstruction,
        remarks
      } = tempAsset;

      const newBuilding = new Building({
        assetType,
        assetCategory,
        entryDate,
        subCategory,
        location,
        type,
        buildingNo,
        plinthArea,
        status,
        dateOfConstruction,
        costOfConstruction,
        remarks
      });
      savedAsset = await newBuilding.save();

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
        subCategory,
        location,
        status,
        dateOfPossession,
        controllerOrCustody,
        details
      });
      savedAsset = await newLand.save();

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

      const parsedItems = items;
      const StoreModel = assetType === "Permanent" ? StorePermanent : StoreConsumable;
      const PurchaseModel = assetType === "Permanent" ? Permanent : Consumable;

      const newPurchase = new PurchaseModel({
        assetType,
        assetCategory,
        entryDate,
        purchaseDate,
        supplierName,
        supplierAddress,
        source,
        modeOfPurchase,
        billNo,
        receivedBy,
        billPhotoUrl,
        items: parsedItems,
      });
      savedAsset = await newPurchase.save();

      for (const item of parsedItems) {
        const storeItem = await StoreModel.findOne({ assetCategory, itemName: item.itemName, subCategory: item.subCategory, itemDescription: item.itemDescription });
        if (storeItem) {
          storeItem.inStock += item.quantityReceived;
          if (assetType === "Permanent") {
            storeItem.itemIds = [...new Set([...storeItem.itemIds, ...item.itemIds])];
          }
          await storeItem.save();
        } else {
          const newStoreItem = new StoreModel({
            assetCategory,
            itemName: item.itemName,
            subCategory: item.subCategory,
            itemDescription: item.itemDescription,
            inStock: item.quantityReceived,
            itemIds: assetType === "Permanent" ? item.itemIds : undefined,
          });
          await newStoreItem.save();
        }
      }
    }

    await TempAsset.deleteOne({ _id: id });

    return res.status(201).json({
      success: true,
      message: `${assetCategory} inventory saved successfully`,
    });
  } catch (error) {
    console.error("Failed to approve and save asset:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save asset",
      error: error.message
    });
  }
};

exports.approveUpdatedAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await UpdatesAsset.findById(id);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const { assetType, location, newData } = asset;

    const confirmedAsset = await ConfirmedAsset.findOne({ assetType, location });

    if (!confirmedAsset) {
      return res.status(404).json({ message: "Corresponding confirmed asset not found" });
    }

    confirmedAsset.data = newData;

    await confirmedAsset.save();

    await asset.deleteOne();

    res.status(200).json({ message: "Asset approved and updated successfully" });
  } catch (error) {
    console.error("Error approving updated asset:", error);
    res.status(500).json({ message: "Error approving updated asset", error });
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

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.filterAssets = async (req, res) => {
  const {
    assetType,
    location,
    accessories,
    amcFromDate,
    amcToDate,
    purchaserName,
    purchaseDateFrom,
    purchaseDateTo,
    userPermissions
  } = req.body;
  console.log(userPermissions);
  console.log("assettype", assetType);
  const query = {};

  if (assetType) {
    query.assetType = { $regex: new RegExp(`^${escapeRegExp(assetType)}`, "i") };
  } else if (userPermissions && userPermissions.length > 0) {
    query.assetType = {
      $in: userPermissions.map((permission) => new RegExp(`^${escapeRegExp(permission)}$`, "i")),
    };
  }

  if (location) {
    query.location = { $regex: new RegExp(escapeRegExp(location), "i") };
  }

  try {
    const assets = await ConfirmedAsset.find(query).lean();

    let filteredAssets = assets.map((asset) => {
      const filteredData = {};

      Object.keys(asset.data).forEach((key) => {
        const item = asset.data[key];
        const amcDate = item.amcDate ? new Date(item.amcDate) : null;
        const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : null;

        if (
          (!amcFromDate || (amcDate && amcDate >= new Date(amcFromDate))) &&
          (!amcToDate || (amcDate && amcDate <= new Date(amcToDate))) &&
          (!purchaseDateFrom || (purchaseDate && purchaseDate >= new Date(purchaseDateFrom))) &&
          (!purchaseDateTo || (purchaseDate && purchaseDate <= new Date(purchaseDateTo))) &&
          (!purchaserName || (item.purchaserName && item.purchaserName.toLowerCase().includes(purchaserName.toLowerCase())))
        ) {
          filteredData[key] = item;
        }
      });

      if (Object.keys(filteredData).length > 0) {
        return { ...asset, data: filteredData };
      } else {
        return null;
      }
    }).filter((asset) => asset);

    if (accessories) {
      filteredAssets = filteredAssets.map((asset) => {
        const matchingAccessory = Object.keys(asset.data).find((key) =>
          key.toLowerCase().includes(accessories.toLowerCase())
        );

        if (matchingAccessory) {
          return {
            ...asset,
            data: { [matchingAccessory]: asset.data[matchingAccessory] },
          };
        } else {
          return null;
        }
      }).filter((asset) => asset);
    }
    console.log(filteredAssets);
    if (userPermissions && userPermissions.length > 0) {
      filteredAssets = filteredAssets.filter((asset) =>
        userPermissions.some(
          (permission) => permission.toLowerCase() === asset.assetType.toLowerCase()
        )
      );
    }
    console.log(filteredAssets);
    if (filteredAssets.length > 0) {
      res.status(200).json(filteredAssets);
    } else {
      res.status(404).json({ message: "No matching records found." });
    }
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getUpdatedAssets = async (req, res) => {
  try {
    const updatedAssets = await UpdatesAsset.find();
    res.json(updatedAssets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching updated assets" });
  }
};

exports.rejectedassets = async (req, res) => {
  try {
    const assets = await RejectedAsset.find();
    res.json(assets);
  } catch (error) {
    res.status(500).send('Error fetching rejected assets');
  }
};

exports.deleteRejectedAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAsset = await RejectedAsset.findByIdAndDelete(id);

    if (!deletedAsset) {
      return res.status(404).json({
        success: false,
        message: "Rejected asset not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rejected asset deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting rejected asset:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete rejected asset",
      error: error.message
    });
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

// Add these at the appropriate place in your existing file, after the model imports and before the exports.
//ADDITIONAL LOGIC FOR GRAPH
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

    console.log("Querying Permanent assets with:", query);
    const assets = await PurchaseModel.find(query);
    console.log("Fetched Permanent assets:", assets);

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
    console.log(location);
    console.log(year);

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

exports.amcmonitor = async (req, res) => {
  try {
    const currentDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1); // One month ahead

    const assets = await ConfirmedAsset.find({});

    let amcExpiringAssets = [];

    assets.forEach((asset) => {
      if (asset.data && typeof asset.data === "object") {
        Object.entries(asset.data).forEach(([accessoryName, details]) => {
          const amcDate = new Date(details.amcDate);

          if (amcDate >= currentDate && amcDate <= nextMonth) {
            amcExpiringAssets.push({
              assetType: asset.assetType,
              location: asset.location,
              accessoryName: accessoryName,
              amcDate: amcDate.toISOString().split("T")[0], // Format YYYY-MM-DD
            });
          }
        });
      }
    });
    res.status(200).json(amcExpiringAssets);
  } catch (error) {
    console.error("Error in AMC Monitor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
