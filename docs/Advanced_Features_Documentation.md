# SCM Portal - Advanced Database Features Documentation

## Overview

This document describes all triggers, stored procedures, and functions implemented in the SCM Portal database system.

---

## 1. TRIGGERS

### 1.1 Update Order Total on Order Line Changes

**Name:** `trg_update_order_total_insert`, `trg_update_order_total_update`, `trg_update_order_total_delete`

**Purpose:** Automatically recalculates order total when order lines are added, modified, or removed.

**Tables Affected:** `order`, `order_line`

**Execution:** AFTER INSERT/UPDATE/DELETE on `order_line`

**Example:**

```sql
INSERT INTO order_line (order_id, product_id, quantity, price)
VALUES (1, 5, 2, 28500.00);
-- Order total automatically updates to include new line item
```

### 1.2 Auto-Create Transaction on Payment Completion

**Name:** `trg_create_transaction_on_payment`

**Purpose:** Automatically logs a transaction record when payment status changes to 'Completed'.

**Tables Affected:** `payment`, `transaction`

**Execution:** AFTER INSERT/UPDATE on `payment`

**Example:**

```sql
UPDATE payment SET status = 'Completed' WHERE payment_id = 5;
-- Transaction record automatically created
```

### 1.3 Update Order Status on Shipment Change

**Name:** `trg_update_order_status_on_shipment`

**Purpose:** Synchronizes order status with shipment status (In Transit → Shipped, Delivered → Delivered).

**Tables Affected:** `order`, `shipment`

**Execution:** AFTER UPDATE on `shipment`

**Example:**

```sql
UPDATE shipment SET status = 'In Transit' WHERE shipment_id = 3;
-- Order status automatically changes to 'Shipped'
```

### 1.4 Low Inventory Alert Logger

**Name:** `trg_check_low_inventory`

**Purpose:** Logs alerts when inventory falls below reorder level.

**Tables Affected:** `inventory`, `inventory_alert_log`

**Execution:** AFTER UPDATE on `inventory`

**Example:**

```sql
UPDATE inventory SET quantity = 5 WHERE product_id = 1 AND warehouse_id = 1;
-- Alert logged if 5 is below reorder level
```

### 1.5 Inventory Reduction on Order (PostgreSQL only)

**Name:** `trg_update_inventory_on_order`

**Purpose:** Automatically reduces inventory when order line is created.

**Tables Affected:** `inventory`, `order_line`

**Execution:** AFTER INSERT on `order_line`

---

## 2. STORED PROCEDURES

### 2.1 Place Order

**Name:** `place_order`

**Parameters:**

- IN: `p_customer_id` (INT) - Customer placing the order
- IN: `p_priority` (VARCHAR) - Order priority (Low/Medium/High)
- OUT: `p_order_id` (INT) - Generated order ID

**Purpose:** Creates a new order for a customer.

**Usage:**

```sql
-- PostgreSQL
CALL place_order(3, 'High', v_order_id);

-- MySQL
CALL place_order(3, 'High', @order_id);
SELECT @order_id;
```

### 2.2 Add Order Item

**Name:** `add_order_item`

**Parameters:**

- IN: `p_order_id` (INT) - Target order
- IN: `p_product_id` (INT) - Product to add
- IN: `p_quantity` (INT) - Quantity to order

**Purpose:** Adds a product line item to an existing order with inventory validation.

**Usage:**

```sql
CALL add_order_item(15, 1, 2);  -- Add 2 units of product 1 to order 15
```

### 2.3 Process Payment

**Name:** `process_payment`

**Parameters:**

- IN: `p_order_id` (INT) - Order to pay for
- IN: `p_amount` (DECIMAL) - Payment amount
- IN: `p_method` (VARCHAR) - Payment method
- OUT: `p_payment_id` (INT) - Generated payment ID
- OUT: `p_status` (VARCHAR) - Payment status

**Purpose:** Records payment and updates order status.

**Usage:**

```sql
-- PostgreSQL
CALL process_payment(15, 95000.00, 'UPI', v_payment_id, v_status);

-- MySQL
CALL process_payment(15, 95000.00, 'UPI', @payment_id, @status);
```

### 2.4 Create Shipment

**Name:** `create_shipment`

**Parameters:**

- IN: `p_order_id` (INT)
- IN: `p_carrier` (VARCHAR)
- IN: `p_company_id` (INT)
- IN: `p_estimated_days` (INT)
- OUT: `p_shipment_id` (INT)
- OUT: `p_tracking_number` (VARCHAR)

**Purpose:** Creates shipment with auto-generated tracking number.

**Usage:**

```sql
CALL create_shipment(15, 'BlueDart', 1, 5, @shipment_id, @tracking);
```

### 2.5 Get Customer Orders

**Name:** `get_customer_orders`

**Parameters:**

- IN: `p_customer_id` (INT)

**Purpose:** Retrieves complete order history for a customer.

**Usage:**

```sql
CALL get_customer_orders(1);
```

### 2.6 Update Inventory Quantity

**Name:** `update_inventory_qty`

**Parameters:**

- IN: `p_product_id` (INT)
- IN: `p_warehouse_id` (INT)
- IN: `p_quantity_change` (INT)
- IN: `p_operation` (VARCHAR) - 'ADD' or 'SUBTRACT'

**Purpose:** Safely modifies inventory levels with validation.

**Usage:**

```sql
CALL update_inventory_qty(1, 1, 50, 'ADD');      -- Add 50 units
CALL update_inventory_qty(1, 1, 10, 'SUBTRACT'); -- Remove 10 units
```

