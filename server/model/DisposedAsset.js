const mongoose = require("mongoose");

const disposedAssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: { type: String, required: false },
  itemDescription: { type: String, required: true },
  itemIds: [{ type: String, required: false }],
  quantity: { type: Number, required: true },  // Added quantity field
  purchaseValue: { type: Number, required: true },
  bookValue: { type: Number, required: true },
  inspectionDate: { type: Date, required: true },
  condemnationDate: { type: Date, required: true },
  remark: { type: String, required: true },
  disposalValue: { type: Number, required: true },
});

module.exports = mongoose.model("DisposedAsset", disposedAssetSchema);