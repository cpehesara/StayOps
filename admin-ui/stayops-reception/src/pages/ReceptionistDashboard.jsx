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

// QR Scanner Component
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
            
            intervalRef.current = setInterval(scanQRCode, 100);
            
            video.removeEventListener('canplay', handleVideoReady);
            video.removeEventListener('loadedmetadata', handleVideoReady);
            video.removeEventListener('playing', handleVideoReady);
          }
        };
        
        video.addEventListener('canplay', handleVideoReady);
        video.addEventListener('loadedmetadata', handleVideoReady);
        video.addEventListener('playing', handleVideoReady);
        
        setTimeout(() => {
          if (!isScanning && video.readyState >= 2) {
            handleVideoReady();
          }
        }, 2000);
        
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

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      const imageData = context.getImageData(0, 0, videoWidth, videoHeight);
      
      scanAttempts.current++;
      
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
      
      if (!code) {
        const regions = [
          { 
            x: Math.floor(videoWidth * 0.2), 
            y: Math.floor(videoHeight * 0.2), 
            w: Math.floor(videoWidth * 0.6), 
            h: Math.floor(videoHeight * 0.6) 
          },
          { x: 0, y: 0, w: videoWidth, h: videoHeight },
          { x: 0, y: 0, w: videoWidth, h: Math.floor(videoHeight * 0.7) },
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
      
      if (!code && scanAttempts.current > 20 && 'BarcodeDetector' in window) {
        tryBarcodeDetectorScan();
        return;
      }
      
      if (code && code.data && code.data.trim()) {
        const scannedData = code.data.trim();
        
        if (lastSuccessfulScan.current === scannedData && (now - lastScanTime.current) < 2000) {
          return;
        }
        
        lastSuccessfulScan.current = scannedData;
        console.log('QR Code detected:', scannedData);
        setDebugInfo(`✓ QR Code found: ${scannedData.substring(0, 30)}...`);
        
        setIsScanning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        setTimeout(() => {
          if (onScan) onScan(scannedData);
          stopCamera();
          onClose();
        }, 500);
        
        return;
      }
      
      if (scanAttempts.current % 10 === 0) {
        const seconds = Math.floor(scanAttempts.current / 10);
        setDebugInfo(`Scanning... ${seconds}s (${scanAttempts.current} attempts) - ${videoWidth}x${videoHeight}`);
      }
      
      if (showDebugCanvas && debugCanvasRef.current && scanAttempts.current % 5 === 0) {
        const debugCanvas = debugCanvasRef.current;
        const debugContext = debugCanvas.getContext('2d');
        debugCanvas.width = 200;
        debugCanvas.height = 150;
        debugContext.drawImage(canvas, 0, 0, videoWidth, videoHeight, 0, 0, 200, 150);
        
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
        setDebugInfo(`✓ BarcodeDetector found: ${scannedData.substring(0, 30)}...`);
        
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
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1002
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '32px',
        width: '520px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500', color: '#1a1a1a' }}>
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
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#666'
            }}
          >
            <Close fontSize="small" />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#fafafa',
            border: '1px solid #e8e8e8'
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
            
            {showDebugCanvas && (
              <canvas
                ref={debugCanvasRef}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  border: '1px solid #fff',
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }}
              />
            )}
            
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              right: '30px',
              bottom: '30px',
              border: '2px solid #1a1a1a',
              borderRadius: '8px',
              pointerEvents: 'none'
            }}>
              {[
                { top: '-2px', left: '-2px', borderRight: 'transparent', borderBottom: 'transparent' },
                { top: '-2px', right: '-2px', borderLeft: 'transparent', borderBottom: 'transparent' },
                { bottom: '-2px', left: '-2px', borderRight: 'transparent', borderTop: 'transparent' },
                { bottom: '-2px', right: '-2px', borderLeft: 'transparent', borderTop: 'transparent' }
              ].map((corner, index) => (
                <div key={index} style={{
                  position: 'absolute',
                  width: '32px',
                  height: '32px',
                  border: '3px solid #1a1a1a',
                  borderRadius: '4px',
                  ...corner
                }} />
              ))}
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '400',
              maxWidth: '380px',
              textAlign: 'center'
            }}>
              {debugInfo || (isScanning ? 'Scanning...' : 'Initializing...')}
            </div>
          </div>
        </div>

        {scanError && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            border: '1px solid #fee2e2'
          }}>
            {scanError}
          </div>
        )}

        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Hold the QR code steady within the frame
        </div>

        <div style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: '20px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#4a4a4a'
          }}>
            Or enter Guest ID manually
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter Guest ID"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none'
              }}
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
                borderRadius: '4px',
                background: '#1a1a1a',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              Submit
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '20px'
        }}>
          <button
            onClick={() => {
              stopCamera();
              setTimeout(() => startCamera(), 300);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              background: '#fff',
              color: '#666',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Refresh fontSize="small" />
            Restart
          </button>
          
          <button
            onClick={() => setShowDebugCanvas(!showDebugCanvas)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              background: showDebugCanvas ? '#1a1a1a' : '#fff',
              color: showDebugCanvas ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Debug
          </button>
          
          <button
            onClick={tryBarcodeDetectorScan}
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              background: '#fff',
              color: '#666',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Alt Method
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, selectedRoom, selectedDates, isMultiDay }) => {
  const [formData, setFormData] = useState({
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
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [guestError, setGuestError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      setFormData(prev => ({
        ...prev,
        selectedRooms: [selectedRoom],
        preferredRoomType: selectedRoom.roomType || ''
      }));
    }
  }, [selectedRoom]);

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
      const guestId = scannedData;
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

    setGuestError(null);
    setSubmitError(null);
    
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

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    
    if (checkOutDate <= checkInDate) {
      setGuestError('Check-out date must be after check-in date');
      return;
    }

    const totalCapacity = formData.selectedRooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const totalGuests = formData.adults + formData.kids;
    
    if (totalGuests > totalCapacity) {
      setGuestError(`Selected rooms can accommodate maximum ${totalCapacity} guests, but you have ${totalGuests} guests`);
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Creating reservation...');
      
      const reservationRequestData = {
        guestId: formData.guestId.toString(),
        roomIds: formData.selectedRooms.map(room => parseInt(room.id)),
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        status: formData.status || 'CONFIRMED'
      };

      console.log('Prepared reservation data:', reservationRequestData);
      
      const reservationResponse = await createReservation(reservationRequestData);
      console.log('Reservation created successfully:', reservationResponse);

      let reservationId = null;
      if (reservationResponse.reservationId) {
        reservationId = reservationResponse.reservationId;
      } else if (reservationResponse.id) {
        reservationId = reservationResponse.id;
      } else {
        throw new Error('No reservation ID returned from server');
      }

      console.log('Using reservation ID:', reservationId);

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

      console.log('Booking created successfully!');
      
      const roomNumbers = formData.selectedRooms.map(room => room.roomNumber).join(', ');
      const guestName = formData.guestDetails.name || 
                       `${formData.guestDetails.firstName} ${formData.guestDetails.lastName}`;
      
      alert(`Booking created successfully!\nReservation ID: ${reservationId}\nRooms: ${roomNumbers}\nGuest: ${guestName}\nDates: ${formData.checkIn} to ${formData.checkOut}`);
      
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

  const getUniqueRoomTypes = () => {
    try {
      const allRooms = JSON.parse(localStorage.getItem('allRooms') || '[]');
      return [...new Set(allRooms.map(room => room.roomType).filter(type => type))];
    } catch {
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
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '32px',
          width: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500', color: '#1a1a1a' }}>
                {isMultiDay ? 'Add Multi-Day Booking' : 'Add Booking'}
              </h2>
              {selectedDates && selectedDates.length > 0 && (
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#666' }}>
                  {formatDateRange()} ({selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''})
                </p>
              )}
              {formData.selectedRooms.length > 0 && (
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#1a1a1a' }}>
                  {formData.selectedRooms.length} room{formData.selectedRooms.length !== 1 ? 's' : ''} • {getTotalCapacity()} guests • ${getTotalPrice().toFixed(2)}
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
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}
            >
              <Close fontSize="small" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>
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
                        padding: '14px 20px',
                        border: '1px dashed #d0d0d0',
                        borderRadius: '6px',
                        background: loadingGuest ? '#fafafa' : '#fff',
                        color: loadingGuest ? '#999' : '#1a1a1a',
                        cursor: loadingGuest ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontWeight: '500'
                      }}
                    >
                      {loadingGuest ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <QrCodeScanner style={{ fontSize: '20px' }} />
                          Scan Guest QR Code
                        </>
                      )}
                    </button>
                    
                    {guestError && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px 12px',
                        backgroundColor: '#fef2f2',
                        color: '#991b1b',
                        borderRadius: '4px',
                        fontSize: '13px',
                        border: '1px solid #fee2e2'
                      }}>
                        {guestError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: '6px',
                    padding: '14px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Person style={{ color: '#1a1a1a', fontSize: '18px' }} />
                        <span style={{ fontWeight: '500', color: '#1a1a1a', fontSize: '14px' }}>Guest Selected</span>
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
                          padding: '5px 10px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          background: '#fff',
                          color: '#666',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Change
                      </button>
                    </div>
                    <div style={{ fontSize: '13px', color: '#4a4a4a', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '3px' }}>
                        <strong>Name:</strong> {formData.guestDetails.name || `${formData.guestDetails.firstName} ${formData.guestDetails.lastName}`}
                      </div>
                      <div style={{ marginBottom: '3px' }}>
                        <strong>ID:</strong> {formData.guestId}
                      </div>
                      {formData.guestDetails.email && (
                        <div style={{ marginBottom: '3px' }}>
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

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>
                  Room Selection *
                </label>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Preferred Room Type
                  </label>
                  <select
                    value={formData.preferredRoomType}
                    onChange={(e) => setFormData({...formData, preferredRoomType: e.target.value})}
                    disabled={!!selectedRoom}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: selectedRoom ? '#fafafa' : '#fff',
                      color: selectedRoom ? '#666' : '#1a1a1a',
                      cursor: selectedRoom ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">All Room Types</option>
                    {getUniqueRoomTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {selectedRoom ? (
                  <div style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: '6px',
                    padding: '14px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500', color: '#1a1a1a', fontSize: '13px' }}>
                        Pre-selected from Calendar
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedRooms: [],
                            preferredRoomType: ''
                          }));
                          fetchAvailableRooms();
                        }}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          background: '#fff',
                          color: '#666',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Change
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      backgroundColor: '#fff',
                      borderRadius: '4px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#1a1a1a'
                      }}></div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          Room {selectedRoom.roomNumber}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {selectedRoom.roomType} • {selectedRoom.capacity} guests • ${selectedRoom.pricePerNight}/night
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {loadingRooms ? (
                      <div style={{ textAlign: 'center', padding: '16px', color: '#666', fontSize: '13px' }}>
                        Loading available rooms...
                      </div>
                    ) : availableRooms.length > 0 ? (
                      <div style={{
                        border: '1px solid #e8e8e8',
                        borderRadius: '6px',
                        padding: '12px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        <div style={{ marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                          {formData.preferredRoomType 
                            ? `Available ${formData.preferredRoomType} rooms:`
                            : 'Available rooms:'
                          }
                          <span style={{ color: '#1a1a1a', fontWeight: '500', marginLeft: '6px' }}>
                            ({availableRooms.length})
                          </span>
                        </div>
                        <div style={{ display: 'grid', gap: '6px' }}>
                          {availableRooms.map(room => {
                            const isSelected = formData.selectedRooms.some(r => r.id === room.id);
                            return (
                              <div
                                key={room.id}
                                onClick={() => handleRoomSelection(room, !isSelected)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px',
                                  border: `1px solid ${isSelected ? '#1a1a1a' : '#e8e8e8'}`,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? '#fafafa' : '#fff'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  style={{ margin: 0 }}
                                />
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: '#1a1a1a'
                                }}></div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '500', fontSize: '13px' }}>
                                    Room {room.roomNumber}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    {room.roomType} • {room.capacity} guests • Floor {room.floor}
                                  </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '500' }}>
                                  ${room.pricePerNight}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        border: '1px dashed #d0d0d0',
                        borderRadius: '6px',
                        padding: '16px',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '13px'
                      }}>
                        {formData.checkIn && formData.checkOut 
                          ? (formData.preferredRoomType 
                              ? `No ${formData.preferredRoomType} rooms available`
                              : 'No rooms available'
                            )
                          : 'Select dates to view available rooms'
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Check-in *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Check-out *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Adults
                  </label>
                  <select
                    value={formData.adults}
                    onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Kids
                  </label>
                  <select
                    value={formData.kids}
                    onChange={(e) => setFormData({...formData, kids: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    {[0,1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Meal Plan
                  </label>
                  <select
                    value={formData.mealPlan}
                    onChange={(e) => setFormData({...formData, mealPlan: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff'
                    }}
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
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                    Amenities
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                    placeholder="WiFi, Pool, Spa"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  rows="2"
                  placeholder="Late check-in, ground floor, extra pillows"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#4a4a4a' }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                  rows="3"
                  placeholder="Any other important information"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    background: '#fff',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '4px',
                    background: submitting ? '#999' : '#1a1a1a',
                    color: '#fff',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </div>

            {(guestError || submitError) && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                borderRadius: '4px',
                fontSize: '13px',
                border: '1px solid #fee2e2',
                lineHeight: '1.5'
              }}>
                {guestError || submitError}
              </div>
            )}
          </form>
        </div>
      </div>

      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        onError={handleQRError}
      />
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
      
      localStorage.setItem('allRooms', JSON.stringify(roomsData));
      
      const roomTypes = [...new Set(roomsData.map(room => room.roomType).filter(type => type))];
      const expanded = {};
      roomTypes.forEach(type => {
        expanded[type] = true;
      });
      setExpandedRoomTypes(expanded);
      
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(`Failed to load rooms: ${err.message}`);
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

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(200, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(50, prev - 25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(100);
  }, []);

  const years = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
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
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    switch(normalizedStatus) {
      case 'available':
      case 'vacant': 
        return '#1a1a1a';
      case 'occupied': 
      case 'booked':
        return '#666';
      case 'checkout': 
      case 'check-out':
        return '#999';
      case 'checkin': 
      case 'check-in':
        return '#4a4a4a';
      case 'maintenance': 
      case 'out-of-order':
        return '#991b1b';
      case 'dirty': 
      case 'cleaning':
        return '#b45309';
      default: 
        return '#d0d0d0';
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
  const uniqueStatuses = [...new Set(rooms.map(room => room.status?.toLowerCase()).filter(status => status != null))];
  const commonStatuses = ['available', 'occupied', 'checkout', 'checkin', 'maintenance', 'dirty'];
  const roomStatuses = [...new Set([...uniqueStatuses, ...commonStatuses])];

  const dayColumnWidth = Math.max(50, 70 * (zoomLevel / 100));

  const styles = {
    container: {
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      userSelect: isResizing ? 'none' : 'auto'
    },
    header: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #f0f0f0',
      padding: '20px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '20px',
      fontWeight: '500',
      color: '#1a1a1a',
      margin: 0
    },
    breadcrumb: {
      fontSize: '13px',
      color: '#999',
      marginLeft: '12px'
    },
    addButton: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500'
    },
    controlsContainer: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #f0f0f0',
      padding: '20px 32px'
    },
    yearTabs: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px',
      borderBottom: '1px solid #f0f0f0',
      paddingBottom: '12px'
    },
    yearTab: {
      background: 'none',
      border: 'none',
      padding: '6px 10px',
      cursor: 'pointer',
      fontSize: '13px',
      color: '#999',
      borderRadius: '4px',
      fontWeight: '400'
    },
    activeYear: {
      color: '#1a1a1a',
      backgroundColor: '#fafafa',
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
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '12px'
    },
    monthTab: {
      background: 'none',
      border: 'none',
      padding: '6px 10px',
      cursor: 'pointer',
      fontSize: '13px',
      color: '#999',
      borderRadius: '4px',
      fontWeight: '400'
    },
    activeMonth: {
      color: '#1a1a1a',
      backgroundColor: '#fafafa',
      fontWeight: '500'
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    searchInput: {
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '8px 12px 8px 36px',
      fontSize: '13px',
      outline: 'none',
      width: '200px',
      backgroundColor: '#fff'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      color: '#999',
      fontSize: '16px'
    },
    select: {
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '13px',
      outline: 'none',
      background: '#fff',
      minWidth: '120px',
      color: '#1a1a1a'
    },
    navigationControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    navButton: {
      border: '1px solid #e0e0e0',
      background: '#fff',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      color: '#666'
    },
    zoomControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      border: '1px solid #e0e0e0',
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
      color: '#666'
    },
    zoomLevel: {
      padding: '8px 12px',
      fontSize: '12px',
      color: '#666',
      cursor: 'pointer',
      minWidth: '50px',
      textAlign: 'center',
      borderLeft: '1px solid #e0e0e0',
      borderRight: '1px solid #e0e0e0',
      backgroundColor: '#fff'
    },
    selectionControls: {
      backgroundColor: '#fafafa',
      border: '1px solid #e8e8e8',
      borderRadius: '4px',
      padding: '12px 16px',
      marginTop: '16px'
    },
    clearSelectionButton: {
      padding: '6px 12px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      background: '#fff',
      color: '#666',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500'
    },
    bookSelectedButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      background: '#1a1a1a',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500'
    },
    calendarWrapper: {
      margin: '24px 32px',
      border: '1px solid #e8e8e8',
      borderRadius: '6px',
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
      borderBottom: '1px solid #e8e8e8',
      backgroundColor: '#fafafa',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    roomsColumn: {
      width: `${roomColumnWidth}px`,
      minWidth: `${roomColumnWidth}px`,
      padding: '12px 16px',
      fontWeight: '500',
      fontSize: '13px',
      borderRight: '1px solid #e8e8e8',
      backgroundColor: '#fafafa',
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
      backgroundColor: isResizing ? 'rgba(26, 26, 26, 0.1)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 11
    },
    dayColumn: {
      minWidth: `${dayColumnWidth}px`,
      width: `${dayColumnWidth}px`,
      padding: '8px 4px',
      textAlign: 'center',
      borderRight: '1px solid #f0f0f0',
      fontSize: '11px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#666'
    },
    currentDay: {
      backgroundColor: '#fafafa',
      color: '#1a1a1a',
      fontWeight: '500'
    },
    roomTypeRow: {
      display: 'flex',
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: '#fafafa'
    },
    roomTypeHeader: {
      width: `${roomColumnWidth}px`,
      minWidth: `${roomColumnWidth}px`,
      padding: '12px 16px',
      fontWeight: '500',
      fontSize: '13px',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      backgroundColor: '#fafafa',
      color: '#1a1a1a'
    },
    roomRow: {
      display: 'flex',
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: '#fff'
    },
    roomCell: {
      width: `${roomColumnWidth}px`,
      minWidth: `${roomColumnWidth}px`,
      padding: '10px 16px',
      fontSize: '13px',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#fff'
    },
    statusIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      flexShrink: 0
    },
    dayCell: {
      minWidth: `${dayColumnWidth}px`,
      width: `${dayColumnWidth}px`,
      minHeight: '50px',
      borderRight: '1px solid #f0f0f0',
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    },
    todayButton: {
      position: 'fixed',
      bottom: '24px',
      right: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '10px 14px',
      background: '#fff',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      color: '#1a1a1a'
    }
  };

  return (
    <div style={styles.container} onMouseUp={handleMouseUp}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={styles.title}>Front Desk</h1>
          <span style={styles.breadcrumb}>Home / Front Desk</span>
        </div>
        <button style={styles.addButton} onClick={() => handleAddBooking()}>
          <Add fontSize="small" />
          Add Booking
        </button>
      </div>

      <div style={styles.controlsContainer}>
        <div style={styles.yearTabs}>
          {years.map(year => (
            <button
              key={year}
              style={{
                ...styles.yearTab,
                ...(year === selectedYear ? styles.activeYear : {})
              }}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

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
                placeholder="Search rooms"
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
              <option value="">All Types</option>
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
              <button style={styles.navButton} onClick={() => navigateMonth('prev')}>
                <ChevronLeft fontSize="small" />
              </button>
              <button style={styles.navButton} onClick={() => navigateMonth('next')}>
                <ChevronRight fontSize="small" />
              </button>
            </div>

            <div style={styles.zoomControls}>
              <button 
                style={styles.zoomButton} 
                onClick={handleZoomOut} 
                disabled={zoomLevel <= 50}
              >
                <ZoomOut fontSize="small" />
              </button>
              <div style={styles.zoomLevel} onClick={resetZoom}>
                {zoomLevel}%
              </div>
              <button 
                style={styles.zoomButton} 
                onClick={handleZoomIn} 
                disabled={zoomLevel >= 200}
              >
                <ZoomIn fontSize="small" />
              </button>
            </div>
          </div>
        </div>

        {(isSelecting || selectedDates.length > 0) && (
          <div style={styles.selectionControls}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '500' }}>
                {isSelecting 
                  ? `Selecting dates... (${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''})`
                  : `${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''} selected for Room ${selectedRoom?.roomNumber}`
                }
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={styles.clearSelectionButton} onClick={handleClearSelection}>
                  Clear
                </button>
                {!isSelecting && selectedDates.length > 0 && (
                  <button
                    style={styles.bookSelectedButton}
                    onClick={() => handleAddBooking(selectedRoom, selectedDates)}
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
        <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '13px' }}>
          Loading rooms...
        </div>
      )}

      {!loading && (
        <div style={styles.calendarWrapper}>
          <div ref={containerRef} style={styles.calendarContainer}>
            <div style={styles.calendarHeader}>
              <div style={styles.roomsColumn}>
                <span>Rooms</span>
                <div style={styles.resizeHandle} onMouseDown={handleMouseDown}>
                  <DragIndicator style={{ fontSize: '14px', color: '#999' }} />
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
                    <div style={{ fontSize: '11px' }}>{day}</div>
                  </div>
                );
              })}
            </div>

            {Object.entries(groupedRooms).map(([roomType, roomsOfType]) => (
              <div key={roomType}>
                <div style={styles.roomTypeRow}>
                  <div 
                    style={styles.roomTypeHeader}
                    onClick={() => toggleRoomType(roomType)}
                  >
                    <ExpandMore 
                      style={{ 
                        transform: expandedRoomTypes[roomType] ? 'rotate(0deg)' : 'rotate(-90deg)',
                        fontSize: '18px'
                      }} 
                    />
                    {roomType} ({roomsOfType.length})
                  </div>
                  {getCurrentMonthDays().map(day => (
                    <div key={day} style={styles.dayCell}></div>
                  ))}
                </div>

                {expandedRoomTypes[roomType] && roomsOfType.map(room => (
                  <div key={room.id} style={styles.roomRow}>
                    <div style={styles.roomCell}>
                      <div
                        style={{
                          ...styles.statusIndicator,
                          backgroundColor: getRoomStatusColor(room.status)
                        }}
                      ></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '500', fontSize: '13px', color: '#1a1a1a' }}>
                          Room {room.roomNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {room.capacity} guests • ${room.pricePerNight}/nt • Floor {room.floor}
                        </div>
                        <div style={{ fontSize: '11px', color: '#b8b8b8' }}>
                          {room.status || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    {getCurrentMonthDays().map(day => {
                      const isSelected = isDateSelected(room, day);
                      const isAvailable = room.status?.toLowerCase() === 'available';
                      
                      return (
                        <div 
                          key={day} 
                          style={{
                            ...styles.dayCell,
                            backgroundColor: isSelected 
                              ? '#e8e8e8'
                              : isAvailable 
                                ? (day % 7 === 0 || (day + 6) % 7 === 0 ? '#fafafa' : '#fff')
                                : '#f8f8f8',
                            cursor: isAvailable ? 'crosshair' : 'not-allowed',
                            border: isSelected ? '1px solid #1a1a1a' : '1px solid #f0f0f0',
                            boxSizing: 'border-box'
                          }}
                          onClick={() => handleCellClick(room, day)}
                          onMouseEnter={() => {
                            if (isAvailable) handleCellMouseEnter(room, day);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {!isAvailable && (
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              left: '2px',
                              right: '2px',
                              bottom: '2px',
                              borderRadius: '2px',
                              fontSize: '10px',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '500',
                              backgroundColor: getRoomStatusColor(room.status)
                            }}>
                              {room.status?.toLowerCase() === 'occupied' && 'Booked'}
                              {room.status?.toLowerCase() === 'checkout' && 'C/O'}
                              {room.status?.toLowerCase() === 'checkin' && 'C/I'}
                              {room.status?.toLowerCase() === 'maintenance' && 'Maint'}
                              {room.status?.toLowerCase() === 'dirty' && 
                                <span style={{ color: '#fff' }}>Dirty</span>
                              }
                              {!room.status && <span style={{ color: '#666' }}>N/A</span>}
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
                color: '#999',
                backgroundColor: '#fff',
                fontSize: '13px'
              }}>
                {rooms.length === 0 ? 'No rooms available. Please check your API connection.' : 'No rooms found matching your filters.'}
                {rooms.length === 0 && (
                  <button
                    onClick={fetchRooms}
                    style={{
                      marginTop: '16px',
                      padding: '8px 16px',
                      backgroundColor: '#1a1a1a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: '#fafafa',
            padding: '16px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>Room Status Legend</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {[
                { status: 'available', label: 'Available', color: '#1a1a1a' },
                { status: 'occupied', label: 'Occupied', color: '#666' },
                { status: 'checkout', label: 'Check Out', color: '#999' },
                { status: 'checkin', label: 'Check In', color: '#4a4a4a' },
                { status: 'maintenance', label: 'Maintenance', color: '#991b1b' },
                { status: 'dirty', label: 'Dirty', color: '#b45309' }
              ].map(({ status, label, color }) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
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

      <button 
        style={styles.todayButton} 
        onClick={goToToday}
      >
        <Today fontSize="small" />
        Today
      </button>

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

      {error && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '32px',
          backgroundColor: '#991b1b',
          color: '#fff',
          padding: '14px 18px',
          borderRadius: '4px',
          maxWidth: '400px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div style={{ flex: 1 }}>{error}</div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;