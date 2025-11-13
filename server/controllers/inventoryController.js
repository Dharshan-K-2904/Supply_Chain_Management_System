// server/controllers/inventoryController.js
// Final controller logic for the Inventory records.

const Inventory = require('../models/Inventory');

// GET /api/inventory
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.getAll();
    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory records',
      message: error.message
    });
  }
};

// GET /api/inventory/warehouse/:warehouseId
exports.getInventoryByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const inventory = await Inventory.getByWarehouse(warehouseId);
    
    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching warehouse inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch warehouse inventory',
      message: error.message
    });
  }
};

// GET /api/inventory/product/:productId
exports.getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const inventory = await Inventory.getByProduct(productId);
    
    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product inventory',
      message: error.message
    });
  }
};

/**
 * 🎯 CRITICAL: Adjust Stock (Mapped to the update_inventory_qty Stored Procedure)
 * This handles ADD/SUBTRACT operations on stock levels.
 */
exports.adjustStock = async (req, res) => {
  try {
    const { product_id, warehouse_id, operation, quantity } = req.body;
    
    // Validate inputs
    if (!product_id || !warehouse_id || !operation || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: product_id, warehouse_id, operation, quantity'
      });
    }
    
    if (!['ADD', 'SUBTRACT'].includes(operation)) {
      return res.status(400).json({
        success: false,
        error: 'Operation must be ADD or SUBTRACT'
      });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be positive'
      });
    }
    
    // NOTE: Model.update() calls CALL update_inventory_qty()
    const inventory = await Inventory.update(product_id, warehouse_id, operation, quantity);
    
    // This operation fires TRG_CHECK_LOW_INVENTORY if stock drops critically low.
    res.json({
      success: true,
      message: `Stock adjusted successfully via Stored Procedure (${operation}).`,
      data: inventory
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    // CRITICAL: Catches the error signaled by the stored procedure if stock drops below zero.
    if (error.message.includes('Cannot reduce inventory below zero')) {
         return res.status(400).json({
            success: false,
            error: 'Insufficient stock: Cannot reduce quantity below zero.',
            message: error.message
         });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to adjust inventory',
      message: error.message
    });
  }
};

/**
 * Creates/Initializes Inventory Record (Mapped to Model.create())
 * This is used for setting the initial stock levels for a new product/warehouse combination.
 */
exports.createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Inventory record created successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error creating inventory:', error);
    
    // Check for MySQL Duplicate Entry error (ER_DUP_ENTRY) for the composite key (product_id, warehouse_id)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Inventory record already exists for this product and warehouse. Use stock adjustment instead.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory record',
      message: error.message
    });
  }
};

// GET /api/inventory/low-stock (Complex Read)
exports.getLowStockInventory = async (req, res) => {
  try {
    const inventory = await Inventory.getLowStock();
    
    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching low stock inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock report',
      message: error.message
    });
  }
};

// GET /api/inventory/alerts (Auditing/Logging Read)
exports.getInventoryAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.getAlerts();
    
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory alerts',
      message: error.message
    });
  }
};

// GET /api/inventory/summary (Aggregate/Function Read)
exports.getWarehouseSummary = async (req, res) => {
  try {
    // NOTE: Model calls calculate_warehouse_utilization UDF
    const summary = await Inventory.getWarehouseSummary();
    
    res.json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching warehouse summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch warehouse summary',
      message: error.message
    });
  }
};