-- =====================================================
-- 3_SCM_Portal_Advanced_Logic_Final.sql (MySQL 8.x)
-- Ultimate SQL Logic Layer for Supply Chain Management Portal
-- Updated: Finalized advanced features, fixes, and additions
-- =====================================================

USE scm_portal;

DELIMITER //

-- =====================================================
-- SECTION A: ADVANCED ANALYTICAL VIEWS
-- =====================================================

-- 1️⃣ Order Summary View (joins + computed columns)
CREATE OR REPLACE VIEW vw_DetailedOrderSummary AS
SELECT
    O.order_id,
    O.order_date,
    O.status AS order_status,
    O.total_amount,
    C.customer_id,
    C.name AS customer_name,
    CO.company_id AS customer_company_id,
    CO.name AS customer_company,
    OL.product_id,
    P.name AS product_name,
    P.category,
    OL.quantity,
    OL.price,
    (OL.quantity * OL.price) AS line_total,
    CASE 
        WHEN O.status IN ('NEW','PROCESSING') THEN 'Pending Fulfillment'
        WHEN O.status = 'SHIPPED' THEN 'On Route'
        WHEN O.status = 'COMPLETED' THEN 'Delivered'
        ELSE 'Unknown'
    END AS order_progress
FROM orders O
JOIN customer C ON O.customer_id = C.customer_id
LEFT JOIN company CO ON C.company_id = CO.company_id
JOIN order_line OL ON O.order_id = OL.order_id
JOIN product P ON OL.product_id = P.product_id;
//

-- 2️⃣ Recursive Company Hierarchy (WITH RECURSIVE)
-- returns company along with parent_company_id and parent_company_name where available
CREATE OR REPLACE VIEW vw_CompanyHierarchy AS
WITH RECURSIVE company_cte AS (
    -- base: root companies (no parent_id) OR manufacturers
    SELECT company_id, name, type, parent_company_id
    FROM company
    WHERE parent_company_id IS NULL
    UNION ALL
    SELECT c.company_id, c.name, c.type, c.parent_company_id
    FROM company c
    JOIN company_cte cc ON c.parent_company_id = cc.company_id
)
SELECT
    company_id,
    name,
    type,
    parent_company_id,
    (SELECT name FROM company WHERE company_id = company_cte.parent_company_id) AS parent_company_name
FROM company_cte;
//

-- 3️⃣ Top Suppliers (uses Window Functions)
CREATE OR REPLACE VIEW vw_TopSuppliers AS
SELECT
    S.supplier_id,
    S.name AS supplier_name,
    COUNT(PS.product_supplier_id) AS supplied_products,
    ROUND(AVG(PS.lead_time_days),2) AS avg_lead_time,
    RANK() OVER (ORDER BY COUNT(PS.product_supplier_id) DESC) AS rank_by_products
FROM supplier S
LEFT JOIN product_supplier PS ON S.supplier_id = PS.supplier_id
GROUP BY S.supplier_id;
//

-- 4️⃣ Monthly Sales Trend (Aggregation + GROUP BY ROLLUP)
CREATE OR REPLACE VIEW vw_SalesTrend AS
SELECT
    YEAR(order_date) AS order_year,
    MONTH(order_date) AS order_month_num,
    MONTHNAME(order_date) AS order_month,
    SUM(total_amount) AS total_sales
FROM orders
WHERE status IN ('SHIPPED','COMPLETED')
GROUP BY ROLLUP(YEAR(order_date), MONTH(order_date))
ORDER BY YEAR(order_date), MONTH(order_date);
//

-- 5️⃣ Inventory Status view (used by low stock reports)
CREATE OR REPLACE VIEW vw_InventoryStatus AS
SELECT
    I.warehouse_id,
    W.name AS warehouse_name,
    I.product_id,
    P.name AS product_name,
    I.quantity,
    I.reorder_level,
    CASE
        WHEN I.quantity IS NULL THEN 'UNKNOWN'
        WHEN I.quantity <= 0 THEN 'OUT OF STOCK'
        WHEN I.quantity <= I.reorder_level THEN 'REORDER NEEDED'
        ELSE 'SUFFICIENT'
    END AS stock_status
