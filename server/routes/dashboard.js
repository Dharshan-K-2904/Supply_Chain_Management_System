// server/routes/dashboard.js
// FINAL VERSION — Fully aligned with updated model & controller.

const express = require('express');
const router = express.Router();

const { 
    getCompleteDashboard,
    getOverallStats,
    getRecentOrders,
    getTopProducts,
    getTopCustomers,
    getRevenueByCategory,
    getOrderStatusDistribution,
    getDailyRevenue,
    getWarehouseUtilization,
    getPendingPayments,

    // Advanced / Reports
    getDetailedOrderSummary,
    getProductPriceAudit,
    getInventoryAlerts
} = require('../controllers/dashboardController');

// --- 1. MASTER DASHBOARD (Promise.all → Full KPI Bundle) ---
router.get('/', getCompleteDashboard);

// --- 2. STANDARD KPI ROUTES (Primary Metrics) ---
router.get('/stats', getOverallStats);
router.get('/orders/recent', getRecentOrders);
router.get('/orders/distribution', getOrderStatusDistribution);
router.get('/payments/pending', getPendingPayments);

router.get('/revenue/daily', getDailyRevenue);
router.get('/revenue/category', getRevenueByCategory);

router.get('/products/top', getTopProducts);
router.get('/customers/top', getTopCustomers);

// FUNCTION DEMO (MySQL UDF): Warehouse Utilization
router.get('/metrics/warehouse-utilization', getWarehouseUtilization);

// --- 3. ADVANCED / REPORT ROUTES (Views, Triggers, Logs) ---

// Detailed multi-table JOIN report (vw_DetailedOrderSummary)
router.get('/reports/order-summary', getDetailedOrderSummary);

// Audit history (trigger-based view: vw_ProductPriceAudit)
router.get('/reports/price-audit', getProductPriceAudit);

// Low stock alerts triggered via event/view
router.get('/alerts/inventory', getInventoryAlerts);

module.exports = router;
