import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../AuthContext';
import { SERVER_ROUTES } from '../Constants';
import './css/CreditUsage.css';

function CreditUsageWidget() {
  const { validateToken } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (validateToken()) {
      fetchCustomers();
    }
  }, [validateToken]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.CUSTOMERS);
      if (response.ok) {
        const data = await response.json();
        const highCreditUsageCustomers = data.filter(
          (customer) =>
            customer.credit_used >= customer.credit_limit * 0.9
        );
        setCustomers(highCreditUsageCustomers);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch customers:', errorText);
        setError('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching customers');
    }
  };

  const handleNotifyUser = (customerId) => {
    // You can add your logic here to notify the user
    // This could involve sending an email, SMS, push notification, etc.
    console.log(`Notifying customer with ID: ${customerId}`);
  };

  return (
    <div className="credit-usage-widget">
      <h3>Customers with High Credit Usage</h3>
      {error && <div className="error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Credit Used</th>
            <th>Credit Limit</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.customer_name}</td>
              <td>{customer.credit_used}</td>
              <td>{customer.credit_limit}</td>
              <td>
                <button onClick={() => handleNotifyUser(customer.id)}>
                  Notify User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CreditUsageWidget;