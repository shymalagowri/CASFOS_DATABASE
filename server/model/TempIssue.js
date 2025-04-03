const mongoose = require("mongoose");

const TempIssueSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Permanent", "Consumable"] },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: { type: String, default: "" }, // Empty for Consumables
  itemDescription: { type: String, required: true },
  issuedTo: { type: String, required: true },
  quantity: { type: Number, required: true },
  issuedIds: { type: [String], default: undefined }, // Only for Permanent assets
  pdfUrl: { type: String, required: true }, // URL of generated receipt
  signedPdfUrl: { type: String }, // URL of uploaded signed receipt
  acknowledged: { type: String, enum: ["yes", "no"], default: "no" },
  rejected: { type: String, enum: ["yes", "no"], default: "no" },
  rejectionRemarks: { type: String }, // Added if rejected
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TempIssue", TempIssueSchema);