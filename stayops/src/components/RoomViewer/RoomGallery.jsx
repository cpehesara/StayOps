import React, { useState } from 'react';
import './RoomGallery.css';

const RoomGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="room-gallery">
      <div className="gallery-main">
        <img 
          src={images[selectedImage]} 
          alt={`Room view ${selectedImage + 1}`}
          className="main-image"
        />
        <div className="image-counter">
          {selectedImage + 1} / {images.length}
        </div>
      </div>
      
      <div className="gallery-thumbnails">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
            onClick={() => setSelectedImage(idx)}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomGallery;