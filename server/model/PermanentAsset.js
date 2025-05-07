const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./assetValidation");

const permanentSchema = new mongoose.Schema({
  assetType: {
    type: String,
    required: true,
    enum: ["Permanent"],
  },
  assetCategory: {
    type: String,
    required: true,
    validate: {
      validator: validateAssetCategory("Permanent"),
      message: (props) => `${props.value} is not a valid asset category for Permanent assets!`,
    },
  },
  entryDate: { type: Date, required: true },
  purchaseDate: { type: Date, required: true },
  supplierName: { type: String, required: false },
  supplierAddress: { type: String, required: false },
  source: {
    type: String,
    required: false,
  },
  modeOfPurchase: {
    type: String,
    required: false,
  },
  billNo: { type: String, required: false },
  receivedBy: { type: String, required: false },
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
      totalPrice: { type: Number },
      amcFromDate: { type: Date, required: false },  // Add this
      amcToDate: { type: Date, required: false },    // Add this
      amcCost: { type: Number, required: false },    // Add this
      amcPhotoUrl: { type: String, required: false },
      itemPhotoUrl: { type: String },
      warrantyNumber: { type: String },
      warrantyValidUpto: { type: Date },
      warrantyPhotoUrl: { type: String },
      itemIds: [{ type: String }],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Permanent", permanentSchema);