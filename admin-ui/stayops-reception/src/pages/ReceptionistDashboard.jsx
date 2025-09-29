import React, { useState, useEffect, useRef, useCallback } from "react";
import jsQR from "jsqr";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Add,
  Today,
  ExpandMore,
  Close,
  Save,
  ZoomIn,
  ZoomOut,
  DragIndicator,
  QrCodeScanner,
  Person,
  Refresh
} from "@mui/icons-material";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API functions
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

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();
    
    const transformedData = data.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      roomType: room.type,
      floor: parseInt(room.floorNumber),
      status: room.availabilityStatus?.toLowerCase() || 'available',
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      description: room.description
    }));
    
    console.log('Fetched rooms from API:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const getGuestDetails = async (guestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
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
    console.log('Fetched guest details:', data);
    return data;
  } catch (error) {
    console.error('Error fetching guest details:', error);
    throw error;
  }
};

const createReservation = async (reservationData) => {
  try {
    console.log('Sending reservation data:', reservationData);
    
    const response = await fetch(`${API_BASE_URL}/api/reservations/create`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(reservationData)
    });

    console.log('Reservation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reservation creation failed:', errorText);
      throw new Error(`Failed to create reservation: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created reservation response:', data);
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

const createReservationDetails = async (reservationId, detailsData) => {
  try {
    console.log('Sending reservation details:', detailsData);
    
    const response = await fetch(`${API_BASE_URL}/api/reservation-details/create/${reservationId}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(detailsData)
    });

    console.log('Reservation details response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reservation details creation failed:', errorText);
      throw new Error(`Failed to create reservation details: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Created reservation details response:', data);
    return data;
  } catch (error) {
    console.error('Error creating reservation details:', error);
    throw error;
  }
};

// QR Scanner Component with enhanced detection
const QRScanner = ({ isOpen, onClose, onScan, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const debugCanvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebugCanvas, setShowDebugCanvas] = useState(false);
  const intervalRef = useRef(null);
  const lastScanTime = useRef(0);
  const scanAttempts = useRef(0);
  const lastSuccessfulScan = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setScanError(null);
      setDebugInfo('Initializing camera...');
      scanAttempts.current = 0;
      
      // Enhanced camera constraints for better QR detection
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, min: 1280, max: 4096 },
          height: { ideal: 1080, min: 720, max: 2160 },
          frameRate: { ideal: 30, min: 15, max: 60 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        const video = videoRef.current;
        video.playsInline = true;
        video.setAttribute('playsinline', true);
        
        const handleVideoReady = () => {
          if (video.readyState >= 2) {
            setIsScanning(true);
            setDebugInfo('Camera ready - scanning for QR codes...');
            
            // Start scanning with optimized interval
            intervalRef.current = setInterval(scanQRCode, 100);
            
            // Clean up listeners
            video.removeEventListener('canplay', handleVideoReady);
            video.removeEventListener('loadedmetadata', handleVideoReady);
            video.removeEventListener('playing', handleVideoReady);
          }
        };
        
        video.addEventListener('canplay', handleVideoReady);
        video.addEventListener('loadedmetadata', handleVideoReady);
        video.addEventListener('playing', handleVideoReady);
        
        // Fallback timeout
        setTimeout(() => {
          if (!isScanning && video.readyState >= 2) {
            handleVideoReady();
          }
        }, 2000);
        
        // Try to play the video
        try {
          await video.play();
        } catch (playError) {
          console.log('Video play error (may be normal):', playError);
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanError(`Camera error: ${error.message}`);
      setDebugInfo('Camera failed to start');
      if (onError) onError('Camera access denied or unavailable');
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    setIsScanning(false);
    setDebugInfo('');
    scanAttempts.current = 0;
  };

  const scanQRCode = () => {
    const now = Date.now();
    
    // Rate limiting to prevent excessive CPU usage
    if (now - lastScanTime.current < 80) return;
    lastScanTime.current = now;

    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState < 2) {
      setDebugInfo('Video not ready...');
      return;
    }

    try {
      const { videoWidth, videoHeight } = video;
      
      if (videoWidth === 0 || videoHeight === 0) {
        setDebugInfo('Invalid video dimensions');
        return;
      }

      // Set canvas size to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      const imageData = context.getImageData(0, 0, videoWidth, videoHeight);
      
      scanAttempts.current++;
      
      // Try jsQR with multiple configurations
      let code = null;
      const configs = [
        { inversionAttempts: "dontInvert" },
        { inversionAttempts: "attemptBoth" },
        { inversionAttempts: "invertFirst" },
        { inversionAttempts: "onlyInvert" }
      ];
      
      for (const config of configs) {
        try {
          code = jsQR(imageData.data, imageData.width, imageData.height, config);
          if (code && code.data && code.data.trim()) break;
        } catch (jsqrError) {
          console.log('jsQR config error:', jsqrError);
        }
      }
      
      // If no code found, try scanning different regions
      if (!code) {
        const regions = [
          // Center square
          { 
            x: Math.floor(videoWidth * 0.2), 
            y: Math.floor(videoHeight * 0.2), 
            w: Math.floor(videoWidth * 0.6), 
            h: Math.floor(videoHeight * 0.6) 
          },
          // Full frame with different processing
          { x: 0, y: 0, w: videoWidth, h: videoHeight },
          // Top half
          { x: 0, y: 0, w: videoWidth, h: Math.floor(videoHeight * 0.7) },
          // Bottom half  
          { x: 0, y: Math.floor(videoHeight * 0.3), w: videoWidth, h: Math.floor(videoHeight * 0.7) }
        ];
        
        for (const region of regions) {
          try {
            if (region.x + region.w <= videoWidth && region.y + region.h <= videoHeight && region.w > 0 && region.h > 0) {
              const regionData = context.getImageData(region.x, region.y, region.w, region.h);
              code = jsQR(regionData.data, regionData.width, regionData.height, { inversionAttempts: "attemptBoth" });
              if (code && code.data && code.data.trim()) break;
            }
          } catch (regionError) {
            continue;
          }
        }
      }
      
      // Try Browser's BarcodeDetector API as fallback
      if (!code && scanAttempts.current > 20 && 'BarcodeDetector' in window) {
        tryBarcodeDetectorScan();
        return;
      }
      
      if (code && code.data && code.data.trim()) {
        const scannedData = code.data.trim();
        
        // Prevent duplicate scans
        if (lastSuccessfulScan.current === scannedData && (now - lastScanTime.current) < 2000) {
          return;
        }
        
        lastSuccessfulScan.current = scannedData;
        console.log('QR Code detected:', scannedData);
        setDebugInfo(`✅ QR Code found: ${scannedData.substring(0, 30)}...`);
        
        // Stop scanning
        setIsScanning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Call success handler after short delay
        setTimeout(() => {
          if (onScan) onScan(scannedData);
          stopCamera();
          onClose();
        }, 500);
        
        return;
      }
      
      // Update debug info periodically
      if (scanAttempts.current % 10 === 0) {
        const seconds = Math.floor(scanAttempts.current / 10);
        setDebugInfo(`Scanning... ${seconds}s (${scanAttempts.current} attempts) - ${videoWidth}x${videoHeight}`);
      }
      
      // Update debug canvas occasionally
      if (showDebugCanvas && debugCanvasRef.current && scanAttempts.current % 5 === 0) {
        const debugCanvas = debugCanvasRef.current;
        const debugContext = debugCanvas.getContext('2d');
        debugCanvas.width = 200;
        debugCanvas.height = 150;
        debugContext.drawImage(canvas, 0, 0, videoWidth, videoHeight, 0, 0, 200, 150);
        
        // Add scan info overlay
        debugContext.fillStyle = 'red';
        debugContext.font = '10px Arial';
        debugContext.fillText(`${scanAttempts.current}`, 5, 15);
        debugContext.fillText(`${videoWidth}x${videoHeight}`, 5, 30);
      }
      
    } catch (error) {
      console.error('QR scanning error:', error);
      setDebugInfo(`Scan error: ${error.message}`);
    }
  };

  const tryBarcodeDetectorScan = async () => {
    if (!('BarcodeDetector' in window)) return;
    
    try {
      setDebugInfo('Trying BarcodeDetector API...');
      
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const imageBitmap = await createImageBitmap(canvas);
      const barcodes = await barcodeDetector.detect(imageBitmap);
      
      if (barcodes.length > 0) {
        const scannedData = barcodes[0].rawValue.trim();
        console.log('BarcodeDetector found QR:', scannedData);
        setDebugInfo(`✅ BarcodeDetector found: ${scannedData.substring(0, 30)}...`);
        
        if (onScan) onScan(scannedData);
        stopCamera();
        onClose();
      }
    } catch (error) {
      console.log('BarcodeDetector error:', error);
    }
  };

  const handleManualInput = (value) => {
    if (value && value.trim()) {
      setIsScanning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (onScan) onScan(value.trim());
      stopCamera();
      onClose();
    } else {
      setScanError('Please enter a valid Guest ID.');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1002
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        width: '520px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid #E0E0E0',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '500', color: '#333' }}>
            Scan Guest QR Code
          </h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Close />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            border: '3px solid #2196F3',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '420px',
                height: '315px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            
            {/* Debug canvas */}
            {showDebugCanvas && (
              <canvas
                ref={debugCanvasRef}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  border: '2px solid #fff',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              />
            )}
            
            {/* Enhanced scanning overlay */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              right: '30px',
              bottom: '30px',
              border: '4px solid #4CAF50',
              borderRadius: '16px',
              pointerEvents: 'none',
              backgroundColor: 'rgba(76, 175, 80, 0.03)',
              boxShadow: 'inset 0 0 20px rgba(76, 175, 80, 0.1)'
            }}>
              {/* Animated corner indicators */}
              {[
                { top: '-4px', left: '-4px', borderRight: 'transparent', borderBottom: 'transparent' },
                { top: '-4px', right: '-4px', borderLeft: 'transparent', borderBottom: 'transparent' },
                { bottom: '-4px', left: '-4px', borderRight: 'transparent', borderTop: 'transparent' },
                { bottom: '-4px', right: '-4px', borderLeft: 'transparent', borderTop: 'transparent' }
              ].map((corner, index) => (
                <div key={index} style={{
                  position: 'absolute',
                  width: '40px',
                  height: '40px',
                  border: '8px solid #4CAF50',
                  borderRadius: '6px',
                  animation: 'pulse 2s infinite',
                  ...corner
                }} />
              ))}
              
              {/* Center crosshair with animation */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30px',
                height: '30px',
                border: '3px solid #4CAF50',
                borderRadius: '50%',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                animation: 'ping 2s infinite'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#4CAF50',
                  borderRadius: '50%'
                }}></div>
              </div>
            </div>
            
            {/* Status indicator with better styling */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: isScanning 
                ? (debugInfo.includes('✅') ? 'rgba(76, 175, 80, 0.95)' : 'rgba(33, 150, 243, 0.95)')
                : 'rgba(255, 152, 0, 0.95)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              maxWidth: '380px',
              textAlign: 'center',
              wordBreak: 'break-word',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              {debugInfo || (isScanning ? 'Scanning for QR codes...' : 'Initializing camera...')}
            </div>
          </div>
        </div>

        {scanError && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid #ffcdd2'
          }}>
            ⚠️ {scanError}
          </div>
        )}

        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          <strong>Hold the QR code steady within the green frame.</strong>
          <br />
          Ensure the code is well-lit and fills most of the scanning area.
        </div>

        {/* Manual input fallback */}
        <div style={{
          borderTop: '2px solid #E0E0E0',
          paddingTop: '20px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#555'
          }}>
            Or enter Guest ID manually:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter Guest ID"
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '2px solid #E0E0E0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196F3'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualInput(e.target.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                handleManualInput(input.value);
              }}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                background: '#2196F3',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Control buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              stopCamera();
              setTimeout(() => startCamera(), 300);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #2196F3',
              borderRadius: '6px',
              background: '#fff',
              color: '#2196F3',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2196F3';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.color = '#2196F3';
            }}
          >
            <Refresh fontSize="small" />
            Restart Camera
          </button>
          
          <button
            onClick={() => setShowDebugCanvas(!showDebugCanvas)}
            style={{
              padding: '8px 12px',
              border: '1px solid #9C27B0',
              borderRadius: '6px',
              background: showDebugCanvas ? '#9C27B0' : '#fff',
              color: showDebugCanvas ? '#fff' : '#9C27B0',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
          >
            Debug View
          </button>
          
          <button
            onClick={tryBarcodeDetectorScan}
            style={{
              padding: '8px 12px',
              border: '1px solid #FF5722',
              borderRadius: '6px',
              background: '#fff',
              color: '#FF5722',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FF5722';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.color = '#FF5722';
            }}
          >
            Try Alt Method
          </button>
        </div>

        {/* Enhanced troubleshooting */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
          border: '1px solid #e9ecef'
        }}>
          <strong>Troubleshooting Tips:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: '1.4' }}>
            <li>Ensure QR code is clean and not damaged</li>
            <li>Hold device steady and maintain good lighting</li>
            <li>Try different angles and distances</li>
            <li>Use "Restart Camera" if scanning stops working</li>
            <li>Click "Try Alt Method" to use browser's built-in scanner</li>
            <li>Use manual input as last resort</li>
          </ul>
          
          <div style={{ marginTop: '12px', fontSize: '11px' }}>
            <strong>Detection Status:</strong>
            <br />
            • jsQR Library: {typeof jsQR === 'function' ? '✅ Ready' : '❌ Not loaded'}
            <br />
            • BarcodeDetector API: {'BarcodeDetector' in window ? '✅ Available' : '❌ Not supported'}
            <br />
            • Scan attempts: {scanAttempts.current}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(0.95);
            }
          }
          
          @keyframes ping {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            75%, 100% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, selectedRoom, selectedDates, isMultiDay }) => {
  const [formData, setFormData] = useState({
    guestId: '',
    guestDetails: null,
    selectedRooms: [],
    preferredRoomType: '', // Add preferred room type field
    checkIn: '',
    checkOut: '',
    adults: 2,
    kids: 0,
    mealPlan: '',
    specialRequests: '',
    amenities: '',
    additionalNotes: '',
    status: 'CONFIRMED'
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [guestError, setGuestError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Initialize form with selected room from calendar
  useEffect(() => {
    if (selectedRoom) {
      setFormData(prev => ({
        ...prev,
        selectedRooms: [selectedRoom],
        preferredRoomType: selectedRoom.roomType || '' // Set preferred room type from selected room
      }));
    }
  }, [selectedRoom]);

  // Set dates from selection
  useEffect(() => {
    if (isMultiDay && selectedDates && selectedDates.length > 0) {
      const sortedDates = [...selectedDates].sort((a, b) => a - b);
      const startDate = sortedDates[0];
      const endDate = new Date(sortedDates[sortedDates.length - 1]);
      endDate.setDate(endDate.getDate() + 1);
      
      setFormData(prev => ({
        ...prev,
        checkIn: startDate.toISOString().split('T')[0],
        checkOut: endDate.toISOString().split('T')[0]
      }));
    } else if (selectedDates && selectedDates.length === 1) {
      const checkInDate = selectedDates[0];
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      
      setFormData(prev => ({
        ...prev,
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0]
      }));
    }
  }, [isMultiDay, selectedDates]);

  // Fetch available rooms when dates change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && !selectedRoom) {
      fetchAvailableRooms();
    }
  }, [formData.checkIn, formData.checkOut]);

  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const allRooms = await getAllRooms();
      let available = allRooms.filter(room => 
        room.status?.toLowerCase() === 'available'
      );
      
      // Filter by preferred room type if selected
      if (formData.preferredRoomType) {
        available = available.filter(room => 
          room.roomType?.toLowerCase() === formData.preferredRoomType.toLowerCase()
        );
      }
      
      setAvailableRooms(available);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Re-fetch rooms when preferred room type changes
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && !selectedRoom) {
      fetchAvailableRooms();
    }
  }, [formData.checkIn, formData.checkOut, formData.preferredRoomType]);

  const handleRoomSelection = (room, isSelected) => {
    setFormData(prev => ({
      ...prev,
      selectedRooms: isSelected 
        ? [...prev.selectedRooms, room]
        : prev.selectedRooms.filter(r => r.id !== room.id)
    }));
  };

  const handleQRScan = async (scannedData) => {
    setLoadingGuest(true);
    setGuestError(null);
    
    try {
      // Extract guest ID from QR data (assuming QR contains guest ID)
      const guestId = scannedData;
      
      // Fetch guest details
      const guestDetails = await getGuestDetails(guestId);
      
      setFormData(prev => ({
        ...prev,
        guestId: guestId,
        guestDetails: guestDetails
      }));
      
      setShowQRScanner(false);
    } catch (error) {
      console.error('Error processing QR scan:', error);
      setGuestError(`Failed to load guest details: ${error.message}`);
    } finally {
      setLoadingGuest(false);
    }
  };

  const handleQRError = (error) => {
    setGuestError(error);
    setShowQRScanner(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);

    // Clear previous errors
    setGuestError(null);
    setSubmitError(null);
    
    // Enhanced validation
    if (!formData.guestDetails) {
      setGuestError('Please scan a guest QR code first');
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      setGuestError('Please select check-in and check-out dates');
      return;
    }

    if (!formData.selectedRooms || formData.selectedRooms.length === 0) {
      setGuestError('Please select at least one room');
      return;
    }

    // Validate dates
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    
    if (checkOutDate <= checkInDate) {
      setGuestError('Check-out date must be after check-in date');
      return;
    }

    // Validate guest capacity
    const totalCapacity = formData.selectedRooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const totalGuests = formData.adults + formData.kids;
    
    if (totalGuests > totalCapacity) {
      setGuestError(`Selected rooms can accommodate maximum ${totalCapacity} guests, but you have ${totalGuests} guests`);
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Creating reservation...');
      
      // Prepare reservation data - match backend DTO expectations
      const reservationRequestData = {
        guestId: formData.guestId.toString(), // Keep as string as per DTO
        roomIds: formData.selectedRooms.map(room => parseInt(room.id)), // Set<Long> as per DTO
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        status: formData.status || 'CONFIRMED'
      };

      console.log('Prepared reservation data:', reservationRequestData);
      
      // Create reservation
      const reservationResponse = await createReservation(reservationRequestData);
      console.log('Reservation created successfully:', reservationResponse);

      // Check if we got a valid reservation ID
      let reservationId = null;
      if (reservationResponse.reservationId) {
        reservationId = reservationResponse.reservationId;
      } else if (reservationResponse.id) {
        reservationId = reservationResponse.id;
      } else {
        throw new Error('No reservation ID returned from server');
      }

      console.log('Using reservation ID:', reservationId);

      // Create reservation details for each room
      for (const room of formData.selectedRooms) {
        const detailsData = {
          reservationId: reservationId,
          guestId: formData.guestId.toString(),
          roomId: parseInt(room.id),
          adults: formData.adults || 2,
          kids: formData.kids || 0,
          roomType: room.roomType || '',
          mealPlan: formData.mealPlan || '',
          specialRequests: formData.specialRequests || '',
          amenities: formData.amenities || '',
          additionalNotes: formData.additionalNotes || ''
        };

        console.log('Creating reservation details for room:', room.roomNumber, detailsData);
        await createReservationDetails(reservationId, detailsData);
      }

      // Success!
      console.log('Booking created successfully!');
      
      const roomNumbers = formData.selectedRooms.map(room => room.roomNumber).join(', ');
      const guestName = formData.guestDetails.name || 
                       `${formData.guestDetails.firstName} ${formData.guestDetails.lastName}`;
      
      alert(`Booking created successfully!\nReservation ID: ${reservationId}\nRooms: ${roomNumbers}\nGuest: ${guestName}\nDates: ${formData.checkIn} to ${formData.checkOut}`);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Booking creation error:', error);
      setSubmitError(`Failed to create booking: ${error.message}`);
      
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        formData
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      guestId: '',
      guestDetails: null,
      selectedRooms: [],
      preferredRoomType: '',
      checkIn: '',
      checkOut: '',
      adults: 2,
      kids: 0,
      mealPlan: '',
      specialRequests: '',
      amenities: '',
      additionalNotes: '',
      status: 'CONFIRMED'
    });
    setGuestError(null);
    setSubmitError(null);
    setAvailableRooms([]);
  };

  if (!isOpen) return null;

  const formatDateRange = () => {
    if (!selectedDates || selectedDates.length === 0) return '';
    if (selectedDates.length === 1) return selectedDates[0].toDateString();
    
    const sortedDates = [...selectedDates].sort((a, b) => a - b);
    return `${sortedDates[0].toDateString()} - ${sortedDates[sortedDates.length - 1].toDateString()}`;
  };

  const getTotalCapacity = () => {
    return formData.selectedRooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
  };

  const getTotalPrice = () => {
    const nights = formData.checkIn && formData.checkOut 
      ? Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))
      : 1;
    return formData.selectedRooms.reduce((sum, room) => sum + ((room.pricePerNight || 0) * nights), 0);
  };

  // Get unique room types for the selector
  const getUniqueRoomTypes = () => {
    try {
      const allRooms = JSON.parse(localStorage.getItem('allRooms') || '[]');
      return [...new Set(allRooms.map(room => room.roomType).filter(type => type))];
    } catch {
      // Fallback to common room types if localStorage is not available
      return ['Standard', 'Deluxe', 'Suite', 'Presidential Suite', 'Family Room', 'Twin Room'];
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '28px',
          width: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            borderBottom: '2px solid #E0E0E0',
            paddingBottom: '20px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '500', color: '#333' }}>
                {isMultiDay ? 'Add Multi-Day Booking' : 'Add Booking'}
              </h2>
              {selectedDates && selectedDates.length > 0 && (
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Selected dates: {formatDateRange()} ({selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''})
                </p>
              )}
              {formData.selectedRooms.length > 0 && (
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#2196F3', fontWeight: '500' }}>
                  {formData.selectedRooms.length} room{formData.selectedRooms.length !== 1 ? 's' : ''} selected 
                  • Capacity: {getTotalCapacity()} guests
                  • Total: ${getTotalPrice().toFixed(2)}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Close />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Guest QR Scanner Section */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                  Guest Information *
                </label>
                
                {!formData.guestDetails ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      disabled={loadingGuest}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px dashed #2196F3',
                        borderRadius: '12px',
                        background: loadingGuest ? '#f5f5f5' : '#f8f9ff',
                        color: loadingGuest ? '#999' : '#2196F3',
                        cursor: loadingGuest ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingGuest) {
                          e.target.style.backgroundColor = '#e3f2fd';
                          e.target.style.borderColor = '#1976D2';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loadingGuest) {
                          e.target.style.backgroundColor = '#f8f9ff';
                          e.target.style.borderColor = '#2196F3';
                        }
                      }}
                    >
                      {loadingGuest ? (
                        <>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #2196F3',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Loading Guest Details...
                        </>
                      ) : (
                        <>
                          <QrCodeScanner style={{ fontSize: '24px' }} />
                          Scan Guest QR Code
                        </>
                      )}
                    </button>
                    
                    {guestError && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '8px',
                        fontSize: '14px',
                        border: '1px solid #ffcdd2'
                      }}>
                        ⚠️ {guestError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    border: '2px solid #4CAF50',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#f1f8e9'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Person style={{ color: '#4CAF50', fontSize: '24px' }} />
                        <span style={{ fontWeight: '600', color: '#2e7d32', fontSize: '16px' }}>Guest Selected</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            guestId: '',
                            guestDetails: null
                          }));
                          setGuestError(null);
                        }}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #4CAF50',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#4CAF50',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#4CAF50';
                          e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.color = '#4CAF50';
                        }}
                      >
                        Change Guest
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', color: '#2e7d32', lineHeight: '1.5' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Name:</strong> {formData.guestDetails.name || `${formData.guestDetails.firstName} ${formData.guestDetails.lastName}`}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>ID:</strong> {formData.guestId}
                      </div>
                      {formData.guestDetails.email && (
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Email:</strong> {formData.guestDetails.email}
                        </div>
                      )}
                      {formData.guestDetails.phone && (
                        <div>
                          <strong>Phone:</strong> {formData.guestDetails.phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Room Type and Selection Section */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                  Room Selection *
                </label>
                
                {/* Room Type Selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Preferred Room Type
                  </label>
                  <select
                    value={formData.preferredRoomType}
                    onChange={(e) => setFormData({...formData, preferredRoomType: e.target.value})}
                    disabled={!!selectedRoom} // Disable if room is pre-selected from calendar
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: selectedRoom ? '#f5f5f5' : '#fff',
                      color: selectedRoom ? '#666' : '#333',
                      cursor: selectedRoom ? 'not-allowed' : 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => !selectedRoom && (e.target.style.borderColor = '#2196F3')}
                    onBlur={(e) => !selectedRoom && (e.target.style.borderColor = '#E0E0E0')}
                  >
                    <option value="">All Room Types</option>
                    {getUniqueRoomTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {selectedRoom && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                      Room type is set from your calendar selection
                    </p>
                  )}
                </div>
                
                {selectedRoom ? (
                  <div style={{
                    border: '2px solid #2196F3',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#f8f9ff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#2196F3', fontSize: '16px' }}>
                        Pre-selected from Calendar
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedRooms: [],
                            preferredRoomType: '' // Reset room type when changing selection
                          }));
                          fetchAvailableRooms();
                        }}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #2196F3',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#2196F3',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Change Selection
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#fff',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50'
                      }}></div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>
                          Room {selectedRoom.roomNumber}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {selectedRoom.roomType} • {selectedRoom.capacity} guests • ${selectedRoom.pricePerNight}/night • Floor {selectedRoom.floor}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {loadingRooms ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #E0E0E0',
                          borderTop: '2px solid #2196F3',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 8px'
                        }}></div>
                        Loading available rooms...
                      </div>
                    ) : availableRooms.length > 0 ? (
                      <div style={{
                        border: '2px solid #E0E0E0',
                        borderRadius: '12px',
                        padding: '16px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                          {formData.preferredRoomType 
                            ? `Available ${formData.preferredRoomType} rooms for ${formData.checkIn} to ${formData.checkOut}:`
                            : `Available rooms for ${formData.checkIn} to ${formData.checkOut}:`
                          }
                          <span style={{ color: '#2196F3', fontWeight: '500', marginLeft: '8px' }}>
                            ({availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} found)
                          </span>
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {availableRooms.map(room => {
                            const isSelected = formData.selectedRooms.some(r => r.id === room.id);
                            return (
                              <div
                                key={room.id}
                                onClick={() => handleRoomSelection(room, !isSelected)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px',
                                  border: `2px solid ${isSelected ? '#2196F3' : '#E0E0E0'}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? '#f8f9ff' : '#fff',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#2196F3';
                                    e.target.style.backgroundColor = '#f8f9ff';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#E0E0E0';
                                    e.target.style.backgroundColor = '#fff';
                                  }
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // Controlled by parent click
                                  style={{ margin: 0 }}
                                />
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: '#4CAF50'
                                }}></div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                                    Room {room.roomNumber}
                                  </div>
                                  <div style={{ fontSize: '14px', color: '#666' }}>
                                    {room.roomType} • {room.capacity} guests • ${room.pricePerNight}/night • Floor {room.floor}
                                  </div>
                                </div>
                                <div style={{ fontSize: '14px', color: '#2196F3', fontWeight: '500' }}>
                                  ${room.pricePerNight}/night
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        border: '2px dashed #E0E0E0',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        color: '#666'
                      }}>
                        {formData.checkIn && formData.checkOut 
                          ? (formData.preferredRoomType 
                              ? `No ${formData.preferredRoomType} rooms available for selected dates. Try selecting a different room type.`
                              : 'No rooms available for selected dates'
                            )
                          : 'Please select check-in and check-out dates to view available rooms'
                        }
                        {formData.preferredRoomType && formData.checkIn && formData.checkOut && (
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, preferredRoomType: ''})}
                            style={{
                              marginTop: '12px',
                              padding: '8px 16px',
                              border: '1px solid #2196F3',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#2196F3',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            View All Room Types
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dates and Guest Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Check-in *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Check-out *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Adults
                  </label>
                  <select
                    value={formData.adults}
                    onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: '#fff',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Kids
                  </label>
                  <select
                    value={formData.kids}
                    onChange={(e) => setFormData({...formData, kids: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: '#fff',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  >
                    {[0,1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: '#fff',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Meal Plan and Special Requests */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Meal Plan
                  </label>
                  <select
                    value={formData.mealPlan}
                    onChange={(e) => setFormData({...formData, mealPlan: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: '#fff',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  >
                    <option value="">Select Meal Plan</option>
                    <option value="Room Only">Room Only</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Half Board">Half Board</option>
                    <option value="Full Board">Full Board</option>
                    <option value="All Inclusive">All Inclusive</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                    Amenities
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                    placeholder="e.g., WiFi, Pool Access, Spa"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  />
                </div>
              </div>

              {/* Special Requests and Additional Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  rows="2"
                  placeholder="e.g., Late check-in, Ground floor room, Extra pillows"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                  rows="3"
                  placeholder="Any other important information about this reservation"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>
            </div>

            {/* Error displays */}
            {(guestError || submitError) && (
              <div style={{
                padding: '16px',
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: '8px',
                fontSize: '14px',
                border: '1px solid #ffcdd2',
                lineHeight: '1.5'
              }}>
                <strong>⚠️ Error:</strong>
                <br />
                {guestError || submitError}
              </div>
            )}

            {/* Debug information in development */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#666',
                border: '1px solid #e9ecef'
              }}>
                <strong>Debug Info:</strong>
                <br />
                Guest ID: {formData.guestId || 'Not set'}
                <br />
                Preferred Room Type: {formData.preferredRoomType || 'Any'}
                <br />
                Selected Rooms: {formData.selectedRooms.map(r => `${r.roomNumber} (${r.roomType})`).join(', ') || 'None'}
                <br />
                Room IDs: {formData.selectedRooms.map(r => r.id).join(', ') || 'None'}
                <br />
                Check-in: {formData.checkIn || 'Not set'}
                <br />
                Check-out: {formData.checkOut || 'Not set'}
                <br />
                Total Guests: {formData.adults + formData.kids}
                <br />
                Total Capacity: {getTotalCapacity()}
                <br />
                Available Rooms Count: {availableRooms.length}
                <br />
                API Base URL: {API_BASE_URL}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        onError={handleQRError}
      />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

const ReceptionistDashboard = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);

  // Column resizing and zoom states
  const [roomColumnWidth, setRoomColumnWidth] = useState(280);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [expandedRoomTypes, setExpandedRoomTypes] = useState({});

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching rooms from API...');
      const roomsData = await getAllRooms();
      
      if (!roomsData || roomsData.length === 0) {
        console.warn('No rooms returned from API');
        setRooms([]);
        setExpandedRoomTypes({});
        localStorage.removeItem('allRooms');
        return;
      }
      
      console.log('Successfully fetched rooms:', roomsData.length);
      setRooms(roomsData);
      
      // Store rooms in localStorage for room type selector
      localStorage.setItem('allRooms', JSON.stringify(roomsData));
      
      const roomTypes = [...new Set(roomsData.map(room => room.roomType).filter(type => type))];
      const expanded = {};
      roomTypes.forEach(type => {
        expanded[type] = true;
      });
      setExpandedRoomTypes(expanded);
      
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(`Failed to load rooms: ${err.message}. Please check your API connection.`);
      setRooms([]);
      setExpandedRoomTypes({});
      localStorage.removeItem('allRooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedYear, selectedMonth]);

  // Optimized column resizing handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = roomColumnWidth;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
      setRoomColumnWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [roomColumnWidth]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(200, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(50, prev - 25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(100);
  }, []);

  const years = [2021, 2022, 2023, 2024, 2025,2026,2027,2028,2029];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCurrentMonthDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    return Array.from({length: daysInMonth}, (_, i) => i + 1);
  };

  const getDateInfo = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, dayName };
  };

  const isCurrentDate = (day) => {
    const currentDate = new Date();
    return day === currentDate.getDate() && 
           selectedMonth === currentDate.getMonth() && 
           selectedYear === currentDate.getFullYear();
  };

  const getRoomStatusColor = (status) => {
    // Add proper null/undefined check
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    switch(normalizedStatus) {
      case 'available':
      case 'vacant': 
        return '#4CAF50';
      case 'occupied': 
      case 'booked':
        return '#2196F3';
      case 'checkout': 
      case 'check-out':
        return '#FF9800';
      case 'checkin': 
      case 'check-in':
        return '#9C27B0';
      case 'maintenance': 
      case 'out-of-order':
        return '#F44336';
      case 'dirty': 
      case 'cleaning':
        return '#FFC107';
      default: 
        return '#E0E0E0';
    }
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  const handleAddBooking = (room = null, dates = []) => {
    setSelectedRoom(room);
    setSelectedDates(Array.isArray(dates) ? dates : []);
    setIsMultiDay(Array.isArray(dates) && dates.length > 1);
    setShowBookingModal(true);
  };

  const handleCellClick = useCallback((room, day) => {
    // Add null check for room.status
    if (!room.status || room.status.toLowerCase() !== 'available') return;

    const clickedDate = new Date(selectedYear, selectedMonth, day);
    
    if (!isSelecting) {
      setSelectionStart({ room, day });
      setSelectedDates([clickedDate]);
      setSelectedRoom(room);
      setIsSelecting(true);
      setIsMultiDay(false);
    }
  }, [selectedYear, selectedMonth, isSelecting]);

  const handleCellMouseEnter = useCallback((room, day) => {
    if (!isSelecting || !selectionStart || room.id !== selectionStart.room.id) return;
    // Add null check for room.status
    if (!room.status || room.status.toLowerCase() !== 'available') return;

    const startDay = Math.min(selectionStart.day, day);
    const endDay = Math.max(selectionStart.day, day);
    
    const dates = [];
    for (let d = startDay; d <= endDay; d++) {
      dates.push(new Date(selectedYear, selectedMonth, d));
    }
    
    setSelectedDates(dates);
    setIsMultiDay(dates.length > 1);
  }, [isSelecting, selectionStart, selectedYear, selectedMonth]);

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectedDates.length > 0) {
      if (selectedDates.length > 1) {
        setTimeout(() => handleAddBooking(selectedRoom, selectedDates), 100);
      }
      setIsSelecting(false);
      setSelectionStart(null);
    }
  }, [isSelecting, selectedDates, selectedRoom]);

  const handleClearSelection = useCallback(() => {
    setSelectedDates([]);
    setSelectedRoom(null);
    setIsSelecting(false);
    setSelectionStart(null);
    setIsMultiDay(false);
  }, []);

  const isDateSelected = useCallback((room, day) => {
    if (!selectedDates.length || !selectedRoom || selectedRoom.id !== room.id) return false;
    return selectedDates.some(date => 
      date.getDate() === day && 
      date.getMonth() === selectedMonth && 
      date.getFullYear() === selectedYear
    );
  }, [selectedDates, selectedRoom, selectedMonth, selectedYear]);

  const toggleRoomType = useCallback((roomType) => {
    setExpandedRoomTypes(prev => ({
      ...prev,
      [roomType]: !prev[roomType]
    }));
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = (room.roomNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (room.roomType?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFloor = !selectedFloor || room.floor?.toString() === selectedFloor;
    const matchesType = !selectedRoomType || room.roomType?.toLowerCase().includes(selectedRoomType.toLowerCase());
    // Add null check for room.status
    const matchesStatus = !selectedStatus || (room.status?.toLowerCase() || 'unknown') === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesFloor && matchesType && matchesStatus;
  });

  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const roomType = room.roomType || 'Unknown';
    if (!acc[roomType]) {
      acc[roomType] = [];
    }
    acc[roomType].push(room);
    return acc;
  }, {});

  const uniqueFloors = [...new Set(rooms.map(room => room.floor).filter(floor => floor != null))].sort((a, b) => a - b);
  const uniqueRoomTypes = [...new Set(rooms.map(room => room.roomType).filter(type => type != null))];
  // Add safe filtering for room statuses
  const uniqueStatuses = [...new Set(rooms.map(room => room.status?.toLowerCase()).filter(status => status != null))];

  const commonStatuses = ['available', 'occupied', 'checkout', 'checkin', 'maintenance', 'dirty'];
  const roomStatuses = [...new Set([...uniqueStatuses, ...commonStatuses])];

  const dayColumnWidth = Math.max(50, 70 * (zoomLevel / 100));

  const styles = {
    container: {
      backgroundColor: '#FAFAFA',
      minHeight: '100vh',
      fontFamily: 'Roboto, Arial, sans-serif',
      userSelect: isResizing ? 'none' : 'auto'
    },
    header: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #E0E0E0',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: '300',
      color: '#333',
      margin: 0
    },
    breadcrumb: {
      fontSize: '14px',
      color: '#666',
      marginLeft: '16px'
    },
    addButton: {
      backgroundColor: '#2196F3',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s'
    },
    controlsContainer: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #E0E0E0',
      padding: '16px 24px'
    },
    yearTabs: {
      display: 'flex',
      gap: '24px',
      marginBottom: '20px',
      borderBottom: '1px solid #E0E0E0',
      paddingBottom: '12px'
    },
    yearTab: {
      background: 'none',
      border: 'none',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#666',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    activeYear: {
      color: '#2196F3',
      backgroundColor: '#E3F2FD',
      fontWeight: '500'
    },
    monthControlsWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '20px',
      flexWrap: 'wrap'
    },
    monthTabs: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '16px'
    },
    monthTab: {
      background: 'none',
      border: 'none',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#666',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    activeMonth: {
      color: '#2196F3',
      backgroundColor: '#E3F2FD',
      fontWeight: '500'
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap'
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    searchInput: {
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      padding: '8px 12px 8px 40px',
      fontSize: '14px',
      outline: 'none',
      width: '200px'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      color: '#666',
      fontSize: '16px'
    },
    select: {
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '14px',
      outline: 'none',
      background: '#fff',
      minWidth: '120px'
    },
    navigationControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    navButton: {
      border: '1px solid #E0E0E0',
      background: '#fff',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s'
    },
    zoomControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      backgroundColor: '#fff',
      overflow: 'hidden'
    },
    zoomButton: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s'
    },
    zoomLevel: {
      padding: '8px 12px',
      fontSize: '12px',
      color: '#666',
      cursor: 'pointer',
      minWidth: '50px',
      textAlign: 'center',
      borderLeft: '1px solid #E0E0E0',
      borderRight: '1px solid #E0E0E0',
      backgroundColor: '#fff'
    },
    selectionControls: {
      backgroundColor: '#E3F2FD',
      border: '1px solid #2196F3',
      borderRadius: '4px',
      padding: '12px 16px',
      marginTop: '16px'
    },
    clearSelectionButton: {
      padding: '6px 12px',
      border: '1px solid #2196F3',
      borderRadius: '4px',
      background: '#fff',
      color: '#2196F3',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s'
    },
    bookSelectedButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      background: '#2196F3',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s'
    },
    calendarWrapper: {
      margin: '24px',
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      overflow: 'hidden',
      backgroundColor: '#fff'
    },
    calendarContainer: {
      overflow: 'auto',
      maxHeight: 'calc(100vh - 300px)',
      transform: `scale(${zoomLevel / 100})`,
      transformOrigin: 'top left'
    },
    calendarHeader: {
      display: 'flex',
      borderBottom: '2px solid #E0E0E0',
      backgroundColor: '#F8F9FA',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    roomsColumn: {
      width: `${roomColumnWidth}px`,
      minWidth: `${roomColumnWidth}px`,
      padding: '12px 16px',
      fontWeight: '600',
      fontSize: '14px',
      borderRight: '2px solid #E0E0E0',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    },
    resizeHandle: {
      position: 'absolute',
      right: '-2px',
      top: 0,
      bottom: 0,
      width: '4px',
      cursor: 'col-resize',
      backgroundColor: isResizing ? 'rgba(33, 150, 243, 0.3)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 11,
      transition: 'background-color 0.2s'
    },
    dayColumn: {
      minWidth: `${dayColumnWidth}px`,
      width: `${dayColumnWidth}px`,
      padding: '8px 4px',
      textAlign: 'center',
      borderRight: '1px solid #E0E0E0',
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    currentDay: {
      backgroundColor: '#E3F2FD',
      color: '#1976D2',
      fontWeight: 'bold'
    },
    roomTypeRow: {
      display: 'flex',
      borderBottom: '1px solid #E0E0E0',
      backgroundColor: '#F5F5F5'
    },
    roomTypeHeader: {
      width: `${roomColumnWidth}px`,
      minWidth: `${roomColumnWidth}px`,
      padding: '12px 16px',
      fontWeight: '500',
      fontSize: '14px',
      borderRight: '2px solid #E0E0E0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      backgroundColor: '#F5F5F5',
      transition: 'background-color 0.2s'
    },
    roomRow: {
      display: 'flex',
      borderBottom: '1px solid #E0E0E0',
      backgroundColor: '#fff',
      transition: 'background-color 0.2s'
    },
    roomCell: {
      width: `${roomColumnWidth}px`,
      minWidth: `${roomColumnWidth}px`,
      padding: '8px 16px',
      fontSize: '14px',
      borderRight: '2px solid #E0E0E0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#fff'
    },
    statusIndicator: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      flexShrink: 0
    },
    dayCell: {
      minWidth: `${dayColumnWidth}px`,
      width: `${dayColumnWidth}px`,
      minHeight: '50px',
      borderRight: '1px solid #E0E0E0',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    },
    todayButton: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      padding: '8px 12px',
      background: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.container} onMouseUp={handleMouseUp}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={styles.title}>Front Desk</h1>
          <span style={styles.breadcrumb}>Home / Front Desk</span>
        </div>
        <button 
          style={styles.addButton} 
          onClick={() => handleAddBooking()}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
        >
          <Add />
          Add Booking
        </button>
      </div>

      {/* Controls */}
      <div style={styles.controlsContainer}>
        {/* Year Tabs */}
        <div style={styles.yearTabs}>
          {years.map(year => (
            <button
              key={year}
              style={{
                ...styles.yearTab,
                ...(year === selectedYear ? styles.activeYear : {})
              }}
              onClick={() => setSelectedYear(year)}
              onMouseEnter={(e) => {
                if (year !== selectedYear) {
                  e.target.style.backgroundColor = '#F5F5F5';
                }
              }}
              onMouseLeave={(e) => {
                if (year !== selectedYear) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Month Controls */}
        <div style={styles.monthControlsWrapper}>
          <div>
            <div style={styles.monthTabs}>
              {months.map((monthName, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.monthTab,
                    ...(index === selectedMonth ? styles.activeMonth : {})
                  }}
                  onClick={() => setSelectedMonth(index)}
                  onMouseEnter={(e) => {
                    if (index !== selectedMonth) {
                      e.target.style.backgroundColor = '#F5F5F5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== selectedMonth) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {monthName}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.controls}>
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search rooms..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select style={styles.select} value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
              <option value="">All Floors</option>
              {uniqueFloors.map(floor => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>

            <select style={styles.select} value={selectedRoomType} onChange={(e) => setSelectedRoomType(e.target.value)}>
              <option value="">All Room Types</option>
              {uniqueRoomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select style={styles.select} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {roomStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>

            <div style={styles.navigationControls}>
              <button 
                style={styles.navButton} 
                onClick={() => navigateMonth('prev')}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                <ChevronLeft />
              </button>
              <button 
                style={styles.navButton} 
                onClick={() => navigateMonth('next')}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                <ChevronRight />
              </button>
            </div>

            <div style={styles.zoomControls}>
              <button 
                style={styles.zoomButton} 
                onClick={handleZoomOut} 
                title="Zoom Out"
                disabled={zoomLevel <= 50}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ZoomOut />
              </button>
              <div 
                style={styles.zoomLevel} 
                onClick={resetZoom} 
                title="Click to reset zoom"
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                {zoomLevel}%
              </div>
              <button 
                style={styles.zoomButton} 
                onClick={handleZoomIn} 
                title="Zoom In"
                disabled={zoomLevel >= 200}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ZoomIn />
              </button>
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        {(isSelecting || selectedDates.length > 0) && (
          <div style={styles.selectionControls}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', color: '#1976D2', fontWeight: '500' }}>
                {isSelecting 
                  ? `Selecting dates... (${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''} selected)`
                  : `${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''} selected for Room ${selectedRoom?.roomNumber}`
                }
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={styles.clearSelectionButton}
                  onClick={handleClearSelection}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2196F3';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.color = '#2196F3';
                  }}
                >
                  Clear Selection
                </button>
                {!isSelecting && selectedDates.length > 0 && (
                  <button
                    style={styles.bookSelectedButton}
                    onClick={() => handleAddBooking(selectedRoom, selectedDates)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
                  >
                    Book Selected Dates
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E0E0E0',
            borderTop: '4px solid #2196F3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Loading rooms...
        </div>
      )}

      {!loading && (
        <div style={styles.calendarWrapper}>
          <div ref={containerRef} style={styles.calendarContainer}>
            {/* Calendar Header */}
            <div style={styles.calendarHeader}>
              <div style={styles.roomsColumn}>
                <span>Rooms</span>
                <div
                  style={styles.resizeHandle}
                  onMouseDown={handleMouseDown}
                  title="Drag to resize column"
                  onMouseEnter={(e) => {
                    if (!isResizing) {
                      e.target.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isResizing) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <DragIndicator style={{ 
                    fontSize: '14px', 
                    color: isResizing ? '#2196F3' : '#999',
                    transition: 'color 0.2s'
                  }} />
                </div>
              </div>
              {getCurrentMonthDays().map(day => {
                const { dayName } = getDateInfo(day);
                const isCurrent = isCurrentDate(day);
                return (
                  <div
                    key={day}
                    style={{
                      ...styles.dayColumn,
                      ...(isCurrent ? styles.currentDay : {})
                    }}
                  >
                    <div style={{ fontSize: '10px' }}>{dayName}</div>
                    <div style={{ 
                      fontWeight: isCurrent ? 'bold' : 'normal',
                      fontSize: '12px'
                    }}>{day}</div>
                  </div>
                );
              })}
            </div>

            {/* Room Types and Rooms */}
            {Object.entries(groupedRooms).map(([roomType, roomsOfType]) => (
              <div key={roomType}>
                {/* Room Type Header */}
                <div style={styles.roomTypeRow}>
                  <div 
                    style={styles.roomTypeHeader}
                    onClick={() => toggleRoomType(roomType)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#EEEEEE'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                  >
                    <ExpandMore 
                      style={{ 
                        transform: expandedRoomTypes[roomType] ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s',
                        fontSize: '20px'
                      }} 
                    />
                    {roomType} ({roomsOfType.length})
                  </div>
                  {getCurrentMonthDays().map(day => (
                    <div key={day} style={styles.dayCell}></div>
                  ))}
                </div>

                {/* Individual Rooms */}
                {expandedRoomTypes[roomType] && roomsOfType.map(room => (
                  <div 
                    key={room.id} 
                    style={styles.roomRow}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <div style={styles.roomCell}>
                      <div
                        style={{
                          ...styles.statusIndicator,
                          backgroundColor: getRoomStatusColor(room.status)
                        }}
                      ></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          Room {room.roomNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {room.capacity} guests • ${room.pricePerNight}/night
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Floor {room.floor} • {room.status || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    {getCurrentMonthDays().map(day => {
                      const isSelected = isDateSelected(room, day);
                      // Add safe check for room.status
                      const isAvailable = room.status?.toLowerCase() === 'available';
                      
                      return (
                        <div 
                          key={day} 
                          style={{
                            ...styles.dayCell,
                            backgroundColor: isSelected 
                              ? '#BBDEFB'
                              : isAvailable 
                                ? (day % 7 === 0 || (day + 6) % 7 === 0 ? '#FAFAFA' : '#fff')
                                : '#F8F8F8',
                            cursor: isAvailable ? 'crosshair' : 'not-allowed',
                            border: isSelected ? '2px solid #2196F3' : '1px solid #E0E0E0',
                            boxSizing: 'border-box'
                          }}
                          onClick={() => handleCellClick(room, day)}
                          onMouseEnter={() => {
                            if (isAvailable) handleCellMouseEnter(room, day);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {/* Only show status indicators for non-available rooms */}
                          {!isAvailable && (
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              left: '2px',
                              right: '2px',
                              bottom: '2px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '500',
                              backgroundColor: getRoomStatusColor(room.status)
                            }}>
                              {/* Add safe checks for room.status */}
                              {room.status?.toLowerCase() === 'occupied' && 'Booked'}
                              {room.status?.toLowerCase() === 'checkout' && 'C/O'}
                              {room.status?.toLowerCase() === 'checkin' && 'C/I'}
                              {room.status?.toLowerCase() === 'maintenance' && 'Maint'}
                              {room.status?.toLowerCase() === 'dirty' && 
                                <span style={{ color: '#333' }}>Dirty</span>
                              }
                              {/* Show 'N/A' for unknown status */}
                              {!room.status && <span style={{ color: '#333' }}>N/A</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}

            {Object.keys(groupedRooms).length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666',
                backgroundColor: '#fff'
              }}>
                {rooms.length === 0 ? 'No rooms available. Please check your API connection.' : 'No rooms found matching your filters.'}
                {rooms.length === 0 && (
                  <button
                    onClick={fetchRooms}
                    style={{
                      marginTop: '16px',
                      padding: '8px 16px',
                      backgroundColor: '#2196F3',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{
            backgroundColor: '#F8F9FA',
            padding: '16px',
            borderTop: '1px solid #E0E0E0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500' }}>Room Status Legend</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {[
                { status: 'available', label: 'Available', color: '#4CAF50' },
                { status: 'occupied', label: 'Occupied', color: '#2196F3' },
                { status: 'checkout', label: 'Check Out', color: '#FF9800' },
                { status: 'checkin', label: 'Check In', color: '#9C27B0' },
                { status: 'maintenance', label: 'Maintenance', color: '#F44336' },
                { status: 'dirty', label: 'Dirty', color: '#FFC107' }
              ].map(({ status, label, color }) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#666' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Today Button */}
      <button 
        style={styles.todayButton} 
        onClick={goToToday}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#F5F5F5';
          e.target.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#fff';
          e.target.style.transform = 'scale(1)';
        }}
      >
        <Today />
        Today
      </button>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          handleClearSelection();
        }}
        selectedRoom={selectedRoom}
        selectedDates={selectedDates}
        isMultiDay={isMultiDay}
      />

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '24px',
          backgroundColor: '#f44336',
          color: '#fff',
          padding: '16px 20px',
          borderRadius: '4px',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ flex: 1 }}>{error}</div>
                   <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes scanLine {
            0% {
              top: 0;
              opacity: 1;
            }
            50% {
              top: calc(100% - 2px);
              opacity: 0.8;
            }
            100% {
              top: 0;
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReceptionistDashboard;