import api from './api';

export const dashboardService = {
  // Get complete dashboard
  getCompleteDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Get overall stats
  getOverallStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get recent orders
  getRecentOrders: async (limit = 10) => {
    const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
    return response.data;
  },

  // Get top products
  getTopProducts: async (limit = 10) => {
    const response = await api.get(`/dashboard/top-products?limit=${limit}`);
    return response.data;
  },

  // Get top customers
  getTopCustomers: async (limit = 10) => {
    const response = await api.get(`/dashboard/top-customers?limit=${limit}`);
    return response.data;
  },

  // Get revenue by category
  getRevenueByCategory: async () => {
    const response = await api.get('/dashboard/revenue-by-category');
    return response.data;
  },

  // Get order status distribution
  getOrderStatusDistribution: async () => {
    const response = await api.get('/dashboard/order-status-distribution');
    return response.data;
  },

  // Get daily revenue
  getDailyRevenue: async (days = 30) => {
    const response = await api.get(`/dashboard/daily-revenue?days=${days}`);
    return response.data;
  },

  // Get warehouse efficiency
  getWarehouseEfficiency: async () => {
    const response = await api.get('/dashboard/warehouse-efficiency');
    return response.data;
  },

  // Get pending payments
  getPendingPayments: async () => {
    const response = await api.get('/dashboard/pending-payments');
    return response.data;
  },
};