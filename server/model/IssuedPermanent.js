const mongoose = require('mongoose');

const IssuedPermanentSchema = new mongoose.Schema({
  assetType: { 
    type: String, 
    enum: ['Permanent'], 
    default: 'Permanent', 
    required: true 
  },
  assetCategory: { 
    type: String, 
    required: true,
    minlength: 2,
    maxlength: 50
  },
  itemName: { 
    type: String, 
    required: true,
    minlength: 2,
    maxlength: 100
  },
  subCategory: { 
    type: String
  },
  itemDescription: { 
    type: String, 
    required: true,
    minlength: 5,
    maxlength: 500
  },
  issues: [{
    issuedTo: { 
      type: String, 
      required: true,
      minlength: 2,
      maxlength: 100
    },
    location: { 
      type: String, 
      required: false,

    }, // New field
    quantity: { 
      type: Number, 
      required: true,
      min: 1,
      max: 10000
    },
    issuedDate: { 
      type: Date, 
      default: Date.now,
      max: Date.now
    },
    issuedIds: [{ type: String }]
  }]
});

module.exports = mongoose.model('IssuedPermanent', IssuedPermanentSchema);