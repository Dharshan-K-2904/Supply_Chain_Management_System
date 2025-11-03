-- PostgreSQL: \c scm_portal
-- MySQL: USE scm_portal;

-- ============================================
-- Database Structure Verification
-- ============================================

-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'  -- PostgreSQL: 'public', MySQL: 'scm_portal'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check row counts in all tables
SELECT 'company' AS table_name, COUNT(*) AS row_count FROM company
UNION ALL
SELECT 'supplier', COUNT(*) FROM supplier
UNION ALL
SELECT 'customer', COUNT(*) FROM customer
UNION ALL
SELECT 'warehouse', COUNT(*) FROM warehouse
UNION ALL
SELECT 'product', COUNT(*) FROM product
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'order', COUNT(*) FROM "order"  -- MySQL: use `order`
UNION ALL
SELECT 'order_line', COUNT(*) FROM order_line
UNION ALL
SELECT 'shipment', COUNT(*) FROM shipment
UNION ALL
SELECT 'payment', COUNT(*) FROM payment
UNION ALL
SELECT 'transaction', COUNT(*) FROM transaction;

-- 3. Verify foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'  -- PostgreSQL: 'public', MySQL: 'scm_portal'
ORDER BY tc.table_name, tc.constraint_name;

-- 4. Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'  -- PostgreSQL only
ORDER BY tablename, indexname;

-- MySQL equivalent:
/*
SHOW INDEX FROM company;
SHOW INDEX FROM supplier;
SHOW INDEX FROM customer;
-- ... repeat for all tables
*/

-- ============================================
-- Data Integrity Checks
-- ============================================

-- 5. Check for orphaned records (should return 0)
-- Suppliers without companies
SELECT COUNT(*) AS orphaned_suppliers
FROM supplier s
LEFT JOIN company c ON s.company_id = c.company_id
WHERE c.company_id IS NULL;

-- Products without suppliers
SELECT COUNT(*) AS orphaned_products
FROM product p
LEFT JOIN supplier s ON p.supplier_id = s.supplier_id
WHERE s.supplier_id IS NULL;

-- Orders without customers
SELECT COUNT(*) AS orphaned_orders
FROM "order" o  -- MySQL: use `order`
LEFT JOIN customer c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

-- 6. Check for duplicate emails in customers (should return 0)
SELECT email, COUNT(*) AS duplicate_count
FROM customer
GROUP BY email
HAVING COUNT(*) > 1;

-- 7. Check for negative inventory (should return 0)
SELECT 
    p.name AS product_name,
    w.name AS warehouse_name,
    i.quantity
FROM inventory i
JOIN product p ON i.product_id = p.product_id
JOIN warehouse w ON i.warehouse_id = w.warehouse_id
WHERE i.quantity < 0;

-- 8. Verify order totals match order line sums
SELECT 
    o.order_id,
    o.total_amount AS recorded_total,
    SUM(ol.quantity * ol.price) AS calculated_total,
    o.total_amount - SUM(ol.quantity * ol.price) AS difference
FROM "order" o  -- MySQL: use `order`
JOIN order_line ol ON o.order_id = ol.order_id
GROUP BY o.order_id, o.total_amount
HAVING ABS(o.total_amount - SUM(ol.quantity * ol.price)) > 0.01;  -- Allow for rounding

-- 9. Check payment amounts match order amounts
SELECT 
    o.order_id,
    o.total_amount AS order_total,
    SUM(p.amount) AS payment_total,
    o.total_amount - SUM(p.amount) AS difference
FROM "order" o  -- MySQL: use `order`
LEFT JOIN payment p ON o.order_id = p.order_id
GROUP BY o.order_id, o.total_amount
HAVING SUM(p.amount) IS NOT NULL 
   AND ABS(o.total_amount - SUM(p.amount)) > 0.01;


-- ============================================
-- Business Logic Verification
-- ============================================

-- 10. Orders with status 'Shipped' should have shipments
SELECT 
    o.order_id,
    o.status,
    s.shipment_id,
    CASE 
        WHEN s.shipment_id IS NULL THEN 'MISSING SHIPMENT'
        ELSE 'OK'
    END AS validation_status
FROM "order" o  -- MySQL: use `order`
LEFT JOIN shipment s ON o.order_id = s.order_id
WHERE o.status IN ('Shipped', 'Delivered');

