-- =====================================================
-- 3_Supply_Chain_Advanced_Logic.sql (MySQL 8.x • Point of Perfection)
-- FIX: Corrected DECLARE statement placement in Trigger 5 to resolve Error 1064
-- =====================================================
USE supply_chain_db;

-- Reset delimiter for complex blocks
DELIMITER //

-- ------------------------------------------------------------------------------
-- A. VIEWS (For Simplified Reporting and Complex Joins)
-- ------------------------------------------------------------------------------

-- 1. vw_DetailedOrderSummary: Combines 6 tables for comprehensive order reporting.
CREATE OR REPLACE VIEW vw_DetailedOrderSummary
AS
SELECT
    O.order_id,
    O.order_date,
    O.status AS order_status,
    O.total_amount,
    C.name AS customer_name,
    CO.name AS customer_company,
    OL.product_id,
    P.name AS product_name,
    OL.quantity,
    OL.price AS unit_snapshot_price,
    (OL.quantity * OL.price) AS line_total,
    P.category
FROM orders O
JOIN customer C ON O.customer_id = C.customer_id
JOIN company CO ON C.company_id = CO.company_id
JOIN order_line OL ON O.order_id = OL.order_id
JOIN product P ON OL.product_id = P.product_id;
//

-- 2. vw_InventoryStatus: Provides current inventory levels and reorder warnings
CREATE OR REPLACE VIEW vw_InventoryStatus
AS
SELECT
    W.warehouse_id,
    W.name AS warehouse_name,
    P.product_id,
    P.name AS product_name,
    P.unit_price,
    I.quantity AS current_stock,
    I.reorder_level,
    (I.quantity * P.unit_price) AS stock_value,
    CASE
        WHEN I.quantity <= I.reorder_level THEN 'REORDER NEEDED (Low Stock)'
        ELSE 'Stock Sufficient'
    END AS status_alert
FROM inventory I
JOIN warehouse W ON I.warehouse_id = W.warehouse_id
JOIN product P ON I.product_id = P.product_id;
//

-- ------------------------------------------------------------------------------
-- B. TRIGGERS (Automated Transactional Logic and Audit)
-- ------------------------------------------------------------------------------

-- Helper Procedure for Recalculation (Called by Order_Line Triggers)
DROP PROCEDURE IF EXISTS update_order_total_helper //
CREATE PROCEDURE update_order_total_helper(IN order_id_param BIGINT)
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT IFNULL(SUM(OL.quantity * OL.price), 0.00)
        FROM order_line OL
        WHERE OL.order_id = order_id_param
    )
    WHERE order_id = order_id_param;
END //

-- 1. trg_OrderLine_AI: AFTER INSERT on order_line (Auto-calculates total_amount)
DROP TRIGGER IF EXISTS trg_OrderLine_AI //
CREATE TRIGGER trg_OrderLine_AI
AFTER INSERT ON order_line
FOR EACH ROW
BEGIN
    CALL update_order_total_helper(NEW.order_id);
END //

-- 2. trg_OrderLine_AU: AFTER UPDATE on order_line (Auto-calculates total_amount)
DROP TRIGGER IF EXISTS trg_OrderLine_AU //
CREATE TRIGGER trg_OrderLine_AU
AFTER UPDATE ON order_line
FOR EACH ROW
BEGIN
    IF OLD.quantity <> NEW.quantity OR OLD.price <> NEW.price THEN
        CALL update_order_total_helper(NEW.order_id);
    END IF;
END //

-- 3. trg_OrderLine_AD: AFTER DELETE on order_line (Auto-calculates total_amount)
DROP TRIGGER IF EXISTS trg_OrderLine_AD //
CREATE TRIGGER trg_OrderLine_AD
AFTER DELETE ON order_line
FOR EACH ROW
BEGIN
    CALL update_order_total_helper(OLD.order_id);
END //

