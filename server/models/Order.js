const db = require('../config/database');

class Order {
  
  // Helper to execute standard DML queries
  static async executeQuery(sql, values = []) {
    // Uses db.query() for multi-statement execution (required for CALL + SELECT)
    const [rows] = await db.query(sql, values);
    return rows;
  }
  
  // Helper to execute single DML statements
  static async executeSelect(sql, values = []) {
    // Uses db.execute() for single statement, simpler fetching
    const [rows] = await db.execute(sql, values);
    return rows;
  }

  // Get all orders (Standard Read)
  static async getAll() {
    const query = `
      SELECT 
        o.order_id,
        o.date,
        o.total_amount,
        o.status,
        o.priority,
        c.name AS customer_name,
        c.email AS customer_email,
        s.tracking_number,
        p.status AS payment_status
      FROM \`order\` o
      JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN shipment s ON o.order_id = s.order_id
      LEFT JOIN payment p ON o.order_id = p.order_id
      ORDER BY o.date DESC
    `;
    
    const rows = await this.executeSelect(query);
    return rows;
  }

  // Get order by ID with details (Complex Read - combining multiple queries)
  static async getById(id) {
    // NOTE: MySQL does not support $1 placeholders. We use ?
    
    const orderQuery = `
      SELECT 
        o.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone_number AS customer_phone,
        c.address AS customer_address
        -- Removed PG-specific functions: get_order_status_description, get_days_since_order
      FROM \`order\` o
      JOIN customer c ON o.customer_id = c.customer_id
      WHERE o.order_id = ?
    `;
    
    const orderLinesQuery = `
      SELECT 
        ol.orderline_id,
        ol.quantity,
        ol.price,
        p.product_id,
        p.name AS product_name,
        p.category,
        (ol.quantity * ol.price) AS line_total
      FROM order_line ol
      JOIN product p ON ol.product_id = p.product_id
      WHERE ol.order_id = ?
    `;
    
    const shipmentQuery = `
      SELECT * FROM shipment WHERE order_id = ?
    `;
    
    const paymentQuery = `
      SELECT * FROM payment WHERE order_id = ?
    `;
    
    // Execute all queries in parallel
    const [orderResult, orderLinesResult, shipmentResult, paymentResult] = await Promise.all([
      this.executeSelect(orderQuery, [id]),
      this.executeSelect(orderLinesQuery, [id]),
      this.executeSelect(shipmentQuery, [id]),
      this.executeSelect(paymentQuery, [id]),
    ]);
    
    if (orderResult.length === 0) {
      return null;
    }
    
    return {
      ...orderResult[0],
      order_lines: orderLinesResult,
      shipment: shipmentResult[0] || null,
      payment: paymentResult[0] || null
    };
  }

  // Get orders by customer (Read from Stored Procedure)
  static async getByCustomer(customerId) {
    // This calls the Stored Procedure GET_CUSTOMER_ORDERS
    const query = `CALL get_customer_orders(?)`;
    
    const [results] = await db.execute(query, [customerId]); 
    // MySQL returns two arrays for procedure results; we return the first one.
    return results[0]; 
  }

  // Create new order (using Stored Procedure)
  static async create(customerId, priority) {
    // MySQL requires a multi-statement query to get the OUT parameter
    const query = `
        CALL place_order(?, ?, @order_id);
        SELECT @order_id AS order_id;
    `;
    
    const [results] = await db.query(query, [customerId, priority]);
    // The second result set (index 1) contains the order ID
    return results[1][0]; 
  }

  // Add item to order (using Stored Procedure - CRITICAL for Transactions/Triggers)
  static async addItem(orderId, productId, quantity) {
    // This calls the transactional procedure ADD_ORDER_ITEM
    const query = `CALL add_order_item(?, ?, ?)`;
    await db.execute(query, [orderId, productId, quantity]);
    return { message: 'Item added successfully' };
  }

  // Update order status (Standard Update - will trigger TRG_UPDATE_ORDER_STATUS_ON_SHIPMENT)
  static async updateStatus(id, status) {
    const query = `
      UPDATE \`order\`
      SET status = ?
      WHERE order_id = ?
    `;
    
    await db.execute(query, [status, id]);
    // Since MySQL doesn't have RETURNING, fetch the updated row manually
    return this.getById(id); 
  }

  // Get order statistics (Aggregate Query)
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END) AS processing_orders,
        SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) AS shipped_orders,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_orders,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
        SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END) AS total_revenue,
        AVG(CASE WHEN status != 'Cancelled' THEN total_amount ELSE NULL END) AS avg_order_value
      FROM \`order\`
    `;
    
    const [rows] = await db.execute(query);
    return rows[0];
  }
}

module.exports = Order;