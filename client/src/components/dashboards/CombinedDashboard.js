import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import Breadcrumbs from '../common/Breadcrumbs';

const CombinedDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        {
            title: 'Manage Roles',
            description: 'Create and manage user roles and permissions',
            action: () => navigate('/admin/manage-roles'),
            allowed: user.role.assignedModules.some(module => module.moduleName === 'manage roles'),
        },
        {
            title: 'User Management',
            description: 'Manage system users and their roles',
            action: () => navigate('/admin/users'),
            allowed: user.role.assignedModules.some(module => module.moduleName === 'user management'),
        },
        {
            title: 'Lead Management',
            description: 'Manage leads',
            action: () => navigate('/leads'),
            allowed: user.role.assignedModules.some(module => module.moduleName === 'lead management'),
        },
        {
            title: 'Reports',
            description: 'View and generate system reports',
            action: () => navigate('/admin/reports'),
            allowed: user.role.assignedModules.some(module => module.moduleName === 'reports'),
        },
    ];

    const handleChangePassword = () => {
        navigate('/change_password'); // Navigate to Change Password page
    };

    return (
        <div>
            {user && user.role ? (
                <>
                    {user.role.roleName === 'Admin' && (
                        <Box sx={{ p: 3 }}>
                            <Breadcrumbs/>
                            <Typography variant="h4" sx={{ mb: 4 }}>
                                Admin Dashboard
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 3 }}>
                                Welcome, {user?.email}
                            </Typography>

                            <Grid container spacing={3}>
                                {menuItems.map((item, index) => (
                                    item.allowed && ( // Only render if allowed
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Card>
                                                <CardContent>
                                                    <Typography variant="h6" component="div">
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="small" onClick={item.action}>
                                                        Access
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    )
                                ))}
                            </Grid>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleChangePassword}
                                sx={{ mt: 3 }}
                            >
                                Change Password
                            </Button>
                        </Box>
                    )}
                    {user.role.roleName === 'sales manager' && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h4" sx={{ mb: 4 }}>
                                Sales Manager Dashboard
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 3 }}>
                                Welcome, {user?.email}
                            </Typography>

                            <Grid container spacing={3}>
                                {menuItems.map((item, index) => (
                                    item.allowed && ( // Only render if allowed
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Card>
                                                <CardContent>
                                                    <Typography variant="h6" component="div">
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="small" onClick={item.action}>
                                                        Access
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    )
                                ))}
                            </Grid>
                        </Box>
                    )}
                    {user.role.roleName === 'sales person' && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h4" sx={{ mb: 4 }}>
                                Sales Dashboard
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 3 }}>
                                Welcome, {user?.email}
                            </Typography>

                            <Grid container spacing={3}>
                                {menuItems.map((item, index) => (
                                    item.allowed && ( // Only render if allowed
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Card>
                                                <CardContent>
                                                    <Typography variant="h6" component="div">
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="small" onClick={item.action}>
                                                        Access
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    )
                                ))}
                            </Grid>
                        </Box>
                    )}
                </>
            ) : (
                <h2>Please log in to see your dashboard.</h2>
            )}
        </div>
    );
};

export default CombinedDashboard; 