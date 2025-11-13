// server/models/Inventory.js
// Final Version: Converted to MySQL syntax for compatibility.

const db = require('../config/database');

class Inventory {

  // Helper method for standard SELECT statements
  static async executeSelect(sql, values = []) {
    try {
        const [rows] = await db.execute(sql, values);
        return rows;
    } catch (error) {
        console.error("Inventory Model Query Failed:", error);
        throw new Error("Inventory database operation failed: " + error.message);
    }
  }

  // --- Core Operations ---

  // Get all inventory records across all warehouses
  static async getAll() {
    // Replaced PostgreSQL CASE WHEN syntax
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
    
    return this.executeSelect(query);
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
      WHERE i.warehouse_id = ?
      ORDER BY p.name
    `;
    
    return this.executeSelect(query, [warehouseId]);
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
      WHERE i.product_id = ?
      ORDER BY w.name
    `;
    
    return this.executeSelect(query, [productId]);
  }

  /**
   * CRITICAL: Update inventory - Calls the Stored Procedure (update_inventory_qty)
   * This is used for manual stock adjustments and demonstrates procedure execution.
   */
  static async update(productId, warehouseId, operation, quantity) {
    // 1. Execute the stored procedure
    // NOTE: We assume the procedure handles ADD/SUBTRACT and validation.
    const query = `CALL update_inventory_qty(?, ?, ?, ?)`;
    await db.execute(query, [productId, warehouseId, quantity, operation]);
     
    // 2. Fetch updated inventory
    const selectQuery = `
      SELECT * FROM inventory 
      WHERE product_id = ? AND warehouse_id = ?
    `;
    const [result] = await db.execute(selectQuery, [productId, warehouseId]);
    return result[0];
  }

  // Add new inventory record (Used for initial stock creation)
  static async create(inventoryData) {
    const { product_id, warehouse_id, quantity, reorder_level } = inventoryData;
    
    // MySQL INSERT ON DUPLICATE KEY UPDATE syntax is typically better for inventory,
    // but here we use a standard INSERT.
    const query = `
      INSERT INTO inventory (product_id, warehouse_id, quantity, reorder_level)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [product_id, warehouse_id, quantity, reorder_level || 10]);
    
    // Return the inserted data along with the product info
    return this.getByIds(product_id, warehouse_id);
  }
  
  // Helper to fetch by composite PK after update/create
  static async getByIds(productId, warehouseId) {
      const sql = `
        SELECT I.*, P.name AS product_name, W.name AS warehouse_name 
        FROM inventory I
        JOIN product P ON I.product_id = P.product_id
        JOIN warehouse W ON I.warehouse_id = W.warehouse_id
        WHERE I.product_id = ? AND I.warehouse_id = ?;
      `;
      const [rows] = await db.execute(sql, [productId, warehouseId]);
      return rows[0];
  }


  // Get low stock items (Advanced Reporting Read)
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
    
    return this.executeSelect(query);
  }

  // Get inventory alerts from log (Auditing/Logging Read)
  static async getAlerts() {
    const query = `
      SELECT 
        ial.*,
        p.name AS product_name,
        w.name AS warehouse_name
      FROM inventory_alert_log ial
      JOIN product p ON ial.product_id = p.product_id
      JOIN warehouse w ON ial.warehouse_id = w.warehouse_id
      ORDER BY ial.alert_date DESC
      LIMIT 50
    `;
    
    return this.executeSelect(query);
  }

  // Get inventory summary by warehouse (Aggregate/Function Read)
  static async getWarehouseSummary() {
    // Calls the calculate_warehouse_utilization UDF and uses aggregation
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
      GROUP BY w.warehouse_id, w.name, w.location, w.capacity, w.location
      ORDER BY w.name
    `;
    
    return this.executeSelect(query);
  }
}
  
module.exports = Inventory;