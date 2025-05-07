const mongoose = require("mongoose");

const deadStockRegisterSchema = new mongoose.Schema({
  assetType: { type: String, enum: ["Permanent", "Consumable"], required: true },
  assetCategory: { type: String, required: true },
  assetSubCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  itemDescription: { type: String, required: true },
  servicableQuantity: { type: Number, default: 0 }, // From ReturnedPermanent/ReturnedConsumable
  condemnedQuantity: { type: Number, default: 0 }, // From disposed assets
  overallQuantity: { type: Number, required: true }, // From Permanent/Consumable collections
  methodOfDisposal: { type: String, enum: ["Sold", "Auctioned", "Destroyed", "Other"], required: true },
  remarks: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("DeadStockRegister", deadStockRegisterSchema);