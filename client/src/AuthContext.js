import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Load token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setCurrentUserId(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    // Store token in localStorage
    localStorage.setItem('token', token);
    setToken(token);
    setCurrentUserId(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  const validateToken = () => {
    if (!token) {
      return false;
    }

    try {
      // Decode token
      const decodedToken = JSON.parse(atob(token.split('.')[1]));

      // Check expiration time
      if (decodedToken.exp * 1000 < Date.now()) {
        // Token expired
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      logout();
      return false;
    }
  };

  // Function to set the current user's ID
  const setCurrentUserId = (token) => {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUserId(decodedToken.userId);
  };

  // Function to get the current user's ID
  const getCurrentUserId = () => {
    return userId;
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, validateToken, getCurrentUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
