// Dashboard.js
import React from 'react';
import OrderWidget from '../pages/OrderWidget';
import './css/Dashboard.css';
import OrderApprovalWidget from './AwaitingApproval';
import CreditUsageWidget from './CreditUsage';
import NotificationFeed from './NotificationFeed'

import Header from './Sidebar';

function Dashboard() {
  return (
    <div className="dashboard">
      <Header />
      <NotificationFeed />
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <OrderWidget />
          <div className="widget_half_widget">
          <OrderApprovalWidget />
          <CreditUsageWidget />
          </div>
        </div>
      </div>

  );
}

export default Dashboard;