import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      sx={{ 
        width: '100%', 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        backgroundColor: '#3f51b5', // Match your AppBar color
        color: 'white', 
        textAlign: 'center', 
        padding: '10px 0',
        zIndex:'100'
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Powered by Jarvis Technolabs
      </Typography>
    </Box>
  );
};

export default Footer;
