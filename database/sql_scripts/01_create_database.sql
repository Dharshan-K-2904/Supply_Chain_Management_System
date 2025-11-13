-- ============================================
-- 1. 01_create_database.sql (Final - MySQL 8.x)
-- ============================================

-- Create database
DROP DATABASE IF EXISTS scm_portal;
CREATE DATABASE scm_portal
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_0900_ai_ci;

-- Connect to the database
USE scm_portal;

SELECT 'Database scm_portal created successfully!' AS result;