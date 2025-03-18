const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  lead_id: {
    type: String,
    unique: true
  },
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  client_name: {
    type: String,
    required: true
  },
  client_mobile_number: {
    type: String,
    required: true
  },
  client_email: {
    type: String,
    required: true
  },
  source_of_inquiry: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  lead_status: {
    type: String,
    enum: ['Pending', 'Won', 'Follow Up', 'Lost'],
    default: 'pending'
  },
  date_time: {
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
      .findOne({ lead_id: { $regex: `^LED-${year}-` } })
      .sort({ lead_id: -1 }); // Sort by lead_id in descending order

    let sequenceNumber = 1; // Default to 1 if no leads exist
    if (lastLead) {
      // Extract the sequence number from the last lead_id
      const lastId = lastLead.lead_id;
      const lastSequence = parseInt(lastId.split('-')[2], 10);
      sequenceNumber = lastSequence + 1; // Increment the sequence number
    }

    this.lead_id = `LED-${year}-${sequenceNumber.toString().padStart(3, '0')}`; // Format: LED-YYYY-XXX
    console.log(`Generated lead_id: ${this.lead_id}`); // Debug log
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema); 