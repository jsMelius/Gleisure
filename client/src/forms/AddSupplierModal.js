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

function AddSupplierModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({ supplier_name: ''});
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else{
      setFormData({ supplier_name: ''});
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
    if(!formData.supplier_name) {
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
      contentLabel="Add Supplier Modal"
      className="modal-overlay"
    >
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Supplier' : 'Add Supplier'}</h2>
        {error && <div className='error'>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label>Name: <span>*</span></label>
            <input type="text" name="supplier_name" value={formData.supplier_name || ''} onChange={handleChange} />
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

export default AddSupplierModal;