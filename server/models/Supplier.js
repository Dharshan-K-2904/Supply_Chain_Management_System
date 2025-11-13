// server/models/Supplier.js
// Handles CRUD and advanced reporting for the Supplier entity.

const db = require('../config/database');

class Supplier {

    static async executeSelect(sql, values = []) {
        try {
            const [rows] = await db.execute(sql, values);
            return rows;
        } catch (error) {
            console.error("Supplier Model Query Failed:", error);
            throw new Error("Supplier database operation failed: " + error.message);
        }
    }

    // --- Standard CRUD ---

    static async getAll() {
        const sql = `
            SELECT 
                s.*, 
                co.name AS company_name,
                get_supplier_performance_score(s.supplier_id) AS performance_score
            FROM supplier s
            JOIN company co ON s.company_id = co.company_id
            ORDER BY s.name;
        `;
        // NOTE: Calls the UDF in the main read for display
        return this.executeSelect(sql);
    }

    static async getById(id) {
        const sql = `
            SELECT 
                s.*, 
                co.name AS company_name,
                get_supplier_performance_score(s.supplier_id) AS performance_score
            FROM supplier s
            JOIN company co ON s.company_id = co.company_id
            WHERE s.supplier_id = ?;
        `;
        const result = await this.executeSelect(sql, [id]);
        return result[0];
    }

    static async create(data) {
        const sql = `
            INSERT INTO supplier (name, address, contact, phone_number, company_id)
            VALUES (?, ?, ?, ?, ?);
        `;
        const result = await db.execute(sql, [
            data.name, data.address, data.contact, data.phone_number, data.company_id
        ]);
        return { supplier_id: result[0].insertId };
    }

    static async update(id, data) {
        const sql = `
            UPDATE supplier SET 
                name = ?, address = ?, contact = ?, phone_number = ?
            WHERE supplier_id = ?;
        `;
        await db.execute(sql, [
            data.name, data.address, data.contact, data.phone_number, id
        ]);
        return this.getById(id);
    }

    static async delete(id) {
        const sql = 'DELETE FROM supplier WHERE supplier_id = ?;';
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return { message: 'Supplier not found' };
        }
        return { message: 'Supplier deleted successfully' };
    }

    // --- Advanced Reporting Functions ---

    /**
     * 🎯 FUNCTION CALL: Get Supplier Performance Score
     * Explicitly calls the UDF for the controller's specific report endpoint.
     */
    static async getPerformanceScore(supplierId) {
        const sql = `SELECT get_supplier_performance_score(?) AS performance_score`;
        const [rows] = await db.execute(sql, [supplierId]);
        return rows[0];
    }
    
    /**
     * 🎯 VIEW CALL: Get Products by Supplier
     * Uses the vw_SupplierProductList view for the complex read.
     */
    static async getProductsBySupplier(supplierId) {
        // NOTE: This view was added to 04_create_views.sql
        const sql = `SELECT * FROM vw_SupplierProductList WHERE supplier_id = ?`;
        return this.executeSelect(sql, [supplierId]);
    }
}

module.exports = Supplier;