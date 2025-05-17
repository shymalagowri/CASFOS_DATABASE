/**
 * This file defines the Mongoose schema for the Store Consumable model.
 * It represents the structure of data related to consumable items in store,
 * including details such as asset category, item name, description, subcategory, and stock quantity.
 * The schema uses custom validation for item names based on subcategory.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./AssetValidation");

const StoreConsumableSchema = new mongoose.Schema({
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
  },
  // Description of the item
  itemDescription: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500,
  },
  // Quantity of the item in stock
  inStock: {
    type: Number,
    default: 0,
    min: 0,
    max: 100000,
  },
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("StoreConsumable", StoreConsumableSchema);