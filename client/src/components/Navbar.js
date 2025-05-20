import React, { useState } from 'react';
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
  Menu,
  MenuItem,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import ChangePasswordIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change_password');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const canChangePassword = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "change password" && m.action === "view"
  );

  return (
    <AppBar position="fixed">
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
          <Tooltip title="Account Options">
          <Button color="inherit" onClick={handleMenuClick}>
            <AccountCircleIcon />
          </Button>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {canChangePassword && (
            <MenuItem onClick={handleChangePassword}>
              <ChangePasswordIcon style={{ marginRight: '8px' }} />
              Change Password
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            <LogoutIcon style={{ marginRight: '8px' }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 