-- 4. trg_LogProductPriceChange: Audits critical data changes
DROP TRIGGER IF EXISTS trg_LogProductPriceChange //
CREATE TRIGGER trg_LogProductPriceChange
AFTER UPDATE ON product
FOR EACH ROW
BEGIN
    IF OLD.unit_price <> NEW.unit_price THEN
        INSERT INTO logs (entity, entity_id, action, remarks)
        VALUES (
            'Product',
            NEW.product_id,
            'PRICE_UPDATE',
            CONCAT('Price changed from ₹', OLD.unit_price, ' to ₹', NEW.unit_price)
        );
    END IF;
END //

-- 5. trg_Inventory_Update_After_Completion: **CRITICAL TRANSACTIONAL LOGIC**
-- Decrements inventory only when the order status moves to 'COMPLETED'.
DROP TRIGGER IF EXISTS trg_Inventory_Update_After_Completion //
CREATE TRIGGER trg_Inventory_Update_After_Completion
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    -- DECLARATIONS MUST BE HERE (FIX FOR ERROR 1064)
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_product_id BIGINT;
    DECLARE v_quantity INT;
    
    -- Declare cursor to iterate over order lines
    DECLARE cur CURSOR FOR 
        SELECT product_id, quantity 
        FROM order_line 
        WHERE order_id = NEW.order_id;
        
    -- Declare continue handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- LOGIC STARTS HERE
    -- Check if status changed from SHIPPED/NEW to COMPLETED
    IF OLD.status <> 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
        
        -- Loop through all products in the order
        OPEN cur;

        read_loop: LOOP
            FETCH cur INTO v_product_id, v_quantity;
            IF done THEN
                LEAVE read_loop;
            END IF;

            -- Update the inventory quantity (assumes a default warehouse for simplicity or finds the first match)
            UPDATE inventory
            SET quantity = quantity - v_quantity
            WHERE product_id = v_product_id
            LIMIT 1; -- Ensures only one inventory record is updated if multiple exist

            -- Log the transaction
            INSERT INTO logs (entity, entity_id, action, remarks)
            VALUES (
                'Inventory',
                v_product_id,
                'ORDER_FULFILLED',
                CONCAT('Order ', NEW.order_id, ' completed. Decremented stock by ', v_quantity, '.')
            );

        END LOOP;
        
        CLOSE cur;
    END IF;
END //

-- ------------------------------------------------------------------------------
-- C. USER-DEFINED FUNCTIONS (For Scalar Calculation)
-- ------------------------------------------------------------------------------

-- fn_CalculateWarehouseValue: Calculates the total monetary value of stock in a specific warehouse.
DROP FUNCTION IF EXISTS fn_CalculateWarehouseValue //
CREATE FUNCTION fn_CalculateWarehouseValue(p_WarehouseID BIGINT) 
RETURNS DECIMAL(18, 2)
READS SQL DATA
BEGIN
    DECLARE v_TotalValue DECIMAL(18, 2);
    
    SELECT SUM(I.quantity * P.unit_price) INTO v_TotalValue
    FROM inventory I
    JOIN product P ON I.product_id = P.product_id
    WHERE I.warehouse_id = p_WarehouseID;
    
    RETURN COALESCE(v_TotalValue, 0.00);
END //

-- ------------------------------------------------------------------------------
-- D. STORED PROCEDURES (Application Interfaces)
-- ------------------------------------------------------------------------------

-- 1. sp_GetOrderDetails (Complex Read): Fetches complete details using the View.
DROP PROCEDURE IF EXISTS sp_GetOrderDetails //
CREATE PROCEDURE sp_GetOrderDetails(
    IN p_OrderID BIGINT
)
BEGIN
    -- 1. Order Summary (View)
    SELECT * FROM vw_DetailedOrderSummary WHERE order_id = p_OrderID;
    
    -- 2. Shipment Info (Join/Filter)
    SELECT shipment_id, carrier_company, tracking_number, status, estimated_arrival, actual_arrival
    FROM shipment WHERE order_id = p_OrderID;

    -- 3. Payment Info (Join/Filter)
    SELECT payment_id, method, amount, status
    FROM payment WHERE order_id = p_OrderID;
