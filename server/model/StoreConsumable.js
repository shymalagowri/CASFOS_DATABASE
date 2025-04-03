// models/StoreConsumable.js
const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./assetValidation");

const StoreConsumableSchema = new mongoose.Schema({
  assetCategory: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    
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
  },
  itemDescription: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500,
  },
  inStock: {
    type: Number,
    default: 0,
    min: 0,
    max: 100000,
  },
});

module.exports = mongoose.model("StoreConsumable", StoreConsumableSchema);