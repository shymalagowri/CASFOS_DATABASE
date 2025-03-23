const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please Enter a Name:"], trim: true, maxlength: 50 },
    dob: { type: Date, required: true }, 
    designation: { type: String, required: [true, "Please Enter a Designation:"], trim: true },
    phone: { 
        type: String, 
        required: [true, "Please enter phone number"], 
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: "Phone number not valid"
        }
    },
    organization: { type: String, required: [true, "Please Enter a Organization:"], trim: true },
    ministry: { type: String, required: [true, "Please Enter a Ministry:"], trim: true },
    role: { 
        type: String, 
        required: [true, "Please Enter role:"], 
        enum: ['admin', 'dataentry', 'viewer'], 
        default: 'user' 
    },
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

// Create models for temporary and confirmed users
const TemporaryUser = mongoose.model('TemporaryUser', userSchema);
const ConfirmedUser = mongoose.model('ConfirmedUser', userSchema);

module.exports = { TemporaryUser, ConfirmedUser };
