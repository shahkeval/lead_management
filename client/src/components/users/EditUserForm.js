// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   MenuItem,
//   Box,
//   Alert
// } from '@mui/material';
// import axios from 'axios';

// const EditUserForm = ({ open, handleClose, user, onUserUpdated }) => {
//   const [formData, setFormData] = useState({
//     email: '',
//     user_name: '',
//     mobile_name: '',
//     roleId: '',
//     status: 'Active'
//   });
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/roles`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (response.data.success) {
//           const filter = response.data.roles.filter(role => role.status === 'Active');
//           setRoles(filter);
//         }
//       } catch (error) {
//         console.error('Error fetching roles:', error);
//       }
//     };

//     fetchRoles();
    
//     if (user) {
//       setFormData({
//         email: user.email,
//         user_name: user.user_name,
//         mobile_name: user.mobile_name,
//         roleId: user.role._id,
//         status: user.status
//       });
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put(
//         `${process.env.REACT_APP_BASE_URL}api/users/${user._id}`,
//         formData,
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       if (response.data.success) {
//         onUserUpdated();
//         handleClose();
//       }
//     } catch (error) {
//       setError(error.response?.data?.message || 'Error updating user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//       <DialogTitle>Edit User</DialogTitle>
//       <form onSubmit={handleSubmit}>
//         <DialogContent>
//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//           )}
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <TextField
//               label="User Name"
//               name="user_name"
//               value={formData.user_name}
//               onChange={handleChange}
//               fullWidth
//               required
//             />
//             <TextField
//               label="Mobile Number"
//               name="mobile_name"
//               value={formData.mobile_name}
//               onChange={handleChange}
//               fullWidth
//               required
//             />
//             <TextField
//               label="Email"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               fullWidth
//               required
//             />
//             <TextField
//               select
//               label="Role"
//               name="roleId"
//               value={formData.roleId}
//               onChange={handleChange}
//               fullWidth
//               required
//             >
//               {roles.map((role) => (
//                 <MenuItem key={role._id} value={role._id}>
//                   {role.roleName}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <TextField
//               select
//               label="Status"
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               fullWidth
//               required
//             >
//               <MenuItem value="Active">Active</MenuItem>
//               <MenuItem value="Inactive">Inactive</MenuItem>
//             </TextField>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Cancel</Button>
//           <Button 
//             type="submit" 
//             variant="contained" 
//             disabled={loading}
//           >
//             {loading ? 'Updating...' : 'Update User'}
//           </Button>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// };

// export default EditUserForm; 