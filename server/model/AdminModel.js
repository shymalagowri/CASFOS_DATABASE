const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },  // Date of Birth
    designation: { type: String, required: true, trim: true },
    phone: { 
        type: String, 
        required: true, 
        match: /^[0-9]{10}$/  // Validates a 10-digit phone number
    },
    organization: { type: String, required: true, trim: true },
    ministry: { type: String, required: true, trim: true },
    role: { type: String, default: "admin" }, // Admin role is fixed
    password: { type: String, required: true, minlength: 6 },
    joined: { 
        type: Date, 
        default: () => {
            let date = new Date();
            let istOffset = 5.5 * 60 * 60 * 1000;
            return new Date(date.getTime() + istOffset);
        }
    },
    access: { 
        type: [String],  // Array of strings to store the selected access types
        default: []      // Default is an empty array if no access is selected
    }
    
});

const AdminModel = mongoose.model('adminlogin', AdminSchema);
module.exports = AdminModel;
