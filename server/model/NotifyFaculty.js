// models/NotifyFaculty.js
const mongoose = require('mongoose');

const notifyFacultySchema = new mongoose.Schema({
  // Include all fields from ConfirmedFaculty schema
  ...require('./ConfirmedFaculty').schema.obj,
  notifyprincipal: {
    type: Boolean,
    default: false
  },
  notifyhoo: {
    type: Boolean,
    default: false
  },
  notifysi: {
    type: Boolean,
    default: false
  },
  notifyremarks: {
    type: String,
    trim: true,
    default: ""
  },
  notificationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NotifyFaculty', notifyFacultySchema);