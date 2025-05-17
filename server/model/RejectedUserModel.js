/**
 * This file defines the Mongoose schema for the Rejected User model.
 * It represents the structure of data related to users whose accounts or requests have been rejected,
 * including details such as name, password, role, date of birth, designation, phone number,
 * organization, ministry, rejection remarks, and the date of rejection.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

// Define the schema for Rejected Users
const rejectedUserSchema = new mongoose.Schema({
  // Name of the user
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], // Name is required
    trim: true, // Removes leading and trailing whitespace
    maxlength: 50 // Maximum length of the name
  },
  // Password for the user
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], // Password is required
    minlength: 6 // Minimum length of the password
  },
  // Role of the user
  role: { 
    type: String, 
    required: [true, "Please Enter role"], // Role is required
  },
  // Date of birth of the user
  dob: { 
    type: Date, 
    required: false // Date of birth is optional
  },
  // Designation of the user
  designation: { 
    type: String, 
    required: false, // Designation is optional
    trim: true 
  },
  // Phone number of the user (must be a 10-digit number)
  phone: { 
    type: String, 
    required: false, // Phone number is optional
    match: /^[0-9]{10}$/ // Validates the phone number format
  },
  // Organization the user belongs to
  organization: { 
    type: String, 
    required: false, // Organization is optional
    trim: true 
  },
  // Ministry the user is associated with
  ministry: { 
    type: String, 
    required: false, // Ministry is optional
    trim: true 
  },
  // Remark explaining the reason for rejection
  remark: { 
    type: String, 
    required: [true, "Remark is required for rejection"], // Remark is required
    trim: true // Removes leading and trailing whitespace
  },
  // Date when the rejection occurred
  rejectedAt: { 
    type: Date, 
    required: false, // Rejection date is optional
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // Defaults to the current date in IST
  }
});

// Create the Mongoose model for Rejected Users
const RejectedUser = mongoose.model('RejectedUser', rejectedUserSchema);

// Export the model for use in other parts of the application
module.exports = RejectedUser;