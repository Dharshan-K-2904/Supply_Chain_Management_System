// server/routes/auth.js
// Route for user login

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
