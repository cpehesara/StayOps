import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCw, AlertCircle, CheckCircle, 
  Server, Database, Globe, Mail, Shield, Bell, Clock,
  Monitor, HardDrive, Cpu, MemoryStick, Wifi, Lock,
  Key, Users, Building2, CreditCard, FileText, Zap,
  ChevronDown, ChevronRight, Info, XCircle, X
} from 'lucide-react';

// API Service
const API_BASE_URL = '/api/v1';

const api = {
  getSystemInfo: async () => {
    const response = await fetch(`${API_BASE_URL}/system/info`);
    if (!response.ok) throw new Error('Failed to fetch system info');
    return response.json();
  },
  
  getSettings: async (section) => {
    const response = await fetch(`${API_BASE_URL}/settings/${section}`);
    if (!response.ok) throw new Error(`Failed to fetch ${section} settings`);
    return response.json();
  },
  
  updateSettings: async (section, data) => {
    const response = await fetch(`${API_BASE_URL}/settings/${section}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update ${section} settings`);
    return response.json();
  },
  
  testConnection: async (type, config) => {
    const response = await fetch(`${API_BASE_URL}/settings/test/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error(`Connection test failed`);
    return response.json();
  }
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />
  };

  const styles = {
    success: { backgroundColor: '#f0f9f0', borderColor: '#6b8e23', color: '#6b8e23' },
    error: { backgroundColor: '#fef2f2', borderColor: '#dc2626', color: '#dc2626' },
    info: { backgroundColor: '#eff6ff', borderColor: '#3b82f6', color: '#3b82f6' }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      border: '1px solid',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '300px',
      maxWidth: '500px',
      ...styles[type]
    }}>
      {icons[type]}
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'maintenance', label: 'Maintenance', icon: HardDrive }
  ];

  useEffect(() => {
    loadSystemInfo();
    loadSettings(activeTab);
  }, []);

  useEffect(() => {
    if (!loading && !settings[activeTab]) {
      loadSettings(activeTab);
    }
  }, [activeTab]);

  const loadSystemInfo = async () => {
    try {
      const data = await api.getSystemInfo();
      setSystemInfo(data);
    } catch (error) {
      showToast('Failed to load system information', 'error');
      console.error('Error loading system info:', error);
    }
  };

  const loadSettings = async (section) => {
    setLoading(true);
    try {
      const data = await api.getSettings(section);
      setSettings(prev => ({
        ...prev,
        [section]: data
      }));
      setErrors({});
    } catch (error) {
      showToast(`Failed to load ${section} settings`, 'error');
      console.error(`Error loading ${section} settings:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!validateSettings(activeTab)) {
      showToast('Please fix validation errors before saving', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.updateSettings(activeTab, settings[activeTab]);
      setHasUnsavedChanges(false);
      showToast('Settings saved successfully', 'success');
      
      // Reload system info if general settings were changed
      if (activeTab === 'general') {
        await loadSystemInfo();
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateSettings = (section) => {
    const newErrors = {};
    const sectionData = settings[section];

    if (section === 'general') {
      if (!sectionData?.systemName?.trim()) {
        newErrors.systemName = 'System name is required';
      }
    }

    if (section === 'security') {
      if (sectionData?.sessionTimeout < 5) {
        newErrors.sessionTimeout = 'Minimum 5 minutes';
      }
      if (sectionData?.passwordMinLength < 6) {
        newErrors.passwordMinLength = 'Minimum 6 characters';
      }
    }

    if (section === 'notifications') {
      if (sectionData?.emailNotifications) {
        if (!sectionData?.smtpServer?.trim()) {
          newErrors.smtpServer = 'SMTP server is required';
        }
        if (!sectionData?.smtpUsername?.trim()) {
          newErrors.smtpUsername = 'SMTP username is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleRefresh = async () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to refresh?')) {
        return;
      }
    }
    await loadSystemInfo();
    await loadSettings(activeTab);
    setHasUnsavedChanges(false);
    showToast('Settings refreshed', 'info');
  };

  if (loading && !systemInfo) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#faf8f5',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b8680'
      }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px' }}>Loading system settings...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf8f5',
      padding: '32px'
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e8e3dc'
      }}>
        <div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 300,
            color: '#2c2c2e',
            letterSpacing: '-0.5px',
            margin: '0 0 4px 0'
          }}>
            System Settings
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#8b8680',
            margin: 0
          }}>
            Configure system-wide settings and preferences
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {hasUnsavedChanges && (
            <span style={{
              fontSize: '12px',
              color: '#b8956a',
              fontWeight: 500
            }}>
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'white',
              color: '#2c2c2e',
              border: '1px solid #e8e3dc',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving || !hasUnsavedChanges}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: hasUnsavedChanges ? '#2c2c2e' : '#e8e3dc',
              color: hasUnsavedChanges ? 'white' : '#8b8680',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed'
            }}
          >
            {saving ? (
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* System Info Card */}
      {systemInfo && (
        <div style={{
          background: 'white',
          border: '1px solid #e8e3dc',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 500,
              color: '#2c2c2e',
              margin: 0
            }}>
              System Information
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: systemInfo.status === 'healthy' ? '#f0f9f0' : '#fef2f2',
              color: systemInfo.status === 'healthy' ? '#6b8e23' : '#dc2626',
              border: `1px solid ${systemInfo.status === 'healthy' ? '#d4edda' : '#fecaca'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              {systemInfo.status === 'healthy' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{systemInfo.status === 'healthy' ? 'System Healthy' : 'System Issues'}</span>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(systemInfo).map(([key, value]) => {
              if (key === 'status') return null;
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{
                    fontSize: '11px',
                    color: '#8b8680',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 500
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <span style={{
                    fontSize: '14px',
                    color: '#2c2c2e',
                    fontWeight: 500
                  }}>
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Container */}
      <div style={{
        background: 'white',
        border: '1px solid #e8e3dc',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: '#f5f2ee',
          borderBottom: '1px solid #e8e3dc',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 20px',
                  background: activeTab === tab.id ? 'white' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === tab.id ? '#2c2c2e' : '#8b8680',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#b8956a' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {loading && !settings[activeTab] ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#8b8680'
            }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px' }}>Loading {activeTab} settings...</p>
            </div>
          ) : (
            <SettingsContent
              tab={activeTab}
              settings={settings[activeTab] || {}}
              onChange={(key, value) => handleSettingChange(activeTab, key, value)}
              errors={errors}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Settings Content Component
const SettingsContent = ({ tab, settings, onChange, errors }) => {
  const renderField = (config) => {
    const { key, label, type = 'text', options, description, min, max, step } = config;
    const value = settings[key];
    const error = errors[key];

    return (
      <div key={key} style={{
        display: 'flex',
        flexDirection: type === 'toggle' ? 'row' : 'column',
        alignItems: type === 'toggle' ? 'center' : 'stretch',
        justifyContent: type === 'toggle' ? 'space-between' : 'flex-start',
        gap: type === 'toggle' ? '12px' : '8px'
      }}>
        <div style={{ flex: type === 'toggle' ? 1 : 'none' }}>
          <label style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#2c2c2e',
            display: 'block'
          }}>
            {label}
          </label>
          {description && (
            <span style={{
              fontSize: '11px',
              color: '#8b8680',
              marginTop: '4px',
              display: 'block'
            }}>
              {description}
            </span>
          )}
        </div>

        {type === 'toggle' ? (
          <div style={{
            position: 'relative',
            display: 'inline-block',
            width: '44px',
            height: '24px'
          }}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(key, e.target.checked)}
              style={{
                opacity: 0,
                width: 0,
                height: 0
              }}
            />
            <span
              onClick={() => onChange(key, !value)}
              style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: value ? '#b8956a' : '#e8e3dc',
                transition: '0.2s',
                borderRadius: '24px'
              }}
            >
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: value ? '23px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.2s',
                borderRadius: '50%'
              }} />
            </span>
          </div>
        ) : type === 'select' ? (
          <select
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
            style={{
              padding: '10px 12px',
              border: `1px solid ${error ? '#dc2626' : '#e8e3dc'}`,
              borderRadius: '6px',
              fontSize: '13px',
              background: 'white'
            }}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value || ''}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(key, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            style={{
              padding: '10px 12px',
              border: `1px solid ${error ? '#dc2626' : '#e8e3dc'}`,
              borderRadius: '6px',
              fontSize: '13px',
              background: 'white'
            }}
          />
        )}
        
        {error && (
          <span style={{
            fontSize: '11px',
            color: '#dc2626',
            marginTop: '4px'
          }}>
            {error}
          </span>
        )}
      </div>
    );
  };

  const fieldConfigs = {
    general: [
      { key: 'systemName', label: 'System Name', type: 'text' },
      { key: 'timezone', label: 'Timezone', type: 'select', options: [
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'UTC', label: 'UTC' }
      ]},
      { key: 'language', label: 'Language', type: 'select', options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' }
      ]},
      { key: 'currency', label: 'Currency', type: 'select', options: [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'CAD', label: 'CAD (C$)' }
      ]},
      { key: 'dateFormat', label: 'Date Format', type: 'select', options: [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
      ]},
      { key: 'timeFormat', label: 'Time Format', type: 'select', options: [
        { value: '12h', label: '12 Hour' },
        { value: '24h', label: '24 Hour' }
      ]},
      { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'toggle', description: 'Enable to restrict system access' },
      { key: 'debugMode', label: 'Debug Mode', type: 'toggle', description: 'Enable for development and troubleshooting' }
    ],
    security: [
      { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', min: 5, max: 480 },
      { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', min: 3, max: 10 },
      { key: 'passwordMinLength', label: 'Password Minimum Length', type: 'number', min: 6, max: 20 },
      { key: 'failedLoginLockout', label: 'Failed Login Lockout (minutes)', type: 'number', min: 5, max: 60 },
      { key: 'requireTwoFactor', label: 'Require Two-Factor Authentication', type: 'toggle', description: 'Require 2FA for all accounts' },
      { key: 'allowPasswordReset', label: 'Allow Password Reset', type: 'toggle', description: 'Allow users to reset passwords via email' },
      { key: 'sslRequired', label: 'SSL Required', type: 'toggle', description: 'Require SSL/TLS for all connections' },
      { key: 'auditLogging', label: 'Audit Logging', type: 'toggle', description: 'Log all system activities' }
    ],
    notifications: [
      { key: 'emailNotifications', label: 'Email Notifications', type: 'toggle', description: 'Enable email notifications' },
      { key: 'smsNotifications', label: 'SMS Notifications', type: 'toggle', description: 'Enable SMS for critical alerts' },
      { key: 'pushNotifications', label: 'Push Notifications', type: 'toggle', description: 'Enable push notifications' },
      { key: 'smtpServer', label: 'SMTP Server', type: 'text' },
      { key: 'smtpPort', label: 'SMTP Port', type: 'number', min: 1, max: 65535 },
      { key: 'smtpUsername', label: 'SMTP Username', type: 'text' },
      { key: 'smtpSecure', label: 'SMTP Secure Connection', type: 'toggle', description: 'Use TLS/SSL' }
    ],
    integrations: [
      { key: 'paymentGateway', label: 'Payment Gateway', type: 'select', options: [
        { value: 'stripe', label: 'Stripe' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'square', label: 'Square' }
      ]},
      { key: 'analyticsEnabled', label: 'Analytics Enabled', type: 'toggle' },
      { key: 'googleAnalyticsId', label: 'Google Analytics ID', type: 'text' },
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text' },
      { key: 'apiRateLimit', label: 'API Rate Limit (requests/hour)', type: 'number', min: 100, max: 10000 },
      { key: 'apiTimeout', label: 'API Timeout (seconds)', type: 'number', min: 5, max: 300 }
    ],
    performance: [
      { key: 'cacheEnabled', label: 'Cache Enabled', type: 'toggle', description: 'Enable system caching' },
      { key: 'cacheTTL', label: 'Cache TTL (seconds)', type: 'number', min: 60, max: 86400 },
      { key: 'compressionEnabled', label: 'Compression Enabled', type: 'toggle', description: 'Enable gzip compression' },
      { key: 'databasePoolSize', label: 'Database Pool Size', type: 'number', min: 5, max: 100 },
      { key: 'maxConcurrentUsers', label: 'Max Concurrent Users', type: 'number', min: 100, max: 10000 },
      { key: 'backgroundJobWorkers', label: 'Background Job Workers', type: 'number', min: 1, max: 20 }
    ],
    maintenance: [
      { key: 'autoBackup', label: 'Auto Backup', type: 'toggle', description: 'Automatically backup system data' },
      { key: 'backupFrequency', label: 'Backup Frequency', type: 'select', options: [
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' }
      ]},
      { key: 'backupRetention', label: 'Backup Retention (days)', type: 'number', min: 7, max: 365 },
      { key: 'logRetention', label: 'Log Retention (days)', type: 'number', min: 7, max: 365 },
      { key: 'healthCheckInterval', label: 'Health Check Interval (seconds)', type: 'number', min: 60, max: 3600 },
      { key: 'monitoringEnabled', label: 'Monitoring Enabled', type: 'toggle', description: 'Enable system monitoring' }
    ]
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    }}>
      {fieldConfigs[tab]?.map(config => renderField(config))}
    </div>
  );
};

export default SystemSettings;