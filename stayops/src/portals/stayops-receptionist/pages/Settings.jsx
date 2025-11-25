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
  
  // Settings simplified to profile-only view; appearance controls removed

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Settings (appearance, notifications, security) removed for receptionist view

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await userService.updateCurrentUserProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
        department: profileData.department
      });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Settings save removed

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Change Password section removed for Receptionist portal

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-info">
            <h1>View Profile</h1>
            <p className="settings-header-count">Your profile information</p>
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
            {/* Profile - View/Edit */}
            <div className="settings-card settings-card-wide">
              <div className="card-header">
                <h3 className="card-title">Profile</h3>
                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="btn-save-small"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
              <div className="form-grid-two">
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="form-input form-input-readonly"
                    title="Email cannot be changed"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Department/Role</label>
                  <input
                    type="text"
                    value={profileData.department}
                    readOnly
                    className="form-input form-input-readonly"
                    title="Department/Role cannot be changed"
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
                      title="Employee ID cannot be changed"
                    />
                  </div>
                )}
                {profileData.shift && (
                  <div className="form-field">
                    <label className="form-label">Shift</label>
                    <input
                      type="text"
                      value={profileData.shift}
                      onChange={(e) => handleProfileChange('shift', e.target.value)}
                      className="form-input"
                      placeholder="Enter your shift"
                    />
                  </div>
                )}
                {profileData.emergencyContact && (
                  <div className="form-field">
                    <label className="form-label">Emergency Contact</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact}
                      onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                      className="form-input"
                      placeholder="Enter emergency contact"
                    />
                  </div>
                )}
                {profileData.address && (
                  <div className="form-field form-field-full">
                    <label className="form-label">Address</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      className="form-input"
                      rows="3"
                      placeholder="Enter your address"
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