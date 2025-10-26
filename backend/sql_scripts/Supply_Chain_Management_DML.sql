-- =====================================================
-- 2_SCM_Portal_DML.sql (MySQL 8.x • Final Sample Data)
-- Compatible with SCM_Portal_Final_DDL.sql
-- =====================================================

USE scm_portal;

-- =====================================================
-- 1️⃣ Disable checks for safe cleanup and reseeding
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- Truncate in reverse dependency order
TRUNCATE TABLE logs;
TRUNCATE TABLE transaction_log;
TRUNCATE TABLE payment;
TRUNCATE TABLE shipment;
TRUNCATE TABLE order_line;
TRUNCATE TABLE orders;
TRUNCATE TABLE inventory;
TRUNCATE TABLE product_supplier;
TRUNCATE TABLE product;
TRUNCATE TABLE warehouse;
TRUNCATE TABLE customer;
TRUNCATE TABLE supplier;
TRUNCATE TABLE company;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 2️⃣ RBAC SEED DATA
-- =====================================================

-- Roles
INSERT INTO roles (role_name, description) VALUES
('admin','System administrator with full access'),
('manager','Oversees operations and suppliers'),
('warehouse','Manages inventory and shipments'),
('sales','Manages orders and customers');

-- Permissions
INSERT INTO permissions (permission_key, description) VALUES
('company:read','View company details'),
('company:write','Create or update companies'),
('orders:read','View orders'),
('orders:write','Create and modify orders'),
('inventory:read','View inventory'),
('inventory:update','Adjust stock levels'),
('payments:read','View payments'),
('payments:write','Process payments');

-- Role-Permission Mapping
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE
(r.role_name = 'admin')
OR (r.role_name = 'manager' AND p.permission_key LIKE 'orders:%')
OR (r.role_name = 'warehouse' AND p.permission_key LIKE 'inventory:%')
OR (r.role_name = 'sales' AND p.permission_key LIKE 'payments:%');

-- Users
INSERT INTO users (email,password_hash,full_name) VALUES
('admin@scmportal.com','admin123hashed','Portal Admin'),
('manager@scmportal.com','manager123hashed','Ops Manager'),
('warehouse@scmportal.com','warehouse123hashed','Warehouse Staff'),
('sales@scmportal.com','sales123hashed','Sales Executive');

-- User Roles
INSERT INTO user_roles (user_id,role_id) VALUES
(1,1),(2,2),(3,3),(4,4);

-- =====================================================
-- 3️⃣ COMPANY MASTER DATA (30 companies)
-- =====================================================
INSERT INTO company (name,type,address,contact_phone,contact_email) VALUES
('Alpha Manufacturing Co','Manufacturer','123 Main St Bengaluru','080-12345678','info@alpha-mfg.com'),
('Beta Distribution Ltd','Distributor','78 Industrial Park Mysuru','082-98765432','sales@beta-dist.com'),
('Gamma Retailers Pvt Ltd','Retailer','45 High Street Bengaluru','080-87654321','contact@gamma-retail.com'),
('Delta Components Inc','Manufacturer','56 Tech Avenue Chennai','044-55566677','info@delta-comp.com'),
('Epsilon Logistics Ltd','Distributor','101 Warehouse Way Hyderabad','040-44433322','support@epsilon-log.com'),
('Zeta Retail Chain','Retailer','90 Mall Road Pune','020-77788899','info@zeta-retail.com'),
('Eta Industrial Supplies','Distributor','150 Industrial Estate Coimbatore','0422-11122233','sales@eta-ind.com'),
('Theta Manufacturing Works','Manufacturer','200 Factory Lane Ahmedabad','079-22233344','prod@theta-works.com'),
('Iota Goods Pvt Ltd','Distributor','12 Commerce Street Kolkata','033-55544433','info@iota-goods.com'),
('Kappa Retail Mart','Retailer','77 Shopping Plaza Kochi','0484-99988877','hello@kappa-mart.com'),
('Lambda Supply Chain Co','Distributor','310 Distribution Hub Jaipur','0141-66655544','contact@lambda-supply.com'),
('Mu Electronics Manufacturing','Manufacturer','89 Tech Park Bengaluru','080-33322211','support@mu-elec.com'),
('Nu Textiles Ltd','Manufacturer','32 Fabric Road Surat','0261-11223344','info@nu-textiles.com'),
('Xi Home Appliances','Distributor','15 Market Street New Delhi','011-44455566','sales@xi-home.com'),
('Omicron Retail Outlets','Retailer','22 Central Plaza Lucknow','0522-88877766','store@omicron.com'),
('Pi Auto Parts Pvt Ltd','Distributor','400 Auto Park Pune','020-22334455','orders@pi-autoparts.com'),
('Rho Pharma Manufacturing','Manufacturer','55 Biotech Road Hyderabad','040-99988877','info@rho-pharma.com'),
('Sigma Grocery Retail','Retailer','300 Shopping Lane Indore','0731-44433322','contact@sigma-grocery.com'),
('Tau Packaging Solutions','Distributor','65 Packaging Estate Kanpur','0512-11122233','sales@tau-pack.com'),
('Upsilon Furniture Works','Manufacturer','78 Wood Drive Bhopal','0755-66655544','info@upsilon-furniture.com'),
('Phi Fashion Retailers','Retailer','99 Style Street Chennai','044-77766655','help@phi-fashion.com'),
('Chi Construction Supplies','Distributor','120 Builder Road Nashik','0253-22233344','sales@chi-supplies.com'),
('Psi Tech Components','Manufacturer','47 Silicon Valley Rd Bengaluru','080-55544433','support@psi-tech.com'),
('Omega Retail & More','Retailer','150 Mega Mall Ahmedabad','079-88877766','service@omega-retail.com'),
('Apex Logistics Pvt Ltd','Distributor','220 Cargo Point Vizag','0891-33322211','info@apex-log.com'),
('Vertex Manufacturing Ltd','Manufacturer','130 Industrial Zone Lucknow','0522-11133344','contact@vertex-mfg.com'),
('Nova Consumer Goods','Distributor','75 Retail Park Bengaluru','080-44433322','sales@nova-consumer.com'),
('Prime Tech Manufacturing','Manufacturer','8 Innovation Drive Pune','020-77766655','production@prime-tech.com'),
('Elite Retail Chains','Retailer','44 Shopping Blvd Hyderabad','040-22211133','service@elite-retail.com'),
('Omni Supply Services','Distributor','60 Logistics Hub Chennai','044-11122233','info@omni-supply.com');

