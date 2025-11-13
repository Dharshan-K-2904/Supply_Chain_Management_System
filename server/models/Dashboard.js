// server/models/Dashboard.js
// ✅ Final Version - MySQL Compatible Dashboard Model (for SCM Portal)

const db = require('../config/database');

class Dashboard {

  // 🔹 Generic SELECT executor
  static async executeSelect(sql, values = []) {
    try {
      const [rows] = await db.execute(sql, values);
      return rows;
    } catch (error) {
      console.error('Dashboard Model Query Failed:', error);
      throw new Error('Database query failed: ' + error.message);
    }
  }

  // 🔹 1. Get overall dashboard statistics
  static async getOverallStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM customer) AS total_customers,
        (SELECT COUNT(*) FROM product) AS total_products,
        (SELECT COUNT(*) FROM \`order\`) AS total_orders,
        (SELECT COUNT(*) FROM \`order\` WHERE status = 'Pending') AS pending_orders,
        (SELECT COUNT(*) FROM \`order\` WHERE status = 'Delivered') AS delivered_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM \`order\` WHERE status != 'Cancelled') AS total_revenue,
        (SELECT COALESCE(AVG(total_amount), 0) FROM \`order\` WHERE status != 'Cancelled') AS avg_order_value,
        (SELECT COUNT(DISTINCT product_id) FROM inventory WHERE quantity <= reorder_level) AS low_stock_items,
        (SELECT COUNT(*) FROM shipment WHERE status = 'In Transit') AS active_shipments
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }

  // 🔹 2. Get recent orders
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
      FROM \`order\` o
      JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN shipment s ON o.order_id = s.order_id
      ORDER BY o.date DESC
      LIMIT ?
    `;
    return this.executeSelect(query, [limit]);
  }

  // 🔹 3. Get top-selling products (calls stored function)
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
      LIMIT ?
    `;
    return this.executeSelect(query, [limit]);
  }

  // 🔹 4. Get top customers (calls UDFs)
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
      LEFT JOIN \`order\` o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id, c.name, c.email, lifetime_value, is_vip
      ORDER BY lifetime_value DESC
      LIMIT ?
    `;
    return this.executeSelect(query, [limit]);
  }

  // 🔹 5. Get revenue by product category
  static async getRevenueByCategory() {
    const query = `
      SELECT 
        p.category,
        COUNT(DISTINCT o.order_id) AS order_count,
        SUM(ol.quantity) AS units_sold,
        SUM(ol.quantity * ol.price) AS total_revenue
      FROM order_line ol
      JOIN product p ON ol.product_id = p.product_id
      JOIN \`order\` o ON ol.order_id = o.order_id
      WHERE o.status != 'Cancelled'
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;
    return this.executeSelect(query);
  }

  // 🔹 6. Get order status distribution
  static async getOrderStatusDistribution() {
    const query = `
      SELECT 
        status,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM \`order\`), 2) AS percentage
      FROM \`order\`
      GROUP BY status
      ORDER BY count DESC
    `;
    return this.executeSelect(query);
  }

  // 🔹 7. Get daily revenue trend
  static async getDailyRevenue(days = 30) {
    const query = `
      SELECT 
        DATE(o.date) AS order_date,
        COUNT(o.order_id) AS order_count,
        COALESCE(SUM(o.total_amount), 0) AS daily_revenue
      FROM \`order\` o
      WHERE o.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND o.status != 'Cancelled'
      GROUP BY DATE(o.date)
      ORDER BY order_date DESC
    `;
    return this.executeSelect(query, [days]);
  }

  // 🔹 8. Get warehouse utilization (calls stored function)
  static async getWarehouseUtilization() {
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
    return this.executeSelect(query);
  }

  // 🔹 9. Get pending payments (using MySQL date functions)
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
        DATEDIFF(CURDATE(), DATE(o.date)) AS days_pending
      FROM payment p
      JOIN \`order\` o ON p.order_id = o.order_id
      JOIN customer c ON o.customer_id = c.customer_id
      WHERE p.status = 'Pending'
      ORDER BY days_pending DESC
    `;
    return this.executeSelect(query);
  }

  // 🔹 10. Get inventory alerts (from view vw_InventoryStatusAlerts)
  static async getInventoryAlerts() {
    const query = `
      SELECT * FROM vw_InventoryStatusAlerts
      ORDER BY severity DESC, last_updated DESC
    `;
    return this.executeSelect(query);
  }

  // 🔹 11. Get product price audit history (from trigger-based view)
  static async getProductPriceAudit() {
    const query = `
      SELECT * FROM vw_ProductPriceAudit
      ORDER BY changed_at DESC
    `;
    return this.executeSelect(query);
  }

  // 🔹 12. Get detailed order summary (complex multi-join view)
  static async getDetailedOrderSummary() {
    const query = `
      SELECT * FROM vw_DetailedOrderSummary
      ORDER BY order_date DESC
    `;
    return this.executeSelect(query);
  }

}

module.exports = Dashboard;
