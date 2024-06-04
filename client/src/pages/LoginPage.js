import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import './css/ListingPage.css';
import { PAGE_ROUTES, SERVER_ROUTES } from '../Constants';

function LoginPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Perform login API call
      const response = await fetch(SERVER_ROUTES.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // If login successful, get token and login
        const data = await response.json();
        login(data.token);
        navigate(PAGE_ROUTES.CUSTOIMER_LISTING);
      } else {
        // If login failed, display error message
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 id='title'>Login Page</h2>
      <div className="input-container">
        <label>Email:</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="input-container">
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="login-button" onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className='error'>{error}</div>}
    </div>
  );
}

export default LoginPage;
