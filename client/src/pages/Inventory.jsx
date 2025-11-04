import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import InventoryList from '../components/inventory/InventoryList';
import InventoryUpdateForm from '../components/inventory/InventoryUpdateForm';
import WarehouseSummaryCard from '../components/inventory/WarehouseSummaryCard';
import { Warehouse, AlertTriangle, RefreshCw } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouseSummary, setWarehouseSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);

  // ✅ useCallback ensures fetchData doesn't recreate every render
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [inventoryRes, summaryRes] = await Promise.all([
        showLowStock 
          ? inventoryService.getLowStockInventory()
          : inventoryService.getAllInventory(),
        inventoryService.getWarehouseSummary(),
      ]);
      
      if (inventoryRes.success) setInventory(inventoryRes.data);
      if (summaryRes.success) setWarehouseSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  }, [showLowStock]); // ✅ Dependency added safely

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = (item) => {
    setSelectedInventory(item);
    setModalOpen(true);
  };

  const handleSubmitUpdate = async (formData) => {
    try {
      await inventoryService.updateInventory(formData);
      alert('Inventory updated successfully');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory: ' + (error.response?.data?.message || error.message));
    }
  };

  const totalItems = inventory.reduce((sum, item) => sum + parseInt(item.quantity), 0);
  const totalValue = inventory.reduce((sum, item) => 
    sum + (parseFloat(item.unit_price) * parseInt(item.quantity)), 0
  );
  const lowStockCount = inventory.filter(item => item.stock_status === 'Critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Warehouse className="h-8 w-8 mr-3 text-primary-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage warehouse inventory</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={showLowStock ? 'primary' : 'outline'}
            icon={AlertTriangle}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            {showLowStock ? 'Show All' : 'Low Stock Only'}
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Items</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalItems.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ₹{totalValue.toLocaleString('en-IN')}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Low Stock Items</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{lowStockCount}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Warehouses</p>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {warehouseSummary.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Warehouse Summary */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Warehouse Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warehouseSummary.map((warehouse) => (
            <WarehouseSummaryCard key={warehouse.warehouse_id} warehouse={warehouse} />
          ))}
        </div>
      </div>

      {/* Inventory List */}
      <Card title="Inventory Details">
        {loading ? (
          <Loader />
        ) : (
          <InventoryList inventory={inventory} onUpdate={handleUpdate} />
        )}
      </Card>

      {/* Update Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Inventory"
        size="md"
      >
        {selectedInventory && (
          <InventoryUpdateForm
            inventory={selectedInventory}
            onSubmit={handleSubmitUpdate}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
