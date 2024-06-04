import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../AuthContext';
import { SERVER_ROUTES } from '../Constants';

function OrderWidget() {
  const { validateToken } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (validateToken()) {
      fetchOrders();
    }
  }, [validateToken]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.ORDERS);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const GBPFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="order-widget">
      <h3>Recent Orders</h3>
      {error && <div className="error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer_name}</td>
              <td>{GBPFormatter.format(order.total)}</td>
              <td>{order.order_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderWidget;