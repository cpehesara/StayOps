import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const VALID_EMAIL = 'reception@gmail.com';
  const VALID_PASSWORD = 'reception@123';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (formData.email === VALID_EMAIL && formData.password === VALID_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('loginTime', new Date().toISOString());
      
      if (onLogin) onLogin();
      
      alert('Login successful! You would be redirected to the dashboard.');
    } else {
      setError('Invalid email or password. Please try again.');
    }

    setLoading(false);
  };

  const handleForgotPassword = () => {
    alert('Please contact the system administrator for password reset.');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    background: {
      width: '100%',
      maxWidth: '420px'
    },
    card: {
      background: 'white',
      borderRadius: '6px',
      border: '1px solid #e8e8e8',
      padding: '48px 40px',
      width: '100%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logoSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '20px'
    },
    logoIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '56px',
      height: '56px',
      background: '#1a1a1a',
      borderRadius: '6px'
    },
    appTitle: {
      fontSize: '22px',
      fontWeight: '500',
      color: '#1a1a1a',
      margin: 0,
      letterSpacing: '-0.02em'
    },
    subtitle: {
      color: '#999',
      fontSize: '14px',
      margin: 0,
      lineHeight: 1.5
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontWeight: '500',
      color: '#4a4a4a',
      fontSize: '13px'
    },
    input: {
      padding: '11px 14px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      background: '#ffffff',
      outline: 'none',
      color: '#1a1a1a',
      width: '100%',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#991b1b'
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#991b1b',
      fontSize: '13px',
      fontWeight: '400',
      padding: '10px 12px',
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '4px',
      marginTop: '-8px'
    },
    button: {
      padding: '12px 24px',
      background: '#1a1a1a',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '8px',
      width: '100%'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    footer: {
      marginTop: '32px',
      textAlign: 'center'
    },
    forgotLink: {
      background: 'none',
      border: 'none',
      color: '#1a1a1a',
      fontSize: '13px',
      fontWeight: '400',
      cursor: 'pointer',
      textDecoration: 'underline',
      marginBottom: '24px',
      padding: 0
    },
    demoCredentials: {
      background: '#fafafa',
      border: '1px solid #e8e8e8',
      borderRadius: '4px',
      padding: '16px',
      textAlign: 'left'
    },
    demoTitle: {
      margin: '0 0 10px 0',
      fontSize: '13px',
      fontWeight: '500',
      color: '#1a1a1a'
    },
    demoText: {
      margin: '4px 0',
      fontSize: '12px',
      color: '#666',
      fontFamily: '"SF Mono", Monaco, Menlo, monospace'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logoSection}>
              <div style={styles.logoIcon}>
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="24" height="24" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M14 14h12M14 20h12M14 26h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 style={styles.appTitle}>StayOps Reception</h1>
            </div>
            <p style={styles.subtitle}>Welcome back! Please sign in to your account.</p>
          </div>

          <div style={styles.formContainer}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(error ? styles.inputError : {})
                }}
                placeholder="Enter your email"
                autoComplete="email"
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = '#1a1a1a';
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = '#e0e0e0';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSubmit(e);
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(error ? styles.inputError : {})
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = '#1a1a1a';
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = '#e0e0e0';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSubmit(e);
                }}
              />
            </div>

            {error && (
              <div style={styles.errorMessage}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z" fill="#991b1b"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#000';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#1a1a1a';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={styles.forgotLink}
              onMouseEnter={(e) => e.target.style.color = '#666'}
              onMouseLeave={(e) => e.target.style.color = '#1a1a1a'}
            >
              Forgot your password?
            </button>
            
            <div style={styles.demoCredentials}>
              <h3 style={styles.demoTitle}>Demo Credentials:</h3>
              <p style={styles.demoText}><strong style={{ color: '#1a1a1a' }}>Email:</strong> reception@gmail.com</p>
              <p style={styles.demoText}><strong style={{ color: '#1a1a1a' }}>Password:</strong> reception@123</p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 480px) {
            .login-card {
              padding: 32px 24px !important;
            }
          }

          input::placeholder {
            color: #b8b8b8;
          }
        `}
      </style>
    </div>
  );
};

export default Login;