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
            'asset approved',
            'asset rejected',
            'issue approved',
            'issue rejected',
            'return approved for service',
            'return approved for disposal',
            'return rejected',
        ],
    },
    actionTime: {
        type: Date,
        required: true,
    },
    supplierName: { type: String }, // For asset approved/rejected
    purchaseDate: { type: Date }, // For asset approved/rejected
    billNo: { type: String }, // For asset approved/rejected
    receivedBy: { type: String }, // For asset approved/rejected
    itemNames: [{ type: String }], // For asset approved/rejected, issue approved/rejected
    subCategory: { type: String }, // For issue approved/rejected, return actions
    quantity: { type: Number }, // For issue approved/rejected
    location: { type: String }, // For return approved for service/disposal
    rejectionRemarks: { type: String }, // For asset rejected, issue rejected, return rejected
}, { timestamps: true });

module.exports = mongoose.model('AssetNotification', assetNotificationSchema);