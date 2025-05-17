/**
 * This file defines the Mongoose schema for the Disposed Asset model.
 * It represents the structure of data related to assets that have been disposed of,
 * including details such as asset type, category, item details, purchase and book values,
 * inspection and condemnation dates, disposal method, and demolition details for buildings.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

// Define the schema for Disposed Assets
const disposedAssetSchema = new mongoose.Schema({
  // Type of asset (e.g., Permanent or Consumable)
  assetType: { type: String, required: true },
  // Category of the asset
  assetCategory: { type: String, required: true },

  // Fields for non-building assets
  itemName: { type: String, required: false }, // Name of the item
  subCategory: { type: String, required: false }, // Subcategory of the item
  itemDescription: { type: String, required: false }, // Description of the item
  quantity: { type: Number, required: false }, // Quantity of the item
  itemIds: [{ type: String, required: false }], // IDs of the items
  purchaseValue: { type: Number, required: false }, // Purchase value of the item
  bookValue: { type: Number, required: false }, // Book value of the item
  inspectionDate: { type: Date, required: false }, // Date of inspection
  condemnationDate: { type: Date, required: false }, // Date of condemnation
  remark: { type: String, required: false }, // Additional remarks
  disposalValue: { type: Number, required: false }, // Value at the time of disposal
  methodOfDisposal: { type: String, required: false }, // Method used for disposal (e.g., auction, sale)

  // Fields for building condemnation
  condemnationYear: { type: Number, required: false }, // Year of condemnation
  certificateObtained: { type: String, enum: ["Yes", "No"], required: false }, // Whether a certificate was obtained
  authority: { type: String, required: false }, // Authority responsible for condemnation
  dateOfReferenceUrl: { type: String, required: false }, // Reference URL for the date
  agency: { type: String, required: false }, // Agency involved in the process
  agencyReferenceNumberUrl: { type: String, required: false }, // Reference number URL from the agency
  date: { type: Date, required: false }, // Date of disposal
  demolitionPeriod: { type: String, required: false }, // Period of demolition
  demolitionEstimate: { type: Number, required: false }, // Estimated cost of demolition
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("DisposedAsset", disposedAssetSchema);