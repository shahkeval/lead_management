import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { updateRoleRights, fetchAllModules, fetchRoles } from '../redux/slices/roleSlice';
import axios from 'axios';
import AddModuleForm from './modules/AddModuleForm';

const ManageRights = () => {
  const { roleId } = useParams();
  const dispatch = useDispatch();
  const { roles, allModules } = useSelector((state) => state.roles);
  const [rights, setRights] = useState({});
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newModule, setNewModule] = useState({
    moduleName: '',
    action: '',
    parentId: '',
  });
  const [visibleLeads, setVisibleLeads] = useState('Own');
  const [roleStatus, setRoleStatus] = useState('Active');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const role = roles.find((r) => r._id === roleId);
  const actions = ['create', 'update', 'list', 'view', 'delete'];

  // Fetch modules on component mount
  useEffect(() => {
    dispatch(fetchAllModules());
    dispatch(fetchRoles());
  }, [dispatch]);

  // Group modules by name
  const modulesByName = React.useMemo(() => {
    return allModules.reduce((acc, module) => {
      if (!acc[module.moduleName]) {
        acc[module.moduleName] = {};
      }
      acc[module.moduleName][module.action] = module;
      return acc;
    }, {});
  }, [allModules]);

  // Initialize rights when role or modules change
  useEffect(() => {
    if (role?.assignedModules) {
      const moduleRights = {};
      
      // Initialize all modules with false
      Object.keys(modulesByName).forEach(moduleName => {
        moduleRights[moduleName] = {
          create: false,
          update: false,
          list: false,
          view: false,
          delete: false
        };
      });

      // Set true for assigned modules
      role.assignedModules.forEach(module => {
        if (module && module.moduleName) {
          if (!moduleRights[module.moduleName]) {
            moduleRights[module.moduleName] = {};
          }
          moduleRights[module.moduleName][module.action] = true;
        }
      });

      setRights(moduleRights);
      setVisibleLeads(role.visibleLeads);
      setRoleStatus(role.status);
    }
  }, [role]);

  const handleRightChange = (moduleName, action) => {
    setRights(prev => ({
      ...prev,
      [moduleName]: {
        ...(prev[moduleName] || {}),
        [action]: !prev[moduleName]?.[action],
      },
    }));
  };

  const handleSave = async () => {
    try {
      const selectedModuleIds = [];
      const missingModules = [];

      // Check each selected right against available modules
      Object.entries(rights).forEach(([moduleName, actions]) => {
        Object.entries(actions).forEach(([action, isSelected]) => {
          if (isSelected) {
            const moduleInDb = modulesByName[moduleName]?.[action];
            if (moduleInDb) {
              selectedModuleIds.push(moduleInDb._id);
            } else {
              missingModules.push(`${moduleName} (${action})`);
            }
          }
        });
      });

      // If any selected modules don't exist in database
      if (missingModules.length > 0) {
        setMessage(`Error: The following modules are not available: ${missingModules.join(', ')}`);
        await dispatch(fetchAllModules());
        return;
      }

      const result = await dispatch(updateRoleRights({
        roleId,
        data: { assignedModules: selectedModuleIds, visibleLeads, status: roleStatus }
      })).unwrap();

      if (result.success) {
        setMessage('Rights updated successfully');
        await Promise.all([
          dispatch(fetchRoles()),
          dispatch(fetchAllModules())
        ]);
      } else {
        setMessage(result.message || 'Failed to update rights');
      }
    } catch (error) {
      console.error('Error saving rights:', error);
      setMessage(error.response?.data?.message || 'Failed to update rights');
      await Promise.all([
        dispatch(fetchRoles()),
        dispatch(fetchAllModules())
      ]);
    }
  };

  const handleAddModule = async () => {
    try {
      if (!newModule.moduleName || !newModule.action) {
        setError('Module name and action are required');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}api/modules`, {
        moduleName: newModule.moduleName.trim(),
        action: newModule.action,
        parentId: newModule.parentId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccessMessage('Module added successfully');
        setOpenSnackbar(true);
        setOpenDialog(false);
        setNewModule({ moduleName: '', action: '', parentId: '' });
        dispatch(fetchAllModules());
      } else {
        setError(response.data.message || 'Failed to add module');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add module');
    }
  };

  const fetchModules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setModules(response.data.modules);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleModuleAdded = () => {
    dispatch(fetchAllModules());
    setOpenSnackbar(true);
    setSuccessMessage('Module added successfully!');
  };

  // Use a Set to track displayed modules
  const displayedModules = new Set();

  if (!role) {
    return <Typography>Role not found</Typography>;
  }

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">
            Manage Rights - {role.roleName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>Visible Leads:</Typography>
            <Checkbox
              checked={visibleLeads === 'All'}
              onChange={() => setVisibleLeads(visibleLeads === 'All' ? 'Own' : 'All')}
            />
            <Typography variant="subtitle1" sx={{ mr: 1 }}>All</Typography>
            <Checkbox
              checked={visibleLeads === 'Own'}
              onChange={() => setVisibleLeads(visibleLeads === 'Own' ? 'All' : 'Own')}
            />
            <Typography variant="subtitle1">Own</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>Status:</Typography>
            <Checkbox
              checked={roleStatus === 'Active'}
              onChange={() => setRoleStatus(roleStatus === 'Active' ? 'Inactive' : 'Active')}
            />
            <Typography variant="subtitle1" sx={{ mr: 1 }}>Active</Typography>
            <Checkbox
              checked={roleStatus === 'Inactive'}
              onChange={() => setRoleStatus(roleStatus === 'Inactive' ? 'Active' : 'Inactive')}
            />
            <Typography variant="subtitle1">Inactive</Typography>
          </Box>
        </Box>
        
        {message && (
          <Alert 
            severity={message.includes('success') ? 'success' : 'error'}
            sx={{ mb: 2 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Add New Module
        </Button>

        <AddModuleForm 
          open={openDialog} 
          handleClose={() => setOpenDialog(false)} 
          onModuleAdded={handleModuleAdded} 
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Module</TableCell>
                {actions.map(action => (
                  <TableCell key={action} align="center">
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {allModules.map(module => {
                // Check if the module has already been displayed
                if (displayedModules.has(module.moduleName)) {
                  return null; // Skip if already displayed
                }
                displayedModules.add(module.moduleName); // Mark as displayed

                return (
                  <React.Fragment key={module._id}>
                    <TableRow>
                      <TableCell>
                        {module.parentId 
                          ? `${module.moduleName} (${module.parentId.moduleName})` 
                          : module.moduleName}
                      </TableCell>
                      {actions.map(action => {
                        // Check if the action is available for this module
                        const isActionAvailable = Object.hasOwn(modulesByName[module.moduleName], action);
                        return (
                          <TableCell key={action} align="center">
                            {isActionAvailable ? (
                              <Checkbox
                                checked={rights[module.moduleName]?.[action] || false}
                                onChange={() => handleRightChange(module.moduleName, action)}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary" style={{ color: "Red" }}>X</Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ mt: 3 }}
        >
          Save Changes
        </Button>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Render the list of modules */}
        {modules.map((module) => (
          <div key={module._id}>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default ManageRights; 