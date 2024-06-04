import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import OrderDetailsModal from '../forms/OrderDetailsModal';
import './css/ListingPage.css';
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function OrderListingPage() {
  const navigate = useNavigate();
  const { validateToken, getCurrentUserId } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (validateToken()) {
      fetchOrders();
    } else {
      navigate(PAGE_ROUTES.LOGIN);
    }
  }, [validateToken, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.ORDERS);
      if (response.ok) {
        const data = await response.json();
        const filteredOrders = data.filter(order => order.order_status === 'Awaiting Approval');
        setOrders(filteredOrders);
      } else {
        console.error('Failed to fetch orders');
        setError('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const fetchOrderItems = async (orderId, customerId) => {
    try {
      const orderItemsResponse = await fetch(`${SERVER_ROUTES.ORDER_ITEMS}/${orderId}`);
      if (orderItemsResponse.ok) {
        const data = await orderItemsResponse.json();
        setSelectedOrderItems(data);
      } else {
        console.error('Failed to fetch order items');
        toast.error('Failed to fetch order items');
      }

      const customerResponse = await fetch(`${SERVER_ROUTES.CUSTOMERS}/${customerId}`);
      if (customerResponse.ok) {
        const data = await customerResponse.json();
        setCustomer(data);
      } else {
        console.error('Failed to fetch customer details');
        toast.error('Failed to fetch customer details');
      }

      if (orderItemsResponse.ok && customerResponse.ok) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Error fetching order items');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${SERVER_ROUTES.ORDERS}/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_status: status }),
      });

      if (response.ok) {
        toast.success(`Order ${status.toLowerCase()} successfully`);
        fetchOrders(); // Refresh the order list
      } else {
        console.error('Failed to update order status');
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    }
  };

  const approveOrder = (orderId) => {
    updateStatus(orderId, 'Placed');
  };

  const rejectOrder = (orderId) => {
    updateStatus(orderId, 'Rejected');
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
    maximumFractionDigits: 2,
  });

  const renderHeader = () => {
    let headerElement = ['id', 'customer', 'subtotal', 'vat', 'total', 'status', 'actions'];

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  const renderBody = () => {
    return orders && orders.map((order) => {
      return (
        <tr key={order.id}>
          <td>{order.id}</td>
          <td>{order.customer_name}</td>
          <td>{GBPFormatter.format(order.sub_total)}</td>
          <td>{GBPFormatter.format(order.vat)}</td>
          <td>{GBPFormatter.format(order.total)}</td>
          <td>{order.order_status}</td>
          <td className="operation">
            <button className="button" onClick={() => approveOrder(order.id)}>
              Approve
            </button>
            <button className="button" onClick={() => rejectOrder(order.id)}>
              Reject
            </button>
            <button className="button" onClick={() => viewOrder(order)}>
              View
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div>
      <Header />
      <ToastContainer />
      <h2 id="title">Orders Awaiting Approval</h2>
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        orderItems={selectedOrderItems}
        orderDetails={selectedOrder}
        customer={customer}
      />
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

export default OrderListingPage;
