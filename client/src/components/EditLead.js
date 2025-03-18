import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import axios from 'axios';
import Navbar from './Navbar';
const EditLead = () => {
    const { leadId } = useParams(); // Get the lead ID from the URL
    const [clientName, setClientName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');
    const [sourceOfInquiry, setSourceOfInquiry] = useState('');
    const [leadStatus, setLeadStatus] = useState('New');
    const [companyName, setCompanyName] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [users, setUsers] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchLead = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/leads/${leadId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                const lead = response.data.lead;
                setClientName(lead.client_name);
                setMobileNo(lead.client_mobile_number);
                setEmail(lead.client_email);
                setSourceOfInquiry(lead.source_of_inquiry);
                setLeadStatus(lead.lead_status);
                setCompanyName(lead.company_name);
                setSelectedUser(lead.emp_id._id); // Set the selected user ID
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching lead details');
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/users/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching users');
        }
    };

    useEffect(() => {
        fetchLead();
        fetchUsers(); // Fetch users for the dropdown
    }, [leadId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}api/leads/update/${leadId}`, {
                emp_id: selectedUser, // Use the selected user ID
                client_name: clientName,
                client_mobile_number: mobileNo,
                client_email: email,
                source_of_inquiry: sourceOfInquiry,
                lead_status: leadStatus,
                company_name: companyName,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setOpenSnackbar(true);
                setTimeout(() => {
                    navigate('/leads'); // Redirect to Lead Management page
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating lead');
        }
    };

    return (
        <Box sx={{ p: 0 }}>
      <Navbar />
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Edit Lead
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Client Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                />
                <TextField
                    label="Mobile No."
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    required
                />
                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="Source of Inquiry"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={sourceOfInquiry}
                    onChange={(e) => setSourceOfInquiry(e.target.value)}
                    required
                />
                <TextField
                    label="Company Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                />
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>User</InputLabel>
                    <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        {users.map((user) => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.user_name} {/* Adjust based on your User model */}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={leadStatus}
                        onChange={(e) => setLeadStatus(e.target.value)}
                    >
                        <MenuItem value="Won">Won</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Follow Up">Follow Up</MenuItem>
                        <MenuItem value="Lost">Lost</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Update Lead
                </Button>
            </form>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="success">
                    Lead updated successfully!
                </Alert>
            </Snackbar>
        </Box>
        </Box>
    );
};

export default EditLead; 