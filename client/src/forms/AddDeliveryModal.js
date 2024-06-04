import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './AddDeliveryModal.css';


function AddDeliveryModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    tracking_id: '',
    sender: '',
    recipient: '',
    status: '',
    expected_delivery_date: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      tracking_id: '',
      sender: '',
      recipient: '',
      status: '',
      expected_delivery_date: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <h2>{initialData ? 'Edit Delivery' : 'Add Delivery'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tracking_id">Tracking ID:</label>
          <input
            type="text"
            id="tracking_id"
            name="tracking_id"
            value={formData.tracking_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="sender">Sender:</label>
          <input
            type="text"
            id="sender"
            name="sender"
            value={formData.sender}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="recipient">Recipient:</label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Select status</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        <div>
          <label htmlFor="expected_delivery_date">Expected Delivery Date:</label>
          <input
            type="date"
            id="expected_delivery_date"
            name="expected_delivery_date"
            value={formData.expected_delivery_date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </Modal>
  );
}

export default AddDeliveryModal;