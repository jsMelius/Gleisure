import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './AddModal.css';

// Define custom styles for the modal (optional)
const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#root');

function AddCustomerModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({ customer_name: '', email: '', address_line_1: '', address_line_2: '', city: '', county: '', postcode: '', phone_number: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else{
      setFormData({ customer_name: '', email: '', address_line_1: '', address_line_2: '', city: '', county: '', postcode: '', phone_number: '' });
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(validateForm(formData)) {
      onSubmit(formData);
    }
  };

  const validateForm = (formData) => {
    if(!formData.customer_name
      || !formData.email
      || !formData.address_line_1
      || !formData.city
      || !formData.county
      || !formData.postcode
      || !formData.phone_number ) {
      setError('Fields marked with * are required');
      return false;
    } else {
      return true;
    }
  } 

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Add Customer Modal"
      className="modal-overlay"
    >
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Customer' : 'Add Customer'}</h2>
        {error && <div className='error'>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label>Name: <span>*</span></label>
            <input type="text" name="customer_name" value={formData.customer_name || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Email: <span>*</span></label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Address Line 1: <span>*</span></label>
            <input type="address_line_1" name="address_line_1" value={formData.address_line_1 || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Address Line 2:</label>
            <input type="address_line_2" name="address_line_2" value={formData.address_line_2 || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>City: <span>*</span></label>
            <input type="city" name="city" value={formData.city || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>County: <span>*</span></label>
            <input type="county" name="county" value={formData.county || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Postcode: <span>*</span></label>
            <input type="postcode" name="postcode" value={formData.postcode || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Phone Number: <span>*</span></label>
            <input type="phone_number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="primary">Submit</button>
            <button type="button" onClick={onClose} className="secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AddCustomerModal;
