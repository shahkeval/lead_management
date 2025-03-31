const User = require('../models/User');
const Role = require('../models/Role');
const mongoose = require('mongoose');
const { json } = require('express');
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      // .populate('role')
      .select('-password')
    
      res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching users' });
  }
};
exports.getForLead = async(req,res)=>{
  try {
        const isers = await User.find().select('user_name email mobile');
        res.json({success:true,users});   
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
}
exports.createUser = async (req, res) => {
  try {
    const { email, password, roleId, status, user_name, mobile_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Verify role exists
    const role = await Role.findById(roleId);
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
      user_name,
      mobile_name,
      role: roleId,
      status,
    });


    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { email, user_name, mobile_name, roleId, status } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });

    }

    // If role is being updated, verify it exists
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email,
        user_name,
        mobile_name,
        role: roleId,
        status,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('role').select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting user'
    });
  }
};

// Add other controller methods (createUser, updateUser, deleteUser) as needed 

exports.get_persone_user= async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ success: false, message: "Authorization token missing", leads: [] });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with actual secret key


    const userId = new mongoose.Types.ObjectId(decoded.id);


    // const leads = await Lead.find({ emp_id: userId }).populate("emp_id", "user_name");
    const userData = await User.find({_id: userId})

    if(!userData){
      res.status(500).json({ success: false, message: error.message});
    }
    res.json({ success: true, users: userData || [] }); // Always return an array
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ success: false, message: error.message, leads: [] }); // Always send an empty array
  }
};

