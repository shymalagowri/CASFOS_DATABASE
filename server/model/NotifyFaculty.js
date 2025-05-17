/**
 * This file defines the Mongoose schema for the Notify Faculty model.
 * It extends the Confirmed Faculty schema to include additional fields for notification purposes,
 * such as notifying the principal, head of office (HOO), and senior instructor (SI),
 * along with remarks and the date of notification.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

// Define the schema for Notify Faculty
const notifyFacultySchema = new mongoose.Schema({
  // Include all fields from the ConfirmedFaculty schema
  ...require('./ConfirmedFaculty').schema.obj,
  // Whether to notify the principal
  notifyprincipal: {
    type: Boolean,
    default: false // Defaults to false
  },
  // Whether to notify the head of office (HOO)
  notifyhoo: {
    type: Boolean,
    default: false // Defaults to false
  },
  // Whether to notify the senior instructor (SI)
  notifysi: {
    type: Boolean,
    default: false // Defaults to false
  },
  // Remarks for the notification
  notifyremarks: {
    type: String,
    trim: true, // Removes leading and trailing whitespace
    default: "" // Defaults to an empty string
  },
  // Date of the notification
  notificationDate: {
    type: Date,
    default: Date.now // Defaults to the current date
  }
});

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model('NotifyFaculty', notifyFacultySchema);