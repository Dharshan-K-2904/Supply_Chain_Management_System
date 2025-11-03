const db = require('../config/database');

class Order {
  // Get all orders
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
      FROM "order" o
      JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN shipment s ON o.order_id = s.order_id
      LEFT JOIN payment p ON o.order_id = p.order_id
      ORDER BY o.date DESC
    `;
    
    // PostgreSQL
    const result = await db.query(query);
    return result.rows;
    
    // MySQL: Replace "order" with \`order\` and use:
    // const [rows] = await db.query(query);
    // return rows;
  }

  // Get order by ID with details
  static async getById(id) {
    const orderQuery = `
      SELECT 
        o.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone_number AS customer_phone,
        c.address AS customer_address,
        get_order_status_description(o.order_id) AS status_description,
        get_days_since_order(o.order_id) AS days_since_order
      FROM "order" o
      JOIN customer c ON o.customer_id = c.customer_id
      WHERE o.order_id = $1
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
      WHERE ol.order_id = $1
    `;
    
    const shipmentQuery = `
      SELECT * FROM shipment WHERE order_id = $1
    `;
    
    const paymentQuery = `
      SELECT * FROM payment WHERE order_id = $1
    `;
    
    // PostgreSQL
    const orderResult = await db.query(orderQuery, [id]);
    const orderLinesResult = await db.query(orderLinesQuery, [id]);
    const shipmentResult = await db.query(shipmentQuery, [id]);
    const paymentResult = await db.query(paymentQuery, [id]);
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    return {
      ...orderResult.rows[0],
      order_lines: orderLinesResult.rows,
      shipment: shipmentResult.rows[0] || null,
      payment: paymentResult.rows[0] || null
    };
    
    // MySQL: Replace $1 with ? and use db.query() instead
  }

  // Get orders by customer
  static async getByCustomer(customerId) {
    const query = `
      SELECT 
        o.order_id,
        o.date,
        o.total_amount,
        o.status,
        o.priority,
        s.tracking_number,
        s.status AS shipment_status
      FROM "order" o
      LEFT JOIN shipment s ON o.order_id = s.order_id
      WHERE o.customer_id = $1
      ORDER BY o.date DESC
    `;
    
    const result = await db.query(query, [customerId]);
    return result.rows;
  }

  // Create new order (using stored procedure)
  static async create(customerId, priority) {
    const query = `CALL place_order($1, $2, NULL)`;
    
    // PostgreSQL
    const result = await db.query(query, [customerId, priority]);
    // Extract order_id from procedure result
    return result.rows[0];
    
    // MySQL
    // await db.query('CALL place_order(?, ?, @order_id)', [customerId, priority]);
    // const [result] = await db.query('SELECT @order_id AS order_id');
    // return result[0];
  }

  // Add item to order
  static async addItem(orderId, productId, quantity) {
    const query = `CALL add_order_item($1, $2, $3)`;
    await db.query(query, [orderId, productId, quantity]);
    return { message: 'Item added successfully' };
  }

  // Update order status
  static async updateStatus(id, status) {
    const query = `
      UPDATE "order"
      SET status = $1
      WHERE order_id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  // Get order statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END) AS processing_orders,
        SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) AS shipped_orders,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_orders,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
        SUM(total_amount) FILTER (WHERE status != 'Cancelled') AS total_revenue,
        AVG(total_amount) FILTER (WHERE status != 'Cancelled') AS avg_order_value
      FROM "order"
    `;
    
    // PostgreSQL
    const result = await db.query(query);
    return result.rows[0];
    
    // MySQL: Replace FILTER with CASE WHEN
  }
}

module.exports = Order;