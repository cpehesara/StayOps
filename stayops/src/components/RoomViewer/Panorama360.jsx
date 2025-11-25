// src/components/RoomViewer/Panorama360.jsx
import React, { useState } from 'react';
import { Pannellum } from 'pannellum-react';
import './Panorama360.css';

const Panorama360 = ({ panoramaUrl, roomNumber }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleError = () => {
    setError('Failed to load 360° view');
    setIsLoading(false);
  };

  return (
    <div className="panorama-container">
      {isLoading && !error && (
        <div className="panorama-loader">
          <div className="spinner"></div>
          <p>Loading 360° View...</p>
        </div>
      )}
      
      {error && (
        <div className="panorama-error">
          <p>{error}</p>
        </div>
      )}
      
      {panoramaUrl && !error && (
        <Pannellum
          width="100%"
          height="600px"
          image={panoramaUrl}
          pitch={0}
          yaw={0}
          hfov={110}
          autoLoad
          showZoomCtrl={true}
          showFullscreenCtrl={true}
          mouseZoom={true}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        >
          <Pannellum.Hotspot
            type="info"
            pitch={0}
            yaw={0}
            text={`Room ${roomNumber}`}
          />
        </Pannellum>
      )}
      
      {!error && (
        <div className="panorama-controls">
          <p> Drag to look around | Scroll to zoom</p>
        </div>
      )}
    </div>
  );
};

export default Panorama360;