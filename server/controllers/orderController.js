// server/controllers/orderController.js
// FINAL VERSION: Corrected scope issues to resolve ReferenceError.

const Order = require('../models/Order');

// --- Function Definitions (Using exports. prefix directly) ---

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.getById(id); 
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.getByCustomer(customerId); 
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer orders',
      message: error.message
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customer_id, priority, items } = req.body;
    
    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'customer_id and items are required'
      });
    }
    
    // 1. Create order: Calls the Stored Procedure PLACE_ORDER
    const orderResult = await Order.create(customer_id, priority || 'Medium');
    const orderId = orderResult.order_id; 
    
    // 2. Add items to order (each call executes the ADD_ORDER_ITEM procedure)
    for (const item of items) {
      await Order.addItem(orderId, item.product_id, item.quantity);
    }
    
    // 3. Fetch complete order details
    const completeOrder = await Order.getById(orderId);
    
    res.status(201).json({
      success: true,
      message: 'Order created and items added transactionally',
      data: completeOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order (Check Inventory or Transaction Log)',
      message: error.message
    });
  }
};

exports.addItemToOrder = async (req, res) => {
    try {
        const { id } = req.params; // order_id
        const { product_id, quantity } = req.body;
        
        await Order.addItem(id, product_id, quantity);
        
        // Fetch updated order details and send success response
        const updatedOrder = await Order.getById(id);
        
        res.json({
            success: true,
            message: `Product ${product_id} added to order ${id}. Total updated automatically.`,
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error adding item to order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add item (Insufficient Stock or Transaction Error)',
            message: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    const order = await Order.updateStatus(id, status);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: `Order status updated to ${status}. Related database triggers may have fired.`,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: error.message
    });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await Order.getStatistics(); 
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics',
      message: error.message
    });
  }
};

// --- CRITICAL EXPORT BLOCK ---
// We now explicitly set the module.exports object after all functions are defined.
// This structure is guaranteed to work and avoids the ReferenceError.
module.exports = {
    getAllOrders: exports.getAllOrders, 
    getOrderById: exports.getOrderById, 
    getOrdersByCustomer: exports.getOrdersByCustomer,
    createOrder: exports.createOrder,
    addItemToOrder: exports.addItemToOrder,
    updateOrderStatus: exports.updateOrderStatus,
    getStatistics: exports.getStatistics   // ✅ FIXED LINE
};