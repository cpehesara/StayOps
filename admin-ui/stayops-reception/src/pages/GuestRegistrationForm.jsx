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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-light tracking-tight text-black mb-3">
            Guest Registration
          </h1>
          <p className="text-gray-500 text-sm">
            Please fill in all required information
          </p>
        </div>

        {/* Form */}
        <div className="border border-gray-200 p-8">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Enter first name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Enter last name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="Enter email address"
              disabled={loading}
            />
          </div>

          {/* Phone & Nationality */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Nationality *
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Enter nationality"
                disabled={loading}
              />
            </div>
          </div>

          {/* Identity Type & Number */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Identity Type *
              </label>
              <select
                name="identityType"
                value={formData.identityType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                disabled={loading}
              >
                <option value="Passport">Passport</option>
                <option value="NIC">National ID Card</option>
                <option value="License">Driving License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Identity Number *
              </label>
              <input
                type="text"
                name="identityNumber"
                value={formData.identityNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Enter identity number"
                disabled={loading}
              />
            </div>
          </div>

          {/* Identity Document Upload */}
          <div className="mb-8">
            <label className="block text-xs text-gray-500 mb-2">
              Identity Document Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-2">
              Upload a clear image of your identity document (JPG, PNG, max 5MB)
            </p>
            {formData.identityImage && (
              <p className="text-xs text-black mt-2">
                Selected: {formData.identityImage.name}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border border-gray-900 bg-gray-50">
              <p className="text-sm text-black">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {response && (
            <div className="mb-6 p-4 border border-black bg-black text-white">
              <p className="text-sm">
                Guest registration completed successfully
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={resetForm}
              disabled={loading}
              className={`px-6 py-3 border border-gray-200 text-black text-sm hover:border-black transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Reset Form
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? "Processing..." : "Register Guest"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestRegistration;