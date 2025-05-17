// This is a Mongoose model for a Building asset in the Central Academy for State Forest Service (CASFOS) Asset Management System.
// It defines the schema for the Building collection in MongoDB.
// The schema includes various fields related to the building asset, such as asset type, category, entry date,
// subcategory, location, type, building number, approved estimate, plinth area, status, date of construction,
// cost of construction, remarks, and upgrades. The upgrades field is an array of objects that contains information
// about upgrades made to the building, including year, estimate, approved estimate, date of completion,
// defect liability period, execution agency, date of handover, and document URL. The schema also includes URLs for
// the approved building plan and KMZ/KML file. The model is exported for use in other parts of the application.
// The schema uses Mongoose's built-in validation features to enforce required fields and data types.

const mongoose = require("mongoose"); // Import Mongoose for MongoDB schema definition and interaction

const buildingSchema = new mongoose.Schema({ // Define the Building schema
  assetType: { // Field for the type of asset
    type: String, // Data type is String
    required: true, // Required field
    enum: ["Permanent"], // Restricts value to 'Permanent'
  },
  assetCategory: { // Field for the category of the asset
    type: String, // Data type is String
    required: true, // Required field
    default: "Building" // Default value is 'Building'
  },
  entryDate: { // Field for the date the building entry was created
    type: Date, // Data type is Date
    required: true, // Required field
  },
  subCategory: { // Field for the subcategory of the building
    type: String, // Data type is String
    required: true, // Required field
  },
  location: { // Field for the location of the building (optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
  type: { // Field for the type of building (e.g., residential, commercial, optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
  buildingNo: { // Field for the building number or identifier (optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
  approvedEstimate: { // Field for the approved estimate cost of the building (optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
  plinthArea: { // Field for the plinth area of the building (optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
  status: { // Field for the status of the building (e.g., active, under construction, optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
  dateOfConstruction: { // Field for the date when construction was completed (optional)
    type: Date, // Data type is Date
    required: false, // Optional field
  },
  costOfConstruction: { // Field for the cost of constructing the building (optional)
    type: Number, // Data type is Number
    required: false, // Optional field
  },
  remarks: { // Field for additional remarks about the building (optional)
    type: String, // Data type is String
  },
  upgrades: [{ // Field for an array of upgrade records for the building
    year: { // Field for the year the upgrade was performed (optional)
      type: Number, // Data type is Number
      required: false, // Optional field
    },
    estimate: { // Field for the estimated cost of the upgrade (optional)
      type: Number, // Data type is Number
      required: false, // Optional field
    },
    approvedEstimate: { // Field for the approved estimate cost of the upgrade (optional)
      type: Number, // Data type is Number
      required: false, // Optional field
    },
    dateOfCompletion: { // Field for the date the upgrade was completed (optional)
      type: Date, // Data type is Date
      required: false, // Optional field
    },
    defectliabiltyPeriod: { // Field for the defect liability period of the upgrade (optional)
      type: String, // Data type is String
      required: false, // Optional field
    },
    executionAgency: { // Field for the agency responsible for executing the upgrade (optional)
      type: String, // Data type is String
      required: false, // Optional field
    },
    dateOfHandover: { // Field for the date the upgraded building was handed over (optional)
      type: Date, // Data type is Date
      required: false // Optional field
    },
    documentUrl: { // Field for the URL of the upgrade-related document (optional)
      type: String, // Data type is String
      required: false // Optional field
    }
  }],
  approvedBuildingPlanUrl: { // Field for the URL of the approved building plan (optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
  kmzOrkmlFileUrl: { // Field for the URL of the KMZ/KML file for the building (optional)
    type: String, // Data type is String
    required: false, // Optional field
  },
}, { timestamps: true }); // Enable automatic createdAt and updatedAt timestamps

module.exports = mongoose.model("Building", buildingSchema); // Create and export the Building model for the 'Building' collection