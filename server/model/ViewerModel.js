/**
 * This file defines the Mongoose schema for the Viewer model.
 * It represents the structure of data related to viewer users,
 * including details such as name, password, role, date of birth, designation,
 * phone number, organization, ministry, access rights, and the date they joined.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

const viewerSchema = new mongoose.Schema({
  // Name of the viewer
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], 
    trim: true, 
    maxlength: 50 
  },
  // Password for the viewer
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], 
    minlength: 6 
  },
  // Role of the viewer (default is 'viewer')
  role: { 
    type: String, 
    required: true, 
    default: 'viewer' 
  },
  // Date of birth of the viewer
  dob: { 
    type: Date, 
    required: false 
  },
  // Designation of the viewer
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Phone number of the viewer (must be a 10-digit number if provided)
  phone: { 
    type: String, 
    required: false, 
    match: /^[0-9]{10}$/ 
  },
  // Organization the viewer belongs to
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Ministry the viewer is associated with
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },
  // Access rights for the viewer (e.g., IT, Store, Electrical, Furniture, all)
  access: { 
    type: [String], 
    required: false, 
    default: [], 
    enum: ['IT', 'Store', 'Electrical', 'Furniture', 'all'] 
  },
  // Date the viewer joined (defaults to the current date in IST)
  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) 
  }
});

// Create the Mongoose model for Viewer
const ViewerModel = mongoose.model('viewerlogin', viewerSchema);

// Export the model for use in other parts of the application
module.exports = ViewerModel;