import React, { useState, useEffect } from 'react';
import { Settings, Zap, AlertTriangle, DollarSign, Calendar, Briefcase, RefreshCw } from 'lucide-react';
import {
  getAutomationStatus,
  getAutomationConfig,
  updateAutomationConfig,
  triggerNoShowProcessing,
  triggerNightlyAudit,
  triggerPriceUpdate
} from '../api/automation';
import { getTodayMetrics } from '../api/metrics';

const AutomationDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [configData, statusData, metricsData] = await Promise.all([
        getAutomationConfig(),
        getAutomationStatus(),
        getTodayMetrics()
      ]);
      setConfig(configData);
      setStatus(statusData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      alert('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = async (key, value) => {
    try {
      setLoading(true);
      const updates = { [key]: value };
      const updated = await updateAutomationConfig(updates);
      setConfig(updated);
      alert('Configuration updated successfully');
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async (triggerType) => {
    if (!window.confirm(`Confirm manual trigger: ${triggerType}?`)) return;
    
    try {
      setLoading(true);
      let result;
      
      switch(triggerType) {
        case 'noshow':
          result = await triggerNoShowProcessing();
          break;
        case 'audit':
          result = await triggerNightlyAudit();
          break;
        case 'pricing':
          result = await triggerPriceUpdate();
          break;
        default:
          throw new Error('Unknown trigger type');
      }
      
      alert(result.message || 'Process completed successfully');
      loadDashboardData();
    } catch (error) {
      console.error('Error triggering process:', error);
      alert('Failed to trigger process');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading automation dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Automation Control Center
          </h1>
          <p className="text-sm text-gray-500">
            Manage automated processes and workflows
          </p>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-4 gap-6 mb-12">
            <div className="border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap size={24} className="text-black" />
                <h3 className="text-sm font-medium">Tasks Automated</h3>
              </div>
              <div className="text-3xl font-light">{metrics.tasksAutomatedToday || 0}</div>
            </div>
            
            <div className="border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign size={24} className="text-black" />
                <h3 className="text-sm font-medium">Price Updates</h3>
              </div>
              <div className="text-3xl font-light">{metrics.priceUpdatesToday || 0}</div>
            </div>
            
            <div className="border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={24} className="text-black" />
                <h3 className="text-sm font-medium">Fraud Alerts</h3>
              </div>
              <div className="text-3xl font-light">{metrics.fraudAlertsToday || 0}</div>
            </div>
            
            <div className="border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase size={24} className="text-black" />
                <h3 className="text-sm font-medium">Housekeeping</h3>
              </div>
              <div className="text-3xl font-light">{metrics.housekeepingTasksToday || 0}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-12 gap-0 flex-wrap">
          {[
            { key: 'overview', label: 'Overview', icon: Settings },
            { key: 'pricing', label: 'Dynamic Pricing', icon: DollarSign },
            { key: 'fraud', label: 'Fraud Detection', icon: AlertTriangle },
            { key: 'housekeeping', label: 'Housekeeping', icon: Briefcase },
            { key: 'triggers', label: 'Manual Triggers', icon: Zap }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm border border-gray-200 transition-colors flex items-center gap-2 ${
                activeTab === tab.key 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:border-black'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && config && (
          <div>
            <h2 className="text-2xl font-light mb-8">Automation Configuration</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium mb-1">Dynamic Pricing</h3>
                    <p className="text-sm text-gray-500">Automatically adjust room rates based on demand</p>
                  </div>
                  <button
                    onClick={() => handleToggleAutomation('dynamicPricingEnabled', !config.dynamicPricingEnabled)}
                    className={`px-6 py-2 text-sm transition-colors ${
                      config.dynamicPricingEnabled 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {config.dynamicPricingEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {config.dynamicPricingEnabled && (
                  <div className="text-sm text-gray-600">
                    Update Interval: Every {config.pricingUpdateIntervalHours || 1} hours
                  </div>
                )}
              </div>

              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium mb-1">Fraud Detection</h3>
                    <p className="text-sm text-gray-500">Monitor suspicious activities and transactions</p>
                  </div>
                  <button
                    onClick={() => handleToggleAutomation('fraudDetectionEnabled', !config.fraudDetectionEnabled)}
                    className={`px-6 py-2 text-sm transition-colors ${
                      config.fraudDetectionEnabled 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {config.fraudDetectionEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium mb-1">Automated Housekeeping</h3>
                    <p className="text-sm text-gray-500">Auto-assign cleaning tasks after checkout</p>
                  </div>
                  <button
                    onClick={() => handleToggleAutomation('autoHousekeepingEnabled', !config.autoHousekeepingEnabled)}
                    className={`px-6 py-2 text-sm transition-colors ${
                      config.autoHousekeepingEnabled 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {config.autoHousekeepingEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium mb-1">OTA Channel Sync</h3>
                    <p className="text-sm text-gray-500">Sync availability and rates with booking channels</p>
                  </div>
                  <button
                    onClick={() => handleToggleAutomation('otaSyncEnabled', !config.otaSyncEnabled)}
                    className={`px-6 py-2 text-sm transition-colors ${
                      config.otaSyncEnabled 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {config.otaSyncEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium mb-1">Auto Room Assignment</h3>
                    <p className="text-sm text-gray-500">Automatically assign rooms to new reservations</p>
                  </div>
                  <button
                    onClick={() => handleToggleAutomation('autoRoomAssignmentEnabled', !config.autoRoomAssignmentEnabled)}
                    className={`px-6 py-2 text-sm transition-colors ${
                      config.autoRoomAssignmentEnabled 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {config.autoRoomAssignmentEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium mb-1">Nightly Audit</h3>
                    <p className="text-sm text-gray-500">Run automated audit at end of day</p>
                  </div>
                  <button
                    onClick={() => handleToggleAutomation('nightlyAuditEnabled', !config.nightlyAuditEnabled)}
                    className={`px-6 py-2 text-sm transition-colors ${
                      config.nightlyAuditEnabled 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {config.nightlyAuditEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {config.nightlyAuditEnabled && config.nightlyAuditTime && (
                  <div className="text-sm text-gray-600">
                    Scheduled at: {config.nightlyAuditTime}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Triggers Tab */}
        {activeTab === 'triggers' && (
          <div>
            <h2 className="text-2xl font-light mb-8">Manual Process Triggers</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">No-Show Processing</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Process all no-show reservations and update room status
                    </p>
                  </div>
                  <button
                    onClick={() => handleManualTrigger('noshow')}
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                  >
                    <RefreshCw size={16} className="inline mr-2" />
                    Run Now
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Nightly Audit</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Run end-of-day audit and generate reports
                    </p>
                  </div>
                  <button
                    onClick={() => handleManualTrigger('audit')}
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                  >
                    <RefreshCw size={16} className="inline mr-2" />
                    Run Now
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Dynamic Price Update</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Recalculate and update all room prices based on current rules
                    </p>
                  </div>
                  <button
                    onClick={() => handleManualTrigger('pricing')}
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                  >
                    <RefreshCw size={16} className="inline mr-2" />
                    Run Now
                  </button>
                </div>
              </div>
            </div>

            {status && (
              <div className="mt-12 border border-gray-200 p-6">
                <h3 className="font-medium mb-4">System Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Last Audit Run:</span>
                    <div className="font-medium">{status.lastAuditRun || 'Never'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Price Update:</span>
                    <div className="font-medium">{status.lastPriceUpdate || 'Never'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Active Automations:</span>
                    <div className="font-medium">{status.activeAutomations || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">System Status:</span>
                    <div className="font-medium text-green-600">{status.systemStatus || 'Operational'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'pricing' && (
          <div className="text-center py-20 border border-dashed border-gray-300">
            <h3 className="text-lg font-medium mb-2">Dynamic Pricing Management</h3>
            <p className="text-sm text-gray-500">
              View and manage pricing rules (Feature in development)
            </p>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="text-center py-20 border border-dashed border-gray-300">
            <h3 className="text-lg font-medium mb-2">Fraud Detection Alerts</h3>
            <p className="text-sm text-gray-500">
              View and review fraud alerts (Feature in development)
            </p>
          </div>
        )}

        {activeTab === 'housekeeping' && (
          <div className="text-center py-20 border border-dashed border-gray-300">
            <h3 className="text-lg font-medium mb-2">Housekeeping Task Management</h3>
            <p className="text-sm text-gray-500">
              Manage automated housekeeping tasks (Feature in development)
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AutomationDashboard;