### 2.7 Get Low Stock Report (MySQL only)

**Name:** `get_low_stock_report`

**Purpose:** Returns all products below reorder level with reorder costs.

**Usage:**

```sql
CALL get_low_stock_report();
```

### 2.8 Get Revenue Report (MySQL only)

**Name:** `get_revenue_report`

**Parameters:**

- IN: `p_start_date` (DATE)
- IN: `p_end_date` (DATE)

**Purpose:** Generates daily revenue summary for date range.

**Usage:**

```sql
CALL get_revenue_report('2024-10-01', '2024-10-31');
```

---

## 3. FUNCTIONS

### 3.1 Calculate Order Total

**Name:** `calculate_order_total`

**Parameters:** `p_order_id` (INT)

**Returns:** DECIMAL(10,2)

**Purpose:** Calculates sum of all line items for an order.

**Usage:**

```sql
SELECT calculate_order_total(1) AS order_total;
```

### 3.2 Get Available Inventory

**Name:** `get_available_inventory`

**Parameters:** `p_product_id` (INT)

**Returns:** INT

**Purpose:** Returns total quantity available across all warehouses.

**Usage:**

```sql
SELECT get_available_inventory(5) AS total_stock;
```

### 3.3 Check Product Availability

**Name:** `check_product_availability`

**Parameters:**

- `p_product_id` (INT)
- `p_required_qty` (INT)

**Returns:** BOOLEAN

**Purpose:** Validates if sufficient stock exists for order.

**Usage:**

```sql
SELECT check_product_availability(1, 10) AS can_fulfill;
```

### 3.4 Get Customer Lifetime Value

**Name:** `get_customer_lifetime_value`

**Parameters:** `p_customer_id` (INT)

**Returns:** DECIMAL(10,2)

**Purpose:** Calculates total spending by customer (excluding cancelled orders).

**Usage:**

```sql
SELECT 
    c.name,
    get_customer_lifetime_value(c.customer_id) AS ltv
FROM customer c
ORDER BY ltv DESC;
```

### 3.5 Get Order Status Description

**Name:** `get_order_status_description`

**Parameters:** `p_order_id` (INT)

**Returns:** TEXT

**Purpose:** Returns human-readable order status description.

**Usage:**

```sql
SELECT get_order_status_description(5);
```

### 3.6 Calculate Warehouse Utilization

**Name:** `calculate_warehouse_utilization`

**Parameters:** `p_warehouse_id` (INT)

**Returns:** DECIMAL(5,2)

**Purpose:** Returns percentage of warehouse capacity in use.

**Usage:**

```sql
SELECT 
    w.name,
    calculate_warehouse_utilization(w.warehouse_id) || '%' AS utilization
FROM warehouse w;
```

### 3.7 Get Days Since Order

**Name:** `get_days_since_order`

**Parameters:** `p_order_id` (INT)

**Returns:** INT

**Purpose:** Calculates days elapsed since order was placed.

**Usage:**

```sql
SELECT 
    order_id,
    get_days_since_order(order_id) AS days_old
FROM "order"
WHERE status = 'Pending';
```

### 3.8 Get Product Sales Count

**Name:** `get_product_sales_count`

**Parameters:** `p_product_id` (INT)

**Returns:** INT

**Purpose:** Returns total units sold for a product.

**Usage:**

```sql
SELECT 
    p.name,
    get_product_sales_count(p.product_id) AS units_sold
FROM product p
ORDER BY units_sold DESC;
```

### 3.9 Is Customer VIP

**Name:** `is_customer_vip`

**Parameters:** `p_customer_id` (INT)

**Returns:** BOOLEAN

**Purpose:** Determines if customer qualifies as VIP (5+ orders OR ₹500k+ spent).

**Usage:**

```sql
SELECT 
    c.name,
    is_customer_vip(c.customer_id) AS vip_status
FROM customer c;
```

### 3.10 Get Supplier Performance Score

**Name:** `get_supplier_performance_score`

**Parameters:** `p_supplier_id` (INT)

**Returns:** DECIMAL(5,2)

**Purpose:** Calculates supplier score based on product availability and sales (0-100).

**Usage:**

```sql
SELECT 
    s.name,
    get_supplier_performance_score(s.supplier_id) AS score
FROM supplier s
ORDER BY score DESC;
```

---

## 4. Testing Results Summary

### Trigger Tests

✅ Order total updated automatically on line item changes
✅ Transactions created on payment completion
✅ Order status synchronized with shipment status
✅ Low inventory alerts logged correctly
✅ Inventory reduced on order placement

### Procedure Tests

✅ Orders created successfully with place_order
✅ Items added with inventory validation
✅ Payments processed with status updates
✅ Shipments created with tracking numbers
✅ Customer order history retrieved accurately
✅ Inventory updates with ADD/SUBTRACT operations

### Function Tests

✅ Order totals calculated correctly
✅ Inventory availability checks working
✅ Customer lifetime values accurate
✅ Warehouse utilization percentages correct
✅ VIP customer identification working
✅ Supplier performance scores calculated

---

## 5. Performance Considerations

- All functions are deterministic for consistent results
- Indexes support foreign key lookups in procedures
- Triggers use efficient UPDATE statements
- Functions avoid complex joins where possible
- Procedures validate data before modifications

---

## 6. Error Handling

All procedures and functions include:

- NULL value checks
- Data validation
- Constraint violation prevention
- Meaningful error messages
- Transaction rollback on failures (where applicable)

---

## Conclusion

These 5 triggers, 8 procedures, and 10 functions provide comprehensive automation and business logic enforcement for the SCM Portal database system.
