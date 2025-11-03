\c scm_portal;

-- ============================================
-- PROCEDURE 1: Place New Order
-- ============================================

CREATE OR REPLACE PROCEDURE place_order(
    p_customer_id INT,
    p_priority VARCHAR(10),
    OUT p_order_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert new order
    INSERT INTO "order" (customer_id, priority, status, date)
    VALUES (p_customer_id, p_priority, 'Pending', CURRENT_TIMESTAMP)
    RETURNING order_id INTO p_order_id;
    
    RAISE NOTICE 'Order % created successfully for customer %', p_order_id, p_customer_id;
END;
$$;


-- ============================================
-- PROCEDURE 2: Add Item to Order
-- ============================================

CREATE OR REPLACE PROCEDURE add_order_item(
    p_order_id INT,
    p_product_id INT,
    p_quantity INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_price DECIMAL(10,2);
    v_available_qty INT;
BEGIN
    -- Get product price
    SELECT unit_price INTO v_price
    FROM product
    WHERE product_id = p_product_id;
    
    IF v_price IS NULL THEN
        RAISE EXCEPTION 'Product % not found', p_product_id;
    END IF;
    
    -- Check available inventory
    SELECT SUM(quantity) INTO v_available_qty
    FROM inventory
    WHERE product_id = p_product_id;
    
    IF v_available_qty < p_quantity THEN
        RAISE EXCEPTION 'Insufficient inventory. Available: %, Requested: %', 
            v_available_qty, p_quantity;
    END IF;
    
    -- Insert order line
    INSERT INTO order_line (order_id, product_id, quantity, price)
    VALUES (p_order_id, p_product_id, p_quantity, v_price);
    
    RAISE NOTICE 'Added % units of product % to order %', p_quantity, p_product_id, p_order_id;
END;
$$;


-- ============================================
-- PROCEDURE 3: Process Payment
-- ============================================

CREATE OR REPLACE PROCEDURE process_payment(
    p_order_id INT,
    p_amount DECIMAL(10,2),
    p_method VARCHAR(20),
    OUT p_payment_id INT,
    OUT p_status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_total DECIMAL(10,2);
BEGIN
    -- Get order total
    SELECT total_amount INTO v_order_total
    FROM "order"
    WHERE order_id = p_order_id;
    
    IF v_order_total IS NULL THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;
    
    -- Validate payment amount
    IF p_amount < v_order_total THEN
        p_status := 'Failed';
        RAISE EXCEPTION 'Payment amount (%) is less than order total (%)', 
            p_amount, v_order_total;
    END IF;
    
    -- Insert payment
    INSERT INTO payment (order_id, amount, method, status, type, payment_date)
    VALUES (p_order_id, p_amount, p_method, 'Completed', 'Full Payment', CURRENT_TIMESTAMP)
    RETURNING payment_id INTO p_payment_id;
    
    -- Update order status
    UPDATE "order"
    SET status = 'Processing'
    WHERE order_id = p_order_id;
    
    p_status := 'Completed';
    RAISE NOTICE 'Payment % processed successfully for order %', p_payment_id, p_order_id;
END;
$$;


-- ============================================
-- PROCEDURE 4: Create Shipment
-- ============================================

CREATE OR REPLACE PROCEDURE create_shipment(
    p_order_id INT,
    p_carrier VARCHAR(100),
    p_company_id INT,
    p_estimated_days INT,
    OUT p_shipment_id INT,
    OUT p_tracking_number VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_status VARCHAR(20);
BEGIN
    -- Check order status
    SELECT status INTO v_order_status
    FROM "order"
    WHERE order_id = p_order_id;
    
    IF v_order_status IS NULL THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;
    
    IF v_order_status NOT IN ('Processing', 'Pending') THEN
        RAISE EXCEPTION 'Order % cannot be shipped. Current status: %', 
            p_order_id, v_order_status;
    END IF;
    
    -- Generate tracking number
    p_tracking_number := UPPER(SUBSTRING(p_carrier FROM 1 FOR 2)) || 
                         LPAD(p_order_id::TEXT, 10, '0') || 
                         'IN';
    
    -- Insert shipment
    INSERT INTO shipment (
        order_id, carrier, company_id, tracking_number, 
        status, estimated_arrival
    )
    VALUES (
        p_order_id, p_carrier, p_company_id, p_tracking_number,
        'Preparing', CURRENT_DATE + p_estimated_days
    )
    RETURNING shipment_id INTO p_shipment_id;
    
    RAISE NOTICE 'Shipment % created with tracking %', p_shipment_id, p_tracking_number;
END;
$$;


-- ============================================
-- PROCEDURE 5: Get Customer Order History
-- ============================================

CREATE OR REPLACE PROCEDURE get_customer_orders(
    p_customer_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Return order history
    RAISE NOTICE 'Fetching orders for customer %', p_customer_id;
    
    PERFORM 
        o.order_id,
        o.date,
        o.total_amount,
        o.status,
        o.priority
    FROM "order" o
    WHERE o.customer_id = p_customer_id
    ORDER BY o.date DESC;
END;
$$;


-- ============================================
-- PROCEDURE 6: Update Inventory
-- ============================================

CREATE OR REPLACE PROCEDURE update_inventory_qty(
    p_product_id INT,
    p_warehouse_id INT,
    p_quantity_change INT,
    p_operation VARCHAR(10)  -- 'ADD' or 'SUBTRACT'
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_qty INT;
    v_new_qty INT;
BEGIN
    -- Get current quantity
    SELECT quantity INTO v_current_qty
    FROM inventory
    WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;
    
    IF v_current_qty IS NULL THEN
        RAISE EXCEPTION 'Inventory record not found for product % in warehouse %', 
            p_product_id, p_warehouse_id;
    END IF;
    
    -- Calculate new quantity
    IF p_operation = 'ADD' THEN
        v_new_qty := v_current_qty + p_quantity_change;
    ELSIF p_operation = 'SUBTRACT' THEN
        v_new_qty := v_current_qty - p_quantity_change;
        IF v_new_qty < 0 THEN
            RAISE EXCEPTION 'Cannot reduce inventory below zero';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid operation: %. Use ADD or SUBTRACT', p_operation;
    END IF;
    
    -- Update inventory
    UPDATE inventory
    SET quantity = v_new_qty,
        last_updated = CURRENT_TIMESTAMP
    WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;
    
    RAISE NOTICE 'Inventory updated: Product %, Warehouse %, Old: %, New: %',
        p_product_id, p_warehouse_id, v_current_qty, v_new_qty;
END;
$$;


-- List all procedures
SELECT 
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'PROCEDURE'
ORDER BY routine_name;

SELECT 'Stored procedures created successfully!' AS result;