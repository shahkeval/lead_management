import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showError = (message) => {
    if (!message) return;
    if (!alerts.some(alert => alert.message === message)) {
      setAlerts(prev => [...prev, { type: 'error', message }]);
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.message !== message));
      }, 3000);
    }
  };

  const showSuccess = (message) => {
    if (!message) return;
    if (!alerts.some(alert => alert.message === message)) {
      setAlerts(prev => [...prev, { type: 'success', message }]);
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.message !== message));
      }, 3000);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ showSuccess, showError, clearAlerts, alerts }}>
      {children}
      {alerts.map((alert, index) => (
        <Snackbar
          key={index}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={alert.type} 
            onClose={() => {
              setAlerts(prev => prev.filter((_, i) => i !== index));
            }}
            sx={{ 
              width: '100%',
              ...(alert.type === 'success' && {
                backgroundColor: '#2e7d32', // Darker green background
                color: '#fff', // White text
                '& .MuiAlert-icon': {
                  color: '#fff' // White icon
                },
                '& .MuiAlert-action': {
                  color: '#fff' // White close button
                }
              })
            }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext); 