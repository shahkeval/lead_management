const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role: roleName, user_name, mobile_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Find the role by name
    const role = await Role.findOne({ roleName: roleName });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role: role._id,
      user_name,
      mobile_name
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).populate({
      path: 'role',
      populate: {
        path: 'assignedModules'
      }
    });



    // Check if the user is inactive
    if (user.status === 'Inactive') {
      return res.status(401).json({
        success: false,
        message: 'You are no longer part of this organization.'
      });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'role',
      populate: {
        path: 'assignedModules'
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 