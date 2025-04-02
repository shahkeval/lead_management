import React, { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

const ErrorAlert = ({ error, onClose, autoHideDuration = 6000 }) => {
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [error, autoHideDuration, onClose]);

  return (
    <Snackbar
      open={Boolean(error)}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity="error"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {error}
      </Alert>
    </Snackbar>
  );
};

export default ErrorAlert; 