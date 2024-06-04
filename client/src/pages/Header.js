// Header.js
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../AuthContext';
import './css/Header.css'; // Import the CSS file for styling
import { PAGE_ROUTES } from '../Constants';
import { FaShoppingCart } from 'react-icons/fa';

function Header({ onAddObject }) {
    const { logout } = useContext(AuthContext);
    const location = useLocation();
    const isCustomerListPage = location.pathname === PAGE_ROUTES.CUSTOIMER_LISTING;
    const isSupplierListPage = location.pathname === PAGE_ROUTES.SUPPLIER_LISTING;
    const isPriceListPage = location.pathname === PAGE_ROUTES.PRICE_LISTING;
    const isProductListPage = location.pathname === PAGE_ROUTES.PRODUCT_LISTING;
  
    return (
      <header className="header">
        <nav className="nav-container">
          <ul className="nav-links">
            <li><Link to={PAGE_ROUTES.CUSTOIMER_LISTING}>Customers</Link></li>
            <li><Link to={PAGE_ROUTES.SUPPLIER_LISTING}>Suppliers</Link></li>
            <li><Link to={PAGE_ROUTES.PRODUCT_LISTING}>Products</Link></li>
            <li><Link to={PAGE_ROUTES.PRICE_LISTING}>Prices</Link></li>
            <li><Link to={PAGE_ROUTES.ORDER_LISTING}>Orders</Link></li>
          </ul>
          <div className="logout-container">
            {isCustomerListPage && <button onClick={onAddObject}>Add Customer</button>}
            {isSupplierListPage && <button onClick={onAddObject}>Add Supplier</button>}
            {isProductListPage && <button onClick={onAddObject}>Add Product</button>}
            {isPriceListPage && <button onClick={onAddObject}>Add Price</button>}
            <button onClick={logout}>Logout</button>
            <Link to={PAGE_ROUTES.CART_PAGE}>
              <FaShoppingCart className="cart-icon" />
            </Link>
          </div>
        </nav>
      </header>
    );
  }
  
export default Header;
