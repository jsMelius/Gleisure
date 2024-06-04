const express = require('express');
const router = express.Router();
const db = require('../dbConnection');

// Route to fetch and display supplier details
router.get('/suppliers', (req, res) => {
  db.query('SELECT * FROM supplier', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(results);
  });
});

// Add supplier
router.post('/suppliers', (req, res) => {
  const { supplier_name, created_by, last_modified_by } = req.body;
  const query = 'INSERT INTO supplier (supplier_name, created_by, last_modified_by) VALUES (?, ?, ?)';
  db.query(query, [supplier_name, created_by, last_modified_by], (err, result) => {
    if (err) {
      console.error('Error adding supplier:', err);
      res.status(500).json({ error: 'Failed to add supplier' });
      return;
    }
    res.status(201).json({ id: result.insertId });
  });
  console.log('Added new supplier: ', supplier_name);
});

// Update supplier
router.put('/suppliers/:id', (req, res) => {
  const { supplier_name, last_modified_by } = req.body;
  const supplierId = req.params.id;
  const query = 'UPDATE supplier SET supplier_name = ?, last_modified_by = ? WHERE id = ?';
  db.query(query, [supplier_name, last_modified_by, supplierId], (err, result) => {
    if (err) {
      console.error('Error updating supplier:', err);
      res.status(500).json({ error: 'Failed to update supplier' });
      return;
    }
    res.status(200).json({ id: supplierId });
  });
  console.log('Updated existing supplier: ', supplier_name);
});

// Delete supplier
router.delete('/suppliers/:id', (req, res) => {
  const supplierId = req.params.id;
  const query = 'DELETE FROM supplier WHERE id = ?';
  db.query(query, [supplierId], (err, result) => {
    if (err) {
      console.error('Error deleting supplier:', err);
      res.status(500).json({ error: 'Failed to delete supplier' });
      return;
    }
    res.status(204).end();
  });
  console.log('Deleted existing supplier with Id: ', supplierId);
});

module.exports = router;