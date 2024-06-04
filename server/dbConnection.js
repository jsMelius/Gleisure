const mysql = require('mysql2');

// Create MySQL connection
const db = mysql.createConnection({
  host: `${process.env.MYSQL_HOST}`,
  database: `${process.env.MYSQL_DATABASE}`,
  user: `${process.env.MYSQL_USER}`,
  password: `${process.env.MYSQL_PASSWORD}`
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;