END //

-- 2. sp_AddItemToOrder (Transactional Insert/Update): Used for order modification (CRUD - Update).
DROP PROCEDURE IF EXISTS sp_AddItemToOrder //
CREATE PROCEDURE sp_AddItemToOrder(
    IN p_OrderID BIGINT,
    IN p_ProductID BIGINT,
    IN p_Quantity INT
)
BEGIN
    DECLARE v_Price DECIMAL(12, 2);

    -- 1. Get the current price snapshot 
    SELECT unit_price INTO v_Price
    FROM product
    WHERE product_id = p_ProductID;

    IF v_Price IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product ID not found. Cannot add item.';
    END IF;

    -- 2. Insert the new line item (Trigger trg_OrderLine_AI handles total update)
    INSERT INTO order_line (order_id, product_id, quantity, price)
    VALUES (p_OrderID, p_ProductID, p_Quantity, v_Price);

    -- 3. Return confirmation
    SELECT 'Success' AS Status, 'Item added, order total updated automatically by trigger.' AS Message;
END //

-- 3. sp_GetLowStockItems (Complex Filter/Read): Uses Inventory View for quick reporting.
DROP PROCEDURE IF EXISTS sp_GetLowStockItems //
CREATE PROCEDURE sp_GetLowStockItems(
    IN p_WarehouseID BIGINT
)
BEGIN
    SELECT 
        warehouse_name, 
        product_name, 
        current_stock, 
        reorder_level, 
        unit_price, 
        stock_value
    FROM vw_InventoryStatus
    WHERE warehouse_id = p_WarehouseID
      AND status_alert = 'REORDER NEEDED (Low Stock)'
    ORDER BY current_stock ASC;
END //

-- 4. sp_ProcessNewOrder (Transactional Creation): Handles a new order and initial payment/shipment.
DROP PROCEDURE IF EXISTS sp_ProcessNewOrder //
CREATE PROCEDURE sp_ProcessNewOrder(
    IN p_CustomerID BIGINT,
    IN p_TotalAmount DECIMAL(12,2),
    IN p_ShipCarrier VARCHAR(255),
    IN p_PaymentMethod ENUM('CASH','CARD','ONLINE')
)
BEGIN
    DECLARE v_OrderID BIGINT;
    DECLARE v_PaymentID BIGINT;
    
    -- Start Transaction to ensure all or nothing
    START TRANSACTION;

    -- 1. Create the new Order (CRUD - Create)
    INSERT INTO orders (customer_id, status, total_amount, priority)
    VALUES (p_CustomerID, 'NEW', p_TotalAmount, 'Medium');
    
    SET v_OrderID = LAST_INSERT_ID();

    -- 2. Create the initial Shipment record
    INSERT INTO shipment (order_id, carrier_company, status, estimated_arrival)
    VALUES (v_OrderID, p_ShipCarrier, 'PENDING', DATE_ADD(NOW(), INTERVAL 7 DAY));

    -- 3. Create the Payment record
    INSERT INTO payment (order_id, method, amount, status)
    VALUES (v_OrderID, p_PaymentMethod, p_TotalAmount, 'SUCCESS'); 
    
    SET v_PaymentID = LAST_INSERT_ID();
    
    -- 4. Log the Transaction
    INSERT INTO transaction_log (payment_id, type, amount, remarks)
    VALUES (v_PaymentID, 'CREDIT', p_TotalAmount, CONCAT('Initial Order Payment for Order ', v_OrderID));

    -- 5. Commit if everything was successful
    COMMIT;
    
    -- Return the new ID to the application
    SELECT v_OrderID AS new_order_id, 'Transaction Complete' AS Status;

END //

-- Reset delimiter back to default
DELIMITER ;