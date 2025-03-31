import React, { useState, useEffect, useMemo } from 'react';
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
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';
import Breadcrumbs from './common/Breadcrumbs';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

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
      if (!token) throw new Error("Your session has expired. Please log in again.");

      // Validate required fields
      const requiredFields = ['email', 'password', 'user_name', 'mobile_name', 'roleId'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

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
      setError(error.response?.data?.message || error.message || "Failed to add user. Please try again.");
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

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
        setError('Error fetching roles. Please try again.');
        setSnackbarMessage('Error fetching roles. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
    // Clear error when user starts typing
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Your session has expired. Please log in again.");

      // Validate required fields
      const requiredFields = ['email', 'user_name', 'mobile_name', 'roleId'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}api/users/${user._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSnackbarMessage('User updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        onUserUpdated();
        handleClose();
      }
    } catch (error) {
      let errorMessage = error.message;
      
      // Handle duplicate email error
      if (error.response?.data?.message?.includes('duplicate') || 
          error.response?.data?.message?.includes('already exists')) {
        errorMessage = `The email "${formData.email}" is already associated with another user. Please use a different email address.`;
      } else {
        errorMessage = error.response?.data?.message || error.message || "Failed to update user. Please try again.";
      }
      
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
              error={!!error && !formData.user_name}
            />
            <TextField
              label="Mobile Number"
              name="mobile_name"
              value={formData.mobile_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!error && !formData.mobile_name}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!error && (!formData.email || error.includes('email'))}
              helperText={error && error.includes('email') ? error : ''}
            />
            <TextField
              select
              label="Role"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              fullWidth
              required
              error={!!error && !formData.roleId}
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
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

  // Add new state for table
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [rowCount, setRowCount] = useState(0);
  const [isRefetching, setIsRefetching] = useState(false);

  const fetchUsers = async () => {
    if (!users.length) {
      setLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Your session has expired. Please log in again.");

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        filters: JSON.stringify(columnFilters),
        globalFilter: globalFilter,
        sorting: JSON.stringify(sorting),
      });

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}api/users/list?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUsers(response.data.users);
        setRowCount(response.data.totalCount);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Unable to fetch users. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: 'user_name',
      header: 'User Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'mobile_name',
      header: 'Mobile Number',
    },
    {
      accessorKey: 'role.roleName',
      header: 'Role',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ cell }) => (
        <Chip 
          label={cell.getValue()} 
          variant="outlined"
          size="small"
          sx={{
            borderColor: cell.getValue() === 'Active' ? '#4caf50' : '#f44336',
            color: cell.getValue() === 'Active' ? '#4caf50' : '#f44336',
            backgroundColor: cell.getValue() === 'Active' 
              ? 'rgba(76, 175, 80, 0.08)'
              : 'rgba(244, 67, 54, 0.08)',
            '& .MuiChip-label': {
              fontWeight: 500
            }
          }}
        />
      ),
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: users,
    enableRowSelection: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: error
      ? {
          color: 'error',
          children: error,
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading: loading,
      pagination,
      showAlertBanner: Boolean(error),
      showProgressBars: isRefetching,
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
    muiTablePaginationProps: {
      rowsPerPageOptions: [5, 10, 25],
    },
    renderTopToolbarCustomActions: () => (
      user.role.assignedModules.some(module => module.moduleName === 'user management' && module.action === 'create') && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddForm(true)}
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
      )
    ),
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        {user.role.assignedModules.some(module => module.moduleName === 'user management' && module.action === 'update') && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              setEditUser(row.original);
              setOpenEditForm(true);
            }}
          >
            Edit
          </Button>
        )}
        {user.role.assignedModules.some(module => module.moduleName === 'user management' && module.action === 'delete') && (
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            onClick={() => {
              setUserToDelete(row.original);
              setOpenDeleteDialog(true);
            }}
          >
            Delete
          </Button>
        )}
      </Box>
    ),
    positionActionsColumn: 'last',
  });

  const handleCloseAddForm = () => {
    setOpenAddForm(false);
  };

  const handleUserAdded = () => {
    fetchUsers();
    handleCloseAddForm();
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
      if (!token) throw new Error("Your session has expired. Please log in again.");

      await axios.delete(`${process.env.REACT_APP_BASE_URL}api/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user. The user may have active leads assigned or may have already been deleted.");
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
        <Breadcrumbs />
        <Typography variant="h4" sx={{ mb: 4 }}>
          User Management
        </Typography>
        
        {canList ? (
          <MaterialReactTable table={table} />
        ) : (
          <Typography align="center" color="error">
            You do not have rights to see the list of users.
          </Typography>
        )}
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