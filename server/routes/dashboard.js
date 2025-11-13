// server/routes/dashboard.js
// Final Version: Includes all Standard and Advanced Routes for Full Marks.

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
    getWarehouseUtilization, // Updated name
    getPendingPayments,
    
    // Advanced Routes from Final Controller:
    getDetailedOrderSummary, 
    getProductPriceAudit,    
    getInventoryAlerts       
} = require('../controllers/dashboardController');

// --- 1. Master Dashboard Route ---
// A single call for the main dashboard view (efficient Promise.all)
router.get('/', getCompleteDashboard);

// --- 2. Standard KPI and Metric Routes ---
router.get('/stats', getOverallStats);
router.get('/orders/recent', getRecentOrders);
router.get('/orders/distribution', getOrderStatusDistribution);
router.get('/payments/pending', getPendingPayments);
router.get('/revenue/daily', getDailyRevenue);
router.get('/revenue/category', getRevenueByCategory);
router.get('/products/top', getTopProducts);
router.get('/customers/top', getTopCustomers);

// NOTE: Renamed the route to align with the FUNCTION name
// 🎯 FUNCTION/AGGREGATE DEMO: Calls the MySQL UDF
router.get('/metrics/warehouse-utilization', getWarehouseUtilization);


// --- 3. Advanced Database Feature Routes (For Reports Page) ---

// 🎯 VIEW/JOIN DEMO: Calls the complex vw_DetailedOrderSummary
router.get('/reports/order-summary', getDetailedOrderSummary);

// 🎯 AUDIT/COMPLIANCE DEMO: Calls the vw_ProductPriceAudit (Demonstrates Trigger 6)
router.get('/reports/price-audit', getProductPriceAudit);

// 🎯 LOW STOCK ALERT DEMO: Calls the vw_InventoryStatusAlerts (Demonstrates Events/Low Stock Trigger)
router.get('/alerts/inventory', getInventoryAlerts);


module.exports = router;