// server/models/Warehouse.js
// Handles CRUD operations for the Warehouse entity.

const db = require('../config/database');

class Warehouse {

    static async executeSelect(sql, values = []) {
        try {
            const [rows] = await db.execute(sql, values);
            return rows;
        } catch (error) {
            console.error("Warehouse Model Query Failed:", error);
            throw new Error("Warehouse database operation failed: " + error.message);
        }
    }

    // --- Standard CRUD ---

    static async getAll() {
        const sql = `
            SELECT w.*, c.name AS company_name
            FROM warehouse w
            JOIN company c ON w.company_id = c.company_id
            ORDER BY w.name;
        `;
        return this.executeSelect(sql);
    }

    static async getById(id) {
        const sql = `
            SELECT w.*, c.name AS company_name
            FROM warehouse w
            JOIN company c ON w.company_id = c.company_id
            WHERE w.warehouse_id = ?;
        `;
        const result = await this.executeSelect(sql, [id]);
        return result[0];
    }

    static async create(data) {
        const sql = `
            INSERT INTO warehouse (name, address, location, capacity, company_id)
            VALUES (?, ?, ?, ?, ?);
        `;
        const [result] = await db.execute(sql, [
            data.name, data.address, data.location, data.capacity, data.company_id
        ]);
        return { warehouse_id: result.insertId, ...data };
    }

    static async update(id, data) {
        const sql = `
            UPDATE warehouse
            SET name = ?, address = ?, location = ?, capacity = ?, company_id = ?
            WHERE warehouse_id = ?;
        `;
        await db.execute(sql, [
            data.name, data.address, data.location, data.capacity, data.company_id, id
        ]);
        return this.getById(id);
    }

    // CRITICAL: Deleting a warehouse should also cascade and remove inventory records (handled by DDL)
    static async delete(id) {
        const sql = 'DELETE FROM warehouse WHERE warehouse_id = ?;';
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return { message: 'Warehouse not found' };
        }
        return { message: 'Warehouse deleted successfully' };
    }
}

module.exports = Warehouse;