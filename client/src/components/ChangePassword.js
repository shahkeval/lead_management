import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { changePassword } from '../redux/slices/authSlice'; // Ensure this action is defined
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Snackbar,
} from '@mui/material';
import BreadcrumbsComponent from './common/Breadcrumbs';

import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    // Save the current path to local storage when the component mounts
    localStorage.setItem('lastPath', '/change_password');
  }, []); // Empty dependency array to run only on mount

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that new passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}api/auth/change-password`, 
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request headers
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage('Password changed successfully!');
        setOpenSnackbar(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
      }
    } catch (error) {
      // Display the error message from the backend
      setErrorMessage(error.response?.data?.message || 'Failed to change password. Please try again.');
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth={false}>
      <Box sx={{ mb: 2, marginTop:2}}>
        <BreadcrumbsComponent />
      </Box>

      <Box
        sx={{
          marginTop: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Change Password
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '30%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="currentPassword"
            label="Current Password"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="newPassword"
            label="New Password"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="confirmPassword"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Change Password
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChangePassword; // Ensure this is a default export
