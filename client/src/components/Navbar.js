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
  Tooltip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import ChangePasswordIcon from '@mui/icons-material/Lock';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change_password');
  };

  const canChangePassword = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "change password" && m.action === "view"
  );

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
        {canChangePassword && (
          <Tooltip title="Change Password">
            <Button 
              color="inherit" 
              onClick={handleChangePassword}
              startIcon={<ChangePasswordIcon />}
            >
            </Button>
          </Tooltip>
        )}
        <Tooltip title="Sign Out">
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
          </Button>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 