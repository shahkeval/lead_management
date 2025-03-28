const Lead = require("../models/Lead");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const User = require("../models/User");

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
    const { page = 1, limit = 10, ...filters } = req.query; // Destructure page, limit, and other filters
    const query = { isDeleted: false }; // Start with the base query

    // Build query with filters using regex for "contains" matching
    if (filters.client_name) {
      query.client_name = { $regex: filters.client_name, $options: 'i' }; // Case-insensitive match
    }
    if (filters.client_mobile_number) {
      query.client_mobile_number = { $regex: filters.client_mobile_number, $options: 'i' };
    }
    if (filters.company_name) {
      query.company_name = { $regex: filters.company_name, $options: 'i' };
    }
    if (filters.lead_status) {
      query.lead_status = { $regex: filters.lead_status, $options: 'i' };
    }
    if (filters.lead_id) {
      query.lead_id = { $regex: filters.lead_id, $options: 'i' }; // New filter for Lead ID
    }
    
    // Handle employee name filter
    if (filters.emp_id) {
      const employee = await User.findOne({ user_name: { $regex: filters.emp_id, $options: 'i' } });
      if (employee) {
        query.emp_id = employee._id; // Set emp_id to the found employee's ID
      } else {
        query.emp_id = null; // If no employee found, set to null to exclude
      }
    }

    // Handle date filter
    if (filters.date_time) {
      const date = new Date(filters.date_time); // Convert string to Date object
      if (!isNaN(date.getTime())) { // Check if the date is valid
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)); // Start of the day
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)); // End of the day
        query.date_time = { $gte: startOfDay, $lt: endOfDay }; // Filter for the whole day
      }
    }

    const leads = await Lead.find(query)
      .populate("emp_id", "user_name")
      .limit(limit * 1) // Limit results
      .skip((page - 1) * limit); // Pagination

    const count = await Lead.countDocuments(query); // Count total documents

    res.json({
      success: true,
      leads,
      totalPages: Math.ceil(count / limit), // Calculate total pages
      currentPage: page,
    });
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = new mongoose.Types.ObjectId(decoded.id);
    const { page = 1, limit = 10, ...filters } = req.query; // Destructure page, limit, and other filters

    // Step 1: Find all leads for the logged-in user
    const allLeads = await Lead.find({ emp_id: userId, isDeleted: false }).populate("emp_id", "user_name");

    // Step 2: Apply filters to the in-memory leads
    let filteredLeads = allLeads;

    // Build query with filters using regex for "contains" matching
    if (filters.client_name) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.client_name.toLowerCase().includes(filters.client_name.toLowerCase())
      );
    }
    if (filters.client_mobile_number) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.client_mobile_number.includes(filters.client_mobile_number)
      );
    }
    if (filters.company_name) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.company_name.toLowerCase().includes(filters.company_name.toLowerCase())
      );
    }
    if (filters.lead_status) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.lead_status.toLowerCase().includes(filters.lead_status.toLowerCase())
      );
    }
    if (filters.lead_id) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.lead_id.toLowerCase().includes(filters.lead_id.toLowerCase())
      );
    }
    
    // Handle employee name filter
    if (filters.emp_id) {
      const employee = await User.findOne({ user_name: { $regex: filters.emp_id, $options: 'i' } });
      if (employee) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.emp_id._id.equals(employee._id)
        );
      }
    }

    // Handle date filter
    if (filters.date_time) {
      const date = new Date(filters.date_time); // Convert string to Date object
      if (!isNaN(date.getTime())) { // Check if the date is valid
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)); // Start of the day
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)); // End of the day
        filteredLeads = filteredLeads.filter(lead => 
          lead.date_time >= startOfDay && lead.date_time < endOfDay
        );
      }
    }

    // Step 3: Implement pagination
    const totalLeads = filteredLeads.length; // Total leads after filtering
    const totalPages = Math.ceil(totalLeads / limit); // Calculate total pages
    const paginatedLeads = filteredLeads.slice((page - 1) * limit, page * limit); // Get leads for the current page

    res.json({
      success: true,
      leads: paginatedLeads,
      totalPages: totalPages, // Calculate total pages
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ success: false, message: error.message, leads: [] });
  }
};

