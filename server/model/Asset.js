const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  location: { type: String, required: true },
  data: { type: Object, required: true },
  joined: { type: Date, default: () => {
    // Get the current date in UTC
    let date = new Date();
    
    // Convert to IST (UTC+5:30)
    let istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30 hours
    let istDate = new Date(date.getTime() + istOffset);
    
    return istDate;
} }
// Key-value pairs for accessories and quantities
});

const Asset = mongoose.model("Asset", AssetSchema); // Default collection: 'assets'

module.exports = Asset;
