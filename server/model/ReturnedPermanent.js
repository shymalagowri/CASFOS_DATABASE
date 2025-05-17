/**
 * This file defines the Mongoose schema for the Returned Permanent model.
 * It represents the structure of data related to permanent assets that have been returned,
 * including details such as asset type, category, item name, description, location, status,
 * return-related remarks, approval status, and service or disposal-related information.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const ReturnedPermanentSchema = new mongoose.Schema({
  // Type of asset (restricted to "Permanent")
  assetType: { 
    type: String, 
    enum: ["Permanent"], // Ensures only "Permanent" is allowed
    default: "Permanent", 
    required: true 
  },
  // Category of the asset
  assetCategory: { 
    type: String, 
    required: false // Asset category is optional
  },
  // Name of the item
  itemName: { 
    type: String // Optional field
  },
  // Subcategory of the item
  subCategory: { 
    type: String // Optional field
  },
  // Description of the item
  itemDescription: { 
    type: String // Optional field
  },
  // Location of the item
  location: { 
    type: String // Optional field
  },
  // ID of the item
  itemId: { 
    type: String // Optional field
  },
  // Status of the returned item
  status: { 
    type: String, 
    enum: ["Good", "service", "dispose", "returned"], // Allowed statuses
    default: "returned" // Defaults to "returned"
  },
  // Remarks about the return
  remark: { 
    type: String // Optional field
  },
  // URL of the PDF document related to the return
  pdfUrl: { 
    type: String // Optional field
  },
  // URL of the signed PDF document
  signedPdfUrl: { 
    type: String // Optional field
  },
  // Approval status of the return
  approved: { 
    type: String, 
    enum: ["yes", "no"], // Allowed values for approval
    default: null // Defaults to null
  },
  // Indicates if the item has a pending service entry
  servicedEntry: { 
    type: String, 
    enum: ["yes", "no", null], // Allowed values
    default: null, // Defaults to null
    description: "Indicates if the item has a pending service entry in TempServiced"
  },
  // Approval status from the Head of Office (HOO)
  hooapproval: { 
    type: String, 
    enum: ["waiting", null], // Allowed values
    default: null // Defaults to null
  },
  // Indicates if the service request was rejected
  servicedRejection: { 
    type: String, 
    enum: ["yes", "no", null], // Allowed values
    default: null, // Defaults to null
    description: "Indicates if the service request was rejected"
  },
  // Remarks for why the service was rejected
  servicedRejectionRemarks: { 
    type: String, 
    default: null, // Defaults to null
    description: "Remarks for why the service was rejected"
  },
  // Remarks for rejection, if applicable
  rejectionRemarks: { 
    type: String, 
    default: null // Defaults to null
  },
  // Indicates if the item has a pending disposal entry
  disposedEntry: { 
    type: String, 
    enum: ["yes", "no", null], // Allowed values
    default: null, // Defaults to null
    description: "Indicates if the item has a pending disposal entry in TempDispose"
  },
  // Indicates if the disposal request was rejected
  rejectedDisposal: { 
    type: String, 
    enum: ["yes", "no", null], // Allowed values
    default: null, // Defaults to null
    description: "Indicates if the disposal request was rejected"
  },
  // Remarks for why the disposal was rejected
  disposalRemarks: { 
    type: String, 
    default: null, // Defaults to null
    description: "Remarks for why the disposal was rejected"
  }
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("ReturnedPermanent", ReturnedPermanentSchema);