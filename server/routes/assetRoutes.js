// routes/assetRoutes.js
const express = require("express");
const router = express.Router();
const AssetController = require("../controllers/assetController");
const upload = require("../config/multerconfig"); // Import Multer configuration
router.post("/uploadFile", upload.single("file"), AssetController.uploadFile);
router.post('/return', AssetController.return);
router.post('/uploadInvoice', upload.single("invoicePicture"), AssetController.uploadInvoice);
router.post("/saveAssetData", AssetController.saveAssetData);
router.post("/getAssetData", AssetController.getAssetData);  // Use AssetController.getAssetData
router.post("/approve/:id", AssetController.approveAsset);
router.post("/approveupdated/:id", AssetController.approveUpdatedAsset);
router.post("/reject/:id", AssetController.rejectAsset);
router.post("/rejectupdated/:id", AssetController.rejectUpdatedAsset);
router.get("/getAllAssets", AssetController.getAllAssets);
router.post("/filterAssets", AssetController.filterAssets);
router.get("/getUpdatedAssets", AssetController.getUpdatedAssets);
router.get("/rejectedassets", AssetController.rejectedassets);
router.delete("/deleteRejectedAsset/:id", AssetController.deleteRejectedAsset);
router.post("/getRejectedAssetData", AssetController.getRejectedAssetData);
router.post("/removeRejectedData", AssetController.removeRejectedData);
router.get("/monthly", AssetController.getAssetEntriesByMonth);
router.get("/types", AssetController.getAssetTypeByMonth);
router.post("/deleteAssetData", AssetController.deleteAssetData);
router.get("/amcmonitor", AssetController.amcmonitor);
router.post("/save", AssetController.saveAsset);
router.post('/store', upload.array('files'), AssetController.store); // Apply multer middleware here
router.post('/storeTempAsset', AssetController.storeTempAsset);
router.post('/getStoreItems', AssetController.getStoreItems);
router.post('/issue', AssetController.issue);
router.post("/checkInStock", AssetController.checkInStock);
router.post('/getAvailableIds', AssetController.getAvailableIds);
router.post('/getIssuedIds', AssetController.getIssuedIds);
router.post("/getReturnedAssets", AssetController.getReturnedAssets);
router.post("/saveReturnedPermanentStatus", AssetController.saveReturnedPermanentStatus);
// router.post("/saveServicable", AssetController.saveServicable);
// router.post("/saveDisposable", AssetController.saveDisposable);
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
router.get('/store-consumables', AssetController.getStoreConsumableAssets);

router.get('/issued-permanent', AssetController.getIssuedPermanentAssets);
router.get('/issued-consumable', AssetController.getIssuedConsumableAssets);

module.exports = router;
