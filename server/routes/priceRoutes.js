const express = require('express');
const router = express.Router();
const db = require('../dbConnection');

// Route to fetch and display price details
router.get('/prices', (req, res) => {
  db.query(`SELECT pr.id, pr.product_id, pr.customer_id, pr.price, DATE_FORMAT(pr.effective_time, '%Y-%m-%dT%H:%i:%s') AS effective_time, DATE_FORMAT(pr.expiry_time, '%Y-%m-%dT%H:%i:%s') AS expiry_time, pr.created_by, pr.last_modified_by, pr.created_time, pr.last_modified_time, p.product_type, p.product_name, p.unit_size, p.pack_size, s.supplier_name FROM price pr JOIN product p ON pr.product_id = p.id JOIN supplier s ON p.supplier_id = s.id WHERE pr.customer_id = ? AND pr.expiry_time > NOW();`, [req.query.customerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(results);
  });
});

// Add price
router.post('/prices', (req, res) => {
  const { product_id, customer_id, price, effective_time, expiry_time, created_by, last_modified_by } = req.body;
  const query = 'INSERT INTO price (product_id, customer_id, price, effective_time, expiry_time, created_by, last_modified_by) VALUES (?, ?, ?, STR_TO_DATE(?, \'%Y-%m-%dT%H:%i\'), STR_TO_DATE(?, \'%Y-%m-%dT%H:%i\'), ?, ?)';
  db.query(query, [product_id, customer_id, price, effective_time, expiry_time, created_by, last_modified_by], (err, result) => {
    if (err) {
      console.error('Error adding price:', err);
      res.status(500).json({ error: 'Failed to add price' });
      return;
    }
    res.status(201).json({ id: result.insertId });
  });
  console.log('Added new price: ', price);
});

// Update price
router.put('/prices/:id', (req, res) => {
  const priceId = req.params.id;
  const { product_id, customer_id, price, effective_time, expiry_time, last_modified_by } = req.body;
  const query = 'UPDATE price SET product_id = ?, customer_id = ?, price = ?, effective_time = ?, expiry_time = ?, last_modified_by = ? WHERE id = ?';
  db.query(query, [product_id, customer_id, price, effective_time, expiry_time, last_modified_by, priceId], (err, result) => {
    if (err) {
      console.error('Error updating price:', err);
      res.status(500).json({ error: 'Failed to update price' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Price not found' });
      return;
    }
    res.status(200).json({ message: 'Price updated successfully' });
  });
});

module.exports = router;