const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
require('dotenv').config();

const initRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define default roles
    const defaultRoles = [
      {
        roleName: 'Admin',
        visibleLeads: 'All'
      },
      {
        roleName: 'sales manager',
        visibleLeads: 'All'
      },
      {
        roleName: 'sales person',
        visibleLeads: 'Own'
      }
    ];

    // Create roles if they don't exist
    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ roleName: role.roleName });
      if (!existingRole) {
        await Role.create(role);
        console.log(`Created role: ${role.roleName}`);
      } else {
        console.log(`Role already exists: ${role.roleName}`);
      }
    }

    // Create admin user if doesn't exist
    const adminEmail = 'kevalshah7220@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminRole = await Role.findOne({ roleName: 'Admin' });
      if (adminRole) {
        await User.create({
          email: adminEmail,
          password: 'demo@123',
          role: adminRole._id,
          status: 'Active'
        });
        console.log('Admin user created successfully');
      }
    } else {
      console.log('Admin user already exists');
    }

    console.log('Initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
};

initRoles(); 