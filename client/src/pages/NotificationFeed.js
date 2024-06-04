import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './css/NotificationFeed.css';

function NotificationFeed() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Establish a WebSocket connection
    const socket = io('http://localhost:3000'); // Replace with your server URL

    // Listen for notification events
    socket.on('notification', (newNotifications) => {
      setNotifications(newNotifications);
    });

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="notification-feed">
      <h3>Notification Feed</h3>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationFeed;
