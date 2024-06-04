// Page Routes
export const PAGE_ROUTES = Object.freeze({
    CART_PAGE: '/cart',
    GENERATE_PDF: '/deliveries/generate-pdf',
    DELIVERIES: '/deliveries',
    CUSTOIMER_LISTING: '/customer-listing',
    SUPPLIER_ORDERS: '/supplier-orders',
    LOGIN: '/login',
    ORDER_LISTING: '/order-listing',
    PRODUCT_LISTING: '/product-listing',
    PRICE_LISTING: '/price-listing',
    SUPPLIER_LISTING: '/supplier-listing',
    AWAITING_APPROVAL: '/awaiting-approval',
    DASHBOARD: '/dashboard'
    
});

// Server Routes
export const API_PREFIX = process.env.REACT_APP_API_PREFIX || '';

export const SERVER_ROUTES = Object.freeze({
    CUSTOMERS: `${API_PREFIX}/customers`,
    SUPPLIER_ORDERS: `${API_PREFIX}/supplier-orders`,
    AWAITING_APPROVAL: '/awaiting-approval',
    LOGIN: `${API_PREFIX}/login`,
    ORDERS: `${API_PREFIX}/orders`,
    ORDER_ITEMS: `${API_PREFIX}/orderItems`,
    PRODUCTS: `${API_PREFIX}/products`,
    PRICES: `${API_PREFIX}/prices`,
    SUPPLIERS: `${API_PREFIX}/suppliers`,
    DASHBOARD: `${API_PREFIX}/dashboard`,
    CUSTOMERS_CREDIT_USAGE: `${API_PREFIX}/customers`,
    PRODUCTS_CSV: `${API_PREFIX}/products/csv`,
    DELIVERIES: `${API_PREFIX}/deliveries`,
    GENERATE_PDF: `${API_PREFIX}/generate-pdf`,
});