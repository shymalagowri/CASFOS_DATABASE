const mongoose = require("mongoose");

const tempBuildingMaintenanceSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Permanent"] },
  subCategory: { type: String },
  assetCategory: { type: String, required: true, default: "Building" },
  buildingNo: { type: String, required: true },
  yearOfMaintenance: { type: Date, required: true },
  cost: { type: Number, required: true },
  description: { type: String, required: true },
  custody: { type: String, required: true },
  agency: { type: String, required: true },
  status: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
}, { timestamps: true });

module.exports = mongoose.model("TempBuildingMaintenance", tempBuildingMaintenanceSchema);