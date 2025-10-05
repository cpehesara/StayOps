import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { getTodayMetrics } from '../api/metrics';
import { getAutomationStatus } from '../api/automation';

const AutomationMetricsWidget = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const [metricsData, statusData] = await Promise.all([
        getTodayMetrics(),
        getAutomationStatus()
      ]);
      setMetrics(metricsData);
      setStatus(statusData);
    } catch (error) {
      console.error('Error loading automation metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap size={24} className="text-black" />
          <h3 className="text-lg font-medium">Automation Status</h3>
        </div>
        <Link 
          to="/dashboard/automation"
          className="text-sm text-black hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 border border-gray-200">
          <div className="text-2xl font-light mb-1">
            {metrics?.tasksAutomatedToday || 0}
          </div>
          <div className="text-xs text-gray-500">Tasks Automated Today</div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200">
          <div className="text-2xl font-light mb-1">
            {metrics?.priceUpdatesToday || 0}
          </div>
          <div className="text-xs text-gray-500">Price Updates</div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200">
          <div className="text-2xl font-light mb-1">
            {metrics?.fraudAlertsToday || 0}
          </div>
          <div className="text-xs text-gray-500">Fraud Alerts</div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200">
          <div className="text-2xl font-light mb-1">
            {metrics?.housekeepingTasksToday || 0}
          </div>
          <div className="text-xs text-gray-500">Housekeeping Tasks</div>
        </div>
      </div>

      {status && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <span className="text-gray-600">System Status</span>
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium text-green-600">
                {status.systemStatus || 'Operational'}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <span className="text-gray-600">Active Automations</span>
            <span className="font-medium">{status.activeAutomations || 0}</span>
          </div>

          {status.lastAuditRun && (
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-gray-600">Last Audit</span>
              <span className="text-xs text-gray-500">
                {new Date(status.lastAuditRun).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/dashboard/automation/pricing"
            className="px-3 py-2 text-xs border border-gray-200 hover:border-black transition-colors text-center flex items-center justify-center gap-1"
          >
            <TrendingUp size={12} />
            Pricing
          </Link>
          <Link
            to="/dashboard/automation/fraud"
            className="px-3 py-2 text-xs border border-gray-200 hover:border-black transition-colors text-center flex items-center justify-center gap-1"
          >
            <AlertTriangle size={12} />
            Fraud
          </Link>
          <Link
            to="/dashboard/automation/housekeeping"
            className="px-3 py-2 text-xs border border-gray-200 hover:border-black transition-colors text-center flex items-center justify-center gap-1"
          >
            <Zap size={12} />
            Tasks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AutomationMetricsWidget;