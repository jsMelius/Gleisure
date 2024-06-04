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
  const [groupedOrders, setGroupedOrders] = useState({});
  const [groupBySupplier, setGroupBySupplier] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [customer, setCustomer] = useState(null);

  // Check if user is authenticated on mount
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
        setOrders(data);
        if (groupBySupplier) {
          groupOrdersBySupplier(data);
        }
      } else {
        console.error('Failed to fetch orders');
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error('An error occurred while fetching orders');
    }
  };

  const groupOrdersBySupplier = (orders) => {
    const grouped = orders.reduce((acc, order) => {
      if (!acc[order.supplier_name]) {
        acc[order.supplier_name] = [];
      }
      acc[order.supplier_name].push(order);
      return acc;
    }, {});
    setGroupedOrders(grouped);
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

  const updateStatus = (orderId) => {
    console.log(orderId);
    // Add your update status logic here
    toast.success(`Order status updated for ID: ${orderId}`);
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(`${SERVER_ROUTES.ORDERS}/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Order deleted successfully');
        const updatedOrders = orders.filter(order => order.id !== orderId);
        setOrders(updatedOrders);
        if (groupBySupplier) {
          groupOrdersBySupplier(updatedOrders);
        }
      } else {
        toast.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order');
    }
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

  const editItem = async (itemId, updatedItem) => {
    try {
      // Assume you have an edit item endpoint
      const response = await fetch(`${SERVER_ROUTES.ORDER_ITEMS}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (response.ok) {
        toast.success('Item edited successfully');
        // Update the state or refetch the items to reflect the change
        fetchOrderItems(selectedOrder.id, selectedOrder.customer_id);
      } else {
        toast.error('Failed to edit item');
      }
    } catch (error) {
      console.error('Error editing item:', error);
      toast.error('Error editing item');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`${SERVER_ROUTES.ORDER_ITEMS}/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        // Update the state or refetch the items to reflect the change
        setSelectedOrderItems(selectedOrderItems.filter(item => item.id !== itemId));
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item');
    }
  };

  const renderHeader = () => {
    let headerElement = ['id', 'customer', 'subtotal', 'vat', 'total', 'status', 'actions'];

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
            <td>{GBPFormatter.format(order.vat)}</td>
            <td>{GBPFormatter.format(order.total)}</td>
            <td>{order.order_status}</td>
            <td className="operation">
              <button className="button" onClick={() => updateStatus(order.id)}>Update Status</button>
              <button className="button" onClick={() => viewOrder(order)}>View</button>
              <button className="button" onClick={() => deleteOrder(order.id)}>Delete</button>
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
      <ToastContainer />
      <h2 id="title">Order List Page</h2>
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
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        orderItems={selectedOrderItems}
        orderDetails={selectedOrder}
        customer={customer}
        onEditItem={editItem} // Pass the edit function to the modal
        onDeleteItem={deleteItem} // Pass the delete function to the modal
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
