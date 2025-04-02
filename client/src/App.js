import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from './redux/slices/authSlice';
import AppContent from './components/AppContent';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // theme
import 'primereact/resources/primereact.min.css';                  // core css
import 'primeicons/primeicons.css';  
import { AlertProvider } from './context/AlertContext';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                await dispatch(getMe());
            }
        };
        checkAuth();
    }, []);

    return (
        <AlertProvider>
            <Router>
                <AppContent />
            </Router>
        </AlertProvider>
    );
}

export default App; 