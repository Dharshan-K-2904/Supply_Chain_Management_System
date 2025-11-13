// server/models/Product.js
// Final Version: Converted to MySQL syntax for compatibility.

const db = require('../config/database');

class Product {

    static async executeSelect(sql, values = []) {
        try {
            // Use db.execute() for standard SELECT statements
            const [rows] = await db.execute(sql, values);
            return rows;
        } catch (error) {
            console.error("Product Model Query Failed:", error);
            throw new Error("Product database operation failed: " + error.message);
        }
    }

    // --- Standard CRUD ---

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
        // Removed PostgreSQL syntax from execution, using standard executeSelect
        return this.executeSelect(query);
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
            WHERE p.product_id = ?
        `;
        
        const result = await this.executeSelect(query, [id]);
        return result[0];
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
            WHERE p.category = ?
            ORDER BY p.name
        `;
        
        return this.executeSelect(query, [category]);
    }

    // Create new product
    static async create(productData) {
        const { name, description, category, unit_price, manufacturer, availability, supplier_id } = productData;
        
        // MySQL INSERT without RETURNING *
        const query = `
            INSERT INTO product (name, description, category, unit_price, manufacturer, availability, supplier_id)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        
        const [result] = await db.execute(query, [name, description, category, unit_price, manufacturer, availability, supplier_id]);
        
        // Return the full data along with the generated insertId
        return { product_id: result.insertId, ...productData };
    }

    // Update product (CRITICAL: Triggers TRG_AUDIT_PRODUCT_PRICE if unit_price changes)
    static async update(id, productData) {
        const { name, description, category, unit_price, manufacturer, availability, supplier_id } = productData;
        
        // MySQL UPDATE without RETURNING *
        const query = `
            UPDATE product
            SET name = ?, description = ?, category = ?, unit_price = ?,
                manufacturer = ?, availability = ?, supplier_id = ?
            WHERE product_id = ?
        `;
        
        await db.execute(query, [name, description, category, unit_price, manufacturer, availability, supplier_id, id]);
        
        // Manually fetch the updated row
        return this.getById(id); 
    }

    // Delete product
    static async delete(id) {
        // MySQL DELETE without RETURNING *
        const query = `DELETE FROM product WHERE product_id = ?`;
        await db.execute(query, [id]);
        return { message: 'Product deleted successfully' };
    }

    // Get low stock products (Demonstrates Complex Read)
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
        
        return this.executeSelect(query);
    }
}

module.exports = Product;