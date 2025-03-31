import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import { useSelector } from 'react-redux';
import Breadcrumbs from './common/Breadcrumbs';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5); // Default items per page
  const [filters, setFilters] = useState({}); // Filters for API
  const [selectedDate, setSelectedDate] = useState(''); // State for date filter

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

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const visibleLeads = user?.role?.visibleLeads;

      const endpoint = visibleLeads === "All" 
        ? `${process.env.REACT_APP_BASE_URL}api/leads/get?page=${currentPage}&limit=${limit}&${new URLSearchParams(filters)}` 
        : `${process.env.REACT_APP_BASE_URL}api/leads/get_persone_lead?page=${currentPage}&limit=${limit}&${new URLSearchParams(filters)}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setLeads(response.data.leads);
        setTotalPages(response.data.totalPages); // Set total pages from response
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch leads. Please check your connection and try again.");
    } finally {
      setLoading(false);
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
      setError(err.response?.data?.message || "Unable to fetch users. Please check your connection and try again.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers(); // Fetch users only once
      // await fetchLeads(); // Fetch leads only once
    };
    loadData();
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    fetchLeads(); // Fetch leads when currentPage, limit, or filters change
  }, [currentPage, limit, filters]);

  useEffect(() => {
    if (users.length === 1 && !formData.selectedUser) {
      setFormData((prevData) => ({ ...prevData, selectedUser: users[0]._id }));
    }
  }, [users, formData.selectedUser]);

  const handleAddLead = () => {
    setSelectedLead(null);
    setFormData(initialFormState);
    setOpenForm(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setFormData({
      clientName: lead.client_name || "",
      mobileNo: lead.client_mobile_number || "",
      email: lead.client_email || "",
      sourceOfInquiry: lead.source_of_inquiry || "",
      leadStatus: lead.lead_status || "Pending",
      companyName: lead.company_name || "",
      selectedUser: lead.emp_id?._id || "",
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
        setSnackbarMessage('Lead deleted successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        fetchLeads();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead.");
      setSnackbarMessage(err.response?.data?.message || "Failed to delete lead.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
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
      if (!token) throw new Error("Your session has expired. Please log in again.");

      // Validate required fields
      const requiredFields = ['clientName', 'mobileNo', 'email', 'sourceOfInquiry', 'selectedUser'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const leadData = {
        emp_id: formData.selectedUser,
        client_name: formData.clientName,
        client_mobile_number: formData.mobileNo,
        client_email: formData.email,
        source_of_inquiry: formData.sourceOfInquiry,
        lead_status: formData.leadStatus,
        company_name: formData.companyName,
      };

      if (selectedLead) {
        await axios.put(`${process.env.REACT_APP_BASE_URL}api/leads/update/${selectedLead._id}`, leadData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbarMessage('Lead updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_BASE_URL}api/leads/add`, leadData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbarMessage('Lead created successfully!');
      }

      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setOpenForm(false);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save lead. Please try again.");
      setSnackbarMessage(err.response?.data?.message || err.message || "Failed to save lead. Please try again.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
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

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(e.target.value);
    setCurrentPage(1); // Reset to first page when limit changes
  };

  // Clear filters function
  const handleClearFilters = () => {
    setFilters({}); // Reset filters to empty object
    setFormData({
      clientName: '',
      mobileNo: '',
      email: '',
      sourceOfInquiry: '',
      leadStatus: 'Pending',
      companyName: '',
      selectedUser: '',
    }); // Reset form data to initial state
    setCurrentPage(1); // Reset to first page when filters are cleared
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs/>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Lead Management
        </Typography>
        
        {/* Flexbox for layout */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {canCreate && (
            <Button variant="contained" onClick={handleAddLead}>
              Add New Lead
            </Button>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl variant="outlined" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Records per page</InputLabel>
              <Select
                value={limit}
                onChange={handleLimitChange}
                label="Records per page"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} // Custom styling
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
        </Box>

        {/* Filter Inputs */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          
             <TextField
            label="Lead ID"
            variant="outlined"
            size="small"
            name="lead_id"
            value={filters.lead_id || ''}
            onChange={handleFilterChange}
            sx={{ mr: 1 }}
          />

               <TextField
            label="Employee Name"
            variant="outlined"
            size="small"
            name="emp_id"
            value={filters.emp_id || ''}
            onChange={handleFilterChange}
            sx={{ mr: 1 }}
          />

          <TextField
            label="Client Name"
            variant="outlined"
            size="small"
            name="client_name"
            value={filters.client_name || ''}
            onChange={handleFilterChange}
            sx={{ mr: 1 }}
          />
          <TextField
            label="Mobile No."
            variant="outlined"
            size="small"
            name="client_mobile_number"
            value={filters.client_mobile_number || ''}
            onChange={handleFilterChange}
            sx={{ mr: 1 }}
          />
          
          {/* Date Picker Input */}
          <input
            type="date"
            name="date_time"
            value={filters.date_time || ''}
            onChange={handleFilterChange}
            style={{ marginRight: '8px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
<div>
          
</div>
          <TextField
            label="Company Name"
            variant="outlined"
            size="small"
            name="company_name"
            value={filters.company_name || ''}
            onChange={handleFilterChange}
            sx={{ mr: 1 }}
          />
          <TextField
            label="Lead Status"
            variant="outlined"
            size="small"
            name="lead_status"
            value={filters.lead_status || ''}
            onChange={handleFilterChange}
            sx={{ mr: 1 }}
          />
       
     
     
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        
        {canList ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lead ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Client Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mobile No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Company Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  {(canEdit || canDelete) && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>{lead.lead_id}</TableCell>
                    <TableCell>{lead.emp_id.user_name}</TableCell>
                    <TableCell>{lead.client_name}</TableCell>
                    <TableCell>{lead.client_mobile_number}</TableCell>
                    <TableCell>{new Date(lead.date_time).toLocaleDateString()}</TableCell>
                    <TableCell>{lead.company_name}</TableCell>
                    <TableCell>
                      <div style={{
                        ...getStatusColor(lead.lead_status),
                        padding: '5px 10px',
                        borderRadius: '5px',
                        textAlign: 'center'
                      }}>
                        {lead.lead_status}
                      </div>
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell>
                        {canEdit && <Button variant="outlined" size='small' onClick={() => handleEditLead(lead)}>Edit</Button>}
                        {canDelete && <Button variant="outlined" size='small' color="error" sx={{ ml: 1 }} onClick={() => handleDeleteClick(lead._id)}>Delete</Button>}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography align="center" color="error">
            You do not have rights to see the list of leads.
          </Typography>
        )}
        
        {/* Pagination Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
          <Typography>Page {currentPage} of {totalPages}</Typography>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>

      {/* Lead Form Dialog */}
      <Dialog open={openForm} onClose={handleFormClose}>
        <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Client Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
          />
          <TextField
            label="Mobile No."
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.mobileNo}
            onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
            required
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            label="Source of Inquiry"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.sourceOfInquiry}
            onChange={(e) => setFormData({ ...formData, sourceOfInquiry: e.target.value })}
            required
          />
          <TextField
            label="Company Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>User</InputLabel>
            <Select
              value={formData.selectedUser}
              onChange={(e) => setFormData({ ...formData, selectedUser: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.user_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.leadStatus}
              onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
            >
              <MenuItem value="Won">Won</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Follow Up">Follow Up</MenuItem>
              <MenuItem value="Lost">Lost</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedLead ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
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