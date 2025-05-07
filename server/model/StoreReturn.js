const mongoose = require("mongoose");

const StoreReturnSchema = new mongoose.Schema({
  assetType: {
    type: String,
    required: true,
    enum: ["Permanent", "Consumable"],
  },
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
  },
  subCategory: {
    type: String,
    maxlength: 50,
  },
  itemDescription: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  },
  location: {
    type: String,
    required: true,
    default: "Store",
  },
  itemIds: {
    type: [String],
    default: [],
  },
  returnedQuantity: {
    type: Number,
    min: 0,
  },
  pdfUrl: {
    type: String,
  },
  signedPdfUrl: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
  source: {
    type: String,
    required: true,
    default: "store",
  },
  originalStoreId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StoreReturn", StoreReturnSchema);