import React, { useState, useEffect } from 'react';
import '../styles/settings.css';
import userService from '../api/userService';

const Settings = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    shift: '',
    employeeId: '',
    emergencyContact: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile and settings on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile data
      const profile = await userService.getCurrentUserProfile();
      setProfileData({
        fullName: profile.fullName || profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        department: profile.department || profile.role || ''
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Read-only profile view; no edit handlers required

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-info">
            <h1>Profile</h1>
            <p className="settings-header-count">View your account information</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading user data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadUserData} className="btn-retry">
                Retry Loading
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="settings-content">
            {/* Profile View - Read Only */}
            <div className="settings-card settings-card-wide">
              <div className="card-header">
                <h3 className="card-title">Profile Overview</h3>
              </div>
              <div className="form-grid-two">
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    readOnly
                    className="form-input form-input-readonly"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="form-input form-input-readonly"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    readOnly
                    className="form-input form-input-readonly"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Department/Role</label>
                  <input
                    type="text"
                    value={profileData.department}
                    readOnly
                    className="form-input form-input-readonly"
                  />
                </div>
                {profileData.employeeId && (
                  <div className="form-field">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      value={profileData.employeeId}
                      readOnly
                      className="form-input form-input-readonly"
                    />
                  </div>
                )}
                {profileData.shift && (
                  <div className="form-field">
                    <label className="form-label">Shift</label>
                    <input
                      type="text"
                      value={profileData.shift}
                      readOnly
                      className="form-input form-input-readonly"
                    />
                  </div>
                )}
                {profileData.emergencyContact && (
                  <div className="form-field">
                    <label className="form-label">Emergency Contact</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact}
                      readOnly
                      className="form-input form-input-readonly"
                    />
                  </div>
                )}
                {profileData.address && (
                  <div className="form-field form-field-full">
                    <label className="form-label">Address</label>
                    <textarea
                      value={profileData.address}
                      readOnly
                      className="form-input form-input-readonly"
                      rows="3"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;