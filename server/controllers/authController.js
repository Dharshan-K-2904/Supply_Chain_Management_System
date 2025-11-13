// server/controllers/authController.js
// Handles user authentication and token issuance.

const db = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supply_chain_portal_super_secret_key_2025'; 

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find user by username
        const sql = `
            SELECT user_id, username, name, role, password_hash, customer_id, supplier_id 
            FROM db_user WHERE username = ?
        `;
        const [rows] = await db.execute(sql, [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials: User not found.' });
        }

        // 2. Password Check (For demo, 'testpass' is used as the placeholder)
        // In production, user.password_hash would be compared using bcrypt.
        if (password !== 'testpass') { 
             // If you used the specific password 'DBMS@pesu2025' in your DML:
             if (password !== 'DBMS@pesu2025') { 
                return res.status(401).json({ success: false, message: 'Invalid credentials: Password mismatch.' });
             }
        }
        
        // 3. Generate JWT Token
        const token = jwt.sign(
            { 
                id: user.user_id, 
                role: user.role, 
                customerId: user.customer_id, 
                supplierId: user.supplier_id 
            }, 
            JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        // 4. Return user info and token
        res.json({
            success: true,
            token,
            user: {
                id: user.user_id,
                name: user.name,
                role: user.role,
                customer_id: user.customer_id,
                supplier_id: user.supplier_id
            }
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ success: false, message: 'Login failed due to server error.' });
    }
};