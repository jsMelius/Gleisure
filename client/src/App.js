import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginPage from './pages/LoginPage';
import CustomerListingPage from './pages/CustomerListingPage';
import SupplierListingPage from './pages/SupplierListingPage';
import ProductListingPage from './pages/ProductListingPage';
import PriceListingPage from './pages/PriceListingPage';
import OrderListingPage from './pages/OrderListingPage';
import SupplierOrdersPage from './pages/SupplierOrders';
import DeliveriesPage from './pages/DeliveriesPage';
import CartPage from './pages/CartPage';
import DashboardPage from './pages/DashboardPage';
import AwaitingApprovalPage from './pages/AwaitingApprovalPage'
import { PAGE_ROUTES } from './Constants';

function App() {
    
  return (
    <AuthProvider>
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LoginPage/>} />
                    <Route path={PAGE_ROUTES.LOGIN} element={<LoginPage/>} />
                    <Route path={PAGE_ROUTES.DASHBOARD} element={<DashboardPage/>} />
                    <Route path={PAGE_ROUTES.CUSTOIMER_LISTING} element={<CustomerListingPage/>} />
                    <Route path={PAGE_ROUTES.SUPPLIER_LISTING} element={<SupplierListingPage/>} />
                    <Route path={PAGE_ROUTES.PRODUCT_LISTING} element={<ProductListingPage/>} />
                    <Route path={PAGE_ROUTES.PRICE_LISTING} element={<PriceListingPage/>} />
                    <Route path={PAGE_ROUTES.ORDER_LISTING} element={<OrderListingPage/>} />
                    <Route path={PAGE_ROUTES.SUPPLIER_ORDERS} element={<SupplierOrdersPage/>} />
                    <Route path={PAGE_ROUTES.CART_PAGE} element={<CartPage/>} />
                    <Route path={PAGE_ROUTES.DELIVERIES} element={<DeliveriesPage/>} />
                    <Route path={PAGE_ROUTES.AWAITING_APPROVAL} element={<AwaitingApprovalPage/>} />
                    <Route element={<LoginPage/>} />
                </Routes>
            </div>
        </Router>
    </AuthProvider>
    
  );
}

export default App;