// routes/assetRoutes.js
const express = require("express");
const router = express.Router();
const AssetController = require("../controllers/assetController");
const upload = require("../config/multerconfig"); // Existing config for images
const pdfUpload = require("../middleware/pdfUpload"); // New config for PDFs

router.post("/uploadFile", upload.single("file"), AssetController.uploadFile);
router.post("/return", AssetController.return);
router.post("/uploadInvoice", upload.single("invoicePicture"), AssetController.uploadInvoice);

router.delete("/deleteRejectedAsset/:id", AssetController.deleteRejectedAsset);
router.post("/getRejectedAssetData", AssetController.getRejectedAssetData);
router.post("/removeRejectedData", AssetController.removeRejectedData);
router.get("/monthly", AssetController.getAssetEntriesByMonth);
router.get("/types", AssetController.getAssetTypeByMonth);
router.post("/deleteAssetData", AssetController.deleteAssetData);
router.get("/amcmonitor", AssetController.amcmonitor);
router.post("/save", AssetController.saveAsset);
router.post("/store", upload.array("files"), AssetController.store); // Keep existing image upload
router.post("/storeTempAsset", AssetController.storeTempAsset);
router.post("/getStoreItems", AssetController.getStoreItems);
router.post("/checkInStock", AssetController.checkInStock);
router.post("/getAvailableIds", AssetController.getAvailableIds);
router.post("/getIssuedIds", AssetController.getIssuedIds);
router.post("/getReturnedAssets", AssetController.getReturnedAssets);
router.get("/getAllAssets", AssetController.getAllAssets);
router.post("/approve/:id", AssetController.approveAsset);
router.post("/reject/:id", AssetController.rejectAsset);

router.get("/getTempServiced", AssetController.getTempServiced);
router.post("/approveService/:id", AssetController.approveService);
router.post("/rejectService/:id", AssetController.rejectService);
router.post("/saveReturnedPermanentStatus", AssetController.saveReturnedPermanentStatus);
router.post("/getServicableItems", AssetController.getServicableItems);
router.post("/saveServiced", AssetController.saveServiced);
router.post("/getDisposableItems", AssetController.getDisposableItems);
router.get("/getTempDisposeAssets", AssetController.getTempDisposeAssets);
router.post("/dispose/:id", AssetController.disposeAsset);
router.post("/cancelDisposal/:id", AssetController.cancelDisposal);
router.post("/getStoreItemDetails", AssetController.getStoreItemDetails);
router.post("/requestForDisposal", AssetController.requestDisposal);
router.post("/saveMaintenance", AssetController.saveMaintenance);
router.post("/filterPurchase", AssetController.filterPurchase);
router.post("/filterStoreIssue", AssetController.filterStoreIssue);
router.post("/filterServiceReturn", AssetController.filterServiceReturn);
router.post("/filterDisposal", AssetController.filterDisposal);
router.get("/purchased-types", AssetController.getPurchasedAssetsByType);
router.get("/store-consumables", AssetController.getStoreConsumableAssets);
router.get("/issued-permanent", AssetController.getIssuedPermanentAssets);
router.get("/issued-consumable", AssetController.getIssuedConsumableAssets);

router.post("/storeTempIssue",AssetController.issue);
router.get("/getTempIssues", AssetController.getTempIssues);
router.get("/getAcknowledgedTempIssues", AssetController.getAcknowledgedTempIssues);
router.post("/acknowledgeTempIssue", pdfUpload.single("file"), AssetController.acknowledgeTempIssue);
router.post("/approveIssue/:id", AssetController.approveIssue);
router.post("/rejectIssue/:id", AssetController.rejectIssue);
router.get("/rejectedassets", AssetController.rejectedassets);
router.post("/storeReturnedReceipt", AssetController.storeReturnedReceipt);

// Upload the signed receipt PDF
router.post("/uploadSignedReturnedReceipt", pdfUpload.single("file"), AssetController.uploadSignedReturnedReceipt);
router.post("/saveReturnedStatus", AssetController.saveReturnedStatus);

// Fetch assets pending return approval
router.get("/getReturnedForApproval", AssetController.getReturnedForApproval);

// Approve a return
router.post("/approveReturn/:id", AssetController.approveReturn);
router.post("/getIssuedLocations", AssetController.getIssuedLocations);

// Reject a return
router.post("/rejectReturn/:id", AssetController.rejectReturn);

// (Optional) Notify entry staff on condition change
router.get("/permanent", AssetController.getAllPermanentAssets);
router.get("/permanent/:id", AssetController.getPermanentAssetById);
router.put("/permanent/:id", AssetController.updatePermanentAsset);

// Consumable assets routes
router.get("/consumable", AssetController.getAllConsumableAssets);
router.get("/consumable/:id", AssetController.getConsumableAssetById);
router.put("/consumable/:id", AssetController.updateConsumableAsset);
router.get('/getExchangedForApproval', AssetController.getExchangedForApproval);
router.post('/approveExchange/:id', AssetController.approveExchange);
router.post('/rejectExchange/:id', AssetController.rejectExchange);
router.post('/getAvailableDisposableQuantity',AssetController.getAvailableDisposableQuantity);
  
router.get("/get-asset-notification", AssetController.getAssetNotification);
router.delete("/delete-asset-notification/:id", AssetController.deleteAssetNotificationbyId);
router.delete("/delete-asset-notification/all", AssetController.deleteAllAssetNotifications);
  // Reject exchange
  
module.exports = router;