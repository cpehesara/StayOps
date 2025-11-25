import React from 'react';
import '../styles/service-dashboard.css';

const ServiceManagerDashboard = () => {
  return (
    <div className="service-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Service Operations</h1>
        <p className="dashboard-subtitle">MONITOR AND MANAGE HOTEL SERVICES</p>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-label">SERVICE REQUESTS</div>
          <div className="stat-value">—</div>
          <div className="stat-detail">Pending assignments</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">HOUSEKEEPING</div>
          <div className="stat-value">—</div>
          <div className="stat-detail">Rooms cleaned today</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">AMENITIES</div>
          <div className="stat-value">—</div>
          <div className="stat-detail">Active bookings</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">STAFF ON DUTY</div>
          <div className="stat-value">—</div>
          <div className="stat-detail">Currently available</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Service Operations */}
        <div className="dashboard-card large">
          <div className="card-header">
            <h2 className="card-title">Service Operations</h2>
          </div>
          <div className="card-content">
            <div className="operations-grid">
              <div className="operation-item">
                <div className="operation-header">
                  <h4 className="operation-name">Housekeeping</h4>
                  <span className="status-indicator">—</span>
                </div>
                <div className="operation-stats">
                  <div className="stat">
                    <span className="stat-label">ROOMS CLEANED</span>
                    <span className="stat-value">—</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">PENDING</span>
                    <span className="stat-value">—</span>
                  </div>
                </div>
              </div>

              <div className="operation-item">
                <div className="operation-header">
                  <h4 className="operation-name">Maintenance</h4>
                  <span className="status-indicator">—</span>
                </div>
                <div className="operation-stats">
                  <div className="stat">
                    <span className="stat-label">OPEN ISSUES</span>
                    <span className="stat-value">—</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">RESOLVED</span>
                    <span className="stat-value">—</span>
                  </div>
                </div>
              </div>

              <div className="operation-item">
                <div className="operation-header">
                  <h4 className="operation-name">Room Service</h4>
                  <span className="status-indicator">—</span>
                </div>
                <div className="operation-stats">
                  <div className="stat">
                    <span className="stat-label">ORDERS TODAY</span>
                    <span className="stat-value">—</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">AVG TIME</span>
                    <span className="stat-value">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Status */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Amenities Status</h2>
          </div>
          <div className="card-content">
            <div className="amenity-list">
              <div className="amenity-item">
                <div className="amenity-info">
                  <span className="amenity-name">Restaurant</span>
                  <span className="amenity-status">—</span>
                </div>
                <div className="amenity-metric">— bookings</div>
              </div>

              <div className="amenity-item">
                <div className="amenity-info">
                  <span className="amenity-name">Spa & Wellness</span>
                  <span className="amenity-status">—</span>
                </div>
                <div className="amenity-metric">— appointments</div>
              </div>

              <div className="amenity-item">
                <div className="amenity-info">
                  <span className="amenity-name">Fitness Center</span>
                  <span className="amenity-status">—</span>
                </div>
                <div className="amenity-metric">— active members</div>
              </div>

              <div className="amenity-item">
                <div className="amenity-info">
                  <span className="amenity-name">Pool Area</span>
                  <span className="amenity-status">—</span>
                </div>
                <div className="amenity-metric">— current guests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Service Requests */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Service Requests</h2>
          </div>
          <div className="card-content">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">No active service requests</div>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Staff Performance</h2>
          </div>
          <div className="card-content">
            <div className="performance-metrics">
              <div className="metric-item">
                <div className="metric-label">EFFICIENCY RATING</div>
                <div className="metric-value">—%</div>
                <div className="metric-bar">
                  <div className="metric-progress" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">GUEST SATISFACTION</div>
                <div className="metric-value">—</div>
                <div className="metric-bar">
                  <div className="metric-progress" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">STAFF UTILIZATION</div>
                <div className="metric-value">—%</div>
                <div className="metric-bar">
                  <div className="metric-progress" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          <button className="action-btn">
            Create Service Request
          </button>
          <button className="action-btn">
            Manage Staff Schedule
          </button>
          <button className="action-btn">
            Update Amenity Status
          </button>
          <button className="action-btn">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagerDashboard;