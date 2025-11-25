import React, { useState, useEffect } from "react";

const API_BASE_URL = 'http://localhost:8080';

// Feature flags - set to false to disable endpoints that aren't ready yet
const ENABLE_RESERVATIONS_API = false;

// Mock API functions - replace with your actual API imports
const getAllRooms = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms/getAll`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return data.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      status: room.availabilityStatus?.toLowerCase() || 'available',
    }));
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const getReservationsForDateRange = async (startDate, endDate) => {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/date-range?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

const OperationalManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    dirtyRooms: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    totalReservations: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch rooms
      const rooms = await getAllRooms();
      
      // Fetch today's reservations (only if API is enabled)
      const today = new Date().toISOString().split('T')[0];
      let reservations = [];
      
      if (ENABLE_RESERVATIONS_API) {
        try {
          reservations = await getReservationsForDateRange(today, today);
        } catch {
          // Silently continue with empty reservations array if endpoint is not available
        }
      }

      // Calculate simple stats
      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(r => 
        r.status === 'occupied' || r.status === 'booked' || r.status === 'checked_in'
      ).length;
      const availableRooms = rooms.filter(r => r.status === 'available').length;
      const maintenanceRooms = rooms.filter(r => 
        r.status === 'maintenance' || r.status === 'out-of-order'
      ).length;
      const dirtyRooms = rooms.filter(r => 
        r.status === 'dirty' || r.status === 'checkout'
      ).length;

      const checkInsToday = reservations.filter(r => 
        r.checkInDate === today && r.status !== 'CANCELLED'
      ).length;
      const checkOutsToday = reservations.filter(r => 
        r.checkOutDate === today && r.status !== 'CANCELLED'
      ).length;

      setStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        maintenanceRooms,
        dirtyRooms,
        checkInsToday,
        checkOutsToday,
        totalReservations: reservations.length
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorText}>{error}</div>
        <button style={styles.retryButton} onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const occupancyRate = stats.totalRooms > 0 
    ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) 
    : 0;

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Operations Dashboard</h1>
          <p style={styles.subtitle}>Today's Overview</p>
        </div>
        <button style={styles.refreshButton} onClick={fetchDashboardData}>
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Occupancy Rate</div>
          <div style={styles.metricValue}>{occupancyRate}%</div>
          <div style={styles.metricFooter}>
            {stats.occupiedRooms} of {stats.totalRooms} rooms
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Available Rooms</div>
          <div style={styles.metricValue}>{stats.availableRooms}</div>
          <div style={styles.metricFooter}>Ready for check-in</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Check-ins Today</div>
          <div style={styles.metricValue}>{stats.checkInsToday}</div>
          <div style={styles.metricFooter}>Arrivals expected</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Check-outs Today</div>
          <div style={styles.metricValue}>{stats.checkOutsToday}</div>
          <div style={styles.metricFooter}>Departures expected</div>
        </div>
      </div>

      {/* Room Status */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Room Status Breakdown</h2>
        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <div style={{...styles.statusBadge, backgroundColor: '#dc2626'}}>
              {stats.occupiedRooms}
            </div>
            <div style={styles.statusInfo}>
              <div style={styles.statusLabel}>Occupied</div>
              <div style={styles.statusPercentage}>
                {stats.totalRooms > 0 
                  ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) 
                  : 0}%
              </div>
            </div>
          </div>

          <div style={styles.statusItem}>
            <div style={{...styles.statusBadge, backgroundColor: '#16a34a'}}>
              {stats.availableRooms}
            </div>
            <div style={styles.statusInfo}>
              <div style={styles.statusLabel}>Available</div>
              <div style={styles.statusPercentage}>
                {stats.totalRooms > 0 
                  ? ((stats.availableRooms / stats.totalRooms) * 100).toFixed(1) 
                  : 0}%
              </div>
            </div>
          </div>

          <div style={styles.statusItem}>
            <div style={{...styles.statusBadge, backgroundColor: '#ea580c'}}>
              {stats.dirtyRooms}
            </div>
            <div style={styles.statusInfo}>
              <div style={styles.statusLabel}>Needs Cleaning</div>
              <div style={styles.statusPercentage}>
                {stats.totalRooms > 0 
                  ? ((stats.dirtyRooms / stats.totalRooms) * 100).toFixed(1) 
                  : 0}%
              </div>
            </div>
          </div>

          <div style={styles.statusItem}>
            <div style={{...styles.statusBadge, backgroundColor: '#9333ea'}}>
              {stats.maintenanceRooms}
            </div>
            <div style={styles.statusInfo}>
              <div style={styles.statusLabel}>Maintenance</div>
              <div style={styles.statusPercentage}>
                {stats.totalRooms > 0 
                  ? ((stats.maintenanceRooms / stats.totalRooms) * 100).toFixed(1) 
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Quick Summary</h2>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{stats.totalRooms}</div>
            <div style={styles.summaryLabel}>Total Rooms</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{stats.totalReservations}</div>
            <div style={styles.summaryLabel}>Today's Reservations</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>
              {stats.checkInsToday + stats.checkOutsToday}
            </div>
            <div style={styles.summaryLabel}>Total Activity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    padding: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '400',
    color: '#2c2c2e',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#8b8680',
    margin: 0,
  },
  refreshButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#b8956a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e8e3dc',
    borderRadius: '12px',
    padding: '24px',
  },
  metricLabel: {
    fontSize: '13px',
    color: '#8b8680',
    marginBottom: '8px',
  },
  metricValue: {
    fontSize: '36px',
    fontWeight: '300',
    color: '#2c2c2e',
    marginBottom: '8px',
  },
  metricFooter: {
    fontSize: '13px',
    color: '#a8a29e',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e8e3dc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#2c2c2e',
    margin: '0 0 24px 0',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusBadge: {
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: '14px',
    color: '#2c2c2e',
    marginBottom: '4px',
  },
  statusPercentage: {
    fontSize: '13px',
    color: '#8b8680',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '24px',
  },
  summaryItem: {
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: '32px',
    fontWeight: '300',
    color: '#2c2c2e',
    marginBottom: '8px',
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#8b8680',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e8e3dc',
    borderTop: '4px solid #b8956a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#8b8680',
    fontSize: '14px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    padding: '20px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '16px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  retryButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#b8956a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default OperationalManagerDashboard;