const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./assetValidation");

const consumableSchema = new mongoose.Schema({
  assetType: {
    type: String,
    required: true,
    enum: ["Consumable"],
  },
  assetCategory: {
    type: String,
    required: true,
    validate: {
      validator: validateAssetCategory("Consumable"),
      message: (props) => `${props.value} is not a valid asset category for Consumable assets!`,
    },
  },
  entryDate: { type: Date, required: true },
  purchaseDate: { type: Date, required: true },
  supplierName: { type: String, required: true },
  supplierAddress: { type: String, required: true },
  source: {
    type: String,
    enum: ["GEM", "Local", "Other"],
    required: true,
  },
  modeOfPurchase: {
    type: String,
    enum: ["Tender", "Quotation", "Others"],
    required: true,
  },
  billNo: { type: String, required: true },
  receivedBy: { type: String, required: true },
  billPhotoUrl: { type: String },
  items: [
    {
      itemName: {
        type: String,
        required: true,
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
            return validateSubCategory(this.parent().assetCategory)(value);
          },
          message: (props) => `${props.value} is not a valid subCategory for assetCategory ${props.instance.parent().assetCategory}!`,
        },
      },
      itemDescription: { type: String, required: true },
      quantityReceived: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      overallPrice: { type: Number, required: true },
      amcDate: { type: Date },
      itemPhotoUrl: { type: String },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Consumable", consumableSchema);