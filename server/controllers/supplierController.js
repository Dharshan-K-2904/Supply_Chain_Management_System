// server/controllers/supplierController.js
// Final controller logic for the Supplier entity.

const Supplier = require('../models/Supplier'); 

// GET /api/suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.getAll();
        res.json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) {
        console.error('Error fetching all suppliers:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch suppliers', message: error.message });
    }
};

// GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.getById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        res.json({ success: true, data: supplier });
    } catch (error) {
        console.error('Error fetching supplier by ID:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch supplier', message: error.message });
    }
};

// POST /api/suppliers
exports.createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ success: false, error: 'Failed to create supplier', message: error.message });
    }
};

// PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
    try {
        const updatedSupplier = await Supplier.update(req.params.id, req.body);
        if (!updatedSupplier) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        res.json({ 
            success: true, 
            message: 'Supplier updated successfully.', 
            data: updatedSupplier 
        });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ success: false, error: 'Failed to update supplier', message: error.message });
    }
};

// DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
    try {
        const result = await Supplier.delete(req.params.id);
        if (result.message === 'Supplier not found') {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        res.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ success: false, error: 'Failed to delete supplier', message: error.message });
    }
};

// --- Advanced Reporting ---

/**
 * CRITICAL: Get Products by Supplier
 * Uses the vw_SupplierProductList view for a complex read.
 */
exports.getProductsBySupplier = async (req, res) => {
    try {
        const products = await Supplier.getProductsBySupplier(req.params.id);
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Error fetching products by supplier:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch products for supplier', message: error.message });
    }
};

/**
 * CRITICAL: Get Supplier Performance Score
 * Calls the Stored Function: get_supplier_performance_score(?)
 */
exports.getSupplierPerformance = async (req, res) => {
    try {
        const score = await Supplier.getPerformanceScore(req.params.id);
        res.json({ 
            success: true, 
            message: 'Performance score calculated via UDF.',
            data: score
        });
    } catch (error) {
        console.error('Error calculating supplier performance:', error);
        res.status(500).json({ success: false, error: 'Failed to calculate performance score', message: error.message });
    }
};