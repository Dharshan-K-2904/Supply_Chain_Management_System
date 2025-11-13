// server/controllers/userController.js
// Handles CRUD for DB_USER (User Creation and Management)

const db = require('../config/database');

// NOTE: This is simplified. In a real app, this would use bcrypt for hashing.
exports.createUser = async (req, res) => {
    const { username, name, role, customer_id, supplier_id, password } = req.body;
    
    // For project demo, we use a placeholder hash for the password
    const password_hash = 'testpass'; 
    
    try {
        const sql = `
            INSERT INTO db_user (username, password_hash, name, role, customer_id, supplier_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            username, password_hash, name, role, customer_id || null, supplier_id || null
        ]);
        
        res.status(201).json({ success: true, message: 'User created successfully.', user_id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ success: false, error: 'Username or linked ID already exists.' });
        }
        res.status(500).json({ success: false, error: 'Failed to create user.', message: error.message });
    }
};

// ... Add other standard CRUD methods (getUserById, getAllUsers, etc.)