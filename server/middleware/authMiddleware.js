// server/middleware/authMiddleware.js
// Verifies JWT token and checks user roles for route protection.

const jwt = require('jsonwebtoken');

// NOTE: This secret MUST match the one used in authController.js and your .env
const JWT_SECRET = process.env.JWT_SECRET || 'supply_chain_portal_super_secret_key_2025'; 

/**
 * Middleware to verify JWT and check user role.
 * Example usage in a route: router.get('/admin-data', checkAuth('ADMIN'), controller.getAdminData)
 */
exports.checkAuth = (...allowedRoles) => (req, res, next) => {
    // Check for Authorization header (e.g., 'Bearer <token>')
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access denied. Invalid token format or missing token.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info (id, role, customer_id, supplier_id) to request object
        
        // Role-Based Access Check
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
            // Log access attempt: Forbidden (403)
            return res.status(403).json({ success: false, message: 'Forbidden. Insufficient role privileges.' });
        }

        next(); // Token is valid, role is authorized. Proceed.
    } catch (error) {
        // Log token validation failure
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};