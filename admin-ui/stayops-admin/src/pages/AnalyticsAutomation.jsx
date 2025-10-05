import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Mail, Clock } from 'lucide-react';
import { getDailyMetrics } from '../api/metrics';

const AnalyticsAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [scheduledReports, setScheduledReports] = useState([
    {
      id: 1,
      name: 'Daily Operations Summary',
      type: 'DAILY',
      schedule: 'Every day at 6:00 AM',
      recipients: ['manager@hotel.com'],
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'Weekly Revenue Report',
      type: 'WEEKLY',
      schedule: 'Every Monday at 9:00 AM',
      recipients: ['finance@hotel.com', 'director@hotel.com'],
      status: 'ACTIVE'
    }
  ]);

  const reportTypes = [
    { value: 'daily', label: 'Daily Summary', icon: Calendar },
    { value: 'occupancy', label: 'Occupancy Report', icon: TrendingUp },
    { value: 'revenue', label: 'Revenue Analysis', icon: BarChart3 },
    { value: 'automation', label: 'Automation Metrics', icon: Clock },
  ];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      // This would connect to your analytics API
      alert(`Generating ${selectedReport} report for ${dateRange.startDate} to ${dateRange.endDate}`);
      // await generateReport(selectedReport, dateRange);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = () => {
    alert('Report scheduling dialog would open here');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Analytics & Reporting
          </h1>
          <p className="text-sm text-gray-500">
            Automated report generation and scheduling
          </p>
        </div>

        {/* Report Generation */}
        <div className="mb-12">
          <h2 className="text-2xl font-light mb-6">Generate Report</h2>
          
          <div className="border border-gray-200 p-8">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {reportTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedReport(type.value)}
                  className={`p-6 border transition-colors ${
                    selectedReport === type.value
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-black'
                  }`}
                >
                  <type.icon size={24} className="mx-auto mb-3" />
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={handleScheduleReport}
                className="px-6 py-4 border border-gray-200 text-black text-sm hover:border-black transition-colors flex items-center gap-2"
              >
                <Clock size={18} />
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Scheduled Reports</h2>
            <button
              onClick={handleScheduleReport}
              className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
            >
              New Schedule
            </button>
          </div>

          <div className="space-y-4">
            {scheduledReports.map(report => (
              <div key={report.id} className="border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 size={20} />
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {report.schedule}
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs bg-green-100 text-green-800">
                        {report.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        Recipients: {report.recipients.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 hover:border-black transition-colors text-sm">
                      Edit
                    </button>
                    <button className="px-4 py-2 border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Templates */}
        <div>
          <h2 className="text-2xl font-light mb-6">Report Templates</h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-gray-200 p-6">
              <h3 className="font-medium mb-2">Daily Operations</h3>
              <p className="text-sm text-gray-600 mb-4">
                Arrivals, departures, occupancy, and revenue summary
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>✓ Arrival/Departure counts</li>
                <li>✓ Occupancy percentage</li>
                <li>✓ Daily revenue</li>
                <li>✓ Outstanding tasks</li>
              </ul>
              <button className="w-full px-4 py-2 border border-gray-200 hover:border-black transition-colors text-sm">
                Use Template
              </button>
            </div>

            <div className="border border-gray-200 p-6">
              <h3 className="font-medium mb-2">Revenue Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">
                Detailed breakdown of revenue by source and room type
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>✓ Revenue by room type</li>
                <li>✓ Channel performance</li>
                <li>✓ ADR & RevPAR</li>
                <li>✓ Comparison charts</li>
              </ul>
              <button className="w-full px-4 py-2 border border-gray-200 hover:border-black transition-colors text-sm">
                Use Template
              </button>
            </div>

            <div className="border border-gray-200 p-6">
              <h3 className="font-medium mb-2">Automation Metrics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Performance summary of all automated processes
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>✓ Tasks automated</li>
                <li>✓ Time saved</li>
                <li>✓ Error rates</li>
                <li>✓ Cost savings</li>
              </ul>
              <button className="w-full px-4 py-2 border border-gray-200 hover:border-black transition-colors text-sm">
                Use Template
              </button>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-12 border border-gray-200 p-6">
          <h3 className="font-medium mb-4">Export Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pdf" defaultChecked className="w-4 h-4" />
              <label htmlFor="pdf" className="text-sm">PDF Format</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="excel" className="w-4 h-4" />
              <label htmlFor="excel" className="text-sm">Excel Format</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="csv" className="w-4 h-4" />
              <label htmlFor="csv" className="text-sm">CSV Format</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAutomation;