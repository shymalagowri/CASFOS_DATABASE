// This file defines the AssetNotification model using Mongoose for the Central Academy for State Forest Service (CASFOS) Asset Management System.
// It includes fields for asset type, category, action, action time, supplier name, purchase date, bill number,
// received by, item names, subcategory, quantity, location, rejection remarks, condition, changed condition,
// and a reference to a rejected asset ID.
// The model is exported for use in other parts of the application to track notifications related to asset actions.
// The schema uses timestamps to automatically record creation and update times.

const mongoose = require('mongoose'); // Import Mongoose for MongoDB schema definition and interaction

const assetNotificationSchema = new mongoose.Schema({ // Define the AssetNotification schema
  assetType: { // Field for the type of asset
    type: String, // Data type is String
    required: true, // Required field
    enum: ['Permanent', 'Consumable'], // Restricts values to 'Permanent' or 'Consumable'
  },
  assetCategory: { // Field for the category of the asset
    type: String, // Data type is String
    required: true, // Required field
  },
  action: { // Field for the type of action performed on the asset
    type: String, // Data type is String
    required: true, // Required field
    enum: [ // Restricts values to a predefined list of valid actions
      'asset approved', 'asset rejected', 'issue approved', 'issue rejected',
      'service approved', 'service rejected', 'return approved', 'return rejected',
      'exchange approved', 'exchange rejected', 'asset disposal approved',
      'asset disposal cancelled', 'condition changed', 'asset updation approved',
      'asset updation rejected', 'building upgrade approved',
      'building upgrade rejected', 'building disposal cancelled', 'building maintenance approved',
      'building maintenance rejected', 'return approved with HOO waiting', 'return approved by HOO', 'return rejected by HOO',
    ],
  },
  actionTime: { // Field for the timestamp when the action was performed
    type: Date, // Data type is Date
    required: true, // Required field
  },
  supplierName: { // Field for the supplier's name (optional)
    type: String, // Data type is String
  },
  purchaseDate: { // Field for the date of purchase (optional)
    type: Date, // Data type is Date
  },
  billNo: { // Field for the bill number (optional)
    type: String, // Data type is String
  },
  receivedBy: { // Field for the person who received the asset (optional)
    type: String, // Data type is String
  },
  itemNames: [{ // Field for an array of item names associated with the asset
    type: String, // Each item name is a String
  }],
  subCategory: { // Field for the subcategory of the asset (optional)
    type: String, // Data type is String
  },
  quantity: { // Field for the quantity of the asset (optional)
    type: Number, // Data type is Number
  },
  location: { // Field for the location of the asset (optional)
    type: String, // Data type is String
  },
  rejectionRemarks: { // Field for remarks provided during rejection (optional)
    type: String, // Data type is String
  },
  condition: { // Field for the condition of the asset (optional)
    type: String, // Data type is String
  },
  changedCondition: { // Field for the new condition after a condition change (optional)
    type: String, // Data type is String
  },
  rejectedAssetId: { // Field for referencing a rejected asset in the RejectedAsset collection
    type: mongoose.Schema.Types.ObjectId, // Data type is MongoDB ObjectId
    ref: "RejectedAsset", // References the 'RejectedAsset' model
  },
}, { timestamps: true }); // Enable automatic createdAt and updatedAt timestamps

module.exports = mongoose.model('AssetNotification', assetNotificationSchema); // Create and export the AssetNotification model for the 'AssetNotification' collection