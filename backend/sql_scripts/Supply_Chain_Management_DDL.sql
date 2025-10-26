-- ============================================================
-- SCM_Portal_Final_DDL.sql  (MySQL 8.x)
-- Complete Supply Chain Management + RBAC Schema
-- ============================================================

DROP DATABASE IF EXISTS scm_portal;
CREATE DATABASE scm_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scm_portal;

-- ============================================================
-- SECTION 1: ROLE-BASED ACCESS CONTROL (RBAC)
-- ============================================================

CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(200)
) ENGINE=InnoDB;

CREATE TABLE permissions (
  permission_id INT AUTO_INCREMENT PRIMARY KEY,
  permission_key VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(200)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SECTION 2: CORE BUSINESS ENTITIES
-- ============================================================

CREATE TABLE company (
  company_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('Manufacturer','Distributor','Retailer') DEFAULT 'Distributor',
  address VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE supplier (
  supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES company(company_id)
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE customer (
  customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES company(company_id)
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE warehouse (
  warehouse_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  capacity INT DEFAULT 0,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES company(company_id)
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product (
  product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100),
  description TEXT,
  unit_price DECIMAL(12,2) DEFAULT 0.00,
  manufacturer_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manufacturer_id) REFERENCES company(company_id)
      ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product_supplier (
  product_supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  supplier_id BIGINT NOT NULL,
  supplier_price DECIMAL(12,2) DEFAULT 0.00,
  lead_time_days INT DEFAULT 0,
  primary_supplier BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (product_id) REFERENCES product(product_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_product_supplier (product_id, supplier_id)
) ENGINE=InnoDB;

CREATE TABLE inventory (
  inventory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES product(product_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_inventory (warehouse_id, product_id)
) ENGINE=InnoDB;

-- ============================================================
-- SECTION 3: TRANSACTIONS (ORDERS, PAYMENTS, SHIPMENTS)
-- ============================================================

CREATE TABLE orders (
  order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  priority ENUM('Low','Medium','High') DEFAULT 'Medium',
  status ENUM('NEW','PROCESSING','SHIPPED','COMPLETED','CANCELLED') DEFAULT 'NEW',
  total_amount DECIMAL(12,2) DEFAULT 0.00,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
      ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE order_line (
  orderline_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price DECIMAL(12,2) DEFAULT 0.00,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES product(product_id)
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE shipment (
  shipment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  carrier_company VARCHAR(255),
  tracking_number VARCHAR(100) UNIQUE,
  status ENUM('PENDING','IN_TRANSIT','DELIVERED','DELAYED') DEFAULT 'PENDING',
  estimated_arrival DATETIME,
  actual_arrival DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payment (
  payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type ENUM('FULL','PARTIAL') DEFAULT 'FULL',
  method ENUM('CASH','CARD','ONLINE') DEFAULT 'CASH',
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transaction_log (
  transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type ENUM('CREDIT','DEBIT') NOT NULL,
  amount DECIMAL(12,2),
  remarks VARCHAR(255),
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE logs (
  log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity VARCHAR(100),
  entity_id BIGINT,
  action VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- SECTION 4: INDEXES & PERFORMANCE OPTIMIZATION
-- ============================================================

CREATE INDEX idx_supplier_company    ON supplier(company_id);
CREATE INDEX idx_customer_company    ON customer(company_id);
CREATE INDEX idx_warehouse_company   ON warehouse(company_id);
CREATE INDEX idx_inventory_product   ON inventory(product_id);
CREATE INDEX idx_orders_customer     ON orders(customer_id);
CREATE INDEX idx_orderline_order     ON order_line(order_id);
CREATE INDEX idx_payment_order       ON payment(order_id);
CREATE INDEX idx_transaction_payment ON transaction_log(payment_id);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
