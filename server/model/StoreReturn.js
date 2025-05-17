const mongoose = require("mongoose");

// Define the schema for Store Return
const StoreReturnSchema = new mongoose.Schema({
  // Type of asset (Permanent or Consumable)
  assetType: {
    type: String,
    required: true,
    enum: ["Permanent", "Consumable"],
  },
  // Category of the asset
  assetCategory: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  // Name of the item
  itemName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  // Subcategory of the item
  subCategory: {
    type: String,
    maxlength: 50,
  },
  // Description of the item
  itemDescription: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  },
  // Location of the item (default is "Store")
  location: {
    type: String,
    required: true,
    default: "Store",
  },
  // Array of item IDs being returned
  itemIds: {
    type: [String],
    default: [],
  },
  // Quantity of items returned
  returnedQuantity: {
    type: Number,
    min: 0,
  },
  // URL of the PDF document related to the return
  pdfUrl: {
    type: String,
  },
  // URL of the signed PDF document
  signedPdfUrl: {
    type: String,
  },
  // Status of the return (default is "pending")
  status: {
    type: String,
    default: "pending",
  },
  // Source of the return (default is "store")
  source: {
    type: String,
    required: true,
    default: "store",
  },
  // Reference to the original store document
  originalStoreId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  // Date when the return was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("StoreReturn", StoreReturnSchema);