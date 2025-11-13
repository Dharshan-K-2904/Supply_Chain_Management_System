// server/models/Company.js
// Final Version: Handles CRUD operations for the Company entity.

const db = require('../config/database');

class Company {

    static async executeSelect(sql, values = []) {
        try {
            const [rows] = await db.execute(sql, values);
            return rows;
        } catch (error) {
            console.error("Company Model Query Failed:", error);
            throw new Error("Company database operation failed: " + error.message);
        }
    }

    // --- Standard CRUD ---

    // Get all companies
    static async getAll() {
        const sql = `
            SELECT * FROM company ORDER BY name;
        `;
        return this.executeSelect(sql);
    }

    // Get company by ID
    static async getById(id) {
        const sql = `
            SELECT * FROM company WHERE company_id = ?;
        `;
        const result = await this.executeSelect(sql, [id]);
        return result[0];
    }

    // Create new company
    static async create(data) {
        const sql = `
            INSERT INTO company (name, type, address, contact)
            VALUES (?, ?, ?, ?);
        `;
        const [result] = await db.execute(sql, [
            data.name, data.type, data.address, data.contact
        ]);
        return { company_id: result[0].insertId, ...data };
    }

    // Update company
    static async update(id, data) {
        const sql = `
            UPDATE company
            SET name = ?, type = ?, address = ?, contact = ?
            WHERE company_id = ?;
        `;
        await db.execute(sql, [
            data.name, data.type, data.address, data.contact, id
        ]);
        return this.getById(id);
    }

    // Delete company (Deletion relies on ON DELETE CASCADE in the DDL for related suppliers/customers)
    static async delete(id) {
        const sql = 'DELETE FROM company WHERE company_id = ?;';
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return { message: 'Company not found' };
        }
        return { message: 'Company deleted successfully' };
    }
}

module.exports = Company;