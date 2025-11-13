// server/routes/orders.js
// Final routes for Order management (CRUD and Transactional Logic)

const express = require('express');
const router = express.Router();
const { 
    getAllOrders, 
    getOrderById, 
    getOrdersByCustomer,
    createOrder,        
    updateOrderStatus,
    addItemToOrder,     // <-- CRITICAL FUNCTION IMPORTED
    getStatistics: getOrderStatistics // Use the correct local alias
} = require('../controllers/orderController'); 

// --- GET Routes ---
router.get('/', getAllOrders);
router.get('/statistics', getOrderStatistics);
router.get('/customer/:customerId', getOrdersByCustomer);
router.get('/:id', getOrderById);

// --- POST Routes ---
// POST /api/orders (Creates new order, calling PLACE_ORDER procedure)
router.post('/', createOrder); 

// POST /api/orders/:id/add-item
// 🎯 CRITICAL: Calls ADD_ORDER_ITEM procedure. Demonstrates TRG_UPDATE_ORDER_TOTAL and concurrency control.
router.post('/:id/add-item', addItemToOrder); // <--- ADDED ROUTE

// --- PUT Routes ---
// PUT /api/orders/:id/status
// Updates status. Used to indirectly fire TRG_UPDATE_ORDER_STATUS_ON_SHIPMENT.
router.put('/:id/status', updateOrderStatus); 


module.exports = router;