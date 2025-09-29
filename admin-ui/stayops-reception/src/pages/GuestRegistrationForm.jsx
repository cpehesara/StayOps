import React, { useState } from "react";
import { receptionAPI } from "../api/reception";

const GuestRegistration = () => {
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

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file size (5MB limit)
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB");
      e.target.value = ""; // Clear the file input
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

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate phone number (basic validation)
  const isValidPhone = (phone) => {
    return /^[+]?[\d\s\-()]{7,15}$/.test(phone);
  };

  // Submit form
  const handleSubmit = async () => {
    // Reset previous states
    setError(null);
    
    // Validation
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

    // Email validation
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Phone validation
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

      console.log("Submitting guest data:", guestData);

      const result = await receptionAPI.registerGuest(
        guestData,
        formData.identityImage
      );

      console.log("Registration successful:", result);
      setResponse(result);
      
      // Reset form on success
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

  // Reset form
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

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#000",
    backgroundColor: "#fff",
    outline: "none",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#000",
  };

  const buttonStyle = {
    padding: "12px 24px",
    border: "1px solid #000",
    backgroundColor: "#fff",
    color: "#000",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    outline: "none",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#000",
    color: "#fff",
  };

  const containerStyle = {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "600", 
          color: "#000", 
          margin: "0 0 8px 0" 
        }}>
          Guest Registration
        </h1>
        <p style={{ 
          fontSize: "14px", 
          color: "#666", 
          margin: "0 0 16px 0" 
        }}>
          Please fill in all required information
        </p>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "32px", border: "1px solid #f0f0f0", borderRadius: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>
              First Name <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: formData.firstName ? "#e0e0e0" : error && !formData.firstName ? "#e74c3c" : "#e0e0e0"
              }}
              placeholder="Enter first name"
              disabled={loading}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Last Name <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: formData.lastName ? "#e0e0e0" : error && !formData.lastName ? "#e74c3c" : "#e0e0e0"
              }}
              placeholder="Enter last name"
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>
            Email Address <span style={{ color: "#e74c3c" }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={{
              ...inputStyle,
              borderColor: formData.email ? "#e0e0e0" : error && !formData.email ? "#e74c3c" : "#e0e0e0"
            }}
            placeholder="Enter email address"
            disabled={loading}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>
              Phone Number <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: formData.phone ? "#e0e0e0" : error && !formData.phone ? "#e74c3c" : "#e0e0e0"
              }}
              placeholder="Enter phone number"
              disabled={loading}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Nationality <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: formData.nationality ? "#e0e0e0" : error && !formData.nationality ? "#e74c3c" : "#e0e0e0"
              }}
              placeholder="Enter nationality"
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>
              Identity Type <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <select
              name="identityType"
              value={formData.identityType}
              onChange={handleInputChange}
              style={inputStyle}
              disabled={loading}
            >
              <option value="Passport">Passport</option>
              <option value="NIC">National ID Card</option>
              <option value="License">Driving License</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Identity Number <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              name="identityNumber"
              value={formData.identityNumber}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: formData.identityNumber ? "#e0e0e0" : error && !formData.identityNumber ? "#e74c3c" : "#e0e0e0"
              }}
              placeholder="Enter identity number"
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <label style={labelStyle}>
            Identity Document Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              ...inputStyle,
              padding: "8px 16px",
              cursor: "pointer"
            }}
            disabled={loading}
          />
          <small style={{ 
            fontSize: "12px", 
            color: "#666", 
            display: "block", 
            marginTop: "4px" 
          }}>
            Upload a clear image of your identity document (JPG, PNG, max 5MB)
          </small>
          {formData.identityImage && (
            <small style={{ 
              fontSize: "12px", 
              color: "#16a34a", 
              display: "block", 
              marginTop: "4px" 
            }}>
              Selected: {formData.identityImage.name}
            </small>
          )}
        </div>

        {error && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            <p style={{ 
              color: "#dc2626", 
              margin: "0", 
              fontSize: "14px", 
              fontWeight: "500" 
            }}>
              {error}
            </p>
          </div>
        )}

        {response && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            <p style={{ 
              color: "#16a34a", 
              margin: "0", 
              fontSize: "14px", 
              fontWeight: "500" 
            }}>
              Guest registration completed successfully
            </p>
          </div>
        )}

        <div style={{ 
          display: "flex", 
          gap: "12px", 
          justifyContent: "flex-end" 
        }}>
          <button
            onClick={resetForm}
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#f8f8f8";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#fff";
              }
            }}
          >
            Reset Form
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#333";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#000";
              }
            }}
          >
            {loading ? "Processing..." : "Register Guest"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestRegistration;