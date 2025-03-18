const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'list', 'view', 'delete','parent'],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null,
  },
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
}, { timestamps: true });

// Create a compound index for moduleName and action combination
moduleSchema.index({ moduleName: 1, action: 1 }, { unique: true });

// Drop any existing single-field unique index on moduleName if it exists
mongoose.connection.once('open', async () => {
  try {
    await mongoose.connection.collections.modules.dropIndex('moduleName_1');
  } catch (error) {
    // Index might not exist, ignore error
  }
});

module.exports = mongoose.model('Module', moduleSchema); 