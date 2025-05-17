/**
 * This file defines the Mongoose schema for the Temp Building Upgrade model.
 * It represents the structure of data related to temporary building upgrade entries,
 * including details such as subcategory, upgrade years, estimates, completion dates,
 * defect liability period, execution agency, handover date, and related documents.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require("mongoose");

const tempBuildingUpgradeSchema = new mongoose.Schema({
    // Subcategory of the building (e.g., type of building)
    subCategory: {
        type: String,
        required: true
    },
    // Array of upgrade details for the building
    upgrades: [{
        // Year of the upgrade
        year: {
            type: Number,
            required: true
        },
        // Estimated cost for the upgrade
        estimate: {
            type: Number,
            required: true,
            min: 0
        },
        // Approved estimate for the upgrade
        approvedEstimate: {
            type: Number,
            required: true,
            min: 0
        },
        // Date when the upgrade was completed
        dateOfCompletion: {
            type: Date,
            required: true
        },
        // Defect liability period for the upgrade
        defectliabiltyPeriod: {
            type: String,
            required: true
        },
        // Agency responsible for executing the upgrade
        executionAgency: {
            type: String,
            required: true
        },
        // Date when the building was handed over after upgrade
        dateOfHandover: {
            type: Date,
            required: true
        },
        // URL to the document related to the upgrade (optional)
        documentUrl: {
            type: String,
            required: false
        }
    }]
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model("TempBuildingUpgrade", tempBuildingUpgradeSchema);