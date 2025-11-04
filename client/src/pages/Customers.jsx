import React, { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customerService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import CustomerList from '../components/customers/CustomerList';
import CustomerForm from '../components/customers/CustomerForm';
import { Plus, Users, Crown } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showVIPOnly, setShowVIPOnly] = useState(false);

  // ✅ useCallback prevents infinite loops caused by re-creating fetchCustomers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = showVIPOnly
        ? await customerService.getVIPCustomers()
        : await customerService.getAllCustomers();

      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [showVIPOnly]);

  const fetchCompanies = useCallback(async () => {
    try {
      setCompanies([
        { company_id: 1, name: 'TechSupply Inc' },
        { company_id: 2, name: 'Global Distributors Ltd' },
        { company_id: 3, name: 'RetailMart Chain' },
      ]);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchCompanies();
  }, [fetchCustomers, fetchCompanies]);

  const handleCreate = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        await customerService.deleteCustomer(customer.customer_id);
        alert('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.customer_id, formData);
        alert('Customer updated successfully');
      } else {
        await customerService.createCustomer(formData);
        alert('Customer created successfully');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer: ' + (error.response?.data?.error || error.message));
    }
  };

  const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(c.lifetime_value || 0), 0);
  const vipCount = customers.filter(c => c.is_vip).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary-600" />
            Customers
          </h1>
          <p className="text-gray-600 mt-1">Manage customer relationships</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={showVIPOnly ? 'primary' : 'outline'}
            icon={Crown}
            onClick={() => setShowVIPOnly(!showVIPOnly)}
          >
            {showVIPOnly ? 'Show All' : 'VIP Only'}
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">VIP Customers</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{vipCount}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Avg. Lifetime Value</p>
            <p className="text-2xl font-bold text-primary-600 mt-2">
              ₹{(totalRevenue / (customers.length || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        {loading ? (
          <Loader />
        ) : (
          <CustomerList
            customers={customers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <CustomerForm
          customer={editingCustomer}
          companies={companies}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Customers;
