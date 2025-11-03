import api from './api';

export const inventoryService = {
  // Get all inventory
  getAllInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  // Get inventory by warehouse
  getInventoryByWarehouse: async (warehouseId) => {
    const response = await api.get(`/inventory/warehouse/${warehouseId}`);
    return response.data;
  },

  // Get inventory by product
  getInventoryByProduct: async (productId) => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },

  // Get low stock inventory
  getLowStockInventory: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  // Get inventory alerts
  getInventoryAlerts: async () => {
    const response = await api.get('/inventory/alerts');
    return response.data;
  },

  // Get warehouse summary
  getWarehouseSummary: async () => {
    const response = await api.get('/inventory/warehouse-summary');
    return response.data;
  },

  // Create inventory
  createInventory: async (inventoryData) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },

  // Update inventory
  updateInventory: async (inventoryData) => {
    const response = await api.put('/inventory', inventoryData);
    return response.data;
  },
};