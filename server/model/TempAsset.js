// models/TempAsset.js

const mongoose = require("mongoose");
const { validateAssetCategory, validateSubCategory, validateItemName } = require("./AssetValidation");

const tempAssetSchema = new mongoose.Schema({
  // Type of asset (Permanent or Consumable)
  assetType: {
    type: String,
    enum: ["Permanent", "Consumable"], 
    required: false,
  },
  // Category of the asset
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
  // Subcategory of the asset
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
  // Location of the asset
  location: { type: String, required: false },
  // Status of the asset
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
  // Array of items associated with the asset
  items: [{
    // Name of the item
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
    // Subcategory of the item
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
    // Description of the item
    itemDescription: { type: String, required: false },
    // Quantity of the item received
    quantityReceived: { type: Number, required: false },
    // Unit price of the item
    unitPrice: { type: Number, required: false },
    // Total price of the item
    totalPrice: { type: Number }, // Changed from overallPrice
    // AMC (Annual Maintenance Contract) start date
    amcFromDate: { type: Date, required: false },
    // AMC end date
    amcToDate: { type: Date, required: false },
    // Cost of the AMC
    amcCost: { type: Number, required: false },
    // URL of the AMC document
    amcPhotoUrl: { type: String, required: false },
    // URL of the item photo
    itemPhotoUrl: { type: String, required: false },
    // Warranty number for the item
    warrantyNumber: { type: String },
    // Warranty validity date
    warrantyValidUpto: { type: Date },
    // URL of the warranty document
    warrantyPhotoUrl: { type: String },
    // Array of IDs associated with the item
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

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("TempAsset", tempAssetSchema);