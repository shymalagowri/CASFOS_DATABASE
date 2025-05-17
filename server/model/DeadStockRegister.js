/**
 * This file defines the Mongoose schema for the Dead Stock Register model.
 * It represents the structure of data related to assets that are no longer in active use,
 * including details such as asset type, category, subcategory, item name, description,
 * quantities (serviceable, condemned, overall), method of disposal, and remarks.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

// Define the schema for the Dead Stock Register
const deadStockRegisterSchema = new mongoose.Schema({
  // Type of asset (Permanent or Consumable)
  assetType: { 
    type: String, 
    enum: ["Permanent", "Consumable"], 
    required: true 
  },
  // Category of the asset
  assetCategory: { 
    type: String, 
    required: true 
  },
  // Subcategory of the asset
  assetSubCategory: { 
    type: String, 
    required: true 
  },
  // Name of the item
  itemName: { 
    type: String, 
    required: true 
  },
  // Description of the item
  itemDescription: { 
    type: String, 
    required: true 
  },
  // Quantity of the item that is still serviceable
  servicableQuantity: { 
    type: Number, 
    default: 0 
  },
  // Quantity of the item that has been condemned
  condemnedQuantity: { 
    type: Number, 
    default: 0 
  },
  // Overall quantity of the item
  overallQuantity: { 
    type: Number, 
    required: true 
  },
  // Method of disposal for the item
  methodOfDisposal: { 
    type: String, 
    required: false 
  },
  // Additional remarks about the item
  remarks: { 
    type: String,
    required: false
  },
}, { 
  // Enable automatic timestamps for createdAt and updatedAt fields
  timestamps: true 
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("DeadStockRegister", deadStockRegisterSchema);