const mongoose = require("mongoose");

const rejectedAssetSchema = new mongoose.Schema({
  assetType: { type: String, enum: ["Permanent", "Consumable"], required: false },
  assetCategory: { type: String, required: false },

  // Common fields
  entryDate: { type: Date, required: false },
  subCategory: { type: String, required: false },
  location: { type: String, required: false },
  status: { type: String, required: false },

  // Fields from permanentSchema
  purchaseDate: { type: Date, required: false },
  supplierName: { type: String, required: false },
  supplierAddress: { type: String, required: false },
  source: { type: String, enum: ["GEM", "Local", "Other"], required: false },
  modeOfPurchase: { type: String, enum: ["Tender", "Quotation", "Others"], required: false },
  billNo: { type: String, required: false },
  receivedBy: { type: String, required: false },
  billPhotoUrl: { type: String, required: false },
  items: [{
    itemName: { type: String, required: false },
    subCategory: { type: String, required: false },
    itemDescription: { type: String, required: false },
    quantityReceived: { type: Number, required: false },
    unitPrice: { type: Number, required: false },
    overallPrice: { type: Number, required: false },
    amcDate: { type: Date, required: false },
    itemPhotoUrl: { type: String, required: false },
    itemIds: [{ type: String }]
  }],

  // Fields from landSchema
  dateOfPossession: { type: Date, required: false },
  controllerOrCustody: { type: String, required: false },
  details: { type: String, required: false },

  // Fields from buildingSchema
  type: { type: String, required: false },
  buildingNo: { type: String, unique: true, required: false },
  plinthArea: { type: String, required: false },
  dateOfConstruction: { type: Date, required: false },
  costOfConstruction: { type: Number, required: false },
  remarks: { type: String, required: false },
  rejectionRemarks: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model("RejectedAsset", rejectedAssetSchema);