\c scm_portal;

-- ============================================
-- TRIGGER 1: Update Inventory on Order Creation
-- ============================================

-- Create function first
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Reduce inventory when order line is created
    UPDATE inventory
    SET quantity = quantity - NEW.quantity,
        last_updated = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id
      AND warehouse_id = (
          SELECT warehouse_id 
          FROM inventory 
          WHERE product_id = NEW.product_id 
            AND quantity >= NEW.quantity
          ORDER BY quantity DESC
          LIMIT 1
      );
    
    -- Check if update affected any rows
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient inventory for product_id %', NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_update_inventory_on_order
AFTER INSERT ON order_line
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_order();


-- ============================================
-- TRIGGER 2: Update Order Total Automatically
-- ============================================

CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order total when order line is inserted/updated
    UPDATE "order"
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * price), 0)
        FROM order_line
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT
CREATE TRIGGER trg_update_order_total_insert
AFTER INSERT ON order_line
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

-- Create trigger for UPDATE
CREATE TRIGGER trg_update_order_total_update
AFTER UPDATE ON order_line
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

-- Create trigger for DELETE
CREATE TRIGGER trg_update_order_total_delete
AFTER DELETE ON order_line
FOR EACH ROW
EXECUTE FUNCTION update_order_total();


-- ============================================
-- TRIGGER 3: Auto-create Transaction on Payment
-- ============================================

CREATE OR REPLACE FUNCTION create_transaction_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create transaction if payment is completed
    IF NEW.status = 'Completed' AND (OLD IS NULL OR OLD.status != 'Completed') THEN
        INSERT INTO transaction (payment_id, date, type, amount, remarks)
        VALUES (
            NEW.payment_id,
            CURRENT_TIMESTAMP,
            'Credit',
            NEW.amount,
            'Auto-generated transaction for payment #' || NEW.payment_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_create_transaction_on_payment
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION create_transaction_on_payment();


-- ============================================
-- TRIGGER 4: Update Order Status on Shipment
-- ============================================

CREATE OR REPLACE FUNCTION update_order_status_on_shipment()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order status based on shipment status
    IF NEW.status = 'In Transit' THEN
        UPDATE "order"
        SET status = 'Shipped'
        WHERE order_id = NEW.order_id AND status != 'Delivered';
    ELSIF NEW.status = 'Delivered' THEN
        UPDATE "order"
        SET status = 'Delivered'
        WHERE order_id = NEW.order_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_update_order_status_on_shipment
AFTER UPDATE ON shipment
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_order_status_on_shipment();


-- ============================================
-- TRIGGER 5: Low Inventory Alert Log
-- ============================================

-- Create alert log table first
CREATE TABLE IF NOT EXISTS inventory_alert_log (
    alert_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity INT,
    reorder_level INT,
    alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id, warehouse_id) REFERENCES inventory(product_id, warehouse_id)
);

CREATE OR REPLACE FUNCTION check_low_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Log alert if inventory falls below reorder level
    IF NEW.quantity <= NEW.reorder_level THEN
        INSERT INTO inventory_alert_log (product_id, warehouse_id, quantity, reorder_level)
        VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity, NEW.reorder_level);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_check_low_inventory
AFTER UPDATE OF quantity ON inventory
FOR EACH ROW
WHEN (NEW.quantity <= NEW.reorder_level AND OLD.quantity > OLD.reorder_level)
EXECUTE FUNCTION check_low_inventory();


-- Verify triggers created
SELECT 
    trigger_name,
    event_object_table AS table_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

SELECT 'Triggers created successfully!' AS result;