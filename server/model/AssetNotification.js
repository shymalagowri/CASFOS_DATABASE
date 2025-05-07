const mongoose = require('mongoose');
const assetNotificationSchema = new mongoose.Schema({
  assetType: {
    type: String,
    required: true,
    enum: ['Permanent', 'Consumable'],
  },
  assetCategory: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'asset approved', 'asset rejected', 'issue approved', 'issue rejected',
      'service approved', 'service rejected', 'return approved', 'return rejected',
      'exchange approved', 'exchange rejected', 'asset disposal approved',
      'asset disposal cancelled', 'condition changed', 'asset updation approved',
      'asset updation rejected', 'building upgrade approved',
      'building upgrade rejected', 'building disposal cancelled', 'building maintenance approved',
      'building maintenance rejected', 'return approved with HOO waiting', 'return approved by HOO','return rejected by HOO',
    ],
  },
  actionTime: {
    type: Date,
    required: true,
  },
  supplierName: { type: String },
  purchaseDate: { type: Date },
  billNo: { type: String },
  receivedBy: { type: String },
  itemNames: [{ type: String }],
  subCategory: { type: String },
  quantity: { type: Number },
  location: { type: String },
  rejectionRemarks: { type: String },
  condition: { type: String },
  changedCondition: { type: String },
  rejectedAssetId: { type: mongoose.Schema.Types.ObjectId, ref: "RejectedAsset" },
}, { timestamps: true });

module.exports = mongoose.model('AssetNotification', assetNotificationSchema);