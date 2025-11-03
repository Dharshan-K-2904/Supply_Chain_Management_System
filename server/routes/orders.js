const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET routes
router.get('/', orderController.getAllOrders);
router.get('/statistics', orderController.getOrderStatistics);
router.get('/customer/:customerId', orderController.getOrdersByCustomer);
router.get('/:id', orderController.getOrderById);

// POST routes
router.post('/', orderController.createOrder);

// PUT routes
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;