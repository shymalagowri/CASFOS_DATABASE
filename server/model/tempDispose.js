const mongoose = require("mongoose");

const tempdisposeAssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  assetCategory: { type: String, required: true },

  // Fields for non-building assets (no longer required)
  itemName: { type: String, required: false },
  subCategory: { type: String, required: false },
  itemDescription: { type: String, required: false },
  quantity: { type: Number, required: false },
  itemIds: [{ type: String, required: false }],
  purchaseValue: { type: Number, required: false },
  bookValue: { type: Number, required: false },
  inspectionDate: { type: Date, required: false },
  condemnationDate: { type: Date, required: false },
  remark: { type: String, required: false },
  disposalValue: { type: Number, required: false },
  methodOfDisposal: { type: String,  required: false }, // Added
  // fields for building condemnation (not required)
  condemnationYear: { type: Number, required: false }, 
  certificateObtained: { type: String, enum: ["Yes", "No"], required: false }, 
  authority: { type: String, required: false }, 
  dateOfReferenceUrl: { type: String, required: false },
  agency: { type: String, required: false }, 
  agencyReferenceNumberUrl: { type: String, required: false }, 
  date: { type: Date, required: false },
  demolitionPeriod: { type: String, required: false },
  demolitionEstimate: { type: Number, required: false },
});

module.exports = mongoose.model("tempDispose", tempdisposeAssetSchema);