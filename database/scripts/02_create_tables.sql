-- Connect to database
\c scm_portal;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS transaction CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS shipment CASCADE;
DROP TABLE IF EXISTS order_line CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS warehouse CASCADE;
DROP TABLE IF EXISTS customer CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS company CASCADE;

-- 1. COMPANY Table
CREATE TABLE company (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    address VARCHAR(255),
    contact VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUPPLIER Table
CREATE TABLE supplier (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    contact VARCHAR(100),
    phone_number VARCHAR(15),
    company_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_company 
        FOREIGN KEY (company_id) 
        REFERENCES company(company_id) 
        ON DELETE CASCADE
);

-- 3. CUSTOMER Table
CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    company_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_company 
        FOREIGN KEY (company_id) 
        REFERENCES company(company_id) 
        ON DELETE CASCADE
);

-- 4. WAREHOUSE Table
CREATE TABLE warehouse (
    warehouse_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    location VARCHAR(100),
    capacity INT CHECK (capacity > 0),
    company_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_warehouse_company 
        FOREIGN KEY (company_id) 
        REFERENCES company(company_id) 
        ON DELETE CASCADE
);

-- 5. PRODUCT Table
CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    unit_price DECIMAL(10,2) CHECK (unit_price > 0),
    manufacturer VARCHAR(100),
    availability BOOLEAN DEFAULT TRUE,
    supplier_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_supplier 
        FOREIGN KEY (supplier_id) 
        REFERENCES supplier(supplier_id) 
        ON DELETE CASCADE
);

-- 6. INVENTORY Table (Many-to-Many bridge)
CREATE TABLE inventory (
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity INT DEFAULT 0 CHECK (quantity >= 0),
    reorder_level INT DEFAULT 10,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, warehouse_id),
    CONSTRAINT fk_inventory_product 
        FOREIGN KEY (product_id) 
        REFERENCES product(product_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_inventory_warehouse 
        FOREIGN KEY (warehouse_id) 
        REFERENCES warehouse(warehouse_id) 
        ON DELETE CASCADE
);

-- 7. ORDER Table (using quoted identifier because ORDER is a keyword)
CREATE TABLE "order" (
    order_id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'Pending' 
        CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    priority VARCHAR(10) DEFAULT 'Medium' 
        CHECK (priority IN ('Low', 'Medium', 'High')),
    customer_id INT NOT NULL,
    retailer_id INT,
    CONSTRAINT fk_order_customer 
        FOREIGN KEY (customer_id) 
        REFERENCES customer(customer_id) 
        ON DELETE RESTRICT
);

-- 8. ORDER_LINE Table
CREATE TABLE order_line (
    orderline_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT CHECK (quantity > 0),
    price DECIMAL(10,2) CHECK (price > 0),
    CONSTRAINT fk_orderline_order 
        FOREIGN KEY (order_id) 
        REFERENCES "order"(order_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_orderline_product 
        FOREIGN KEY (product_id) 
        REFERENCES product(product_id) 
        ON DELETE RESTRICT
);

-- 9. SHIPMENT Table
CREATE TABLE shipment (
    shipment_id SERIAL PRIMARY KEY,
    order_id INT UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Preparing' 
        CHECK (status IN ('Preparing', 'In Transit', 'Delivered')),
    carrier VARCHAR(100),
    company_id INT,
    tracking_number VARCHAR(50) UNIQUE,
    estimated_arrival DATE,
    actual_arrival DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipment_order 
        FOREIGN KEY (order_id) 
        REFERENCES "order"(order_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_shipment_company 
        FOREIGN KEY (company_id) 
        REFERENCES company(company_id) 
        ON DELETE SET NULL
);

-- 10. PAYMENT Table
CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) CHECK (amount > 0),
    type VARCHAR(20),
    method VARCHAR(20) 
        CHECK (method IN ('Credit Card', 'Debit Card', 'UPI', 'Cash', 'Net Banking')),
    status VARCHAR(20) DEFAULT 'Pending' 
        CHECK (status IN ('Pending', 'Completed', 'Failed')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order 
        FOREIGN KEY (order_id) 
        REFERENCES "order"(order_id) 
        ON DELETE RESTRICT
);

-- 11. TRANSACTION Table
CREATE TABLE transaction (
    transaction_id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20),
    amount DECIMAL(10,2),
    remarks TEXT,
    CONSTRAINT fk_transaction_payment 
        FOREIGN KEY (payment_id) 
        REFERENCES payment(payment_id) 
        ON DELETE CASCADE
);

-- Success message
SELECT 'All tables created successfully!' AS result;