import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { updateRoleRights, fetchAllModules, fetchRoles } from '../redux/slices/roleSlice';
import axios from 'axios';
import Breadcrumbs from './common/Breadcrumbs';
import Navbar from './Navbar';
import { useAlerts } from '../context/AlertContext';
import GlobalAlerts from './common/GlobalAlerts';

// AddModuleForm Component
const AddModuleForm = ({ open, handleClose, onModuleAdded }) => {
  const [formData, setFormData] = useState({
    moduleName: '',
    actions: [],
    parentId: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    moduleName: '',
    actions: '',
    parentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const { showError, showSuccess } = useAlerts();

  const actions = ['create', 'update', 'list', 'view', 'delete', 'parent'];

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const parentModules = response.data.modules.filter(module => 
            module.action === 'parent' && !module.parentId
          );
          
          const uniqueModules = Array.from(new Set(parentModules.map(module => module.moduleName)))
            .map(name => parentModules.find(module => module.moduleName === name));

          setModules(uniqueModules);
        }
      } catch (error) {
        showError(error.response?.data?.message || 'Error fetching modules');
      }
    };

    if (open) {
      fetchModules();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'actions') {
      setFormData(prev => {
        const actions = prev.actions.includes(value)
          ? prev.actions.filter(action => action !== value)
          : [...prev.actions, value];
        return { ...prev, actions };
      });
      setFieldErrors(prev => ({ ...prev, actions: '' }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError("Your session has expired. Please log in again.");
        return;
      }

      // Reset field errors
      setFieldErrors({
        moduleName: '',
        actions: '',
        parentId: ''
      });

      // Validate required fields
      const newFieldErrors = {};
      if (!formData.moduleName) {
        newFieldErrors.moduleName = 'Module name is required';
      }
      if (formData.actions.length === 0) {
        newFieldErrors.actions = 'Please select at least one action';
      }

      // If there are field errors, show them and stop submission
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setLoading(false);
        return;
      }

      const requests = formData.actions.map(action => ({
        moduleName: formData.moduleName,
        action,
        parentId: formData.parentId,
      }));

      await Promise.all(requests.map(data =>
        axios.post(`${process.env.REACT_APP_BASE_URL}api/modules`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));

      onModuleAdded();
      handleClose();
      setFormData({ moduleName: '', actions: [], parentId: '' });
    } catch (error) {
      if (error.response?.status === 409) {
        setFieldErrors(prev => ({
          ...prev,
          moduleName: 'This module name already exists'
        }));
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to perform this action.");
      } else {
        showError("Unable to add module. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Module</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <TextField
            label="Module Name"
            name="moduleName"
            value={formData.moduleName}
            onChange={handleChange}
            fullWidth
            required
            error={!!fieldErrors.moduleName}
            helperText={fieldErrors.moduleName}
            sx={{ mb: 2 }}
            inputProps={{ required: false }}
          />
          <div>
            <Typography variant="subtitle1">Actions</Typography>
            {actions.map(action => (
              <FormControlLabel
                key={action}
                control={
                  <Checkbox
                    checked={formData.actions.includes(action)}
                    onChange={() => handleChange({ target: { name: 'actions', value: action } })}
                  />
                }
                label={action.charAt(0).toUpperCase() + action.slice(1)}
              />
            ))}
            {fieldErrors.actions && (
              <FormHelperText error>{fieldErrors.actions}</FormHelperText>
            )}
          </div>
          <TextField
            select
            label="Parent Module"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!fieldErrors.parentId}
            helperText={fieldErrors.parentId || "Select a parent module that has 'parent' action"}
            inputProps={{ required: false }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {modules.map(module => (
              <MenuItem key={module._id} value={module._id}>
                {module.moduleName}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Module'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ManageRights = () => {
  const { roleId } = useParams();
  const dispatch = useDispatch();
  const { roles, allModules } = useSelector((state) => state.roles);
  const [rights, setRights] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newModule, setNewModule] = useState({
    moduleName: '',
    action: '',
    parentId: '',
  });
  const [visibleLeads, setVisibleLeads] = useState('Own');
  const [visibleMeetings, setVisibleMeetings] = useState('Own');
  const [roleStatus, setRoleStatus] = useState('Active');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useAlerts();

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
      setVisibleMeetings(role.visibleMeetings);
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
        showError(`The following modules are not available or have been deleted: ${missingModules.join(', ')}. Please refresh and try again.`);
        return;
      }

      // Validate that at least one module is selected
      if (selectedModuleIds.length === 0) {
        showError('Please select at least one module right before saving.');
        return;
      }

      const result = await dispatch(updateRoleRights({
        roleId,
        data: { 
          assignedModules: selectedModuleIds, 
          visibleLeads, 
          visibleMeetings,
          status: roleStatus 
        }
      })).unwrap();

      if (result.success) {
        showSuccess('Rights updated successfully');
        await Promise.all([
          dispatch(fetchRoles()),
          // dispatch(fetchAllModules())
        ]);
      } else {
        showError(result.message || 'Failed to update rights. Please try again.');
      }
    } catch (error) {
      console.error('Error saving rights:', error);
      showError(error.response?.data?.message || 'Failed to update rights. Please check your connection and try again.');
      await Promise.all([
        dispatch(fetchRoles()),
        // dispatch(fetchAllModules())
      ]);
    }
  };

  const handleModuleAdded = () => {
    dispatch(fetchAllModules());
    showSuccess('Module added successfully!');
  };

  // Use a Set to track displayed modules
  const displayedModules = new Set();

  if (!role) {
    return <Typography>Loading</Typography>;
  }

  return (
    <Box>
      <GlobalAlerts />
      <Navbar/>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

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
            <Typography variant="subtitle1" sx={{ mr: 2 }}>Visible Meetings:</Typography>
            <Checkbox
              checked={visibleMeetings === 'All'}
              onChange={() => setVisibleMeetings(visibleMeetings === 'All' ? 'Own' : 'All')}
            />
            <Typography variant="subtitle1" sx={{ mr: 1 }}>All</Typography>
            <Checkbox
              checked={visibleMeetings === 'Own'}
              onChange={() => setVisibleMeetings(visibleMeetings === 'Own' ? 'All' : 'Own')}
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