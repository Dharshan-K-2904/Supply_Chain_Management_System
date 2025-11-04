import React, { useState } from 'react'; // ✅ removed useEffect
import Button from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';

const CreateOrderForm = ({ customers, products, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    priority: 'Medium',
    items: [{ product_id: '', quantity: 1 }],
  });

  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleCustomerChange = (e) => {
    setFormData((prev) => ({ ...prev, customer_id: e.target.value }));
  };

  const handlePriorityChange = (e) => {
    setFormData((prev) => ({ ...prev, priority: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: newItems }));

    if (field === 'product_id') {
      const product = products.find((p) => p.product_id === parseInt(value));
      const newSelectedProducts = [...selectedProducts];
      newSelectedProducts[index] = product;
      setSelectedProducts(newSelectedProducts);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1 }],
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
    const newSelectedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(newSelectedProducts);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item, index) => {
      const product = selectedProducts[index];
      if (product) {
        return total + parseFloat(product.unit_price) * parseInt(item.quantity || 0);
      }
      return total;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }

    const validItems = formData.items.filter(
      (item) => item.product_id && item.quantity > 0
    );

    if (validItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    onSubmit({
      ...formData,
      items: validItems.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer *
          </label>
          <select
            value={formData.customer_id}
            onChange={handleCustomerChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Customer</option>
            {customers &&
              customers.map((customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority *
          </label>
          <select
            value={formData.priority}
            onChange={handlePriorityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Order Items *
          </label>
          <Button type="button" size="sm" icon={Plus} onClick={addItem}>
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Product</label>
                <select
                  value={item.product_id}
                  onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Product</option>
                  {products &&
                    products.map((product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.name} - ₹
                        {parseFloat(product.unit_price).toLocaleString('en-IN')}
                        {product.total_stock > 0
                          ? ` (Stock: ${product.total_stock})`
                          : ' (Out of Stock)'}
                      </option>
                    ))}
                </select>
              </div>

              <div className="w-32">
                <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, 'quantity', e.target.value)
                  }
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {selectedProducts[index] && (
                <div className="w-40">
                  <label className="block text-xs text-gray-600 mb-1">
                    Subtotal
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-900">
                    ₹
                    {(
                      parseFloat(selectedProducts[index].unit_price) *
                      parseInt(item.quantity || 0)
                    ).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {formData.items.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeItem(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span className="text-gray-700">Order Total:</span>
          <span className="text-primary-600 text-2xl">
            ₹{calculateTotal().toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create Order
        </Button>
      </div>
    </form>
  );
};

export default CreateOrderForm;
