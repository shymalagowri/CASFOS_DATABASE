const mongoose = require("mongoose");

const landSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Permanent"] },
  assetCategory: { type: String, required: true, default: "Land" },
  entryDate: { type: Date, required: true },
  subCategory: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true },
  dateOfPossession: { type: Date, required: true },
  controllerOrCustody: { type: String, required: true },
  details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Land", landSchema);