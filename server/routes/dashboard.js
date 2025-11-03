const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getCompleteDashboard);
router.get('/stats', dashboardController.getOverallStats);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/top-customers', dashboardController.getTopCustomers);
router.get('/revenue-by-category', dashboardController.getRevenueByCategory);
router.get('/order-status-distribution', dashboardController.getOrderStatusDistribution);
router.get('/daily-revenue', dashboardController.getDailyRevenue);
router.get('/warehouse-efficiency', dashboardController.getWarehouseEfficiency);
router.get('/pending-payments', dashboardController.getPendingPayments);

module.exports = router;