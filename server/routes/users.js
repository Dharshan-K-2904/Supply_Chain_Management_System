// server/routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// NOTE: In a real app, ALL user routes would use checkAuth('ADMIN') middleware
// to protect them. For this project, we just define the route.

router.post('/', userController.createUser);
// router.get('/', userController.getAllUsers); // for Admin View

module.exports = router;