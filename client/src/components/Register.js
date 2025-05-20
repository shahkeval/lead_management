import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../redux/slices/authSlice';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import logo from '../assets/jarvis_leaad_logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userName: '',
    mobileName: '',
    role: 'sales person',
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const { showError, showSuccess } = useAlerts();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field errors when user starts typing
    if (e.target.name === 'email') {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
    if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a proper email address' }));
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, password: "Passwords don't match" }));
      return;
    }

    try {
      const result = await dispatch(register(formData));
      
      if (result.error) {
        showError(result.error.message || "Registration failed. Please try again.");
        return;
      }

      showSuccess('Registration successful! Redirecting to login...');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        userName: '',
        mobileName: '',
        role: 'sales person',
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      showError("Unable to register. Please try again later.");
    }
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
        <img src={logo} alt="Logo" style={{ width: '150px', marginBottom: '20px' }} />
        <Typography component="h1" variant="h5">
          Register
        </Typography>

        {/* Error Alerts */}
        {(error || fieldErrors.password || fieldErrors.email) && (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%', 
              mt: 2,
              mb: 2 
            }}
          >
            {error || fieldErrors.password || fieldErrors.email}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="userName"
            label="User Name"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="mobileName"
            label="Mobile Number"
            name="mobileName"
            value={formData.mobileName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <TextField
            select
            margin="normal"
            required
            fullWidth
            id="role"
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="sales person">Sales Person</MenuItem>
            <MenuItem value="sales manager">Sales Manager</MenuItem>
          </TextField>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Box textAlign="center">
            <RouterLink to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
              Already have an account? Sign in
            </RouterLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register; 