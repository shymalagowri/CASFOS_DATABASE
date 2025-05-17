/**
 * This file defines the Mongoose schema for the Pending Asset Update model.
 * It represents the structure of data related to asset updates that are pending approval,
 * including details such as the asset ID, type, original data, updated data, status,
 * and any remarks for rejection.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

// Define the schema for Pending Asset Updates
const pendingUpdateSchema = new mongoose.Schema({
  // ID of the asset being updated
  assetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  // Type of the asset (Permanent or Consumable)
  assetType: { 
    type: String, 
    enum: ["Permanent", "Consumable"], // Restricts to specific asset types
    required: true 
  },
  // Original data of the asset before the update
  originalData: { 
    type: Object, 
    required: true 
  },
  // Updated data of the asset
  updatedData: { 
    type: Object, 
    required: true 
  },
  // Status of the update (pending, approved, or rejected)
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], // Restricts to specific statuses
    default: "pending" // Defaults to "pending"
  },
  // Remarks for rejection, if applicable
  rejectionRemarks: { 
    type: String 
  }
}, { 
  // Enable automatic timestamps for createdAt and updatedAt fields
  timestamps: true 
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("PendingAssetUpdate", pendingUpdateSchema);