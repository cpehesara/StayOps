import React, { useState } from 'react';
import { adminAPI } from "../api/admin";

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px'
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '32px',
    textAlign: 'center'
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  headerSubtitle: {
    fontSize: '16px',
    opacity: '0.9',
    margin: '0'
  },
  content: {
    padding: '40px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '280px'
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  required: {
    color: '#ef4444',
    fontSize: '14px'
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit'
  },
  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
  },
  inputError: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
  },
  inputSuccess: {
    borderColor: '#22c55e'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '13px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  alert: {
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    fontWeight: '500'
  },
  alertSuccess: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    justifyContent: 'flex-end'
  },
  button: {
    padding: '14px 28px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '140px',
    justifyContent: 'center'
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  buttonPrimaryHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '2px solid #d1d5db'
  },
  buttonSecondaryHover: {
    backgroundColor: '#f9fafb',
    borderColor: '#9ca3af'
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
    color: '#9ca3af',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  },
  loading: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  helpText: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '32px 0',
    border: 'none'
  }
};

const spinnerCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const getHeaders = () => ({
  "Content-Type": "application/json",
});

// API Service
const receptionistAPI = {
  register: async (receptionistData) => {
    const response = await fetch("http://localhost:8080/api/receptionists/register", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(receptionistData),
    });

    // safely parse response (handles empty body)
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  },
};

// Form validation utility
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.username.trim()) {
    errors.username = 'Username is required';
  } else if (formData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }
  
  if (!formData.password.trim()) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number';
  }
  
  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[\+]?[\d\s\-\(\)]{10,15}$/.test(formData.phone)) {
    errors.phone = 'Please enter a valid phone number (10-15 digits)';
  }
  
  return errors;
};

// Main Component
const ReceptionistRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [focusedField, setFocusedField] = useState('');
  const [hoveredButton, setHoveredButton] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (alert.show) {
      setAlert(prev => ({ ...prev, show: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fix the errors below and try again.'
      });
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: 'success', message: '' });

    try {
  const response = await receptionistAPI.register(formData);

  // ✅ Treat 2xx response as success even if body is empty
  setAlert({
    show: true,
    type: 'success',
    message: response.message || 'Receptionist registered successfully!'
  });

  // Clear form
  setFormData({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: ''
  });
  setErrors({});
} catch (error) {
  setAlert({
    show: true,
    type: 'error',
    message: error.message || 'Failed to register receptionist. Please try again.'
  });
}
 finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: ''
    });
    setErrors({});
    setAlert({ show: false, type: 'success', message: '' });
  };

  const getInputStyle = (fieldName) => {
    let inputStyle = { ...styles.input };
    
    if (focusedField === fieldName && !errors[fieldName]) {
      inputStyle = { ...inputStyle, ...styles.inputFocus };
    } else if (errors[fieldName]) {
      inputStyle = { ...inputStyle, ...styles.inputError };
    } else if (formData[fieldName] && !errors[fieldName]) {
      inputStyle = { ...inputStyle, ...styles.inputSuccess };
    }
    
    return inputStyle;
  };

  const getButtonStyle = (buttonType) => {
    let buttonStyle = { ...styles.button };
    
    if (loading) {
      return { ...buttonStyle, ...styles.buttonDisabled };
    }
    
    if (buttonType === 'primary') {
      buttonStyle = { ...buttonStyle, ...styles.buttonPrimary };
      if (hoveredButton === 'primary') {
        buttonStyle = { ...buttonStyle, ...styles.buttonPrimaryHover };
      }
    } else {
      buttonStyle = { ...buttonStyle, ...styles.buttonSecondary };
      if (hoveredButton === 'secondary') {
        buttonStyle = { ...buttonStyle, ...styles.buttonSecondaryHover };
      }
    }
    
    return buttonStyle;
  };

  return (
    <div style={styles.pageContainer}>
      <style>{spinnerCSS}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            <span style={{ fontSize: '36px' }}></span>
            Receptionist Registration
          </h1>
          <p style={styles.headerSubtitle}>
            Add a new receptionist to the StayOps system
          </p>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Alert */}
          {alert.show && (
            <div style={{
              ...styles.alert,
              ...(alert.type === 'success' ? styles.alertSuccess : styles.alertError)
            }}>
              <span style={{ fontSize: '20px' }}>
                {alert.type === 'success' ? '✅' : '❌'}
              </span>
              {alert.message}
            </div>
          )}

          {/* Registration Form */}
          <div style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Username <span style={styles.required}>*</span>
                </label>
                <input
                  style={getInputStyle('username')}
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  disabled={loading}
                  placeholder="Enter username (letters, numbers, underscore)"
                  autoComplete="username"
                />
                {errors.username && (
                  <span style={styles.errorText}>
                    ⚠️ {errors.username}
                  </span>
                )}
                <span style={styles.helpText}>
                  Must be at least 3 characters long
                </span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Password <span style={styles.required}>*</span>
                </label>
                <input
                  style={getInputStyle('password')}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  disabled={loading}
                  placeholder="Enter secure password"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <span style={styles.errorText}>
                    ⚠️ {errors.password}
                  </span>
                )}
                <span style={styles.helpText}>
                  Must contain uppercase, lowercase, and number
                </span>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Full Name <span style={styles.required}>*</span>
              </label>
              <input
                style={getInputStyle('fullName')}
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField('')}
                disabled={loading}
                placeholder="Enter full name"
                autoComplete="name"
              />
              {errors.fullName && (
                <span style={styles.errorText}>
                  ⚠️ {errors.fullName}
                </span>
              )}
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address <span style={styles.required}>*</span>
                </label>
                <input
                  style={getInputStyle('email')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  disabled={loading}
                  placeholder="receptionist@baywatchhotel.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <span style={styles.errorText}>
                    ⚠️ {errors.email}
                  </span>
                )}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Phone Number <span style={styles.required}>*</span>
                </label>
                <input
                  style={getInputStyle('phone')}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  disabled={loading}
                  placeholder="+94771234567"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <span style={styles.errorText}>
                    ⚠️ {errors.phone}
                  </span>
                )}
                <span style={styles.helpText}>
                  Include country code (e.g., +94 for Sri Lanka)
                </span>
              </div>
            </div>

            <hr style={styles.divider} />

            <div style={styles.buttonGroup}>
              <button
                style={getButtonStyle('secondary')}
                onClick={handleClear}
                disabled={loading}
                onMouseEnter={() => setHoveredButton('secondary')}
                onMouseLeave={() => setHoveredButton('')}
                type="button"
              >
                Clear Form
              </button>
              
              <button
                style={getButtonStyle('primary')}
                onClick={handleSubmit}
                disabled={loading}
                onMouseEnter={() => setHoveredButton('primary')}
                onMouseLeave={() => setHoveredButton('')}
                type="submit"
              >
                {loading && <span style={styles.loading}></span>}
                {loading ? 'Registering...' : ' Register Receptionist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistRegistration;
