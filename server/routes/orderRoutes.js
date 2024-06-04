const express = require('express');
const router = express.Router();
const db = require('../dbConnection');

// Route to get all orders with associated customer details
router.get('/orders', (req, res) => {
    db.query('SELECT o.*, c.customer_name, c.email FROM orders o JOIN customer c ON o.customer_id = c.id', (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            res.status(500).json({ error: 'Failed to fetch orders' });
            return;
        }
        res.status(200).json(results);
    });
});

// Route to add a new order
router.post('/orders', (req, res) => {
    // Extract data from the request body
    const { customer_id, order_status, sub_total, vat, total, created_by, last_modified_by } = req.body;
  
    // SQL query to check the customer's credit limit and credit used
    const creditQuery = `
      SELECT credit_limit, credit_used
      FROM customer
      WHERE id = ?
    `;
  
    // Execute the credit query
    db.query(creditQuery, [customer_id], (err, creditResult) => {
      if (err) {
        console.error('Error checking credit limit:', err);
        res.status(500).json({ error: 'Failed to check credit limit' });
        return;
      }
  
      if (creditResult.length === 0) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
  
      let { credit_limit, credit_used } = creditResult[0];
      let newOrderStatus = order_status;
      credit_limit = parseInt(credit_limit);
      credit_used = parseInt(credit_used);

  
      // Check if the new order will exceed the credit limit
      if (credit_used + total > credit_limit) {
        newOrderStatus = 'Awaiting Approval';
      } else {
        newOrderStatus = 'Placed';
      }
  
      const orderQuery = `
        INSERT INTO orders (customer_id, order_status, sub_total, vat, total, created_by, last_modified_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
  
      // Execute the order query
      db.query(orderQuery, [customer_id, newOrderStatus, sub_total, vat, total, created_by, last_modified_by], (err, orderResult) => {
        if (err) {
          console.error('Error adding order:', err);
          res.status(500).json({ error: 'Failed to add order' });
          return;
        }
  
        // If the order is successfully added and the status is 'Placed', update the customer's credit_used
        if (newOrderStatus === 'Placed') {
          const updateCreditQuery = `
            UPDATE customer
            SET credit_used = credit_used + ?
            WHERE id = ?
          `;
  
          db.query(updateCreditQuery, [total, customer_id], (err, updateResult) => {
            if (err) {
              console.error('Error updating credit used:', err);
              res.status(500).json({ error: 'Failed to update credit used' });
              return;
            }
  
            // Return the ID of the new order and the updated status
            res.status(201).json({ id: orderResult.insertId, status: newOrderStatus });
          });
        } else {
          // If the order status is not 'Placed', return the ID of the new order and the status
          res.status(201).json({ id: orderResult.insertId, status: newOrderStatus });
        }
      });
    });
  });

  

// Route to update order status by order ID
router.put('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { order_status } = req.body;

  // Fetch the order details
  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order details:', err);
      res.status(500).json({ error: 'Failed to fetch order details' });
      return;
    }

    if (orderResults.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = orderResults[0];

    // Check if the order status is changing from "awaiting_approval" to "placed"
    if (order.order_status === 'Awaiting Approval' && order_status === 'Placed') {
      // Update the customer's credit_used
      db.query('UPDATE customer SET credit_used = credit_used + ? WHERE id = ?', [order.total, order.customer_id], (err, customerResult) => {
        if (err) {
          console.error('Error updating customer credit_used:', err);
          res.status(500).json({ error: 'Failed to update customer credit_used' });
          return;
        }

        // Update the order status
        db.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, orderId], (err, result) => {
          if (err) {
            console.error('Error updating order status:', err);
            res.status(500).json({ error: 'Failed to update order status' });
            return;
          }

          res.status(200).json({ message: 'Order status updated successfully' });
        });
      });
    } else {
      // Update the order status without modifying the customer's credit_used
      db.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, orderId], (err, result) => {
        if (err) {
          console.error('Error updating order status:', err);
          res.status(500).json({ error: 'Failed to update order status' });
          return;
        }

        res.status(200).json({ message: 'Order status updated successfully' });
      });
    }
  });
});

// Route to get order items by order ID
router.get('/orderItems/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    db.query('SELECT * FROM orderItem WHERE order_id = ?', [orderId], (err, results) => {
        if (err) {
            console.error('Error fetching order items:', err);
            res.status(500).json({ error: 'Failed to fetch order items' });
            return;
        }
        res.status(200).json(results);
    });
});

// Route to add a list of order items
router.post('/orderItems', (req, res) => {
    const orderItems = req.body; // Assuming req.body contains an array of order items

    // Example query to insert multiple order items into the database
    const query = 'INSERT INTO orderItem (order_id, supplier_name, product_type, product_name, unit_size, pack_size, unit_price, quantity, price, created_by, last_modified_by) VALUES ?';

    // Extract values from each order item
    const values = orderItems.map(orderItem => [
        orderItem.order_id,
        orderItem.supplier_name,
        orderItem.product_type,
        orderItem.product_name,
        orderItem.unit_size,
        orderItem.pack_size,
        orderItem.unit_price,
        orderItem.quantity,
        orderItem.price,
        orderItem.created_by,
        orderItem.last_modified_by
    ]);

    // Execute the query
    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error adding order items:', err);
            res.status(500).json({ error: 'Failed to add order items' });
            return;
        }
        res.status(201).json({ message: 'Order items added successfully' });
    });
});

// Route to delete an order by order ID
router.delete('/orders/:id', (req, res) => {
  const orderId = req.params.id;

  // Delete order items first
  db.query('DELETE FROM orderItem WHERE order_id = ?', [orderId], (err, orderItemResult) => {
      if (err) {
          console.error('Error deleting order items:', err);
          res.status(500).json({ error: 'Failed to delete order items' });
          return;
      }

      // Delete the order
      db.query('DELETE FROM orders WHERE id = ?', [orderId], (err, orderResult) => {
          if (err) {
              console.error('Error deleting order:', err);
              res.status(500).json({ error: 'Failed to delete order' });
              return;
          }

          res.status(200).json({ message: 'Order deleted successfully' });
      });
  });
});

// Route to get all supplier orders
router.get('/supplierOrders', (req, res) => {
  db.query('SELECT * FROM supplier_orders', (err, results) => {
      if (err) {
          console.error('Error fetching supplier orders:', err);
          res.status(500).json({ error: 'Failed to fetch supplier orders' });
          return;
      }
      res.status(200).json(results);
  });
});

// Route to update supplier order status by supplier order ID
router.put('/supplierOrders/:id', (req, res) => {
  const supplierOrderId = req.params.id;
  const { order_status } = req.body;

  const query = 'UPDATE supplier_orders SET order_status = ? WHERE id = ?';

  db.query(query, [order_status, supplierOrderId], (err, result) => {
      if (err) {
          console.error('Error updating supplier order status:', err);
          res.status(500).json({ error: 'Failed to update supplier order status' });
          return;
      }
      res.status(200).json({ message: 'Supplier order status updated successfully' });
  });
});

// Route to delete a supplier order by supplier order ID
router.delete('/supplierOrders/:id', (req, res) => {
  const supplierOrderId = req.params.id;

  db.query('DELETE FROM supplier_orders WHERE id = ?', [supplierOrderId], (err, result) => {
      if (err) {
          console.error('Error deleting supplier order:', err);
          res.status(500).json({ error: 'Failed to delete supplier order' });
          return;
      }
      res.status(200).json({ message: 'Supplier order deleted successfully' });
  });
});

router.get('/deliveries', (req, res) => {
  db.query('SELECT * FROM deliveries', (err, results) => {
      if (err) {
          console.error('Error fetching deliveries:', err);
          res.status(500).json({ error: 'Failed to fetch deliveries' });
          return;
      }
      res.status(200).json(results);
  });
});


router.delete('/deliveries/:id', (req, res) => {
  const deliveryId = req.params.id;

  db.query('DELETE FROM deliveries WHERE id = ?', [deliveryId], (err, result) => {
    if (err) {
      console.error('Error deleting delivery:', err);
      res.status(500).json({ error: 'Failed to delete delivery' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    res.status(200).json({ message: 'Delivery deleted successfully' });
  });
});

router.put('/deliveries/:id/status', (req, res) => {
  const deliveryId = req.params.id;
  const { status } = req.body;

  db.query('UPDATE deliveries SET status = ? WHERE id = ?', [status, deliveryId], (err, result) => {
    if (err) {
      console.error('Error updating delivery status:', err);
      res.status(500).json({ error: 'Failed to update delivery status' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    res.status(200).json({ message: 'Delivery status updated successfully' });
  });
});


module.exports = router;
