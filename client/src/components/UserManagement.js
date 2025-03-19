import React, { useState, useEffect } from 'react';
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
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';

// AddUserForm Component
const AddUserForm = ({ open, handleClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_name: '',
    mobile_name: '',
    roleId: '',
    status: 'Active'
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const filter = response.data.roles.filter(role => role.status === 'Active');
          setRoles(filter);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setError('Error fetching roles. Please try again.');
      }
    };
    
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}api/users`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onUserAdded();
        handleClose();
        setFormData({
          email: '',
          password: '',
          user_name: '',
          mobile_name: '',
          roleId: '',
          status: 'Active'
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="User Name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Mobile Number"
              name="mobile_name"
              value={formData.mobile_name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Role"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              fullWidth
              required
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.roleName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// EditUserForm Component
const EditUserForm = ({ open, handleClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    email: '',
    user_name: '',
    mobile_name: '',
    roleId: '',
    status: 'Active'
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const filter = response.data.roles.filter(role => role.status === 'Active');
          setRoles(filter);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setError('Error fetching roles. Please try again.');
      }
    };

    if (open) {
      fetchRoles();
    }
    
    if (user) {
      setFormData({
        email: user.email,
        user_name: user.user_name,
        mobile_name: user.mobile_name,
        roleId: user.role._id,
        status: user.status
      });
    }
  }, [open, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}api/users/${user._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onUserUpdated();
        handleClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="User Name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Mobile Number"
              name="mobile_name"
              value={formData.mobile_name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Role"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              fullWidth
              required
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.roleName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openAddForm, setOpenAddForm] = useState(false);
  const { user } = useSelector((state) => state.auth); // Get the logged-in user

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setOpenAddForm(true);
  };

  const handleCloseAddForm = () => {
    setOpenAddForm(false);
  };

  const handleUserAdded = () => {
    fetchUsers();
    handleCloseAddForm();
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setOpenEditForm(true);
  };

  const handleCloseEditForm = () => {
    setEditUser(null);
    setOpenEditForm(false);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    handleCloseEditForm();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_BASE_URL}api/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting user');
    }
  };

  // Check user rights for actions
  const canEdit = user.role.assignedModules.some(module => module.moduleName === 'user management' && module.action === 'update');
  const canDelete = user.role.assignedModules.some(module => module.moduleName === 'user management' && module.action === 'delete');
  const canCreate = user.role.assignedModules.some(module => module.moduleName === 'user management' && module.action === 'create');
  const canList = user.role.assignedModules.some(module => module.moduleName === 'user management' && module.action === 'list');

  // Determine if the Actions header should be displayed
  const showActionsHeader = canEdit || canDelete;

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h4" style={{ fontSize: '2rem' }}>
            User Management
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
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
              Add New User
            </Button>
          )}
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
                <TableCell sx={{ fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mobile Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                {showActionsHeader && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            {canList ? (
              <TableBody>
                {!loading && users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow 
                      key={user._id}
                      sx={{
                        backgroundColor: user.status === 'Inactive' ? '#f5f5f5' : 'inherit',
                        '&:hover': {
                          backgroundColor: user.status === 'Inactive' ? '#eeeeee' : '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell sx={{
                        color: user.status === 'Inactive' ? '#666666' : 'inherit'
                      }}>
                        {user.user_name}
                      </TableCell>
                      <TableCell sx={{
                        color: user.status === 'Inactive' ? '#666666' : 'inherit'
                      }}>
                        {user.email}
                      </TableCell>
                      <TableCell sx={{
                        color: user.status === 'Inactive' ? '#666666' : 'inherit'
                      }}>
                        {user.mobile_name}
                      </TableCell>
                      <TableCell sx={{
                        color: user.status === 'Inactive' ? '#666666' : 'inherit'
                      }}>
                        {user.role?.roleName}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: user.status === 'Active' ? '#4caf50' : '#f44336',
                            color: user.status === 'Active' ? '#4caf50' : '#f44336',
                            backgroundColor: user.status === 'Active' 
                              ? 'rgba(76, 175, 80, 0.08)'
                              : 'rgba(244, 67, 54, 0.08)',
                            '& .MuiChip-label': {
                              fontWeight: 500
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {canEdit && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleEditUser(user)}
                              sx={{
                                opacity: user.status === 'Inactive' ? 0.7 : 1
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(user)}
                              sx={{
                                opacity: user.status === 'Inactive' ? 0.7 : 1
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {loading ? 'Loading...' : 'No users found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    You do not have rights to see the list of users.
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>

      {/* Edit Form Dialog */}
      <EditUserForm
        open={openEditForm}
        handleClose={handleCloseEditForm}
        user={editUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* Add User Form Dialog */}
      <AddUserForm
        open={openAddForm}
        handleClose={handleCloseAddForm}
        onUserAdded={handleUserAdded}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user {userToDelete?.email}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 