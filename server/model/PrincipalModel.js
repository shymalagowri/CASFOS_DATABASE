/**
 * This file defines the Mongoose schema for the Principal model.
 * It represents the structure of data related to the principal, including details such as
 * name, password, role, date of birth, designation, phone number, organization, ministry,
 * and the date they joined.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

// Define the schema for Principal
const principalSchema = new mongoose.Schema({
  // Name of the principal
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], // Name is required
    trim: true, // Removes leading and trailing whitespace
    maxlength: 50 // Maximum length of the name
  },
  // Password for the principal
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], // Password is required
    minlength: 6 // Minimum length of the password
  },
  // Role of the principal (default is 'principal')
  role: { 
    type: String, 
    required: true, 
    default: 'principal' 
  },
  // Date of birth of the principal
  dob: { 
    type: Date, 
    required: false 
  },
  // Designation of the principal
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Phone number of the principal (must be a 10-digit number)
  phone: { 
    type: String, 
    required: false, 
    match: /^[0-9]{10}$/ // Validates the phone number format
  },
  // Organization the principal belongs to
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Ministry the principal is associated with
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Date the principal joined (defaults to the current date in IST)
  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // Adds IST offset
  }
});

// Create the Mongoose model for Principal
const PrincipalModel = mongoose.model('principallogin', principalSchema);

// Export the model for use in other parts of the application
module.exports = PrincipalModel;