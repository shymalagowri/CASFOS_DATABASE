// This file defines the schema and model for the Asset Manager in a MongoDB database using Mongoose.
// It includes fields for name, password, role, date of birth, designation, phone number, organization, ministry, and joined date.
// The model is exported for use in other parts of the application.
// The code also includes validation for required fields and formats for the phone number.
// The joined date is set to the current date and time in IST (Indian Standard Time) by default.
// The model is named 'assetmanagerlogin' and is used to interact with the corresponding collection in the database

const mongoose = require('mongoose'); // Import Mongoose for MongoDB schema definition and interaction

const assetManagerSchema = new mongoose.Schema({ // Define the Asset Manager schema
  name: { // Field for the asset manager's name
    type: String, // Data type is String
    required: [true, "Please Enter a Name"], // Required field with custom error message
    trim: true, // Removes leading/trailing whitespace
    maxlength: 50 // Maximum length of 50 characters
  },
  password: { // Field for the asset manager's password
    type: String, // Data type is String
    required: [true, "Please Enter a Password"], // Required field with custom error message
    minlength: 6 // Minimum length of 6 characters
  },
  role: { // Field for the asset manager's role
    type: String, // Data type is String
    required: true, // Required field
    default: 'assetmanager' // Default value is 'assetmanager'
  },
  dob: { // Field for the asset manager's date of birth
    type: Date, // Data type is Date
    required: false // Optional field
  },
  designation: { // Field for the asset manager's designation
    type: String, // Data type is String
    required: false, // Optional field
    trim: true // Removes leading/trailing whitespace
  },
  phone: { // Field for the asset manager's phone number
    type: String, // Data type is String
    required: false, // Optional field
    match: /^[0-9]{10}$/ // Validates that the phone number is exactly 10 digits
  },
  organization: { // Field for the asset manager's organization
    type: String, // Data type is String
    required: false, // Optional field
    trim: true // Removes leading/trailing whitespace
  },
  ministry: { // Field for the asset manager's ministry
    type: String, // Data type is String
    required: false, // Optional field
    trim: true // Removes leading/trailing whitespace
  },
  joined: { // Field for the date the asset manager joined
    type: Date, // Data type is Date
    required: false, // Optional field
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // Default value is current date/time adjusted to IST (+5.5 hours)
  }
});

const AssetManagerModel = mongoose.model('assetmanagerlogin', assetManagerSchema); // Create and name the model 'assetmanagerlogin' for the schema
module.exports = AssetManagerModel; // Export the model for use in other parts of the application