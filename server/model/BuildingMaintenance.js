/**
 * This file defines the Mongoose schema for the Building Maintenance model.
 * It represents the structure of data related to building maintenance records,
 * including details such as asset type, category, building number, maintenance year,
 * cost, description, custody, and agency.
 * The schema is used to interact with the corresponding collection in the database.
 */

// Import the Mongoose library for MongoDB schema creation
const mongoose = require("mongoose");

// Define the Mongoose schema for BuildingMaintenance
const buildingMaintenanceSchema = new mongoose.Schema({
  // Asset type field, required, limited to 'Permanent'
  assetType: { type: String, required: true, enum: ["Permanent"] },
  // Asset category field, required, defaults to 'Building'
  assetCategory: { type: String, required: true, default: "Building" },
  // Sub-category field, optional string
  subCategory: { type: String },
  // Building number field, required string
  buildingNo: { type: String, required: true },
  // Year of maintenance field, required date
  yearOfMaintenance: { type: Date, required: true },
  // Cost of maintenance field, required number
  cost: { type: Number, required: true },
  // Description of maintenance field, required string
  description: { type: String, required: true },
  // Custody field, required string indicating responsible entity
  custody: { type: String, required: true },
  // Agency field, required string indicating performing agency
  agency: { type: String, required: true }
}, 
{ 
  // Enable automatic timestamps for createdAt and updatedAt fields
  timestamps: true 
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("BuildingMaintenance", buildingMaintenanceSchema);