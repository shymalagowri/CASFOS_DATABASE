const mongoose = require("mongoose");

const exchangedConsumableSchema = new mongoose.Schema({
  assetType: {
    type: String,
    required: true,
    enum: ["Consumable"],
    default: "Consumable",
  },
  assetCategory: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  returnedQuantity: {
    type: Number,
    required: true,
  },
  exchangeDate: {
    type: Date,
    default: Date.now,
  },
  remark: {
    type: String,
  },
  pdfUrl: {
    type: String,
  },
  signedPdfUrl: {
    type: String,
  },
  originalReturnedAssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReturnedConsumable",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("ExchangedConsumable", exchangedConsumableSchema);