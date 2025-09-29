import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  AccountCircle,
  Notifications,
  Security,
  Language,
  Palette,
  Save
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: true
    },
    appearance: {
      theme: 'light',
      language: 'en'
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    }
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '300', color: '#333', margin: '0 0 8px 0' }}>
          Application Settings
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
          Configure system preferences and user settings
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
        {/* Profile Settings */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <AccountCircle style={{ fontSize: '24px', color: '#2196f3', marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>Profile Settings</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Full Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                defaultValue="john.doe@hotel.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Notifications style={{ fontSize: '24px', color: '#ff9800', marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>Notification Preferences</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                  style={{ marginRight: '8px' }}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
              </label>
            ))}
          </div>
        </div>

        {/* Appearance Settings */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Palette style={{ fontSize: '24px', color: '#9c27b0', marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>Appearance</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Theme
              </label>
              <select
                value={settings.appearance.theme}
                onChange={(e) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, theme: e.target.value }
                })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Language
              </label>
              <select
                value={settings.appearance.language}
                onChange={(e) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, language: e.target.value }
                })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            maxWidth: '200px'
          }}
        >
          <Save style={{ fontSize: '18px' }} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
