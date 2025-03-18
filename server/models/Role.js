const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  visibleLeads: {
    type: String,
    enum: ['Own', 'All'],
    default: 'Own'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  assignedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  __v: {
    type: Number,
    default: 0
  }
});

// Add this pre-find middleware
roleSchema.pre('find', function() {
  this.populate({
    path: 'assignedModules',
    match: { isDeleted: false }
  });
});

module.exports = mongoose.model('Role', roleSchema); 