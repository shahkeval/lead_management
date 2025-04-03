import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          Lead Management System
        </Typography>
        {user && (
          <Typography variant="body1" style={{ marginRight: '20px', color: 'white' }}>
            Welcome, {user.userName}
          </Typography>
        )}
        <Typography variant="body1" style={{ marginRight: '20px', color: 'white' }}>
            {user?.role?.roleName}
          </Typography>
        <Button 
          color="inherit" 
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
        >
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 