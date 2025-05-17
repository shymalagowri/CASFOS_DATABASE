/**
 * This file defines the Mongoose schema for the Issued Permanent model.
 * It represents the structure of data related to permanent assets that have been issued,
 * including details such as asset type, category, item name, description, and issue details
 * (e.g., issued to, location, quantity, issued date, and issued IDs).
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

// Define the schema for Issued Permanent assets
const IssuedPermanentSchema = new mongoose.Schema({
  // Type of asset (restricted to "Permanent")
  assetType: { 
    type: String, 
    enum: ['Permanent'], // Ensures only "Permanent" is allowed
    default: 'Permanent', 
    required: true 
  },
  // Category of the asset
  assetCategory: { 
    type: String, 
    required: true,
    minlength: 2, // Minimum length of the category name
    maxlength: 50 // Maximum length of the category name
  },
  // Name of the item
  itemName: { 
    type: String, 
    required: true,
    minlength: 2, // Minimum length of the item name
    maxlength: 100 // Maximum length of the item name
  },
  // Subcategory of the item
  subCategory: { 
    type: String 
  },
  // Description of the item
  itemDescription: { 
    type: String, 
    required: true,
    minlength: 5, // Minimum length of the description
    maxlength: 500 // Maximum length of the description
  },
  // Details of issues for the permanent item
  issues: [{
    // Name of the person or entity to whom the item was issued
    issuedTo: { 
      type: String, 
      required: true,
      minlength: 2, // Minimum length of the issuedTo field
      maxlength: 100 // Maximum length of the issuedTo field
    },
    // Location where the item was issued
    location: { 
      type: String, 
      required: false // Location is optional
    },
    // Quantity of the item issued
    quantity: { 
      type: Number, 
      required: true,
      min: 1, // Minimum quantity allowed
      max: 10000 // Maximum quantity allowed
    },
    // Date when the item was issued
    issuedDate: { 
      type: Date, 
      default: Date.now, // Defaults to the current date
      max: Date.now // Ensures the issued date is not in the future
    },
    // IDs of the issued items
    issuedIds: [{ 
      type: String 
    }]
  }]
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model('IssuedPermanent', IssuedPermanentSchema);