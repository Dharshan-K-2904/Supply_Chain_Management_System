// server/routes/suppliers.js
// Final routes for Supplier management (CRUD and Advanced Metrics)

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController'); 
// NOTE: Assuming you have created the Supplier Controller

// --- GET (Read) Operations ---

// GET /api/suppliers
router.get('/', supplierController.getAllSuppliers);

// GET /api/suppliers/:id
router.get('/:id', supplierController.getSupplierById);

// GET /api/suppliers/:id/products
// 🎯 CRITICAL: Uses the vw_SupplierProductList view for complex read
router.get('/:id/products', supplierController.getProductsBySupplier);

// GET /api/suppliers/:id/performance
// 🎯 CRITICAL: Calls the get_supplier_performance_score() UDF
router.get('/:id/performance', supplierController.getSupplierPerformance);


// --- POST (Create) Operations ---

// POST /api/suppliers
router.post('/', supplierController.createSupplier);


// --- PUT (Update) Operations ---

// PUT /api/suppliers/:id
router.put('/:id', supplierController.updateSupplier);


// --- DELETE Operations ---

// DELETE /api/suppliers/:id
router.delete('/:id', supplierController.deleteSupplier);


module.exports = router;