import React, { useState } from 'react';

const Reporting = () => {
  const [reportType, setReportType] = useState('occupancy');
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = () => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      setLoading(false);
      alert('Report generated successfully!');
    }, 1500);
  };

  const reportTypes = [
    { value: 'occupancy', label: 'Occupancy Report' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'guest', label: 'Guest Analytics' },
    { value: 'staff', label: 'Staff Performance' },
    { value: 'maintenance', label: 'Maintenance Report' },
    { value: 'complaints', label: 'Complaints Summary' },
    { value: 'ratings', label: 'Ratings & Reviews' },
  ];

  const quickStats = [
    { label: 'Today\'s Occupancy', value: '87%', change: '+5%' },
    { label: 'Total Revenue (MTD)', value: '$42,350', change: '+12%' },
    { label: 'Active Reservations', value: '156', change: '+8' },
    { label: 'Avg Rating', value: '4.6/5', change: '+0.2' },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Generate and view detailed reports
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="border border-gray-200 p-6">
              <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
              <p className="text-3xl font-light mb-1">{stat.value}</p>
              <p className="text-xs text-green-600">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Report Generator */}
        <div className="border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-light mb-6">Generate Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Report Type */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Report Type *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Date Range *
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className={`px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button
              className="px-6 py-3 border border-gray-200 text-black text-sm hover:border-black transition-colors"
            >
              Export to PDF
            </button>
            <button
              className="px-6 py-3 border border-gray-200 text-black text-sm hover:border-black transition-colors"
            >
              Export to Excel
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-2xl font-light mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {[
              {
                name: 'Occupancy Report - December 2024',
                type: 'Occupancy',
                date: '2024-12-01',
                size: '2.4 MB',
              },
              {
                name: 'Revenue Analysis - Q4 2024',
                type: 'Revenue',
                date: '2024-11-30',
                size: '1.8 MB',
              },
              {
                name: 'Guest Satisfaction Survey',
                type: 'Guest Analytics',
                date: '2024-11-28',
                size: '980 KB',
              },
              {
                name: 'Staff Performance - November',
                type: 'Staff',
                date: '2024-11-25',
                size: '1.2 MB',
              },
            ].map((report, index) => (
              <div key={index} className="border border-gray-200 p-4 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-medium text-black mb-1">{report.name}</h3>
                  <p className="text-xs text-gray-500">
                    Type: {report.type} • Generated: {report.date} • Size: {report.size}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="px-3 py-1 border border-gray-200 text-xs hover:border-black transition-colors">
                    View
                  </button>
                  <button className="px-3 py-1 border border-gray-200 text-xs hover:border-black transition-colors">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="mt-8">
          <h2 className="text-2xl font-light mb-4">Scheduled Reports</h2>
          <div className="border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-4">
              Automatically generate and email reports on a recurring schedule
            </p>
            <button className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors">
              Create Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;