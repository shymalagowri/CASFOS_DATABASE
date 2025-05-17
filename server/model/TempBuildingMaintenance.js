/**
 * This file defines the Mongoose schema for the Temp Building Maintenance model.
 * It represents the structure of data related to temporary building maintenance entries,
 * including details such as asset type, category, building number, year of maintenance,
 * cost, description, custody, agency, and status.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const tempBuildingMaintenanceSchema = new mongoose.Schema({
  // Type of asset (restricted to "Permanent")
  assetType: { type: String, required: true, enum: ["Permanent"] },
  // Subcategory of the building (optional)
  subCategory: { type: String },
  // Category of the asset (default is "Building")
  assetCategory: { type: String, required: true, default: "Building" },
  // Building number
  buildingNo: { type: String, required: true },
  // Year of maintenance
  yearOfMaintenance: { type: Date, required: true },
  // Cost of maintenance
  cost: { type: Number, required: true },
  // Description of the maintenance work
  description: { type: String, required: true },
  // Custody information
  custody: { type: String, required: true },
  // Agency responsible for maintenance
  agency: { type: String, required: true },
  // Status of the maintenance entry (pending, approved, or rejected)
  status: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("TempBuildingMaintenance", tempBuildingMaintenanceSchema);