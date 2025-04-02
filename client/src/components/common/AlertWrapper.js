import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const AlertWrapper = ({ error, success, onErrorClose, onSuccessClose }) => {
  return (
    <>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={onErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={onErrorClose} 
          severity="error"
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={onSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={onSuccessClose} 
          severity="success"
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AlertWrapper; 