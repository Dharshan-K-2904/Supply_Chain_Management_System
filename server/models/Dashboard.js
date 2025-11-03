const db = require('../config/database');

class Dashboard {
  // Get overall statistics
  static async getOverallStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM customer) AS total_customers,
        (SELECT COUNT(*) FROM product) AS total_products,
        (SELECT COUNT(*) FROM "order") AS total_orders,
        (SELECT COUNT(*) FROM "order" WHERE status = 'Pending') AS pending_orders,
        (SELECT COUNT(*) FROM "order" WHERE status = 'Delivered') AS delivered_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM "order" WHERE status != 'Cancelled') AS total_revenue,
        (SELECT COALESCE(AVG(total_amount), 0) FROM "order" WHERE status != 'Cancelled') AS avg_order_value,
        (SELECT COUNT(*) FROM inventory WHERE quantity <= reorder_level) AS low_stock_items,
        (SELECT COUNT(*) FROM shipment WHERE status = 'In Transit') AS active_shipments
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }

  // Get recent orders
  static async getRecentOrders(limit = 10) {
    const query = `
      SELECT 
        o.order_id,
        o.date,
        o.total_amount,
        o.status,
        o.priority,
        c.name AS customer_name,
        s.tracking_number
      FROM "order" o
      JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN shipment s ON o.order_id = s.order_id
      ORDER BY o.date DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // Get top selling products
  static async getTopProducts(limit = 10) {
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.category,
        p.unit_price,
        get_product_sales_count(p.product_id) AS units_sold,
        get_product_sales_count(p.product_id) * p.unit_price AS total_revenue
      FROM product p
      ORDER BY units_sold DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // Get top customers
  static async getTopCustomers(limit = 10) {
    const query = `
      SELECT 
        c.customer_id,
        c.name,
        c.email,
        get_customer_lifetime_value(c.customer_id) AS lifetime_value,
        is_customer_vip(c.customer_id) AS is_vip,
        COUNT(o.order_id) AS total_orders
      FROM customer c
      LEFT JOIN "order" o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY lifetime_value DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // Get revenue by category
  static async getRevenueByCategory() {
    const query = `
      SELECT 
        p.category,
        COUNT(DISTINCT o.order_id) AS order_count,
        SUM(ol.quantity) AS units_sold,
        SUM(ol.quantity * ol.price) AS total_revenue
      FROM order_line ol
      JOIN product p ON ol.product_id = p.product_id
      JOIN "order" o ON ol.order_id = o.order_id
      WHERE o.status != 'Cancelled'
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get order status distribution
  static async getOrderStatusDistribution() {
    const query = `
      SELECT 
        status,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "order"), 2) AS percentage
      FROM "order"
      GROUP BY status
      ORDER BY count DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get daily revenue (last 30 days)
  static async getDailyRevenue(days = 30) {
    const query = `
      SELECT 
        DATE(o.date) AS order_date,
        COUNT(o.order_id) AS order_count,
        COALESCE(SUM(o.total_amount), 0) AS daily_revenue
      FROM "order" o
      WHERE o.date >= CURRENT_DATE - INTERVAL '${days} days'
        AND o.status != 'Cancelled'
      GROUP BY DATE(o.date)
      ORDER BY order_date DESC
    `;
    
    // PostgreSQL
    const result = await db.query(query);
    return result.rows;
    
    // MySQL: Replace INTERVAL '${days} days' with INTERVAL ${days} DAY
  }

  // Get warehouse efficiency
  static async getWarehouseEfficiency() {
    const query = `
      SELECT 
        w.warehouse_id,
        w.name,
        w.location,
        w.capacity,
        calculate_warehouse_utilization(w.warehouse_id) AS utilization_percent,
        COUNT(i.product_id) AS product_count,
        SUM(i.quantity) AS total_items
      FROM warehouse w
      LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
      GROUP BY w.warehouse_id, w.name, w.location, w.capacity
      ORDER BY utilization_percent DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get pending payments
  static async getPendingPayments() {
    const query = `
      SELECT 
        p.payment_id,
        p.order_id,
        p.amount,
        p.payment_date,
        o.date AS order_date,
        c.name AS customer_name,
        c.email AS customer_email,
        CURRENT_DATE - DATE(o.date) AS days_pending
      FROM payment p
      JOIN "order" o ON p.order_id = o.order_id
      JOIN customer c ON o.customer_id = c.customer_id
      WHERE p.status = 'Pending'
      ORDER BY days_pending DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Dashboard;