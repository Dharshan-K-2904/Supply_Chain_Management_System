const Customer = require('../models/Customer');

// GET /api/customers
exports.getAllCustomers = async (req, res) => {
  try {
    // NOTE: Model fetches CLV and VIP status using UDFs
    const customers = await Customer.getAll();
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      message: error.message
    });
  }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.getById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
      message: error.message
    });
  }
};

// POST /api/customers
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Check for MySQL Duplicate Entry error (ER_DUP_ENTRY is 1062)
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists. Customer creation failed.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      message: error.message
    });
  }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.update(id, req.body);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
      message: error.message
    });
  }
};

// DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    // NOTE: Model returns { message: 'Customer deleted successfully' } or 'Customer not found'
    const result = await Customer.delete(id); 
    
    if (result.message === 'Customer not found') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    
    // Check for MySQL Foreign Key Constraint error (ER_ROW_IS_REFERENCED is 1451/1452)
    if (error.code === 'ER_ROW_IS_REFERENCED' || error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete customer with existing orders. Foreign key constraint violation.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
      message: error.message
    });
  }
};

// GET /api/customers/vip
exports.getVIPCustomers = async (req, res) => {
  try {
    // NOTE: Model uses the UDF is_customer_vip(c.customer_id) in its WHERE clause
    const customers = await Customer.getVIPCustomers(); 
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching VIP customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch VIP customers',
      message: error.message
    });
  }
};