import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Add,
  Today,
  ExpandMore,
  Close,
  ZoomIn,
  ZoomOut,
  DragIndicator,
  QrCodeScanner,
  Info,
  Refresh,
  History
} from "@mui/icons-material";
import { CheckCircle, AlertCircle } from 'lucide-react';
import * as ReservationAPI from '../api/reservation';
import theme from '../styles/theme';
import '../styles/dashboard.css';
import '../styles/modals.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ==========================================
// API FUNCTIONS
// ==========================================

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
      roomType: room.type,
      floor: parseInt(room.floorNumber),
      status: room.availabilityStatus?.toLowerCase() || 'available',
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      description: room.description
    }));
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==========================================
// MODAL COMPONENTS
// ==========================================

const ReservationDetailsModal = ({ isOpen, onClose, reservation, roomDetails }) => {
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservationData = async () => {
      if (!isOpen || !reservation) return;
      
      setLoading(true);
      try {
        try {
          const detailsData = await ReservationAPI.getReservationDetails(reservation.reservationId);
          setDetails(detailsData);
        } catch (err) {
          console.warn('No details found:', err);
        }

        try {
          const historyData = await ReservationAPI.getReservationHistory(reservation.reservationId);
          setHistory(historyData || []);
        } catch (err) {
          console.warn('No history found:', err);
        }
      } catch (error) {
        console.error('Error fetching reservation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationData();
  }, [isOpen, reservation]);

  if (!isOpen || !reservation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'CHECKED_IN': 'status-checked-in',
      'OCCUPIED': 'status-occupied',
      'CHECKED_OUT': 'status-checked-out',
      'CANCELLED': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-container-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Reservation Details - #{reservation.reservationId}</h2>
          <button onClick={onClose} className="modal-close">
            <Close fontSize="small" />
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading details...</div>
        ) : (
          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section-title">Reservation Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Guest ID</label>
                  <div className="form-value">{reservation.guestId || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Status</label>
                  <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                    {reservation.status}
                  </span>
                </div>
                <div className="form-field">
                  <label className="form-label">Check-in Date</label>
                  <div className="form-value">{formatDate(reservation.checkInDate)}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Check-out Date</label>
                  <div className="form-value">{formatDate(reservation.checkOutDate)}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Room(s)</label>
                  <div className="form-value">
                    {roomDetails?.roomNumber || (reservation.roomIds?.length > 0 
                      ? `Room IDs: ${[...reservation.roomIds].join(', ')}` 
                      : 'N/A')}
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Created At</label>
                  <div className="form-value">{formatDateTime(reservation.createdAt)}</div>
                </div>
              </div>
            </div>

            {details && (
              <div className="form-section">
                <h3 className="form-section-title">Guest Details</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Adults</label>
                    <div className="form-value">{details.adults || 1}</div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Kids</label>
                    <div className="form-value">{details.kids || 0}</div>
                  </div>
                  {details.mealPlan && (
                    <div className="form-field">
                      <label className="form-label">Meal Plan</label>
                      <div className="form-value">{details.mealPlan}</div>
                    </div>
                  )}
                  {details.amenities && (
                    <div className="form-field">
                      <label className="form-label">Amenities</label>
                      <div className="form-value">{details.amenities}</div>
                    </div>
                  )}
                  {details.specialRequests && (
                    <div className="form-field form-grid-full">
                      <label className="form-label">Special Requests</label>
                      <div className="form-value">{details.specialRequests}</div>
                    </div>
                  )}
                  {details.additionalNotes && (
                    <div className="form-field form-grid-full">
                      <label className="form-label">Additional Notes</label>
                      <div className="form-value">{details.additionalNotes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="form-section">
                <h3 className="form-section-title">
                  <History fontSize="small" style={{ marginRight: '8px' }} />
                  Status History
                </h3>
                <div className="history-timeline">
                  {history.map((entry, index) => (
                    <div 
                      key={entry.historyId || index}
                      className="history-item"
                      style={{ borderLeftColor: theme.colors.textSecondary }}
                    >
                      <div className="history-header">
                        <div className="history-badges">
                          <span className={`status-badge ${getStatusClass(entry.previousStatus)}`}>
                            {entry.previousStatus || 'NEW'}
                          </span>
                          <span style={{ color: theme.colors.textSecondary }}>→</span>
                          <span className={`status-badge ${getStatusClass(entry.newStatus)}`}>
                            {entry.newStatus}
                          </span>
                        </div>
                        <div className="history-time">{formatDateTime(entry.changedAt)}</div>
                      </div>
                      <div className="history-user">Changed by: {entry.changedBy || 'System'}</div>
                      {entry.notes && <div className="history-notes">{entry.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={onClose} className="btn-outline">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QRScannerModal = ({ isOpen, onClose, onGuestScanned }) => {
  const [result, setResult] = useState('');
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);

  const fetchGuestData = async (guestId) => {
    try {
      setLoading(true);
      setError(null);
      setGuestData(null);

      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Guest not found (${response.status})`);
      }

      const data = await response.json();
      setGuestData(data);
      stopCamera();
    } catch (err) {
      setError(err.message || 'Failed to fetch guest data');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setCameraError(null);
      setGuestData(null);
      setResult('');
      setScanning(true);

      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      let lastScannedCode = '';
      let lastScanTime = 0;
      const SCAN_COOLDOWN = 2000;

      controlsRef.current = await codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (res, err) => {
          if (res) {
            const qrValue = res.getText();
            const currentTime = Date.now();
            
            if (qrValue === lastScannedCode && (currentTime - lastScanTime) < SCAN_COOLDOWN) {
              return;
            }
            
            setResult(qrValue);
            lastScannedCode = qrValue;
            lastScanTime = currentTime;
            
            setTimeout(() => fetchGuestData(qrValue.trim()), 500);
          }
          if (err && !(err.name === 'NotFoundException')) {
            console.error('QR scan error:', err);
          }
        }
      );
    } catch (err) {
      setCameraError('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      fetchGuestData(manualId.trim());
    } else {
      setError('Please enter a valid Guest ID');
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        stopCamera();
        setResult('');
        setGuestData(null);
        setError(null);
        setCameraError(null);
        setManualId('');
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Scan Guest QR Code</h2>
          <button onClick={onClose} className="modal-close">
            <Close fontSize="small" />
          </button>
        </div>

        {!guestData && (
          <div className="modal-body">
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="video-preview"
              />
              
              {result && (
                <div className="qr-result">
                  <CheckCircle size={16} />
                  <span>QR Detected: {result}</span>
                </div>
              )}
              
              <div className="video-controls">
                {!scanning ? (
                  <button onClick={startCamera} className="btn-primary">
                    <QrCodeScanner fontSize="small" /> Start Camera
                  </button>
                ) : (
                  <button onClick={stopCamera} className="btn-secondary">
                    Stop Camera
                  </button>
                )}
              </div>
            </div>

            <div className="manual-input-section">
              <label className="form-label">Or enter Guest ID manually</label>
              <div className="manual-input-wrapper">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  placeholder="Enter Guest ID"
                  className="form-input"
                />
                <button onClick={handleManualSubmit} className="btn-primary">
                  Submit
                </button>
              </div>
            </div>

            {cameraError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{cameraError}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {loading && <div className="modal-loading">Loading guest data...</div>}
          </div>
        )}

        {guestData && (
          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section-title">Guest Details Loaded</h3>
              
              <div className="image-container">
                {guestData.imageUrl && (
                  <div className="image-item">
                    <img src={guestData.imageUrl} alt="Guest" className="image-preview grayscale" />
                    <p className="image-caption">Profile Photo</p>
                  </div>
                )}

                {guestData.qrCodeBase64 && (
                  <div className="image-item">
                    <img src={guestData.qrCodeBase64} alt="QR Code" className="image-preview" />
                    <p className="image-caption">QR Code</p>
                  </div>
                )}
              </div>

              <div className="guest-info-grid">
                <div className="guest-info-item">
                  <span className="guest-info-label">Guest ID:</span>
                  <span className="guest-info-value">{guestData.guestId || guestData.id}</span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">Name:</span>
                  <span className="guest-info-value">
                    {guestData.fullName || guestData.name || `${guestData.firstName} ${guestData.lastName}`}
                  </span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">Email:</span>
                  <span className="guest-info-value">{guestData.email}</span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">Phone:</span>
                  <span className="guest-info-value">{guestData.phone}</span>
                </div>
                {guestData.nationality && (
                  <div className="guest-info-item">
                    <span className="guest-info-label">Nationality:</span>
                    <span className="guest-info-value">{guestData.nationality}</span>
                  </div>
                )}
                {guestData.identityType && guestData.identityNumber && (
                  <div className="guest-info-item">
                    <span className="guest-info-label">{guestData.identityType}:</span>
                    <span className="guest-info-value">{guestData.identityNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => onGuestScanned(guestData)} className="btn-primary">
                Use This Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, selectedRoom, selectedDates, isMultiDay, onBookingCreated }) => {
  const [formData, setFormData] = useState({
    guestId: '',
    guestDetails: null,
    selectedRooms: [],
    roomType: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    kids: 0,
    mealPlan: 'Room Only',
    amenities: '',
    specialRequests: '',
    additionalNotes: '',
    status: 'CONFIRMED'
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [guestError, setGuestError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [availableRoomsByType, setAvailableRoomsByType] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const fetchAvailableRoomsByType = useCallback(async (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) {
      setAvailableRoomsByType({});
      setRoomTypes([]);
      return;
    }

    try {
      setLoadingRooms(true);
      
      const allRooms = await getAllRooms();
      const unavailableRoomIds = new Set();
      
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const daysBetween = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysBetween; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        try {
          const dailyStatus = await ReservationAPI.getRoomStatusForDate(dateStr);
          dailyStatus.forEach(roomStatus => {
            if (roomStatus.status === 'OCCUPIED' || 
                roomStatus.status === 'RESERVED' || 
                roomStatus.status === 'ARRIVING') {
              unavailableRoomIds.add(roomStatus.roomId);
            }
          });
        } catch (error) {
          console.warn(`Could not check status for ${dateStr}:`, error);
        }
      }
      
      const trulyAvailableRooms = allRooms.filter(room => {
        return !unavailableRoomIds.has(room.id) && room.status?.toLowerCase() === 'available';
      });
      
      const roomsByType = {};
      const uniqueTypes = new Set();
      
      trulyAvailableRooms.forEach(room => {
        const roomType = room.roomType || 'Standard';
        uniqueTypes.add(roomType);
        
        if (!roomsByType[roomType]) {
          roomsByType[roomType] = [];
        }
        roomsByType[roomType].push(room);
      });
      
      setAvailableRoomsByType(roomsByType);
      setRoomTypes(Array.from(uniqueTypes).sort());
      
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRoomsByType({});
      setRoomTypes([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut && !selectedRoom) {
      fetchAvailableRoomsByType(formData.checkIn, formData.checkOut);
    } else {
      setAvailableRoomsByType({});
      setRoomTypes([]);
    }
  }, [formData.checkIn, formData.checkOut, selectedRoom, fetchAvailableRoomsByType]);

  useEffect(() => {
    if (formData.roomType && availableRoomsByType[formData.roomType]) {
      const roomsOfType = availableRoomsByType[formData.roomType];
      if (roomsOfType.length > 0) {
        const firstRoom = roomsOfType[0];
        setFormData(prev => ({ 
          ...prev, 
          roomId: firstRoom.id.toString(),
          selectedRooms: [firstRoom]
        }));
      }
    }
  }, [formData.roomType, availableRoomsByType]);

  useEffect(() => {
    if (selectedRoom) {
      setFormData(prev => ({
        ...prev,
        selectedRooms: [selectedRoom],
        roomType: selectedRoom.roomType || '',
        roomId: selectedRoom.id.toString()
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

  const handleQRScan = async (scannedData) => {
    setLoadingGuest(true);
    setGuestError(null);
    
    try {
      const guestId = scannedData.guestId || scannedData.id;
      
      setFormData(prev => ({
        ...prev,
        guestId: guestId,
        guestDetails: scannedData
      }));
      
      setShowQRScanner(false);
    } catch (error) {
      console.error('Error processing QR scan:', error);
      setGuestError(`Failed to load guest details: ${error.message}`);
    } finally {
      setLoadingGuest(false);
    }
  };

  const handleSubmit = async () => {
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

    if (!formData.roomType || !formData.roomId) {
      setGuestError('Please select a room type');
      return;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    
    if (checkOutDate <= checkInDate) {
      setGuestError('Check-out date must be after check-in date');
      return;
    }

    setSubmitting(true);
    
    try {
      const reservationPayload = {
        guestId: formData.guestId.toString(),
        roomIds: [parseInt(formData.roomId)],
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        status: formData.status || 'CONFIRMED',
        adults: formData.adults || 1,
        kids: formData.kids || 0,
        mealPlan: formData.mealPlan || 'Room Only',
        amenities: formData.amenities || '',
        specialRequests: formData.specialRequests || '',
        additionalNotes: formData.additionalNotes || ''
      };

      const guestResponse = await fetch(`${API_BASE_URL}/api/v1/guests/${formData.guestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!guestResponse.ok) {
        throw new Error('Guest not found. Please scan a valid guest QR code.');
      }

      const reservationResponse = await ReservationAPI.createReservation(reservationPayload);

      const reservationId = reservationResponse.reservationId || reservationResponse.id;
      const roomNumber = formData.selectedRooms[0]?.roomNumber || 'N/A';
      const guestName = formData.guestDetails.fullName || formData.guestDetails.name || 
                       `${formData.guestDetails.firstName} ${formData.guestDetails.lastName}`;
      
      alert(`Booking created successfully!\nReservation ID: ${reservationId}\nRoom: ${roomNumber}\nGuest: ${guestName}\nDates: ${formData.checkIn} to ${formData.checkOut}`);
      
      resetForm();
      onClose();
      
      if (onBookingCreated) {
        onBookingCreated();
      }
      
    } catch (error) {
      console.error('Booking creation error:', error);
      setSubmitError(`Failed to create booking: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      guestId: '',
      guestDetails: null,
      selectedRooms: [],
      roomType: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      kids: 0,
      mealPlan: 'Room Only',
      amenities: '',
      specialRequests: '',
      additionalNotes: '',
      status: 'CONFIRMED'
    });
    setGuestError(null);
    setSubmitError(null);
    setAvailableRoomsByType({});
    setRoomTypes([]);
  };

  if (!isOpen) return null;

  const formatDateRange = () => {
    if (!selectedDates || selectedDates.length === 0) return '';
    if (selectedDates.length === 1) return selectedDates[0].toDateString();
    
    const sortedDates = [...selectedDates].sort((a, b) => a - b);
    return `${sortedDates[0].toDateString()} - ${sortedDates[sortedDates.length - 1].toDateString()}`;
  };

  return (
    <>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-container modal-container-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title">
                {isMultiDay ? 'Create Multi-Day Reservation' : 'Create Reservation'}
              </h2>
              {selectedDates && selectedDates.length > 0 && (
                <p style={{ fontSize: '11px', color: theme.colors.textSecondary, marginTop: '8px' }}>
                  {formatDateRange()} ({selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''})
                </p>
              )}
            </div>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="modal-close"
            >
              <Close fontSize="small" />
            </button>
          </div>

          <div className="modal-body">
            <div className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div className="form-label" style={{ marginBottom: '12px' }}>Guest Information *</div>
                  {formData.guestDetails ? (
                    <div className="guest-info-grid">
                      <div className="guest-info-item">
                        <span className="guest-info-label">ID:</span>
                        <span className="guest-info-value">{formData.guestId}</span>
                      </div>
                      <div className="guest-info-item">
                        <span className="guest-info-label">Name:</span>
                        <span className="guest-info-value">
                          {formData.guestDetails.fullName || formData.guestDetails.name || 
                           `${formData.guestDetails.firstName} ${formData.guestDetails.lastName}`}
                        </span>
                      </div>
                      <div className="guest-info-item">
                        <span className="guest-info-label">Email:</span>
                        <span className="guest-info-value">{formData.guestDetails.email}</span>
                      </div>
                      <div className="guest-info-item">
                        <span className="guest-info-label">Phone:</span>
                        <span className="guest-info-value">{formData.guestDetails.phone}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="info-box info-box-dashed">
                      No guest selected - Scan QR code to load guest
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowQRScanner(true)}
                  disabled={loadingGuest}
                  className={formData.guestDetails ? "btn-secondary" : "btn-primary"}
                  style={{ marginTop: '24px' }}
                >
                  <QrCodeScanner fontSize="small" /> 
                  {formData.guestDetails ? 'Re-scan' : 'Scan Guest QR'}
                </button>
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value, roomType: '', roomId: ''})}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-field">
                  <label className="form-label">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value, roomType: '', roomId: ''})}
                    className="form-input"
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-field form-grid-full">
                  <label className="form-label">
                    Room Type * 
                    {loadingRooms && ' (Checking availability...)'}
                    {!loadingRooms && roomTypes.length > 0 && ` (${roomTypes.length} types available)`}
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({...formData, roomType: e.target.value, roomId: ''})}
                    className="form-select"
                    disabled={loadingRooms || roomTypes.length === 0 || !!selectedRoom}
                  >
                    <option value="">
                      {loadingRooms 
                        ? 'Checking room availability...'
                        : roomTypes.length === 0 
                          ? (formData.checkIn && formData.checkOut 
                              ? 'No rooms available for selected dates' 
                              : 'Select dates first to see available room types')
                          : 'Select a room type'}
                    </option>
                    {roomTypes.map(type => {
                      const roomsOfType = availableRoomsByType[type] || [];
                      const count = roomsOfType.length;
                      const sampleRoom = roomsOfType[0];
                      const price = sampleRoom?.pricePerNight || 0;
                      
                      return (
                        <option key={type} value={type}>
                          {type} - {count} available - ${price}/night
                        </option>
                      );
                    })}
                  </select>
                  {formData.roomType && availableRoomsByType[formData.roomType] && (
                    <div className="info-box info-box-highlight" style={{ marginTop: '8px' }}>
                      System will automatically assign: Room {availableRoomsByType[formData.roomType][0]?.roomNumber}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.adults}
                    onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Kids</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.kids}
                    onChange={(e) => setFormData({...formData, kids: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Meal Plan</label>
                  <select
                    value={formData.mealPlan}
                    onChange={(e) => setFormData({...formData, mealPlan: e.target.value})}
                    className="form-select"
                  >
                    <option value="Room Only">Room Only</option>
                    <option value="Bed & Breakfast">Bed & Breakfast</option>
                    <option value="Half Board">Half Board</option>
                    <option value="Full Board">Full Board</option>
                    <option value="All Inclusive">All Inclusive</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label className="form-label">Amenities</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                    placeholder="WiFi, Pool, Spa"
                    className="form-input"
                  />
                </div>

                <div className="form-field form-grid-full">
                  <label className="form-label">Special Requests</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    rows="2"
                    placeholder="Late check-in, ground floor, extra pillows"
                    className="form-textarea"
                  />
                </div>

                <div className="form-field form-grid-full">
                  <label className="form-label">Additional Notes (Internal)</label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                    rows="2"
                    placeholder="Internal notes..."
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            {(guestError || submitError) && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{guestError || submitError}</span>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !formData.guestDetails || !formData.roomType}
                className="btn-primary"
                style={{
                  opacity: (submitting || !formData.guestDetails || !formData.roomType) ? 0.5 : 1,
                  cursor: (submitting || !formData.guestDetails || !formData.roomType) ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Creating...' : 'Create Reservation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onGuestScanned={handleQRScan}
      />
    </>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

const ReceptionistDashboard = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
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
  const [roomStatusMap, setRoomStatusMap] = useState({});
  const [reservationsData, setReservationsData] = useState([]);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);

  const fetchRooms = async () => {
    if (!initialLoad) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const roomsData = await getAllRooms();
      
      if (!roomsData || roomsData.length === 0) {
        setRooms([]);
        setExpandedRoomTypes({});
        return;
      }
      
      setRooms(roomsData);
      
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
    } finally {
      setLoading(false);
      if (initialLoad) {
        setTimeout(() => setInitialLoad(false), 300);
      }
    }
  };

  const fetchRoomStatusForMonth = useCallback(async () => {
    try {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      const statusData = await ReservationAPI.getRoomStatusForDateRange(startDate, endDate);
      setRoomStatusMap(statusData);
      
      const reservations = await ReservationAPI.getReservationsForDateRange(startDate, endDate);
      setReservationsData(reservations);
      
    } catch (err) {
      console.error('Error fetching room status:', err);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      fetchRoomStatusForMonth();
    }
  }, [selectedYear, selectedMonth, rooms.length, fetchRoomStatusForMonth]);

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

  const years = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038];
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

  const getRoomStatusForDate = (roomId, day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dateKey = date.toISOString().split('T')[0];
    
    if (roomStatusMap[dateKey]) {
      const statusList = roomStatusMap[dateKey];
      const roomStatus = statusList.find(s => s.roomId === roomId);
      if (roomStatus) {
        return roomStatus;
      }
    }
    
    const reservation = reservationsData.find(res => {
      if (!res.roomIds || !res.roomIds.includes(roomId)) return false;
      
      const checkIn = new Date(res.checkInDate);
      const checkOut = new Date(res.checkOutDate);
      
      return date >= checkIn && date < checkOut;
    });
    
    if (reservation) {
      return {
        roomId,
        status: reservation.status,
        reservationId: reservation.reservationId,
        guestId: reservation.guestId,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate
      };
    }
    
    return null;
  };

  const getRoomStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    switch(normalizedStatus) {
      case 'available':
      case 'vacant': 
        return theme.colors.statusAvailable;
      case 'occupied':
      case 'checked_in': 
      case 'booked':
        return theme.colors.statusOccupied;
      case 'checkout': 
      case 'check-out':
      case 'checked_out':
      case 'departing':
        return theme.colors.statusCheckOut;
      case 'checkin': 
      case 'check-in':
      case 'confirmed':
      case 'arriving':
      case 'reserved':
        return theme.colors.statusConfirmed;
      case 'pending':
        return theme.colors.statusPending;
      case 'cancelled':
        return theme.colors.statusCancelled;
      case 'maintenance': 
      case 'out-of-order':
        return theme.colors.statusCancelled;
      case 'dirty': 
      case 'cleaning':
        return theme.colors.statusPending;
      default: 
        return theme.colors.textTertiary;
    }
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'available';
    const labels = {
      'available': 'Avail',
      'vacant': 'Avail',
      'occupied': 'Occup',
      'checked_in': 'In',
      'checked_out': 'Out',
      'booked': 'Booked',
      'checkout': 'C/O',
      'check-out': 'C/O',
      'departing': 'C/O',
      'checkin': 'C/I',
      'check-in': 'C/I',
      'confirmed': 'Conf',
      'arriving': 'Arriv',
      'reserved': 'Resv',
      'pending': 'Pend',
      'cancelled': 'Cncl',
      'maintenance': 'Maint',
      'out-of-order': 'OOO',
      'dirty': 'Dirty',
      'cleaning': 'Clean'
    };
    return labels[normalizedStatus] || status?.substring(0, 5) || 'N/A';
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

  const handleAddBooking = useCallback((room = null, dates = []) => {
    setSelectedRoom(room);
    setSelectedDates(Array.isArray(dates) ? dates : []);
    setIsMultiDay(Array.isArray(dates) && dates.length > 1);
    setShowBookingModal(true);
  }, []);

  const handleCellClick = useCallback((room, day, roomStatus) => {
    if (roomStatus && roomStatus.reservationId) {
      const reservation = reservationsData.find(r => r.reservationId === roomStatus.reservationId);
      if (reservation) {
        setSelectedReservation(reservation);
        setSelectedRoomForDetails(room);
        setShowReservationDetails(true);
        return;
      }
    }
    
    const cellDate = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    cellDate.setHours(0, 0, 0, 0);
    
    if (cellDate < today) {
      return;
    }
    
    if (!room.status || room.status.toLowerCase() !== 'available') return;
    if (roomStatus && roomStatus.status !== 'AVAILABLE') return;

    const clickedDate = new Date(selectedYear, selectedMonth, day);
    
    if (!isSelecting) {
      setSelectionStart({ room, day });
      setSelectedDates([clickedDate]);
      setSelectedRoom(room);
      setIsSelecting(true);
      setIsMultiDay(false);
    }
  }, [selectedYear, selectedMonth, isSelecting, reservationsData]);

  const handleCellMouseEnter = useCallback((room, day, roomStatus) => {
    const cellDate = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    cellDate.setHours(0, 0, 0, 0);
    
    if (cellDate < today) {
      return;
    }
    
    if (!isSelecting || !selectionStart || room.id !== selectionStart.room.id) return;
    if (!room.status || room.status.toLowerCase() !== 'available') return;
    if (roomStatus && roomStatus.status !== 'AVAILABLE') return;

    const startDay = Math.min(selectionStart.day, day);
    const endDay = Math.max(selectionStart.day, day);
    
    const dates = [];
    for (let d = startDay; d <= endDay; d++) {
      const date = new Date(selectedYear, selectedMonth, d);
      date.setHours(0, 0, 0, 0);
      if (date >= today) {
        dates.push(date);
      }
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
  }, [isSelecting, selectedDates, selectedRoom, handleAddBooking]);

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

  const handleBookingCreated = () => {
    fetchRoomStatusForMonth();
  };

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

  return (
    <>
      {initialLoad && (
        <div className="loading-screen" style={{ opacity: loading ? 1 : 0, pointerEvents: loading ? 'all' : 'none' }}>
          <div className="loading-content">
            <div className="spinner spinner-large"></div>
            <div className="loading-text">Loading Front Desk...</div>
          </div>
        </div>
      )}
      
      <div 
        className="receptionist-dashboard dashboard-container" 
        style={{ opacity: initialLoad ? 0 : 1, transition: 'opacity 0.3s ease-in', userSelect: isResizing ? 'none' : 'auto' }} 
        onMouseUp={handleMouseUp}
      >
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 className="dashboard-title">Front Desk</h1>
            <span className="dashboard-breadcrumb">Home / Front Desk</span>
          </div>
          <div className="header-actions">
            <button 
              className="btn-secondary" 
              onClick={fetchRoomStatusForMonth}
            >
              <Refresh fontSize="small" />
              Refresh
            </button>
            <button 
              className="btn-primary" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddBooking();
              }}
            >
              <Add fontSize="small" />
              Add Booking
            </button>
          </div>
        </div>

        <div className="controls-container">
          <div className="year-tabs">
            {years.map(year => (
              <button
                key={year}
                className={`year-tab ${year === selectedYear ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <div className="month-tabs">
                {months.map((monthName, index) => (
                  <button
                    key={index}
                    className={`month-tab ${index === selectedMonth ? 'active' : ''}`}
                    onClick={() => setSelectedMonth(index)}
                  >
                    {monthName}
                  </button>
                ))}
              </div>
            </div>

            <div className="controls-wrapper">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search rooms"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select className="select-input" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                <option value="">All Floors</option>
                {uniqueFloors.map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>

              <select className="select-input" value={selectedRoomType} onChange={(e) => setSelectedRoomType(e.target.value)}>
                <option value="">All Types</option>
                {uniqueRoomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select className="select-input" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Statuses</option>
                {roomStatuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>

              <div className="nav-controls">
                <button className="nav-button" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft fontSize="small" />
                </button>
                <button className="nav-button" onClick={() => navigateMonth('next')}>
                  <ChevronRight fontSize="small" />
                </button>
              </div>

              <div className="zoom-controls">
                <button className="zoom-button" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                  <ZoomOut fontSize="small" />
                </button>
                <div className="zoom-level" onClick={resetZoom}>
                  {zoomLevel}%
                </div>
                <button className="zoom-button" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                  <ZoomIn fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          {(isSelecting || selectedDates.length > 0) && (
            <div className="selection-controls">
              <span style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '500' }}>
                {isSelecting 
                  ? `Selecting dates... (${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''})`
                  : `${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''} selected for Room ${selectedRoom?.roomNumber}`
                }
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" onClick={handleClearSelection} style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Clear
                </button>
                {!isSelecting && selectedDates.length > 0 && (
                  <button
                    className="btn-primary"
                    onClick={() => handleAddBooking(selectedRoom, selectedDates)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Book Selected Dates
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ margin: '24px 32px', padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: '12px' }}>
            <div className="spinner"></div>
            <div style={{ marginTop: '16px', color: theme.colors.textSecondary, fontSize: '13px' }}>
              Loading rooms...
            </div>
          </div>
        ) : (
          <div className="calendar-wrapper">
            <div 
              ref={containerRef} 
              className="calendar-container"
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left'
              }}
            >
              <div className="calendar-header">
                <div className="room-column" style={{ width: `${roomColumnWidth}px`, minWidth: `${roomColumnWidth}px` }}>
                  <span>Rooms</span>
                  <div className="resize-handle" onMouseDown={handleMouseDown}>
                    <DragIndicator style={{ fontSize: '14px', color: '#999' }} />
                  </div>
                </div>
                {getCurrentMonthDays().map(day => {
                  const { dayName } = getDateInfo(day);
                  const isCurrent = isCurrentDate(day);
                  return (
                    <div
                      key={day}
                      className={`day-column ${isCurrent ? 'current' : ''}`}
                      style={{ minWidth: `${dayColumnWidth}px`, width: `${dayColumnWidth}px` }}
                    >
                      <div style={{ fontSize: '10px' }}>{dayName}</div>
                      <div style={{ fontSize: '11px' }}>{day}</div>
                    </div>
                  );
                })}
              </div>

              {Object.entries(groupedRooms).map(([roomType, roomsOfType]) => (
                <div key={roomType}>
                  <div className="room-type-row">
                    <div 
                      className="room-type-header"
                      style={{ width: `${roomColumnWidth}px`, minWidth: `${roomColumnWidth}px` }}
                      onClick={() => toggleRoomType(roomType)}
                    >
                      <ExpandMore 
                        style={{ 
                          transform: expandedRoomTypes[roomType] ? 'rotate(0deg)' : 'rotate(-90deg)',
                          fontSize: '18px',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                      {roomType} ({roomsOfType.length})
                    </div>
                    {getCurrentMonthDays().map(day => (
                      <div key={day} className="day-cell" style={{ minWidth: `${dayColumnWidth}px`, width: `${dayColumnWidth}px` }}></div>
                    ))}
                  </div>

                  {expandedRoomTypes[roomType] && roomsOfType.map(room => (
                    <div key={room.id} className="room-row">
                      <div className="room-cell" style={{ width: `${roomColumnWidth}px`, minWidth: `${roomColumnWidth}px` }}>
                        <div
                          className="status-indicator"
                          style={{ backgroundColor: getRoomStatusColor(room.status) }}
                        ></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '500', fontSize: '13px', color: theme.colors.textPrimary }}>
                            Room {room.roomNumber}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {room.capacity} guests • ${room.pricePerNight}/nt • Floor {room.floor}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.colors.textTertiary }}>
                            {room.status || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      {getCurrentMonthDays().map(day => {
                        const isSelected = isDateSelected(room, day);
                        const roomStatus = getRoomStatusForDate(room.id, day);
                        const hasReservation = roomStatus && roomStatus.reservationId;
                        const statusColor = roomStatus ? getRoomStatusColor(roomStatus.status) : null;
                        const statusLabel = roomStatus ? getStatusLabel(roomStatus.status) : null;
                        
                        const cellDate = new Date(selectedYear, selectedMonth, day);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        cellDate.setHours(0, 0, 0, 0);
                        const isPastDate = cellDate < today;
                        
                        const isAvailableForBooking = !isPastDate && 
                                                       room.status?.toLowerCase() === 'available' && 
                                                       !roomStatus;
                        
                        return (
                          <div 
                            key={day} 
                            className={`day-cell ${isSelected ? 'selected' : ''} ${isPastDate ? 'past' : ''} ${(day % 7 === 0 || (day + 6) % 7 === 0) && !isSelected && !hasReservation && !isPastDate ? 'weekend' : ''}`}
                            style={{
                              minWidth: `${dayColumnWidth}px`,
                              width: `${dayColumnWidth}px`,
                              backgroundColor: isSelected 
                                ? theme.colors.primaryLight
                                : hasReservation
                                  ? statusColor
                                  : isPastDate
                                    ? theme.colors.borderLight
                                    : '',
                              cursor: isPastDate 
                                ? 'not-allowed' 
                                : hasReservation 
                                  ? 'pointer' 
                                  : (room.status?.toLowerCase() === 'available' ? 'crosshair' : 'not-allowed'),
                              border: isSelected ? `1px solid ${theme.colors.primaryHover}` : '',
                              opacity: isPastDate ? 0.5 : 1,
                              position: 'relative'
                            }}
                            onClick={() => handleCellClick(room, day, roomStatus)}
                            onMouseEnter={() => {
                              if (!isPastDate && isAvailableForBooking) {
                                handleCellMouseEnter(room, day, roomStatus);
                              }
                            }}
                            title={isPastDate 
                              ? 'Past date - cannot create new reservations' 
                              : hasReservation 
                                ? `Reservation #${roomStatus.reservationId} - Click for details` 
                                : ''}
                          >
                            {isPastDate && !hasReservation && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '18px',
                                color: theme.colors.textTertiary,
                                fontWeight: '300'
                              }}>
                                ×
                              </div>
                            )}
                            {hasReservation && (
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
                                flexDirection: 'column',
                                gap: '2px'
                              }}>
                                <span>{statusLabel}</span>
                                {roomStatus.reservationId && (
                                  <Info style={{ fontSize: '12px', opacity: 0.8 }} />
                                )}
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
                  color: theme.colors.textSecondary,
                  backgroundColor: '#fff',
                  fontSize: '13px'
                }}>
                  {rooms.length === 0 ? 'No rooms available. Please check your API connection.' : 'No rooms found matching your filters.'}
                  {rooms.length === 0 && (
                    <button onClick={fetchRooms} className="btn-primary" style={{ marginTop: '16px' }}>
                      Retry
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="status-legend">
              <h3 className="legend-title">Room Status Legend</h3>
              <div className="legend-items">
                {[
                  { status: 'available', label: 'Available', color: theme.colors.statusAvailable },
                  { status: 'confirmed', label: 'Confirmed', color: theme.colors.statusConfirmed },
                  { status: 'checked_in', label: 'Checked In', color: theme.colors.statusOccupied },
                  { status: 'checked_out', label: 'Checked Out', color: theme.colors.statusCheckOut },
                  { status: 'pending', label: 'Pending', color: theme.colors.statusPending },
                  { status: 'cancelled', label: 'Cancelled', color: theme.colors.statusCancelled }
                ].map(({ status, label, color }) => (
                  <div key={status} className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: color }}></div>
                    <span className="legend-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button className="today-button" onClick={goToToday}>
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
          onBookingCreated={handleBookingCreated}
        />

        <ReservationDetailsModal
          isOpen={showReservationDetails}
          onClose={() => {
            setShowReservationDetails(false);
            setSelectedReservation(null);
            setSelectedRoomForDetails(null);
          }}
          reservation={selectedReservation}
          roomDetails={selectedRoomForDetails}
        />

        {error && (
          <div className="error-toast">
            <div style={{ flex: 1 }}>{error}</div>
            <button onClick={() => setError(null)} className="error-close">
              ×
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ReceptionistDashboard;