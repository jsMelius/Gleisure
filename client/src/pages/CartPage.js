import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import Header from './Sidebar';
import './css/ListingPage.css';
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function CartPage() {
  const navigate = useNavigate();
  const { validateToken, getCurrentUserId } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState(JSON.parse(sessionStorage.getItem('cartItems')) || []);
  const [customerId, setCustomerId] = useState(0);
  const [subtotal, setSubTotal] = useState(parseFloat(0));
  const [total, setTotal] = useState(parseFloat(0));
  const [vat, setVat] = useState(parseFloat(0));

  useEffect(() => {
    if (!validateToken()) {
      navigate(PAGE_ROUTES.LOGIN);
    }
  }, [validateToken, navigate]);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      let currentSubTotal = parseFloat(0);
      cartItems.forEach(cartItem => {
        const itemPrice = parseInt(cartItem.quantity) * parseFloat(cartItem.price);
        currentSubTotal += itemPrice;
      });
      setSubTotal(currentSubTotal);
      setCustomerId(cartItems[0].customer_id);
    }
  }, [cartItems]);

  useEffect(() => {
    setVat(subtotal * parseFloat(0.20));
  }, [subtotal]);

  useEffect(() => {
    setTotal(subtotal + vat);
  }, [subtotal, vat]);

  const removeFromCart = (itemId) => {
    const updatedCartItems = cartItems.filter(item => item.id !== itemId);
    sessionStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    setCartItems(updatedCartItems);
    toast.success('Item removed from cart');
  };

  const placeOrder = async () => {
    try {
      const userId = getCurrentUserId();
      const orderResponse = await fetch(SERVER_ROUTES.ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: customerId,
          order_status: 'Placed',
          sub_total: subtotal,
          vat: vat,
          total: total,
          created_by: userId,
          last_modified_by: userId
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to add order');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.id;

      const orderItemsPayload = cartItems.map(item => ({
        order_id: orderId,
        supplier_name: item.supplier_name,
        product_type: item.product_type,
        product_name: item.product_name,
        unit_size: item.unit_size,
        pack_size: item.pack_size,
        unit_price: item.price,
        quantity: item.quantity,
        price: parseFloat(item.price) * parseInt(item.quantity),
        created_by: userId,
        last_modified_by: userId
      }));

      const orderItemsResponse = await fetch(SERVER_ROUTES.ORDER_ITEMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderItemsPayload)
      });

      if (!orderItemsResponse.ok) {
        throw new Error('Failed to add order items');
      }

      // Simulate checking the order status from the response
      const orderStatus = 'awaiting approval'; // This should be retrieved from the actual response

      if (orderStatus === 'awaiting approval') {
        toast.info('Order is awaiting approval: Credit Limit');
      } else {
        toast.success('Order placed successfully');
      }

      setSubTotal(0);
      setTotal(0);
      setVat(0);

      sessionStorage.removeItem('cartItems');
      setCartItems([]);
    } catch (error) {
      toast.error('Error placing order: ' + error.message);
    }
  };

  const clearCart = () => {
    sessionStorage.removeItem('cartItems');
    setCartItems([]);
    toast.success('Cart cleared');
  };

  const GBPFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const renderHeader = () => {
    let headerElement = ['supplier', 'product type', 'product name', 'unit size', 'pack size', 'unit price', 'quantity', 'remove', 'price'];
    return headerElement.map((key, index) => (
      <th key={index}>{key.toUpperCase()}</th>
    ));
  };

  const renderBody = () => {
    return cartItems && cartItems.map(cartItem => (
      <tr key={cartItem.id}>
        <td>{cartItem.supplier_name}</td>
        <td>{cartItem.product_type}</td>
        <td>{cartItem.product_name}</td>
        <td>{cartItem.unit_size}</td>
        <td>{cartItem.pack_size}</td>
        <td>{GBPFormatter.format(cartItem.price)}</td>
        <td>{cartItem.quantity}</td>
        <td className='operation'>
          <button className='button' onClick={() => removeFromCart(cartItem.id)}>Remove</button>
        </td>
        <td>{GBPFormatter.format(parseInt(cartItem.quantity) * parseFloat(cartItem.price))}</td>
      </tr>
    ));
  };

  return (
    <div>
      <Header />
      <ToastContainer />
      <h2 id='title'>Cart</h2>
      <table id='table'>
        <thead>
          <tr>{renderHeader()}</tr>
        </thead>
        <tbody>
          {renderBody()}
        </tbody>
      </table>
      <hr/>
      <div className='cart-total'>
        <table id="cart-table">
          <tbody>
            <tr>
              <td>Subtotal:</td>
              <td>{GBPFormatter.format(subtotal)}</td>
            </tr>
            <tr>
              <td>VAT @20%:</td>
              <td>{GBPFormatter.format(vat)}</td>
            </tr>
            <tr>
              <td className='total'>Total:</td>
              <td className='total'>{GBPFormatter.format(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="form-actions">
        <button type="submit" className="primary" onClick={placeOrder}>Place Order</button>
        <button type="button" onClick={clearCart} className="secondary">Clear cart</button>
      </div>
    </div>
  );
}

export default CartPage;
