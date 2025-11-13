-- ============================================
-- 8. 05_create_events.sql (Final - MySQL 8.x)
-- ============================================
USE scm_portal;
DELIMITER //

SET GLOBAL event_scheduler = ON;

-- 1. EVENT: Daily Low Stock Check
DROP EVENT IF EXISTS event_daily_low_stock_check //
CREATE EVENT event_daily_low_stock_check
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURDATE(), '02:00:00') 
DO
BEGIN
    INSERT INTO inventory_alert_log (product_id, warehouse_id, quantity, reorder_level, alert_date)
    SELECT 
        I.product_id, I.warehouse_id, I.quantity, I.reorder_level, NOW()
    FROM inventory I
    WHERE I.quantity <= I.reorder_level
    ON DUPLICATE KEY UPDATE 
        alert_date = NOW(); 
END //

-- 2. EVENT: Weekly Customer VIP Status Update
DROP EVENT IF EXISTS event_weekly_vip_update //
CREATE EVENT event_weekly_vip_update
ON SCHEDULE EVERY 1 WEEK
STARTS TIMESTAMP(CURDATE(), '03:00:00') 
DO
BEGIN
    INSERT INTO `transaction` (payment_id, date, type, amount, remarks)
    SELECT 
        1, NOW(), 'DEBIT', 
        (SELECT COUNT(*) FROM customer WHERE is_customer_vip(customer_id) = TRUE),
        'Weekly VIP customer count logged'
    WHERE (SELECT COUNT(*) FROM customer WHERE is_customer_vip(customer_id) = TRUE) > 0;
END //

DELIMITER ;
SELECT 'Events created successfully!' AS result;