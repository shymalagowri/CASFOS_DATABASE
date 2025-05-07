const mongoose = require('mongoose');

const temporaryUserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], 
    trim: true, 
    maxlength: 50 
  },
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], 
    minlength: 6 
  },
  role: { 
    type: String, 
    required: [true, "Please Enter role"], 
    enum: ['headofoffice', 'principal', 'assetmanager', 'storekeeper', 'facultyentrystaff', 'facultyverifier', 'viewer'],
    default: 'viewer' 
  },
  dob: { 
    type: Date, 
    required: false 
  },
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
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
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },
  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) // IST offset
  }
});

const TemporaryUser = mongoose.model('TemporaryUser', temporaryUserSchema);

module.exports = TemporaryUser;