FROM inventory I
LEFT JOIN product P ON I.product_id = P.product_id
LEFT JOIN warehouse W ON I.warehouse_id = W.warehouse_id;
//

-- 6️⃣ Full-text product search view (requires fulltext index - see DDL section)
CREATE OR REPLACE VIEW vw_ProductSearch AS
SELECT product_id, name, category, description
FROM product
WHERE MATCH(name, description) AGAINST ('' IN NATURAL LANGUAGE MODE);
// (Note: The view can be used with a WHERE MATCH(...) AGAINST ('term') in queries.)

-- =====================================================
-- SECTION B: FUNCTIONS (fixed / hardened)
-- =====================================================

-- 1️⃣ Calculate Warehouse Value
DROP FUNCTION IF EXISTS fn_CalculateWarehouseValue //
CREATE FUNCTION fn_CalculateWarehouseValue(p_WarehouseID BIGINT)
RETURNS DECIMAL(18,2)
READS SQL DATA
BEGIN
    DECLARE v_Value DECIMAL(18,2);
    SELECT SUM(I.quantity * COALESCE(P.unit_price,0))
    INTO v_Value
    FROM inventory I
    JOIN product P ON I.product_id = P.product_id
    WHERE I.warehouse_id = p_WarehouseID;
    RETURN COALESCE(v_Value,0);
END //

-- 2️⃣ JSON Summary Generator (JSON_OBJECT + aggregation)
DROP FUNCTION IF EXISTS fn_GetInventoryJSON //
CREATE FUNCTION fn_GetInventoryJSON(p_WarehouseID BIGINT)
RETURNS JSON
READS SQL DATA
BEGIN
    DECLARE v_json JSON;
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'Product', P.name,
            'ProductID', P.product_id,
            'Quantity', COALESCE(I.quantity,0),
            'ReorderLevel', COALESCE(I.reorder_level,0),
            'Status', CASE WHEN COALESCE(I.quantity,0) <= COALESCE(I.reorder_level,0) THEN 'LOW' ELSE 'OK' END
        )
    ) INTO v_json
    FROM inventory I JOIN product P ON I.product_id = P.product_id
    WHERE I.warehouse_id = p_WarehouseID;
    RETURN COALESCE(v_json, JSON_ARRAY());
END //

-- 3️⃣ Revenue Growth Calculator (compares months) - robust for month=1 and division-by-zero
DROP FUNCTION IF EXISTS fn_RevenueGrowth //
CREATE FUNCTION fn_RevenueGrowth(p_Year INT, p_Month INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_this DECIMAL(18,2) DEFAULT 0;
    DECLARE v_last DECIMAL(18,2) DEFAULT 0;
    DECLARE growth DECIMAL(10,2) DEFAULT 0;
    DECLARE prev_year INT;
    DECLARE prev_month INT;

    SET prev_month = p_Month - 1;
    SET prev_year = p_Year;
    IF prev_month = 0 THEN
        SET prev_month = 12;
        SET prev_year = p_Year - 1;
    END IF;

    SELECT COALESCE(SUM(total_amount),0) INTO v_this
    FROM orders
    WHERE YEAR(order_date)=p_Year AND MONTH(order_date)=p_Month AND status IN ('SHIPPED','COMPLETED');

    SELECT COALESCE(SUM(total_amount),0) INTO v_last
    FROM orders
    WHERE YEAR(order_date)=prev_year AND MONTH(order_date)=prev_month AND status IN ('SHIPPED','COMPLETED');

    IF v_last = 0 THEN
        SET growth = NULL; -- indicates not computable (or could return 100.00 when v_this>0 depending on business rule)
    ELSE
        SET growth = ROUND(((v_this - v_last)/v_last)*100,2);
    END IF;

    RETURN COALESCE(growth,0);
END //

-- =====================================================
-- SECTION C: TRIGGERS (minor improvements & safe-guards)
-- =====================================================

-- helper to update order total (keeps same proc name)
DROP PROCEDURE IF EXISTS update_order_total_helper //
CREATE PROCEDURE update_order_total_helper(IN order_id_param BIGINT)
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * price),0)
        FROM order_line WHERE order_id = order_id_param
    )
    WHERE order_id = order_id_param;
