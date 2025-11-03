\c scm_portal;

-- ============================================
-- FUNCTION 1: Calculate Order Total
-- ============================================

CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id INT)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(quantity * price), 0)
    INTO v_total
    FROM order_line
    WHERE order_id = p_order_id;
    
    RETURN v_total;
END;
$$;


-- ============================================
-- FUNCTION 2: Get Available Inventory
-- ============================================

CREATE OR REPLACE FUNCTION get_available_inventory(p_product_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_qty INT;
BEGIN
    SELECT COALESCE(SUM(quantity), 0)
    INTO v_total_qty
    FROM inventory
    WHERE product_id = p_product_id;
    
    RETURN v_total_qty;
END;
$$;


-- ============================================
-- FUNCTION 3: Check Product Availability
-- ============================================

CREATE OR REPLACE FUNCTION check_product_availability(
    p_product_id INT,
    p_required_qty INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_available INT;
BEGIN
    v_available := get_available_inventory(p_product_id);
    RETURN v_available >= p_required_qty;
END;
$$;


-- ============================================
-- FUNCTION 4: Get Customer Lifetime Value
-- ============================================

CREATE OR REPLACE FUNCTION get_customer_lifetime_value(p_customer_id INT)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_value DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(total_amount), 0)
    INTO v_total_value
    FROM "order"
    WHERE customer_id = p_customer_id
      AND status != 'Cancelled';
    
    RETURN v_total_value;
END;
$$;


-- ============================================
-- FUNCTION 5: Get Order Status Description
-- ============================================

CREATE OR REPLACE FUNCTION get_order_status_description(p_order_id INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_status VARCHAR(20);
    v_description TEXT;
BEGIN
    SELECT status INTO v_status
    FROM "order"
    WHERE order_id = p_order_id;
    
    IF v_status IS NULL THEN
        RETURN 'Order not found';
    END IF;
    
    CASE v_status
        WHEN 'Pending' THEN 
            v_description := 'Order received and awaiting payment';
        WHEN 'Processing' THEN 
            v_description := 'Payment confirmed, preparing for shipment';
        WHEN 'Shipped' THEN 
            v_description := 'Order has been shipped and is in transit';
        WHEN 'Delivered' THEN 
            v_description := 'Order successfully delivered';
        WHEN 'Cancelled' THEN 
            v_description := 'Order has been cancelled';
        ELSE 
            v_description := 'Unknown status';
    END CASE;
    
    RETURN v_description;
END;
$$;


-- ============================================
-- FUNCTION 6: Calculate Warehouse Utilization
-- ============================================

CREATE OR REPLACE FUNCTION calculate_warehouse_utilization(p_warehouse_id INT)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_capacity INT;
    v_current_stock INT;
    v_utilization DECIMAL(5,2);
BEGIN
    SELECT capacity INTO v_capacity
    FROM warehouse
    WHERE warehouse_id = p_warehouse_id;
    
    IF v_capacity IS NULL OR v_capacity = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COALESCE(SUM(quantity), 0)
    INTO v_current_stock
    FROM inventory
    WHERE warehouse_id = p_warehouse_id;
    
    v_utilization := (v_current_stock::DECIMAL / v_capacity) * 100;
    
    RETURN ROUND(v_utilization, 2);
END;
$$;


-- ============================================
-- FUNCTION 7: Get Days Since Order
-- ============================================

CREATE OR REPLACE FUNCTION get_days_since_order(p_order_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_date TIMESTAMP;
    v_days INT;
BEGIN
    SELECT date INTO v_order_date
    FROM "order"
    WHERE order_id = p_order_id;
    
    IF v_order_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    v_days := EXTRACT(DAY FROM (CURRENT_TIMESTAMP - v_order_date));
    
    RETURN v_days;
END;
$$;


-- ============================================
-- FUNCTION 8: Get Product Sales Count
-- ============================================

CREATE OR REPLACE FUNCTION get_product_sales_count(p_product_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_sales_count INT;
BEGIN
    SELECT COALESCE(SUM(ol.quantity), 0)
    INTO v_sales_count
    FROM order_line ol
    JOIN "order" o ON ol.order_id = o.order_id
    WHERE ol.product_id = p_product_id
      AND o.status != 'Cancelled';
    
    RETURN v_sales_count;
END;
$$;


-- ============================================
-- FUNCTION 9: Is Customer VIP (orders > 5 or spent > 500000)
-- ============================================

CREATE OR REPLACE FUNCTION is_customer_vip(p_customer_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_count INT;
    v_total_spent DECIMAL(10,2);
BEGIN
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
    INTO v_order_count, v_total_spent
    FROM "order"
    WHERE customer_id = p_customer_id
      AND status != 'Cancelled';
    
    RETURN (v_order_count >= 5 OR v_total_spent >= 500000);
END;
$$;


-- ============================================
-- FUNCTION 10: Get Supplier Performance Score
-- ============================================

CREATE OR REPLACE FUNCTION get_supplier_performance_score(p_supplier_id INT)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_products INT;
    v_available_products INT;
    v_total_sales INT;
    v_score DECIMAL(5,2);
BEGIN
    -- Count total products
    SELECT COUNT(*) INTO v_total_products
    FROM product
    WHERE supplier_id = p_supplier_id;
    
    IF v_total_products = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count available products
    SELECT COUNT(*) INTO v_available_products
    FROM product
    WHERE supplier_id = p_supplier_id AND availability = TRUE;
    
    -- Get total sales
    SELECT COALESCE(SUM(ol.quantity), 0) INTO v_total_sales
    FROM order_line ol
    JOIN product p ON ol.product_id = p.product_id
    WHERE p.supplier_id = p_supplier_id;
    
    -- Calculate score (weighted: 60% availability, 40% sales volume)
    v_score := (v_available_products::DECIMAL / v_total_products * 60) + 
               (LEAST(v_total_sales, 1000)::DECIMAL / 1000 * 40);
    
    RETURN ROUND(v_score, 2);
END;
$$;


-- List all functions
SELECT 
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

SELECT 'Functions created successfully!' AS result;