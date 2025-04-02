import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAlerts } from '../../context/AlertContext';

const GlobalAlerts = () => {
  const { alerts, clearAlerts } = useAlerts();

  return alerts.map((alert, index) => (
    <Snackbar
      key={`${alert.message}-${index}`}
      open={true}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        marginTop: `${index * 60}px`, // Stack alerts vertically
      }}
    >
      <Alert
        severity={alert.type}
        onClose={clearAlerts}
        variant="filled"
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '0.875rem',
            fontWeight: 500
          }
        }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  ));
};

export default GlobalAlerts; 