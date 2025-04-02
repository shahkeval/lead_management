import React, { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

const SuccessAlert = ({ message, onClose, autoHideDuration = 4000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [message, autoHideDuration, onClose]);

  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity="success"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessAlert; 