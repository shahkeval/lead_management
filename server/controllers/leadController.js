const Lead = require("../models/Lead");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

exports.createLead = async (req, res) => {
  try {
    const {
      emp_id,
      client_name,
      client_mobile_number,
      client_email,
      source_of_inquiry,
      lead_status,
      company_name,
    } = req.body;
    const { lead_id } = req.params;

    const newLead = new Lead({
      emp_id,
      client_name,
      client_mobile_number,
      client_email,
      source_of_inquiry,
      lead_status,
      company_name,
    });

    await newLead.save();
    res.status(201).json({ success: true, lead: newLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    // Fetch only leads that are not deleted
    const leads = await Lead.find({ isDeleted: false }).populate("emp_id", "user_name");

    res.json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateLead = async (req, res) => {
  try {
    const { lead_id } = req.params;
    const updatedLead = await Lead.findByIdAndUpdate(lead_id, req.body, {
      new: true,
    });
    if (!updatedLead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, lead: updatedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const { lead_id } = req.params;
    const find_lead = await Lead.findById(lead_id);
    
    if (!find_lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Update the field properly
    find_lead.isDeleted = true;
    await find_lead.save();

    res.json({ success: true, message: "Lead soft deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLead = async (req, res) => {
  try {
    const { lead_id } = req.params;

    // Correct query to ensure only non-deleted leads are fetched
    const lead = await Lead.findOne({ _id: lead_id, isDeleted: false }).populate("emp_id");

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.get_persone_lead = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ success: false, message: "Authorization token missing", leads: [] });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with actual secret key


    const userId = new mongoose.Types.ObjectId(decoded.id);

    const leads = await Lead.find({ emp_id: userId , isDeleted : false}).populate("emp_id", "user_name");

    res.json({ success: true, leads: leads || [] }); // Always return an array
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ success: false, message: error.message, leads: [] }); // Always send an empty array
  }
};

