const mongoose = require("mongoose");

const ReturnedPermanentSchema = new mongoose.Schema({
  assetType: { type: String, enum: ["Permanent"], default: "Permanent", required: true },
  assetCategory: { type: String, required: true },
  itemName: { type: String },
  subCategory: { type: String },
  itemDescription: { type: String },
  location: { type: String },
  itemId: { type: String },
  status: { type: String, enum: ["returned", "service", "dispose"], default: "returned" },
  remark: { type: String },
  pdfUrl: { type: String },
  signedPdfUrl: { type: String },
  approved: { type: String, enum: ["yes", "no"], default: null },
  servicedEntry: { 
    type: String, 
    enum: ["yes", "no", null], 
    default: null,
    description: "Indicates if the item has a pending service entry in TempServiced"
  },
  servicedRejection: { 
    type: String, 
    enum: ["yes", "no", null], 
    default: null,
    description: "Indicates if the service request was rejected"
  },
  servicedRejectionRemarks: { 
    type: String, 
    default: null,
    description: "Remarks for why the service was rejected"
  },
  rejectionRemarks: { type: String, default: null } // Added
});

module.exports = mongoose.model("ReturnedPermanent", ReturnedPermanentSchema);