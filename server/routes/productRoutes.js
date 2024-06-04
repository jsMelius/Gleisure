const express = require('express');
const router = express.Router();
const db = require('../dbConnection');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.csv$/)) {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  }
}).single('file');

router.post('/products/csv', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'File upload error' });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        // Process the results and insert into the database
        const query =
          'INSERT INTO product (supplier_id, product_type, product_name, unit_size, pack_size, created_by, last_modified_by) VALUES ?';
        const values = results.map((result) => [
          result.supplier_id,
          result.product_type,
          result.product_name,
          result.unit_size,
          result.pack_size,
          result.created_by,
          result.last_modified_by,
        ]);

        db.query(query, [values], (err, result) => {
          if (err) {
            console.error('Error adding products:', err);
            res.status(500).json({ error: 'Failed to add products' });
            return;
          }
          res.status(201).json({ message: 'Products added successfully' });
        });

        console.log('Added new products from CSV');
      });
  });
});
module.exports = router;

// Route to fetch and display product details
router.get('/products', (req, res) => {
  db.query('SELECT p.*, s.supplier_name FROM product p JOIN supplier s ON p.supplier_id = s.id', (err, results) => {
    //console.log(results)
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(results);
  });
  
});

// Add product
router.post('/products', (req, res) => {
  const { supplier_id, product_type, product_name, unit_size, pack_size, created_by, last_modified_by } = req.body;
  const query = 'INSERT INTO product (supplier_id, product_type, product_name, unit_size, pack_size, created_by, last_modified_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [supplier_id, product_type, product_name, unit_size, pack_size, created_by, last_modified_by], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      res.status(500).json({ error: 'Failed to add product' });
      return;
    }
    res.status(201).json({ id: result.insertId });
  });
  console.log('Added new product: ', product_name);
});



// Update product
router.put('/products/:id', (req, res) => {
  const { supplier_id, product_type, product_name, unit_size, pack_size, last_modified_by } = req.body;
  const productId = req.params.id;
  const query = 'UPDATE product SET supplier_id = ?, product_type = ?, product_name = ?, unit_size = ?, pack_size = ?, last_modified_by = ? WHERE id = ?';
  db.query(query, [supplier_id, product_type, product_name, unit_size, pack_size, last_modified_by, productId], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Failed to update product' });
      return;
    }
    res.status(200).json({ id: productId });
  });
  console.log('Updated existing product: ', product_name);
});

// Delete product
router.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  const query = 'DELETE FROM product WHERE id = ?';
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Failed to delete product' });
      return;
    }
    res.status(204).end();
  });
  console.log('Deleted existing product with Id: ', productId);
});

module.exports = router;