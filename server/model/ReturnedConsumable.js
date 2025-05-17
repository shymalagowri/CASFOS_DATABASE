/**
 * This file defines the Mongoose schema for the Returned Consumable model.
 * It represents the structure of data related to consumable assets that have been returned,
 * including details such as asset type, category, item name, description, location, status,
 * return quantity, approval status, and disposal-related information.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const returnedConsumableSchema = new mongoose.Schema({
  // Type of asset (restricted to "Consumable")
  assetType: { 
    type: String, 
    required: true, 
    enum: ["Consumable"] // Ensures only "Consumable" is allowed
  },
  // Category of the asset
  assetCategory: { 
    type: String, 
    required: false // Asset category is optional
  },
  // Name of the item
  itemName: { 
    type: String, 
    required: true // Item name is required
  },
  // Subcategory of the item
  subCategory: String, // Optional field
  // Description of the item
  itemDescription: String, // Optional field
  // Location of the item
  location: String, // Optional field
  // Status of the returned item
  status: { 
    type: String, 
    enum: ["Good", "exchange", "dispose", "returned"], // Allowed statuses
    default: "returned" // Defaults to "returned"
  },
  // URL of the PDF document related to the return
  pdfUrl: String, // Optional field
  // URL of the signed PDF document
  signedPdfUrl: String, // Optional field
  // Remarks about the return
  remark: String, // Optional field
  // Quantity of the item being returned
  returnQuantity: { 
    type: Number, 
    required: true // Return quantity is required
  },
  // Approval status of the return
  approved: { 
    type: String, 
    enum: ["yes", "no"], // Allowed values for approval
    default: null // Defaults to null
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
  // Approval status from the Head of Office (HOO)
  hooapproval: { 
    type: String, 
    enum: ["waiting", null], // Allowed values
    default: null // Defaults to null
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
  },
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("ReturnedConsumable", returnedConsumableSchema);