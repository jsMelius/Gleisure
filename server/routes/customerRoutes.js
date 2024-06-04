const express = require('express');
const router = express.Router();
const db = require('../dbConnection');

// Route to fetch and display all customers
router.get('/customers', (req, res) => {
  db.query('SELECT * FROM customer', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(results);
  });
});

// Route to fetch and display a particular customer
router.get('/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id);

  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  const query = 'SELECT * FROM customer WHERE id = ?';
  
  db.query(query, [customerId], (err, result) => {
    if (err) {
      console.error('Error executing the query', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Route to fetch and display customers who have used 90% of their limit
router.get('/customers/credit-usage', (req, res) => {
  const query = `
    SELECT *
    FROM customer
    WHERE credit_used >= (credit_limit * 0.9)
  `;

  

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing the query', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json(results);
  });
});

// Add customer
router.post('/customers', (req, res) => {
  const {
    customer_name,
    email,
    address_line_1,
    address_line_2,
    city,
    county,
    postcode,
    phone_number,
    created_by,
    last_modified_by,
    credit_limit // Add this line to extract credit_limit from req.body
  } = req.body;

  const query = 'INSERT INTO customer (customer_name, email, address_line_1, address_line_2, city, county, postcode, phone_number, created_by, last_modified_by, credit_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [customer_name, email, address_line_1, address_line_2 || null, city, county, postcode, phone_number, created_by, last_modified_by, credit_limit], (err, result) => {
    if (err) {
      console.error('Error adding customer:', err);
      res.status(500).json({ error: 'Failed to add customer' });
      return;
    }
    res.status(201).json({ id: result.insertId });
  });

  console.log('Added new customer:', customer_name);
});

// Update customer
router.put('/customers/:id', (req, res) => {
  const { customer_name, email, address_line_1, address_line_2, city, county, postcode, phone_number, last_modified_by } = req.body;
  const customerId = req.params.id;
  const query = 'UPDATE customer SET customer_name = ?, email = ?, address_line_1 = ?, address_line_2 = ?, city = ?, county = ?, postcode = ?, phone_number = ?, last_modified_by = ? WHERE id = ?';
  db.query(query, [customer_name, email, address_line_1, address_line_2, city, county, postcode, phone_number, last_modified_by, customerId], (err, result) => {
    if (err) {
      console.error('Error updating customer:', err);
      res.status(500).json({ error: 'Failed to update customer' });
      return;
    }
    res.status(200).json({ id: customerId});
  });
  console.log('Updated existing customer: ', customer_name);
});

// Delete customer
router.delete('/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const query = 'DELETE FROM customer WHERE id = ?';
  db.query(query, [customerId], (err, result) => {
    if (err) {
      console.error('Error deleting customer:', err);
      res.status(500).json({ error: 'Failed to delete customer' });
      return;
    }
    res.status(204).end();
  });
  console.log('Deleted existing customer with Id: ', customerId);
});

module.exports = router;