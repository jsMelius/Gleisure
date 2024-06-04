import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import AddPriceModal from '../forms/AddPriceModal';
import './css/ListingPage.css'
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function PriceListingPage() {
  const navigate = useNavigate();
  const { validateToken, getCurrentUserId } = useContext(AuthContext);
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [quantityMap, setQuantityMap] = useState({}); // State variable to track quantity for each price

  // Check if user is authenticated on mount
  useEffect(() => {
    if (validateToken()) {
      // Login successful, fetch customer data
      fetchCustomers();
    } else {
      navigate(PAGE_ROUTES.LOGIN);
    }
  }, [validateToken, navigate]);

  useEffect(() => {
    // customer selected, fetch price data
    fetchPrices();
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.CUSTOMERS);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        console.error('Failed to fetch customers');
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error('An error occurred while fetching customers');
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${SERVER_ROUTES.PRICES}?customerId=${selectedCustomer}`);
      if (response.ok) {
        const data = await response.json();
        setPrices(data);
        // Initialize quantity map with default values
        const initialQuantityMap = {};
        data.forEach(price => {
          initialQuantityMap[price.id] = 1;
        });
        setQuantityMap(initialQuantityMap);
      } else {
        console.error('Failed to fetch prices');
        toast.error('Failed to fetch prices');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error('An error occurred while fetching prices');
    }
  };

  const handleEdit = (price) => {
    setSelectedPrice(price);
    setIsModalOpen(true);
  };

  const handleAddOrUpdatePrice = async (formData) => {
    try {
      let response;
      const userId = getCurrentUserId();

      if (selectedPrice) {
        // Update existing price
        response = await fetch(`${SERVER_ROUTES.PRICES}/${selectedPrice.id}`, {
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
        // Add new price
        response = await fetch(SERVER_ROUTES.PRICES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            customer_id: selectedCustomer,
            created_by: userId,
            last_modified_by: userId
          })
        });
      }
      if (!response.ok) {
        throw new Error('Failed to add/update price');
      }
      fetchPrices();
      setIsModalOpen(false);
      toast.success('Price added/updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error adding/updating price');
    }
  };

  const handleDelete = async (priceId) => {
    try {
      const response = await fetch(`${SERVER_ROUTES.PRICES}/${priceId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete price');
      }
      setPrices(prevPrices => prevPrices.filter(p => p.id !== priceId));
      // Remove quantity entry for deleted price
      const updatedQuantityMap = { ...quantityMap };
      delete updatedQuantityMap[priceId];
      setQuantityMap(updatedQuantityMap);
      toast.success('Price deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting price');
    }
  };

  const addToCart = (priceId) => {
    const cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
        
    if(cartItems.length > 0) {
      const existingCustomerId = cartItems[0].customer_id;
      if (parseInt(existingCustomerId) !== parseInt(selectedCustomer)) {
        alert("Cannot add items for this customer as items for other customers are already in the cart.");
        return;
      }
    }

    const existingItemIndex = cartItems.findIndex(item => item.id === priceId);

    if (existingItemIndex !== -1) { // If the item already exists in the cart, update its quantity
      cartItems[existingItemIndex].quantity = quantityMap[priceId];
    } else { // If the item doesn't exist in the cart, add it as a new entry
      const cartItem = {
        ...prices.find(price => price.id === priceId),
        quantity: quantityMap[priceId]
      };
      cartItems.push(cartItem);
    }
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
    toast.success('Item added to cart');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedPrice(null);
    }
  }, [isModalOpen]);

  const handleChange = (e) => {
    setSelectedCustomer(e.target.value);
  };

  const GBPFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Europe/London",
  };
  
  const renderHeader = () => {
    let headerElement = ['id', 'supplier', 'product type', 'product name', 'unit size ', 'pack size', 'price', 'effective time', 'expiry time', 'actions']

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>
    })
  };

  const handleUploadPrices = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(SERVER_ROUTES.PRODUCTS_CSV, {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        fetchPrices();
        toast.success('Prices uploaded successfully');
      } else {
        console.error('Failed to upload prices');
        toast.error('Failed to upload prices');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error uploading prices');
    }
  };
  
  const renderBody = () => {
    return prices && prices.map(price => {
      return (
        <tr key={price.id}>
          <td>{price.id}</td>
          <td>{price.supplier_name}</td>
          <td>{price.product_type}</td>
          <td>{price.product_name}</td>
          <td>{price.unit_size}</td>
          <td>{price.pack_size}</td>
          <td>{GBPFormatter.format(price.price)}</td>
          <td>{new Intl.DateTimeFormat("en-GB", options).format(Date.parse(price.effective_time))}</td>
          <td>{new Intl.DateTimeFormat("en-GB", options).format(Date.parse(price.expiry_time))}</td>
          <td className='operation'>
            <button className='button' onClick={() => handleEdit(price)}>Edit</button>
            <div>
              <input className='number-box' type='number' name="quantity" min="1" max="100" value={quantityMap[price.id]} onChange={(e) => setQuantityMap({ ...quantityMap, [price.id]: parseInt(e.target.value) })} />
              <button className='button' onClick={() => addToCart(price.id)}>Add to cart</button>
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div>
      <Header onAddObject={() => { setIsModalOpen(true); }} />
      <ToastContainer />
      <h2 id='title'>Price List Page</h2>
      <div className="form-control">
        <label>Choose Customer: <span>*</span></label>
        <select name="supplier_id" value={selectedCustomer} onChange={handleChange}>
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.customer_name}</option>
          ))}
        </select>
      </div>
      <AddPriceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdatePrice}
        initialData={selectedPrice}
        selectedCustomer={selectedCustomer}
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

export default PriceListingPage;
