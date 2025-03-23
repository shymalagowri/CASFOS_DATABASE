const mongoose = require("mongoose");

const disposableAssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: { type: String, required: false },
  itemDescription: { type: String, required: true },
  itemId: { type: String, required: false },
  
});

module.exports = mongoose.model("DisposableAsset", disposableAssetSchema);