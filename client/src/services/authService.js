// client/src/services/authService.js
// FINAL VERSION: Corrected default export structure to satisfy build rules.

import api from './api'; 

const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        
        if (response.data.success && response.data.token) {
            const { token, user } = response.data;
            
            // Store JWT and User Role for session management
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            return user;
        }
        return null;
    } catch (error) {
        // Log the detailed error
        console.error("Login API Error:", error.response ? error.response.data : error.message);
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// CRITICAL: A service file must be defined for fetching complex data
const getDashboardData = async () => {
    try {
        // This is the single API call that runs the Promise.all metrics
        const response = await api.get('/dashboard'); 
        return response.data.data;
    } catch (error) {
        console.error("Dashboard Load Error:", error);
        throw error;
    }
};


// --- FIX: Assign to a constant before default export ---
const AuthService = {
    login,
    logout,
    getCurrentUser,
    getDashboardData
};

export default AuthService;