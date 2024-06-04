-- Create the database
CREATE DATABASE IF NOT EXISTS local_database;

-- Use the database
USE local_database;

-- Create a new user for the node server access
CREATE USER 'server_user'@'localhost' IDENTIFIED BY 'password123';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON local_database.* TO 'server_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Create the customer table
CREATE TABLE IF NOT EXISTS customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    county VARCHAR(255) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_by INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_by INT NOT NULL,
    last_modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create the user table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_hash CHAR(64) NOT NULL, -- Assuming SHA2-256, password hash length is 64
    created_by INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_by INT NOT NULL,
    last_modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS supplier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    created_by INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_by INT NOT NULL,
    last_modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (created_by) REFERENCES User(id),
    FOREIGN KEY (last_modified_by) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    product_type VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_size VARCHAR(20) NOT NULL,
    pack_size INT NOT NULL,
    created_by INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_by INT NOT NULL,
    last_modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES supplier(id),
    FOREIGN KEY (created_by) REFERENCES User(id),
    FOREIGN KEY (last_modified_by) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS price (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    effective_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_by INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_by INT NOT NULL,
    last_modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (created_by) REFERENCES user(id),
    FOREIGN KEY (last_modified_by) REFERENCES user(id),
    CONSTRAINT CHK_Price_Time CHECK (expiry_time > effective_time)
);

-- validate no active duplicate price is inserted for a product customer combination

DELIMITER $$

CREATE TRIGGER BeforePriceInsert
BEFORE INSERT ON price
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT * FROM price
    WHERE NEW.product_id = product_id
      AND NEW.customer_id = customer_id
      AND (
           (NEW.effective_time < expiry_time AND NEW.expiry_time > effective_time)
        OR (NEW.effective_time = effective_time AND NEW.expiry_time = expiry_time)
      )
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'An active price entry for the same product and customer in the overlapping period exists.';
  END IF;
END$$

DELIMITER ;

-- validate no active duplicate price is updated for a product customer combination

DELIMITER $$

CREATE TRIGGER BeforePriceUpdate
BEFORE UPDATE ON price
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT * FROM price
    WHERE NEW.product_id = product_id
      AND NEW.customer_id = customer_id
      AND NEW.id <> id -- Ignore the current row
      AND (
           (NEW.effective_time < expiry_time AND NEW.expiry_time > effective_time)
        OR (NEW.effective_time = effective_time AND NEW.expiry_time = expiry_time)
      )
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'An active price entry for the same product and customer in the overlapping period exists.';
  END IF;
END$$

DELIMITER ;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_status VARCHAR(255) NOT NULL,
    sub_total DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2),
    vat DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_by INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_by INT NOT NULL,
    last_modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS orderItem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_size VARCHAR(20) NOT NULL,
    pack_size INT NOT NULL,
    unit_price DECIMAL(10, 2),
    quantity INT,
    price DECIMAL(10, 2),
    created_by INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_by INT NOT NULL,
    last_modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Insert data
INSERT INTO customer (customer_name, email, address_line_1, address_line_2, city, county, postcode, phone_number, created_by, created_time, last_modified_by, last_modified_time)
VALUES 
('Company A', 'companyA@example.com', '123 Main St', 'Suite 100', 'Anytown', 'Anycounty', 'XX00 0XX', '123-456-7890', 1, NOW(), 1, NOW()),
('Company B', 'companyB@example.com', '456 Oak Ave', NULL, 'Othertown', 'Othercounty', 'YY11 1YY', '987-654-3210', 2, NOW(), 2, NOW()),
('Company C', 'companyC@example.com', '789 Elm St', NULL, 'Somewhere', 'Somecounty', 'SS22 2SS', '555-123-4567', 1, NOW(), 1, NOW());

INSERT INTO user (customer_id, email, first_name, last_name, password_hash, created_by, last_modified_by)
VALUES
(1, 'john@example.com', 'John', 'Doe', SHA2('password123', 256), 1, 1),
(1, 'jane@example.com', 'Jane', 'Smith', SHA2('abc123', 256), 1, 1),
(2, 'sam@example.com', 'Sam', 'Jones', SHA2('passw0rd', 256), 2, 2);

INSERT INTO price (product_id, customer_id, price, effective_time, expiry_time, created_by, last_modified_by, created_time, last_modified_time)
VALUES 
(2, 1, 10.99, STR_TO_DATE('2024-04-26T08:01', '%Y-%m-%dT%H:%i'), STR_TO_DATE('2024-04-26T09:01', '%Y-%m-%dT%H:%i'), 1, 1, NOW(), NOW()),
(3, 2, 15.49, STR_TO_DATE('2024-04-22T08:00', '%Y-%m-%dT%H:%i'), STR_TO_DATE('2024-04-27T08:00', '%Y-%m-%dT%H:%i'), 2, 2, NOW(), NOW()),
(2, 1, 8.75, STR_TO_DATE('2024-04-21T08:00', '%Y-%m-%dT%H:%i'), STR_TO_DATE('2024-04-26T08:00', '%Y-%m-%dT%H:%i'), 1, 2, NOW(), NOW());