import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Grid,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAlerts } from '../context/AlertContext';
import axios from 'axios';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import GlobalAlerts from './common/GlobalAlerts';
import Breadcrumbs from './common/Breadcrumbs';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MeetingManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useAlerts();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Table state
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [rowCount, setRowCount] = useState(0);
  const [isRefetching, setIsRefetching] = useState(false);
  const [tableError, setTableError] = useState(null);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    attendeeName: '',
    representorName: '',
    agenda: '',
    status: 'Active'
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const [attendeeType, setAttendeeType] = useState('other');
  const [clientNames, setClientNames] = useState([]);

  const fetchMeetings = async () => {
    try {
      setIsRefetching(true);
      const token = localStorage.getItem('token');
      const endpoint = user?.role?.roleName === "Admin"
      ? `${process.env.REACT_APP_BASE_URL}api/meetings`
      : `${process.env.REACT_APP_BASE_URL}api/meetings/get_persone_meeting`;

      const queryParams = new URLSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        filters: JSON.stringify(columnFilters),
        globalFilter: globalFilter,
        sorting: JSON.stringify(sorting),
      });

      const response = await axios.get(
        `${endpoint}?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMeetings(response.data.meetings);
        setRowCount(response.data.totalCount);
        setTableError(null);
      }
    } catch (error) {
      setTableError(error.response?.data?.message || 'Failed to fetch meetings');
    } finally {
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    const fetchClientNames = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/leads/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setClientNames(response.data.clients);
        }
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to fetch client names');
      }
    };
    fetchClientNames();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/users/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch users');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingMeeting(null);
    setFormData({
      date: '',
      time: '',
      attendeeName: '',
      representorName: '',
      agenda: '',
      status: 'Active'
    });
    setFieldErrors({});
    setAttendeeType('other');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMeeting(null);
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.attendeeName) errors.attendeeName = 'Attendee name is required';
    if (!formData.representorName) errors.representorName = 'Representor is required';
    if (!formData.agenda) errors.agenda = 'Agenda is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const meetingData = {
        ...formData,
        date: formData.date,
        time: formData.time
      };

      if (editingMeeting) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}api/meetings/${editingMeeting._id}`,
          meetingData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSuccess('Meeting updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}api/meetings`,
          meetingData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSuccess('Meeting created successfully');
      }
      
      handleClose();
      // Refresh the table data immediately
      await fetchMeetings();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      date: meeting.date,
      time: meeting.time,
      attendeeName: meeting.attendeeName,
      representorName: meeting.representorName._id,
      agenda: meeting.agenda,
      status: meeting.status
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_BASE_URL}api/meetings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess('Meeting deleted successfully');
        // Refresh the table data immediately
        await fetchMeetings();
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete meeting');
      }
    }
  };

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'time',
      header: 'Time',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'attendeeName',
      header: 'Attendee',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'representorName.userName',
      header: 'Representor',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'agenda',
      header: 'Agenda',
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ cell }) => (
        <Box
          sx={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: cell.getValue() === 'Active' ? '#e8f5e9' : '#ffebee',
            color: cell.getValue() === 'Active' ? '#2e7d32' : '#c62828',
            fontWeight: 500
          }}
        >
          {cell.getValue()}
        </Box>
      ),
      enableGlobalFilter: true,
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: meetings,
    enableRowSelection: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: tableError
      ? {
          color: 'error',
          children: tableError,
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading: loading || isRefetching,
      pagination,
      showAlertBanner: Boolean(tableError),
      showProgressBars: isRefetching,
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
    muiTablePaginationProps: {
      rowsPerPageOptions: [5, 10, 25],
    },
    renderTopToolbarCustomActions: () => (
      canCreate && (
        <Button variant="contained" onClick={handleOpen}>
          Add New Meeting
        </Button>
      )
    ),
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        {canEdit && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>
        )}
        {canDelete && (
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            onClick={() => handleDelete(row.original._id)}
          >
            Delete
          </Button>
        )}
      </Box>
    ),
    positionActionsColumn: 'last',
    muiTableHeadCellProps: {
      sx: {
        '&:last-child': {
          width: '150px',
        },
      },
    },
  });

  // User permissions
  const canEdit = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "meeting management" && m.action === "update"
  );
  const canDelete = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "meeting management" && m.action === "delete"
  );
  const canCreate = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "meeting management" && m.action === "create"
  );
  const canList = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "meeting management" && m.action === "list"
  );

  const handleScheduleClick = () => {
    localStorage.setItem('lastPath', '/schedule');
    navigate('/schedule');
  };

  return (
    <Box sx={{ p: 0 }}>
      <GlobalAlerts />
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Meeting Management
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleScheduleClick}
            sx={{ ml: 2 }}
          >
            View Schedule
          </Button>
        </Box>
        
        {canList ? (
          <MaterialReactTable table={table} />
        ) : (
          <Typography align="center" color="error">
            You do not have rights to see the list of meetings.
          </Typography>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingMeeting ? 'Edit Meeting' : 'Add New Meeting'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  error={!!fieldErrors.date}
                  helperText={fieldErrors.date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  error={!!fieldErrors.time}
                  helperText={fieldErrors.time}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={attendeeType}
                    onChange={(e) => setAttendeeType(e.target.value)}
                  >
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                    <FormControlLabel value="registered" control={<Radio />} label="Registered Attendee" />
                    
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {attendeeType === 'registered' ? (
                  <FormControl fullWidth error={!!fieldErrors.attendeeName}>
                    <InputLabel>Attendee Name</InputLabel>
                    <Select
                      value={formData.attendeeName}
                      onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                      label="Attendee Name"
                    >
                      {clientNames.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.attendeeName && (
                      <FormHelperText>{fieldErrors.attendeeName}</FormHelperText>
                    )}
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label="Attendee Name"
                    value={formData.attendeeName}
                    onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                    error={!!fieldErrors.attendeeName}
                    helperText={fieldErrors.attendeeName}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!fieldErrors.representorName}>
                  <InputLabel>Representor</InputLabel>
                  <Select
                    value={formData.representorName}
                    onChange={(e) => setFormData({ ...formData, representorName: e.target.value })}
                    label="Representor"
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.userName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.representorName && (
                    <FormHelperText>{fieldErrors.representorName}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Agenda"
                  multiline
                  rows={4}
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  error={!!fieldErrors.agenda}
                  helperText={fieldErrors.agenda}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : editingMeeting ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingManagement;
