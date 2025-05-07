// models/TempAsset.js
const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./assetValidation");

const tempAssetSchema = new mongoose.Schema({
  assetType: {
    type: String,
    enum: ["Permanent", "Consumable"], 
    required: false,
  },
  assetCategory: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
        if (!this.assetType) return true; 
        return validateAssetCategory(this.assetType)(value);
      },
      message: (props) => `${props.value} is not a valid asset category for assetType ${props.instance.assetType}!`,
    },
  },

  // Common fields
  entryDate: { type: Date, required: false },
  subCategory: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
        return validateSubCategory(this.assetCategory)(value);
      },
      message: (props) => `${props.value} is not a valid subCategory for assetCategory ${props.instance.assetCategory}!`,
    },
  },
  location: { type: String, required: false },
  status: { type: String, required: false },

  // Fields from permanentSchema/consumableSchema
  purchaseDate: { type: Date, required: false },
  supplierName: { type: String, required: false },
  supplierAddress: { type: String, required: false },
  source: { type: String , required: false },
  modeOfPurchase: { type: String, required: false },
  billNo: { type: String, required: false },
  receivedBy: { type: String, required: false },
  billPhotoUrl: { type: String, required: false },
  items: [{
    itemName: {
      type: String,
      required: false,
      validate: {
        validator: function (value) {
          return validateItemName(this.subCategory || this.parent().subCategory)(value);
        },
        message: (props) => `${props.value} is not a valid item name for subCategory ${props.instance.subCategory || props.instance.parent().subCategory}!`,
      },
    },
    subCategory: {
      type: String,
      required: false,
      validate: {
        validator: function (value) {
          return validateSubCategory(this.parent().assetCategory)(value);
        },
        message: (props) => `${props.value} is not a valid subCategory for assetCategory ${props.instance.parent().assetCategory}!`,
      },
    },
    itemDescription: { type: String, required: false },
    quantityReceived: { type: Number, required: false },
    unitPrice: { type: Number, required: false },
    totalPrice: { type: Number }, // Changed from overallPrice
    amcFromDate: { type: Date, required: false },
    amcToDate: { type: Date, required: false },
    amcCost: { type: Number, required: false },
    amcPhotoUrl: { type: String, required: false },
    itemPhotoUrl: { type: String, required: false },

    warrantyNumber: { type: String },
    warrantyValidUpto: { type: Date },
    warrantyPhotoUrl: { type: String },
    itemIds: [{ type: String }],
  }],

  // Fields from landSchema
  dateOfPossession: { type: Date, required: false },
  controllerOrCustody: { type: String, required: false },
  details: { type: String, required: false },

  // Fields from buildingSchema
  type: { type: String, required: false },
  buildingNo: { type: String, required: false },
  approvedEstimate: { type: String, required: false },
  plinthArea: { type: String, required: false },
  dateOfConstruction: { type: Date, required: false },
  costOfConstruction: { type: Number, required: false },
  remarks: { type: String, required: false },
  approvedBuildingPlanUrl: { type: String },
  kmzOrkmlFileUrl: { type: String },

}, { timestamps: true });

module.exports = mongoose.model("TempAsset", tempAssetSchema);