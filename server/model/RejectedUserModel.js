const mongoose = require('mongoose');

const rejectedUserSchema = new mongoose.Schema({
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
    match: /^[0-9]{10}$/ 
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
  remark: { 
    type: String, 
    required: [true, "Remark is required for rejection"], 
    trim: true 
  },
  rejectedAt: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) 
  }
});

const RejectedUser = mongoose.model('RejectedUser', rejectedUserSchema);
module.exports = RejectedUser;