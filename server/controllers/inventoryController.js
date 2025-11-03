const Inventory = require('../models/Inventory');

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
      error: 'Failed to fetch inventory',
      message: error.message
    });
  }
};

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

exports.updateInventory = async (req, res) => {
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
    
    const inventory = await Inventory.update(product_id, warehouse_id, operation, quantity);
    
    res.json({
      success: true,
      message: `Inventory ${operation === 'ADD' ? 'increased' : 'decreased'} successfully`,
      data: inventory
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory',
      message: error.message
    });
  }
};

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
    
    // Handle duplicate key error
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Inventory record already exists for this product and warehouse'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory record',
      message: error.message
    });
  }
};

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
      error: 'Failed to fetch low stock inventory',
      message: error.message
    });
  }
};

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

exports.getWarehouseSummary = async (req, res) => {
  try {
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