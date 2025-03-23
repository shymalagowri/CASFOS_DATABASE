// models/StorePermanent.js
const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./assetValidation");

const StorePermanentSchema = new mongoose.Schema({
  assetCategory: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    validate: {
      validator: validateAssetCategory("Permanent"),
      message: (props) => `${props.value} is not a valid asset category for Permanent assets!`,
    },
  },
  itemName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    validate: {
      validator: function (value) {
        return validateItemName(this.subCategory)(value);
      },
      message: (props) => `${props.value} is not a valid item name for subCategory ${props.instance.subCategory}!`,
    },
  },
  subCategory: {
    type: String,
    validate: {
      validator: function (value) {
        return validateSubCategory(this.assetCategory)(value);
      },
      message: (props) => `${props.value} is not a valid subCategory for assetCategory ${props.instance.assetCategory}!`,
    },
  },
  itemDescription: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  },
  inStock: {
    type: Number,
    default: 0,
    min: 0,
    max: 100000,
  },
  itemIds: [{ type: String }],
});

module.exports = mongoose.model("StorePermanent", StorePermanentSchema);