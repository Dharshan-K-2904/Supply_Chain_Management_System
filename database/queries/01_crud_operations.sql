-- PostgreSQL: \c scm_portal
-- MySQL: USE scm_portal;

-- ============================================
-- CREATE Operations (INSERT)
-- ============================================

-- 1. Add a new customer
INSERT INTO customer (name, address, email, phone_number, company_id)
VALUES ('Arjun Kapoor', '909 Brigade Road, Bangalore', 'arjun.kapoor@email.com', '+91-9123456789', 3);

-- Verify insertion
SELECT * FROM customer WHERE email = 'arjun.kapoor@email.com';

-- 2. Add a new product
INSERT INTO product (name, description, category, unit_price, manufacturer, availability, supplier_id)
VALUES ('MacBook Pro 16', '16-inch, M3 Pro chip, 32GB RAM, 1TB SSD', 'Electronics', 249900.00, 'Apple Inc', TRUE, 1);

-- Verify
SELECT product_id, name, unit_price FROM product WHERE name LIKE 'MacBook%';

-- 3. Add inventory for the new product
INSERT INTO inventory (product_id, warehouse_id, quantity, reorder_level)
VALUES (
    (SELECT product_id FROM product WHERE name = 'MacBook Pro 16'),
    1,  -- Bangalore warehouse
    15,
    5
);


-- ============================================
-- READ Operations (SELECT)
-- ============================================

-- 1. List all products with their suppliers
SELECT 
    p.product_id,
    p.name AS product_name,
    p.category,
    p.unit_price,
    s.name AS supplier_name
FROM product p
JOIN supplier s ON p.supplier_id = s.supplier_id
ORDER BY p.category, p.name;

-- 2. Get customer order history
SELECT 
    c.name AS customer_name,
    o.order_id,
    o.date,
    o.total_amount,
    o.status,
    o.priority
FROM "order" o  -- MySQL: use `order`
JOIN customer c ON o.customer_id = c.customer_id
WHERE c.name = 'Rajesh Kumar'
ORDER BY o.date DESC;

-- 3. Check inventory levels with reorder alerts
SELECT 
    p.name AS product_name,
    w.name AS warehouse_name,
    i.quantity AS current_stock,
    i.reorder_level,
    CASE 
        WHEN i.quantity <= i.reorder_level THEN 'REORDER NEEDED'
        WHEN i.quantity <= i.reorder_level * 2 THEN 'Low Stock'
        ELSE 'OK'
    END AS stock_status
FROM inventory i
JOIN product p ON i.product_id = p.product_id
JOIN warehouse w ON i.warehouse_id = w.warehouse_id
ORDER BY 
    CASE 
        WHEN i.quantity <= i.reorder_level THEN 1
        WHEN i.quantity <= i.reorder_level * 2 THEN 2
        ELSE 3
    END,
    i.quantity ASC;

-- 4. Get detailed order information with line items
SELECT 
    o.order_id,
    o.date,
    c.name AS customer_name,
    p.name AS product_name,
    ol.quantity,
    ol.price,
    (ol.quantity * ol.price) AS line_total
FROM "order" o  -- MySQL: use `order`
JOIN customer c ON o.customer_id = c.customer_id
JOIN order_line ol ON o.order_id = ol.order_id
JOIN product p ON ol.product_id = p.product_id
WHERE o.order_id = 1;

-- 5. Track shipment status
SELECT 
    s.shipment_id,
    s.tracking_number,
    o.order_id,
    c.name AS customer_name,
    s.status AS shipment_status,
    s.carrier,
    s.estimated_arrival,
    s.actual_arrival,
    CASE 
        WHEN s.actual_arrival IS NOT NULL THEN 'Delivered'
        WHEN s.estimated_arrival < CURRENT_DATE THEN 'Delayed'
        ELSE 'On Time'
    END AS delivery_status
FROM shipment s
JOIN "order" o ON s.order_id = o.order_id  -- MySQL: use `order`
JOIN customer c ON o.customer_id = c.customer_id;


-- ============================================
-- UPDATE Operations
-- ============================================

-- 1. Update order status to 'Shipped'
UPDATE "order"  -- MySQL: use `order`
SET status = 'Shipped'
WHERE order_id = 5;

-- Verify
SELECT order_id, status FROM "order" WHERE order_id = 5;  -- MySQL: use `order`

-- 2. Update inventory after order (reduce stock)
UPDATE inventory
SET quantity = quantity - 2,
    last_updated = CURRENT_TIMESTAMP
