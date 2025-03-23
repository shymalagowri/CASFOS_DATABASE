const mongoose = require('mongoose');

const DataEntrySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    designation: { type: String, required: true, trim: true },
    phone: { 
        type: String, 
        required: true, 
        match: /^[0-9]{10}$/  
    },
    access: { 
        type: [String],
        default: [],
        required: true,     
    },
    organization: { type: String, required: true, trim: true },
    ministry: { type: String, required: true, trim: true },
    role: { type: String, default: "dataentry" }, // Data Entry role is fixed
    password: { type: String, required: true, minlength: 6 },
    joined: { 
        type: Date, 
        default: () => {
            let date = new Date();
            let istOffset = 5.5 * 60 * 60 * 1000;
            return new Date(date.getTime() + istOffset);
        }
    },
    
});

const DataEntryModel = mongoose.model('dataentrylogin', DataEntrySchema);
module.exports = DataEntryModel;
