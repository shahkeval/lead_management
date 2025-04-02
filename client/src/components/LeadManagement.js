import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import axios from "axios";
import { useSelector } from 'react-redux';
import Breadcrumbs from './common/Breadcrumbs';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import ErrorAlert from './common/ErrorAlert';
import useFormError from '../hooks/useFormError';
import SuccessAlert from './common/SuccessAlert';
import useAlerts from '../hooks/useAlerts';
import GlobalAlerts from './common/GlobalAlerts';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableError, setTableError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    mobileNo: '',
    email: '',
    sourceOfInquiry: '',
    leadStatus: 'Pending',
    companyName: '',
    selectedUser: '',
  });
  const [users, setUsers] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  // Initial form state
  const initialFormState = {
    clientName: "",
    mobileNo: "",
    email: "",
    sourceOfInquiry: "",
    leadStatus: "Pending",
    companyName: "",
    selectedUser: "",
  };

  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const {
    globalError,
    setError,
    clearErrors
  } = useFormError();

  const [fieldErrors, setFieldErrors] = useState({
    clientName: '',
    mobileNo: '',
    email: '',
    sourceOfInquiry: '',
    companyName: '',
    selectedUser: '',
    leadStatus: ''
  });

  const { showError, showSuccess } = useAlerts();

  const fetchLeads = async () => {
    if (!leads.length) {
      setLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const visibleLeads = user?.role?.visibleLeads;
      const endpoint = visibleLeads === "All" 
        ? `${process.env.REACT_APP_BASE_URL}api/leads/get`
        : `${process.env.REACT_APP_BASE_URL}api/leads/get_persone_lead`;

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        filters: JSON.stringify(columnFilters),
        globalFilter: globalFilter,
        sorting: JSON.stringify(sorting),
      });

      const response = await axios.get(`${endpoint}?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setLeads(response.data.leads);
        setRowCount(response.data.totalCount);
      }
    } catch (err) {
      setTableError(err.response?.data?.message || "Unable to fetch leads.");
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const endpoint = user?.role?.roleName === "sales person" 
        ? `${process.env.REACT_APP_BASE_URL}api/users/get_persone_user` 
        : `${process.env.REACT_APP_BASE_URL}api/users/list`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) setUsers(response.data.users);
    } catch (err) {
      showError(err.response?.data?.message || "Unable to fetch users. Please check your connection and try again.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      // await fetchLeads();
    };
    loadData();
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    if (users.length === 1 && !formData.selectedUser) {
      setFormData((prevData) => ({ ...prevData, selectedUser: users[0]._id }));
    }
  }, [users, formData.selectedUser]);

  useEffect(() => {
    // Clear the previous timeout if it exists
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout to call fetchLeads after 4000ms
    const timeout = setTimeout(() => {
      fetchLeads();
    }, 400);

    // Store the timeout ID
    setDebounceTimeout(timeout);

    // Cleanup function to clear the timeout on component unmount
    return () => clearTimeout(timeout);
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  const handleAddLead = () => {
    setSelectedLead(null);
    setFormData(initialFormState);
    setOpenForm(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setFormData({
      clientName: lead.clientName || "",
      mobileNo: lead.clientMobileNumber || "",
      email: lead.clientEmail || "",
      sourceOfInquiry: lead.sourceOfInquiry || "",
      leadStatus: lead.leadStatus || "Pending",
      companyName: lead.companyName || "",
      selectedUser: lead.empId?._id || "",
    });
    setOpenForm(true);
  };

  const handleDeleteClick = (leadId) => {
    setLeadToDelete(leadId);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteLead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}api/leads/${leadToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        showSuccess('Lead deleted successfully!');
        fetchLeads();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete lead.");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    fetchLeads();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        clientName: '',
        mobileNo: '',
        email: '',
        sourceOfInquiry: '',
        companyName: '',
        selectedUser: '',
        leadStatus: ''
      });

      // Validate required fields
      const newFieldErrors = {};
      const requiredFields = ['clientName', 'mobileNo', 'email', 'sourceOfInquiry', 'selectedUser'];
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newFieldErrors[field] = 'This field is required';
        }
      });

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newFieldErrors.email = 'Please enter a valid email address';
      }

      // If there are field errors, show them and stop submission
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        return;
      }

      const leadData = {
        empId: formData.selectedUser,
        clientName: formData.clientName,
        clientMobileNumber: formData.mobileNo,
        clientEmail: formData.email,
        sourceOfInquiry: formData.sourceOfInquiry,
        leadStatus: formData.leadStatus,
        companyName: formData.companyName,
      };

      if (selectedLead) {
        const response = await axios.put(
          `${process.env.REACT_APP_BASE_URL}api/leads/update/${selectedLead._id}`, 
          leadData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          showSuccess('Lead updated successfully!');
          setOpenForm(false);
          fetchLeads();
        }
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}api/leads/add`,
          leadData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          showSuccess('Lead created successfully!');
          setOpenForm(false);
          fetchLeads();
        }
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'This email is already registered for another lead'
        }));
      } else if (error.response?.status === 401) {
        showError("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to perform this action.");
      } else {
        showError(error.response?.data?.message || "Failed to save lead. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won':
        return { backgroundColor: '#cce5ff', color: 'blue' }; // Light blue
      case 'Pending':
        return { backgroundColor: '#ffeb3b', color: 'black' }; // Bright yellow
      case 'Follow Up':
        return { backgroundColor: '#ff9800', color: 'white' }; // Bright orange
      case 'Lost':
        return { backgroundColor: '#f44336', color: 'white' }; // Bright red
      default:
        return { backgroundColor: '#d6d8d9', color: 'black' }; // Light gray
    }
  };

  // User permissions
  const canEdit = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "update"
  );
  const canDelete = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "delete"
  );
  const canCreate = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "create"
  );
  const canList = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "list"
  );

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: 'leadId',
      header: 'Lead ID',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'empId.userName',
      header: 'Employee Name',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'clientName',
      header: 'Client Name',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'clientMobileNumber',
      header: 'Mobile No.',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'clientEmail',
      header: 'Email',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'dateTime',
      header: 'Date',
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'companyName',
      header: 'Company Name',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'sourceOfInquiry',
      header: 'Source',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'leadStatus',
      header: 'Status',
      Cell: ({ cell }) => (
        <div style={{
          ...getStatusColor(cell.getValue()),
          padding: '5px 10px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {cell.getValue()}
        </div>
      ),
      enableGlobalFilter: true,
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: leads,
    enableRowSelection: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: tableError
      ? {
          color: 'error',
          children: tableError,
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
      showAlertBanner: Boolean(tableError),
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
      canCreate && (
        <Button variant="contained" onClick={handleAddLead}>
          Add New Lead
        </Button>
      )
    ),
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        {canEdit && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleEditLead(row.original)}
          >
            Edit
          </Button>
        )}
        {canDelete && (
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            onClick={() => handleDeleteClick(row.original._id)}
          >
            Delete
          </Button>
        )}
      </Box>
    ),
    positionActionsColumn: 'last',
    muiTableHeadCellProps: {
      sx: {
        '&:last-child': {
          width: '150px',
        },
      },
    },
  });

  return (
    <Box sx={{ p: 0 }}>
      <GlobalAlerts />
      <Box sx={{ p: 3 }}>
        <Breadcrumbs/>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Lead Management
        </Typography>
        
        {canList ? (
          <MaterialReactTable table={table} />
        ) : (
          <Typography align="center" color="error">
            You do not have rights to see the list of leads.
          </Typography>
        )}
      </Box>

      {/* Lead Form Dialog */}
      <Dialog open={openForm} onClose={handleFormClose}>
        <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        <form onSubmit={handleSubmit} noValidate>
          <DialogContent>
            <TextField
              label="Client Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.clientName}
              onChange={(e) => {
                setFormData({ ...formData, clientName: e.target.value });
                setFieldErrors(prev => ({ ...prev, clientName: '' }));
              }}
              required
              error={!!fieldErrors.clientName}
              helperText={fieldErrors.clientName}
              inputProps={{ required: false }}
            />
            <TextField
              label="Mobile No."
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.mobileNo}
              onChange={(e) => {
                setFormData({ ...formData, mobileNo: e.target.value });
                setFieldErrors(prev => ({ ...prev, mobileNo: '' }));
              }}
              required
              error={!!fieldErrors.mobileNo}
              helperText={fieldErrors.mobileNo}
              inputProps={{ required: false }}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              inputProps={{ required: false }}
            />
            <TextField
              label="Source of Inquiry"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.sourceOfInquiry}
              onChange={(e) => {
                setFormData({ ...formData, sourceOfInquiry: e.target.value });
                setFieldErrors(prev => ({ ...prev, sourceOfInquiry: '' }));
              }}
              required
              error={!!fieldErrors.sourceOfInquiry}
              helperText={fieldErrors.sourceOfInquiry}
              inputProps={{ required: false }}
            />
            <TextField
              label="Company Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.companyName}
              onChange={(e) => {
                setFormData({ ...formData, companyName: e.target.value });
                setFieldErrors(prev => ({ ...prev, companyName: '' }));
              }}
              required
              error={!!fieldErrors.companyName}
              helperText={fieldErrors.companyName}
              inputProps={{ required: false }}
            />
            <FormControl 
              fullWidth 
              margin="normal" 
              required
              error={!!fieldErrors.selectedUser}
            >
              <InputLabel>User</InputLabel>
              <Select
                value={formData.selectedUser}
                onChange={(e) => {
                  setFormData({ ...formData, selectedUser: e.target.value });
                  setFieldErrors(prev => ({ ...prev, selectedUser: '' }));
                }}
                inputProps={{ required: false }}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.user_name}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.selectedUser && (
                <FormHelperText>{fieldErrors.selectedUser}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.leadStatus}
                onChange={(e) => {
                  setFormData({ ...formData, leadStatus: e.target.value });
                  setFieldErrors(prev => ({ ...prev, leadStatus: '' }));
                }}
                inputProps={{ required: false }}
              >
                <MenuItem value="Won">Won</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Follow Up">Follow Up</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFormClose}>Cancel</Button>
            <Button type="submit" color="primary">
              {selectedLead ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this lead?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteLead} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadManagement;