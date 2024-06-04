import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import AddProductModal from '../forms/AddProductModal';
import './css/ListingPage.css'
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function ProductListingPage() {
  const navigate = useNavigate();
  const { validateToken, getCurrentUserId } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is authenticated on mount
  useEffect(() => {
    if (validateToken()) {
      fetchProducts();
    } else {
      navigate(PAGE_ROUTES.LOGIN);
    }
  }, [validateToken, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(SERVER_ROUTES.PRODUCTS);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } else {
        console.error('Failed to fetch products');
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error('An error occurred while fetching products');
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddOrUpdateProduct = async (formData) => {
    try {
      let response;
      const userId = getCurrentUserId();
      
      if (selectedProduct) {
        // Update existing product
        response = await fetch(`${SERVER_ROUTES.PRODUCTS}/${selectedProduct.id}`, {
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
        // Add new product
        response = await fetch(SERVER_ROUTES.PRODUCTS, {
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
        throw new Error('Failed to add/update product');
      }
      fetchProducts();
      setIsModalOpen(false);
      toast.success('Product added/updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error adding/updating product');
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`${SERVER_ROUTES.PRODUCTS}/${productId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      setFilteredProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting product');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedProduct(null);
    }
  }, [isModalOpen]);

  const renderHeader = () => {
    let headerElement = ['id', 'supplier', 'product type', 'product name', 'unit size ', 'pack size', 'Actions']

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>
    })
  }

  const renderBody = () => {
    return filteredProducts && filteredProducts.map(product => {
      return (
        <tr key={product.id}>
          <td>{product.id}</td>
          <td>{product.supplier_name}</td>
          <td>{product.product_type}</td>
          <td>{product.product_name}</td>
          <td>{product.unit_size}</td>
          <td>{product.pack_size}</td>
          <td className='operation'>
            <button className='button' onClick={() => handleEdit(product)}>Edit</button>
            <button className='button' onClick={() => handleDelete(product.id)}>Delete</button>
          </td>
        </tr>
      )
    })
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product =>
        product.product_name.toLowerCase().includes(event.target.value.toLowerCase())
      ));
    }
  }

  return (
    <div>
      <Header onAddObject={() => { setIsModalOpen(true); }} />
      <ToastContainer />
      <h2 id='title'>Product List Page</h2>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateProduct}
        initialData={selectedProduct}
      />
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Search by product name"
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
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

export default ProductListingPage;
