-- Create database
DROP DATABASE IF EXISTS scm_portal;
CREATE DATABASE scm_portal
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Connect to the database
\c scm_portal;

-- Create schema (optional, for organization)
CREATE SCHEMA IF NOT EXISTS scm;

-- Set search path
SET search_path TO scm, public;

-- Enable extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- For fuzzy text search

SELECT 'Database scm_portal created successfully!' AS result;