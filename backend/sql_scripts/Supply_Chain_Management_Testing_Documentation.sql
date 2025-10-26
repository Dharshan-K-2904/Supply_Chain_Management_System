-- =====================================================
-- 6_Supply_Chain_Testing_Documentation.sql
-- Third Normal Form (3NF) Documentation
-- =====================================================
USE supply_chain_db;

--------------------------------------------------------------------------------
-- PROJECT NORMALIZATION DOCUMENTATION: THIRD NORMAL FORM (3NF)
--------------------------------------------------------------------------------

/*
The database schema is designed to meet the Third Normal Form (3NF) requirements:
1. First Normal Form (1NF): All columns contain atomic values, and there are no repeating groups.
2. Second Normal Form (2NF): All non-key attributes are fully dependent on the entire primary key.
3. Third Normal Form (3NF): There are no transitive dependencies (no non-key attribute depends on another non-key attribute).
*/

-- EXAMPLE PROOF: PRODUCT TABLE (Demonstrates 3NF)
--------------------------------------------------------------------------------
/*
TABLE: product
(product_id PK, name, category, description, unit_price, manufacturer_id FK)

Primary Key: product_id

Check for Transitive Dependency:
- In the 'product' table, a non-key attribute like 'unit_price' does NOT determine any other non-key attribute (like 'category').
- The 'manufacturer_id' (a non-key attribute) does NOT determine any other non-key attribute in the 'product' table (like 'name').

CONCLUSION:
- The product table is in 3NF because all non-key attributes depend directly on the primary key (product_id), and all transitive dependencies (e.g., manufacturer name) have been eliminated by placing them in the separate 'company' table.
*/

-- EXAMPLE PROOF: ORDER_LINE TABLE (Demonstrates 2NF and 3NF)
--------------------------------------------------------------------------------
/*
TABLE: order_line
(orderline_id PK, order_id FK, product_id FK, quantity, price)

Primary Key: orderline_id (Surrogate Key)

Check for 2NF:
- Since 'orderline_id' is a simple (non-composite) primary key, 2NF is automatically met. All non-key attributes ('order_id', 'quantity', 'price') depend fully on the entire key.

Check for 3NF:
- There are no dependencies between the non-key attributes themselves. For example, 'quantity' does not determine 'price'.

CONCLUSION:
- The order_line table is in 3NF.
*/

-- EXAMPLE PROOF: CUSTOMER TABLE (Demonstrates Elimination of Transitive Dependency)
--------------------------------------------------------------------------------
/*
TABLE: customer
(customer_id PK, company_id FK, name, address, phone, email)

If we had included 'company_name' and 'company_type' in this table:
- customer_id -> company_id
- company_id -> company_name (Transitive Dependency! This violates 3NF.)

SOLUTION (3NF Compliant):
- The 'customer' table only stores 'company_id' as a Foreign Key.
- All company details (name, type, address) are stored in the separate 'company' table. This eliminates the transitive dependency and prevents redundant data storage.
*/