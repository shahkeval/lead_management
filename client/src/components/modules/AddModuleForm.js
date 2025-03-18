import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import axios from 'axios';

const AddModuleForm = ({ open, handleClose, onModuleAdded }) => {
  const [formData, setFormData] = useState({
    moduleName: '',
    actions: [],
    parentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);

  const actions = ['create', 'update', 'list', 'view', 'delete','parent'];

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const parentModules = response.data.modules.filter(module => !module.parentId);
          
          const uniqueModules = Array.from(new Set(parentModules.map(module => module.moduleName)))
            .map(name => parentModules.find(module => module.moduleName === name));

          setModules(uniqueModules);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching modules');
      }
    };

    fetchModules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'actions') {
      setFormData(prev => {
        const actions = prev.actions.includes(value)
          ? prev.actions.filter(action => action !== value)
          : [...prev.actions, value];
        return { ...prev, actions };
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const requests = formData.actions.map(action => ({
        moduleName: formData.moduleName,
        action,
        parentId: formData.parentId,
      }));

      await Promise.all(requests.map(data =>
        axios.post(`${process.env.REACT_APP_BASE_URL}api/modules`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));

      onModuleAdded();
      handleClose();
      setFormData({ moduleName: '', actions: [], parentId: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Module</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Module Name"
            name="moduleName"
            value={formData.moduleName}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <div>
            <Typography variant="subtitle1">Actions</Typography>
            {actions.map(action => (
              <FormControlLabel
                key={action}
                control={
                  <Checkbox
                    checked={formData.actions.includes(action)}
                    onChange={() => handleChange({ target: { name: 'actions', value: action } })}
                  />
                }
                label={action.charAt(0).toUpperCase() + action.slice(1)}
              />
            ))}
          </div>
          <TextField
            select
            label="Parent ID"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {parentModules.map(module => (
              <MenuItem key={module._id} value={module._id}>
                {module.moduleName}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Module'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddModuleForm;
