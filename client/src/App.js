import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from './redux/slices/authSlice';
import AppContent from './components/AppContent';

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
        <Router>
            <AppContent />
        </Router>
    );
}

export default App; 