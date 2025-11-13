-- ============================================
-- 7. 04_create_views.sql (FINAL ERROR-FREE VERSION)
-- FIXES: Corrected all missing column references in ORDER BY clauses.
-- ============================================
USE scm_portal;

-- 1. vw_DetailedOrderSummary (Comprehensive Join Query)
DROP VIEW IF EXISTS vw_DetailedOrderSummary;
CREATE VIEW vw_DetailedOrderSummary AS
SELECT
    O.order_id, O.date AS order_date, O.status AS order_status,
    C.name AS customer_name, C.email AS customer_email, P.name AS product_name, 
    P.category AS product_category, OL.quantity, OL.price AS unit_price_at_order, 
    (OL.quantity * OL.price) AS line_total
FROM `order` O 
JOIN customer C ON O.customer_id = C.customer_id
JOIN order_line OL ON O.order_id = OL.order_id
JOIN product P ON OL.product_id = P.product_id;


-- 2. vw_InventoryStatusAlerts (CRITICAL FIX: Removed crashing 'severity' column)
DROP VIEW IF EXISTS vw_InventoryStatusAlerts;
CREATE VIEW vw_InventoryStatusAlerts AS
SELECT
    IAL.alert_id, P.name AS product_name, W.name AS warehouse_name,
    I.quantity AS current_stock, I.reorder_level, IAL.alert_date, 
    'REORDER URGENT' AS status_alert
FROM inventory_alert_log IAL
JOIN product P ON IAL.product_id = P.product_id
JOIN warehouse W ON IAL.warehouse_id = W.warehouse_id
JOIN inventory I ON IAL.product_id = I.product_id AND IAL.warehouse_id = W.warehouse_id
ORDER BY IAL.alert_date DESC; -- FIXED: Using safe, existing 'alert_date' column for ordering


-- 3. vw_SupplierProductList (Supplier Report View)
DROP VIEW IF EXISTS vw_SupplierProductList;
CREATE VIEW vw_SupplierProductList AS
SELECT
    S.supplier_id,
    S.name AS supplier_name,
    P.product_id,
    P.name AS product_name,
    P.unit_price,
    P.category,
    P.availability,
    SUM(I.quantity) AS total_inventory_stock
FROM supplier S
JOIN product P ON S.supplier_id = P.supplier_id
LEFT JOIN inventory I ON P.product_id = I.product_id
GROUP BY S.supplier_id, S.name, P.product_id, P.name, P.unit_price, P.category, P.availability
ORDER BY S.name, P.name;


-- 4. vw_ProductPriceAudit (CRITICAL FIX: Used correct column name 'change_date')
DROP VIEW IF EXISTS vw_ProductPriceAudit;
CREATE VIEW vw_ProductPriceAudit AS
SELECT
    PPH.history_id, 
    P.name AS product_name, 
    PPH.old_price, 
    PPH.new_price, 
    PPH.change_date, -- FIXED: This matches the DDL column name
    PPH.changed_by
FROM product_price_history PPH
JOIN product P ON PPH.product_id = P.product_id
ORDER BY PPH.change_date DESC; -- FIXED: Using the actual column name 'change_date'

SELECT 'Views created successfully!' AS result;