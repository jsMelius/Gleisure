import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import AddSupplierModal from '../forms/AddSupplierModal';
import './css/ListingPage.css'
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function SupplierListingPage() {
    const navigate = useNavigate();
    const { validateToken, getCurrentUserId } = useContext(AuthContext);
    const [suppliers, setSuppliers] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState('');
  
    // Check if user is authenticated on mount
    useEffect(() => {
      if (validateToken()) {
          // Login successful, fetch supplier data
          fetchorders(selectedSupplier);
          fetchSuppliers();
      } else {
          navigate(PAGE_ROUTES.LOGIN);
      }
    }, [validateToken, navigate, selectedSupplier]);

    const fetchorders = async (supplier) => {
      try {
        let url = SERVER_ROUTES.ORDERS;
        if (supplier) {
          url += `?supplier=${supplier}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Handle the fetched orders data as needed
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      }
    };

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

    const handleEdit = (supplier) => {
      setSelectedSupplier(supplier);
      setIsModalOpen(true);
    };

    const handleAddOrUpdateSupplier = async (formData) => {
      // ... (rest of the code remains the same)
    };

    const handleDelete = async (supplierId) => {
      // ... (rest of the code remains the same)
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
    };

    const handleSupplierChange = (event) => {
      setSelectedSupplier(event.target.value);
    };

    useEffect(() => {
      if (!isModalOpen) {
        setSelectedSupplier(null);
      }
    }, [isModalOpen]);

    const renderHeader = () => {
      let headerElement = ['id', 'name', 'Actions']
  
      return headerElement.map((key, index) => {
        return <th key={index}>{key.toUpperCase()}</th>
      })
    }

    const renderBody = () => {
      return suppliers && suppliers.map(supplier => {
        return (
          <tr key={supplier.id}>
            <td>{supplier.id}</td>
            <td>{supplier.supplier_name}</td>
            <td className='operation'>
              <button className='button' onClick={() => handleEdit(supplier)}>Edit</button>
              {/* <button className='button' onClick={() => handleDelete(supplier.id)}>Delete</button> */}
            </td>
          </tr>
        )
      })
    }

    return (
      <div>
        <Header />
        <h2 id="title">Supplier Details</h2>
        <div>
          <label htmlFor="supplier-select">Filter by Supplier:</label>
          <select id="supplier-select" value={selectedSupplier} onChange={handleSupplierChange}>
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
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