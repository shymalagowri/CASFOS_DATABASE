const mongoose = require('mongoose');

const RejectedUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  joined: { type: Date, required: true },
  role: { type: String, required: true },
  remark: { type: String, required: true }, // Ensure this field is present
});

module.exports = mongoose.model('RejectedUser', RejectedUserSchema);
