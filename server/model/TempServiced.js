/**
 * This file defines the Mongoose schema for the Temp Serviced model.
 * It represents the structure of data related to temporary asset service entries,
 * including details such as asset type, category, item name, description, IDs,
 * service number, service date, and service amount.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const tempServicedSchema = new mongoose.Schema({
  // Type of asset (e.g., Permanent or Consumable)
  assetType: { type: String, required: true },
  // Category of the asset
  assetCategory: { type: String, required: true },
  // Name of the item
  itemName: { type: String, required: true },
  // Subcategory of the item (optional)
  subCategory: { type: String },
  // Description of the item
  itemDescription: { type: String, required: true },
  // IDs of the items serviced (optional)
  itemIds: [{ type: String, required: false }],
  // Service number/reference
  serviceNo: { type: String, required: true },
  // Date when the service was performed
  serviceDate: { type: Date, required: true },
  // Amount spent on the service
  serviceAmount: { type: Number, required: true },
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("TempServiced", tempServicedSchema);