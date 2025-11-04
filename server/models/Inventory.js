const db = require('../config/database');

class Inventory {
  // Get all inventory
  static async getAll() {
    const query = `
      SELECT 
        i.*,
        p.name AS product_name,
        p.category,
        p.unit_price,
        w.name AS warehouse_name,
        w.location,
        CASE 
          WHEN i.quantity <= i.reorder_level THEN 'Critical'
          WHEN i.quantity <= i.reorder_level * 2 THEN 'Low'
          ELSE 'Normal'
        END AS stock_status
      FROM inventory i
      JOIN product p ON i.product_id = p.product_id
      JOIN warehouse w ON i.warehouse_id = w.warehouse_id
      ORDER BY p.name, w.name
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get inventory by warehouse
  static async getByWarehouse(warehouseId) {
    const query = `
      SELECT 
        i.*,
        p.name AS product_name,
        p.category,
        p.unit_price
      FROM inventory i
      JOIN product p ON i.product_id = p.product_id
      WHERE i.warehouse_id = $1
      ORDER BY p.name
    `;
    
    const result = await db.query(query, [warehouseId]);
    return result.rows;
  }

  // Get inventory by product
  static async getByProduct(productId) {
    const query = `
      SELECT 
        i.*,
        w.name AS warehouse_name,
        w.location,
        w.capacity
      FROM inventory i
      JOIN warehouse w ON i.warehouse_id = w.warehouse_id
      WHERE i.product_id = $1
      ORDER BY w.name
    `;
    
    const result = await db.query(query, [productId]);
    return result.rows;
  }

  // Update inventory
  static async update(productId, warehouseId, operation, quantity) {
    const query = `CALL update_inventory_qty($1, $2, $3, $4)`;
    await db.query(query, [productId, warehouseId, operation, quantity]);
     // Fetch updated inventory
    const selectQuery = `
      SELECT * FROM inventory 
      WHERE product_id = $1 AND warehouse_id = $2
    `;
    const result = await db.query(selectQuery, [productId, warehouseId]);
    return result.rows[0];
  }

  // Add new inventory record
  static async create(inventoryData) {
    const { product_id, warehouse_id, quantity, reorder_level } = inventoryData;
    
    const query = `
      INSERT INTO inventory (product_id, warehouse_id, quantity, reorder_level)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query(query, [product_id, warehouse_id, quantity, reorder_level || 10]);
    return result.rows[0];
  }

  // Get low stock items
  static async getLowStock() {
    const query = `
      SELECT 
        i.*,
        p.name AS product_name,
        p.category,
        p.unit_price,
        w.name AS warehouse_name,
        (i.reorder_level - i.quantity) AS units_below_threshold,
        (i.reorder_level - i.quantity) * p.unit_price AS restock_cost
      FROM inventory i
      JOIN product p ON i.product_id = p.product_id
      JOIN warehouse w ON i.warehouse_id = w.warehouse_id
      WHERE i.quantity <= i.reorder_level
      ORDER BY units_below_threshold DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get inventory alerts from log
  static async getAlerts() {
    const query = `
      SELECT 
        ial.*,
        p.name AS product_name,
        w.name AS warehouse_name
      FROM inventory_alert_log ial
      JOIN inventory i ON ial.product_id = i.product_id AND ial.warehouse_id = i.warehouse_id
      JOIN product p ON ial.product_id = p.product_id
      JOIN warehouse w ON ial.warehouse_id = w.warehouse_id
      ORDER BY ial.alert_date DESC
      LIMIT 50
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get inventory summary by warehouse
  static async getWarehouseSummary() {
    const query = `
      SELECT 
        w.warehouse_id,
        w.name AS warehouse_name,
        w.location,
        w.capacity,
        COUNT(DISTINCT i.product_id) AS product_count,
        SUM(i.quantity) AS total_items,
        calculate_warehouse_utilization(w.warehouse_id) AS utilization_percent,
        COUNT(CASE WHEN i.quantity <= i.reorder_level THEN 1 END) AS low_stock_items
      FROM warehouse w
      LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
      GROUP BY w.warehouse_id, w.name, w.location, w.capacity
      ORDER BY w.name
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
}
  
module.exports = Inventory;