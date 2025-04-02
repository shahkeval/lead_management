import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showError = (message) => {
    if (!message) return;
    setAlerts(prev => [...prev, { type: 'error', message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.message !== message));
    }, 6000);
  };

  const showSuccess = (message) => {
    if (!message) return;
    setAlerts(prev => [...prev, { type: 'success', message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.message !== message));
    }, 4000);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ alerts, showError, showSuccess, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}; 