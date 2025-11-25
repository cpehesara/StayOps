import React, { useState, useRef } from "react";
import { receptionAPI } from "../api/reception";
import '../styles/guest-registration.css';

const GuestRegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    identityType: "Passport",
    identityNumber: "",
    identityImage: null,
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const firstNameRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    if (error) {
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setImagePreview(null);
      setFormData((prev) => ({
        ...prev,
        identityImage: null,
      }));
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      e.target.value = "";
      return;
    }
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB");
      e.target.value = "";
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setFormData((prev) => ({
      ...prev,
      identityImage: file,
    }));
    
    if (error) {
      setError(null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      identityImage: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^[+]?[\d\s\-()]{7,15}$/.test(phone);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = "Enter a valid phone number";
    }
    
    if (!formData.nationality.trim()) {
      errors.nationality = "Nationality is required";
    }
    
    if (!formData.identityNumber.trim()) {
      errors.identityNumber = "Identity number is required";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!validateForm()) {
      setError("Please fix the errors below and try again");
      return;
    }

    setLoading(true);

    try {
      const guestData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        nationality: formData.nationality.trim(),
        identityType: formData.identityType,
        identityNumber: formData.identityNumber.trim(),
      };

      const result = await receptionAPI.registerGuest(
        guestData,
        formData.identityImage
      );

      setResponse(result);
      
      // Clear form after successful registration
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationality: "",
        identityType: "Passport",
        identityNumber: "",
        identityImage: null,
      });
      
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Scroll to success message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nationality: "",
      identityType: "Passport",
      identityNumber: "",
      identityImage: null,
    });
    setResponse(null);
    setError(null);
    setFieldErrors({});
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Focus first field after reset
    setTimeout(() => {
      if (firstNameRef.current) {
        firstNameRef.current.focus();
      }
    }, 100);
  };

  const registerAnother = () => {
    setResponse(null);
    setTimeout(() => {
      if (firstNameRef.current) {
        firstNameRef.current.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const downloadQRCode = () => {
    if (response && response.qrCodeBase64) {
      const link = document.createElement('a');
      link.href = response.qrCodeBase64;
      link.download = `guest-${response.guestId}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printGuestCard = () => {
    if (response) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Guest Card - ${response.firstName} ${response.lastName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .card {
              border: 2px solid #333;
              padding: 30px;
              max-width: 400px;
              text-align: center;
            }
            h1 { margin: 0 0 20px 0; font-size: 24px; }
            .info { text-align: left; margin: 20px 0; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; }
            img { max-width: 200px; margin: 20px auto; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Guest Registration Card</h1>
            <div class="info">
              <div class="info-row"><span class="label">Guest ID:</span> ${response.guestId}</div>
              <div class="info-row"><span class="label">Name:</span> ${response.firstName} ${response.lastName}</div>
              <div class="info-row"><span class="label">Email:</span> ${response.email}</div>
              <div class="info-row"><span class="label">Phone:</span> ${response.phone}</div>
              <div class="info-row"><span class="label">Nationality:</span> ${response.nationality}</div>
              <div class="info-row"><span class="label">Identity:</span> ${response.identityType} - ${response.identityNumber}</div>
            </div>
            ${response.qrCodeBase64 ? `<img src="${response.qrCodeBase64}" alt="QR Code" />` : ''}
            <div class="footer">
              Registered on ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="guest-registration-container">
      <div className="guest-registration-wrapper">
        
        {/* Header */}
        <div className="guest-registration-header">
          <h1 className="guest-registration-title">Guest Registration</h1>
          <p className="guest-registration-subtitle">Register new guests to the system</p>
        </div>

        {/* Success Message with Guest Details */}
        {response && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#166534' }}>
                Registration Successful
              </h3>
              <p className="success-message-text" style={{ marginBottom: '16px' }}>
                Guest has been registered successfully with ID: <strong>{response.guestId}</strong>
              </p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '8px', 
              border: '1px solid #86efac',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                <div>
                  <strong>Name:</strong> {response.firstName} {response.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {response.email}
                </div>
                <div>
                  <strong>Phone:</strong> {response.phone}
                </div>
                <div>
                  <strong>Nationality:</strong> {response.nationality}
                </div>
                <div>
                  <strong>Identity:</strong> {response.identityType}
                </div>
                <div>
                  <strong>ID Number:</strong> {response.identityNumber}
                </div>
              </div>
              
              {response.qrCodeBase64 && (
                <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #d1fae5' }}>
                  <img 
                    src={response.qrCodeBase64} 
                    alt="Guest QR Code" 
                    style={{ maxWidth: '150px', border: '2px solid #166534', borderRadius: '8px' }}
                  />
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#166534' }}>
                    Guest QR Code
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={registerAnother}
                className="btn-submit"
                style={{ flex: 1 }}
              >
                Register Another Guest
              </button>
              
              {response.qrCodeBase64 && (
                <button
                  onClick={downloadQRCode}
                  className="btn-reset"
                  style={{ flex: 1 }}
                >
                  Download QR Code
                </button>
              )}
              
              <button
                onClick={printGuestCard}
                className="btn-reset"
                style={{ flex: 1 }}
              >
                Print Guest Card
              </button>
            </div>
          </div>
        )}

        {/* Form - Hidden when showing success */}
        {!response && (
          <div className="guest-registration-form">
            
            {/* Name Fields */}
            <div className="form-grid-2-cols">
              <div>
                <label className="form-label">FIRST NAME *</label>
                <input
                  ref={firstNameRef}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="Enter first name"
                  disabled={loading}
                  style={fieldErrors.firstName ? { borderColor: '#ef4444' } : {}}
                />
                {fieldErrors.firstName && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">LAST NAME *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="Enter last name"
                  disabled={loading}
                  style={fieldErrors.lastName ? { borderColor: '#ef4444' } : {}}
                />
                {fieldErrors.lastName && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="form-field-full">
              <label className="form-label">EMAIL ADDRESS *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="form-input"
                placeholder="Enter email address"
                disabled={loading}
                style={fieldErrors.email ? { borderColor: '#ef4444' } : {}}
              />
              {fieldErrors.email && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone & Nationality */}
            <div className="form-grid-2-cols">
              <div>
                <label className="form-label">PHONE NUMBER *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="Enter phone number"
                  disabled={loading}
                  style={fieldErrors.phone ? { borderColor: '#ef4444' } : {}}
                />
                {fieldErrors.phone && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">NATIONALITY *</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="Enter nationality"
                  disabled={loading}
                  style={fieldErrors.nationality ? { borderColor: '#ef4444' } : {}}
                />
                {fieldErrors.nationality && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.nationality}
                  </p>
                )}
              </div>
            </div>

            {/* Identity Type & Number */}
            <div className="form-grid-2-cols">
              <div>
                <label className="form-label">IDENTITY TYPE *</label>
                <select
                  name="identityType"
                  value={formData.identityType}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="Passport">Passport</option>
                  <option value="NIC">National ID Card</option>
                  <option value="License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="form-label">IDENTITY NUMBER *</label>
                <input
                  type="text"
                  name="identityNumber"
                  value={formData.identityNumber}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  placeholder="Enter identity number"
                  disabled={loading}
                  style={fieldErrors.identityNumber ? { borderColor: '#ef4444' } : {}}
                />
                {fieldErrors.identityNumber && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                    {fieldErrors.identityNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Identity Document Upload */}
            <div className="form-field-full">
              <label className="form-label">IDENTITY DOCUMENT IMAGE</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-file-input"
                disabled={loading}
              />
              <p className="file-input-help">
                Upload a clear image of identity document (JPG, PNG, max 5MB)
              </p>
              
              {imagePreview && (
                <div style={{ 
                  marginTop: '12px', 
                  position: 'relative',
                  display: 'inline-block'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Identity document preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'block'
                    }}
                  />
                  <button
                    onClick={removeImage}
                    type="button"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                  <p className="file-selected-name">
                    {formData.identityImage.name}
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p className="error-message-text">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                onClick={resetForm}
                disabled={loading}
                className="btn-reset"
              >
                Reset Form
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-submit"
              >
                {loading ? "Processing..." : "Register Guest"}
              </button>
            </div>

            {/* Helper Text */}
            <p style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              fontSize: '13px', 
              marginTop: '16px' 
            }}>
              Press Enter to submit or click Register Guest button
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestRegistrationForm;