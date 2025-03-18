const mongoose = require('mongoose');
const Module = require('../models/Module');

exports.createModule = async (req, res) => {
  try {
    const { moduleName, action, parentId } = req.body;
    
    if (!moduleName || !action) {
      return res.status(400).json({
        success: false,
        message: 'Module name and action are required',
      });
    }

    const parentObjectId = parentId ? new mongoose.Types.ObjectId(parentId) : null;

    const module = await Module.create({
      moduleName,
      action,
      parentId: parentObjectId
    });

    res.status(201).json({
      success: true,
      module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find({ isDeleted: false })
      .populate('parentId', 'moduleName')

    res.json({
      success: true,
      count: modules.length,
      modules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { moduleName, actions, isActive } = req.body;
    
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      {
        moduleName,
        actions,
        isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 