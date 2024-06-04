const express = require('express');
const router = express.Router();
const db = require('../dbConnection');
const jwt = require('jsonwebtoken');

const secret_key = "1c1d6565f68a983214b046359d8e19a5fbea314a";
const time_out = "30m";

// Route for user login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM user WHERE email = ? AND password_hash = SHA2(?, 256)', [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      
      const user = results[0];
      // User authenticated
      // Create JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, secret_key, { expiresIn: time_out });

      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

module.exports = router;