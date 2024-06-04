const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/loginRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const priceRoutes = require('./routes/priceRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierOrderRoutes = require('./routes/supplierOrderRoutes');
const cors = require('cors');
// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);


const dbConfig = {
  host: 'gliesure-dev.cprtmxryb9wu.eu-west-2.rds.amazonaws.com',
  user: 'admin',
  password: 'N1012twares$2012',
  database: 'gleisuredev'
};


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

async function pollDatabase(connection) {
  let previousResults = [];

  setInterval(async () => {
    const [rows] = await connection.execute('SELECT * FROM orders'); // Replace with your query
    if (JSON.stringify(rows) !== JSON.stringify(previousResults)) {
      previousResults = rows;
      io.emit('notification', rows); // Emit the new data to all connected clients
    }
  }, 3000); // Poll every 3 seconds
}

io.on('connection', (socket) => {
  console.log('a user connected');
});

(async () => {
  const connection = await mysql.createConnection(dbConfig);
  pollDatabase(connection);

  server.listen(3000, () => {
    console.log('listening on *:3000');
  });
})();

// Enable CORS for all routes

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Replace '*' with your frontend domain
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define a router for all API routes with /api context path
const apiRouter = express.Router();
app.use('/', apiRouter);

// Use route modules
apiRouter.use(loginRoutes);
apiRouter.use(customerRoutes);
apiRouter.use(supplierRoutes);
apiRouter.use(priceRoutes);
apiRouter.use(productRoutes);
apiRouter.use(orderRoutes);
apiRouter.use(supplierOrderRoutes);


// Start server
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});