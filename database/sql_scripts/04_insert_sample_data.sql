-- ============================================
-- 04_insert_sample_data.sql (Final - MySQL 8.x)
-- ============================================
USE scm_portal;

-- Clear existing data (if any)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `transaction`; 
TRUNCATE TABLE payment;
TRUNCATE TABLE shipment;
TRUNCATE TABLE order_line;
TRUNCATE TABLE `order`;
TRUNCATE TABLE inventory;
TRUNCATE TABLE product;
TRUNCATE TABLE warehouse;
TRUNCATE TABLE customer;
TRUNCATE TABLE supplier;
TRUNCATE TABLE company;
TRUNCATE TABLE inventory_alert_log;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Companies
INSERT INTO company (name, type, address, contact) VALUES
('TechSupply Inc', 'Manufacturer', '123 Tech Park, Bangalore, Karnataka', 'contact@techsupply.com'),
('Global Distributors Ltd', 'Distributor', '456 Market Street, Mumbai, Maharashtra', 'info@globaldist.com'),
('RetailMart Chain', 'Retailer', '789 Shopping Complex, Delhi', 'support@retailmart.com'),
('ElectroWorld Corp', 'Manufacturer', '101 Industrial Area, Pune, Maharashtra', 'sales@electroworld.com');

-- 2. Insert Suppliers
INSERT INTO supplier (name, address, contact, phone_number, company_id) VALUES
('ABC Electronics', '11 Industrial Area, Whitefield, Bangalore', 'abc@electronics.com', '+91-9876543210', 1),
('XYZ Components', '22 Tech Zone, Velachery, Chennai', 'xyz@components.com', '+91-9876543211', 1),
('Mega Supplies', '33 Warehouse Road, Gachibowli, Hyderabad', 'mega@supplies.com', '+91-9876543212', 2),
('Prime Electronics', '44 Export Zone, Ahmedabad, Gujarat', 'prime@electronics.com', '+91-9876543213', 4),
('Global Parts Inc', '55 Tech Hub, Noida, UP', 'global@parts.com', '+91-9876543214', 2);

-- 3. Insert Customers
INSERT INTO customer (name, address, email, phone_number, company_id) VALUES
('Rajesh Kumar', '101 MG Road, Bangalore, Karnataka', 'rajesh.kumar@email.com', '+91-9123456780', 3),
('Priya Sharma', '202 Park Street, Kolkata, West Bengal', 'priya.sharma@email.com', '+91-9123456781', 3),
('Amit Patel', '303 Ashram Road, Ahmedabad, Gujarat', 'amit.patel@email.com', '+91-9123456782', 3),
('Sneha Reddy', '404 Banjara Hills, Hyderabad, Telangana', 'sneha.reddy@email.com', '+91-9123456783', 3),
('Vikram Singh', '505 MI Road, Jaipur, Rajasthan', 'vikram.singh@email.com', '+91-9123456784', 3),
('Ananya Iyer', '606 Anna Nagar, Chennai, Tamil Nadu', 'ananya.iyer@email.com', '+91-9123456785', 3),
('Rohit Mehta', '707 Linking Road, Mumbai, Maharashtra', 'rohit.mehta@email.com', '+91-9123456786', 3),
('Kavya Nair', '808 MG Road, Kochi, Kerala', 'kavya.nair@email.com', '+91-9123456787', 3);

-- 4. Insert Warehouses
INSERT INTO warehouse (name, address, location, capacity, company_id) VALUES
('Bangalore Central WH', 'Whitefield Industrial Area, Bangalore', 'Bangalore, Karnataka', 50000, 1),
('Mumbai Port WH', 'Nhava Sheva Port Area, Navi Mumbai', 'Mumbai, Maharashtra', 75000, 2),
('Delhi NCR Hub', 'Manesar Industrial Zone, Gurugram', 'Delhi NCR, Haryana', 60000, 3),
('Chennai Logistics Center', 'Sriperumbudur Industrial Park, Chennai', 'Chennai, Tamil Nadu', 45000, 1),
('Hyderabad Distribution', 'Genome Valley, Shamirpet, Hyderabad', 'Hyderabad, Telangana', 55000, 2);

-- 5. Insert Products
INSERT INTO product (name, description, category, unit_price, manufacturer, availability, supplier_id) VALUES
('Dell XPS 13 Laptop', '13-inch, Intel i7-1355U, 16GB RAM, 512GB SSD', 'Electronics', 95000.00, 'Dell Technologies', TRUE, 1),
('Apple iPhone 15 Pro', '256GB, Titanium Blue, A17 Pro chip', 'Electronics', 134900.00, 'Apple Inc', TRUE, 1),
('Samsung 55" QLED TV', '55-inch 4K Smart QLED TV, Quantum Processor', 'Electronics', 67990.00, 'Samsung Electronics', TRUE, 2),
('Sony WH-1000XM5', 'Premium Noise Cancelling Wireless Headphones', 'Audio', 29990.00, 'Sony Corporation', TRUE, 2),
('HP LaserJet Pro M428fdw', 'Multifunction Laser Printer with WiFi', 'Office Equipment', 28500.00, 'HP Inc', TRUE, 3),
('Logitech MX Master 3S', 'Wireless Performance Mouse, 8K DPI', 'Accessories', 9495.00, 'Logitech', TRUE, 3),
('Corsair K95 RGB', 'Mechanical Gaming Keyboard, Cherry MX Switches', 'Accessories', 16999.00, 'Corsair Gaming', TRUE, 4),
('SanDisk Ultra 256GB', 'USB 3.2 Flash Drive, 400MB/s', 'Storage', 2499.00, 'SanDisk', TRUE, 5),
('Lenovo ThinkPad X1', '14-inch, Intel i7-1365U, 32GB RAM, 1TB SSD', 'Electronics', 145000.00, 'Lenovo', TRUE, 1),
('JBL Flip 6', 'Portable Bluetooth Speaker, IP67 Waterproof', 'Audio', 11999.00, 'JBL', TRUE, 2),
('Seagate 2TB HDD', 'External Hard Drive, USB 3.0, Portable', 'Storage', 5499.00, 'Seagate', TRUE, 5),
('TP-Link Archer AX3000', 'WiFi 6 Router, Dual Band, Gigabit', 'Networking', 7999.00, 'TP-Link', TRUE, 4);

