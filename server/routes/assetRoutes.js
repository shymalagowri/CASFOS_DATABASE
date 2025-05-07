const express = require("express");
const router = express.Router();
const AssetController = require("../controllers/assetController");
const upload = require("../config/multerconfig"); // Middleware for image uploads
const pdfUpload = require("../middleware/pdfUpload"); // Middleware for PDF uploads

// -----------------------------------------
// Asset Management Routes
// Routes related to creating, updating, and retrieving assets
// -----------------------------------------
router.post("/storeTempAsset", AssetController.storeTempAsset); // Store temporary asset
router.get("/getAllAssets", AssetController.getAllAssets); // Fetch all assets

// Permanent Assets
router.get("/permanent", AssetController.getAllPermanentAssets); // Fetch all permanent assets
router.get("/permanent/:id", AssetController.getPermanentAssetById); // Fetch permanent asset by ID
router.put("/permanent/:id", AssetController.updatePermanentAsset); // Update permanent asset

// Consumable Assets
router.get("/consumable", AssetController.getAllConsumableAssets); // Fetch all consumable assets
router.get("/consumable/:id", AssetController.getConsumableAssetById); // Fetch consumable asset by ID
router.put("/consumable/:id", AssetController.updateConsumableAsset); // Update consumable asset

// -----------------------------------------
// File Upload Routes
// Routes for uploading files (images, PDFs, etc.)
// -----------------------------------------
router.post("/uploadFile", upload.single("file"), AssetController.uploadFile); // General file upload
router.post("/uploadInvoice", upload.single("invoicePicture"), AssetController.uploadInvoice); // Upload invoice image
router.post("/uploadSignedReturnedReceipt", pdfUpload, AssetController.uploadSignedReturnedReceipt); // Upload signed return receipt PDF

// -----------------------------------------
// Store Operations Routes
// Routes related to store inventory and item management
// -----------------------------------------
router.post("/getStoreItems", AssetController.getStoreItems); // Fetch store items
router.post("/checkInStock", AssetController.checkInStock); // Check stock availability
router.post("/getAvailableIds", AssetController.getAvailableIds); // Fetch available asset IDs
router.post("/getIssuedIds", AssetController.getIssuedIds); // Fetch issued asset IDs
router.post("/getStoreItemDetails", AssetController.getStoreItemDetails); // Fetch store item details
router.get("/store-consumables", AssetController.getStoreConsumableAssets); // Fetch consumable assets in store
router.post("/updateDeadStockQuantities", AssetController.updateDeadStockQuantities); // Update dead stock quantities

// -----------------------------------------
// Issue and Return Routes
// Routes for issuing and returning assets
// -----------------------------------------
router.post("/storeTempIssue", AssetController.issue); // Temporary issue request
router.get("/getTempIssues", AssetController.getTempIssues); // Fetch temporary issues
router.get("/getAcknowledgedTempIssues", AssetController.getAcknowledgedTempIssues); // Fetch acknowledged temporary issues
router.post("/acknowledgeTempIssue", pdfUpload, AssetController.acknowledgeTempIssue); // Acknowledge temp issue with PDF
router.post("/return", AssetController.return); // Return an asset
router.post("/storeReturnedReceipt", AssetController.storeReturnedReceipt); // Store returned receipt
router.post("/saveReturnedStatus", AssetController.saveReturnedStatus); // Save returned status
router.post("/saveReturnedPermanentStatus", AssetController.saveReturnedPermanentStatus); // Save permanent asset return status
router.post("/getReturnedAssets", AssetController.getReturnedAssets); // Fetch returned assets
router.get("/getReturnedAssetsForHoo", AssetController.getReturnedAssetsForHoo);
router.post("/getStoreItemsForReturn", AssetController.getStoreItemsForReturn);
router.get("/getReturnedForApproval", AssetController.getReturnedForApproval); // Fetch returns pending approval
router.get("/getReturnedForConditionChange", AssetController.getReturnedForConditionChange); // Fetch returns for condition change
router.post("/updateReturnCondition/:id", AssetController.updateReturnCondition); // Update return condition
router.post("/updateReturnConditiontemp/:id", AssetController.updateReturnConditiontemp); // Update temp return condition
router.post("/getIssuedLocations", AssetController.getIssuedLocations); // Fetch issued asset locations

// -----------------------------------------
// Service and Maintenance Routes
// Routes for servicing and maintaining assets
// -----------------------------------------
router.post("/saveServiced", AssetController.saveServiced); // Save serviced asset
router.post("/saveMaintenance", AssetController.saveMaintenance); // Save maintenance record
router.post("/saveMaintenanceTemp", AssetController.saveMaintenanceTemp); // Save temporary maintenance record
router.get("/getPendingMaintenance", AssetController.getPendingMaintenance); // Fetch pending maintenance requests
router.post("/getServicableItems", AssetController.getServicableItems); // Fetch serviceable items
router.get("/getTempServiced", AssetController.getTempServiced); // Fetch temporary serviced assets

