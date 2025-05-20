import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sendPasswordResetEmail } from '../redux/slices/authSlice'; // Ensure this import is correct
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Snackbar,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [emailError, setEmailError] = useState('');
  const dispatch = useDispatch();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Enter proper email address!!');
      return;
    }

    try {
      await dispatch(sendPasswordResetEmail({ email })).unwrap();
      setSuccessMessage('Password reset link sent to your email!');
      setOpenSnackbar(true);
      setEmail(''); // Clear the email input
      setEmailError(''); // Clear any previous error messages
    } catch (error) {
      // Display the error message from the backend
      setEmailError(error.message || 'Failed to send password reset email. Please try again.');
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        {emailError && (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%', 
              mt: 2,
              mb: 2 
            }}
          >
            {emailError}
          </Alert>
        )}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send Reset Link
          </Button>
          {/* <Box textAlign="center">
            <RouterLink to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
              Remembered your password? Sign in
            </RouterLink>
          </Box> */}
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;