-- =====================================================
-- 4️⃣ SUPPLIERS
-- =====================================================
INSERT INTO supplier (company_id,name,address,phone,email) VALUES
(1,'Alpha Raw Materials','Plant Rd Bengaluru','080-45678912','raw@alpha.com'),
(4,'Delta Precision Parts','Chennai Industrial Estate','044-12345678','parts@delta.com'),
(12,'Mu Components','Tech Park Bengaluru','080-33322999','supply@mu.com'),
(17,'Rho Pharma Inputs','Biotech Park Hyderabad','040-45612378','inputs@rho.com'),
(28,'Prime Machine Parts','Innovation Drive Pune','020-77766000','parts@prime-tech.com');

-- =====================================================
-- 5️⃣ CUSTOMERS
-- =====================================================
INSERT INTO customer (company_id,name,address,phone,email) VALUES
(3,'Gamma Flagship Store','45 High Street Bengaluru','080-12398745','store@gamma.com'),
(6,'Zeta City Mart','90 Mall Road Pune','020-45612378','citymart@zeta.com'),
(15,'Omicron Superstore','22 Central Plaza Lucknow','0522-99887766','super@omicron.com'),
(23,'Omega Outlet Central','150 Mega Mall Ahmedabad','079-60011122','outlet@omega.com'),
(29,'Elite Premium Outlet','44 Shopping Boulevard Hyderabad','040-77788899','premium@elite.com');

-- =====================================================
-- 6️⃣ WAREHOUSES
-- =====================================================
INSERT INTO warehouse (company_id,name,address,location,capacity) VALUES
(2,'Beta Central Warehouse','Mysuru','Industrial Zone 1',100000),
(5,'Epsilon Main Warehouse','Hyderabad','Logistics Hub A',120000),
(11,'Lambda Regional Warehouse','Jaipur','North Zone',80000),
(26,'Prime Tech Warehouse','Pune','Tech Zone',60000),
(24,'Apex Distribution Hub','Vizag','South Port Zone',90000);

-- =====================================================
-- 7️⃣ PRODUCTS
-- =====================================================
INSERT INTO product (name,sku,category,description,unit_price,manufacturer_id) VALUES
('AlphaPhone X1','SKU-APX1','Smartphone','5.8-inch display | 64 GB | 4 GB RAM',14999,1),
('AlphaPad 8','SKU-AP8','Tablet','8-inch tablet | Wi-Fi + LTE',10999,1),
('MuSound Headset Pro','SKU-MSHP','Audio','Bluetooth ANC Headset',3999,12),
('PrimeCook Mixer 500','SKU-PC500','Home Appliance','500 W kitchen mixer grinder',5999,28),
('PrimeGrind CoffeeMaker','SKU-PGCM','Home Appliance','1.2 L drip coffee machine',3499,28),
('NuCotton Fabric Roll 10 m','SKU-NFR10','Textiles','Cotton fabric roll 10 m',1200,13),
('PiBrake Pad Set','SKU-PBPS','Auto Parts','Front brake pads for sedans',2499,16),
('DeltaSensor R100','SKU-DSR100','Electronics','Industrial temperature sensor',1750,4),
('RhoCure Tablet 50 mg','SKU-RCT50','Pharma','Pack of 10 tablets',199,17),
('UpsilonChair Model A','SKU-UCHA','Furniture','Ergonomic office chair',5999,20),
('OmegaSmart TV 32"','SKU-OSTV32','Electronics','32" HD Smart LED TV',12999,23),
('ZetaGrocery Pack 5 kg','SKU-ZGP5','Grocery','Mixed staples pack 5 kg',850,18),
('TauPack Box L','SKU-TBOXL','Packaging','Large corrugated box',35,19),
('PsiCircuit Board V2','SKU-PCBV2','Electronics','Controller PCB assembly',499,22),
('VertexBolt M12','SKU-VBM12','Hardware','M12 bolts box of 100',799,26),
('SigmaSnack ChocoBar','SKU-SSCB','Grocery','Chocolate wafer bar',25,17),
('XiAir Fryer 3 L','SKU-XAF3','Home Appliance','3 L oil-free air fryer',6999,14),
('OmegaPower Bank 10000 mAh','SKU-OPB10','Accessories','Portable charger 10000 mAh',1299,23),
('AlphaWidget Industrial','SKU-AWI','Parts','Industrial widget',299,1),
('NovaLED Tube 18 W','SKU-NLT18','Lighting','18 W LED tube light',249,27);

