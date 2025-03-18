import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../Navbar';

const AdminLayout = ({ children }) => {
  return (
    <Box>
      <Navbar />
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 