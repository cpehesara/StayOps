import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Search, Filter, Plus, Edit, Trash2, Eye, 
  MapPin, Phone, Mail, Globe, Users, Bed, Star,
  ChevronDown, ChevronRight, MoreVertical, Download,
  Upload, RefreshCw, AlertCircle, CheckCircle, XCircle,
  Settings, Key, Wifi, Car, Coffee, Dumbbell, Droplet,
  Utensils, Flower2, Briefcase, CreditCard, Shield
} from 'lucide-react';
import '../styles/hotel-management.css';

// Module-scoped mock data for demonstration
const MOCK_HOTELS = [
  {
    id: 1,
    name: 'StayOps Downtown',
    code: 'STY-DT',
    address: '123 Main Street, Downtown, NY 10001',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    phone: '+1-555-0101',
    email: 'downtown@stayops.com',
    website: 'https://downtown.stayops.com',
    status: 'active',
    rooms: 120,
    floors: 15,
    rating: 4.5,
    checkIn: '15:00',
    checkOut: '11:00',
    timezone: 'America/New_York',
    currency: 'USD',
    amenities: ['wifi', 'parking', 'restaurant', 'gym', 'pool', 'spa'],
    features: ['business_center', 'concierge', 'room_service', 'laundry'],
    createdAt: '2023-01-15T10:00:00Z',
    lastUpdated: '2024-01-10T14:30:00Z',
    manager: {
      name: 'John Smith',
      email: 'john.smith@stayops.com',
      phone: '+1-555-0102'
    },
    settings: {
      allowOnlineBooking: true,
      requireDeposit: true,
      depositAmount: 50,
      cancellationPolicy: '24_hours',
      petFriendly: false,
      smokingAllowed: false
    }
  },
  {
    id: 2,
    name: 'StayOps Marina',
    code: 'STY-MR',
    address: '456 Harbor View, Marina District, CA 90210',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    phone: '+1-555-0201',
    email: 'marina@stayops.com',
    website: 'https://marina.stayops.com',
    status: 'active',
    rooms: 89,
    floors: 12,
    rating: 4.8,
    checkIn: '15:00',
    checkOut: '11:00',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    amenities: ['wifi', 'parking', 'restaurant', 'gym', 'pool', 'spa', 'beach_access'],
    features: ['business_center', 'concierge', 'room_service', 'valet_parking'],
    createdAt: '2023-03-20T09:00:00Z',
    lastUpdated: '2024-01-12T16:45:00Z',
    manager: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@stayops.com',
      phone: '+1-555-0202'
    },
    settings: {
      allowOnlineBooking: true,
      requireDeposit: true,
      depositAmount: 75,
      cancellationPolicy: '48_hours',
      petFriendly: true,
      smokingAllowed: false
    }
  },
  {
    id: 3,
    name: 'StayOps Airport',
    code: 'STY-AP',
    address: '789 Airport Boulevard, Terminal 2, TX 77001',
    city: 'Houston',
    state: 'TX',
    country: 'USA',
    phone: '+1-555-0301',
    email: 'airport@stayops.com',
    website: 'https://airport.stayops.com',
    status: 'maintenance',
    rooms: 76,
    floors: 8,
    rating: 4.2,
    checkIn: '14:00',
    checkOut: '12:00',
    timezone: 'America/Chicago',
    currency: 'USD',
    amenities: ['wifi', 'parking', 'restaurant', 'gym', 'shuttle_service'],
    features: ['business_center', 'concierge', 'room_service', 'airport_shuttle'],
    createdAt: '2023-06-10T11:30:00Z',
    lastUpdated: '2024-01-08T10:15:00Z',
    manager: {
      name: 'Mike Davis',
      email: 'mike.davis@stayops.com',
      phone: '+1-555-0302'
    },
    settings: {
      allowOnlineBooking: false,
      requireDeposit: true,
      depositAmount: 25,
      cancellationPolicy: '12_hours',
      petFriendly: false,
      smokingAllowed: false
    }
  },
  {
    id: 4,
    name: 'StayOps Resort',
    code: 'STY-RS',
    address: '321 Mountain View, Resort Valley, CO 80424',
    city: 'Aspen',
    state: 'CO',
    country: 'USA',
    phone: '+1-555-0401',
    email: 'resort@stayops.com',
    website: 'https://resort.stayops.com',
    status: 'active',
    rooms: 145,
    floors: 6,
    rating: 4.9,
    checkIn: '16:00',
    checkOut: '11:00',
    timezone: 'America/Denver',
    currency: 'USD',
    amenities: ['wifi', 'parking', 'restaurant', 'gym', 'pool', 'spa', 'ski_rental', 'golf_course'],
    features: ['business_center', 'concierge', 'room_service', 'valet_parking', 'ski_concierge'],
    createdAt: '2023-02-28T13:45:00Z',
    lastUpdated: '2024-01-14T09:20:00Z',
    manager: {
      name: 'Emily Wilson',
      email: 'emily.wilson@stayops.com',
      phone: '+1-555-0402'
    },
    settings: {
      allowOnlineBooking: true,
      requireDeposit: true,
      depositAmount: 100,
      cancellationPolicy: '72_hours',
      petFriendly: true,
      smokingAllowed: false
    }
  }
];

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [expandedHotels, setExpandedHotels] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const loadHotels = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, you would call the API and pass filters/pagination
      setTimeout(() => {
  setHotels(MOCK_HOTELS);
        setTotalPages(1);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading hotels:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels, currentPage, searchTerm, statusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectHotel = (hotelId) => {
    setSelectedHotels(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const handleSelectAll = () => {
    if (selectedHotels.length === filteredHotels.length) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels(filteredHotels.map(hotel => hotel.id));
    }
  };

  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setShowEditModal(true);
  };

  const handleToggleHotelStatus = async (hotelId, currentStatus) => {
    try {
      // In a real app, you would call the API
      console.log(`Toggling hotel ${hotelId} status from ${currentStatus}`);
      loadHotels();
    } catch (error) {
      console.error('Error updating hotel status:', error);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        // In a real app, you would call the API
        console.log(`Deleting hotel ${hotelId}`);
        loadHotels();
      } catch (error) {
        console.error('Error deleting hotel:', error);
      }
    }
  };

  const toggleHotelExpansion = (hotelId) => {
    setExpandedHotels(prev => ({
      ...prev,
      [hotelId]: !prev[hotelId]
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: CheckCircle, text: 'Active' },
      inactive: { color: 'error', icon: XCircle, text: 'Inactive' },
      maintenance: { color: 'warning', icon: AlertCircle, text: 'Maintenance' },
      suspended: { color: 'error', icon: XCircle, text: 'Suspended' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const IconComponent = config.icon;
    
    return (
      <span className={`status-badge ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  // Note: amenity icon rendering is currently not used in the UI table.

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = !searchTerm || 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || hotel.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Note: date formatting helper removed as unused.

  return (
    <div className="hotel-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Hotel Management</h1>
          <p>Manage hotel properties, settings, and configurations across the StayOps platform</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={16} />
            Export Hotels
          </button>
          <button className="btn-secondary">
            <Upload size={16} />
            Import Hotels
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Add Hotel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={handleStatusFilter}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <button className="btn-refresh" onClick={loadHotels}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedHotels.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedHotels.length} hotel(s) selected</span>
          <div className="bulk-buttons">
            <button className="btn-secondary">Bulk Edit</button>
            <button className="btn-secondary">Export Selected</button>
            <button className="btn-danger">Bulk Delete</button>
          </div>
        </div>
      )}

      {/* Hotels Table */}
      <div className="hotels-table-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="spinning" />
            <p>Loading hotels...</p>
          </div>
        ) : (
          <div className="hotels-table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedHotels.length === filteredHotels.length && filteredHotels.length > 0}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="table-cell">Hotel</div>
                <div className="table-cell">Location</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Rooms</div>
                <div className="table-cell">Rating</div>
                <div className="table-cell">Manager</div>
                <div className="table-cell">Actions</div>
              </div>
            </div>
            
            <div className="table-body">
              {filteredHotels.map((hotel) => (
                <div key={hotel.id} className="table-row hotel-row">
                  <div className="table-cell checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedHotels.includes(hotel.id)}
                      onChange={() => handleSelectHotel(hotel.id)}
                    />
                  </div>
                  
                  <div className="table-cell hotel-info">
                    <div className="hotel-avatar">
                      <Building2 size={24} />
                    </div>
                    <div className="hotel-details">
                      <div className="hotel-name">{hotel.name}</div>
                      <div className="hotel-code">{hotel.code}</div>
                      <div className="hotel-website">{hotel.website}</div>
                    </div>
                  </div>
                  
                  <div className="table-cell location-info">
                    <div className="location-address">
                      <MapPin size={12} />
                      {hotel.address}
                    </div>
                    <div className="location-city">
                      {hotel.city}, {hotel.state} {hotel.country}
                    </div>
                    <div className="location-contact">
                      <Phone size={12} />
                      {hotel.phone}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    {getStatusBadge(hotel.status)}
                  </div>
                  
                  <div className="table-cell">
                    <div className="rooms-info">
                      <Bed size={14} />
                      {hotel.rooms} rooms
                    </div>
                    <div className="floors-info">
                      {hotel.floors} floors
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="rating-info">
                      <Star size={14} className="star-icon" />
                      {hotel.rating}
                    </div>
                  </div>
                  
                  <div className="table-cell manager-info">
                    <div className="manager-name">{hotel.manager.name}</div>
                    <div className="manager-email">{hotel.manager.email}</div>
                    <div className="manager-phone">{hotel.manager.phone}</div>
                  </div>
                  
                  <div className="table-cell actions-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => toggleHotelExpansion(hotel.id)}
                        title="View Details"
                      >
                        {expandedHotels[hotel.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleEditHotel(hotel)}
                        title="Edit Hotel"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleToggleHotelStatus(hotel.id, hotel.status)}
                        title={hotel.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {hotel.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDeleteHotel(hotel.id)}
                        title="Delete Hotel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Create Hotel Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Hotel</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Hotel creation form would go here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {showEditModal && editingHotel && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Hotel: {editingHotel.name}</h2>
              <button onClick={() => setShowEditModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Hotel edit form would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManagement;
