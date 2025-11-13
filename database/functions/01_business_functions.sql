-- ============================================
-- 4. 01_business_functions.sql (FINAL ERROR-FREE VERSION)
-- ============================================
USE scm_portal;
DELIMITER //

-- FUNCTION 1: Calculate Order Total
DROP FUNCTION IF EXISTS calculate_order_total //
CREATE FUNCTION calculate_order_total(p_order_id BIGINT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    SELECT COALESCE(SUM(quantity * price), 0) INTO v_total
    FROM order_line WHERE order_id = p_order_id;
    RETURN v_total;
END //


-- FUNCTION 2: Get Available Inventory (Aggregate function)
DROP FUNCTION IF EXISTS get_available_inventory //
CREATE FUNCTION get_available_inventory(p_product_id BIGINT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_total_qty INT;
    SELECT COALESCE(SUM(quantity), 0) INTO v_total_qty
    FROM inventory WHERE product_id = p_product_id;
    RETURN v_total_qty;
END //

-- FUNCTION 4: Get Customer Lifetime Value (Aggregate function)
DROP FUNCTION IF EXISTS get_customer_lifetime_value //
CREATE FUNCTION get_customer_lifetime_value(p_customer_id BIGINT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total_value DECIMAL(10,2);
    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_value
    FROM `order` WHERE customer_id = p_customer_id AND status != 'Cancelled';
    RETURN v_total_value;
END //


-- FUNCTION 6: Calculate Warehouse Utilization (CRITICAL FIX: Uses CAST for DECIMAL division)
DROP FUNCTION IF EXISTS calculate_warehouse_utilization //
CREATE FUNCTION calculate_warehouse_utilization(p_warehouse_id BIGINT)
RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
    DECLARE v_capacity INT;
    DECLARE v_current_stock INT;
    DECLARE v_utilization DECIMAL(5,2);
    
    SELECT capacity INTO v_capacity FROM warehouse WHERE warehouse_id = p_warehouse_id;
    IF v_capacity IS NULL OR v_capacity = 0 THEN RETURN 0; END IF;
    
    SELECT COALESCE(SUM(quantity), 0) INTO v_current_stock
    FROM inventory WHERE warehouse_id = p_warehouse_id;
    
    -- Using CAST to ensure floating-point division for accurate percentage calculation
    SET v_utilization = (CAST(v_current_stock AS DECIMAL(10, 2)) / v_capacity) * 100;
    
    RETURN ROUND(v_utilization, 2);
END //


-- FUNCTION 9: Is Customer VIP (Aggregate/Conditional function)
DROP FUNCTION IF EXISTS is_customer_vip //
CREATE FUNCTION is_customer_vip(p_customer_id BIGINT)
RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE v_order_count INT;
    DECLARE v_total_spent DECIMAL(10,2);
    
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0) INTO v_order_count, v_total_spent
    FROM `order` WHERE customer_id = p_customer_id AND status != 'Cancelled';
    
    RETURN (v_order_count >= 5 OR v_total_spent >= 500000);
END //


-- FUNCTION 10: Get Supplier Performance Score (Aggregate/Conditional function)
DROP FUNCTION IF EXISTS get_supplier_performance_score //
CREATE FUNCTION get_supplier_performance_score(p_supplier_id BIGINT)
RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
    DECLARE v_total_products INT;
    DECLARE v_available_products INT;
    DECLARE v_total_sales INT;
    DECLARE v_score DECIMAL(5,2);
    
    SELECT COUNT(*) INTO v_total_products FROM product WHERE supplier_id = p_supplier_id;
    IF v_total_products = 0 THEN RETURN 0; END IF;
    
    SELECT COUNT(*) INTO v_available_products FROM product WHERE supplier_id = p_supplier_id AND availability = TRUE;
    
    SELECT COALESCE(SUM(ol.quantity), 0) INTO v_total_sales
    FROM order_line ol JOIN product p ON ol.product_id = p.product_id WHERE p.supplier_id = p_supplier_id;
    
    SET v_score = (v_available_products / v_total_products * 60) + (LEAST(v_total_sales, 1000) / 1000 * 40);
    
    RETURN ROUND(v_score, 2);
END //

-- FUNCTION 11: Get Product Sales Count (Fixes the Top Products crash)
DROP FUNCTION IF EXISTS get_product_sales_count //
CREATE FUNCTION get_product_sales_count(p_product_id BIGINT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_sales_count INT;
    
    -- Aggregates total quantity sold for a product
    SELECT COALESCE(SUM(ol.quantity), 0) INTO v_sales_count
    FROM order_line ol
    WHERE ol.product_id = p_product_id;
    
    RETURN v_sales_count;
END //


DELIMITER ;
SELECT 'Functions created successfully!' AS result;