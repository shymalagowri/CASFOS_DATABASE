/**
 * This file defines the Mongoose schema for the Temp Issue model.
 * It represents the structure of data related to temporary asset issue entries,
 * including details such as asset type, category, item name, description, subcategory,
 * issued quantity, issued IDs, recipient, location, PDF documentation, and status flags.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const TempIssueSchema = new mongoose.Schema({
  // Type of asset (Permanent or Consumable)
  assetType: { type: String, required: true, enum: ["Permanent", "Consumable"] },
  // Category of the asset
  assetCategory: { type: String, required: true },
  // Name of the item
  itemName: { type: String, required: true },
  // Subcategory of the item (optional, defaults to empty string)
  subCategory: { type: String, default: "" },
  // Description of the item
  itemDescription: { type: String, required: true },
  // Name of the person or entity to whom the item is issued
  issuedTo: { type: String, required: true },
  // Location where the item is issued (optional)
  location: { type: String, required: false },
  // Quantity of the item issued
  quantity: { type: Number, required: true },
  // Array of issued IDs (e.g., serial numbers)
  issuedIds: { type: [String], default: undefined },
  // URL of the PDF document related to the issue
  pdfUrl: { type: String, required: true },
  // URL of the signed PDF document (optional)
  signedPdfUrl: { type: String },
  // Whether the issue has been acknowledged ("yes" or "no", default is "no")
  acknowledged: { type: String, enum: ["yes", "no"], default: "no" },
  // Whether the issue has been rejected ("yes" or "no", default is "no")
  rejected: { type: String, enum: ["yes", "no"], default: "no" },
  // Remarks for rejection (if any)
  rejectionRemarks: { type: String },
  // Date when the issue was created (defaults to current date)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TempIssue", TempIssueSchema);