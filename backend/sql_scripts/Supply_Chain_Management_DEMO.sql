-- =====================================================
-- 4_Supply_Chain_Demo_Outputs.sql (MySQL 8.x • Testing & Demo)
-- =====================================================
USE supply_chain_db;

-- ------------------------------------------------------------------------------
-- A. COMPLEX QUERY DEMONSTRATION
-- ------------------------------------------------------------------------------

-- 1. Aggregate Query: Top 3 Product Categories by Total Revenue
SELECT '--- TEST A.1: Top 3 Product Categories by Revenue ---' AS COMMENT;
SELECT
    P.category,
    COUNT(DISTINCT O.order_id) AS total_orders,
    SUM(OL.quantity * OL.price) AS total_revenue
FROM orders O
JOIN order_line OL ON O.order_id = OL.order_id
JOIN product P ON OL.product_id = P.product_id
GROUP BY P.category
ORDER BY total_revenue DESC
LIMIT 3;

-- 2. Correlated Subquery: Customers who have placed an order exceeding ₹20,000
SELECT '--- TEST A.2: Customers with Large Orders (> ₹20,000) ---' AS COMMENT;
SELECT 
    C.name AS customer_name,
    C.email,
    O.order_id,
    O.total_amount
FROM customer C
JOIN orders O ON C.customer_id = O.customer_id
WHERE O.total_amount > 20000.00
AND EXISTS (
    SELECT 1 
    FROM payment P 
    WHERE P.order_id = O.order_id AND P.status = 'SUCCESS'
);

-- 3. Inventory Stock Value Calculation (Using the User-Defined Function)
SELECT '--- TEST A.3: Warehouse Value using fn_CalculateWarehouseValue ---' AS COMMENT;
SELECT
    W.name AS warehouse_name,
    fn_CalculateWarehouseValue(W.warehouse_id) AS total_stock_value_inr
FROM warehouse W
ORDER BY total_stock_value_inr DESC;


-- ------------------------------------------------------------------------------
-- B. STORED PROCEDURE EXECUTION & CRUD TESTING
-- ------------------------------------------------------------------------------

-- Test 1: sp_GetOrderDetails (CRUD - Read)
SELECT '--- TEST B.1: Order Details (Order ID 1) ---' AS COMMENT;
CALL sp_GetOrderDetails(1);


-- Test 2: sp_AddItemToOrder (CRUD - Update & Trigger Demonstration)
-- This test validates trg_OrderLine_AI/AU, which recalculates order total automatically.
SELECT '--- TEST B.2A: Order 2 Total BEFORE Addition ---' AS COMMENT;
SELECT total_amount FROM orders WHERE order_id = 2;

SELECT '--- TEST B.2B: Adding Item (Product 3) to Order 2 ---' AS COMMENT;
CALL sp_AddItemToOrder(2, 3, 1); -- Add 1 unit of Product ID 3

SELECT '--- TEST B.2C: Order 2 Total AFTER Addition (CHECK TRIGGER: Total should increase) ---' AS COMMENT;
SELECT total_amount FROM orders WHERE order_id = 2;


-- Test 3: sp_GetLowStockItems (Complex Filter/Report)
SELECT '--- TEST B.3: Low Stock Items in Warehouse ID 4 ---' AS COMMENT;
CALL sp_GetLowStockItems(4);


-- Test 4: sp_ProcessNewOrder (Transactional Procedure - CRUD Create)
-- Creates Order 5, Shipment 5, Payment 5, and Transaction Log 5 in one guaranteed transaction.
SELECT '--- TEST B.4A: Processing New Transactional Order ---' AS COMMENT;
CALL sp_ProcessNewOrder(
    3,              -- Customer ID 3 (Omicron)
    5000.00,        -- Total Amount
    'FastTrack Shipping',
    'CARD'
);
SELECT '--- TEST B.4B: Verifying New Order (ID 5) Creation ---' AS COMMENT;
SELECT order_id, customer_id, total_amount, status FROM orders WHERE order_id = LAST_INSERT_ID();


-- ------------------------------------------------------------------------------
-- C. TRIGGER DEMONSTRATION (Inventory Update on Completion)
-- ------------------------------------------------------------------------------

-- Test 5: Demonstrate Inventory Decrement Trigger (trg_Inventory_Update_After_Completion)
-- Initial Inventory for Product 1 in Order 1: 250 units.
-- Order 1 contains 2 units of Product 1.

SELECT '--- TEST C.1: Inventory for Product 1 BEFORE Completion ---' AS COMMENT;
SELECT product_id, quantity FROM inventory WHERE product_id = 1;

-- 1. Update Order 1 status to COMPLETED (Activates Trigger)
SELECT '--- TEST C.2: Updating Order 1 to COMPLETED (INVENTORY WILL DECREMENT BY 2) ---' AS COMMENT;
UPDATE orders SET status = 'COMPLETED' WHERE order_id = 1;

SELECT '--- TEST C.3: Inventory for Product 1 AFTER Completion (Should be 248) ---' AS COMMENT;
SELECT product_id, quantity FROM inventory WHERE product_id = 1;
-- The Audit log should confirm the transaction.
SELECT * FROM logs WHERE action = 'ORDER_FULFILLED' AND entity_id = 1;