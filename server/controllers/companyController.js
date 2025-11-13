// server/controllers/companyController.js
// Final controller logic for the Company entity.

const Company = require('../models/Company'); 

// GET /api/companies
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.getAll();
        res.json({ success: true, count: companies.length, data: companies });
    } catch (error) {
        console.error('Error fetching all companies:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch companies', message: error.message });
    }
};

// GET /api/companies/:id
exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.getById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }
        res.json({ success: true, data: company });
    } catch (error) {
        console.error('Error fetching company by ID:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch company', message: error.message });
    }
};

// POST /api/companies
exports.createCompany = async (req, res) => {
    try {
        const result = await Company.create(req.body);
        res.status(201).json({ success: true, message: 'Company created successfully', data: result });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ success: false, error: 'Failed to create company', message: error.message });
    }
};

// PUT /api/companies/:id
exports.updateCompany = async (req, res) => {
    try {
        const updatedCompany = await Company.update(req.params.id, req.body);
        
        if (!updatedCompany) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }
        res.json({ success: true, message: 'Company updated successfully.', data: updatedCompany });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ success: false, error: 'Failed to update company', message: error.message });
    }
};

// DELETE /api/companies/:id
exports.deleteCompany = async (req, res) => {
    try {
        const result = await Company.delete(req.params.id);
        
        if (result.message === 'Company not found') {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }
        res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ success: false, error: 'Failed to delete company', message: error.message });
    }
};