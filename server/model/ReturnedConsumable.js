const mongoose = require("mongoose");

const returnedConsumableSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ["Consumable"] },
  assetCategory: { type: String, required: false },
  itemName: { type: String, required: true },
  subCategory: String,
  itemDescription: String,
  location: String,
  status: { type: String, enum: ["Good","exchange", "dispose","returned"],default: "returned" },
  pdfUrl: String,
  signedPdfUrl: String,
  remark: String,
  returnQuantity: { type: Number, required: true }, // Fix typo and set type to Number
  approved: { type: String, enum: ["yes", "no"], default: null },
  rejectionRemarks: { type: String, default: null },
  disposedEntry: { 
    type: String, 
    enum: ["yes", "no", null], 
    default: null,
    description: "Indicates if the item has a pending disposal entry in TempDispose"
  },hooapproval: { type: String, enum: ["waiting", null], default: null },
  rejectedDisposal: { 
    type: String, 
    enum: ["yes", "no", null], 
    default: null,
    description: "Indicates if the disposal request was rejected"
  },
  disposalRemarks: { 
    type: String, 
    default: null,
    description: "Remarks for why the disposal was rejected"
  },
});

module.exports = mongoose.model("ReturnedConsumable", returnedConsumableSchema);