END //

DROP TRIGGER IF EXISTS trg_OrderLine_AI //
CREATE TRIGGER trg_OrderLine_AI AFTER INSERT ON order_line
FOR EACH ROW BEGIN
    CALL update_order_total_helper(NEW.order_id);
END //

DROP TRIGGER IF EXISTS trg_OrderLine_AU //
CREATE TRIGGER trg_OrderLine_AU AFTER UPDATE ON order_line
FOR EACH ROW BEGIN
    IF OLD.quantity<>NEW.quantity OR OLD.price<>NEW.price THEN
        CALL update_order_total_helper(NEW.order_id);
    END IF;
END //

DROP TRIGGER IF EXISTS trg_OrderLine_AD //
CREATE TRIGGER trg_OrderLine_AD AFTER DELETE ON order_line
FOR EACH ROW BEGIN
    CALL update_order_total_helper(OLD.order_id);
END //

-- Audit price updates: uses logs table (assumed to exist)
DROP TRIGGER IF EXISTS trg_ProductPrice_Audit //
CREATE TRIGGER trg_ProductPrice_Audit AFTER UPDATE ON product
FOR EACH ROW BEGIN
    IF OLD.unit_price<>NEW.unit_price THEN
        INSERT INTO logs(entity,entity_id,action,remarks,created_at)
        VALUES('Product',NEW.product_id,'PRICE_CHANGE',
               CONCAT('Old ₹',OLD.unit_price,' → New ₹',NEW.unit_price), NOW());
    END IF;
END //

-- Dynamic inventory deduction on completion (cursor-based) with safety checks
DROP TRIGGER IF EXISTS trg_Inventory_Update_After_Completion //
CREATE TRIGGER trg_Inventory_Update_After_Completion
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_pid BIGINT;
    DECLARE v_qty INT;
    DECLARE cur CURSOR FOR SELECT product_id, quantity FROM order_line WHERE order_id=NEW.order_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    IF OLD.status<>'COMPLETED' AND NEW.status='COMPLETED' THEN
        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO v_pid, v_qty;
            IF done THEN LEAVE read_loop; END IF;
            -- Deduct from inventory: choose warehouse with available stock (simple example)
            UPDATE inventory
            SET quantity = GREATEST(quantity - v_qty, 0)
            WHERE product_id = v_pid
            ORDER BY quantity DESC
            LIMIT 1;
            INSERT INTO logs(entity,entity_id,action,remarks,created_at)
            VALUES('Inventory',v_pid,'ORDER_COMPLETED',
                   CONCAT('Reduced stock by ',v_qty,' (Order ',NEW.order_id,')'), NOW());
        END LOOP;
        CLOSE cur;
    END IF;
END //

-- =====================================================
-- SECTION D: STORED PROCEDURES (Transactional + Reports)
-- =====================================================

-- Get Order Details (multi-result)
DROP PROCEDURE IF EXISTS sp_GetOrderDetails //
CREATE PROCEDURE sp_GetOrderDetails(IN p_OrderID BIGINT)
BEGIN
    SELECT * FROM vw_DetailedOrderSummary WHERE order_id=p_OrderID;
    SELECT * FROM shipment WHERE order_id=p_OrderID;
    SELECT * FROM payment WHERE order_id=p_OrderID;
END //

