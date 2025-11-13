// server/routes/products.js
// Final routes for Product management (CRUD and Reporting)

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// --- GET (Read) Operations ---

// GET /api/products
router.get('/', productController.getAllProducts);

// GET /api/products/low-stock (Complex Read: Low Stock Report)
router.get('/low-stock', productController.getLowStockProducts);

// GET /api/products/category/:category (Filter Read)
router.get('/category/:category', productController.getProductsByCategory);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

// --- POST (Create) Operations ---

// POST /api/products
router.post('/', productController.createProduct);

// --- PUT (Update) Operations ---

// PUT /api/products/:id
// CRITICAL: This route fires the TRG_AUDIT_PRODUCT_PRICE trigger if the price changes.
router.put('/:id', productController.updateProduct);

// --- DELETE Operations ---

// DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;