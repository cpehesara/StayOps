import React, { useState } from 'react';
import authService from '../services/authService';
import { BACKEND_USERS } from '../config/api';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { main: 'Good Morning!', sub: "Let's welcome our guests with a smile and ensure a smooth check-in experience." };
    } else if (hour < 17) {
      return { main: 'Good Afternoon!', sub: 'Keep up the excellent guest service and stay organized.' };
    } else if (hour < 21) {
      return { main: 'Good Evening!', sub: "Let's make our guests' stay more comfortable and seamless." };
    } else {
      return { main: 'Good Night!', sub: "Review today's reservations and prepare for a fresh start tomorrow." };
    }
  };

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

    try {
      // Call backend API
      const userData = await authService.login(formData.email, formData.password);
      
      // Store user data in sessionStorage (temporary - will be lost on page refresh)
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      // Call onLogin callback
      if (onLogin) {
        onLogin(userData);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Please contact the system administrator for password reset.');
  };

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#faf8f5',
      flexDirection: 'row'
    }}>
      {/* Left side - Form */}
      <div style={{
        flex: '0 0 33.33%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 30px',
        height: '100vh',
        overflow: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px'
        }}>
          {/* Logo/Brand */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e8e3dc'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#2c2c2e',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid #ffffff',
                borderRadius: '4px'
              }} />
            </div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '300',
              color: '#2c2c2e',
              marginBottom: '4px',
              letterSpacing: '-0.5px'
            }}>
              {getTimeBasedGreeting().main}
            </h1>
            <p style={{
              color: '#8b8680',
              fontSize: '14px',
              fontWeight: '400',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>
              {getTimeBasedGreeting().sub}
            </p>
            <p style={{
              color: '#8b8680',
              fontSize: '11px',
              fontWeight: '400',
              letterSpacing: '0.5px'
            }}>
              Sign in to StayOps to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: '8px',
                color: '#8b8680',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${error ? '#c17767' : '#e8e3dc'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  background: '#ffffff',
                  color: '#2c2c2e',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = '#b8956a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#c17767' : '#e8e3dc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                marginBottom: '8px',
                color: '#8b8680',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '44px',
                    border: `1px solid ${error ? '#c17767' : '#e8e3dc'}`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                    background: '#ffffff',
                    color: '#2c2c2e',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? '#c17767' : '#e8e3dc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#8b8680',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b8956a',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: '500',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Forgot password
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '16px',
                background: '#faf5f2',
                color: '#c17767',
                border: '1px solid #e8dcd5',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: loading ? '#c4bbb0' : '#2c2c2e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#b8956a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#2c2c2e';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Hotel Image */}
      <div style={{
        flex: '0 0 66.67%',
        background: 'linear-gradient(135deg, #3d1f1f 0%, #2c2c2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        position: 'relative',
        overflow: 'hidden',
        height: '100vh'
      }}>
        {/* Contact Details Stripe */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '20px',
          background: 'rgba(184, 149, 106, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '10px 14px',
          borderBottomLeftRadius: '12px',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          maxWidth: 'calc(100vw - 40px)',
          whiteSpace: 'nowrap'
        }}>
          <a
            href="mailto:support@stayops.com"
            onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=support@stayops.com', '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '500',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <span>Support</span>
          </a>
          <div style={{
            width: '1px',
            height: '14px',
            background: 'rgba(255, 255, 255, 0.3)',
            flexShrink: 0
          }} />
          <a
            href="tel:0912250122"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '500',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            <span>+94 91 225 0122</span>
          </a>
        </div>

        {/* Decorative patterns */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '8%',
          width: '250px',
          height: '250px',
          border: '2px solid rgba(184, 149, 106, 0.15)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '12%',
          right: '12%',
          width: '180px',
          height: '180px',
          border: '2px solid rgba(184, 149, 106, 0.15)',
          borderRadius: '50%'
        }} />

        {/* Hotel Image */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '620px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            aspectRatio: '4/3',
            maxHeight: '70vh',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.3)',
            border: '3px solid rgba(184, 149, 106, 0.2)',
            margin: '0 auto'
          }}>
            <img 
              src="https://res.cloudinary.com/di4v3fcqi/image/upload/v1759864036/-99170515271_92032625635_1730704593_n_s60h4d.jpg" 
              alt="StayOps Hotel"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Text overlay */}
          <div style={{
            marginTop: '2px',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '400',
              marginBottom: '4px',
              letterSpacing: '-0.5px'
            }}>
              StayOps
            </h2>
            <p style={{
              fontSize: '14px',
              opacity: 0.9,
              fontWeight: '400',
              letterSpacing: '0.5px'
            }}>
              Streamline your hotel operations with intelligence and precision.
            </p>
          </div>
        </div>
      </div>


      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #c4bbb0;
        }
        
        input:disabled {
          background-color: #f5f2ee;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        /* Responsive styles */
        @media (max-width: 1200px) {
          /* Adjust layout for medium screens */
        }
        
        @media (max-width: 968px) {
          /* Stack vertically on tablets and mobile */
          body > div:first-of-type > div:first-of-type {
            flex-direction: column !important;
          }
          body > div:first-of-type > div:first-of-type > div:first-of-type {
            flex: 1 !important;
            max-width: 100% !important;
            padding: 30px 20px !important;
          }
          body > div:first-of-type > div:first-of-type > div:last-of-type {
            flex: 1 !important;
            padding: 40px 30px !important;
          }
        }
        
        @media (max-width: 640px) {
          /* Further adjustments for mobile */
          body > div:first-of-type > div:first-of-type > div:first-of-type {
            padding: 15px 10px !important;
          }
          body > div:first-of-type > div:first-of-type > div:last-of-type {
            height: 50vh !important;
            padding: 20px 15px !important;
          }
        }
        
        @media (max-height: 700px) {
          /* Adjustments for shorter screens */
          body > div:first-of-type > div:first-of-type > div:first-of-type {
            padding: 10px 20px !important;
          }
          body > div:first-of-type > div:first-of-type > div:last-of-type {
            padding: 20px 20px !important;
          }
        }
        
        /* Ensure body takes full viewport */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        #root {
          width: 100%;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Login;