// server/controllers/warehouseController.js
// Handles business logic for Warehouse management.

const Warehouse = require('../models/Warehouse');

// GET /api/warehouses
exports.getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.getAll();
        res.json({ success: true, count: warehouses.length, data: warehouses });
    } catch (error) {
        console.error('Error fetching all warehouses:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch warehouses', message: error.message });
    }
};

// GET /api/warehouses/:id
exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.getById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ success: false, error: 'Warehouse not found' });
        }
        res.json({ success: true, data: warehouse });
    } catch (error) {
        console.error('Error fetching warehouse by ID:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch warehouse', message: error.message });
    }
};

// POST /api/warehouses
exports.createWarehouse = async (req, res) => {
    try {
        const result = await Warehouse.create(req.body);
        res.status(201).json({ success: true, message: 'Warehouse created successfully', data: result });
    } catch (error) {
        console.error('Error creating warehouse:', error);
        res.status(500).json({ success: false, error: 'Failed to create warehouse', message: error.message });
    }
};

// PUT /api/warehouses/:id
exports.updateWarehouse = async (req, res) => {
    try {
        const updatedWarehouse = await Warehouse.update(req.params.id, req.body);
        
        if (!updatedWarehouse) {
            return res.status(404).json({ success: false, error: 'Warehouse not found' });
        }
        res.json({ success: true, message: 'Warehouse updated successfully.', data: updatedWarehouse });
    } catch (error) {
        console.error('Error updating warehouse:', error);
        res.status(500).json({ success: false, error: 'Failed to update warehouse', message: error.message });
    }
};

// DELETE /api/warehouses/:id
exports.deleteWarehouse = async (req, res) => {
    try {
        const result = await Warehouse.delete(req.params.id);
        
        if (result.message === 'Warehouse not found') {
            return res.status(404).json({ success: false, error: 'Warehouse not found' });
        }
        res.json({ success: true, message: 'Warehouse deleted successfully' });
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        // Handle foreign key constraint error (Warehouse may have associated Inventory)
        if (error.code === 'ER_ROW_IS_REFERENCED') { 
            return res.status(400).json({
                success: false,
                error: 'Cannot delete warehouse while associated inventory records exist.'
            });
        }
        res.status(500).json({ success: false, error: 'Failed to delete warehouse', message: error.message });
    }
};