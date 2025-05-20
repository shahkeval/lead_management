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
    Alert,
} from '@mui/material';
import Breadcrumbs from '../common/Breadcrumbs';
import { useAlerts } from '../../context/AlertContext';
import GlobalAlerts from '../common/GlobalAlerts';

const CombinedDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { showError } = useAlerts();

    const menuItems = [
        {
            title: 'Lead Management',
            description: 'Manage leads',
            action: () => {
                if (!user.role.assignedModules.some(module => module.moduleName === 'lead management')) {
                    showError("You don't have permission to access Lead Management.");
                    return;
                }
                navigate('/leads');
            },
            allowed: user.role.assignedModules.some(module => module.moduleName === 'lead management'),
        },
        {
            title: 'Meeting Management',
            description: 'Manage meetings and schedules',
            action: () => {
                if (!user.role.assignedModules.some(module => module.moduleName === 'meeting management')) {
                    showError("You don't have permission to access Meeting Management.");
                    return;
                }
                navigate('/meetings');
            },
            allowed: user.role.assignedModules.some(module => module.moduleName === 'meeting management'),
        },
        {
            title: 'Schedule Meetings',
            description: 'Schedule new meetings',
            action: () => {
                if (!user.role.assignedModules.some(module => module.moduleName === 'Schedule Meeting')) {
                    showError("You don't have permission to access Schedule Meetings.");
                    return;
                }
                navigate('/schedule');
            },
            allowed: user.role.assignedModules.some(module => module.moduleName === 'Schedule Meeting'),
        },
        {
            title: 'Manage Roles',
            description: 'Create and manage user roles and permissions',
            action: () => {
                if (!user.role.assignedModules.some(module => module.moduleName === 'manage roles')) {
                    showError("You don't have permission to access Manage Roles.");
                    return;
                }
                navigate('/admin/manage-roles');
            },
            allowed: user.role.assignedModules.some(module => module.moduleName === 'manage roles'),
        },
        {
            title: 'User Management',
            description: 'Manage system users and their roles',
            action: () => {
                if (!user.role.assignedModules.some(module => module.moduleName === 'user management')) {
                    showError("You don't have permission to access User Management.");
                    return;
                }
                navigate('/admin/users');
            },
            allowed: user.role.assignedModules.some(module => module.moduleName === 'user management'),
        },
       
      
      
        {
            title: 'Reports',
            description: 'View and generate system reports',
            action: () => {
                if (!user.role.assignedModules.some(module => module.moduleName === 'reports')) {
                    showError("You don't have permission to access Reports.");
                    return;
                }
                navigate('/admin/reports');
            },
            allowed: user.role.assignedModules.some(module => module.moduleName === 'reports'),
        },
    ];

    // const handleChangePassword = () => {
    //     navigate('/change_password'); // Navigate to Change Password page
    // };
    // const canChangePassword = user?.role?.assignedModules?.some(
    //     (m) => m.moduleName === "change password" && m.action === "view"
    // );
    return (
        <div>
            <GlobalAlerts />
            {user && user.role ? (
                <>
                    {user.role.roleName === 'Admin' && (
                        <Box sx={{ p: 3 }}>
                            <Breadcrumbs />
                            <Typography variant="h4" sx={{ mb: 4 }}>
                                Admin Dashboard
                            </Typography>

                            <Grid
                                container
                                direction="row"
                                sx={{
                                    // justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    marginBottom: 3,
                                    justifyContent: "space-between",
                                }}
                            >

                                <Typography variant="subtitle1">
                                    Welcome, {user?.email}
                                </Typography>

                             

                                {/* {canChangePassword ? ( <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleChangePassword}

                                >
                                    Change Password
                                </Button>): ("")}
                                */}


                            </Grid>
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
                    {user.role.roleName === 'sales manager' && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h4" sx={{ mb: 4 }}>
                                Sales Manager Dashboard
                            </Typography>
                            <Grid
                                container
                                direction="row"
                                sx={{
                                    // justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    marginBottom: 3,
                                    justifyContent: "space-between",
                                }}
                            >

                                <Typography variant="subtitle1">
                                    Welcome, {user?.email}
                                </Typography>

                             

                                {/* {canChangePassword ? ( <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleChangePassword}

                                >
                                    Change Password
                                </Button>): ("")} */}
                               


                            </Grid>
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
                            <Grid
                                container
                                direction="row"
                                sx={{
                                    // justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    marginBottom: 3,
                                    justifyContent: "space-between",
                                }}
                            >

                                <Typography variant="subtitle1">
                                    Welcome, {user?.email}
                                </Typography>

                             

                                {/* {canChangePassword ? ( <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleChangePassword}

                                >
                                    Change Password
                                </Button>): ("")} */}
                               


                            </Grid>

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