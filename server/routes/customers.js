// server/routes/customers.js
// Final routes for Customer management (CRUD and Metrics)

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController'); 

// --- GET (Read) Operations ---

// GET /api/customers
router.get('/', customerController.getAllCustomers);

// GET /api/customers/vip
// 🎯 CRITICAL: Uses the IS_CUSTOMER_VIP UDF
router.get('/vip', customerController.getVIPCustomers);

// GET /api/customers/:id
router.get('/:id', customerController.getCustomerById);


// --- POST (Create) Operations ---

// POST /api/customers
router.post('/', customerController.createCustomer);


// --- PUT (Update) Operations ---

// PUT /api/customers/:id
router.put('/:id', customerController.updateCustomer);


// --- DELETE Operations ---

// DELETE /api/customers/:id
router.delete('/:id', customerController.deleteCustomer);


module.exports = router;