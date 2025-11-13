-- ============================================
-- 5. 01_order_procedures.sql (Final - MySQL 8.x)
-- ============================================
USE scm_portal;
DELIMITER //

-- PROCEDURE 2: Add Item to Order (Concurrent Safety)
DROP PROCEDURE IF EXISTS add_order_item //
CREATE PROCEDURE add_order_item(
    IN p_order_id BIGINT,
    IN p_product_id BIGINT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_available_qty INT;
    
    START TRANSACTION; -- BEGIN TRANSACTION
    
    SELECT unit_price INTO v_price
    FROM product
    WHERE product_id = p_product_id FOR UPDATE; -- LOCK ROW
    
    IF v_price IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product not found. Transaction rolled back.';
    END IF;
    
    SET v_available_qty = get_available_inventory(p_product_id);
    
    IF v_available_qty < p_quantity THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory. Transaction rolled back.'; 
    END IF;
    
    -- Insert order line (Triggers fire here)
    INSERT INTO order_line (order_id, product_id, quantity, price)
    VALUES (p_order_id, p_product_id, p_quantity, v_price);
    
    COMMIT; -- END TRANSACTION
    SELECT CONCAT('Added ', p_quantity, ' units of product ', p_product_id, ' to order ', p_order_id) AS Notice;
END //


-- PROCEDURE 3: Process Payment (Full Transactional Control)
DROP PROCEDURE IF EXISTS process_payment //
CREATE PROCEDURE process_payment(
    IN p_order_id BIGINT,
    IN p_amount DECIMAL(10,2),
    IN p_method VARCHAR(20),
    OUT p_payment_id BIGINT,
    OUT p_status VARCHAR(20)
)
BEGIN
    DECLARE v_order_total DECIMAL(10,2);
    
    START TRANSACTION; -- BEGIN TRANSACTION
    
    SELECT total_amount INTO v_order_total
    FROM `order`
    WHERE order_id = p_order_id FOR UPDATE; -- LOCK ROW

    IF v_order_total IS NULL THEN
        SET p_status = 'Failed';
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found. Transaction rolled back.';
    END IF;
    
    IF p_amount < v_order_total THEN
        SET p_status = 'Failed';
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment amount is insufficient. Transaction rolled back.';
    END IF;
    
    -- Insert payment (Triggers fire here)
    INSERT INTO payment (order_id, amount, method, status, type, payment_date)
    VALUES (p_order_id, p_amount, p_method, 'Completed', 'Full Payment', NOW());
    
    SET p_payment_id = LAST_INSERT_ID();
    
    -- Update order status
    UPDATE `order` SET status = 'Processing' WHERE order_id = p_order_id;
    
    SET p_status = 'Completed';
    COMMIT; -- END TRANSACTION
    SELECT CONCAT('Payment ', p_payment_id, ' processed successfully for order ', p_order_id) AS Notice;
END //

-- Other procedures (P1, P4, P5, P6) remain the same.

DELIMITER ;
SELECT 'Stored procedures created successfully!' AS result;