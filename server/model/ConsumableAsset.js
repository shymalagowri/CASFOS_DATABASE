/**
 * This file defines the Mongoose schema for the Consumable Asset model in the Central Academy for State Forest Service (CASFOS) Asset Management System.
 * It represents the structure of data for consumable assets, including fields like asset type, category, entry date, purchase date, supplier details,
 * source, mode of purchase, bill details, and an array of items with their properties (e.g., item name, quantity, price, warranty, AMC).
 * The schema includes validation for assetCategory, subCategory, and itemName using custom validation functions from AssetValidation.
 * It interacts with the 'Consumable' collection in the MongoDB database and includes timestamps for creation and updates.
 */

// Import required dependencies
const mongoose = require("mongoose"); // Mongoose for MongoDB schema definition
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./AssetValidation"); // Custom validation functions

// Define the Consumable schema
const consumableSchema = new mongoose.Schema({
  // Asset type, restricted to "Consumable"
  assetType: {
    type: String,
    required: true,
    enum: ["Consumable"], // Ensures only "Consumable" is allowed
  },
  // Asset category, validated against predefined categories
    assetCategory: {
    type: String,
    required: true,
    validate: {
      validator: validateAssetCategory("Consumable"), // Validates assetCategory against Consumable-specific rules
      message: (props) => `${props.value} is not a valid asset category for Permanent assets!`,
    },
  },
  // Date when the asset entry was created
  entryDate: {
    type: Date,
    required: true,
  },
  // Date when the asset was purchased
  purchaseDate: {
    type: Date,
    required: true,
  },
  // Name of the supplier (optional)
  supplierName: {
    type: String,
    required: false,
  },
  // Address of the supplier (optional)
  supplierAddress: {
    type: String,
    required: false,
  },
  // Source of the asset (e.g., funding source, optional)
  source: {
    type: String,
    required: false,
  },
  // Mode of purchase (e.g., online, direct, optional)
  modeOfPurchase: {
    type: String,
    required: false,
  },
  // Bill number for the purchase (optional)
  billNo: {
    type: String,
    required: false,
  },
  // Person who received the asset (optional)
  receivedBy: {
    type: String,
    required: false,
  },
  // URL to the bill photo (optional)
  billPhotoUrl: {
    type: String,
  },
  // Array of items associated with this consumable asset
  items: [
    {
      // Name of the item, validated based on subCategory
      itemName: {
        type: String,
        required: true,
        validate: {
          validator: function (value) {
            return validateItemName(this.subCategory)(value); // Validates item name against subCategory-specific rules
          },
          message: (props) => `${props.value} is not a valid item name for subCategory ${props.instance.subCategory}!`, // Error message for invalid item name
        },
      },
      // Subcategory of the item, validated based on assetCategory
      subCategory: {
        type: String,
        validate: {
          validator: function (value) {
            return validateSubCategory(this.parent().assetCategory)(value); // Validates subCategory against assetCategory-specific rules
          },
          message: (props) => `${props.value} is not a valid subCategory for assetCategory ${props.instance.parent().assetCategory}!`, // Error message for invalid subCategory
        },
      },
      // Description of the item (optional)
      itemDescription: {
        type: String,
        required: false,
      },
      // Quantity of the item received
      quantityReceived: {
        type: Number,
        required: true,
      },
      // Price per unit of the item
      unitPrice: {
        type: Number,
        required: true,
      },
      // Total price for the item (calculated as quantityReceived * unitPrice, optional)
      totalPrice: {
        type: Number,
      },
      // Start date for Annual Maintenance Contract (optional)
      amcFromDate: {
        type: Date,
        required: false,
      },
      // End date for Annual Maintenance Contract (optional)
      amcToDate: {
        type: Date,
        required: false,
      },
      // Cost of the Annual Maintenance Contract (optional)
      amcCost: {
        type: Number,
        required: false,
      },
      // URL to the AMC photo or document (optional)
      amcPhotoUrl: {
        type: String,
        required: false,
      },
      // URL to the item photo (optional)
      itemPhotoUrl: {
        type: String,
      },
      // Warranty number for the item (optional)
      warrantyNumber: {
        type: String,
      },
      // Date until which the warranty is valid (optional)
      warrantyValidUpto: {
        type: Date,
      },
      // URL to the warranty photo or document (optional)
      warrantyPhotoUrl: {
        type: String,
      },
    },
  ],
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true,
});

// Export the Consumable model to interact with the 'Consumable' collection
module.exports = mongoose.model("Consumable", consumableSchema);