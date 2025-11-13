// server/models/Customer.js
// Final Version: Converted to MySQL syntax for compatibility.

const db = require('../config/database');

class Customer {

    static async executeSelect(sql, values = []) {
        try {
            // Use db.execute() for standard SELECT statements
            const [rows] = await db.execute(sql, values);
            return rows;
        } catch (error) {
            console.error("Customer Model Query Failed:", error);
            throw new Error("Customer database operation failed: " + error.message);
        }
    }

    // --- Standard CRUD ---

    // Get all customers (Uses UDFs for metrics)
    static async getAll() {
        const query = `
            SELECT 
                c.*,
                co.name AS company_name,
                get_customer_lifetime_value(c.customer_id) AS lifetime_value,
                is_customer_vip(c.customer_id) AS is_vip,
                COUNT(o.order_id) AS total_orders
            FROM customer c
            JOIN company co ON c.company_id = co.company_id
            LEFT JOIN \`order\` o ON c.customer_id = o.customer_id
            GROUP BY c.customer_id, co.name, lifetime_value, is_vip
            ORDER BY c.name
        `;
        
        return this.executeSelect(query);
    }

    // Get customer by ID (Uses UDFs for metrics)
    static async getById(id) {
        const query = `
            SELECT 
                c.*,
                co.name AS company_name,
                get_customer_lifetime_value(c.customer_id) AS lifetime_value,
                is_customer_vip(c.customer_id) AS is_vip
            FROM customer c
            JOIN company co ON c.company_id = co.company_id
            WHERE c.customer_id = ?
        `;
        
        const result = await this.executeSelect(query, [id]);
        return result[0];
    }

    // Create new customer
    static async create(customerData) {
        const { name, address, email, phone_number, company_id } = customerData;
        
        // MySQL INSERT without RETURNING *
        const query = `
            INSERT INTO customer (name, address, email, phone_number, company_id)
            VALUES (?, ?, ?, ?, ?);
        `;
        
        const [result] = await db.execute(query, [name, address, email, phone_number, company_id]);
        
        // Return the new ID and data
        return { customer_id: result.insertId, ...customerData };
    }

    // Update customer (NOTE: company_id is excluded from update as per original PG query)
    static async update(id, customerData) {
        const { name, address, email, phone_number } = customerData;
        
        // MySQL UPDATE without RETURNING *
        const query = `
            UPDATE customer
            SET name = ?, address = ?, email = ?, phone_number = ?
            WHERE customer_id = ?
        `;
        
        await db.execute(query, [name, address, email, phone_number, id]);
        
        // Manually fetch the updated row
        return this.getById(id);
    }

    // Delete customer
    static async delete(id) {
        // MySQL DELETE without RETURNING *
        const query = `DELETE FROM customer WHERE customer_id = ?`;
        const [result] = await db.execute(query, [id]);
        
        if (result.affectedRows === 0) {
            return { message: 'Customer not found' };
        }
        return { message: 'Customer deleted successfully' };
    }

    // Get VIP customers (Uses UDF)
    static async getVIPCustomers() {
        const query = `
            SELECT 
                c.*,
                get_customer_lifetime_value(c.customer_id) AS lifetime_value,
                COUNT(o.order_id) AS total_orders
            FROM customer c
            LEFT JOIN \`order\` o ON c.customer_id = o.customer_id
            WHERE is_customer_vip(c.customer_id) = TRUE
            GROUP BY c.customer_id, c.name, c.email, c.phone_number, c.address, c.company_id, c.created_at, lifetime_value
            ORDER BY lifetime_value DESC
        `;
        
        return this.executeSelect(query);
    }
}

module.exports = Customer;