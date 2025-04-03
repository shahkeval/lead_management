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
import { useAlerts } from '../context/AlertContext';
import GlobalAlerts from './common/GlobalAlerts';

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
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    user_name: '',
    mobile_name: '',
    roleId: ''
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, clearAlerts } = useAlerts();

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
        showError('Error fetching roles. Please try again.');
      }
    };
    
    if (open) {
      fetchRoles();
    }
  }, [open]);

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
        email: '',
        password: '',
        user_name: '',
        mobile_name: '',
        roleId: ''
      });

      // Validate required fields
      const newFieldErrors = {};
      const requiredFields = ['email', 'password', 'userName', 'mobileName', 'roleId'];
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newFieldErrors[field] = 'This field is required';
        }
      });

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newFieldErrors.email = 'Please enter a proper email address';
      }

      // If there are field errors, show them and stop submission
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        return;
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
      if (error.response?.status === 409) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'This email is already registered'
        }));
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to perform this action.");
      } else {
        showError("Unable to add user. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="User Name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.user_name}
              helperText={fieldErrors.user_name}
              inputProps={{ 
                required: false 
              }}
            />
            <TextField
              label="Mobile Number"
              name="mobile_name"
              value={formData.mobile_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.mobile_name}
              helperText={fieldErrors.mobile_name}
              inputProps={{ 
                required: false 
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              inputProps={{ 
                required: false 
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              inputProps={{ 
                required: false 
              }}
            />
            <TextField
              select
              label="Role"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.roleId}
              helperText={fieldErrors.roleId}
              inputProps={{ 
                required: false 
              }}
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
              inputProps={{ 
                required: false 
              }}
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
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    user_name: '',
    mobile_name: '',
    roleId: ''
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, clearAlerts } = useAlerts();

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
        showError('Error fetching roles. Please try again.');
      }
    };

    if (open) {
      fetchRoles();
    }
    
    if (user) {
      setFormData({
        email: user.email,
        user_name: user.userName,
        mobile_name: user.mobileName,
        roleId: user.role._id,
        status: user.status
      });
    }
  }, [open, user]);

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

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError("Your session has expired. Please log in again.");
        return;
      }

      // Reset field errors
      setFieldErrors({
        email: '',
        user_name: '',
        mobile_name: '',
        roleId: ''
      });

      // Validate required fields
      const newFieldErrors = {};
      const requiredFields = ['email', 'userName', 'mobileName', 'roleId'];
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newFieldErrors[field] = 'This field is required';
        }
      });

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newFieldErrors.email = 'Please enter a proper email address';
      }

      // If there are field errors, show them and stop submission
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        return;
      }

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
      if (error.response?.status === 409) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'This email is already in use'
        }));
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to perform this action.");
      } else {
        showError("Unable to update user. Please try again later.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="User Name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.user_name}
              helperText={fieldErrors.user_name}
              inputProps={{ 
                required: false 
              }}
            />
            <TextField
              label="Mobile Number"
              name="mobile_name"
              value={formData.mobile_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.mobile_name}
              helperText={fieldErrors.mobile_name}
              inputProps={{ 
                required: false 
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              inputProps={{ 
                required: false 
              }}
            />
            {/* <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              inputProps={{ 
                required: false 
              }}
            /> */}
            <TextField
              select
              label="Role"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              fullWidth
              required
              error={!!fieldErrors.roleId}
              helperText={fieldErrors.roleId}
              inputProps={{ 
                required: false 
              }}
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
              inputProps={{ 
                required: false 
              }}
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
  const [tableError, setTableError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openAddForm, setOpenAddForm] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  const { showError, showSuccess, clearAlerts } = useAlerts();

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
      if (!token) {
        showError("Your session has expired. Please log in again.");
        return;
      }

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
      if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to view users.");
      } else {
        showError("Unable to load users. Please try again later.");
      }
      setTableError("Unable to load users.");
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
      accessorKey: 'userName',
      header: 'User Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'mobileName',
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
    state: {
      columnFilters,
      globalFilter,
      isLoading: loading,
      pagination,
      showAlertBanner: false,
      showProgressBars: isRefetching,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
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
    showSuccess('User added successfully!');
    setOpenAddForm(false);
  };

  const handleCloseEditForm = () => {
    setEditUser(null);
    setOpenEditForm(false);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    showSuccess('User updated successfully!');
    setOpenEditForm(false);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError("Your session has expired. Please log in again.");
        return;
      }

      await axios.delete(`${process.env.REACT_APP_BASE_URL}api/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
      showSuccess('User deleted successfully!');
    } catch (error) {
      if (error.response?.status === 409) {
        showError("Cannot delete this user as they have active leads assigned.");
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to delete users.");
      } else {
        showError("Unable to delete user. Please try again later.");
      }
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
      <GlobalAlerts />
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