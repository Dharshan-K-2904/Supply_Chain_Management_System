// server/routes/warehouses.js
// Final routes for Warehouse management

const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController'); 

// --- GET (Read) Operations ---

// GET /api/warehouses
router.get('/', warehouseController.getAllWarehouses);

// GET /api/warehouses/:id
router.get('/:id', warehouseController.getWarehouseById);


// --- POST (Create) Operations ---

// POST /api/warehouses
router.post('/', warehouseController.createWarehouse);


// --- PUT (Update) Operations ---

// PUT /api/warehouses/:id
router.put('/:id', warehouseController.updateWarehouse);


// --- DELETE Operations ---

// DELETE /api/warehouses/:id
router.delete('/:id', warehouseController.deleteWarehouse);


module.exports = router;