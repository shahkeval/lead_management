import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, getMe } from '../redux/slices/authSlice';
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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'sales person',
    isRegistering: false
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [emailError, setEmailError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      setEmailError('');
    }
  };

  const toggleMode = () => {
    setFormData({
      ...formData,
      isRegistering: !formData.isRegistering,
      email: '',
      password: '',
      role: 'sales person',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const result = await dispatch(login(formData)).unwrap();
      
      if (result.error) {
        console.error('Login Error:', result.error);
        setEmailError('Login failed. Please check your credentials.');
        return;
      }

      // Fetch user data after successful login
      await dispatch(getMe()).unwrap();

      setSuccessMessage('Login successful!');
      setOpenSnackbar(true);

      setTimeout(() => {
        // Check for stored path first
        const lastPath = localStorage.getItem('lastPath');
        if (lastPath) {
          navigate(lastPath);
        } else {
          navigate('/dashboard'); // Redirect to the dashboard
        }
      }, 1000);

    } catch (error) {
      console.error('Form submission error:', error);
      setEmailError('An error occurred. Please try again later.');
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
          Sign in
        </Typography>
        {(error || emailError) && (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%', 
              mt: 2,
              mb: 2 
            }}
          >
            {error || emailError}
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
            value={formData.email}
            onChange={handleChange}
            error={!!emailError}
            helperText={emailError}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box textAlign="center">
            <RouterLink to="/register" style={{ textDecoration: 'none', color: 'primary.main' }}>
              Don't have an account? Sign up
            </RouterLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 