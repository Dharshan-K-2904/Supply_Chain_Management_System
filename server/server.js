// server/server.js
// Final application entry point - Registers ALL Routes and starts server.

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// CRITICAL: Import Database Connection (runs the pool test)
require('./config/database'); 

// --- Middleware ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// CORS Configuration (Includes local and LAN client URLs)
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://10.32.65.6:3000'   
  ],
  credentials: true,
}));


// --- Import Routes (Ensure ALL 7 Entities are imported) ---
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const inventoryRoutes = require('./routes/inventory');
const dashboardRoutes = require('./routes/dashboard');
const warehouseRoutes = require('./routes/warehouses'); // <-- FINAL ENTITY ADDED
const companyRoutes = require('./routes/companies');   // <-- FINAL ENTITY ADDED


// --- Route Mounting (Ensure ALL 7 Entities are mounted) ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/warehouses', warehouseRoutes); // <-- FINAL ROUTE MOUNTED
app.use('/api/companies', companyRoutes);   // <-- FINAL ROUTE MOUNTED


// Health check (used for API status verification)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SCM Portal API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});