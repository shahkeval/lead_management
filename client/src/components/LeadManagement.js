import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import axios from "axios";
import { useSelector } from 'react-redux';
import Breadcrumbs from './common/Breadcrumbs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu } from 'primereact/menu';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dropdown } from 'primereact/dropdown';
import { Button as PrimeButton } from 'primereact/button';
import FilterListIcon from '@mui/icons-material/FilterList';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    mobileNo: '',
    email: '',
    sourceOfInquiry: '',
    leadStatus: 'Pending',
    companyName: '',
    selectedUser: '',
  });
  const [users, setUsers] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lead_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    'emp_id.user_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    client_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    client_mobile_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    date_time: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    company_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    lead_status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const filterMenuRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('');
  const filterOverlayRef = useRef(null);
  const [filterOptions] = useState({
    default: [
      { label: 'Contains', value: FilterMatchMode.CONTAINS },
      { label: 'Equals', value: FilterMatchMode.EQUALS }
    ],
    date: [
      { label: 'Date equals', value: FilterMatchMode.DATE_IS },
      { label: 'Date before', value: FilterMatchMode.DATE_BEFORE },
      { label: 'Date after', value: FilterMatchMode.DATE_AFTER }
    ],
    status: [
      { label: 'Equals', value: FilterMatchMode.EQUALS }
    ],
    number: [
      { label: 'Contains', value: FilterMatchMode.CONTAINS },
      { label: 'Equals', value: FilterMatchMode.EQUALS }
    ],
    text: [
      { label: 'Contains', value: FilterMatchMode.CONTAINS },
      { label: 'Equals', value: FilterMatchMode.EQUALS }
    ]
  });
  const [currentFilterField, setCurrentFilterField] = useState('');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [currentMatchMode, setCurrentMatchMode] = useState(FilterMatchMode.STARTS_WITH);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });

  // Initial form state
  const initialFormState = {
    clientName: "",
    mobileNo: "",
    email: "",
    sourceOfInquiry: "",
    leadStatus: "Pending",
    companyName: "",
    selectedUser: "",
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const visibleLeads = user?.role?.visibleLeads;

      const endpoint = visibleLeads === "All" 
        ? `${process.env.REACT_APP_BASE_URL}api/leads/get` 
        : `${process.env.REACT_APP_BASE_URL}api/leads/get_persone_lead`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) setLeads(response.data.leads);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch leads. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const endpoint = user?.role?.roleName === "sales person" 
        ? `${process.env.REACT_APP_BASE_URL}api/users/get_persone_user` 
        : `${process.env.REACT_APP_BASE_URL}api/users/list`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch users. Please check your connection and try again.");
    }
  };

  useEffect(() => {
    if (users.length === 1 && !formData.selectedUser) {
      setFormData((prevData) => ({ ...prevData, selectedUser: users[0]._id }));
    }
  }, [users, formData.selectedUser]);
  
  useEffect(() => {
    const loadData = async () => {
      await fetchLeads();
      await fetchUsers();
    };
    loadData();
  }, []);

  const handleAddLead = () => {
    setSelectedLead(null);
    setFormData(initialFormState);
    setOpenForm(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setFormData({
      clientName: lead.client_name || "",
      mobileNo: lead.client_mobile_number || "",
      email: lead.client_email || "",
      sourceOfInquiry: lead.source_of_inquiry || "",
      leadStatus: lead.lead_status || "Pending",
      companyName: lead.company_name || "",
      selectedUser: lead.emp_id?._id || "",
    });
    setOpenForm(true);
  };

  const handleDeleteClick = (leadId) => {
    setLeadToDelete(leadId);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteLead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please log in again.");

      const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}api/leads/${leadToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSnackbarMessage('Lead deleted successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        fetchLeads();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead.");
      setSnackbarMessage(err.response?.data?.message || "Failed to delete lead.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    fetchLeads();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Your session has expired. Please log in again.");

      // Validate required fields
      const requiredFields = ['clientName', 'mobileNo', 'email', 'sourceOfInquiry', 'selectedUser'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const leadData = {
        emp_id: formData.selectedUser,
        client_name: formData.clientName,
        client_mobile_number: formData.mobileNo,
        client_email: formData.email,
        source_of_inquiry: formData.sourceOfInquiry,
        lead_status: formData.leadStatus,
        company_name: formData.companyName,
      };

      if (selectedLead) {
        await axios.put(`${process.env.REACT_APP_BASE_URL}api/leads/update/${selectedLead._id}`, leadData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbarMessage('Lead updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_BASE_URL}api/leads/add`, leadData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbarMessage('Lead created successfully!');
      }

      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setOpenForm(false);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save lead. Please try again.");
      setSnackbarMessage(err.response?.data?.message || err.message || "Failed to save lead. Please try again.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won':
        return { backgroundColor: '#cce5ff', color: 'blue' }; // Light blue
      case 'Pending':
        return { backgroundColor: '#ffeb3b', color: 'black' }; // Bright yellow
      case 'Follow Up':
        return { backgroundColor: '#ff9800', color: 'white' }; // Bright orange
      case 'Lost':
        return { backgroundColor: '#f44336', color: 'white' }; // Bright red
      default:
        return { backgroundColor: '#d6d8d9', color: 'black' }; // Light gray
    }
  };

  // User permissions
  const canEdit = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "update"
  );
  const canDelete = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "delete"
  );
  const canCreate = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "create"
  );
  const canList = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "list"
  );

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      lead_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      'emp_id.user_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      client_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      client_mobile_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
      date_time: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
      company_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      lead_status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
    });
    setGlobalFilterValue('');
  };

  const filterLeads = () => {
    if (!leads) return [];
    
    return leads.filter(lead => {
      // Handle global filter first
      if (filters.global?.value) {
        const searchValue = String(filters.global.value).toLowerCase();
        const fieldsToSearch = [
          lead.lead_id,
          lead.emp_id?.user_name,
          lead.client_name,
          lead.client_mobile_number,
          formatDateTime(lead.date_time),
          lead.company_name,
          lead.lead_status,
          lead.client_email,
          lead.source_of_inquiry
        ];
        
        const globalMatch = fieldsToSearch.some(field => 
          field ? String(field).toLowerCase().includes(searchValue) : false
        );
        
        if (!globalMatch) return false;
      }

      // Handle specific column filters
      for (let key in filters) {
        if (key === 'global') continue;
        if (!filters[key]) continue;

        const constraints = filters[key]?.constraints;
        if (!constraints?.[0]?.value) continue;

        const filterValue = constraints[0].value;

        // Handle different field types
        let fieldValue;
        if (key === 'emp_id.user_name') {
          fieldValue = lead.emp_id?.user_name;
        } else if (key === 'date_time') {
          if (!lead[key]) return false;
          
          // Convert both dates to start of day for comparison
          const leadDate = new Date(lead[key]);
          leadDate.setHours(0, 0, 0, 0);
          
          const filterDate = new Date(filterValue);
          filterDate.setHours(0, 0, 0, 0);
          
          if (isNaN(leadDate.getTime()) || isNaN(filterDate.getTime())) continue;
          
          switch (constraints[0].matchMode) {
            case FilterMatchMode.DATE_IS:
              return leadDate.getTime() === filterDate.getTime();
            case FilterMatchMode.DATE_IS_NOT:
              return leadDate.getTime() !== filterDate.getTime();
            case FilterMatchMode.DATE_BEFORE:
              return leadDate.getTime() < filterDate.getTime();
            case FilterMatchMode.DATE_AFTER:
              return leadDate.getTime() > filterDate.getTime();
            default:
              return true;
          }
        } else if (key === 'client_mobile_number') {
          fieldValue = lead[key]?.toString();
        } else if (key === 'lead_status') {
          fieldValue = lead.lead_status;
          // For status, we only want exact matches
          if (fieldValue !== filterValue) return false;
          continue;
        } else {
          fieldValue = lead[key];
        }

        if (fieldValue == null) return false;

        const stringValue = String(fieldValue).toLowerCase();
        const filterString = String(filterValue).toLowerCase();

        switch (constraints[0].matchMode) {
          case FilterMatchMode.STARTS_WITH:
            if (!stringValue.startsWith(filterString)) return false;
            break;
          case FilterMatchMode.CONTAINS:
            if (!stringValue.includes(filterString)) return false;
            break;
          case FilterMatchMode.EQUALS:
            if (stringValue !== filterString) return false;
            break;
          default:
            break;
        }
      }
      return true;
    });
  };

  const handleColumnFilter = (field, value) => {
    let _filters = { ...filters };
    _filters[field].constraints[0].value = value;
    setFilters(_filters);
  };

  const showFilterOverlay = (event, field) => {
    event.stopPropagation();
    
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Get the current filter's matchMode or set a default one based on field type
    let initialMatchMode;
    switch (field) {
      case 'date_time':
        initialMatchMode = FilterMatchMode.DATE_IS;
        break;
      case 'lead_status':
        initialMatchMode = FilterMatchMode.EQUALS;
        break;
      case 'client_mobile_number':
        initialMatchMode = FilterMatchMode.CONTAINS;
        break;
      case 'lead_id':
      case 'emp_id.user_name':
      case 'client_name':
      case 'company_name':
        initialMatchMode = FilterMatchMode.CONTAINS;
        break;
      default:
        initialMatchMode = FilterMatchMode.CONTAINS;
    }
    
    setCurrentFilterField(field);
    setCurrentFilterValue(filters[field]?.constraints[0]?.value || '');
    setCurrentMatchMode(filters[field]?.constraints[0]?.matchMode || initialMatchMode);
    
    setFilterPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX
    });
    
    setShowFilter(true);
  };

  const applyFilter = () => {
    let _filters = { ...filters };
    _filters[currentFilterField] = {
      operator: FilterOperator.AND,
      constraints: [{ value: currentFilterValue, matchMode: currentMatchMode }]
    };
    setFilters(_filters);
    setShowFilter(false);
  };

  const clearCurrentFilter = () => {
    setCurrentFilterValue('');
    let _filters = { ...filters };
    _filters[currentFilterField] = {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: currentMatchMode }]
    };
    setFilters(_filters);
    setShowFilter(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterOverlayRef.current && !filterOverlayRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getFilterDescription = (field, matchMode) => {
    // Text fields
    const textFields = ['lead_id', 'emp_id.user_name', 'client_name', 'company_name'];
    if (textFields.includes(field)) {
      switch (matchMode) {
        case FilterMatchMode.CONTAINS:
          return "Shows records containing this text";
        case FilterMatchMode.EQUALS:
          return "Shows records matching this exact text";
        default:
          return "";
      }
    }

    // Other specific fields
    switch (field) {
      case 'date_time':
        switch (matchMode) {
          case FilterMatchMode.DATE_IS:
            return "Shows records for the selected date";
          case FilterMatchMode.DATE_BEFORE:
            return "Shows records before the selected date";
          case FilterMatchMode.DATE_AFTER:
            return "Shows records after the selected date";
          default:
            return "";
        }
      case 'lead_status':
        return "Shows records that exactly match the selected status";
      case 'client_mobile_number':
        switch (matchMode) {
          case FilterMatchMode.CONTAINS:
            return "Shows records containing these numbers";
          case FilterMatchMode.EQUALS:
            return "Shows records matching this exact number";
          default:
            return "";
        }
      default:
        return "";
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />
        <Typography variant="h4" sx={{ mb: 4 }}>
          Lead Management
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          {canCreate && (
            <Button variant="contained" onClick={handleAddLead}>
              Add New Lead
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={clearFilter}
            >
              Clear
            </Button>
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Global Search"
              style={{ width: '200px' }}
            />
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    Lead ID
                    <FilterListIcon 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => showFilterOverlay(e, 'lead_id')}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    Employee Name
                    <FilterListIcon 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => showFilterOverlay(e, 'emp_id.user_name')}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    Client Name
                    <FilterListIcon 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => showFilterOverlay(e, 'client_name')}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    Mobile No.
                    <FilterListIcon 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => showFilterOverlay(e, 'client_mobile_number')}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    Date
                    <FilterListIcon 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => showFilterOverlay(e, 'date_time')}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    Company Name
                    <FilterListIcon 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => showFilterOverlay(e, 'company_name')}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    Status
                    <FilterListIcon 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => showFilterOverlay(e, 'lead_status')}
                    />
                  </Box>
                </TableCell>
                {(canEdit || canDelete) && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filterLeads().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No records found based on the applied filters.
                  </TableCell>
                </TableRow>
              ) : (
                filterLeads().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>{lead.lead_id}</TableCell>
                    <TableCell>{lead.emp_id.user_name}</TableCell>
                    <TableCell>{lead.client_name}</TableCell>
                    <TableCell>{lead.client_mobile_number}</TableCell>
                    <TableCell>{formatDateTime(lead.date_time)}</TableCell>
                    <TableCell>{lead.company_name}</TableCell>
                    <TableCell>
                      <div style={{
                        ...getStatusColor(lead.lead_status),
                        padding: '5px 10px',
                        borderRadius: '5px',
                        textAlign: 'center'
                      }}>
                        {lead.lead_status}
                      </div>
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell>
                        {canEdit && <Button variant="outlined" size='small' onClick={() => handleEditLead(lead)}>Edit</Button>}
                        {canDelete && <Button variant="outlined" size='small' color="error" sx={{ ml: 1 }} onClick={() => handleDeleteClick(lead._id)}>Delete</Button>}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filterLeads().length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <div 
          ref={filterOverlayRef}
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: '300px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid #ddd',
            borderRadius: '4px',
            zIndex: 1000,
            display: showFilter ? 'block' : 'none',
            top: filterPosition.top,
            left: filterPosition.left
          }}
        >
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#f8f9fa',
            fontWeight: '600'
          }}>
            Filter by {currentFilterField.replace('emp_id.user_name', 'Employee Name')
                                    .replace('client_mobile_number', 'Mobile No.')
                                    .replace('company_name', 'Company Name')
                                    .replace('lead_status', 'Status')
                                    .replace('lead_id', 'Lead ID')
                                    .replace('client_name', 'Client Name')
                                    .replace('date_time', 'Date')}
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <select
                value={currentMatchMode}
                onChange={(e) => setCurrentMatchMode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}
              >
                {(() => {
                  switch (currentFilterField) {
                    case 'date_time':
                      return filterOptions.date.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ));
                    case 'lead_status':
                      return filterOptions.status.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ));
                    case 'client_mobile_number':
                      return filterOptions.number.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ));
                    default:
                      return filterOptions.default.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ));
                  }
                })()}
              </select>
              <small style={{ 
                color: '#666', 
                marginTop: '4px', 
                display: 'block',
                fontSize: '12px',
                fontStyle: 'italic'
              }}>
                {getFilterDescription(currentFilterField, currentMatchMode)}
              </small>
            </div>
            <div style={{ marginBottom: '16px' }}>
              {currentFilterField === 'date_time' ? (
                <input
                  type="date"
                  value={currentFilterValue ? new Date(currentFilterValue).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setCurrentFilterValue(date.toISOString());
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              ) : currentFilterField === 'lead_status' ? (
                <select
                  value={currentFilterValue || ''}
                  onChange={(e) => setCurrentFilterValue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select Status</option>
                  <option value="Won">Won</option>
                  <option value="Pending">Pending</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Lost">Lost</option>
                </select>
              ) : (
                <input
                  type={currentFilterField === 'client_mobile_number' ? 'number' : 'text'}
                  value={currentFilterValue || ''}
                  onChange={(e) => setCurrentFilterValue(e.target.value)}
                  placeholder={`Search by ${currentFilterField.replace('emp_id.user_name', 'employee name')
                                        .replace('client_mobile_number', 'mobile no.')
                                        .replace('company_name', 'company name')
                                        .replace('lead_status', 'status')
                                        .replace('lead_id', 'lead ID')
                                        .replace('client_name', 'client name')
                                        .replace('date_time', 'date')}`}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              )}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <Button
                variant="outlined"
                size="small"
                onClick={clearCurrentFilter}
                style={{ minWidth: '80px' }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={applyFilter}
                style={{ minWidth: '80px' }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>

      {/* Lead Form Dialog */}
      <Dialog open={openForm} onClose={handleFormClose}>
        <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Client Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
          />
          <TextField
            label="Mobile No."
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.mobileNo}
            onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
            required
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            label="Source of Inquiry"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.sourceOfInquiry}
            onChange={(e) => setFormData({ ...formData, sourceOfInquiry: e.target.value })}
            required
          />
          <TextField
            label="Company Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>User</InputLabel>
            <Select
              value={formData.selectedUser}
              onChange={(e) => setFormData({ ...formData, selectedUser: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.user_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.leadStatus}
              onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
            >
              <MenuItem value="Won">Won</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Follow Up">Follow Up</MenuItem>
              <MenuItem value="Lost">Lost</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedLead ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this lead?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteLead} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const styles = `
  .p-overlaypanel {
    background:rgb(245, 245, 245);
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  }

  .p-overlaypanel:after, 
  .p-overlaypanel:before {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    border-style: solid;
    border-width: 0 8px 8px 8px;
  }

  .p-overlaypanel:after {
    border-color: transparent transparent #ffffff transparent;
    top: -7px;
  }

  .p-overlaypanel:before {
    border-color: transparent transparent #ddd transparent;
  }

  .filter-header {
    font-weight: 600;
    padding: 12px 16px;
    border-bottom: 1px solid #ddd;
    background-color: #f8f9fa;
    border-radius: 4px 4px 0 0;
  }

  .p-fluid {
    padding: 16px;
  }

  .mb-3 {
    margin-bottom: 16px;
  }

  .p-dropdown {
    width: 100% !important;
  }

  .p-inputtext {
    width: 100% !important;
    padding: 8px 12px;
  }

  .flex.justify-content-between {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .flex.justify-content-between button {
    min-width: 80px;
  }
`;

export default LeadManagement;
