// server/routes/companies.js
// Final routes for Company management

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController'); 

// --- GET (Read) Operations ---

// GET /api/companies
router.get('/', companyController.getAllCompanies);

// GET /api/companies/:id
router.get('/:id', companyController.getCompanyById);


// --- POST (Create) Operations ---

// POST /api/companies
router.post('/', companyController.createCompany);


// --- PUT (Update) Operations ---

// PUT /api/companies/:id
router.put('/:id', companyController.updateCompany);


// --- DELETE Operations ---

// DELETE /api/companies/:id
router.delete('/:id', companyController.deleteCompany);


module.exports = router;