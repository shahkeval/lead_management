const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    unique: true
  },
  empId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientMobileNumber: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  sourceOfInquiry: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  descriptions: {
    type: String,
    default: ''
  },
  leadStatus: {
    type: String,
    enum: ['Pending', 'Won', 'Follow Up', 'Lost'],
    default: 'pending'
  },
  dateTime: {
    type: Date,
    default: Date.now // Automatically set to current date and time
  },
  isDeleted: { type: Boolean, default: false }
});

// Pre-save hook to generate lead_id
leadSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    
    // Find the highest existing lead_id for the current year
    const lastLead = await this.model('Lead')
      .findOne({ leadId: { $regex: `^LED-${year}-` } })
      .sort({ leadId: -1 }); // Sort by lead_id in descending order

    let sequenceNumber = 1; // Default to 1 if no leads exist
    if (lastLead) {
      // Extract the sequence number from the last lead_id
      const lastId = lastLead.leadId;
      const lastSequence = parseInt(lastId.split('-')[2], 10);
      sequenceNumber = lastSequence + 1; // Increment the sequence number
    }

    this.leadId = `LED-${year}-${sequenceNumber.toString().padStart(3, '0')}`; // Format: LED-YYYY-XXX
    console.log(`Generated lead_id: ${this.leadId}`); // Debug log
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema); 