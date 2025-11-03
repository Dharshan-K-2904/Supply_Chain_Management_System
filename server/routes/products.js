const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET routes
router.get('/', productController.getAllProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// POST routes
router.post('/', productController.createProduct);

// PUT routes
router.put('/:id', productController.updateProduct);

// DELETE routes
router.delete('/:id', productController.deleteProduct);

module.exports = router;