WHERE product_id = 1 AND warehouse_id = 1;

-- Verify
SELECT * FROM inventory WHERE product_id = 1 AND warehouse_id = 1;

-- 3. Update product price
UPDATE product
SET unit_price = 89900.00
WHERE product_id = 1;

-- Verify
SELECT product_id, name, unit_price FROM product WHERE product_id = 1;

-- 4. Update payment status
UPDATE payment
SET status = 'Completed',
    payment_date = CURRENT_TIMESTAMP
WHERE payment_id = 5;

-- Verify
SELECT payment_id, order_id, status, payment_date FROM payment WHERE payment_id = 5;

-- 5. Update shipment with actual arrival
UPDATE shipment
SET status = 'Delivered',
    actual_arrival = CURRENT_DATE
WHERE shipment_id = 3;

-- Verify
SELECT * FROM shipment WHERE shipment_id = 3;


-- ============================================
-- DELETE Operations
-- ============================================

-- 1. Delete a specific order line (should cascade properly)
DELETE FROM order_line
WHERE orderline_id = 13;  -- Adjust ID as needed

-- Verify deletion
SELECT * FROM order_line WHERE orderline_id = 13;

-- 2. Delete a customer (will fail if they have orders due to RESTRICT)
-- First check if customer has orders
SELECT COUNT(*) FROM "order" WHERE customer_id = 9;  -- MySQL: use `order`

-- If no orders, delete will succeed
DELETE FROM customer WHERE customer_id = 9;

-- 3. Remove old/cancelled orders (and related data will cascade)
DELETE FROM "order"  -- MySQL: use `order`
WHERE status = 'Cancelled' 
  AND date < CURRENT_DATE - INTERVAL '90 days';

-- 4. Clean up old transactions (older than 1 year)
DELETE FROM transaction
WHERE date < CURRENT_DATE - INTERVAL '365 days';


-- ============================================
-- Complex Queries for Testing
-- ============================================

-- 1. Revenue by product category
SELECT 
    p.category,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(ol.quantity) AS total_units_sold,
    SUM(ol.quantity * ol.price) AS total_revenue
FROM order_line ol
JOIN product p ON ol.product_id = p.product_id
JOIN "order" o ON ol.order_id = o.order_id  -- MySQL: use `order`
WHERE o.status IN ('Shipped', 'Delivered')
GROUP BY p.category
ORDER BY total_revenue DESC;

-- 2. Top customers by spending
SELECT 
    c.customer_id,
    c.name,
    c.email,
    COUNT(o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_spent
FROM customer c
JOIN "order" o ON c.customer_id = o.customer_id  -- MySQL: use `order`
WHERE o.status != 'Cancelled'
GROUP BY c.customer_id, c.name, c.email
ORDER BY total_spent DESC
LIMIT 5;

-- 3. Warehouse utilization
SELECT 
    w.warehouse_id,
    w.name AS warehouse_name,
    w.capacity,
    SUM(i.quantity) AS total_items_stored,
    ROUND((SUM(i.quantity)::DECIMAL / w.capacity) * 100, 2) AS utilization_percent  -- MySQL: use CAST instead of ::
FROM warehouse w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
GROUP BY w.warehouse_id, w.name, w.capacity
ORDER BY utilization_percent DESC;

-- 4. Pending payments report
SELECT 
    p.payment_id,
    o.order_id,
    c.name AS customer_name,
    c.email,
    o.total_amount,
    p.status,
    o.date AS order_date,
    CURRENT_DATE - o.date::DATE AS days_pending  -- MySQL: use DATEDIFF(CURRENT_DATE, DATE(o.date))
FROM payment p
JOIN "order" o ON p.order_id = o.order_id  -- MySQL: use `order`
JOIN customer c ON o.customer_id = c.customer_id
WHERE p.status = 'Pending'
ORDER BY days_pending DESC;

-- 5. Supplier performance (products sold)
SELECT 
    s.supplier_id,
    s.name AS supplier_name,
    COUNT(DISTINCT p.product_id) AS products_supplied,
    COUNT(ol.orderline_id) AS total_orders,
    SUM(ol.quantity) AS total_units_sold,
    SUM(ol.quantity * ol.price) AS total_revenue
FROM supplier s
JOIN product p ON s.supplier_id = p.supplier_id
LEFT JOIN order_line ol ON p.product_id = ol.product_id
GROUP BY s.supplier_id, s.name
ORDER BY total_revenue DESC;

SELECT 'CRUD operations completed successfully!' AS result;