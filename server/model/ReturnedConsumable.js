const mongoose = require("mongoose");

const returnedConsumableSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Consumable"] },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: String,
  itemDescription: String,
  location: String,
  status: { type: String, enum: ["exchange", "dispose","returned"], default: null },
  pdfUrl: String,
  signedPdfUrl: String,
  remark: String,
  returnQuantity: { type: Number, required: true }, // Fix typo and set type to Number
  approved: { type: String, enum: ["yes", "no"], default: null },
  rejectionRemarks: { type: String, default: null }
});

module.exports = mongoose.model("ReturnedConsumable", returnedConsumableSchema);