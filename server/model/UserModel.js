/**
 * This file defines the Mongoose schema for the Temporary User model.
 * It represents the structure of data related to users who are pending approval or registration,
 * including details such as name, password, role, date of birth, designation, phone number,
 * organization, ministry, and the date they joined.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

const temporaryUserSchema = new mongoose.Schema({
  // Name of the user
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], 
    trim: true, 
    maxlength: 50 
  },
  // Password for the user
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], 
    minlength: 6 
  },
  // Role of the user
  role: { 
    type: String, 
    required: [true, "Please Enter role"], 
    enum: ['headofoffice', 'principal', 'assetmanager', 'storekeeper', 'facultyentrystaff', 'facultyverifier', 'viewer'],
    default: 'viewer' 
  },
  // Date of birth of the user
  dob: { 
    type: Date, 
    required: false 
  },
  // Designation of the user
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Phone number of the user (must be 10 digits if provided)
  phone: { 
    type: String, 
    required: false, 
    validate: {
      validator: function(v) {
        return v ? /^[0-9]{10}$/.test(v) : true; // Optional, but must be 10 digits if provided
      },
      message: "Phone number must be 10 digits"
    }
  },
  // Organization the user belongs to
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Ministry the user is associated with
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Date the user joined (defaults to the current date in IST)
  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // IST offset
  }
});

// Create the Mongoose model for Temporary User
const TemporaryUser = mongoose.model('TemporaryUser', temporaryUserSchema);

// Export the model for use in other parts of the application
module.exports = TemporaryUser;