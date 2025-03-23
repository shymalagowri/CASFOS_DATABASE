const mongoose = require("mongoose");

const ReturnedPermanentSchema = new mongoose.Schema({
  assetType: {
    type: String,
    enum: ['Permanent'],
    default: 'Permanent',
    required: true
  },
  assetCategory: { type: String, required: true },
  itemName: { type: String },
  subCategory: { type: String },
  itemDescription: { type: String },
  location: { type: String },
  itemId: { type: String },
  status: { type: String, enum: ['returned', 'service', 'dispose'] }
});

module.exports = mongoose.model("ReturnedPermanent", ReturnedPermanentSchema);