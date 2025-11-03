# Supply Chain Management Portal - User Requirements

## 1. Project Overview

A comprehensive database-driven supply chain management system to handle end-to-end operations including suppliers, inventory, orders, shipments, and payments.

## 2. System Scope

- Multi-company supply chain management
- Real-time inventory tracking across warehouses
- Order processing and fulfillment
- Shipment tracking with carrier integration
- Payment processing and transaction logging
- Role-based access control

## 3. Functional Requirements

### FR-1: Company Management

- CRUD operations for company profiles
- Support multiple business types (Manufacturer, Distributor, Retailer)
- Manage relationships with suppliers, customers, and warehouses

### FR-2: Supplier Management

- Register and maintain supplier information
- Link suppliers to companies and products
- Track supplier contact details and performance

### FR-3: Customer Management

- Customer registration with unique email validation
- Profile management (address, contact details)
- Order history tracking

### FR-4: Warehouse Management

- Multiple warehouse locations per company
- Capacity tracking and utilization
- Location-based inventory management

### FR-5: Product Catalog

- Comprehensive product information (name, description, category)
- Pricing and availability status
- Supplier and manufacturer linkage

### FR-6: Inventory Management

- Real-time stock levels per warehouse
- Automatic reorder level alerts
- Stock-out prevention mechanisms

### FR-7: Order Processing

- Customer order placement
- Multi-item orders with line items
- Order status tracking (Pending → Processing → Shipped → Delivered)
- Priority handling (Low/Medium/High)
- Automatic total calculation

### FR-8: Shipment Tracking

- Shipment creation from orders
- Carrier information and tracking numbers
- Estimated and actual delivery dates
- Status updates (Preparing → In Transit → Delivered)

### FR-9: Payment Management

- Multiple payment methods (Credit Card, UPI, Net Banking, etc.)
- Payment status tracking
- Failed payment handling

### FR-10: Transaction Logging

- Automatic audit trail for all payments
- Financial reconciliation support
- Transaction history with remarks

### FR-11: Data Integrity

- Foreign key constraints to maintain relationships
- Check constraints for valid data ranges
- Unique constraints to prevent duplicates
- Cascading deletes for dependent records

### FR-12: Performance Requirements

- Index key columns for fast queries
- Support for concurrent transactions
- Query response time < 2 seconds for standard operations

## 4. Business Rules

1. **Inventory Rule**: Cannot place order if product quantity exceeds available inventory
2. **Payment Rule**: Order can only ship after successful payment
3. **Reorder Alert**: System alerts when inventory falls below reorder level
4. **Shipment Rule**: One shipment per order (1:1 relationship)
5. **Order Total**: Must match sum of all order line items
6. **Customer Email**: Must be unique across the system
7. **Warehouse Capacity**: Cannot exceed defined limits .