-- 11. Check for completed payments with pending orders
SELECT 
    o.order_id,
    o.status AS order_status,
    p.payment_id,
    p.status AS payment_status
FROM "order" o  -- MySQL: use `order`
JOIN payment p ON o.order_id = p.order_id
WHERE p.status = 'Completed' AND o.status = 'Pending';

-- 12. Inventory below reorder level (alerts needed)
SELECT 
    p.product_id,
    p.name AS product_name,
    w.name AS warehouse_name,
    i.quantity AS current_stock,
    i.reorder_level,
    i.reorder_level - i.quantity AS units_below_threshold
FROM inventory i
JOIN product p ON i.product_id = p.product_id
JOIN warehouse w ON i.warehouse_id = w.warehouse_id
WHERE i.quantity <= i.reorder_level
ORDER BY units_below_threshold DESC;

-- 13. Check for shipments with actual arrival before estimated
SELECT 
    shipment_id,
    order_id,
    tracking_number,
    estimated_arrival,
    actual_arrival,
    actual_arrival - estimated_arrival AS days_difference
FROM shipment
WHERE actual_arrival IS NOT NULL 
  AND actual_arrival < estimated_arrival;


-- ============================================
-- Performance Statistics
-- ============================================

-- 14. Table sizes (PostgreSQL)
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- MySQL equivalent:
/*
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'scm_portal'
ORDER BY (data_length + index_length) DESC;
*/

-- 15. Most active customers (by order count)
SELECT 
    c.customer_id,
    c.name,
    c.email,
    COUNT(o.order_id) AS order_count,
    SUM(o.total_amount) AS lifetime_value
FROM customer c
LEFT JOIN "order" o ON c.customer_id = o.customer_id  -- MySQL: use `order`
GROUP BY c.customer_id, c.name, c.email
ORDER BY order_count DESC, lifetime_value DESC
LIMIT 10;

-- 16. Product popularity (by units sold)
SELECT 
    p.product_id,
    p.name,
    p.category,
    COALESCE(SUM(ol.quantity), 0) AS units_sold,
    COALESCE(COUNT(DISTINCT ol.order_id), 0) AS orders_count
FROM product p
LEFT JOIN order_line ol ON p.product_id = ol.product_id
GROUP BY p.product_id, p.name, p.category
ORDER BY units_sold DESC
LIMIT 10;

-- 17. Average order value by status
SELECT 
    status,
    COUNT(*) AS order_count,
    AVG(total_amount) AS avg_order_value,
    MIN(total_amount) AS min_order_value,
    MAX(total_amount) AS max_order_value
FROM "order"  -- MySQL: use `order`
GROUP BY status
ORDER BY avg_order_value DESC;


-- ============================================
-- Summary Report
-- ============================================

-- 18. Database health summary
SELECT 
    'Total Companies' AS metric, COUNT(*)::TEXT AS value FROM company
UNION ALL
SELECT 'Total Suppliers', COUNT(*)::TEXT FROM supplier
UNION ALL
SELECT 'Total Customers', COUNT(*)::TEXT FROM customer
UNION ALL
SELECT 'Total Products', COUNT(*)::TEXT FROM product
UNION ALL
SELECT 'Total Warehouses', COUNT(*)::TEXT FROM warehouse
UNION ALL
SELECT 'Total Orders', COUNT(*)::TEXT FROM "order"  -- MySQL: use `order`
UNION ALL
SELECT 'Pending Orders', COUNT(*)::TEXT FROM "order" WHERE status = 'Pending'
UNION ALL
SELECT 'Completed Orders', COUNT(*)::TEXT FROM "order" WHERE status = 'Delivered'
UNION ALL
SELECT 'Total Revenue', TO_CHAR(SUM(total_amount), 'FM999,999,999.00') 
    FROM "order" WHERE status != 'Cancelled'  -- MySQL: use FORMAT()
UNION ALL
SELECT 'Pending Payments', COUNT(*)::TEXT FROM payment WHERE status = 'Pending'
UNION ALL
SELECT 'Active Shipments', COUNT(*)::TEXT FROM shipment WHERE status != 'Delivered';

SELECT 'Verification queries completed!' AS result;