-- 6. Insert Inventory
INSERT INTO inventory (product_id, warehouse_id, quantity, reorder_level) VALUES
(1, 1, 45, 10),(2, 1, 25, 8),(7, 1, 120, 20),(9, 1, 30, 5),
(3, 2, 80, 15),(4, 2, 60, 12),(8, 2, 450, 50),(11, 2, 200, 30),
(5, 3, 35, 8),(6, 3, 150, 25),(10, 3, 90, 15),(12, 3, 110, 20),
(1, 4, 20, 5),(3, 4, 55, 10),(4, 4, 40, 10),(10, 4, 75, 15),
(2, 5, 15, 5),(5, 5, 25, 5),(7, 5, 95, 15),(8, 5, 380, 40);

-- 7. Insert Orders
INSERT INTO `order` (date, total_amount, status, priority, customer_id, retailer_id) VALUES
(DATE_SUB(NOW(), INTERVAL 10 DAY), 124990.00, 'Delivered', 'High', 1, NULL),
(DATE_SUB(NOW(), INTERVAL 8 DAY), 95000.00, 'Delivered', 'Medium', 2, NULL),
(DATE_SUB(NOW(), INTERVAL 5 DAY), 67990.00, 'Shipped', 'Low', 3, NULL),
(DATE_SUB(NOW(), INTERVAL 3 DAY), 46994.00, 'Processing', 'Medium', 4, NULL),
(DATE_SUB(NOW(), INTERVAL 2 DAY), 134900.00, 'Pending', 'High', 5, NULL),
(DATE_SUB(NOW(), INTERVAL 1 DAY), 173490.00, 'Processing', 'High', 6, NULL),
(NOW(), 41989.00, 'Pending', 'Low', 7, NULL),
(NOW(), 19494.00, 'Pending', 'Medium', 8, NULL);

-- 8. Insert Order Lines
INSERT INTO order_line (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 95000.00),(1, 4, 1, 29990.00),(2, 1, 1, 95000.00),(3, 3, 1, 67990.00),
(4, 4, 1, 29990.00),(4, 6, 1, 9495.00),(4, 12, 1, 7999.00),(5, 2, 1, 134900.00),
(6, 9, 1, 145000.00),(6, 5, 1, 28500.00),(7, 10, 2, 11999.00),(7, 8, 5, 2499.00),
(7, 12, 1, 7999.00),(8, 6, 2, 9495.00);

-- 9. Insert Payments
INSERT INTO payment (order_id, amount, type, method, status, payment_date) VALUES
(1, 124990.00, 'Full Payment', 'Credit Card', 'Completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 95000.00, 'Full Payment', 'UPI', 'Completed', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(3, 67990.00, 'Full Payment', 'Net Banking', 'Completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 46994.00, 'Full Payment', 'Debit Card', 'Completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 134900.00, 'Full Payment', 'Credit Card', 'Pending', NULL),
(6, 173490.00, 'Full Payment', 'UPI', 'Completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 41989.00, 'Full Payment', 'Net Banking', 'Pending', NULL);

-- 10. Insert Shipments
INSERT INTO shipment (order_id, status, carrier, company_id, tracking_number, estimated_arrival, actual_arrival) VALUES
(1, 'Delivered', 'BlueDart Express', 1, 'BD1234567890IN', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(2, 'Delivered', 'DTDC Courier', 2, 'DT9876543210IN', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(3, 'In Transit', 'FedEx India', 1, 'FX4567891230IN', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NULL),
(4, 'Preparing', 'Delhivery', 3, 'DV7891234560IN', DATE_ADD(CURDATE(), INTERVAL 4 DAY), NULL),
(6, 'In Transit', 'BlueDart Express', 1, 'BD5678901234IN', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL);

-- 11. Insert Transactions
INSERT INTO `transaction` (payment_id, date, type, amount, remarks) VALUES
(1, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Credit', 124990.00, 'Payment received for Order #1 - Dell XPS + Sony Headphones'),
(2, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Credit', 95000.00, 'Payment received for Order #2 - Dell XPS 13'),
(3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Credit', 67990.00, 'Payment received for Order #3 - Samsung TV'),
(4, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Credit', 46994.00, 'Payment received for Order #4 - Multiple items'),
(6, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Credit', 173490.00, 'Payment received for Order #6 - Lenovo ThinkPad + HP Printer');

SELECT 'Sample data inserted successfully!' AS result;