// models/StorePermanent.js

/**
 * This file defines the Mongoose schema for the Store Permanent model.
 * It represents the structure of data related to permanent items in store,
 * including details such as asset category, item name, description, subcategory, stock quantity, and item IDs.
 * The schema uses custom validation for asset category, subcategory, and item names.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./AssetValidation");

const StorePermanentSchema = new mongoose.Schema({
  // Category of the asset
  assetCategory: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    validate: {
      validator: validateAssetCategory("Permanent"), // Validates asset category for Permanent assets
      message: (props) => `${props.value} is not a valid asset category for Permanent assets!`,
    },
  },
  // Name of the item
  itemName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    validate: {
      validator: function (value) {
        return validateItemName(this.subCategory)(value); // Validates item name based on subcategory
      },
      message: (props) => `${props.value} is not a valid item name for subCategory ${props.instance.subCategory}!`,
    },
  },
  // Subcategory of the item
  subCategory: {
    type: String,
    validate: {
      validator: function (value) {
        return validateSubCategory(this.assetCategory)(value); // Validates subcategory based on asset category
      },
      message: (props) => `${props.value} is not a valid subCategory for assetCategory ${props.instance.assetCategory}!`,
    },
  },
  // Description of the item
  itemDescription: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  },
  // Quantity of the item in stock
  inStock: {
    type: Number,
    default: 0,
    min: 0,
    max: 100000,
  },
  // Array of item IDs
  itemIds: [{ type: String }],
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("StorePermanent", StorePermanentSchema);