const db = require('../config/database');

class Customer {
  // Get all customers
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
      LEFT JOIN "order" o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id, co.name
      ORDER BY c.name
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get customer by ID
  static async getById(id) {
    const query = `
      SELECT 
        c.*,
        co.name AS company_name,
        get_customer_lifetime_value(c.customer_id) AS lifetime_value,
        is_customer_vip(c.customer_id) AS is_vip
      FROM customer c
      JOIN company co ON c.company_id = co.company_id
      WHERE c.customer_id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Create new customer
  static async create(customerData) {
    const { name, address, email, phone_number, company_id } = customerData;
    
    const query = `
      INSERT INTO customer (name, address, email, phone_number, company_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [name, address, email, phone_number, company_id]);
    return result.rows[0];
  }

  // Update customer
  static async update(id, customerData) {
    const { name, address, email, phone_number } = customerData;
    
    const query = `
      UPDATE customer
      SET name = $1, address = $2, email = $3, phone_number = $4
      WHERE customer_id = $5
      RETURNING *
    `;
    
    const result = await db.query(query, [name, address, email, phone_number, id]);
    return result.rows[0];
  }

  // Delete customer
  static async delete(id) {
    const query = `DELETE FROM customer WHERE customer_id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Get VIP customers
  static async getVIPCustomers() {
    const query = `
      SELECT 
        c.*,
        get_customer_lifetime_value(c.customer_id) AS lifetime_value,
        COUNT(o.order_id) AS total_orders
      FROM customer c
      LEFT JOIN "order" o ON c.customer_id = o.customer_id
      WHERE is_customer_vip(c.customer_id) = TRUE
      GROUP BY c.customer_id
      ORDER BY lifetime_value DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Customer;