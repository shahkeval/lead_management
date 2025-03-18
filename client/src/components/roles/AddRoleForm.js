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

const AddRoleForm = ({ open, handleClose, onRoleAdded }) => {
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    visibleLeads: 'Own',
    permissions: [],
    status: 'Active'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/roles`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Role added successfully!');
      setFormData({
        roleName: '',
        description: '',
        visibleLeads: 'Own',
        permissions: [],
        status: 'Active'
      });
      if (onRoleAdded) {
        onRoleAdded();
      }
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
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
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                label="Role Name"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                fullWidth
                variant="outlined"
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
              onClick={handleClose}
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

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddRoleForm; 