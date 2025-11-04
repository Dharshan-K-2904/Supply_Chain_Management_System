import React, { useState } from 'react';
import Button from '../common/Button';
import { Plus, Minus } from 'lucide-react';

const InventoryUpdateForm = ({ inventory, onSubmit, onCancel }) => {
  const [operation, setOperation] = useState('ADD');
  const [quantity, setQuantity] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    onSubmit({
      product_id: inventory.product_id,
      warehouse_id: inventory.warehouse_id,
      operation,
      quantity: parseInt(quantity),
    });
  };

  return (
    <div>
      {/* Current Inventory Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Product</p>
            <p className="font-semibold text-gray-900">{inventory.product_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Warehouse</p>
            <p className="font-semibold text-gray-900">{inventory.warehouse_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="text-2xl font-bold text-primary-600">{inventory.quantity} units</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reorder Level</p>
            <p className="text-lg font-semibold text-gray-900">{inventory.reorder_level} units</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Operation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Operation Type *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setOperation('ADD')}
              className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-all ${
                operation === 'ADD'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-semibold">Add Stock</span>
            </button>
            <button
              type="button"
              onClick={() => setOperation('SUBTRACT')}
              className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-all ${
                operation === 'SUBTRACT'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-red-300'
              }`}
            >
              <Minus className="h-5 w-5 mr-2" />
              <span className="font-semibold">Remove Stock</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
            max={operation === 'SUBTRACT' ? inventory.quantity : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
            placeholder="Enter quantity"
          />
          {operation === 'SUBTRACT' && quantity > inventory.quantity && (
            <p className="mt-1 text-sm text-red-600">
              Cannot remove more than current stock ({inventory.quantity} units)
            </p>
          )}
        </div>

        {/* Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2">Preview:</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className="text-xl font-bold text-gray-900">{inventory.quantity} units</p>
            </div>
            <div className="text-3xl font-bold text-gray-400">
              {operation === 'ADD' ? '+' : '-'}
            </div>
            <div>
              <p className="text-sm text-gray-600">Change</p>
              <p className={`text-xl font-bold ${operation === 'ADD' ? 'text-green-600' : 'text-red-600'}`}>
                {quantity} units
              </p>
            </div>
            <div className="text-3xl font-bold text-gray-400">=</div>
            <div>
              <p className="text-sm text-gray-600">New Stock</p>
              <p className="text-xl font-bold text-primary-600">
                {operation === 'ADD' 
                  ? parseInt(inventory.quantity) + parseInt(quantity || 0)
                  : Math.max(0, parseInt(inventory.quantity) - parseInt(quantity || 0))
                } units
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant={operation === 'ADD' ? 'success' : 'danger'}
            disabled={operation === 'SUBTRACT' && quantity > inventory.quantity}
          >
            {operation === 'ADD' ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryUpdateForm;