const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Permanent"] },
  assetCategory: { type: String, required: true, default: "Building" },
  entryDate: { type: Date, required: true },
  subCategory: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  buildingNo: { type: String, required: true, unique: true },
  plinthArea: { type: String, required: true },
  status: { type: String, required: true },
  dateOfConstruction: { type: Date, required: true },
  costOfConstruction: { type: Number, required: true },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Building", buildingSchema);