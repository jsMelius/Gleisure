const express = require('express');
const router = express.Router();
const db = require('../dbConnection');

// Route to fetch and display price details for orders with status "awaiting approval"
router.get('/prices', (req, res) => {
  db.query(`
    SELECT pr.id, pr.product_id, pr.customer_id, pr.price, 
      DATE_FORMAT(pr.effective_time, '%Y-%m-%dT%H:%i:%s') AS effective_time, 
      DATE_FORMAT(pr.expiry_time, '%Y-%m-%dT%H:%i:%s') AS expiry_time, 
      pr.created_by, pr.last_modified_by, pr.created_time, pr.last_modified_time, 
      p.product_type, p.product_name, p.unit_size, p.pack_size, s.supplier_name 
    FROM price pr
    JOIN product p ON pr.product_id = p.id
    JOIN supplier s ON p.supplier_id = s.id
    WHERE pr.customer_id = ? AND pr.expiry_time > NOW() AND pr.status = 'awaiting approval';
  `, [req.query.customerId], (err, results) => {
    console.log(results);
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(results);
  });
});

module.exports = router;