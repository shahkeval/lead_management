const Lead = require("../models/Lead");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const User = require("../models/User");

exports.createLead = async (req, res) => {
  try {
    const {
      empId,
      clientName,
      clientMobileNumber,
      clientEmail,
      sourceOfInquiry,
      leadStatus,
      companyName,
    } = req.body;
    const { lead_id } = req.params;

    const newLead = new Lead({
      empId,
      clientName,
      clientMobileNumber,
      clientEmail,
      sourceOfInquiry,
      leadStatus,
      companyName,
    });

    await newLead.save();
    res.status(201).json({ success: true, lead: newLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      filters, 
      globalFilter,
      sorting 
    } = req.query;

    // Parse the filters and sorting
    const parsedFilters = filters ? JSON.parse(filters) : [];
    const parsedSorting = sorting ? JSON.parse(sorting) : [];

    // Build the query
    let query = { isDeleted: false };

    // Apply column filters
    for (const filter of parsedFilters) {
      if (filter.id === 'empId.userName') {
        // Handle employee name filter separately
        const employees = await User.find({ 
          userName: { $regex: filter.value, $options: 'i' } 
        });
        const employeeIds = employees.map(emp => emp._id);
        query['empId'] = { $in: employeeIds };
      } else {
        query[filter.id] = { $regex: filter.value, $options: 'i' };
      }
    }

    // Apply global filter to search across all fields
    if (globalFilter) {
      // Find employees whose names match the global filter
      const employees = await User.find({
        userName: { $regex: globalFilter, $options: 'i' }
      });
      const employeeIds = employees.map(emp => emp._id);

      query.$or = [
        { leadId: { $regex: globalFilter, $options: 'i' } },
        { clientName: { $regex: globalFilter, $options: 'i' } },
        { clientMobileNumber: { $regex: globalFilter, $options: 'i' } },
        { clientEmail: { $regex: globalFilter, $options: 'i' } },
        { companyName: { $regex: globalFilter, $options: 'i' } },
        { sourceOfInquiry: { $regex: globalFilter, $options: 'i' } },
        { leadStatus: { $regex: globalFilter, $options: 'i' } },
        { empId: { $in: employeeIds } }, // Search by employee name
      ];

      // Add date search if the globalFilter is a valid date
      const dateSearch = new Date(globalFilter);
      if (!isNaN(dateSearch.getTime())) {
        const startOfDay = new Date(dateSearch.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateSearch.setHours(23, 59, 59, 999));
        query.$or.push({
          date_time: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        });
      }
    }

    // Build sort options
    const sortOptions = {};
    if (parsedSorting.length > 0) {
      sortOptions[parsedSorting[0].id] = parsedSorting[0].desc ? -1 : 1;
    }

    const leads = await Lead.find(query)
      .populate("empId", "userName")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Lead.countDocuments(query);

    res.json({
      success: true,
      leads,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error in getLeads:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { lead_id } = req.params;
    console.log(lead_id);
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
    const { leadId } = req.params;
    const find_lead = await Lead.findById(leadId);
    
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
    const { leadId } = req.params;

    // Correct query to ensure only non-deleted leads are fetched
    const lead = await Lead.findOne({ _id: leadId, isDeleted: false }).populate("empId");

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
    const allLeads = await Lead.find({ empId: userId, isDeleted: false }).populate("empId", "userName");

    // Step 2: Apply filters to the in-memory leads
    let filteredLeads = allLeads;

    // Build query with filters using regex for "contains" matching
    if (filters.clientName) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.clientName.toLowerCase().includes(filters.clientName.toLowerCase())
      );
    }
    if (filters.clientMobileNumber) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.clientMobileNumber.includes(filters.clientMobileNumber)
      );
    }
    if (filters.companyname) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.companyName.toLowerCase().includes(filters.companyName.toLowerCase())
      );
    }
    if (filters.leadStatus) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.leadStatus.toLowerCase().includes(filters.leadStatus.toLowerCase())
      );
    }
    if (filters.leadId) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.leadId.toLowerCase().includes(filters.leadId.toLowerCase())
      );
    }
    
    // Handle employee name filter
    if (filters.empId) {
      const employee = await User.findOne({ userName: { $regex: filters.empId, $options: 'i' } });
      if (employee) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.empId._id.equals(employee._id)
        );
      }
    }

    // Handle date filter
    if (filters.dateTime) {
      const date = new Date(filters.dateTime); // Convert string to Date object
      if (!isNaN(date.getTime())) { // Check if the date is valid
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)); // Start of the day
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)); // End of the day
        filteredLeads = filteredLeads.filter(lead => 
          lead.dateTime >= startOfDay && lead.dateTime < endOfDay
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

exports.getClientNames = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Authorization token missing",
        clients: [] 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = new mongoose.Types.ObjectId(decoded.id);

    // Find the user with their role
    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found",
        clients: [] 
      });
    }

    let query = { isDeleted: false };

    // Check if user has permission to see all leads or only their own
    const hasAllLeadsPermission = user.role.visibleLeads === "All";

    // If user can only see their own leads, add empId filter
    if (!hasAllLeadsPermission) {
      query.empId = userId;
    }

    // Get leads based on the query
    const leads = await Lead.find(query)
      .select('clientName')
      .lean();

    // Extract unique client names
    const uniqueClientNames = [...new Set(leads.map(lead => lead.clientName))].filter(Boolean);

    res.status(200).json({
      success: true,
      clients: uniqueClientNames
    });
  } catch (error) {
    console.error('Error in getClientNames:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch client names',
      error: error.message 
    });
  }
};
