// server/controllers/meetingController.js
const Meeting = require('../models/Meeting');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to compare time strings (HH:mm)
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isMeetingPastOrEnded(date, endTime) {
  const meetingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (meetingDate < today) return true;
  if (meetingDate.toDateString() === today.toDateString()) {
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const now = new Date();
    if (
      now.getHours() > endHour ||
      (now.getHours() === endHour && now.getMinutes() >= endMinute)
    ) {
      return true;
    }
  }
  return false;
}

exports.createMeeting = async (req, res) => {
  try {
    const { date, startTime, endTime, attendeeName, representorName, agenda, status } = req.body;
    
    if (isMeetingPastOrEnded(date, endTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot create meetings in the past or already ended today" 
      });
    }

    // Conflict check
    const conflict = await Meeting.findOne({
      date: new Date(date),
      representorName,
      isDeleted: false,
      $expr: {
        $and: [
          { $lt: [ "$startTime", endTime ] },
          { $gt: [ "$endTime", startTime ] }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: "Meeting conflict: This person already has a meeting at this time." });
    }

    const meeting = await Meeting.create({
      date,
      startTime,
      endTime,
      attendeeName,
      representorName,
      agenda,
      status
    });

    res.status(201).json({
      success: true,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const { page = 1, limit = 10, filters, globalFilter, sorting } = req.query;
    
    // Build query
    let query = { isDeleted: false };
    
    // Apply filters
    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters);
        parsedFilters.forEach(filter => {
          if (filter.id === 'status') {
            query[filter.id] = filter.value;
          } else {
            query[filter.id] = { $regex: filter.value, $options: 'i' };
          }
        });
      } catch (error) {
        console.error('Error parsing filters:', error);
      }
    }

    // Apply global filter
    if (globalFilter) {
      query.$or = [
        { attendeeName: { $regex: globalFilter, $options: 'i' } },
        { agenda: { $regex: globalFilter, $options: 'i' } },
        { 'representorName.userName': { $regex: globalFilter, $options: 'i' } }
      ];
    }

    // Build sort options
    const sortOptions = {};
    if (sorting) {
      try {
        const parsedSorting = JSON.parse(sorting);
        parsedSorting.forEach(sort => {
          sortOptions[sort.id] = sort.desc ? -1 : 1;
        });
      } catch (error) {
        console.error('Error parsing sorting:', error);
      }
    }

    // If no sorting is specified, sort by date descending
    if (Object.keys(sortOptions).length === 0) {
      sortOptions.date = -1;
    }

    const meetings = await Meeting.find(query)
      .populate('representorName', 'userName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Meeting.countDocuments(query);

    res.json({
      success: true,
      meetings,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error in getMeetings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, representorName } = req.body;

    if (isMeetingPastOrEnded(date, endTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot modify meetings in the past or already ended today" 
      });
    }

    // Conflict check (exclude current meeting)
    const conflict = await Meeting.findOne({
      _id: { $ne: id },
      date: new Date(date),
      representorName,
      isDeleted: false,
      $expr: {
        $and: [
          { $lt: [ "$startTime", endTime ] },
          { $gt: [ "$endTime", startTime ] }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: "Meeting conflict: This person already has a meeting at this time." });
    }

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      {
        date,
        startTime,
        endTime,
        representorName,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('representorName', 'userName');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if meeting is in the past
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    if (isMeetingPastOrEnded(meeting.date, meeting.endTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete meetings in the past or already ended today" 
      });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedAt: Date.now() },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.get_persone_meeting = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ success: false, message: "Authorization token missing", meetings: [] });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = new mongoose.Types.ObjectId(decoded.id);
    const { page = 1, limit = 10, filters } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Use user._id (ObjectId) for representorName
    let query = { isDeleted: false, representorName: user._id };

    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters);
        parsedFilters.forEach(filter => {
          if (filter.id === 'status') {
            query[filter.id] = filter.value;
          } else {
            query[filter.id] = { $regex: filter.value, $options: 'i' };
          }
        });
      } catch (error) {
        console.error('Error parsing filters:', error);
      }
    }

    const meetings = await Meeting.find(query)
      .populate('representorName', 'userName')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Meeting.countDocuments(query);

    res.json({
      success: true,
      meetings,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error in get_persone_meeting:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};