const Role = require('../models/Role');
const Module = require('../models/Module');

exports.createRole = async (req, res) => {
  try {
    const { roleName, description, visibleLeads, visibleMeetings, status } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role already exists'
      });
    }

    // Create new role
    const role = await Role.create({
      roleName,
      description,
      visibleLeads,
      visibleMeetings,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating role'
    });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort('roleName');
    res.json({
      success: true,
      roles: roles // Send roles in an object
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching roles'
    });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { roleName, description, visibleLeads, visibleMeetings, isActive } = req.body;

    // Find the existing role
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Update only the fields that are provided
    role.roleName = roleName || role.roleName;
    role.description = description !== undefined ? description : role.description;
    role.visibleLeads = visibleLeads || role.visibleLeads;
    role.visibleMeetings = visibleMeetings || role.visibleMeetings;
    role.isActive = isActive !== undefined ? isActive : role.isActive;

    // Save the updated role
    await role.save();

    res.json({
      success: true,
      role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(
      req.params.id,
      {
        isDeleted: true,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateRoleRights = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { assignedModules, visibleLeads, visibleMeetings, description, status } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Update role's assigned modules, visible leads, visible meetings, and status
    role.assignedModules = assignedModules;
    role.visibleLeads = visibleLeads || role.visibleLeads;
    role.visibleMeetings = visibleMeetings || role.visibleMeetings;
    role.description = description !== undefined ? description : role.description;
    role.status = status !== undefined ? status : role.status;
    await role.save();

    const updatedRole = await Role.findById(roleId)
      .populate('assignedModules')
      .exec();

    return res.json({
      success: true,
      role: updatedRole
    });
  } catch (error) {
    console.error('Error updating role rights:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

exports.getRoleRights = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(roleId)
      .populate('assignedModules');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      role,
      rights: role.assignedModules
    });
  } catch (error) {
    console.error('Error fetching role rights:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching role rights'
    });
  }
}; 