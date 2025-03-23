const mongoose = require("mongoose");

const ReturnedConsumableSchema = new mongoose.Schema({
  assetType: { 
    type: String, 
    enum: ['Consumable'], 
    default: 'Consumable', 
    required: true 
  },
  assetCategory: { type: String, required: true },
  itemName: { type: String, required: true },
  subCategory: { type: String },
  itemDescription: { type: String, required: true },
  location: { type: String, required: true },
  returnQuantity: { type: Number, required: true },
  condition: { type: String, required: true, enum: ["Good", "Servicable"] }
});

module.exports = mongoose.model("ReturnedConsumable", ReturnedConsumableSchema);