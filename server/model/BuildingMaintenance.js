const mongoose = require("mongoose");

const buildingMaintenanceSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Permanent"] },
  assetCategory: { type: String, required: true, default: "Building" },
  buildingNo: { type: String, required: true },
  yearOfMaintenance: { type: Date, required: true },
  cost: { type: Number, required: true },
  description: { type: String, required: true },
  custody: { type: String, required: true },
  agency: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("BuildingMaintenance", buildingMaintenanceSchema);