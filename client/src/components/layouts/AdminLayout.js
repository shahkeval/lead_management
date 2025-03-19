import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../Navbar';
import Breadcrumbs from '../common/Breadcrumbs';

const AdminLayout = ({ children }) => {
  return (
    <Box>
      <Navbar />
      <Breadcrumbs/>
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 