-- Add Item to Order (auto total via trigger)
DROP PROCEDURE IF EXISTS sp_AddItemToOrder //
CREATE PROCEDURE sp_AddItemToOrder(IN p_OrderID BIGINT, IN p_ProductID BIGINT, IN p_Quantity INT)
BEGIN
    DECLARE v_Price DECIMAL(10,2);
    SELECT unit_price INTO v_Price FROM product WHERE product_id=p_ProductID;
    IF v_Price IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid Product';
    END IF;
    INSERT INTO order_line(order_id,product_id,quantity,price) VALUES(p_OrderID,p_ProductID,p_Quantity,v_Price);
END //

-- Process New Order (transaction-safe) - preserved & hardened
DROP PROCEDURE IF EXISTS sp_ProcessNewOrder //
CREATE PROCEDURE sp_ProcessNewOrder(
    IN p_CustomerID BIGINT,
    IN p_TotalAmount DECIMAL(12,2),
    IN p_ShipCarrier VARCHAR(255),
    IN p_PaymentMethod VARCHAR(20) -- make param VARCHAR to avoid target-DB ENUM mismatch
)
BEGIN
    DECLARE v_OrderID BIGINT DEFAULT 0;
    DECLARE v_PaymentID BIGINT DEFAULT 0;
    START TRANSACTION;
    INSERT INTO orders(customer_id,total_amount,priority,status,order_date)
      VALUES(p_CustomerID,p_TotalAmount,'Medium','NEW', NOW());
    SET v_OrderID = LAST_INSERT_ID();
    INSERT INTO shipment(order_id,carrier_company,status,estimated_arrival)
    VALUES(v_OrderID,p_ShipCarrier,'PENDING',DATE_ADD(NOW(),INTERVAL 5 DAY));
    INSERT INTO payment(order_id,method,amount,status)
    VALUES(v_OrderID,p_PaymentMethod,p_TotalAmount,'SUCCESS');
    SET v_PaymentID = LAST_INSERT_ID();
    INSERT INTO transaction_log(payment_id,type,amount,remarks,created_at)
    VALUES(v_PaymentID,'CREDIT',p_TotalAmount,CONCAT('Payment for Order ',v_OrderID), NOW());
    COMMIT;
    SELECT v_OrderID AS new_order_id,'Order created successfully' AS message;
END //

-- Low Stock Report
DROP PROCEDURE IF EXISTS sp_GetLowStockItems //
CREATE PROCEDURE sp_GetLowStockItems(IN p_WarehouseID BIGINT)
BEGIN
    SELECT * FROM vw_InventoryStatus WHERE warehouse_id=p_WarehouseID AND stock_status='REORDER NEEDED';
END //

-- Supplier Performance Ranking
DROP PROCEDURE IF EXISTS sp_GetTopSuppliers //
CREATE PROCEDURE sp_GetTopSuppliers()
BEGIN
    SELECT * FROM vw_TopSuppliers WHERE rank_by_products<=5;
END //

-- Monthly Sales Dashboard
DROP PROCEDURE IF EXISTS sp_GetSalesTrend //
CREATE PROCEDURE sp_GetSalesTrend()
BEGIN
    SELECT * FROM vw_SalesTrend;
END //

-- =====================================================
-- SECTION E: EVENT SCHEDULER (Automation + materialized view emulation)
-- =====================================================

-- Daily inventory snapshot (keeps your previous logic)
DROP EVENT IF EXISTS ev_Daily_Inventory_Snapshot //
CREATE EVENT ev_Daily_Inventory_Snapshot
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DECLARE v_Total DECIMAL(18,2);
    SELECT SUM(COALESCE(I.quantity,0) * COALESCE(P.unit_price,0))
    INTO v_Total
    FROM inventory I JOIN product P ON I.product_id=P.product_id;
    INSERT INTO logs(entity,action,remarks,created_at)
    VALUES('System','DAILY_SNAPSHOT',CONCAT('Total inventory value ₹',ROUND(COALESCE(v_Total,0),2)), NOW());
END //

