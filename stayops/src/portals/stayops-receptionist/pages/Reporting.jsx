import React, { useState } from 'react';
import '../styles/reporting.css';

const Reporting = () => {
  const [reportType, setReportType] = useState('occupancy');
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = () => {
    setLoading(true);
    // TODO: Implement actual report generation with API
    setTimeout(() => {
      setLoading(false);
      alert('Report generated successfully!');
    }, 1500);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting to PDF...');
    alert('PDF export functionality will be implemented');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
    console.log('Exporting to Excel...');
    alert('Excel export functionality will be implemented');
  };

  const handleViewReport = (reportName) => {
    // TODO: Implement view report functionality
    console.log('Viewing report:', reportName);
  };

  const handleDownloadReport = (reportName) => {
    // TODO: Implement download report functionality
    console.log('Downloading report:', reportName);
  };

  const handleCreateSchedule = () => {
    // TODO: Implement create schedule functionality
    console.log('Creating schedule...');
    alert('Schedule creation functionality will be implemented');
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

  const quickStats = [];

  const recentReports = [];

  return (
    <div className="reporting-container">
      <div className="reporting-wrapper">
        
        {/* Header */}
        <div className="reporting-header">
          <h1 className="reporting-title">Reports & Analytics</h1>
          <p className="reporting-subtitle">Generate and view detailed reports</p>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          {quickStats.length > 0 ? (
            quickStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-change">{stat.change}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No statistics available</p>
            </div>
          )}
        </div>

        {/* Report Generator */}
        <div className="report-generator">
          <h2 className="generator-title">Generate Report</h2>
          
          <div className="generator-grid">
            {/* Report Type */}
            <div className="form-field">
              <label className="form-label">Report Type *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-select"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="form-field">
              <label className="form-label">Date Range *</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-select"
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
            <div className="custom-date-range">
              <div className="form-field">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="generator-actions">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="btn-generate"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button onClick={handleExportPDF} className="btn-export">
              Export to PDF
            </button>
            <button onClick={handleExportExcel} className="btn-export">
              Export to Excel
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="recent-reports-section">
          <h2 className="section-title">Recent Reports</h2>
          <div className="reports-list">
            {recentReports.length > 0 ? (
              recentReports.map((report, index) => (
                <div key={index} className="report-card">
                  <div className="report-info">
                    <h3 className="report-name">{report.name}</h3>
                    <p className="report-meta">
                      Type: {report.type} • Generated: {report.date} • Size: {report.size}
                    </p>
                  </div>
                  <div className="report-actions">
                    <button 
                      onClick={() => handleViewReport(report.name)}
                      className="btn-view"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDownloadReport(report.name)}
                      className="btn-download"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recent reports available</p>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="scheduled-reports-section">
          <h2 className="section-title">Scheduled Reports</h2>
          <div className="scheduled-reports-card">
            <p className="scheduled-description">
              Automatically generate and email reports on a recurring schedule
            </p>
            <button 
              onClick={handleCreateSchedule}
              className="btn-create-schedule"
            >
              Create Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;