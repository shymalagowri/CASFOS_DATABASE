/**
 * This file defines the Mongoose schema for the Head of Office model.
 * It represents the structure of data related to the head of office, including details
 * such as name, password, role, date of birth, designation, phone number, organization,
 * ministry, and the date they joined.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

// Define the schema for Head of Office
const headOfOfficeSchema = new mongoose.Schema({
  // Name of the head of office
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], // Name is required
    trim: true, // Removes leading and trailing whitespace
    maxlength: 50 // Maximum length of the name
  },
  // Password for the head of office
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], // Password is required
    minlength: 6 // Minimum length of the password
  },
  // Role of the head of office (default is 'headofoffice')
  role: { 
    type: String, 
    required: true, 
    default: 'headofoffice' 
  },
  // Date of birth of the head of office
  dob: { 
    type: Date, 
    required: false 
  },
  // Designation of the head of office
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Phone number of the head of office (must be a 10-digit number)
  phone: { 
    type: String, 
    required: false, 
    match: /^[0-9]{10}$/ // Validates the phone number format
  },
  // Organization the head of office belongs to
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Ministry the head of office is associated with
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Date the head of office joined (defaults to the current date in IST)
  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // Adds IST offset
  }
});

// Create the Mongoose model for Head of Office
const HeadOfOfficeModel = mongoose.model('headofofficelogin', headOfOfficeSchema);

// Export the model for use in other parts of the application
module.exports = HeadOfOfficeModel;