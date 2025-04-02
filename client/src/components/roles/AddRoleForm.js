import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import { useAlerts } from '../../context/AlertContext';

const AddRoleForm = ({ open, handleClose, onRoleAdded }) => {
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    visibleLeads: 'Own',
    permissions: [],
    status: 'Active'
  });

  const [fieldErrors, setFieldErrors] = useState({
    roleName: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useAlerts();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear field error when user starts typing
    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
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
        roleName: '',
        description: ''
      });

      // Validate required fields
      const newFieldErrors = {};
      if (!formData.roleName?.trim()) {
        newFieldErrors.roleName = 'Role name is required';
      }
      if (!formData.description?.trim()) {
        newFieldErrors.description = 'Description is required';
      }

      // If there are field errors, show them and stop submission
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}api/roles`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onRoleAdded();
        showSuccess('Role added successfully!');
        handleClose();
        // Reset form data
        setFormData({
          roleName: '',
          description: '',
          visibleLeads: 'Own',
          permissions: [],
          status: 'Active'
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setFieldErrors(prev => ({
          ...prev,
          roleName: 'This role name already exists'
        }));
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to add roles.");
      } else {
        showError("Unable to add role. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setFormData({
      roleName: '',
      description: '',
      visibleLeads: 'Own',
      permissions: [],
      status: 'Active'
    });
    setFieldErrors({
      roleName: '',
      description: ''
    });
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseForm} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0',
        fontSize: '1.5rem',
        fontWeight: 500
      }}>
        Add New Role
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              label="Role Name"
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!fieldErrors.roleName}
              helperText={fieldErrors.roleName}
            />
            
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              error={!!fieldErrors.description}
              helperText={fieldErrors.description}
            />

            <TextField
              select
              required
              label="Visible Leads"
              name="visibleLeads"
              value={formData.visibleLeads}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="Own">Own</MenuItem>
              <MenuItem value="All">All</MenuItem>
            </TextField>

            <TextField
              select
              required
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #e0e0e0',
          p: 2
        }}>
          <Button 
            onClick={handleCloseForm}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              textTransform: 'none'
            }}
          >
            {loading ? 'Adding...' : 'Add Role'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddRoleForm; 