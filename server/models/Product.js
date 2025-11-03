const db = require('../config/database');

class Product {
  // Get all products
  static async getAll() {
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.category,
        p.unit_price,
        p.manufacturer,
        p.availability,
        s.name AS supplier_name,
        s.supplier_id,
        get_available_inventory(p.product_id) AS total_stock
      FROM product p
      JOIN supplier s ON p.supplier_id = s.supplier_id
      ORDER BY p.name
    `;
    
    // PostgreSQL
    const result = await db.query(query);
    return result.rows;
    
    // MySQL (uncomment if using MySQL)
    // const [rows] = await db.query(query);
    // return rows;
  }

  // Get product by ID
  static async getById(id) {
    const query = `
      SELECT 
        p.*,
        s.name AS supplier_name,
        get_available_inventory(p.product_id) AS total_stock,
        get_product_sales_count(p.product_id) AS units_sold
      FROM product p
      JOIN supplier s ON p.supplier_id = s.supplier_id
      WHERE p.product_id = $1
    `;
    
    // PostgreSQL
    const result = await db.query(query, [id]);
    return result.rows[0];
    
    // MySQL
    // const [rows] = await db.query(query.replace('$1', '?'), [id]);
    // return rows[0];
  }

  // Get products by category
  static async getByCategory(category) {
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.unit_price,
        p.availability,
        get_available_inventory(p.product_id) AS total_stock
      FROM product p
      WHERE p.category = $1
      ORDER BY p.name
    `;
    
    const result = await db.query(query, [category]);
    return result.rows;
  }

  // Create new product
  static async create(productData) {
    const { name, description, category, unit_price, manufacturer, availability, supplier_id } = productData;
    
    const query = `
      INSERT INTO product (name, description, category, unit_price, manufacturer, availability, supplier_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    // PostgreSQL
    const result = await db.query(query, [name, description, category, unit_price, manufacturer, availability, supplier_id]);
    return result.rows[0];
    
    // MySQL
    // const [result] = await db.query(query.replace(/\$(\d+)/g, '?'), [name, description, category, unit_price, manufacturer, availability, supplier_id]);
    // return { product_id: result.insertId, ...productData };
  }

  // Update product
  static async update(id, productData) {
    const { name, description, category, unit_price, manufacturer, availability, supplier_id } = productData;
    
    const query = `
      UPDATE product
      SET name = $1, description = $2, category = $3, unit_price = $4,
          manufacturer = $5, availability = $6, supplier_id = $7
      WHERE product_id = $8
      RETURNING *
    `;
    
    const result = await db.query(query, [name, description, category, unit_price, manufacturer, availability, supplier_id, id]);
    return result.rows[0];
  }

  // Delete product
  static async delete(id) {
    const query = `DELETE FROM product WHERE product_id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Get low stock products
  static async getLowStock() {
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.category,
        i.quantity,
        i.reorder_level,
        w.name AS warehouse_name
      FROM inventory i
      JOIN product p ON i.product_id = p.product_id
      JOIN warehouse w ON i.warehouse_id = w.warehouse_id
      WHERE i.quantity <= i.reorder_level
      ORDER BY (i.reorder_level - i.quantity) DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Product;