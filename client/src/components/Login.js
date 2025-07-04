import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../redux/slices/authSlice';
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
import { useAlerts } from '../context/AlertContext';
import GlobalAlerts from './common/GlobalAlerts';
import logo from '../assets/jarvis_leaad_logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'sales person',
    isRegistering: false
  });

  const { showError, showSuccess } = useAlerts();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error: reduxError } = useSelector((state) => state.auth);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      showError('Please enter a proper email address');
      return;
    }

    try {
      const result = await dispatch(login(formData));
      
      if (result.error) {
        showError(result.playload || "Login failed. Please try again.");
        return;
      }

      // Show success message and navigate
      showSuccess('Login successful! Welcome back.');
      navigate('/dashboard'); // Remove the state parameter
      
    } catch (error) {
      showError("An error occurred during login. Please try again.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <GlobalAlerts />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src={logo} alt="Logo" style={{ width: '150px', marginBottom: '20px' }} />
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
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
          <Box textAlign="center">
            <RouterLink to="/forgot-password" style={{ textDecoration: 'none', color: 'primary.main' }}>
              ForgotPassword!
            </RouterLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 