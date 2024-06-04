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

function AddPriceModal({ isOpen, onClose, onSubmit, initialData, selectedCustomer}) {
  const [formData, setFormData] = useState({product_id: '', price: '', effective_time: '', expiry_time: ''});
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    if(initialData) {
      setFormData(initialData);
    } else {
      setFormData({product_id: '', price: '', effective_time: '', expiry_time: ''});
      setSelectedProduct('');
    }
    setError('')
  }, [initialData]);

  useEffect(() => {
    // Fetch products data when the component mounts
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.PRODUCTS);
      if(response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if('product_id' === e.target.name) {
      // Find the selected product based on the product ID
      const selectedProduct = products.find(product => product.id === parseInt(value));

      // Set the selected product details in the state
      setSelectedProduct(selectedProduct);
    }
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if(validateForm(formData)) {
      onSubmit(formData);
    }
  };

  const validateForm = (formData) => {
    if(!formData.product_id
      || !formData.price
      || !formData.effective_time
      || !formData.expiry_time) {
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
      contentLabel="Add Price Modal"
      className="modal-overlay"
    >
      {selectedCustomer < 1 &&
        <div className="modal-content">
          <div className='error'> Close this modal and select a customer. <br/> Then try adding a price.</div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="secondary">Cancel</button>
          </div>
        </div>
      }
      {selectedCustomer > 0 &&
        <div className="modal-content">
          <h2 className="modal-title">{initialData ? 'Edit Price' : 'Add Price'}</h2>
          {error && <div className='error'>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label>Select Product: <span>*</span></label>
              <select name="product_id" value={formData.product_id || 0} onChange={handleChange}>
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.product_type} | {product.product_name} | {product.unit_size} | {product.pack_size}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label>Product Details: </label>
              <div><span><b>Supplier:</b> {selectedProduct?.supplier_name}</span></div>
              <div><span><b>Product Type:</b> {selectedProduct?.product_type}</span></div>
              <div><span><b>Product Name:</b> {selectedProduct?.product_name}</span></div>
              <div><span><b>Unit Size:</b> {selectedProduct?.unit_size}</span></div>
              <div><span><b>Pack Size:</b> {selectedProduct?.pack_size}</span></div>
            </div>
            <div className="form-control currency-input">
              <label>Price: <span>*</span></label>
              <input type="number" name="price" value={formData.price || ''} onChange={handleChange} step="0.01" min="0" />
            </div>
            <div className="form-control">
              <label>Effective Time: <span>*</span></label>
              <input type="datetime-local" name="effective_time" value={formData.effective_time || ''} onChange={handleChange} />

            </div>
            <div className="form-control">
              <label>Expiry Time: <span>*</span></label>
              <input type="datetime-local" name="expiry_time" value={formData.expiry_time || ''} onChange={handleChange} />
            </div>
            <div className="form-actions">
              <button type="submit" className="primary">Submit</button>
              <button type="button" onClick={onClose} className="secondary">Cancel</button>
            </div>
          </form>
        </div>
      }
    </Modal>
  );

}

export default AddPriceModal;