// Sidebar.js
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../AuthContext';
import './css/Sidebar.css';
import { PAGE_ROUTES } from '../Constants';
import { FaShoppingCart, FaSignOutAlt  } from 'react-icons/fa';

function Sidebar({ onAddObject }) {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const isCustomerListPage = location.pathname === PAGE_ROUTES.CUSTOIMER_LISTING;
  const isSupplierListPage = location.pathname === PAGE_ROUTES.SUPPLIER_LISTING;
  const isPriceListPage = location.pathname === PAGE_ROUTES.PRICE_LISTING;
  const isProductListPage = location.pathname === PAGE_ROUTES.PRODUCT_LISTING;
  const isDeliveryPage = location.pathname === PAGE_ROUTES.DELIVERIES;
  const isCustomerOrderPage = location.pathname === PAGE_ROUTES.ORDER_LISTING;
  const isSuppierOrderPage = location.pathname === PAGE_ROUTES.SUPPLIER_ORDERS;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Order Management</h2>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-dashboard">
        <li><Link to={PAGE_ROUTES.DASHBOARD}>Dashboard</Link></li>
        </div>
        <div className="sidebar-category">
          <h3>General</h3>
          <ul className="sidebar-links">
            <li><Link to={PAGE_ROUTES.CUSTOIMER_LISTING}>Customers</Link></li>
            <li><Link to={PAGE_ROUTES.SUPPLIER_LISTING}>Suppliers</Link></li>
            <li><Link to={PAGE_ROUTES.PRODUCT_LISTING}>Products</Link></li>
            <li><Link to={PAGE_ROUTES.PRICE_LISTING}>Prices</Link></li>
            <li><Link to={PAGE_ROUTES.DELIVERIES}>Deliveries</Link></li>
          </ul>
        </div>
        <div className="sidebar-category">
          <h3>Orders</h3>
          <ul className="sidebar-links">
            <li><Link to={PAGE_ROUTES.ORDER_LISTING}>Orders</Link></li>
            <li><Link to={PAGE_ROUTES.SUPPLIER_ORDERS}>Supplier Orders</Link></li>
            <li><Link to={PAGE_ROUTES.AWAITING_APPROVAL}>Orders Awaiting Approval</Link></li>
          </ul>
        </div>
      </nav>
      <div className="sidebar-footer">
        {isCustomerListPage && <button onClick={onAddObject}>Add Customer</button>}
        {isSupplierListPage && <button onClick={onAddObject}>Add Supplier</button>}
        {isProductListPage && <button onClick={onAddObject}>Add Product</button>}
        {isPriceListPage && <button onClick={onAddObject}>Add Price</button>}
        {isDeliveryPage && <button onClick={onAddObject}>Add Delivery</button>}
        {isCustomerOrderPage && <button onClick={onAddObject}>Add Customer Order</button>}
        {isSuppierOrderPage && <button onClick={onAddObject}>Add Supplier Order</button>}
        
        
        <button className="logout-button" onClick={logout}>
          <FaSignOutAlt className="logout-icon" />
        </button>
        <Link to={PAGE_ROUTES.CART_PAGE}>
          <FaShoppingCart className="cart-icon" />
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;