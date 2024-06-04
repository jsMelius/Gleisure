import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import './css/ListingPage.css';
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function SupplierListingPage() {
  const navigate = useNavigate();
  const { validateToken } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [groupBySupplier, setGroupBySupplier] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [customer, setCustomer] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.SUPPLIER_ORDERS);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        if (groupBySupplier) {
          groupOrdersBySupplier(data);
        }
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const groupOrdersBySupplier = (orders) => {
    const grouped = orders.reduce((acc, order) => {
      if (!acc[order.supplier]) {
        acc[order.supplier] = [];
      }
      acc[order.supplier].push(order);
      return acc;
    }, {});
    setGroupedOrders(grouped);
  };

  useEffect(() => {
    if (validateToken()) {
      fetchOrders();
    } else {
      navigate(PAGE_ROUTES.LOGIN);
    }
  }, [validateToken, navigate]);

  const fetchOrderItems = async (orderId, customerId) => {
    try {
      const orderItemsResponse = await fetch(`${SERVER_ROUTES.ORDER_ITEMS}/${orderId}`);
      if (orderItemsResponse.ok) {
        const data = await orderItemsResponse.json();
        setSelectedOrderItems(data);
      } else {
        console.error('Failed to fetch order items');
      }

      const customerResponse = await fetch(`${SERVER_ROUTES.CUSTOMERS}/${customerId}`);
      if (customerResponse.ok) {
        const data = await customerResponse.json();
        setCustomer(data);
      } else {
        console.error('Failed to fetch customer details');
      }

      if (orderItemsResponse.ok && customerResponse.ok) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const updateStatus = (orderId) => {
    console.log(orderId);
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id, order.customer_id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const GBPFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const renderHeader = () => {
    let headerElement = ['id', 'customer', 'subtotal', 'Supplier', 'total', 'status', 'actions'];

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  const renderBody = () => {
    const ordersToRender = groupBySupplier ? groupedOrders : { All: orders };

    return Object.keys(ordersToRender).map(supplier => (
      <React.Fragment key={supplier}>
        {groupBySupplier && <tr><td colSpan="7"><strong>{supplier}</strong></td></tr>}
        {ordersToRender[supplier].map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.customer_name}</td>
            <td>{GBPFormatter.format(order.sub_total)}</td>
            <td>{order.supplier}</td>
            <td>{GBPFormatter.format(order.total)}</td>
            <td>{order.order_status}</td>
            <td className="operation">
              <button className="button" onClick={() => updateStatus(order.id)}>
                Update Status
              </button>
              <button className="button" onClick={() => viewOrder(order)}>
                View
              </button>
            </td>
          </tr>
        ))}
      </React.Fragment>
    ));
  };

  const handleGroupBySupplierChange = (event) => {
    setGroupBySupplier(event.target.checked);
    if (event.target.checked) {
      groupOrdersBySupplier(orders);
    }
  };

  return (
    <div>
      <Header />
      <h2 id="title">Supplier Order Page</h2>
      <div>
        <label>
          <input
            type="checkbox"
            checked={groupBySupplier}
            onChange={handleGroupBySupplierChange}
          />
          Group by Supplier
        </label>
      </div>
      {error && <div className="error">{error}</div>}
      <table id="table">
        <thead>
          <tr>{renderHeader()}</tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}

export default SupplierListingPage;