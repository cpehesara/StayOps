import React, { useState } from 'react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [guestData, setGuestData] = useState(null);

  // Replace with your backend URL
  const API_BASE_URL = 'http://localhost:8080/api/v1';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Automatically validate token after successful login
        const tokenValidationResponse = await fetch(`${API_BASE_URL}/auth/validate-token?token=${data.token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const isTokenValid = await tokenValidationResponse.text();
        
        if (isTokenValid === 'true') {
          setToken(data.token);
          setGuestData(data.guest);
        } else {
          setError('Login successful but token validation failed');
        }
      } else {
        // Show specific error message for authentication failures
        if (response.status === 401 || response.status === 403) {
          setError('Invalid email or password');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setGuestData(null);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'monospace',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '2px solid #000000',
        borderRadius: '8px',
        padding: '30px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#000000',
          borderBottom: '2px solid #000000',
          paddingBottom: '10px'
        }}>
          StayOps API Tester
        </h1>

        {!token ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                color: '#000000'
              }}>
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                color: '#000000'
              }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ffffff' : '#000000',
                color: loading ? '#000000' : '#ffffff',
                border: '2px solid #000000',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#000000' }}>
                <strong>Status:</strong> Logged In
              </p>
              <p style={{ margin: '0 0 10px 0', color: '#000000' }}>
                <strong>User:</strong> {guestData?.email || 'Unknown'}
              </p>
              <p style={{ margin: '0', color: '#000000', wordBreak: 'break-all' }}>
                <strong>Token:</strong> {token.substring(0, 30)}...
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              LOGOUT
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#000000' }}>
              ERROR:
            </h3>
            <p style={{ margin: '0', color: '#000000' }}>
              {error}
            </p>
          </div>
        )}

        {/* Guest Data Display */}
        {guestData && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: '4px',
            padding: '15px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#000000' }}>
              GUEST DATA:
            </h3>
            <div style={{ color: '#000000', fontSize: '14px' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>Guest ID:</strong> {guestData.guestId}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Name:</strong> {guestData.fullName}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Email:</strong> {guestData.email}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Phone:</strong> {guestData.phone}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Nationality:</strong> {guestData.nationality}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Identity:</strong> {guestData.identityType} - {guestData.identityNumber}
              </p>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#000000',
          textAlign: 'center'
        }}>
          API Endpoint: {API_BASE_URL}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;