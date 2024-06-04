import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './AddModal.css';
import { SERVER_ROUTES } from '../Constants';

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

function AddProductModal({ isOpen, onClose, onSubmit, initialData }) {

  const [formData, setFormData] = useState({ supplier_id: '', product_type: '', product_name: '', unit_size: '', pack_size: '' });
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else{
      setFormData({ supplier_id: '', product_type: '', product_name: '', unit_size: '', pack_size: '' });
    }
    setError('');
  }, [initialData]);

  useEffect(() => {
    // Fetch suppliers data when the component mounts
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.SUPPLIERS);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        console.error('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
    if(!formData.supplier_id
      || !formData.product_type
      || !formData.product_name
      || !formData.unit_size
      || !formData.pack_size) {
      setError('Fields marked with * are required');
      return false;
    } else {
      return true;
    }
  }; 

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Add Product Modal"
      className="modal-overlay"
    >
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Product' : 'Add Product'}</h2>
        {error && <div className='error'>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label>Select Supplier: <span>*</span></label>
            <select name="supplier_id" value={formData.supplier_id} onChange={handleChange}>
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.supplier_name}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label>Product Type: <span>*</span></label>
            <input type="text" name="product_type" value={formData.product_type || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Product Name: <span>*</span></label>
            <input type="text" name="product_name" value={formData.product_name || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Unit Size: <span>*</span></label>
            <input type="text" name="unit_size" value={formData.unit_size || ''} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Pack Size: <span>*</span></label>
            <input type="text" name="pack_size" value={formData.pack_size || ''} onChange={handleChange} />
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

export default AddProductModal;