-- =====================================================
-- 8️⃣ PRODUCT_SUPPLIER
-- =====================================================
INSERT INTO product_supplier (product_id, supplier_id, supplier_price, lead_time_days, primary_supplier) VALUES
(1,1,12000,10,TRUE),
(8,2,1500,7,TRUE),
(3,3,3000,5,TRUE),
(9,4,150,3,TRUE),
(4,5,4500,15,TRUE);

-- =====================================================
-- 9️⃣ INVENTORY
-- =====================================================
INSERT INTO inventory (warehouse_id,product_id,quantity,reorder_level) VALUES
(1,1,250,50),(1,2,200,40),(2,3,150,30),(2,5,100,20),(3,9,400,100),
(4,4,80,20),(4,17,60,15),(5,11,120,30),(5,20,300,50);

-- =====================================================
-- 🔟 ORDERS + ORDER LINES
-- =====================================================
INSERT INTO orders (customer_id,priority,status,total_amount,created_by) VALUES
(1,'High','NEW',0.00,4),
(2,'Medium','NEW',0.00,4),
(3,'Low','NEW',0.00,4),
(5,'High','NEW',0.00,4);

INSERT INTO order_line (order_id,product_id,quantity,price) VALUES
(1,1,2,14999),(1,11,1,12999),(2,12,10,850),
(2,16,50,25),(3,7,4,2499),(4,4,2,5999);

UPDATE orders o
SET total_amount = (
  SELECT COALESCE(SUM(ol.quantity * ol.price),0)
  FROM order_line ol WHERE ol.order_id = o.order_id
);

-- =====================================================
-- 11️⃣ SHIPMENTS
-- =====================================================
INSERT INTO shipment (order_id,carrier_company,tracking_number,status,estimated_arrival) VALUES
(1,'RapidTrans Logistics','RT-10001','IN_TRANSIT',DATE_ADD(NOW(),INTERVAL 4 DAY)),
(2,'CityFreight Couriers','CF-20002','PENDING',DATE_ADD(NOW(),INTERVAL 2 DAY)),
(3,'AutoShip Express','AS-30003','PENDING',DATE_ADD(NOW(),INTERVAL 5 DAY)),
(4,'HomeDeliver','HD-40004','PENDING',DATE_ADD(NOW(),INTERVAL 3 DAY));

-- =====================================================
-- 12️⃣ PAYMENTS + TRANSACTIONS
-- =====================================================
INSERT INTO payment (order_id,type,method,amount,status) VALUES
(1,'FULL','ONLINE',(SELECT total_amount FROM orders WHERE order_id=1),'SUCCESS'),
(2,'PARTIAL','CARD',1000,'PENDING'),
(3,'FULL','CARD',(SELECT total_amount FROM orders WHERE order_id=3),'SUCCESS'),
(4,'FULL','ONLINE',(SELECT total_amount FROM orders WHERE order_id=4),'SUCCESS');

INSERT INTO transaction_log (payment_id,type,amount,remarks) VALUES
(1,'DEBIT',(SELECT amount FROM payment WHERE payment_id=1),'Full payment for order 1'),
(2,'DEBIT',1000,'Partial payment for order 2'),
(3,'DEBIT',(SELECT amount FROM payment WHERE payment_id=3),'Full payment for order 3'),
(4,'DEBIT',(SELECT amount FROM payment WHERE payment_id=4),'Full payment for order 4');

-- =====================================================
-- 13️⃣ LOGS (Audit Trail)
-- =====================================================
INSERT INTO logs (entity,entity_id,action,remarks,created_at) VALUES
('company',1,'SEED','30 companies seeded',NOW()),
('product',1,'SEED','20 products added',NOW()),
('inventory',1,'SEED','Initial stock setup',NOW()),
('orders',1,'SEED','Demo orders inserted',NOW());

-- =====================================================
-- 14️⃣ Re-enable safety settings
-- =====================================================
SET SQL_SAFE_UPDATES = 1;
