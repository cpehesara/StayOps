import React, { useState, useEffect } from 'react';
import { PriorityHigh } from '@mui/icons-material';

const Reservations = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // create, search, manage
  
  // Create reservation form data
  const [reservationData, setReservationData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomType: 'standard',
    guests: 1,
    specialRequests: ''
  });

  // Search form data
  const [searchData, setSearchData] = useState({
    searchBy: 'name', // name, email, phone, reservation-id
    searchValue: ''
  });

  // Mock reservations data
  const [reservations, setReservations] = useState([
    {
      id: 'RES001',
      guestName: 'John Smith',
      email: 'john@email.com',
      phone: '+1234567890',
      checkIn: '2025-09-22',
      checkOut: '2025-09-25',
      roomType: 'deluxe',
      roomNumber: '301',
      guests: 2,
      status: 'confirmed',
      total: 450.00
    },
    {
      id: 'RES002',
      guestName: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+1234567891',
      checkIn: '2025-09-21',
      checkOut: '2025-09-23',
      roomType: 'standard',
      roomNumber: '205',
      guests: 1,
      status: 'checked-in',
      total: 200.00
    },
    {
      id: 'RES003',
      guestName: 'Mike Davis',
      email: 'mike@email.com',
      phone: '+1234567892',
      checkIn: '2025-09-25',
      checkOut: '2025-09-28',
      roomType: 'suite',
      roomNumber: null,
      guests: 3,
      status: 'pending',
      total: 750.00
    }
  ]);

  const [searchResults, setSearchResults] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // StayOps Reservation API calls - Replace with your backend
  const reservationAPI = {
    createReservation: async (data) => {
      console.log('API Call: POST /api/reservations', data);
      const newReservation = {
        ...data,
        id: 'RES' + String(Date.now()).slice(-3),
        status: 'confirmed',
        roomNumber: null,
        total: calculateTotal(data.roomType, data.checkIn, data.checkOut)
      };
      return { success: true, reservation: newReservation };
    },

    searchReservations: async (searchBy, searchValue) => {
      console.log('API Call: GET /api/reservations/search', { searchBy, searchValue });
      const filtered = reservations.filter(res => {
        switch(searchBy) {
          case 'name':
            return res.guestName.toLowerCase().includes(searchValue.toLowerCase());
          case 'email':
            return res.email.toLowerCase().includes(searchValue.toLowerCase());
          case 'phone':
            return res.phone.includes(searchValue);
          case 'reservation-id':
            return res.id.toLowerCase().includes(searchValue.toLowerCase());
          default:
            return false;
        }
      });
      return { success: true, reservations: filtered };
    },

    updateReservation: async (id, updates) => {
      console.log('API Call: PUT /api/reservations/' + id, updates);
      return { success: true, message: 'Reservation updated successfully' };
    },

    cancelReservation: async (id) => {
      console.log('API Call: DELETE /api/reservations/' + id);
      return { success: true, message: 'Reservation cancelled successfully' };
    }
  };

  const calculateTotal = (roomType, checkIn, checkOut) => {
    const rates = { standard: 100, deluxe: 150, suite: 250 };
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return rates[roomType] * nights;
  };

  const handleCreateReservation = async () => {
    if (!reservationData.guestName || !reservationData.email || !reservationData.checkIn || !reservationData.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(reservationData.checkIn) >= new Date(reservationData.checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    
    try {
      const response = await reservationAPI.createReservation(reservationData);
      
      if (response.success) {
        setReservations([response.reservation, ...reservations]);
        
        // Reset form
        setReservationData({
          guestName: '',
          email: '',
          phone: '',
          checkIn: '',
          checkOut: '',
          roomType: 'standard',
          guests: 1,
          specialRequests: ''
        });
        
        alert(`Reservation created successfully! ID: ${response.reservation.id}`);
      }
    } catch (error) {
      console.error('Create reservation failed:', error);
      alert('Failed to create reservation. Please try again.');
    }
    
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchData.searchValue.trim()) {
      alert('Please enter a search value');
      return;
    }

    setLoading(true);
    
    try {
      const response = await reservationAPI.searchReservations(searchData.searchBy, searchData.searchValue);
      
      if (response.success) {
        setSearchResults(response.reservations);
        if (response.reservations.length === 0) {
          alert('No reservations found');
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleUpdateReservation = async (id, field, value) => {
    setLoading(true);
    
    try {
      const response = await reservationAPI.updateReservation(id, { [field]: value });
      
      if (response.success) {
        setReservations(reservations.map(res => 
          res.id === id ? { ...res, [field]: value } : res
        ));
        setSearchResults(searchResults.map(res => 
          res.id === id ? { ...res, [field]: value } : res
        ));
        alert('Reservation updated successfully');
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await reservationAPI.cancelReservation(id);
      
      if (response.success) {
        setReservations(reservations.filter(res => res.id !== id));
        setSearchResults(searchResults.filter(res => res.id !== id));
        setSelectedReservation(null);
        alert('Reservation cancelled successfully');
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Cancel failed. Please try again.');
    }
    
    setLoading(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusSymbol = (status) => {
    switch(status) {
      case 'confirmed': return '✅';
      case 'checked-in': return '🏨';
      case 'checked-out': return '✔️';
      case 'cancelled': return '❌';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#2e7d32';
      case 'checked-in': return '#1976d2';
      case 'checked-out': return '#666';
      case 'cancelled': return '#d32f2f';
      case 'pending': return '#f57c00';
      default: return '#666';
    }
  };

  const buttonStyle = {
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: '2px solid #000',
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'monospace'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#000',
    color: '#fff'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #000',
    borderRadius: '0',
    outline: 'none',
    fontFamily: 'monospace',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    border: '2px solid #000',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#fff'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fff', 
      color: '#000', 
      padding: '24px',
      fontFamily: 'monospace',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>
          STAYOPS RESERVATIONS
        </h1>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ fontSize: '16px', margin: '0' }}>
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', marginBottom: '32px', gap: '0' }}>
        {[
          { key: 'create', label: '📝 CREATE', icon: '📝' },
          { key: 'search', label: '🔍 SEARCH', icon: '🔍' },
          { key: 'manage', label: '📋 MANAGE', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? activeButtonStyle : buttonStyle}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create Reservation Tab */}
      {activeTab === 'create' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
            📝 CREATE NEW RESERVATION
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                GUEST NAME *
              </label>
              <input
                type="text"
                value={reservationData.guestName}
                onChange={(e) => setReservationData({...reservationData, guestName: e.target.value})}
                style={inputStyle}
                placeholder="John Smith"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                EMAIL *
              </label>
              <input
                type="email"
                value={reservationData.email}
                onChange={(e) => setReservationData({...reservationData, email: e.target.value})}
                style={inputStyle}
                placeholder="john@email.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                PHONE
              </label>
              <input
                type="tel"
                value={reservationData.phone}
                onChange={(e) => setReservationData({...reservationData, phone: e.target.value})}
                style={inputStyle}
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                NUMBER OF GUESTS
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={reservationData.guests}
                onChange={(e) => setReservationData({...reservationData, guests: parseInt(e.target.value)})}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                CHECK-IN DATE *
              </label>
              <input
                type="date"
                value={reservationData.checkIn}
                onChange={(e) => setReservationData({...reservationData, checkIn: e.target.value})}
                style={inputStyle}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                CHECK-OUT DATE *
              </label>
              <input
                type="date"
                value={reservationData.checkOut}
                onChange={(e) => setReservationData({...reservationData, checkOut: e.target.value})}
                style={inputStyle}
                min={reservationData.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
              ROOM TYPE
            </label>
            <select
              value={reservationData.roomType}
              onChange={(e) => setReservationData({...reservationData, roomType: e.target.value})}
              style={inputStyle}
            >
              <option value="standard">STANDARD - $100/night</option>
              <option value="deluxe">DELUXE - $150/night</option>
              <option value="suite">SUITE - $250/night</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
              SPECIAL REQUESTS
            </label>
            <textarea
              value={reservationData.specialRequests}
              onChange={(e) => setReservationData({...reservationData, specialRequests: e.target.value})}
              style={{...inputStyle, height: '80px', resize: 'vertical'}}
              placeholder="Any special requirements..."
            />
          </div>

          {reservationData.checkIn && reservationData.checkOut && (
            <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}>
              <strong>ESTIMATED TOTAL: ${calculateTotal(reservationData.roomType, reservationData.checkIn, reservationData.checkOut)}</strong>
            </div>
          )}
          
          <button
            onClick={handleCreateReservation}
            disabled={loading}
            style={{
              ...buttonStyle,
              width: '100%',
              padding: '20px',
              fontSize: '18px',
              backgroundColor: loading ? '#f5f5f5' : '#fff',
              color: loading ? '#999' : '#000',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'CREATING...' : 'CREATE RESERVATION'}
          </button>
        </div>
      )}

      {/* Search Reservations Tab */}
      {activeTab === 'search' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
            🔍 SEARCH RESERVATIONS
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <select
              value={searchData.searchBy}
              onChange={(e) => setSearchData({...searchData, searchBy: e.target.value})}
              style={inputStyle}
            >
              <option value="name">GUEST NAME</option>
              <option value="email">EMAIL</option>
              <option value="phone">PHONE</option>
              <option value="reservation-id">RESERVATION ID</option>
            </select>
            
            <input
              type="text"
              value={searchData.searchValue}
              onChange={(e) => setSearchData({...searchData, searchValue: e.target.value})}
              style={inputStyle}
              placeholder="Enter search value..."
            />
            
            <button
              onClick={handleSearch}
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
                SEARCH RESULTS ({searchResults.length})
              </h3>
              {searchResults.map(reservation => (
                <div key={reservation.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <strong>{reservation.id} - {reservation.guestName}</strong>
                      {/* High Priority Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                        <PriorityHigh style={{ fontSize: '16px', color: '#f57c00', marginRight: '4px' }} />
                        <span style={{ fontSize: '12px', color: '#f57c00' }}>High Priority</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getStatusSymbol(reservation.status)}
                      <span style={{ color: getStatusColor(reservation.status), fontWeight: 'bold' }}>
                        {reservation.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>EMAIL: {reservation.email}</div>
                    <div>PHONE: {reservation.phone}</div>
                    <div>CHECK-IN: {reservation.checkIn}</div>
                    <div>CHECK-OUT: {reservation.checkOut}</div>
                    <div>ROOM: {reservation.roomNumber || 'TBA'}</div>
                    <div>GUESTS: {reservation.guests}</div>
                    <div>ROOM TYPE: {reservation.roomType.toUpperCase()}</div>
                    <div>TOTAL: ${reservation.total}</div>
                  </div>
                  
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      style={{...buttonStyle, padding: '8px 12px', fontSize: '12px'}}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      style={{...buttonStyle, padding: '8px 12px', fontSize: '12px', color: '#d32f2f', borderColor: '#d32f2f'}}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage Reservations Tab */}
      {activeTab === 'manage' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
            📋 ALL RESERVATIONS ({reservations.length})
          </h2>
          
          {reservations.map(reservation => (
            <div key={reservation.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
                    {reservation.id} - {reservation.guestName}
                  </h3>
                  {/* Priority indicator for VIP or urgent reservations */}
                  {reservation.status === 'pending' && (
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                      <PriorityHigh style={{ fontSize: '16px', color: '#f57c00', marginRight: '4px' }} />
                      <span style={{ fontSize: '12px', color: '#f57c00' }}>Pending - High Priority</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {getStatusSymbol(reservation.status)}
                  <span style={{ color: getStatusColor(reservation.status), fontWeight: 'bold' }}>
                    {reservation.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                <div>EMAIL: {reservation.email}</div>
                <div>PHONE: {reservation.phone}</div>
                <div>CHECK-IN: {reservation.checkIn}</div>
                <div>CHECK-OUT: {reservation.checkOut}</div>
                <div>ROOM: {reservation.roomNumber || 'TBA'}</div>
                <div>GUESTS: {reservation.guests}</div>
                <div>ROOM TYPE: {reservation.roomType.toUpperCase()}</div>
                <div>TOTAL: ${reservation.total}</div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={reservation.status}
                  onChange={(e) => handleUpdateReservation(reservation.id, 'status', e.target.value)}
                  style={{...buttonStyle, padding: '8px', fontSize: '12px'}}
                >
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="checked-in">CHECKED IN</option>
                  <option value="checked-out">CHECKED OUT</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Room Number"
                  value={reservation.roomNumber || ''}
                  onChange={(e) => handleUpdateReservation(reservation.id, 'roomNumber', e.target.value)}
                  style={{...buttonStyle, padding: '8px', fontSize: '12px', width: '120px'}}
                />
                
                <button
                  onClick={() => handleCancelReservation(reservation.id)}
                  style={{...buttonStyle, padding: '8px 12px', fontSize: '12px', color: '#d32f2f', borderColor: '#d32f2f'}}
                >
                  CANCEL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Documentation */}
      <div style={{ 
        marginTop: '48px', 
        padding: '16px', 
        backgroundColor: '#f5f5f5', 
        border: '1px solid #ccc' 
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '12px', margin: '0 0 12px 0' }}>
          STAYOPS RESERVATION API ENDPOINTS:
        </h3>
        <div style={{ fontSize: '14px' }}>
          <div style={{ marginBottom: '4px' }}>• POST /api/reservations - Create new reservation</div>
          <div style={{ marginBottom: '4px' }}>• GET /api/reservations/search - Search reservations</div>
          <div style={{ marginBottom: '4px' }}>• PUT /api/reservations/:id - Update reservation</div>
          <div style={{ marginBottom: '4px' }}>• DELETE /api/reservations/:id - Cancel reservation</div>
          <div style={{ marginBottom: '4px' }}>• GET /api/reservations - Get all reservations</div>
        </div>
      </div>

    </div>
  );
};

export default Reservations;