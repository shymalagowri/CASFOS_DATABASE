/**
 * This file provides a function to connect to the MongoDB database using Mongoose.
 * It reads the MongoDB connection URI from the environment variable MONGO_URI.
 * If the connection is successful, it logs a success message.
 * If the connection fails, it logs the error and exits the process.
 */

const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    //("Success DB Connected");
  } catch (err) {
    //(err);
    process.exit(1);
  }
};

module.exports = dbConnect;