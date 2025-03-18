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
import Navbar from './Navbar';

const LeadManagementUser = () => {
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
  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/leads/get_persone_lead`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setLeads(response.data.leads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError(error.response?.data?.message || "Error fetching leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/users/get_persone_user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setUsers(response.data.users);
        // Set the first user as the default selected user
        if (response.data.users.length > 0) {
          setFormData(prev => ({ ...prev, selectedUser: response.data.users[0]._id }));
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching users');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers(); // Fetch users for the dropdown
  }, []);

  const handleAddLead = () => {
    setSelectedLead(null); // Clear selected lead for adding
    setFormData({
      clientName: '',
      mobileNo: '',
      email: '',
      sourceOfInquiry: '',
      leadStatus: 'Pending',
      companyName: '',
      selectedUser: users.length > 0 ? users[0]._id : '', // Set default user
    });
    setOpenForm(true); // Open the form
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead); // Set the selected lead for editing
    setFormData({
      clientName: lead.client_name || '',
      mobileNo: lead.client_mobile_number || '',
      email: lead.client_email || '',
      sourceOfInquiry: lead.source_of_inquiry || '',
      leadStatus: lead.lead_status || 'Pending',
      companyName: lead.company_name || '',
      selectedUser: lead.emp_id._id || '',
    });
    setOpenForm(true); // Open the form
  };

  const handleDeleteLead = async (leadId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_BASE_URL}api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads(); // Refresh the leads list
      setOpenSnackbar(true);
    } catch (error) {
      setError(error.response?.data?.message || "Error deleting lead");
    }
  };

  const handleFormClose = () => {
    setOpenForm(false); // Close the form
    fetchLeads(); // Refresh leads after adding/editing
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedLead) {
        // Edit lead
        await axios.put(`${process.env.REACT_APP_BASE_URL}api/leads/update/${selectedLead._id}`, {
          emp_id: formData.selectedUser,
          client_name: formData.clientName,
          client_mobile_number: formData.mobileNo,
          client_email: formData.email,
          source_of_inquiry: formData.sourceOfInquiry,
          lead_status: formData.leadStatus,
          company_name: formData.companyName,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Add lead
        await axios.post(`${process.env.REACT_APP_BASE_URL}api/leads/add`, {
          emp_id: formData.selectedUser,
          client_name: formData.clientName,
          client_mobile_number: formData.mobileNo,
          client_email: formData.email,
          source_of_inquiry: formData.sourceOfInquiry,
          lead_status: formData.leadStatus,
          company_name: formData.companyName,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleFormClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving lead');
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

  return (
    <Box sx={{ p: 0 }}>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Lead Management
        </Typography>
        <Button variant="contained" onClick={handleAddLead} sx={{ mb: 2 }}>
          Add New Lead
        </Button>
        {error && <Alert severity="error">{error}</Alert>}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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
                  <TableCell>
                    <Button variant="outlined" size='small' onClick={() => handleEditLead(lead)}>
                      Edit
                    </Button>
                    <Button variant="outlined" size='small' color="error" sx={{ ml: 1 }} onClick={() => handleDeleteLead(lead._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            Lead deleted successfully!
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
    </Box>
  );
};

export default LeadManagementUser;
