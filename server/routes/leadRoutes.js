const express = require('express');
const { createLead, getLeads, updateLead, deleteLead, getLead, get_persone_lead, getClientNames } = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get client names - This route should be before the /:lead_id route
router.get('/clients', getClientNames);

// Create a new lead
router.post('/add', createLead);

// Get all leads
router.get('/get', getLeads);

// Get particular routes of sales person
router.get("/get_persone_lead", get_persone_lead);

// Get a single lead by ID - This should be after all other specific routes
router.get('/:lead_id', getLead);

// Update a lead
router.put('/update/:lead_id', updateLead);

// Delete a lead
router.delete('/:lead_id', deleteLead);

module.exports = router; 