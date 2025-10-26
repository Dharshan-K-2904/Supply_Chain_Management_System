-- =====================================================
-- 5_Supply_Chain_Security_Setup.sql (MySQL 8.x • RBAC)
-- FIX: Hardcoded passwords to resolve Error 1064 (variable) and Error 1305 (dependency)
-- =====================================================
USE supply_chain_db;

-- NOTE: REPLACE 'YourStrongPassword1', 'AnalystPassword2', and 'DataEntryPassword3' 
-- with unique, strong passwords before deployment.

-- ------------------------------------------------------------------------------
-- I. USER CREATION AND BASE PRIVILEGES (RBAC IMPLEMENTATION)
-- ------------------------------------------------------------------------------

-- Drop users if they exist to allow re-running the script
DROP USER IF EXISTS 'scm_app_backend'@'localhost';
DROP USER IF EXISTS 'scm_analyst'@'localhost';
DROP USER IF EXISTS 'scm_data_entry'@'localhost';


-- 1. Application Backend User (Low Privilege for Flask API)
CREATE USER 'scm_app_backend'@'localhost' IDENTIFIED BY 'scm_back_2025';

-- 2. Analyst/Reporting User (Read-Only Access)
CREATE USER 'scm_analyst'@'localhost' IDENTIFIED BY 'scm_analyst_2025';

-- 3. Data Entry User (Operational Read/Write Access)
CREATE USER 'scm_data_entry'@'localhost' IDENTIFIED BY 'scm_data_entry_2025';


-- ------------------------------------------------------------------------------
-- II. DEFINING ROLES & GRANTING PRIVILEGES
-- ------------------------------------------------------------------------------

-- A. GRANTS FOR scm_app_backend
-- Principle: Least Privilege. Only needs to execute procedures and read specific lookup tables/views.

GRANT EXECUTE ON PROCEDURE supply_chain_db.sp_GetOrderDetails TO 'scm_app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE supply_chain_db.sp_AddItemToOrder TO 'scm_app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE supply_chain_db.sp_GetLowStockItems TO 'scm_app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE supply_chain_db.sp_ProcessNewOrder TO 'scm_app_backend'@'localhost';

-- Grant SELECT access on key data used for front-end lists/lookups
GRANT SELECT ON supply_chain_db.product TO 'scm_app_backend'@'localhost';
GRANT SELECT ON supply_chain_db.orders TO 'scm_app_backend'@'localhost';
GRANT SELECT ON supply_chain_db.customer TO 'scm_app_backend'@'localhost';
GRANT SELECT ON supply_chain_db.company TO 'scm_app_backend'@'localhost';

-- Grant SELECT on the views for complex data retrieval
GRANT SELECT ON supply_chain_db.vw_DetailedOrderSummary TO 'scm_app_backend'@'localhost';
GRANT SELECT ON supply_chain_db.vw_InventoryStatus TO 'scm_app_backend'@'localhost';


-- B. GRANTS FOR scm_analyst
-- Principle: Reporting Only. Full read access, zero write/modify access.
GRANT SELECT ON supply_chain_db.* TO 'scm_analyst'@'localhost';


-- C. GRANTS FOR scm_data_entry
-- Principle: Operational Write Access. Restricted to core operational tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON supply_chain_db.orders TO 'scm_data_entry'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON supply_chain_db.order_line TO 'scm_data_entry'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON supply_chain_db.inventory TO 'scm_data_entry'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON supply_chain_db.shipment TO 'scm_data_entry'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON supply_chain_db.payment TO 'scm_data_entry'@'localhost';
GRANT SELECT, INSERT ON supply_chain_db.transaction_log TO 'scm_data_entry'@'localhost';

-- Data entry users only need SELECT on lookup tables
GRANT SELECT ON supply_chain_db.customer TO 'scm_data_entry'@'localhost';
GRANT SELECT ON supply_chain_db.product TO 'scm_data_entry'@'localhost';
GRANT SELECT ON supply_chain_db.company TO 'scm_data_entry'@'localhost';


-- ------------------------------------------------------------------------------
-- III. FINAL PRIVILEGE REFRESH
-- ------------------------------------------------------------------------------

FLUSH PRIVILEGES;

SELECT 'Security Setup Complete. 3 Users Created:' AS Status;
SELECT 'scm_app_backend: EXECUTE procedures (for Flask API)' AS User1;
SELECT 'scm_analyst: SELECT ONLY (for Reporting)' AS User2;
SELECT 'scm_data_entry: CRUD on operational tables' AS User3;