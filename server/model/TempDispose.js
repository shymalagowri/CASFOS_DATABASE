/**
 * This file defines the Mongoose schema for the Temp Dispose model.
 * It represents the structure of data related to temporary asset disposal entries,
 * including details such as asset type, category, item details, disposal values,
 * building condemnation details, and related documentation.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const tempdisposeAssetSchema = new mongoose.Schema({
  // Type of asset (e.g., Permanent, Consumable, Building)
  assetType: { type: String, required: true },
  // Category of the asset
  assetCategory: { type: String, required: true },

  // Fields for non-building assets (optional)
  itemName: { type: String, required: false },
  subCategory: { type: String, required: false },
  itemDescription: { type: String, required: false },
  quantity: { type: Number, required: false },
  itemIds: [{ type: String, required: false }],
  purchaseValue: { type: Number, required: false },
  bookValue: { type: Number, required: false },
  inspectionDate: { type: Date, required: false },
  condemnationDate: { type: Date, required: false },
  remark: { type: String, required: false },
  disposalValue: { type: Number, required: false },
  // Method of disposal (e.g., auction, destruction)
  methodOfDisposal: { type: String, required: false }, // Added

  // Fields for building condemnation (optional)
  condemnationYear: { type: Number, required: false }, 
  certificateObtained: { type: String, enum: ["Yes", "No"], required: false }, 
  authority: { type: String, required: false }, 
  dateOfReferenceUrl: { type: String, required: false },
  agency: { type: String, required: false }, 
  agencyReferenceNumberUrl: { type: String, required: false }, 
  date: { type: Date, required: false },
  demolitionPeriod: { type: String, required: false },
  demolitionEstimate: { type: Number, required: false },
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("tempDispose", tempdisposeAssetSchema);