// server/routes/inventory.js
// Final routes for Inventory (Stock Management)

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// --- GET (Read/Reporting) Operations ---

// GET /api/inventory
router.get('/', inventoryController.getAllInventory);

// GET /api/inventory/low-stock
router.get('/low-stock', inventoryController.getLowStockInventory);

// GET /api/inventory/alerts
router.get('/alerts', inventoryController.getInventoryAlerts);

// GET /api/inventory/warehouse-summary
// 🎯 CRITICAL: Get warehouse summary including utilization (Function Read)
router.get('/warehouse-summary', inventoryController.getWarehouseSummary);

// GET /api/inventory/warehouse/:warehouseId
router.get('/warehouse/:warehouseId', inventoryController.getInventoryByWarehouse);

// GET /api/inventory/product/:productId
router.get('/product/:productId', inventoryController.getInventoryByProduct);


// --- POST/PUT (Write) Operations ---

// POST /api/inventory
// Used for creating initial inventory records (creation of a new unique product/warehouse combo)
router.post('/', inventoryController.createInventory);

// PUT /api/inventory/adjust-stock
// 🎯 CRITICAL: Handles stock adjustments (Manual DML via update_inventory_qty Stored Procedure)
// Renamed the endpoint and function call for clarity.
router.put('/adjust-stock', inventoryController.adjustStock);


module.exports = router;