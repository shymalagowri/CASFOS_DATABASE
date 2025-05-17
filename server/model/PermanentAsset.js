/**
 * This file defines the Mongoose schema for the Permanent Asset model.
 * It represents the structure of data related to permanent assets, including details such as
 * asset type, category, entry date, purchase date, supplier details, source, mode of purchase,
 * bill details, and an array of items with their respective properties (e.g., item name, quantity, price, warranty, AMC).
 * The schema includes validation for assetCategory, subCategory, and itemName using custom validation functions.
 * It interacts with the 'Permanent' collection in the MongoDB database and includes timestamps for creation and updates.
 */

const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./AssetValidation");

// Define the schema for Permanent Assets
const permanentSchema = new mongoose.Schema({
  // Type of asset (restricted to "Permanent")
  assetType: {
    type: String,
    required: true,
    enum: ["Permanent"], // Ensures only "Permanent" is allowed
  },
  // Category of the asset
  assetCategory: {
    type: String,
    required: true,
    validate: {
      validator: validateAssetCategory("Permanent"), // Validates the category for Permanent assets
      message: (props) => `${props.value} is not a valid asset category for Permanent assets!`, // Error message for invalid category
    },
  },
  // Date of entry for the asset
  entryDate: { type: Date, required: true },
  // Date of purchase for the asset
  purchaseDate: { type: Date, required: true },
  // Name of the supplier
  supplierName: { type: String, required: false },
  // Address of the supplier
  supplierAddress: { type: String, required: false },
  // Source of the asset
  source: {
    type: String,
    required: false,
  },
  // Mode of purchase for the asset
  modeOfPurchase: {
    type: String,
    required: false,
  },
  // Bill number for the purchase
  billNo: { type: String, required: false },
  // Name of the person who received the asset
  receivedBy: { type: String, required: false },
  // URL of the bill photo
  billPhotoUrl: { type: String },
  // Array of items associated with the asset
  items: [
    {
      // Name of the item
      itemName: {
        type: String,
        required: true,
        validate: {
          validator: function (value) {
            return validateItemName(this.subCategory)(value); // Validates the item name based on the subcategory
          },
          message: (props) => `${props.value} is not a valid item name for subCategory ${props.instance.subCategory}!`, // Error message for invalid item name
        },
      },
      // Subcategory of the item
      subCategory: {
        type: String,
        validate: {
          validator: function (value) {
            return validateSubCategory(this.parent().assetCategory)(value); // Validates the subcategory based on the asset category
          },
          message: (props) => `${props.value} is not a valid subCategory for assetCategory ${props.instance.parent().assetCategory}!`, // Error message for invalid subcategory
        },
      },
      // Description of the item
      itemDescription: { type: String, required: true },
      // Quantity of the item received
      quantityReceived: { type: Number, required: true },
      // Unit price of the item
      unitPrice: { type: Number, required: true },
      // Total price of the item
      totalPrice: { type: Number },
      // AMC (Annual Maintenance Contract) start date
      amcFromDate: { type: Date, required: false },
      // AMC end date
      amcToDate: { type: Date, required: false },
      // Cost of the AMC
      amcCost: { type: Number, required: false },
      // URL of the AMC document
      amcPhotoUrl: { type: String, required: false },
      // URL of the item photo
      itemPhotoUrl: { type: String },
      // Warranty number for the item
      warrantyNumber: { type: String },
      // Warranty validity date
      warrantyValidUpto: { type: Date },
      // URL of the warranty document
      warrantyPhotoUrl: { type: String },
      // Array of IDs associated with the item
      itemIds: [{ type: String }],
    },
  ],
}, { 
  // Enable automatic timestamps for createdAt and updatedAt fields
  timestamps: true 
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("Permanent", permanentSchema);