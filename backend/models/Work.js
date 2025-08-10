const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'On Hold'],
    default: 'Planning'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  contractor: {
    type: String
  },
  amountSpent: {
    type: Number,
    default: 0
  },
  // Location fields
  district: {
    type: String,
    default: 'Gajapati'
  },
  block: {
    type: String
  },
  gramPanchayat: {
    type: String
  },
  village: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Work', workSchema);