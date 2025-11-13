// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// --- Import Common Components ---
import Navbar from './components/common/Navbar';

// --- Import Pages ---
import Login from './pages/Login'; // Must be created/updated
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
// Add new role-specific pages:
// import SupplierPortal from './pages/SupplierPortal'; // Add this file for Supplier role demo

import './App.css';

// --------------------------------------------------------
// 🔒 Custom Protected Route Component
// Handles authentication check and role verification
// --------------------------------------------------------
const ProtectedRoute = ({ element: Element, allowedRoles, user, ...rest }) => {
    // 1. Check if user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // 2. Check Role-Based Access
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized users (e.g., redirect a 'CUSTOMER' trying to access 'ADMIN' pages)
        // If they are a known user, send them to their allowed dashboard
        const defaultPath = user.role === 'SUPPLIER' ? '/supplier-portal' : '/dashboard';
        return <Navigate to={defaultPath} replace />;
    }

    // If checks pass, render the component
    return <Element user={user} {...rest} />;
};
// --------------------------------------------------------


function App() {
    const [user, setUser] = useState(authService.getCurrentUser());

    // NOTE: In a real app, this effect would check the token expiration periodically
    useEffect(() => {
        // You might want to refresh the user state or token here
    }, []);
    
    // Function to handle logout and clear state
    const handleLogout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <Router>
            {/* Navbar is outside Routes to be visible on all pages */}
            <Navbar user={user} handleLogout={handleLogout} /> 
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        {/* 🔑 Public Route */}
                        <Route path="/login" element={<Login setUser={setUser} />} />

                        {/* Default Path: Redirect logged-in users to their home dashboard */}
                        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                        
                        {/* --- 🎯 ROLE-BASED ACCESS CONTROL (RBAC) ROUTES --- */}
                        
                        {/* Admin/Manager Pages */}
                        <Route 
                            path="/dashboard" 
                            element={<ProtectedRoute element={Dashboard} allowedRoles={['ADMIN', 'CUSTOMER']} user={user} />} 
                        />
                        <Route 
                            path="/products" 
                            element={<ProtectedRoute element={Products} allowedRoles={['ADMIN', 'SUPPLIER']} user={user} />} 
                        />
                        <Route 
                            path="/orders" 
                            element={<ProtectedRoute element={Orders} allowedRoles={['ADMIN', 'CUSTOMER']} user={user} />} 
                        />
                        <Route 
                            path="/customers" 
                            element={<ProtectedRoute element={Customers} allowedRoles={['ADMIN']} user={user} />} 
                        />
                        <Route 
                            path="/inventory" 
                            element={<ProtectedRoute element={Inventory} allowedRoles={['ADMIN', 'SUPPLIER']} user={user} />} 
                        />

                        {/* Supplier Specific Portal (Demonstrates segregated view) */}
                        <Route 
                            path="/supplier-portal" 
                            // NOTE: Replace 'Dashboard' with your actual SupplierPortal component when created
                            element={<ProtectedRoute element={Dashboard} allowedRoles={['SUPPLIER']} user={user} />} 
                        />
                        
                        <Route path="/unauthorized" element={<h1>403 - Access Denied</h1>} />
                        
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;