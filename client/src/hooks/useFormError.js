import { useState } from 'react';

const useFormError = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const clearErrors = () => {
    setFieldErrors({});
    setGlobalError('');
  };

  const setError = (field, message) => {
    if (field === 'global') {
      setGlobalError(message);
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: message }));
    }

    // Auto-clear error after 6 seconds
    setTimeout(() => {
      if (field === 'global') {
        setGlobalError('');
      } else {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
    }, 6000);
  };

  return {
    fieldErrors,
    globalError,
    setError,
    clearErrors
  };
};

export default useFormError; 