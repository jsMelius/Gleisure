import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import AddCustomerModal from '../forms/AddCustomerModal';
import './css/ListingPage.css'
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function CustomerListPage() {
  const navigate = useNavigate();
  const { validateToken, getCurrentUserId } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (validateToken()) {
        // Login successful, fetch customer data
        fetchCustomers ();
    } else {
        navigate(PAGE_ROUTES.LOGIN);
    }
  }, [validateToken, navigate]);

  const fetchCustomers  = async () => {
    try {
        const response = await fetch(SERVER_ROUTES.CUSTOMERS);
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          console.error('Failed to fetch customers');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      }
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleAddOrUpdateCustomer = async (formData) => {
    try {
      let response;
      const userId = getCurrentUserId();
      
      if (selectedCustomer) {
        // Update existing customer
        response = await fetch(`${SERVER_ROUTES.CUSTOMERS}/${selectedCustomer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            last_modified_by: userId
          })
        });
      } else {
        // Add new customer
        response = await fetch(SERVER_ROUTES.CUSTOMERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            created_by: userId,
            last_modified_by: userId
          })
        });
      }
      if (!response.ok) {
        throw new Error('Failed to add/update customer');
      }
      fetchCustomers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (customerId) => {
    try {
      const response = await fetch(`${SERVER_ROUTES.CUSTOMERS}/${customerId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedCustomer(null);
    }
  }, [isModalOpen]);


  const renderHeader = () => {
    let headerElement = ['id', 'name', 'email', 'Address', 'Phone Number', 'Actions']

    return headerElement.map((key, index) => {
        return <th key={index}>{key.toUpperCase()}</th>
    })
  }

  const renderBody = () => {
    return customers && customers.map(customer => {
        return (
            <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.customer_name}</td>
                <td>{customer.email}</td>
                <td><div>{customer.address_line_1}</div>
                {customer.address_line_2 && <div>{customer.address_line_2}</div>}
                <div>{customer.city}</div>
                <div>{customer.county}</div>
                <div>{customer.postcode}</div></td>
                <td>{customer.phone_number}</td> 
                <td className='operation'>
                    <button className='button' onClick={() => handleEdit(customer)}>Edit</button>
                    {/* <button className='button' onClick={() => handleDelete(customer.id)}>Delete</button> */}
                </td>
            </tr>
        )
    })
  }

  return (
    <div>
      <Header onAddObject={() => {setIsModalOpen(true);}}/>
      <h2 id='title'>Customer List Page</h2>
      <AddCustomerModal 
        isOpen={isModalOpen} 
        onClose={ handleCloseModal} 
        onSubmit={handleAddOrUpdateCustomer}
        initialData={selectedCustomer}
      />
      {error && <div className="error">{error}</div>}
      <table id='table'>
        <thead>
          <tr>{renderHeader()}</tr>
        </thead>
        <tbody>
          {renderBody()}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerListPage;
