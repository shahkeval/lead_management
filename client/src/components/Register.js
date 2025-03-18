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
  Snackbar,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    user_name: '',
    mobile_name: '',
    role: 'sales person',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
      setPasswordError('');
    }
    if (e.target.name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    try {
      const result = await dispatch(register(formData));
      
      if (result.error) {
        return;
      }

      setSuccessMessage('Registration successful! Redirecting to login...');
      setOpenSnackbar(true);

      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        user_name: '',
        mobile_name: '',
        role: 'sales person',
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
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
          Register
        </Typography>

        {/* Error Alerts */}
        {(error || passwordError || emailError) && (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%', 
              mt: 2,
              mb: 2 
            }}
          >
            {error || passwordError || emailError}
          </Alert>
        )}

        {/* Success Snackbar */}
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

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="user_name"
            label="User Name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="mobile_name"
            label="Mobile Number"
            name="mobile_name"
            value={formData.mobile_name}
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