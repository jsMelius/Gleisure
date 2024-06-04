import React from 'react';
import './OrderDetailsModal.css';

const GBPFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function OrderDetailsModal({ isOpen, onClose, orderItems, orderDetails, customer }) {
  const handlePrint = () => {
      window.print();
  };

  const renderHeader = () => {
    let headerElement = ['supplier', 'product type', 'product name', 'unit size', 'pack size', 'unit price', 'quantity', 'price']

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>
    })
  };

  const renderBody = () => {
    return orderItems && orderItems.map(cartItem => {
      return (
        <tr key={cartItem.id}>
          <td>{cartItem.supplier_name}</td>
          <td>{cartItem.product_type}</td>
          <td>{cartItem.product_name}</td>
          <td>{cartItem.unit_size}</td>
          <td>{cartItem.pack_size}</td>
          <td>{GBPFormatter.format(cartItem.unit_price)}</td>
          <td>{cartItem.quantity}</td>
          <td>{GBPFormatter.format(cartItem.price)}</td>
        </tr>
      )
    })
  }

  return (
    isOpen && (
      <div className="modal">
        <div className='modal-content'>
          <span className="close" onClick={onClose}>&times;</span>
          <h2 id='title'>Order: {orderDetails.id}</h2>
          <div className='customer-details'>
            <div><h3>Customer Details:</h3></div>
            <div><label>{customer.customer_name} </label></div>
            <div><label>{customer.address_line_1} </label></div>
            <div><label>{customer.address_line_2} </label></div>
            <div><label>{customer.city} </label></div>
            <div><label>{customer.county} </label></div>
            <div><label>{customer.postcode}</label></div>
            <div><label>{customer.phone_number}</label></div>
            <div><label>{customer.email}</label></div>
          </div>
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
                  <td>{GBPFormatter.format(orderDetails.sub_total)}</td>
                </tr>
                {/* <tr>
                  <td>Discount:</td>
                  <td><input className='number-box'/></td>
                </tr> */}
                <tr>
                  <td>VAT @20%:</td>
                  <td>{GBPFormatter.format(orderDetails.vat)}</td>
                </tr>
                <tr>
                  <td className='total'>Total:</td>
                  <td className='total'>{GBPFormatter.format(orderDetails.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button onClick={handlePrint} className="print-button">Print</button>
        </div>
    </div>
    )
  );
}

export default OrderDetailsModal;
