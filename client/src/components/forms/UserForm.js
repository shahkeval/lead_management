import React from 'react';
import useFormError from '../hooks/useFormError';
import useAlerts from '../hooks/useAlerts';
import AlertWrapper from '../common/AlertWrapper';

const UserForm = () => {
  const { fieldErrors, setFieldError, clearFieldErrors } = useFormError();
  const { error, success, showError, showSuccess, clearAlerts } = useAlerts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFieldErrors();
    clearAlerts();

    try {
      // Validate fields
      if (!formData.email) {
        setFieldError('email', 'Email is required');
        return;
      }

      // API call
      await submitForm();
      showSuccess('User saved successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save user.');
    }
  };

  return (
    <>
      <AlertWrapper
        error={error}
        success={success}
        onErrorClose={() => clearAlerts()}
        onSuccessClose={() => clearAlerts()}
      />
      <form onSubmit={handleSubmit}>
        <TextField
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          // ...other props
        />
        {/* Other form fields */}
      </form>
    </>
  );
}; 