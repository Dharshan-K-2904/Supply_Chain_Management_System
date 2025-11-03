const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllInventory);
router.get('/low-stock', inventoryController.getLowStockInventory);
router.get('/alerts', inventoryController.getInventoryAlerts);
router.get('/warehouse-summary', inventoryController.getWarehouseSummary);
router.get('/warehouse/:warehouseId', inventoryController.getInventoryByWarehouse);
router.get('/product/:productId', inventoryController.getInventoryByProduct);
router.post('/', inventoryController.createInventory);
router.put('/', inventoryController.updateInventory);

module.exports = router;