// -----------------------------------------
// Disposal Routes
// Routes for disposing of assets
// -----------------------------------------
router.post("/requestForDisposal", AssetController.requestDisposal); // Request asset disposal
router.post("/getDisposableItems", AssetController.getDisposableItems); // Fetch disposable items
router.get("/getTempDisposeAssets", AssetController.getTempDisposeAssets); // Fetch temporary disposal assets
router.post("/getAvailableDisposableQuantity", AssetController.getAvailableDisposableQuantity); // Fetch available disposal quantity
router.post("/dispose/:id", AssetController.disposeAsset); // Dispose of an asset
router.post("/cancelDisposal/:id", AssetController.cancelDisposal); // Cancel disposal request

// -----------------------------------------
// Building Upgrade Routes
// Routes for managing building upgrades
// -----------------------------------------
router.post("/getBuildingUpgrades", AssetController.getBuildingUpgrades); // Fetch building upgrades
router.post("/addBuildingUpgrades", AssetController.addBuildingUpgrade); // Add a building upgrade
router.get("/getTempBuildingUpgrades", AssetController.getTempBuildingUpgrades); // Fetch temporary building upgrades


// Asset Approval/Rejection
router.post("/submitForApproval", AssetController.submitForApproval); // Submit asset for approval
router.post("/approve/:id", AssetController.approveAsset); // Approve an asset
router.post("/reject/:id", AssetController.rejectAsset); // Reject an asset

// Update Approval/Rejection
router.get("/pendingUpdates", AssetController.getPendingUpdates); // Fetch pending updates
router.get("/rejectedUpdates", AssetController.getRejectedUpdates); // Fetch rejected updates
router.post("/approveUpdate/:id", AssetController.approveUpdate); // Approve an update
router.post("/rejectUpdate/:id", AssetController.rejectUpdate); // Reject an update

// Issue Approval/Rejection
router.post("/approveIssue/:id", AssetController.approveIssue); // Approve an issue
router.post("/rejectIssue/:id", AssetController.rejectIssue); // Reject an issue

// Return Approval/Rejection
router.post("/approveReturn/:id", AssetController.approveReturn); // Approve a return
router.post("/rejectReturn/:id", AssetController.rejectReturn); // Reject a return

// Service Approval/Rejection
router.post("/approveService/:id", AssetController.approveService); 
router.post("/rejectService/:id", AssetController.rejectService); 
router.put("/approveReturnByHoo/:id", AssetController.approveReturnByHoo);
router.put("/rejectReturnByHoo/:id",AssetController.rejectReturnByHoo)
// Maintenance Approval/Rejection
router.post("/approveOrRejectMaintenance", AssetController.approveOrRejectMaintenance); // Approve or reject maintenance

// Building Upgrade Approval/Rejection
router.post("/approveBuildingUpgrade/:id", AssetController.approveBuildingUpgrade); // Approve building upgrade
router.post("/rejectBuildingUpgrade/:id", AssetController.rejectBuildingUpgrade); // Reject building upgrade

// Exchange Approval/Rejection
router.get("/getExchangedForApproval", AssetController.getExchangedForApproval); // Fetch exchanges for approval
router.post("/approveExchange/:id", AssetController.approveExchange); // Approve an exchange
router.post("/rejectExchange/:id", AssetController.rejectExchange); // Reject an exchange

// -----------------------------------------
// Rejected Asset Routes
// Routes for managing rejected assets
// -----------------------------------------
router.get("/rejectedassets", AssetController.rejectedassets); // Fetch all rejected assets
router.get("/rejected-asset/:id", AssetController.getRejectedAsset); // Fetch rejected asset by ID
router.delete("/rejected-asset/:id", AssetController.deleteRejectedAsset); // Delete rejected asset
router.post("/getRejectedAssetData", AssetController.getRejectedAssetData); // Fetch rejected asset data
router.post("/removeRejectedData", AssetController.removeRejectedData); // Remove rejected data

// -----------------------------------------
// Report and Filter Routes
// Routes for generating reports and filtering data
// -----------------------------------------
router.get("/monthly", AssetController.getAssetEntriesByMonth); // Fetch assets by month
router.get("/types", AssetController.getAssetTypeByMonth); // Fetch asset types by month
router.get("/purchased-types", AssetController.getPurchasedAssetsByType); // Fetch purchased assets by type
router.get("/issued-permanent", AssetController.getIssuedPermanentAssets); // Fetch issued permanent assets
router.get("/issued-consumable", AssetController.getIssuedConsumableAssets); // Fetch issued consumable assets
router.post("/filterPurchase", AssetController.filterPurchase); // Filter purchased assets
router.post("/filterStoreIssue", AssetController.filterStoreIssue); // Filter store issues
router.post("/filterServiceReturn", AssetController.filterServiceReturn); // Filter service returns
router.post("/filterDisposal", AssetController.filterDisposal); // Filter disposals
router.post("/filterDeadStock", AssetController.filterDeadStock); // Filter dead stock

// -----------------------------------------
// Notification Routes
// Routes for managing asset-related notifications
// -----------------------------------------
router.get("/get-asset-notification", AssetController.getAssetNotification); // Fetch asset notifications
router.delete("/delete-asset-notification/:id", AssetController.deleteAssetNotificationbyId); // Delete notification by ID
router.delete("/delete-all-asset-notification", AssetController.deleteAllAssetNotifications); // Delete all notifications

module.exports = router;