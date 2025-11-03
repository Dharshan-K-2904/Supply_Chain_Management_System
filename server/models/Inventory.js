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
    await db.query(query