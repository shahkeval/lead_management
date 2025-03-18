import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        You don't have permission to access this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </Box>
  );
};

export default Unauthorized; 