const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role: roleName, userName, mobileName } = req.body;

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
      userName,
      mobileName
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
        role: user.role,
        userName : user.userName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password') // Exclude password field
      .populate({
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

exports.forgotPassword = async (req, res) => {
  console.log("1");
  const { email } = req.body;
  console.log("2");

  try {
    console.log("3");
    // Check if user exists
    const user = await User.findOne({ email });
    console.log("4");
    if (!user) {
      console.log("5");
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log("6");
    // Generate a password reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("7");
    // Create a reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/change-password/${resetToken}`;
    console.log("8");
    // Send email with the reset link
    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_PASS);
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });
    console.log("9");
    console.log(process.env.EMAIL_USER);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    };
    console.log("10");
    await transporter.sendMail(mailOptions);
    console.log("11");
    res.status(200).json({ success: true, message: 'Password reset link sent to your email!' });
    console.log("12");
  } catch (error) {
    console.error('Error sending password reset email:', error);
    console.log("13");
    res.status(500).json({ success: false, message: 'Error sending password reset email' });
    console.log("14");
  }
};

// Add a new function to reset the password
exports.resetPassword = async (req, res) => {
  console.log('1');
  const { token, newPassword , } = req.body;
  console.log('2');
  try {
    console.log('3');
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('4');
    const user = await User.findById(decoded.id);
    console.log('5');
    if (!user) {
      console.log('6');
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('7');
    // Update the user's password
    user.password = newPassword; // Make sure to hash the password in the User model
    console.log('8');
    await user.save();
    console.log('9');
    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    console.log('10');
  } catch (error) {
    console.log('11');
    console.error('Error resetting password:', error);
    console.log('12');
    res.status(500).json({ success: false, message: 'Error resetting password' });
    console.log('13');
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Assuming you have user authentication set up

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update the password
    user.password = newPassword; // Ensure you hash the password in your User model
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error); // Log the error for debugging
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 