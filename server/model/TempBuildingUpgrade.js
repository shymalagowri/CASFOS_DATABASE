const mongoose = require("mongoose");

const tempBuildingUpgradeSchema = new mongoose.Schema({
    subCategory: {
        type: String,
        required: true
    },
    upgrades: [{
        year: {
            type: Number,
            required: true
        },
        estimate: {
            type: Number,
            required: true,
            min: 0
        },
        approvedEstimate: {
            type: Number,
            required: true,
            min: 0
        },
        dateOfCompletion: {
            type: Date,
            required: true
        },
        defectliabiltyPeriod: {
            type: String,
            required: true
        },
        executionAgency: {
            type: String,
            required: true
        },
        dateOfHandover: { // Add this
            type: Date,
            required: true
        },
        documentUrl: { // Add this
            type: String,
            required: false
        }
    }]

}, { timestamps: true });

module.exports = mongoose.model("TempBuildingUpgrade", tempBuildingUpgradeSchema);