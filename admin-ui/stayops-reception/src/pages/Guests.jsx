import React, { useState, useEffect } from 'react';

const Guests = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, search, history, preferences
  
  // Guest profile form data
  const [guestData, setGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
    idType: 'passport',
    idNumber: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  // Search form data
  const [searchData, setSearchData] = useState({
    searchBy: 'name', // name, email, phone, id-number
    searchValue: ''
  });

  // Mock guests database
  const [guests, setGuests] = useState([
    {
      id: 'G001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@email.com',
      phone: '+1234567890',
      dateOfBirth: '1985-06-15',
      nationality: 'American',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      idType: 'passport',
      idNumber: 'P123456789',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '+1234567891',
      totalStays: 5,
      totalSpent: 2250.00,
      lastVisit: '2025-09-15',
      status: 'vip',
      preferences: {
        roomType: 'deluxe',
        bedType: 'king',
        floor: 'high',
        smoking: false,
        specialRequests: 'Extra towels, late checkout'
      }
    },
    {
      id: 'G002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@email.com',
      phone: '+1234567892',
      dateOfBirth: '1990-03-22',
      nationality: 'Canadian',
      address: '456 Oak Ave',
      city: 'Toronto',
      country: 'Canada',
      idType: 'drivers-license',
      idNumber: 'DL987654321',
      emergencyContact: 'Mike Johnson',
      emergencyPhone: '+1234567893',
      totalStays: 2,
      totalSpent: 800.00,
      lastVisit: '2025-09-10',
      status: 'regular',
      preferences: {
        roomType: 'standard',
        bedType: 'queen',
        floor: 'low',
        smoking: false,
        specialRequests: 'Quiet room'
      }
    },
    {
      id: 'G003',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      email: 'ahmed@email.com',
      phone: '+1234567894',
      dateOfBirth: '1978-11-08',
      nationality: 'Egyptian',
      address: '789 Palm St',
      city: 'Cairo',
      country: 'Egypt',
      idType: 'passport',
      idNumber: 'P555666777',
      emergencyContact: 'Fatima Hassan',
      emergencyPhone: '+1234567895',
      totalStays: 12,
      totalSpent: 5400.00,
      lastVisit: '2025-09-18',
      status: 'platinum',
      preferences: {
        roomType: 'suite',
        bedType: 'king',
        floor: 'high',
        smoking: false,
        specialRequests: 'Halal meals, prayer mat'
      }
    }
  ]);

  const [searchResults, setSearchResults] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestHistory, setGuestHistory] = useState([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // StayOps Guest API calls - Replace with your backend
  const guestAPI = {
    createGuest: async (data) => {
      console.log('API Call: POST /api/guests', data);
      const newGuest = {
        ...data,
        id: 'G' + String(Date.now()).slice(-3),
        totalStays: 0,
        totalSpent: 0.00,
        lastVisit: null,
        status: 'new',
        preferences: {
          roomType: 'standard',
          bedType: 'queen',
          floor: 'any',
          smoking: false,
          specialRequests: ''
        }
      };
      return { success: true, guest: newGuest };
    },

    searchGuests: async (searchBy, searchValue) => {
      console.log('API Call: GET /api/guests/search', { searchBy, searchValue });
      const filtered = guests.filter(guest => {
        switch(searchBy) {
          case 'name':
            return `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchValue.toLowerCase());
          case 'email':
            return guest.email.toLowerCase().includes(searchValue.toLowerCase());
          case 'phone':
            return guest.phone.includes(searchValue);
          case 'id-number':
            return guest.idNumber.toLowerCase().includes(searchValue.toLowerCase());
          default:
            return false;
        }
      });
      return { success: true, guests: filtered };
    },

    updateGuest: async (id, updates) => {
      console.log('API Call: PUT /api/guests/' + id, updates);
      return { success: true, message: 'Guest profile updated successfully' };
    },

    getGuestHistory: async (guestId) => {
      console.log('API Call: GET /api/guests/' + guestId + '/history');
      // Mock history data
      const mockHistory = [
        {
          reservationId: 'RES001',
          checkIn: '2025-09-15',
          checkOut: '2025-09-18',
          roomNumber: '301',
          roomType: 'deluxe',
          totalAmount: 450.00,
          status: 'completed',
          rating: 5,
          feedback: 'Excellent service!'
        },
        {
          reservationId: 'RES045',
          checkIn: '2025-08-10',
          checkOut: '2025-08-12',
          roomNumber: '205',
          roomType: 'standard',
          totalAmount: 200.00,
          status: 'completed',
          rating: 4,
          feedback: 'Good stay, room was clean'
        }
      ];
      return { success: true, history: mockHistory };
    },

    updatePreferences: async (guestId, preferences) => {
      console.log('API Call: PUT /api/guests/' + guestId + '/preferences', preferences);
      return { success: true, message: 'Preferences updated successfully' };
    }
  };

  const handleCreateGuest = async () => {
    if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await guestAPI.createGuest(guestData);
      
      if (response.success) {
        setGuests([response.guest, ...guests]);
        
        // Reset form
        setGuestData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          nationality: '',
          address: '',
          city: '',
          country: '',
          idType: 'passport',
          idNumber: '',
          emergencyContact: '',
          emergencyPhone: ''
        });
        
        alert(`Guest profile created successfully! ID: ${response.guest.id}`);
      }
    } catch (error) {
      console.error('Create guest failed:', error);
      alert('Failed to create guest profile. Please try again.');
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
      const response = await guestAPI.searchGuests(searchData.searchBy, searchData.searchValue);
      
      if (response.success) {
        setSearchResults(response.guests);
        if (response.guests.length === 0) {
          alert('No guests found');
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleViewHistory = async (guest) => {
    setSelectedGuest(guest);
    setLoading(true);
    
    try {
      const response = await guestAPI.getGuestHistory(guest.id);
      
      if (response.success) {
        setGuestHistory(response.history);
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Get history failed:', error);
      alert('Failed to load guest history. Please try again.');
    }
    
    setLoading(false);
  };

  const handleUpdatePreferences = async (guestId, preferences) => {
    setLoading(true);
    
    try {
      const response = await guestAPI.updatePreferences(guestId, preferences);
      
      if (response.success) {
        setGuests(guests.map(guest => 
          guest.id === guestId ? { ...guest, preferences } : guest
        ));
        alert('Guest preferences updated successfully');
      }
    } catch (error) {
      console.error('Update preferences failed:', error);
      alert('Failed to update preferences. Please try again.');
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
      case 'new': return '🆕';
      case 'regular': return '👤';
      case 'vip': return '⭐';
      case 'platinum': return '💎';
      default: return '👤';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return '#4caf50';
      case 'regular': return '#2196f3';
      case 'vip': return '#ff9800';
      case 'platinum': return '#9c27b0';
      default: return '#666';
    }
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
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
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>
          STAYOPS GUEST MANAGEMENT
        </h1>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ fontSize: '16px', margin: '0' }}>
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', marginBottom: '32px', gap: '0', flexWrap: 'wrap' }}>
        {[
          { key: 'profile', label: '👤 PROFILE' },
          { key: 'search', label: '🔍 SEARCH' },
          { key: 'history', label: '📋 HISTORY' },
          { key: 'preferences', label: '⚙️ PREFERENCES' }
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

      {/* Create Guest Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
            👤 CREATE GUEST PROFILE
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                FIRST NAME *
              </label>
              <input
                type="text"
                value={guestData.firstName}
                onChange={(e) => setGuestData({...guestData, firstName: e.target.value})}
                style={inputStyle}
                placeholder="John"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                LAST NAME *
              </label>
              <input
                type="text"
                value={guestData.lastName}
                onChange={(e) => setGuestData({...guestData, lastName: e.target.value})}
                style={inputStyle}
                placeholder="Smith"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                EMAIL *
              </label>
              <input
                type="email"
                value={guestData.email}
                onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                style={inputStyle}
                placeholder="john@email.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                PHONE *
              </label>
              <input
                type="tel"
                value={guestData.phone}
                onChange={(e) => setGuestData({...guestData, phone: e.target.value})}
                style={inputStyle}
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                DATE OF BIRTH
              </label>
              <input
                type="date"
                value={guestData.dateOfBirth}
                onChange={(e) => setGuestData({...guestData, dateOfBirth: e.target.value})}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                NATIONALITY
              </label>
              <input
                type="text"
                value={guestData.nationality}
                onChange={(e) => setGuestData({...guestData, nationality: e.target.value})}
                style={inputStyle}
                placeholder="American"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                ADDRESS
              </label>
              <input
                type="text"
                value={guestData.address}
                onChange={(e) => setGuestData({...guestData, address: e.target.value})}
                style={inputStyle}
                placeholder="123 Main St"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                CITY
              </label>
              <input
                type="text"
                value={guestData.city}
                onChange={(e) => setGuestData({...guestData, city: e.target.value})}
                style={inputStyle}
                placeholder="New York"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                COUNTRY
              </label>
              <input
                type="text"
                value={guestData.country}
                onChange={(e) => setGuestData({...guestData, country: e.target.value})}
                style={inputStyle}
                placeholder="USA"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                ID TYPE
              </label>
              <select
                value={guestData.idType}
                onChange={(e) => setGuestData({...guestData, idType: e.target.value})}
                style={inputStyle}
              >
                <option value="passport">PASSPORT</option>
                <option value="drivers-license">DRIVER'S LICENSE</option>
                <option value="national-id">NATIONAL ID</option>
                <option value="other">OTHER</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                ID NUMBER
              </label>
              <input
                type="text"
                value={guestData.idNumber}
                onChange={(e) => setGuestData({...guestData, idNumber: e.target.value})}
                style={inputStyle}
                placeholder="P123456789"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                EMERGENCY CONTACT
              </label>
              <input
                type="text"
                value={guestData.emergencyContact}
                onChange={(e) => setGuestData({...guestData, emergencyContact: e.target.value})}
                style={inputStyle}
                placeholder="Jane Smith"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                EMERGENCY PHONE
              </label>
              <input
                type="tel"
                value={guestData.emergencyPhone}
                onChange={(e) => setGuestData({...guestData, emergencyPhone: e.target.value})}
                style={inputStyle}
                placeholder="+1234567890"
              />
            </div>
          </div>
          
          <button
            onClick={handleCreateGuest}
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
            {loading ? 'CREATING...' : 'CREATE GUEST PROFILE'}
          </button>
        </div>
      )}

      {/* Search Guests Tab */}
      {activeTab === 'search' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
            🔍 SEARCH GUESTS
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <select
              value={searchData.searchBy}
              onChange={(e) => setSearchData({...searchData, searchBy: e.target.value})}
              style={inputStyle}
            >
              <option value="name">NAME</option>
              <option value="email">EMAIL</option>
              <option value="phone">PHONE</option>
              <option value="id-number">ID NUMBER</option>
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
              {searchResults.map(guest => (
                <div key={guest.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
                        {guest.id} - {guest.firstName} {guest.lastName}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getStatusSymbol(guest.status)}
                      <span style={{ color: getStatusColor(guest.status), fontWeight: 'bold' }}>
                        {guest.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    <div>EMAIL: {guest.email}</div>
                    <div>PHONE: {guest.phone}</div>
                    <div>NATIONALITY: {guest.nationality}</div>
                    <div>TOTAL STAYS: {guest.totalStays}</div>
                    <div>TOTAL SPENT: ${guest.totalSpent}</div>
                    <div>LAST VISIT: {guest.lastVisit || 'Never'}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleViewHistory(guest)}
                      style={{...buttonStyle, padding: '8px 12px', fontSize: '12px'}}
                    >
                      VIEW HISTORY
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGuest(guest);
                        setActiveTab('preferences');
                      }}
                      style={{...buttonStyle, padding: '8px 12px', fontSize: '12px'}}
                    >
                      PREFERENCES
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guest History Tab */}
      {activeTab === 'history' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
            📋 GUEST HISTORY
            {selectedGuest && (
              <span style={{ fontSize: '18px', fontWeight: 'normal', marginLeft: '16px' }}>
                - {selectedGuest.firstName} {selectedGuest.lastName}
              </span>
            )}
          </h2>
          
          {selectedGuest && (
            <div style={{ ...cardStyle, marginBottom: '24px', backgroundColor: '#f5f5f5' }}>
              <h3 style={{ margin: '0 0 12px 0' }}>GUEST SUMMARY</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                <div>TOTAL STAYS: {selectedGuest.totalStays}</div>
                <div>TOTAL SPENT: ${selectedGuest.totalSpent}</div>
                <div>LAST VISIT: {selectedGuest.lastVisit}</div>
                <div>STATUS: {getStatusSymbol(selectedGuest.status)} {selectedGuest.status.toUpperCase()}</div>
              </div>
            </div>
          )}
          
          {guestHistory.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
                STAY HISTORY ({guestHistory.length})
              </h3>
              {guestHistory.map((stay, index) => (
                <div key={stay.reservationId} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <strong>{stay.reservationId} - Room {stay.roomNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>
                        {stay.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                    <div>CHECK-IN: {stay.checkIn}</div>
                    <div>CHECK-OUT: {stay.checkOut}</div>
                    <div>ROOM TYPE: {stay.roomType.toUpperCase()}</div>
                    <div>TOTAL: ${stay.totalAmount}</div>
                  </div>
                  
                  {stay.rating && (
                    <div style={{ fontSize: '14px', marginTop: '8px' }}>
                      <div>RATING: {getRatingStars(stay.rating)} ({stay.rating}/5)</div>
                      {stay.feedback && (
                        <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                          FEEDBACK: "{stay.feedback}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              {selectedGuest ? 'No stay history found for this guest.' : 'Please select a guest to view history.'}
            </div>
          )}
        </div>
      )}

      {/* Guest Preferences Tab */}
      {activeTab === 'preferences' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
            ⚙️ GUEST PREFERENCES
            {selectedGuest && (
              <span style={{ fontSize: '18px', fontWeight: 'normal', marginLeft: '16px' }}>
                - {selectedGuest.firstName} {selectedGuest.lastName}
              </span>
            )}
          </h2>
          
          {selectedGuest ? (
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                    PREFERRED ROOM TYPE
                  </label>
                  <select
                    value={selectedGuest.preferences.roomType}
                    onChange={(e) => {
                      const newPrefs = { ...selectedGuest.preferences, roomType: e.target.value };
                      setSelectedGuest({ ...selectedGuest, preferences: newPrefs });
                    }}
                    style={inputStyle}
                  >
                    <option value="standard">STANDARD</option>
                    <option value="deluxe">DELUXE</option>
                    <option value="suite">SUITE</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                    PREFERRED BED TYPE
                  </label>
                  <select
                    value={selectedGuest.preferences.bedType}
                    onChange={(e) => {
                      const newPrefs = { ...selectedGuest.preferences, bedType: e.target.value };
                      setSelectedGuest({ ...selectedGuest, preferences: newPrefs });
                    }}
                    style={inputStyle}
                  >
                    <option value="single">SINGLE</option>
                    <option value="double">DOUBLE</option>
                    <option value="queen">QUEEN</option>
                    <option value="king">KING</option>
                    <option value="twin">TWIN BEDS</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                    PREFERRED FLOOR
                  </label>
                  <select
                    value={selectedGuest.preferences.floor}
                    onChange={(e) => {
                      const newPrefs = { ...selectedGuest.preferences, floor: e.target.value };
                      setSelectedGuest({ ...selectedGuest, preferences: newPrefs });
                    }}
                    style={inputStyle}
                  >
                    <option value="any">ANY FLOOR</option>
                    <option value="low">LOW FLOOR (1-3)</option>
                    <option value="mid">MID FLOOR (4-7)</option>
                    <option value="high">HIGH FLOOR (8+)</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                    SMOKING PREFERENCE
                  </label>
                  <select
                    value={selectedGuest.preferences.smoking}
                    onChange={(e) => {
                      const newPrefs = { ...selectedGuest.preferences, smoking: e.target.value === 'true' };
                      setSelectedGuest({ ...selectedGuest, preferences: newPrefs });
                    }}
                    style={inputStyle}
                  >
                    <option value="false">NON-SMOKING</option>
                    <option value="true">SMOKING</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                  SPECIAL REQUESTS
                </label>
                <textarea
                  value={selectedGuest.preferences.specialRequests}
                  onChange={(e) => {
                    const newPrefs = { ...selectedGuest.preferences, specialRequests: e.target.value };
                    setSelectedGuest({ ...selectedGuest, preferences: newPrefs });
                  }}
                  style={{...inputStyle, height: '100px', resize: 'vertical'}}
                  placeholder="Extra towels, late checkout, specific dietary requirements..."
                />
              </div>
              
              <button
                onClick={() => handleUpdatePreferences(selectedGuest.id, selectedGuest.preferences)}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  backgroundColor: loading ? '#f5f5f5' : '#fff',
                  color: loading ? '#999' : '#000',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'UPDATING...' : 'UPDATE PREFERENCES'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Please select a guest from the search results to manage preferences.
            </div>
          )}
        </div>
      )}

      {/* All Guests Overview */}
      <div style={{ borderTop: '2px solid #000', paddingTop: '32px', marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', margin: '0 0 24px 0' }}>
          👥 ALL GUESTS OVERVIEW ({guests.length})
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {guests.map(guest => (
            <div key={guest.id} style={{...cardStyle, padding: '12px'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {guest.firstName} {guest.lastName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {getStatusSymbol(guest.status)}
                  <span style={{ color: getStatusColor(guest.status), fontSize: '12px', fontWeight: 'bold' }}>
                    {guest.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                <div>ID: {guest.id}</div>
                <div>EMAIL: {guest.email}</div>
                <div>PHONE: {guest.phone}</div>
                <div>STAYS: {guest.totalStays} | SPENT: ${guest.totalSpent}</div>
              </div>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleViewHistory(guest)}
                  style={{...buttonStyle, padding: '6px 8px', fontSize: '10px', flex: 1}}
                >
                  HISTORY
                </button>
                <button
                  onClick={() => {
                    setSelectedGuest(guest);
                    setActiveTab('preferences');
                  }}
                  style={{...buttonStyle, padding: '6px 8px', fontSize: '10px', flex: 1}}
                >
                  PREFS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <div style={{ 
        marginTop: '48px', 
        padding: '16px', 
        backgroundColor: '#f5f5f5', 
        border: '1px solid #ccc' 
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '12px', margin: '0 0 12px 0' }}>
          STAYOPS GUEST API ENDPOINTS:
        </h3>
        <div style={{ fontSize: '14px' }}>
          <div style={{ marginBottom: '4px' }}>• POST /api/guests - Create new guest profile</div>
          <div style={{ marginBottom: '4px' }}>• GET /api/guests/search - Search guest profiles</div>
          <div style={{ marginBottom: '4px' }}>• PUT /api/guests/:id - Update guest profile</div>
          <div style={{ marginBottom: '4px' }}>• GET /api/guests/:id/history - Get guest stay history</div>
          <div style={{ marginBottom: '4px' }}>• PUT /api/guests/:id/preferences - Update guest preferences</div>
          <div style={{ marginBottom: '4px' }}>• GET /api/guests - Get all guest profiles</div>
        </div>
        
        <h4 style={{ fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', margin: '16px 0 8px 0' }}>
          Guest Profile Structure:
        </h4>
        <div style={{ 
          fontSize: '12px', 
          backgroundColor: '#fff', 
          padding: '8px', 
          border: '1px solid #999',
          fontFamily: 'monospace'
        }}>
{`{
  "id": "G001",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@email.com",
  "phone": "+1234567890",
  "dateOfBirth": "1985-06-15",
  "nationality": "American",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "idType": "passport",
  "idNumber": "P123456789",
  "emergencyContact": "Jane Smith",
  "emergencyPhone": "+1234567891",
  "totalStays": 5,
  "totalSpent": 2250.00,
  "lastVisit": "2025-09-15",
  "status": "vip",
  "preferences": {
    "roomType": "deluxe",
    "bedType": "king",
    "floor": "high",
    "smoking": false,
    "specialRequests": "Extra towels"
  }
}`}
        </div>
      </div>

    </div>
  );
};

export default Guests;