const mongoose = require("mongoose");

const TempIssueSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Permanent", "Consumable"] },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: { type: String, default: "" },
  itemDescription: { type: String, required: true },
  issuedTo: { type: String, required: true },
  location: { type: String, required: false }, // New field
  quantity: { type: Number, required: true },
  issuedIds: { type: [String], default: undefined },
  pdfUrl: { type: String, required: true },
  signedPdfUrl: { type: String },
  acknowledged: { type: String, enum: ["yes", "no"], default: "no" },
  rejected: { type: String, enum: ["yes", "no"], default: "no" },
  rejectionRemarks: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TempIssue", TempIssueSchema);