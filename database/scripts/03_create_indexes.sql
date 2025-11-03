-- PostgreSQL: \c scm_portal
-- MySQL: USE scm_portal;

-- Indexes for Foreign Keys (improve JOIN performance)
CREATE INDEX idx_supplier_company ON supplier(company_id);
CREATE INDEX idx_customer_company ON customer(company_id);
CREATE INDEX idx_warehouse_company ON warehouse(company_id);
CREATE INDEX idx_product_supplier ON product(supplier_id);
CREATE INDEX idx_order_customer ON "order"(customer_id);  -- MySQL: use `order`
CREATE INDEX idx_orderline_order ON order_line(order_id);
CREATE INDEX idx_orderline_product ON order_line(product_id);
CREATE INDEX idx_payment_order ON payment(order_id);
CREATE INDEX idx_shipment_order ON shipment(order_id);
CREATE INDEX idx_shipment_company ON shipment(company_id);
CREATE INDEX idx_transaction_payment ON transaction(payment_id);

-- Indexes for Frequently Queried Columns
CREATE INDEX idx_customer_email ON customer(email);
CREATE INDEX idx_product_category ON product(category);
CREATE INDEX idx_product_availability ON product(availability);
CREATE INDEX idx_order_status ON "order"(status);  -- MySQL: use `order`
CREATE INDEX idx_order_date ON "order"(date);      -- MySQL: use `order`
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_shipment_tracking ON shipment(tracking_number);

-- Composite Indexes for Common Query Patterns
CREATE INDEX idx_order_customer_date ON "order"(customer_id, date);  -- MySQL: use `order`
CREATE INDEX idx_inventory_warehouse_product ON inventory(warehouse_id, product_id);
CREATE INDEX idx_product_supplier_category ON product(supplier_id, category);

SELECT 'All indexes created successfully!' AS result;