// This file defines the Mongoose schema and model for the Data Entry user in the Central Academy for State Forest Service (CASFOS) Asset Management System.
// It represents the structure of data for data entry personnel, including fields for name, date of birth, designation, phone number, access permissions,
// organization, ministry, role, password, and joined date.
// The model is named 'dataentrylogin' and is used to interact with the corresponding collection in the MongoDB database.
// The schema includes validation for required fields, phone number format, and password length, with the joined date set to the current time in IST by default.

const mongoose = require('mongoose'); // Import Mongoose for MongoDB schema definition and interaction

const DataEntrySchema = new mongoose.Schema({ // Define the DataEntry schema
    name: { // Field for the data entry user's name
        type: String, // Data type is String
        required: true, // Required field
        trim: true // Removes leading/trailing whitespace
    },
    dob: { // Field for the data entry user's date of birth
        type: Date, // Data type is Date
        required: true // Required field
    },
    designation: { // Field for the data entry user's designation
        type: String, // Data type is String
        required: true, // Required field
        trim: true // Removes leading/trailing whitespace
    },
    phone: { // Field for the data entry user's phone number
        type: String, // Data type is String
        required: true, // Required field
        match: /^[0-9]{10}$/ // Validates that the phone number is exactly 10 digits
    },
    access: { // Field for the array of access permissions granted to the user
        type: [String], // Data type is an array of Strings
        default: [], // Default value is an empty array
        required: true // Required field
    },
    organization: { // Field for the data entry user's organization
        type: String, // Data type is String
        required: true, // Required field
        trim: true // Removes leading/trailing whitespace
    },
    ministry: { // Field for the data entry user's ministry
        type: String, // Data type is String
        required: true, // Required field
        trim: true // Removes leading/trailing whitespace
    },
    role: { // Field for the data entry user's role
        type: String, // Data type is String
        default: "dataentry" // Default value is 'dataentry', indicating a fixed role
    },
    password: { // Field for the data entry user's password
        type: String, // Data type is String
        required: true, // Required field
        minlength: 6 // Minimum length of 6 characters
    },
    joined: { // Field for the date the data entry user joined
        type: Date, // Data type is Date
        default: () => { // Default value is a function that returns the current date/time adjusted to IST
            let date = new Date(); // Get the current date and time
            let istOffset = 5.5 * 60 * 60 * 1000; // Calculate IST offset (5.5 hours in milliseconds)
            return new Date(date.getTime() + istOffset); // Return the adjusted date
        }
    },
});

const DataEntryModel = mongoose.model('dataentrylogin', DataEntrySchema); // Create and name the model 'dataentrylogin' for the schema
module.exports = DataEntryModel; // Export the model for use in other parts of the application