import React, { useState } from "react";
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) {
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB");
      e.target.value = "";
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      identityImage: file,
    }));
    
    if (error) {
      setError(null);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^[+]?[\d\s\-()]{7,15}$/.test(phone);
  };

  const handleSubmit = async () => {
    setError(null);
    
    const missingFields = [];
    if (!formData.firstName.trim()) missingFields.push("First Name");
    if (!formData.lastName.trim()) missingFields.push("Last Name");
    if (!formData.email.trim()) missingFields.push("Email");
    if (!formData.phone.trim()) missingFields.push("Phone");
    if (!formData.nationality.trim()) missingFields.push("Nationality");
    if (!formData.identityNumber.trim()) missingFields.push("Identity Number");

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError("Please enter a valid phone number");
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
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "Registration failed. Please try again.");
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

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="guest-registration-container">
      <div className="guest-registration-wrapper">
        
        {/* Header */}
        <div className="guest-registration-header">
          <h1 className="guest-registration-title">Guest Registration</h1>
          <p className="guest-registration-subtitle">Register new guests to the system</p>
        </div>

        {/* Form */}
        <div className="guest-registration-form">
          
          {/* Name Fields */}
          <div className="form-grid-2-cols">
            <div>
              <label className="form-label">FIRST NAME *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter first name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="form-label">LAST NAME *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter last name"
                disabled={loading}
              />
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
              className="form-input"
              placeholder="Enter email address"
              disabled={loading}
            />
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
                className="form-input"
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>

            <div>
              <label className="form-label">NATIONALITY *</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter nationality"
                disabled={loading}
              />
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
                className="form-input"
                placeholder="Enter identity number"
                disabled={loading}
              />
            </div>
          </div>

          {/* Identity Document Upload */}
          <div className="form-field-full">
            <label className="form-label">IDENTITY DOCUMENT IMAGE</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-file-input"
              disabled={loading}
            />
            <p className="file-input-help">
              Upload a clear image of your identity document (JPG, PNG, max 5MB)
            </p>
            {formData.identityImage && (
              <p className="file-selected-name">
                Selected: {formData.identityImage.name}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p className="error-message-text">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {response && (
            <div className="success-message">
              <p className="success-message-text">
                Guest registration completed successfully
              </p>
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
        </div>
      </div>
    </div>
  );
};

export default GuestRegistrationForm;