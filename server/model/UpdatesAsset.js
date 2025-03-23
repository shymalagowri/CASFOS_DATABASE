// models/UpdatesAsset.js
const mongoose = require("mongoose");

const updatesAssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  location: { type: String, required: true },
  previousData: { type: Object, required: true },
  newData: { type: Object, required: true },
  deletedQuantity : {type: Object},
  addedQuantity : {type: Object},
  dateUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UpdatesAsset", updatesAssetSchema);
