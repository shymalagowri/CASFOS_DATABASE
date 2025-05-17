/**
 * This file defines the Mongoose schema for the Rejected Asset model.
 * It represents the structure of data related to assets that have been rejected,
 * including details such as asset type, category, location, purchase details, item-specific fields,
 * building-specific fields, and rejection-related information.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const rejectedAssetSchema = new mongoose.Schema({
  // Common fields across asset-related schemas
  assetType: { 
    type: String, 
    enum: ["Permanent", "Consumable"], // Restricts to specific asset types
    required: true 
  },
  assetCategory: { 
    type: String, 
    required: true 
  },
  subCategory: { 
    type: String 
  },
  location: { 
    type: String 
  },
  entryDate: { 
    type: Date 
  },
  remarks: { 
    type: String 
  },
  // Remarks explaining why the asset was rejected
  rejectionRemarks: { 
    type: String, 
    required: true 
  },

  // Fields from original asset purchase
  purchaseDate: { 
    type: Date 
  },
  supplierName: { 
    type: String 
  },
  supplierAddress: { 
    type: String 
  },
  source: { 
    type: String 
  },
  modeOfPurchase: { 
    type: String 
  },
  billNo: { 
    type: String 
  },
  receivedBy: { 
    type: String 
  },
  billPhotoUrl: { 
    type: String 
  },

  // Item-specific fields
  items: [{
    itemName: { type: String },
    subCategory: { type: String },
    itemDescription: { type: String },
    quantityReceived: { type: Number },
    unitPrice: { type: Number },
    totalPrice: { type: Number },
    amcFromDate: { type: Date },
    amcToDate: { type: Date },
    amcCost: { type: Number },
    amcPhotoUrl: { type: String },
    warrantyNumber: { type: String },
    warrantyValidUpto: { type: Date },
    warrantyPhotoUrl: { type: String },
    itemIds: [{ type: String }],
    itemPhotoUrl: { type: String },
  }],

  // Building-specific fields (common with Building schema)
  type: { type: String },
  buildingNo: { type: String },
  plinthArea: { type: String },
  dateOfConstruction: { type: Date },
  costOfConstruction: { type: Number },
  approvedEstimate: { type: String }, // For building upgrades or initial approval
  approvedBuildingPlanUrl: { type: String },
  kmzOrkmlFileUrl: { type: String },

  // Building upgrade fields (for rejected upgrades)
  upgrades: [{
    year: { type: Number },
    estimate: { type: Number },
    approvedEstimate: { type: Number },
    dateOfCompletion: { type: Date },
    defectliabiltyPeriod: { type: String },
    executionAgency: { type: String },
  }],

  // Fields from TempIssueSchema
  itemName: { type: String },
  itemDescription: { type: String },
  issuedTo: { type: String },
  quantity: { type: Number },
  issuedIds: [{ type: String }],
  pdfUrl: { type: String },
  signedPdfUrl: { type: String },
  acknowledged: { 
    type: String, 
    enum: ["yes", "no"], 
    default: "no" 
  },
  rejected: { 
    type: String, 
    enum: ["yes", "no"], 
    default: "yes" 
  },

  // Fields from Returned schemas
  status: { type: String }, // Condition/status from returns
  returnQuantity: { type: Number },
  itemId: { type: String },
  returnIds: [{ type: String }],
  approved: { 
    type: String, 
    enum: ["yes", "no"], 
    default: "no" 
  },

  // Fields from TempServicedSchema
  serviceNo: { type: String },
  serviceDate: { type: Date },
  serviceAmount: { type: Number },
  itemIds: [{ type: String }],

  // Fields from TempDisposeAssetSchema
  purchaseValue: { type: Number },
  bookValue: { type: Number },
  inspectionDate: { type: Date },
  condemnationDate: { type: Date },
  disposalValue: { type: Number },
  methodOfDisposal: { type: String },
  condemnationYear: { type: String }, // Year of condemnation
  certificateObtained: { type: String }, // Certificate details
  authority: { type: String }, // Authority issuing the certificate
  dateOfReferenceUrl: { type: String }, // URL to reference document
  agency: { type: String }, // Agency responsible for demolition
  agencyReferenceNumberUrl: { type: String }, // URL to agency reference document
  date: { type: Date }, // Date of disposal request or action
  demolitionPeriod: { type: String }, // Estimated demolition period
  demolitionEstimate: { type: Number },
  yearOfMaintenance: { type: Date },
  cost: { type: Number },
  description: { type: String },
  custody: { type: String },
  agency: { type: String },
  remark: { type: String, required: false },

  // Asset ID and updated data for rejected updates
  assetId: { type: mongoose.Schema.Types.ObjectId },
  updatedData: { type: Object },

}, { 
  // Enable automatic timestamps for createdAt and updatedAt fields
  timestamps: true 
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("RejectedAsset", rejectedAssetSchema);