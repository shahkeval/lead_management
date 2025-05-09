import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import BreadcrumbsComponent from './common/Breadcrumbs';
import { useAlerts } from '../context/AlertContext';

const localizer = momentLocalizer(moment);

const MeetingCalendar = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const { showError, showSuccess } = useAlerts();
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [clientNames, setClientNames] = useState([]);
    const [attendeeType, setAttendeeType] = useState('other');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [editingMeeting, setEditingMeeting] = useState(null);

    const initialFormData = {
        date: '',
        startTime: '',
        endTime: '',
        attendeeName: '',
        representorName: '',
        agenda: '',
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialFormData);
    const [fieldErrors, setFieldErrors] = useState({});

    // Fetch meetings from backend
    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = user?.role?.visibleMeetings === "All"
                ? `${process.env.REACT_APP_BASE_URL}api/meetings`
                : `${process.env.REACT_APP_BASE_URL}api/meetings/get_persone_meeting`;

            const res = await axios.get(
                `${endpoint}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data && res.data.meetings) {
                const mappedEvents = res.data.meetings
                    .filter(meeting => meeting.startTime && meeting.endTime) // Only map valid meetings
                    .map((meeting) => {
                        const [startHours, startMinutes] = meeting.startTime.split(':');
                        const [endHours, endMinutes] = meeting.endTime.split(':');
                        const start = new Date(meeting.date);
                        start.setHours(Number(startHours), Number(startMinutes), 0, 0);
                        const end = new Date(meeting.date);
                        end.setHours(Number(endHours), Number(endMinutes), 0, 0);

                        // Defensive: If start or end is invalid, skip this event
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            console.warn('Invalid meeting time:', meeting);
                            return null;
                        }

                        return {
                            id: meeting._id,
                            title: meeting.agenda,
                            clientName: meeting.attendeeName,
                            agenda: meeting.agenda,
                            status: meeting.status,
                            representorName: meeting.representorName,
                            start,
                            end,
                        };
                    })
                    .filter(Boolean); // Remove nulls
                setEvents(mappedEvents);
            }
        } catch (err) {
            console.error('Failed to fetch meetings:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = user?.role?.visibleMeetings === "Own" 
                ? `${process.env.REACT_APP_BASE_URL}api/users/get_persone_user` 
                : `${process.env.REACT_APP_BASE_URL}api/users/list`;

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users);
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchMeetings();
        fetchUsers();
    }, [user]);

    useEffect(() => {
        if (users.length === 1) {
            setFormData((prevData) => ({
                ...prevData,
                representorName: users[0]._id // Auto-select the only user
            }));
        }
    }, [users]);

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

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setSelectedSlot(null);
    };

    const handleSelectSlot = (slotInfo) => {
        if (!slotInfo.event) {
            setSelectedEvent(null);
            setSelectedSlot(slotInfo);
            const startTime = moment(slotInfo.start).format('HH:mm');
            const endTime = moment(slotInfo.end).format('HH:mm');
            setFormData({
                ...formData,
                date: moment(slotInfo.start).format('YYYY-MM-DD'),
                startTime,
                endTime
            });
            fetchClientNames();
            setOpenAdd(true);
        }
    };

    const handleOpenAdd = () => {
        setOpenAdd(true);
        setEditingMeeting(null);
        setFormData(initialFormData);
        setFieldErrors({});
        setAttendeeType('other');
        fetchClientNames();

        if (users.length === 1) {
            setFormData((prevData) => ({
                ...prevData,
                representorName: users[0]._id // Auto-select the only user
            }));
        }
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
        setFieldErrors({});
        setFormData(initialFormData);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setFieldErrors({});
        setFormData(initialFormData);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.attendeeName) errors.attendeeName = 'Attendee name is required';
        if (!formData.representorName) errors.representorName = 'Representor is required';
        if (!formData.agenda) errors.agenda = 'Agenda is required';
        if (!formData.date) errors.date = 'Date is required';
        if (!formData.startTime) errors.startTime = 'Start time is required';
        if (!formData.endTime) errors.endTime = 'End time is required';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Helper to check if a meeting is past or already ended today
    const isMeetingPastOrEnded = (date, endTime) => {
        const meetingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (meetingDate < today) return true;
        if (meetingDate.toDateString() === today.toDateString()) {
            const [endHour, endMinute] = endTime.split(':').map(Number);
            const now = new Date();
            if (
                now.getHours() > endHour ||
                (now.getHours() === endHour && now.getMinutes() >= endMinute)
            ) {
                return true;
            }
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Prevent adding/updating meetings in the past or already ended today
        if (isMeetingPastOrEnded(formData.date, formData.endTime)) {
            showError('Cannot add or update meetings in the past or already ended today');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const meetingData = {
                ...formData,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime
            };

            if (selectedEvent) { // If editing
                await axios.put(
                    `${process.env.REACT_APP_BASE_URL}api/meetings/${selectedEvent.id}`,
                    meetingData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showSuccess('Meeting updated successfully');
            } else { // If adding
                await axios.post(
                    `${process.env.REACT_APP_BASE_URL}api/meetings`,
                    meetingData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showSuccess('Meeting created successfully');
            }
            
            handleCloseAdd();
            handleCloseEdit();
            fetchMeetings();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save meeting');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (event) => {
        setEditingMeeting(event);
        setFormData({
            date: moment(event.start).format('YYYY-MM-DD'),
            startTime: moment(event.start).format('HH:mm'),
            endTime: moment(event.end).format('HH:mm'),
            attendeeName: event.clientName,
            representorName: event.representorName._id,
            agenda: event.agenda,
            status: event.status
        });
        setOpenEdit(true);
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this meeting?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.REACT_APP_BASE_URL}api/meetings/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccess('Meeting deleted successfully');
                fetchMeetings();
            } catch (error) {
                showError(error.response?.data?.message || 'Failed to delete meeting');
            }
        }
    };

    // Helper to format date and time
    const formatDate = (date) => moment(date).format('M/D/YYYY');
    const formatTime = (date) => moment(date).format('HH:mm');

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

    // Add a new function to handle edit button click
    const handleEditClick = (event) => {
        setFormData({
            date: moment(event.start).format('YYYY-MM-DD'),
            startTime: moment(event.start).format('HH:mm'),
            endTime: moment(event.end).format('HH:mm'),
            attendeeName: event.clientName,
            representorName: event.representorName._id,
            agenda: event.agenda,
            status: event.status
        });
        fetchClientNames();
        setOpenEdit(true);
    };

    return (
        <Box sx={{ p: 2, height: '100vh', background: '#f9f9f9' }}>
            <BreadcrumbsComponent />
            <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Left: Meeting Details */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #1976d2', pb: 1 }}>
                            Meeting Details &nbsp;
                        </Typography>
                        {selectedEvent && canEdit ? (
                            <>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={() => handleEdit(selectedEvent)}
                                    disabled={isMeetingPastOrEnded(selectedEvent.start, moment(selectedEvent.end).format('HH:mm'))}
                                    sx={{ mr: 1 }}
                                >
                                    Edit
                                </Button>
                            </>
                        ) : null}
                        {selectedEvent && canDelete ? (
                            <Button 
                                variant="outlined" 
                                color="error" 
                                onClick={() => handleDelete(selectedEvent.id)}
                                disabled={isMeetingPastOrEnded(selectedEvent.start, moment(selectedEvent.end).format('HH:mm'))}
                            >
                                Delete
                            </Button>
                        ) : null}
                        <Box></Box>
                        <Divider sx={{ mb: 2 }} />
                        {selectedEvent ? (
                            <>
                                <Typography variant="subtitle2">Client Name</Typography>
                                <Typography variant="body2" gutterBottom>{selectedEvent.clientName}</Typography>
                                <Typography variant="subtitle2">Representor Name</Typography>
                                <Typography variant="body2" gutterBottom>{selectedEvent.representorName?.userName}</Typography>
                                <Typography variant="subtitle2">Date</Typography>
                                <Typography variant="body2" gutterBottom>{formatDate(selectedEvent.start)}</Typography>
                                <Typography variant="subtitle2">Start Time</Typography>
                                <Typography variant="body2" gutterBottom>{formatTime(selectedEvent.start)}</Typography>
                                <Typography variant="subtitle2">End Time</Typography>
                                <Typography variant="body2" gutterBottom>{formatTime(selectedEvent.end)}</Typography>
                                <Typography variant="subtitle2">Agenda</Typography>
                                <Typography variant="body2" gutterBottom>{selectedEvent.agenda}</Typography>
                                <Typography variant="subtitle2">Status</Typography>
                                <Typography variant="body2" color={selectedEvent.status === 'Active' ? 'green' : 'red'}>
                                    {selectedEvent.status}
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Select a meeting to see details or click on the calendar to add a new meeting.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
                {/* Right: Calendar */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4">
                            Schedule Meetings
                        </Typography>
                    </Box>
                    <Paper elevation={1}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600, padding: 10 }}
                            views={['month', 'week', 'day']}
                            defaultView="month"
                            selectable
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Meeting Dialog */}
            <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="md" fullWidth>
                <DialogTitle>Add New Meeting</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="Start Time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    error={!!fieldErrors.startTime}
                                    helperText={fieldErrors.startTime}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="End Time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    error={!!fieldErrors.endTime}
                                    helperText={fieldErrors.endTime}
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
                                        disabled={users.length === 1}
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
                    <Button onClick={handleCloseAdd}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Meeting Dialog */}
            <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="md" fullWidth>
                <DialogTitle>{editingMeeting ? 'Edit Meeting' : 'Add New Meeting'}</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="Start Time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    error={!!fieldErrors.startTime}
                                    helperText={fieldErrors.startTime}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="End Time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    error={!!fieldErrors.endTime}
                                    helperText={fieldErrors.endTime}
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
                                        disabled={users.length === 1}
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
                    <Button onClick={handleCloseEdit}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MeetingCalendar;
