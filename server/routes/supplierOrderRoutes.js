const express = require('express');
const router = express.Router();
const db = require('../dbConnection');

// Route to get all supplier orders with associated customer details
router.get('/supplier-orders', (req, res) => {
    db.query('SELECT o.*, c.customer_name, c.email FROM supplier_orders o JOIN customer c ON o.customer_id = c.id', (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            res.status(500).json({ error: 'Failed to fetch orders' });
            return;
        }
        res.status(200).json(results);
    });
});

router.get('/suppliers', (req, res) => {
  db.query('SELECT * FROM supplier', (err, results) => {
    if (err) {
      console.error('Error fetching suppliers:', err);
      res.status(500).json({ error: 'Failed to fetch suppliers' });
      return;
    }
    res.status(200).json(results);
  });
});

// Additional routes as required
module.exports = router;
