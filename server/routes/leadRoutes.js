const express = require('express');
const { createLead, getLeads, updateLead, deleteLead, getLead ,get_persone_lead} = require('../controllers/leadController');
const router = express.Router();



// Create a new lead
router.post('/add', createLead);

// Get all leads
router.get('/get', getLeads);

// Get partiqular routes of sales persone
router.get("/get_persone_lead",get_persone_lead);

// Update a lead
router.put('/update/:lead_id', updateLead);

// Delete a lead
router.delete('/:lead_id', deleteLead);

// Get a single lead by ID
router.get('/:lead_id', getLead);

module.exports = router; 