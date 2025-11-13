// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const user = await authService.login(username, password);
            if (user) {
                // Set user context and navigate based on role
                setUser(user);
                
                // 🎯 RBAC NAVIGATION: Directing users to their specific entry point
                if (user.role === 'ADMIN') {
                    navigate('/dashboard');
                } else if (user.role === 'SUPPLIER') {
                    navigate('/supplier-portal'); // Navigate to a dedicated supplier page
                } else if (user.role === 'CUSTOMER') {
                    navigate('/orders');
                }
            } else {
                setError('Login failed. Check credentials.');
            }
        } catch (err) {
            setError('Login failed. Check server status or credentials.');
        }
    };

    return (
        <div className="login-container">
            <h2>SCM Portal Login</h2>
            <p>Use roles: admin / supplier / customer (password: DBMS@pesu2025)</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username (e.g., admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password (DBMS@pesu2025)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log In</button>
            </form>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default Login;