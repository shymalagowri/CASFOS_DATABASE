const mongoose = require("mongoose");

const servicableAssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: { type: String },
  
  itemDescription: { type: String, required: true },
  itemId: { type: String, required: true },
});

module.exports = mongoose.model("ServicableAsset", servicableAssetSchema);