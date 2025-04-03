const mongoose = require("mongoose");

const servicedAssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: { type: String },
  itemDescription: { type: String, required: true },
  itemIds: [{ type: String, required: false }],
  serviceNo: { type: String, required: true },
  serviceDate: { type: Date, required: true },
  serviceAmount: { type: Number, required: true },
});

module.exports = mongoose.model("ServicedAsset", servicedAssetSchema);