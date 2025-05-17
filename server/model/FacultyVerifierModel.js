/**
 * This file defines the Mongoose schema for the Faculty Verifier model.
 * It represents the structure of data related to faculty verifiers, including details
 * such as name, password, role, date of birth, designation, phone number, organization,
 * ministry, and the date they joined.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

// Define the schema for Faculty Verifier
const facultyverifierSchema = new mongoose.Schema({
  // Name of the verifier
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], // Name is required
    trim: true, // Removes leading and trailing whitespace
    maxlength: 50 // Maximum length of the name
  },
  // Password for the verifier
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], // Password is required
    minlength: 6 // Minimum length of the password
  },
  // Role of the verifier (default is 'facultyverifier')
  role: { 
    type: String, 
    required: true, 
    default: 'facultyverifier' 
  },
  // Date of birth of the verifier
  dob: { 
    type: Date, 
    required: false 
  },
  // Designation of the verifier
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Phone number of the verifier (must be a 10-digit number)
  phone: { 
    type: String, 
    required: false, 
    match: /^[0-9]{10}$/ // Validates the phone number format
  },
  // Organization the verifier belongs to
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Ministry the verifier is associated with
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Date the verifier joined (defaults to the current date in IST)
  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // Adds IST offset
  }
});

// Create the Mongoose model for Faculty Verifier
const facultyverifierModel = mongoose.model('facultyverifierlogin', facultyverifierSchema);

// Export the model for use in other parts of the application
module.exports = facultyverifierModel;