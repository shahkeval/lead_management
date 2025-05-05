import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddRoleForm from './roles/AddRoleForm';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Breadcrumbs from './common/Breadcrumbs';
import { useAlerts } from '../context/AlertContext';
import GlobalAlerts from './common/GlobalAlerts';


const ManageRoles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    roleName: '',
    description: ''
  });
  const { user } = useSelector((state) => state.auth);
  const { showError, showSuccess } = useAlerts();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError("Your session has expired. Please log in again.");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to view roles.");
      } else {
        showError("Unable to fetch roles. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = () => {
    setOpenAddForm(true);
  };

  const handleCloseForm = () => {
    setOpenAddForm(false);
  };

  const handleRoleAdded = () => {
    fetchRoles();
  };

  const handleManageRights = (roleId) => {
    navigate(`/admin/manage-rights/${roleId}`);
  };

  const handleEditRole = (role) => {
    setEditRole(role);
    setFieldErrors({ roleName: '', description: '' });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setEditRole(null);
    setFieldErrors({ roleName: '', description: '' });
    setOpenEditDialog(false);
  };

  const handleUpdateRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError("Your session has expired. Please log in again.");
        return;
      }

      // Validate required fields
      if (!editRole?.roleName?.trim()) {
        setFieldErrors(prev => ({
          ...prev,
          roleName: 'Role name is required'
        }));
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}api/roles/${editRole._id}`,
        editRole,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        fetchRoles();
        handleCloseEditDialog();
        showSuccess('Role updated successfully!');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        showError("This role name already exists.");
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to update roles.");
      } else {
        showError("Unable to update role. Please try again later.");
      }
    }
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setRoleToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError("Your session has expired. Please log in again.");
        return;
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}api/roles/${roleToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        fetchRoles();
        handleCloseDeleteDialog();
        showSuccess('Role deleted successfully!');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        showError("Cannot delete this role as it is assigned to users.");
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to delete roles.");
      } else {
        showError("Unable to delete role. Please try again later.");
      }
    }
  };

  return (
    <Box>
      <GlobalAlerts />
      <Box sx={{ p: 3 }}>
      <Breadcrumbs/>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h4" style={{ fontSize: '2rem' }}>
            Manage Roles
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRole}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              textTransform: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              height: '36px'
            }}
          >
            Add New Role
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Role Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Visible Leads</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Visible Meetings</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && roles && roles.length > 0 ? (
                roles.map((role) => (
                  <TableRow 
                    key={role._id}
                    sx={{
                      backgroundColor: role.status === 'Inactive' ? '#f5f5f5' : 'inherit',
                      '&:hover': {
                        backgroundColor: role.status === 'Inactive' ? '#eeeeee' : '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell sx={{
                      color: role.status === 'Inactive' ? '#666666' : 'inherit'
                    }}>
                      {role.roleName}
                    </TableCell>
                    <TableCell sx={{
                      color: role.status === 'Inactive' ? '#666666' : 'inherit'
                    }}>
                      {role.visibleLeads}
                    </TableCell>
                    <TableCell sx={{
                      color: role.status === 'Inactive' ? '#666666' : 'inherit'
                    }}>
                      {role.visibleMeetings}
                    </TableCell>
                    <TableCell sx={{
                      color: role.status === 'Inactive' ? '#666666' : 'inherit'
                    }}>
                      {role.description}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={role.status} 
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: role.status === 'Active' ? '#4caf50' : '#f44336',
                          color: role.status === 'Active' ? '#4caf50' : '#f44336',
                          backgroundColor: role.status === 'Active' 
                            ? 'rgba(76, 175, 80, 0.08)'
                            : 'rgba(244, 67, 54, 0.08)',
                          '& .MuiChip-label': {
                            fontWeight: 500
                          }
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      {user?.role?.assignedModules?.some(
                        (m) => m.moduleName === "manage rights" && m.action === "view"
                      ) && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleManageRights(role._id)}
                          sx={{
                            backgroundColor: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#1565c0',
                            },
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            padding: '6px 16px'
                          }}
                        >
                          MANAGE RIGHTS
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEditRole(role)}
                        startIcon={<EditIcon />}
                        sx={{
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          padding: '6px 16px',
                          ml: 1
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClick(role)}
                        startIcon={<DeleteIcon />}
                        sx={{
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          padding: '6px 16px',
                          ml: 1
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {loading ? 'Loading...' : 'No roles found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <AddRoleForm 
          open={openAddForm}
          handleClose={handleCloseForm}
          onRoleAdded={handleRoleAdded}
        />

        {/* Edit Role Dialog */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogContent>
            <TextField
              label="Role Name"
              value={editRole?.roleName || ''}
              onChange={(e) => {
                setEditRole({ ...editRole, roleName: e.target.value });
                setFieldErrors(prev => ({ ...prev, roleName: '' }));
              }}
              fullWidth
              required
              error={!!fieldErrors.roleName}
              helperText={fieldErrors.roleName}
              sx={{ mt: 2, mb: 2 }}
              inputProps={{ required: false }}
            />
            <TextField
              label="Description"
              value={editRole?.description || ''}
              onChange={(e) => {
                setEditRole({ ...editRole, description: e.target.value });
                setFieldErrors(prev => ({ ...prev, description: '' }));
              }}
              fullWidth
              required
              multiline
              rows={4}
              error={!!fieldErrors.description}
              helperText={fieldErrors.description}
              sx={{ mb: 2 }}
              inputProps={{ required: false }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button onClick={handleUpdateRole} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the role {roleToDelete?.roleName}?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleDeleteRole} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ManageRoles; 