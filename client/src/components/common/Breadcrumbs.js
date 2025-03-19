import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useSelector } from 'react-redux';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [roleName, setRoleName] = useState('');

  // Map of path segments to their display names
  const pathMap = {
    'dashboard': 'Dashboard',
    'manage-roles': 'Manage Roles',
    'manage-rights': 'Manage Rights',
    'users': 'Users',
    'leads': 'Leads',
  };

  const handleNavigation = (path) => {
    localStorage.setItem('lastPath', path);
    navigate(path);
  };

  // Function to get custom breadcrumb path based on current location
  const getCustomBreadcrumbs = () => {
    const customPaths = [];
    
    // Always add Dashboard as first item
    customPaths.push({
      path: '/dashboard',
      label: 'Dashboard',
      isLast: false
    });

    // Handle different routes
    if (pathnames.includes('manage-rights')) {
      customPaths.push({
        path: '/admin/manage-roles',
        label: 'Manage Roles',
        isLast: false
      });
      customPaths.push({
        path: location.pathname,
        label: 'Manage Rights',
        isLast: true
      });
    } else if (pathnames.includes('manage-roles')) {
      customPaths.push({
        path: '/admin/manage-roles',
        label: 'Manage Roles',
        isLast: true
      });
    } else if (pathnames.includes('users')) {
      customPaths.push({
        path: '/admin/users',
        label: 'Users',
        isLast: true
      });
    } else if (pathnames.includes('leads')) {
      customPaths.push({
        path: '/leads',
        label: 'Leads',
        isLast: true
      });
    }

    return customPaths;
  };

  const breadcrumbs = getCustomBreadcrumbs();

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      {breadcrumbs.map((breadcrumb, index) => {
        return breadcrumb.isLast ? (
          <Typography color="text.primary" key={breadcrumb.path}>
            {breadcrumb.label}
          </Typography>
        ) : (
          <Link
            component="button"
            onClick={() => handleNavigation(breadcrumb.path)}
            underline="hover"
            color="inherit"
            key={breadcrumb.path}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            {breadcrumb.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs; 