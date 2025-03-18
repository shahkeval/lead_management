import React from 'react';
import { Box, Typography } from '@mui/material';
import Navbar from '../Navbar';

const DefaultDashboard = () => {
  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Default Dashboard</Typography>
        <Typography variant="body1">
          Welcome to the Default Dashboard! Here you can find general information and links to other sections of the application.
        </Typography>
        <Typography variant="h5">
          Please ask your administrator to create a proper dashboard for your role!
        </Typography>
      </Box>
    </Box>
  );
};

export default DefaultDashboard; 