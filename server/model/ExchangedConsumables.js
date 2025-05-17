/**
 * This file defines the Mongoose schema for the Exchanged Consumables model.
 * It represents the structure of data related to consumable assets that have been exchanged,
 * including details such as asset type, category, item name, description, returned quantity,
 * exchange date, remarks, and references to related documents or assets.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

// Define the schema for Exchanged Consumables
const exchangedConsumableSchema = new mongoose.Schema({
  // Type of asset (restricted to "Consumable")
  assetType: {
    type: String,
    required: true,
    enum: ["Consumable"], // Ensures only "Consumable" is allowed
    default: "Consumable",
  },
  // Category of the asset
  assetCategory: {
    type: String,
    required: true,
  },
  // Name of the item
  itemName: {
    type: String,
    required: true,
  },
  // Subcategory of the item
  subCategory: {
    type: String,
  },
  // Description of the item
  itemDescription: {
    type: String,
    required: true,
  },
  // Quantity of the item that was returned
  returnedQuantity: {
    type: Number,
    required: true,
  },
  // Date of the exchange
  exchangeDate: {
    type: Date,
    default: Date.now, // Defaults to the current date
  },
  // Additional remarks about the exchange
  remark: {
    type: String,
  },
  // URL of the PDF document related to the exchange
  pdfUrl: {
    type: String,
  },
  // URL of the signed PDF document
  signedPdfUrl: {
    type: String,
  },
  // Reference to the original returned asset
  originalReturnedAssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReturnedConsumable", // References the ReturnedConsumable model
    required: true,
  },
  // Approval status of the exchange
  approved: {
    type: String,
    enum: [null, "yes", "no", "rejected"], // Allow null, "yes", "no", or "rejected"
    default: null,
  },
}, { 
  // Enable automatic timestamps for createdAt and updatedAt fields
  timestamps: true 
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("ExchangedConsumable", exchangedConsumableSchema);