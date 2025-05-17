/**
 * This file defines the Mongoose schema for the Storekeeper model.
 * It represents the structure of data related to storekeepers, including details such as
 * name, password, role, date of birth, designation, phone number, organization, ministry,
 * and the date they joined.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

const storekeeperSchema = new mongoose.Schema({
  // Name of the storekeeper
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], // Name is required
    trim: true, // Removes leading and trailing whitespace
    maxlength: 50 // Maximum length of the name
  },
  // Password for the storekeeper
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], // Password is required
    minlength: 6 // Minimum length of the password
  },
  // Role of the storekeeper (default is 'storekeeper')
  role: { 
    type: String, 
    required: true, 
    default: 'storekeeper' 
  },
  // Date of birth of the storekeeper
  dob: { 
    type: Date, 
    required: false 
  },
  // Designation of the storekeeper
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Phone number of the storekeeper (must be a 10-digit number)
  phone: { 
    type: String, 
    required: false, 
    match: /^[0-9]{10}$/ // Validates the phone number format
  },
  // Organization the storekeeper belongs to
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Ministry the storekeeper is associated with
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Date the storekeeper joined (defaults to the current date in IST)
  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // Adds IST offset
  }
});

// Create the Mongoose model for Storekeeper
const storekeeperModel = mongoose.model('storekeeperlogin', storekeeperSchema);

// Export the model for use in other parts of the application
module.exports = storekeeperModel;