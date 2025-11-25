import React from 'react';
import './RoomDetails.css';

const RoomDetails = ({ room }) => {
  return (
    <div className="room-details">
      <div className="room-header">
        <div>
          <h2>Room {room.room_number}</h2>
          <p className="room-type">{room.room_type}</p>
        </div>
        <div className="room-price">
          <span className="price">LKR {room.price_per_night}</span>
          <span className="period">/ night</span>
        </div>
      </div>

      <div className="room-specs">
        <div className="spec-item">
          <div>
            <p className="spec-label">Bed Type</p>
            <p className="spec-value">{room.bed_type}</p>
          </div>
        </div>
        <div className="spec-item">
          <div>
            <p className="spec-label">Size</p>
            <p className="spec-value">{room.square_footage} sq ft</p>
          </div>
        </div>
        <div className="spec-item">
          <div>
            <p className="spec-label">View</p>
            <p className="spec-value">{room.view_type}</p>
          </div>
        </div>
        <div className="spec-item">
          <div>
            <p className="spec-label">Floor</p>
            <p className="spec-value">{room.floor_number}</p>
          </div>
        </div>
      </div>

      <div className="room-amenities">
        <h3>Amenities</h3>
        <div className="amenities-grid">
          {room.amenities.map((amenity, idx) => (
            <div key={idx} className="amenity-tag">
              <span className="check">✓</span>
              {amenity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;