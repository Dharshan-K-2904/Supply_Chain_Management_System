const Dashboard = require('../models/Dashboard');

// --- Standard Endpoints (Maintaining your structure) ---

exports.getOverallStats = async (req, res) => {
  try {
    const stats = await Dashboard.getOverallStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics', message: error.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await Dashboard.getRecentOrders(limit);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent orders', message: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Dashboard.getTopProducts(limit);
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top products', message: error.message });
  }
};

exports.getTopCustomers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const customers = await Dashboard.getTopCustomers(limit);
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top customers', message: error.message });
  }
};

exports.getRevenueByCategory = async (req, res) => {
  try {
    const data = await Dashboard.getRevenueByCategory();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching revenue by category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue by category', message: error.message });
  }
};

exports.getOrderStatusDistribution = async (req, res) => {
  try {
    const data = await Dashboard.getOrderStatusDistribution();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order status distribution', message: error.message });
  }
};

exports.getDailyRevenue = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await Dashboard.getDailyRevenue(days);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch daily revenue', message: error.message });
  }
};

exports.getPendingPayments = async (req, res) => {
  try {
    const data = await Dashboard.getPendingPayments();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending payments', message: error.message });
  }
};

// NOTE: Dashboard.getWarehouseUtilization() takes NO parameters
exports.getWarehouseUtilization = async (req, res) => {
  try {
    const data = await Dashboard.getWarehouseUtilization();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching warehouse utilization:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch warehouse utilization', message: error.message });
  }
};

// --- Advanced / Complex Query Endpoints ---

exports.getDetailedOrderSummary = async (req, res) => {
  try {
    const data = await Dashboard.getDetailedOrderSummary();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching detailed order summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch detailed order summary', message: error.message });
  }
};

exports.getProductPriceAudit = async (req, res) => {
  try {
    const data = await Dashboard.getProductPriceAudit();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching product price audit:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product price audit history', message: error.message });
  }
};

exports.getInventoryAlerts = async (req, res) => {
  try {
    const data = await Dashboard.getInventoryAlerts();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory alerts', message: error.message });
  }
};

// --- Complete Dashboard (Master API) ---

exports.getCompleteDashboard = async (req, res) => {
  try {
    const [
      stats,
      recentOrders,
      topProducts,
      topCustomers,
      revenueByCategory,
      orderStatusDistribution,
      dailyRevenue,
      warehouseUtilization,
      inventoryAlerts,
      priceAudit
    ] = await Promise.all([
      Dashboard.getOverallStats(),
      Dashboard.getRecentOrders(5),
      Dashboard.getTopProducts(5),
      Dashboard.getTopCustomers(5),
      Dashboard.getRevenueByCategory(),
      Dashboard.getOrderStatusDistribution(),
      Dashboard.getDailyRevenue(30),
      Dashboard.getWarehouseUtilization(),
      Dashboard.getInventoryAlerts(),
      Dashboard.getProductPriceAudit()
    ]);

    res.json({
      success: true,
      data: {
        stats,
        recentOrders,
        topProducts,
        topCustomers,
        revenueByCategory,
        orderStatusDistribution,
        dailyRevenue,
        warehouseUtilization,
        inventoryAlerts,
        priceAudit
      }
    });
  } catch (error) {
    console.error('Error fetching complete dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
};