-- Materialized-view emulation: precomputed monthly_sales table refreshed daily via event
-- Create materialized table (only if not exists)
CREATE TABLE IF NOT EXISTS mv_monthly_sales (
    sales_year INT NOT NULL,
    sales_month INT NOT NULL,
    total_sales DECIMAL(18,2) DEFAULT 0,
    refreshed_at DATETIME,
    PRIMARY KEY (sales_year, sales_month)
);

DROP EVENT IF EXISTS ev_Refresh_MonthlySales_MV //
CREATE EVENT ev_Refresh_MonthlySales_MV
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP
DO
BEGIN
    REPLACE INTO mv_monthly_sales (sales_year, sales_month, total_sales, refreshed_at)
    SELECT YEAR(order_date) AS sales_year, MONTH(order_date) AS sales_month, SUM(total_amount) AS total_sales, NOW()
    FROM orders WHERE status IN ('SHIPPED','COMPLETED')
    GROUP BY YEAR(order_date), MONTH(order_date);
END //

DELIMITER ;

-- =====================================================
-- SECTION F: DDL SUGGESTIONS & ADVANCED FEATURES (examples to execute once)
-- =====================================================

-- NOTE: Run these once as appropriate for your schema and indexes. They are examples / recommendations.

-- 1) Fulltext index on product (name + description) for product search:
-- ALTER TABLE product ADD FULLTEXT INDEX ft_product_name_description (name, description);

-- 2) Generated (virtual) columns example: stock_value on inventory
-- ALTER TABLE inventory ADD COLUMN stock_value DECIMAL(18,2) AS (quantity * (SELECT COALESCE(unit_price,0) FROM product WHERE product.product_id = inventory.product_id)) VIRTUAL;

-- 3) Invisible index sample (MySQL 8 supports invisible indexes)
-- CREATE INDEX idx_order_date_inv ON orders(order_date) INVISIBLE;

-- 4) Partitioning example for orders by RANGE on YEAR(order_date)
-- WARNING: Partitioning requires table-level planning. Example below assumes `orders` has an ENUM-compatible primary key or surrogate int.
-- ALTER TABLE orders
-- PARTITION BY RANGE (YEAR(order_date)) (
--     PARTITION p2022 VALUES LESS THAN (2023),
--     PARTITION p2023 VALUES LESS THAN (2024),
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION pmax VALUES LESS THAN MAXVALUE
-- );

-- 5) JSON_TABLE example: extract addresses from customer.profile_json (example usage)
-- SELECT jt.*
-- FROM customer c
-- JOIN JSON_TABLE(c.profile_json, '$.addresses[*]'
--   COLUMNS (
--     addr_type VARCHAR(50) PATH '$.type',
--     street VARCHAR(200) PATH '$.street',
--     city VARCHAR(100) PATH '$.city'
--   )
-- ) AS jt
-- WHERE c.customer_id = 123;

-- 6) CHECK constraint example (MySQL may enforce depending on sql_mode)
-- ALTER TABLE order_line ADD CONSTRAINT chk_qty_positive CHECK (quantity > 0);

-- =====================================================
-- SECTION G: NOTES, SAFEGUARDS & USAGE
-- =====================================================

-- 1. If you create the fulltext index, use MATCH...AGAINST for searching products:
--    SELECT * FROM product WHERE MATCH(name, description) AGAINST ('fastener' IN NATURAL LANGUAGE MODE);

-- 2. The fn_RevenueGrowth returns 0 if not computable (you may want to return NULL or a specific flag depending on your front-end needs).
-- 3. The materialized view `mv_monthly_sales` is updated daily by an event — adjust schedule if you need more frequent refresh.
-- 4. Partitioning and invisible indexes should be planned with your DBA/ops team; the ALTER TABLE examples are templates.
-- 5. Validate the presence of helper tables used above (logs, transaction_log, shipment, payment, warehouse, etc.).

-- =====================================================
-- ✅ End of File: 3_SCM_Portal_Advanced_Logic_Final.sql
-- =====================================================
