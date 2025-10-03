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
    <div style={{ padding: '32px', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a1a', margin: '0 0 6px 0' }}>
          Application Settings
        </h1>
        <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
          Configure system preferences and user settings
        </p>
      </div>

      <div style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
        {/* Profile Settings */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <AccountCircle style={{ fontSize: '20px', color: '#1a1a1a', marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Profile Settings</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                Full Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                Email
              </label>
              <input
                type="email"
                defaultValue="john.doe@hotel.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <Notifications style={{ fontSize: '20px', color: '#1a1a1a', marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Notification Preferences</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label 
                key={key} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '13px', 
                  color: '#4a4a4a',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                  style={{ 
                    marginRight: '10px',
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px'
                  }}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
              </label>
            ))}
          </div>
        </div>

        {/* Appearance Settings */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <Palette style={{ fontSize: '20px', color: '#1a1a1a', marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Appearance</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
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
                  padding: '10px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  color: '#1a1a1a'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
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
                  padding: '10px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  color: '#1a1a1a'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <Security style={{ fontSize: '20px', color: '#1a1a1a', marginRight: '8px' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Security</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '13px', 
                color: '#4a4a4a',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, twoFactor: e.target.checked }
                })}
                style={{ 
                  marginRight: '10px',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px'
                }}
              />
              Enable Two-Factor Authentication
            </label>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#1a1a1a'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            maxWidth: '200px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#000'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
        >
          <Save style={{ fontSize: '16px' }} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;