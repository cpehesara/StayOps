import React, { useEffect, useState } from "react";
import { X, AlertCircle } from 'lucide-react';
import {
  getAllRooms,
  getRoomById,
  getAvailableRooms,
  getRoomsByType,
} from "../api/room";
import '../styles/rooms.css';

const RoomView = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roomImage, setRoomImage] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  // Function to get random image path based on room type
  const getRandomRoomImage = (roomType) => {
    // Define image counts for each room type
    const imageCount = {
      'standard': 6,
      'suite': 8,
      'deluxe': 7
    };

    // Normalize the room type to lowercase
    const normalizedType = roomType.toLowerCase();
    
    // Get the count for this room type (default to 6 if not found)
    const count = imageCount[normalizedType] || 6;
    
    // Generate random number between 1 and count (inclusive)
    const randomNumber = Math.floor(Math.random() * count) + 1;
    
    // Construct and return the image path
    // IMPORTANT: Path starts with / to access from public folder
    const imagePath = `/images/rooms/${normalizedType}/${randomNumber}.jpg`;
    
    console.log('Generated image path:', imagePath); // Debug log
    
    return imagePath;
  };

  const fetchRoomDetails = async (roomId) => {
    try {
      const data = await getRoomById(roomId);
      setSelectedRoom(data);
      
      // Generate random image path based on room type
      const imagePath = getRandomRoomImage(data.type);
      setRoomImage(imagePath);
      setImageLoadError(false);
      
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching room details:", error);
      alert("Failed to fetch room details: " + error.message);
    }
  };

  const fetchRooms = async () => {
    try {
      let data = [];
      if (filter === "available") {
        data = await getAvailableRooms();
      } else if (typeFilter !== "all") {
        data = await getRoomsByType(typeFilter);
      } else {
        data = await getAllRooms();
      }

      if (filter === "available" && typeFilter !== "all") {
        data = data.filter(
          (room) => room.type.toLowerCase() === typeFilter.toLowerCase()
        );
      }

      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRoom(null);
    setRoomImage(null);
    setImageLoadError(false);
  };

  const handleImageError = (e) => {
    console.error('Failed to load image:', e.target.src); // Debug log
    setImageLoadError(true);
  };

  useEffect(() => {
    fetchRooms();
  }, [filter, typeFilter]);

  const getStatusClass = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    return `status-${normalizedStatus}`;
  };

  const needsPriorityAttention = (room) => {
    const status = room.availabilityStatus?.toLowerCase() || 'unknown';
    return status === "reserved" || status === "maintenance";
  };

  return (
    <div className="rooms-container">
      <div className="rooms-wrapper">
        
        {/* Header */}
        <div className="rooms-header">
          <h1 className="rooms-title">Rooms</h1>
          <p className="rooms-subtitle">Manage room availability and details</p>
        </div>

        {/* Filters */}
        <div className="rooms-filters">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Rooms</option>
            <option value="available">Available Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>

        {/* Room Grid */}
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`room-card ${getStatusClass(room.availabilityStatus)}`}
            >
              <div className="room-card-content">
                <div className="room-card-header">
                  <div className="room-card-title-section">
                    <h3>
                      Room {room.roomNumber}
                      {needsPriorityAttention(room) && (
                        <span className="room-priority-icon">⚠</span>
                      )}
                    </h3>
                    <p className="room-floor">Floor {room.floorNumber}</p>
                  </div>
                  <span className={`status-badge ${getStatusClass(room.availabilityStatus)}`}>
                    {room.availabilityStatus || 'Unknown'}
                  </span>
                </div>

                <div className="room-details">
                  <div className="room-detail-row">
                    <span className="room-detail-label">Type</span>
                    <span className="room-detail-value">{room.type}</span>
                  </div>
                  <div className="room-detail-row">
                    <span className="room-detail-label">Capacity</span>
                    <span className="room-detail-value">{room.capacity}</span>
                  </div>
                  <div className="room-detail-row">
                    <span className="room-detail-label">Price/Night</span>
                    <span className="room-detail-value">LKR{room.pricePerNight}</span>
                  </div>
                </div>

                <div className="room-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchRoomDetails(room.id);
                    }}
                    className="btn-view-details"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="rooms-empty">
            <p>No rooms found</p>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div 
          className="room-modal-overlay" 
          onClick={closeModal}
        >
          <div 
            className="room-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="room-modal-content">
              {selectedRoom ? (
                <>
                  {/* Room Image */}
                  <div className="room-modal-image-container">
                    {!imageLoadError ? (
                      <img 
                        src={roomImage} 
                        alt={`${selectedRoom.type} Room ${selectedRoom.roomNumber}`}
                        className="room-modal-image"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="room-modal-image-fallback">
                        <div style={{ textAlign: 'center' }}>
                          <AlertCircle size={32} style={{ marginBottom: '12px', color: '#c4bbb0' }} />
                          <p style={{ fontSize: '13px', color: '#8b8680', marginBottom: '4px' }}>
                            Room Image Not Available
                          </p>
                          <p style={{ fontSize: '11px', color: '#c4bbb0' }}>
                            Expected: {roomImage}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Body */}
                  <div className="room-modal-body">
                    <div className="room-modal-header">
                      <div className="room-modal-title-section">
                        <h2>
                          Room {selectedRoom.roomNumber}
                          {needsPriorityAttention(selectedRoom) && (
                            <span className="room-priority-icon">⚠</span>
                          )}
                        </h2>
                        <span className={`status-badge ${getStatusClass(selectedRoom.availabilityStatus)}`}>
                          {selectedRoom.availabilityStatus || 'Unknown'}
                        </span>
                      </div>
                      <button 
                        onClick={closeModal} 
                        className="room-modal-close-btn"
                        aria-label="Close modal"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {needsPriorityAttention(selectedRoom) && (
                      <div className="room-modal-alert">
                        <div className="room-modal-alert-content">
                          <AlertCircle size={18} className="room-modal-alert-icon" />
                          <div>
                            <div className="room-modal-alert-title">Priority Attention Required</div>
                            <div className="room-modal-alert-message">
                              This room requires immediate attention
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="room-modal-details">
                      <div className="room-modal-detail-item">
                        <div className="room-modal-detail-label">ROOM NUMBER</div>
                        <div className="room-modal-detail-value">{selectedRoom.roomNumber}</div>
                      </div>
                      
                      <div className="room-modal-detail-item">
                        <div className="room-modal-detail-label">FLOOR NUMBER</div>
                        <div className="room-modal-detail-value">{selectedRoom.floorNumber}</div>
                      </div>
                      
                      <div className="room-modal-detail-item">
                        <div className="room-modal-detail-label">ROOM TYPE</div>
                        <div className="room-modal-detail-value">{selectedRoom.type}</div>
                      </div>
                      
                      <div className="room-modal-detail-item">
                        <div className="room-modal-detail-label">CAPACITY</div>
                        <div className="room-modal-detail-value">{selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'person' : 'people'}</div>
                      </div>
                      
                      <div className="room-modal-detail-item">
                        <div className="room-modal-detail-label">PRICE PER NIGHT</div>
                        <div className="room-modal-detail-value">LKR{selectedRoom.pricePerNight}</div>
                      </div>
                      
                      <div className="room-modal-detail-item">
                        <div className="room-modal-detail-label">AVAILABILITY STATUS</div>
                        <div className="room-modal-detail-value">
                          <span className={`status-badge ${getStatusClass(selectedRoom.availabilityStatus)}`}>
                            {selectedRoom.availabilityStatus || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      {selectedRoom.description && (
                        <div className="room-modal-detail-item">
                          <div className="room-modal-detail-label">DESCRIPTION</div>
                          <div className="room-modal-detail-value">{selectedRoom.description}</div>
                        </div>
                      )}
                    </div>

                    <div className="room-modal-actions">
                      <button
                        onClick={closeModal}
                        className="btn-modal-close"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="room-modal-loading">Loading room details...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomView;