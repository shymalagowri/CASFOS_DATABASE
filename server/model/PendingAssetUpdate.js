const mongoose = require("mongoose");

const pendingUpdateSchema = new mongoose.Schema({
    assetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    assetType: { type: String, enum: ["Permanent", "Consumable"], required: true },
    originalData: { type: Object, required: true },
    updatedData: { type: Object, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionRemarks: { type: String },
  }, { timestamps: true });
  
  module.exports = mongoose.model("PendingAssetUpdate", pendingUpdateSchema);