// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// Order priorities
export const ORDER_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  UPI: 'UPI',
  CASH: 'Cash',
  NET_BANKING: 'Net Banking',
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

// Shipment statuses
export const SHIPMENT_STATUSES = {
  PREPARING: 'Preparing',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
};

// Product categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Audio',
  'Office Equipment',
  'Accessories',
  'Storage',
  'Networking',
];

// Stock status colors
export const STOCK_STATUS_COLORS = {
  Critical: 'red',
  Low: 'yellow',
  Normal: 'green',
};

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  INVENTORY: '/inventory',
  DASHBOARD: '/dashboard',
};