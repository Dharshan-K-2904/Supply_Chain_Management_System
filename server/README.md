# SCM Portal API Documentation

## Base URL

```link
<http://localhost:5000/api>

```

## Endpoints

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products/category/:category` - Get products by category
- `GET /products/low-stock` - Get low stock products
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders

- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID with details
- `GET /orders/customer/:customerId` - Get customer orders
- `GET /orders/statistics` - Get order statistics
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status

### Customers

- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `GET /customers/vip` - Get VIP customers
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Inventory

- `GET /inventory` - Get all inventory
- `GET /inventory/warehouse/:warehouseId` - Get inventory by warehouse
- `GET /inventory/product/:productId` - Get inventory by product
- `GET /inventory/low-stock` - Get low stock items
- `GET /inventory/alerts` - Get inventory alerts
- `GET /inventory/warehouse-summary` - Get warehouse summary
- `POST /inventory` - Create inventory record
- `PUT /inventory` - Update inventory

### Dashboard

- `GET /dashboard` - Get complete dashboard data
- `GET /dashboard/stats` - Get overall statistics
- `GET /dashboard/recent-orders` - Get recent orders
- `GET /dashboard/top-products` - Get top selling products
- `GET /dashboard/top-customers` - Get top customers
- `GET /dashboard/revenue-by-category` - Get revenue by category
- `GET /dashboard/order-status-distribution` - Get order status distribution
- `GET /dashboard/daily-revenue` - Get daily revenue
- `GET /dashboard/warehouse-efficiency` - Get warehouse efficiency
- `GET /dashboard/pending-payments` - Get pending payments

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "count": 10,  // For array responses
  "message": "Success message"  // For mutations
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```
