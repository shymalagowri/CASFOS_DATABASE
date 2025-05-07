const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Permanent"] },
  assetCategory: { type: String, required: true, default: "Building" },
  entryDate: { type: Date, required: true },
  subCategory: { type: String, required: true },
  location: { type: String, required: false },
  type: { type: String, required: false },
  buildingNo: { type: String, required: false },
  approvedEstimate: { type: String, required: false },
  plinthArea: { type: String, required: false },
  status: { type: String, required: false },
  dateOfConstruction: { type: Date, required: false },
  costOfConstruction: { type: Number, required: false },
  remarks: { type: String },
  upgrades: [{
    year: { type: Number, required: false },
    estimate: { type: Number, required: false },
    approvedEstimate: { type: Number, required: false },
    dateOfCompletion: { type: Date, required: false },
    defectliabiltyPeriod: { type: String, required: false }, 
    executionAgency: { type: String, required: false },
    dateOfHandover: { // Add this
      type: Date,
      required: false
    },
    documentUrl: { // Add this
      type: String,
      required: false
    }
  }],
  approvedBuildingPlanUrl: { type: String },
  kmzOrkmlFileUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Building", buildingSchema);