/**
 * This file defines the Mongoose schema for the Land model.
 * It represents the structure of data related to land assets, including details such as
 * asset type, category, entry date, subcategory, location, status, date of possession,
 * controller or custody, and additional details.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

// Define the schema for Land assets
const landSchema = new mongoose.Schema({
  // Type of asset (restricted to "Permanent")
  assetType: { 
    type: String, 
    required: true, 
    enum: ["Permanent"] // Ensures only "Permanent" is allowed
  },
  // Category of the asset (default is "Land")
  assetCategory: { 
    type: String, 
    required: true, 
    default: "Land" 
  },
  // Date of entry for the land asset
  entryDate: { 
    type: Date, 
    required: true 
  },
  // Subcategory of the land asset
  subCategory: { 
    type: String, 
    required: true 
  },
  // Location of the land asset
  location: { 
    type: String, 
    required: true 
  },
  // Status of the land asset (e.g., "Occupied", "Vacant")
  status: { 
    type: String, 
    required: true 
  },
  // Date of possession of the land asset
  dateOfPossession: { 
    type: Date, 
    required: true 
  },
  // Controller or custody details of the land asset
  controllerOrCustody: { 
    type: String, 
    required: true 
  },
  // Additional details about the land asset
  details: { 
    type: String 
  }
}, { 
  // Enable automatic timestamps for createdAt and updatedAt fields
  timestamps: true 
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("Land", landSchema);