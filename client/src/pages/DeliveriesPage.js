import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import AddDeliveryModal from '../forms/AddDeliveryModal';
import './css/DeliveriesPage.css';
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function DeliveryListPage() {
  const navigate = useNavigate();
  const { validateToken, getCurrentUserId } = useContext(AuthContext);
  const [deliveries, setDeliveries] = useState([]);
  const [groupedDeliveries, setGroupedDeliveries] = useState({});
  const [groupByStatus, setGroupByStatus] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    if (validateToken()) {
      fetchDeliveries();
    } else {
      navigate(PAGE_ROUTES.LOGIN);
    }
  }, [validateToken, navigate]);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.DELIVERIES);
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data);
        if (groupByStatus) {
          groupDeliveriesByStatus(data);
        }
      } else {
        console.error('Failed to fetch deliveries');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const groupDeliveriesByStatus = (deliveries) => {
    const grouped = deliveries.reduce((acc, delivery) => {
      if (!acc[delivery.status]) {
        acc[delivery.status] = [];
      }
      acc[delivery.status].push(delivery);
      return acc;
    }, {});
    setGroupedDeliveries(grouped);
  };

  const handleEdit = (delivery) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleAddOrUpdateDelivery = async (formData) => {
    try {
      let response;
      const userId = getCurrentUserId();

      if (selectedDelivery) {
        response = await fetch(`${SERVER_ROUTES.DELIVERIES}/${selectedDelivery.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            last_modified_by: userId,
          }),
        });
      } else {
        response = await fetch(SERVER_ROUTES.DELIVERIES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            created_by: userId,
            last_modified_by: userId,
          }),
        });
      }
      if (!response.ok) {
        throw new Error('Failed to add/update delivery');
      }
      fetchDeliveries();
      setIsModalOpen(false);
      toast.success(selectedDelivery ? 'Delivery updated successfully' : 'Delivery added successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add/update delivery');
    }
  };

  const handleDelete = async (deliveryId) => {
    try {
      const response = await fetch(`${SERVER_ROUTES.DELIVERIES}/${deliveryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete delivery');
      }
      setDeliveries((prevDeliveries) => prevDeliveries.filter((d) => d.id !== deliveryId));
      toast.success('Delivery deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete delivery');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`${SERVER_ROUTES.GENERATE_PDF}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deliveries }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deliveries.pdf';
      a.click();
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedDelivery(null);
    }
  }, [isModalOpen]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'In Transit':
        return 'in-transit';
      case 'Delivered':
        return 'delivered';
      default:
        return '';
    }
  };

  const renderHeader = () => {
    let headerElement = ['ID', 'Tracking ID', 'Sender', 'Recipient', 'Status', 'Expected Delivery Date', 'Actions'];

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  const renderBody = () => {
    const deliveriesToRender = groupByStatus ? groupedDeliveries : { All: deliveries };

    return Object.keys(deliveriesToRender).map((status) => (
      <React.Fragment key={status}>
        {groupByStatus && <tr><td colSpan="7"><strong>{status}</strong></td></tr>}
        {deliveriesToRender[status].map((delivery) => {
          const statusColor = getStatusColor(delivery.status);
          return (
            <tr key={delivery.id} className={statusColor}>
              <td>{delivery.id}</td>
              <td>{delivery.tracking_id}</td>
              <td>{delivery.sender}</td>
              <td>{delivery.recipient}</td>
              <td>{delivery.status}</td>
              <td>{delivery.expected_delivery_date}</td>
              <td className="operation">
                <button className="button" onClick={() => handleEdit(delivery)}>
                  Edit
                </button>
                <button className="button" onClick={() => handleDelete(delivery.id)}>
                  Delete
                </button>
                <button className="button" onClick={handleGeneratePDF}>
                  Generate PDF
                </button>
              </td>
            </tr>
          );
        })}
      </React.Fragment>
    ));
  };

  const handleGroupByStatusChange = (event) => {
    setGroupByStatus(event.target.checked);
    if (event.target.checked) {
      groupDeliveriesByStatus(deliveries);
    }
  };

  return (
    <div>
      <Header onAddObject={() => setIsModalOpen(true)} />

      <h2 id="title">Delivery List Page</h2>

      <div>
        <label>
          <input
            type="checkbox"
            checked={groupByStatus}
            onChange={handleGroupByStatusChange}
          />
          Group by Status
        </label>
      </div>

      <AddDeliveryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateDelivery}
        initialData={selectedDelivery}
      />
      {error && <div className="error">{error}</div>}
      <table id="table">
        <thead>
          <tr>{renderHeader()}</tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>

      <ToastContainer />
    </div>
  );
}

export default DeliveryListPage;