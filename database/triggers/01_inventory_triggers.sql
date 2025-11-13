-- ============================================
-- 6. 01_inventory_triggers.sql (Final - MySQL Corrected)
-- FIX: Corrected syntax error in trg_update_order_status_on_shipment
-- ============================================
USE scm_portal;
DELIMITER //

-- --------------------------------------------
-- TRIGGER 1: Update Inventory on Order Line Insert (Stock Deduction)
-- --------------------------------------------
DROP TRIGGER IF EXISTS trg_update_inventory_on_order //
CREATE TRIGGER trg_update_inventory_on_order
AFTER INSERT ON order_line
FOR EACH ROW
BEGIN
    DECLARE v_warehouse_id BIGINT;
    
    -- Find a warehouse with enough stock (best fit logic)
    SELECT warehouse_id INTO v_warehouse_id
    FROM inventory
    WHERE product_id = NEW.product_id 
      AND quantity >= NEW.quantity
    ORDER BY quantity DESC
    LIMIT 1;

    IF v_warehouse_id IS NOT NULL THEN
        -- Reduce inventory when order line is created
        UPDATE inventory
        SET quantity = quantity - NEW.quantity,
            last_updated = NOW()
        WHERE product_id = NEW.product_id AND warehouse_id = v_warehouse_id;
    ELSE
        -- Log the issue if stock is insufficient after order line creation
        INSERT INTO inventory_alert_log (product_id, warehouse_id, quantity, reorder_level, alert_date)
        VALUES (NEW.product_id, 0, 0, 0, NOW()); 
    END IF;
END //

-- --------------------------------------------
-- TRIGGER 2: Update Order Total (Helper procedure must exist)
-- NOTE: The helper procedure update_order_total_helper() is assumed to be available
-- from the 01_order_procedures.sql script.
-- --------------------------------------------

DROP TRIGGER IF EXISTS trg_update_order_total_insert //
CREATE TRIGGER trg_update_order_total_insert
AFTER INSERT ON order_line
FOR EACH ROW
BEGIN
    CALL update_order_total_helper(NEW.order_id);
END //

DROP TRIGGER IF EXISTS trg_update_order_total_update //
CREATE TRIGGER trg_update_order_total_update
AFTER UPDATE ON order_line
FOR EACH ROW
BEGIN
    IF OLD.quantity <> NEW.quantity OR OLD.price <> NEW.price THEN
        CALL update_order_total_helper(NEW.order_id);
    END IF;
END //

DROP TRIGGER IF EXISTS trg_update_order_total_delete //
CREATE TRIGGER trg_update_order_total_delete
AFTER DELETE ON order_line
FOR EACH ROW
BEGIN
    CALL update_order_total_helper(OLD.order_id);
END //

-- --------------------------------------------
-- TRIGGER 3: Auto-create Transaction on Payment
-- --------------------------------------------
DROP TRIGGER IF EXISTS trg_create_transaction_on_payment //
CREATE TRIGGER trg_create_transaction_on_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' THEN
        INSERT INTO `transaction` (payment_id, date, type, amount, remarks)
        VALUES (NEW.payment_id, NOW(), 'Credit', NEW.amount, CONCAT('Auto-generated transaction for payment #', NEW.payment_id));
    END IF;
END //

-- --------------------------------------------
-- TRIGGER 4: Update Order Status on Shipment (FIXED for MySQL)
-- --------------------------------------------
DROP TRIGGER IF EXISTS trg_update_order_status_on_shipment //
CREATE TRIGGER trg_update_order_status_on_shipment
AFTER UPDATE ON shipment
FOR EACH ROW
BEGIN
    -- CRITICAL FIX: Use standard MySQL comparison (OLD.status <> NEW.status)
    IF OLD.status <> NEW.status THEN
        IF NEW.status = 'In Transit' THEN
            UPDATE `order` 
            SET status = 'Shipped' 
            WHERE order_id = NEW.order_id AND status != 'Delivered';
        ELSEIF NEW.status = 'Delivered' THEN
            UPDATE `order` 
            SET status = 'Delivered' 
            WHERE order_id = NEW.order_id;
        END IF;
    END IF;
END //

-- --------------------------------------------
-- TRIGGER 5: Low Inventory Alert Log
-- --------------------------------------------
DROP TRIGGER IF EXISTS trg_check_low_inventory //
CREATE TRIGGER trg_check_low_inventory
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    IF NEW.quantity <= NEW.reorder_level AND OLD.quantity > OLD.reorder_level THEN
        INSERT INTO inventory_alert_log (product_id, warehouse_id, quantity, reorder_level)
        VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity, NEW.reorder_level);
    END IF;
END //

-- --------------------------------------------
-- TRIGGER 6: Product Price Change Audit (Historical Auditing)
-- --------------------------------------------
DROP TRIGGER IF EXISTS trg_audit_product_price //
CREATE TRIGGER trg_audit_product_price
AFTER UPDATE ON product
FOR EACH ROW
BEGIN
    IF OLD.unit_price <> NEW.unit_price THEN
        INSERT INTO product_price_history (product_id, old_price, new_price, changed_by)
        VALUES (NEW.product_id, OLD.unit_price, NEW.unit_price, 'Application User'); 
    END IF;
END //

DELIMITER ;
SELECT 'Triggers created successfully!' AS result;