const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
    default: 'Gajapati'
  },
  block: {
    type: String,
    required: true
  },
  gramPanchayat: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  pincode: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index for faster queries
locationSchema.index({ district: 1, block: 1, gramPanchayat: 1, village: 1 });

module.exports = mongoose.model('Location', locationSchema);