import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';
import {
  getAllReservations,
  createReservation as createReservationAPI,
  checkInReservation,
  checkOutReservation,
  updateReservationStatus as updateReservationStatusAPI,
  getArrivals,
  getDepartures,
  getDailySummary,
  getRoomStatusForDate,
  searchReservations as searchReservationsAPI
} from '../api/reservation';
import { getAllRooms } from '../api/room';
import { updateFilterCriteria, clearFilter, getAllGuestSelections } from '../api/roomFilter';
import theme from '../styles/theme';
import '../styles/reservations.css';
import '../styles/modals.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// QR Scanner Modal (same as before - no changes needed)
const QRScannerModal = ({ isOpen, onClose, onGuestScanned }) => {
  const [result, setResult] = useState('');
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
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
        throw new Error('This guest is not registered in the system. Please ask the guest to register first or contact IT support.');
      }

      const data = await response.json();
      setGuestData(data);
      stopCamera();
    } catch (err) {
      setError(err.message || 'Could not find guest information. Please try scanning again or enter details manually.');
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
            
            setTimeout(() => {
              fetchGuestData(qrValue.trim());
            }, 500);
          }
          if (err && err.name !== 'NotFoundException' && err.name !== 'NotFoundException2') {
            const nowTs = Date.now();
            if (!codeReaderRef.current.__lastErrorLogTs || nowTs - codeReaderRef.current.__lastErrorLogTs > 1000) {
              console.error('QR scan error:', err);
              codeReaderRef.current.__lastErrorLogTs = nowTs;
            }
          }
        }
      );
    } catch (err) {
      setCameraError('Cannot access camera. Please allow camera permission in your browser or try a different browser.');
      console.error('Camera access error:', err);
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
        setLoading(false);
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
            <X size={24} />
          </button>
        </div>

        {!guestData && (
          <div className="modal-body">
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline muted className="video-preview" />
              {result && (
                <div className="qr-result">
                  <CheckCircle size={16} />
                  <span>QR Code Scanned Successfully</span>
                </div>
              )}
              <div className="video-controls">
                {!scanning ? (
                  <button onClick={startCamera} className="btn-primary">
                    <Camera size={18} /> Start Camera
                  </button>
                ) : (
                  <button onClick={stopCamera} className="btn-secondary">
                    Stop Camera
                  </button>
                )}
              </div>
            </div>
            {cameraError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Camera Not Working</div>
                  <div style={{ color: theme.colors.textSecondary }}>{cameraError}</div>
                </div>
              </div>
            )}
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Guest Not Found</div>
                  <div style={{ color: theme.colors.textSecondary }}>{error}</div>
                </div>
              </div>
            )}
            {loading && (
              <div className="modal-loading">Searching for guest information...</div>
            )}
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
                  <span className="guest-info-value">{guestData.guestId}</span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">Name:</span>
                  <span className="guest-info-value">{guestData.fullName}</span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">Email:</span>
                  <span className="guest-info-value">{guestData.email}</span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">Phone:</span>
                  <span className="guest-info-value">{guestData.phone}</span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">Nationality:</span>
                  <span className="guest-info-value">{guestData.nationality}</span>
                </div>
                <div className="guest-info-item">
                  <span className="guest-info-label">{guestData.identityType}:</span>
                  <span className="guest-info-value">{guestData.identityNumber}</span>
                </div>
              </div>
            </div>
            <div className="modal-button-section">
              <button onClick={() => onGuestScanned(guestData)} className="use-guest-button">
                Use This Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const Reservations = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null);
  const filterUpdateTimeoutRef = useRef(null);
  const [guestSelection, setGuestSelection] = useState(null);
  const guestSelectionTimerRef = useRef(null);
  const [roomSelectionSource, setRoomSelectionSource] = useState(null);

  const [reservationData, setReservationData] = useState({
    guestId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    roomType: '',
    roomId: '',
    adults: 1,
    kids: 0,
    mealPlan: 'Room Only',
    amenities: '',
    specialRequests: '',
    additionalNotes: '',
    status: 'PENDING'
  });

  const [searchData, setSearchData] = useState({
    searchBy: 'guestId',
    searchValue: ''
  });

  const [reservations, setReservations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [availableRoomsByType, setAvailableRoomsByType] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [todayArrivals, setTodayArrivals] = useState([]);
  const [todayDepartures, setTodayDepartures] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [roomStatusLoading, setRoomStatusLoading] = useState(false);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [guestFilter, setGuestFilter] = useState(null);

  const syncFilterToTablet = useCallback(async (filterData) => {
    try {
      console.log('Syncing filter to tablet:', filterData);
      await updateFilterCriteria(filterData);
    } catch (error) {
      console.error('Failed to sync filter to tablet:', error);
    }
  }, []);

  const clearTabletFilter = useCallback(async () => {
    try {
      console.log('Clearing tablet filter');
      await clearFilter();
    } catch (error) {
      console.error('Failed to clear tablet filter:', error);
    }
  }, []);

  useEffect(() => {
    if (filterUpdateTimeoutRef.current) {
      clearTimeout(filterUpdateTimeoutRef.current);
    }

    if (reservationData.checkInDate && reservationData.checkOutDate) {
      filterUpdateTimeoutRef.current = setTimeout(() => {
        const filterData = {
          checkInDate: reservationData.checkInDate,
          checkOutDate: reservationData.checkOutDate,
          roomType: reservationData.roomType || null,
          guestId: reservationData.guestId ? parseInt(reservationData.guestId.replace(/\D/g, '')) : null,
          active: true
        };
        
        console.log('Syncing filter with room type:', reservationData.roomType);
        syncFilterToTablet(filterData);
      }, 500);
    }

    return () => {
      if (filterUpdateTimeoutRef.current) {
        clearTimeout(filterUpdateTimeoutRef.current);
      }
    };
  }, [reservationData.checkInDate, reservationData.checkOutDate, reservationData.roomType, reservationData.guestId, syncFilterToTablet]);

  useEffect(() => {
    if (activeTab !== 'create') {
      clearTabletFilter();
      if (guestSelectionTimerRef.current) {
        clearInterval(guestSelectionTimerRef.current);
      }
    }

    return () => {
      clearTabletFilter();
    };
  }, [activeTab, clearTabletFilter]);

  // Poll for guest selections
  useEffect(() => {
    if (activeTab === 'create' && reservationData.checkInDate && reservationData.checkOutDate && reservationData.roomType) {
      guestSelectionTimerRef.current = setInterval(async () => {
        try {
          const selections = await getAllGuestSelections();
          const selectionsArray = Object.values(selections);
          if (selectionsArray.length > 0) {
            const latest = selectionsArray.sort((a, b) => b.timestamp - a.timestamp)[0];
            
            // Only show if room is in current filtered set
            const roomsOfType = availableRoomsByType[reservationData.roomType] || [];
            const roomExists = roomsOfType.find(r => r.id === latest.roomId);
            
            if (roomExists && (!guestSelection || guestSelection.timestamp < latest.timestamp)) {
              setGuestSelection(latest);
            }
          }
        } catch (error) {
          console.error('Error polling guest selections:', error);
        }
      }, 2000);
    } else {
      if (guestSelectionTimerRef.current) {
        clearInterval(guestSelectionTimerRef.current);
      }
    }

    return () => {
      if (guestSelectionTimerRef.current) {
        clearInterval(guestSelectionTimerRef.current);
      }
    };
  }, [activeTab, reservationData.checkInDate, reservationData.checkOutDate, reservationData.roomType, availableRoomsByType, guestSelection]);

  useEffect(() => {
    if (activeTab !== 'manage') {
      setFilteredReservations([]);
      setGuestFilter(null);
    }
    
    if (activeTab === 'manage') {
      fetchAllReservations();
    } else if (activeTab === 'checkin') {
      loadCheckInData();
    }
  }, [activeTab]);

  const fetchAvailableRoomsByType = useCallback(async (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) {
      setAvailableRoomsByType({});
      setRoomTypes([]);
      return;
    }

    try {
      setRoomStatusLoading(true);
      
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
          const dailyStatus = await getRoomStatusForDate(dateStr);
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
        const roomId = room.id;
        return !unavailableRoomIds.has(roomId);
      });
      
      const roomsByType = {};
      const uniqueTypes = new Set();
      
      trulyAvailableRooms.forEach(room => {
        const roomType = room.type || 'Standard';
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
      alert(`Failed to check room availability: ${error.message}`);
      setAvailableRoomsByType({});
      setRoomTypes([]);
    } finally {
      setRoomStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reservationData.checkInDate && reservationData.checkOutDate) {
      fetchAvailableRoomsByType(reservationData.checkInDate, reservationData.checkOutDate);
    } else {
      setAvailableRoomsByType({});
      setRoomTypes([]);
    }
  }, [reservationData.checkInDate, reservationData.checkOutDate, fetchAvailableRoomsByType]);

  const loadCheckInData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [arrivals, departures, summary] = await Promise.all([
        getArrivals(today),
        getDepartures(today),
        getDailySummary(today)
      ]);
      
      setTodayArrivals(arrivals);
      setTodayDepartures(departures);
      setDailySummary(summary);
    } catch (error) {
      console.error('Error loading check-in data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (data) => {
    if (!data.guestId || !data.checkInDate || !data.checkOutDate || !data.roomType || !data.roomId) {
      alert('Please fill in all required fields: Guest, Check-in, Check-out, Room Type, and Room Number');
      return;
    }

    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Verifying guest exists:', data.guestId);
      const guestResponse = await fetch(`${API_BASE_URL}/api/v1/guests/${data.guestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      
      if (!guestResponse.ok) {
        const errorText = await guestResponse.text();
        throw new Error(`Guest not found: ${data.guestId}. Please scan a valid guest QR code. Error: ${errorText}`);
      }

      const guestInfo = await guestResponse.json();
      console.log('Guest verified:', guestInfo);

      const selectedRoomId = parseInt(data.roomId);
      const roomsOfType = availableRoomsByType[data.roomType] || [];
      const roomExists = roomsOfType.find(room => room.id === selectedRoomId);
      
      if (!roomExists) {
        throw new Error(`Room validation failed: Room is not available for the selected dates.`);
      }

      const reservationPayload = {
        guestId: data.guestId,
        roomIds: [selectedRoomId],
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        status: data.status || 'PENDING',
        adults: data.adults || 1,
        kids: data.kids || 0,
        mealPlan: data.mealPlan || 'Room Only',
        amenities: data.amenities || '',
        specialRequests: data.specialRequests || '',
        additionalNotes: data.additionalNotes || ''
      };

      console.log('Creating reservation with payload:', {
        ...reservationPayload,
        checkInDate: new Date(reservationPayload.checkInDate).toISOString(),
        checkOutDate: new Date(reservationPayload.checkOutDate).toISOString()
      });
      const newReservation = await createReservationAPI(reservationPayload);
      
      await clearTabletFilter();
      
      alert(`Reservation created successfully!\n\nReservation ID: ${newReservation.reservationId}\nGuest: ${data.guestName}\nGuest ID: ${data.guestId}\nRoom Type: ${data.roomType}\nRoom Number: ${roomExists.roomNumber}`);
      
      setReservationData({
        guestId: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkInDate: '',
        checkOutDate: '',
        roomType: '',
        roomId: '',
        adults: 1,
        kids: 0,
        mealPlan: 'Room Only',
        amenities: '',
        specialRequests: '',
        additionalNotes: '',
        status: 'PENDING'
      });
      setAvailableRoomsByType({});
      setRoomTypes([]);
      setGuestSelection(null);
      setRoomSelectionSource(null);
      
    } catch (error) {
      console.error('Create reservation error:', error);
      alert(`Failed to create reservation:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      const data = await getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const searchReservations = async () => {
    if (!searchData.searchValue.trim()) {
      alert('Please enter a search value');
      return;
    }

    try {
      setLoading(true);
      const criteria = { [searchData.searchBy]: searchData.searchValue };
      const results = await searchReservationsAPI(criteria);
      setSearchResults(results);
      
      if (results.length === 0) {
        alert('No reservations found');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservationId) => {
    if (!window.confirm('Confirm check-in for this reservation?')) return;
    
    try {
      setLoading(true);
      await checkInReservation(reservationId);
      alert('Guest checked in successfully!');
      loadCheckInData();
    } catch (error) {
      console.error('Check-in error:', error);
      alert(`${error.message || 'Failed to check in'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (reservationId) => {
    if (!window.confirm('Confirm check-out for this reservation?')) return;
    
    try {
      setLoading(true);
      await checkOutReservation(reservationId);
      alert('Guest checked out successfully!');
      loadCheckInData();
    } catch (error) {
      console.error('Check-out error:', error);
      alert(`${error.message || 'Failed to check out'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      setLoading(true);
      await updateReservationStatusAPI(reservationId, newStatus);
      alert('Status updated successfully');
      fetchAllReservations();
    } catch (error) {
      console.error('Update error:', error);
      alert(`${error.message || 'Failed to update status'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestScanned = async (guestData) => {
    const guestId = guestData.guestId || guestData.id;
    
    if (scannerTarget === 'create') {
      const newGuestData = {
        guestId: guestId,
        guestName: guestData.fullName || guestData.name,
        guestEmail: guestData.email,
        guestPhone: guestData.phone
      };
      
      setReservationData(prevData => ({
        ...prevData,
        ...newGuestData
      }));
      
      setTimeout(() => {
        setShowScanner(false);
        setScannerTarget(null);
        alert(`Guest loaded: ${newGuestData.guestName}\nGuest ID: ${guestId}`);
      }, 100);
      
    } else if (scannerTarget === 'search') {
      setSearchData({
        searchBy: 'guestId',
        searchValue: guestId
      });
      
      setShowScanner(false);
      setScannerTarget(null);
      
      try {
        setLoading(true);
        const criteria = { guestId: guestId };
        const results = await searchReservationsAPI(criteria);
        setSearchResults(results);
        
        if (results.length === 0) {
          alert(`No reservations found for guest: ${guestData.fullName || guestData.name} (ID: ${guestId})`);
        } else {
          alert(`Found ${results.length} reservation(s) for guest: ${guestData.fullName || guestData.name}`);
        }
      } catch (error) {
        console.error('Search error:', error);
        alert('Failed to search reservations for this guest');
      } finally {
        setLoading(false);
      }
      
    } else if (scannerTarget === 'manage') {
      setShowScanner(false);
      setScannerTarget(null);
      
      const guestReservations = reservations.filter(r => r.guestId === guestId);
      
      if (guestReservations.length === 0) {
        alert(`No reservations found for guest: ${guestData.fullName || guestData.name} (ID: ${guestId})`);
      } else {
        alert(`Showing ${guestReservations.length} reservation(s) for guest: ${guestData.fullName || guestData.name}`);
        setFilteredReservations(guestReservations);
        setGuestFilter(guestId);
      }
      
    } else if (scannerTarget === 'checkin') {
      const reservation = todayArrivals.find(r => r.guestId === guestId);
      
      setShowScanner(false);
      setScannerTarget(null);
      
      if (reservation) {
        await handleCheckIn(reservation.reservationId);
      } else {
        alert('No arrival found for this guest today');
      }
    }
  };

  const openScanner = (target) => {
    setScannerTarget(target);
    setShowScanner(true);
  };

  const handleCancelForm = async () => {
    if (window.confirm('Cancel reservation form? Filter will be cleared on tablet.')) {
      await clearTabletFilter();
      setReservationData({
        guestId: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkInDate: '',
        checkOutDate: '',
        roomType: '',
        roomId: '',
        adults: 1,
        kids: 0,
        mealPlan: 'Room Only',
        amenities: '',
        specialRequests: '',
        additionalNotes: '',
        status: 'PENDING'
      });
      setAvailableRoomsByType({});
      setRoomTypes([]);
      setGuestSelection(null);
      setRoomSelectionSource(null);
    }
  };

  const handleGuestRoomSelection = (selectionData) => {
    const room = availableRoomsByType[reservationData.roomType]?.find(r => r.id === selectionData.roomId);
    if (room) {
      setReservationData(prev => ({
        ...prev,
        roomId: room.id.toString()
      }));
      setRoomSelectionSource('guest');
      setGuestSelection(null);
    }
  };

  return (
    <div className="reservations-container">
      <div className="reservations-wrapper">
        
        <QRScannerModal 
          isOpen={showScanner}
          onClose={() => {
            setShowScanner(false);
            setScannerTarget(null);
          }}
          onGuestScanned={handleGuestScanned}
        />

        <div className="reservations-header">
          <h1 className="reservations-title">Reservations</h1>
          <p className="reservations-subtitle">Manage bookings and check-ins</p>
        </div>

        <div className="reservations-tabs">
          {[
            { key: 'create', label: 'Create' },
            { key: 'search', label: 'Search' },
            { key: 'manage', label: 'Manage' },
            { key: 'checkin', label: 'Front Desk' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`reservations-tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'create' && (
          <div>
            <h2 className="section-title">Create New Reservation</h2>
            
            <div className="tablet-sync-indicator" style={{
              padding: '12px 16px',
              background: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignments: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#2e7d32'
            }}>
              <div>
                <strong>Tablet Sync Active</strong>
                <div style={{ fontSize: '12px', marginTop: '2px' }}>
                  Guest can browse and select rooms on tablet
                </div>
              </div>
            </div>

            {guestSelection && (
              <div style={{
                padding: '16px',
                background: '#fff3cd',
                border: '2px solid #ffc107',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#856404', fontSize: '16px' }}>Guest Selected a Room!</strong>
                  <div style={{ fontSize: '13px', marginTop: '6px', color: '#856404' }}>
                    Room #{availableRoomsByType[reservationData.roomType]?.find(r => r.id === guestSelection.roomId)?.roomNumber || guestSelection.roomId}
                    {' • '}Selected at {new Date(guestSelection.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => handleGuestRoomSelection(guestSelection)}
                  style={{
                    padding: '10px 20px',
                    background: '#ffc107',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffffff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Accept Selection
                </button>
                <button
                  onClick={() => setGuestSelection(null)}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: '1px solid #856404',
                    borderRadius: '6px',
                    color: '#856404',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <div className="guest-info-box">
              <div className="guest-info-box-content">
                <div className="guest-info-box-details">
                  <div className="guest-info-box-label">GUEST INFORMATION</div>
                  {reservationData.guestId ? (
                    <div className="guest-info-box-data">
                      <div className="guest-info-box-item">
                        <span className="guest-info-box-item-label">ID:</span>
                        <span className="guest-info-box-item-value">{reservationData.guestId}</span>
                      </div>
                      <div className="guest-info-box-item">
                        <span className="guest-info-box-item-label">Name:</span>
                        <span className="guest-info-box-item-value">{reservationData.guestName}</span>
                      </div>
                      <div className="guest-info-box-item">
                        <span className="guest-info-box-item-label">Email:</span>
                        <span className="guest-info-box-item-value">{reservationData.guestEmail}</span>
                      </div>
                      <div className="guest-info-box-item">
                        <span className="guest-info-box-item-label">Phone:</span>
                        <span className="guest-info-box-item-value">{reservationData.guestPhone}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="guest-info-box-empty">
                      No guest scanned yet. Click "Scan QR" button →
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openScanner('create')}
                  className={`guest-scan-btn ${reservationData.guestId ? 'secondary' : 'primary'}`}
                >
                  <Camera size={16} /> {reservationData.guestId ? 'Scan Different Guest' : 'Scan Guest QR'}
                </button>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">CHECK-IN DATE *</label>
                <input
                  type="date"
                  value={reservationData.checkInDate}
                  onChange={(e) => setReservationData({...reservationData, checkInDate: e.target.value, roomType: '', roomId: ''})}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="form-label">CHECK-OUT DATE *</label>
                <input
                  type="date"
                  value={reservationData.checkOutDate}
                  onChange={(e) => setReservationData({...reservationData, checkOutDate: e.target.value, roomType: '', roomId: ''})}
                  className="form-input"
                  min={reservationData.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-field-wrapper">
              <label className="form-label">
                ROOM TYPE * 
                {roomStatusLoading && ' (Checking availability...)'}
                {!roomStatusLoading && roomTypes.length > 0 && ` (${roomTypes.length} types available)`}
              </label>
              <select
                value={reservationData.roomType}
                onChange={(e) => {
                  setReservationData({...reservationData, roomType: e.target.value, roomId: ''});
                  setRoomSelectionSource(null);
                  setGuestSelection(null);
                }}
                className="form-select"
                disabled={roomStatusLoading || roomTypes.length === 0}
              >
                <option value="">
                  {roomStatusLoading 
                    ? 'Checking room availability...'
                    : roomTypes.length === 0 
                      ? (reservationData.checkInDate && reservationData.checkOutDate 
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
            </div>

            {reservationData.roomType && availableRoomsByType[reservationData.roomType] && (
              <div className="form-field-wrapper">
                <label className="form-label">
                  SELECT SPECIFIC ROOM *
                  {roomSelectionSource === 'guest' && (
                    <span style={{ marginLeft: '8px', color: '#ffc107', fontSize: '12px', fontWeight: 'bold' }}>
                       Guest Selected
                    </span>
                  )}
                </label>
                <select
                  value={reservationData.roomId}
                  onChange={(e) => {
                    setReservationData({...reservationData, roomId: e.target.value});
                    setRoomSelectionSource('manual');
                  }}
                  className="form-select"
                  style={roomSelectionSource === 'guest' ? {
                    borderColor: '#ffc107',
                    borderWidth: '2px',
                    background: '#fffbf0'
                  } : {}}
                >
                  <option value="">Choose a room number...</option>
                  {availableRoomsByType[reservationData.roomType].map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - Floor {room.floorNumber || 'N/A'} - {room.viewType || 'Standard View'} - ${room.pricePerNight}/night
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                   Guest can browse these rooms on tablet and select their preference
                </div>
              </div>
            )}

            <div className="form-grid-3">
              <div>
                <label className="form-label">MEAL PLAN</label>
                <select
                  value={reservationData.mealPlan}
                  onChange={(e) => setReservationData({...reservationData, mealPlan: e.target.value})}
                  className="form-select"
                >
                  <option value="Room Only">Room Only</option>
                  <option value="Bed & Breakfast">Bed & Breakfast</option>
                  <option value="Half Board">Half Board</option>
                  <option value="Full Board">Full Board</option>
                  <option value="All Inclusive">All Inclusive</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">ADULTS</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={reservationData.adults}
                  onChange={(e) => setReservationData({...reservationData, adults: parseInt(e.target.value)})}
                  className="form-input form-input-small"
                />
              </div>

              <div>
                <label className="form-label">KIDS</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={reservationData.kids}
                  onChange={(e) => setReservationData({...reservationData, kids: parseInt(e.target.value)})}
                  className="form-input form-input-small"
                />
              </div>
            </div>

            <div className="form-field-wrapper">
              <label className="form-label">AMENITIES</label>
              <input
                type="text"
                value={reservationData.amenities}
                onChange={(e) => setReservationData({...reservationData, amenities: e.target.value})}
                className="form-input"
                placeholder="e.g., Wifi, Breakfast, Airport Pickup"
              />
            </div>

            <div className="form-field-wrapper">
              <label className="form-label">SPECIAL REQUESTS</label>
              <textarea
                value={reservationData.specialRequests}
                onChange={(e) => setReservationData({...reservationData, specialRequests: e.target.value})}
                className="form-textarea"
                rows="3"
                placeholder="Any special requirements..."
              />
            </div>

            <div className="form-field-wrapper">
              <label className="form-label">ADDITIONAL NOTES (Internal)</label>
              <textarea
                value={reservationData.additionalNotes}
                onChange={(e) => setReservationData({...reservationData, additionalNotes: e.target.value})}
                className="form-textarea"
                rows="2"
                placeholder="Internal notes..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleCancelForm}
                className="submit-button"
                style={{ background: '#8b8680', flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={() => createReservation(reservationData)}
                disabled={loading || !reservationData.guestId || !reservationData.checkInDate || !reservationData.checkOutDate || !reservationData.roomType || !reservationData.roomId}
                className="submit-button primary"
                style={{ flex: 2 }}
              >
                {loading ? (
                  <>Creating Reservation...</>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Create Reservation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search, Manage, and Check-in tabs remain the same */}
        {activeTab === 'search' && (
          <div>
            <h2 className="section-title">Search Reservations</h2>
            <div className="qr-scan-section">
              <div className="qr-scan-icon">
                <Camera size={32} />
              </div>
              <h3 className="qr-scan-title">Quick Guest Search</h3>
              <p className="qr-scan-description">Scan guest QR code to find their reservations</p>
              <button onClick={() => openScanner('search')} className="qr-scan-btn">
                <Camera size={18} />
                Scan Guest QR
              </button>
            </div>
            <div className="search-divider"><span>OR</span></div>
            <div className="search-grid">
              <select
                value={searchData.searchBy}
                onChange={(e) => {
                  const next = e.target.value;
                  setSearchData(prev => ({
                    ...prev,
                    searchBy: next,
                    searchValue: next.includes('Date') ? '' : prev.searchValue
                  }));
                }}
                className="form-select"
              >
                <option value="guestId">Guest ID</option>
                <option value="status">Status</option>
                <option value="checkInDate">Check-in Date</option>
                <option value="checkOutDate">Check-out Date</option>
              </select>
              <input
                type={searchData.searchBy.includes('Date') ? 'date' : 'text'}
                value={searchData.searchValue}
                onChange={(e) => setSearchData({...searchData, searchValue: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && searchReservations()}
                className="form-input"
                placeholder="Enter search value..."
              />
              <button onClick={searchReservations} disabled={loading} className="btn-primary">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="results-section">
                <h3 className="results-header">RESULTS ({searchResults.length})</h3>
                {searchResults.map(reservation => (
                  <div key={reservation.reservationId} className="reservation-card">
                    <div className="reservation-card-header">
                      <div>
                        <div className="reservation-card-title">RES-{reservation.reservationId}</div>
                        <div className="reservation-card-subtitle">Guest ID: {reservation.guestId}</div>
                      </div>
                      <div className="status-badge status-confirmed">{reservation.status}</div>
                    </div>
                    <div className="reservation-card-body">
                      <div>Check-in: {reservation.checkInDate}</div>
                      <div>Check-out: {reservation.checkOutDate}</div>
                      <div>Room IDs: {Array.from(reservation.roomIds || []).join(', ')}</div>
                      <div>Created: {new Date(reservation.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <div className="manage-header">
              <h2 className="manage-title">All Reservations ({filteredReservations.length > 0 ? filteredReservations.length : reservations.length})</h2>
              <div className="manage-actions">
                {guestFilter && (
                  <button onClick={() => { setFilteredReservations([]); setGuestFilter(null); }} className="clear-filter-btn">
                    Clear Filter
                  </button>
                )}
                <button onClick={fetchAllReservations} className="refresh-btn">Refresh</button>
              </div>
            </div>
            <div className="qr-scan-section">
              <div className="qr-scan-icon"><Camera size={32} /></div>
              <h3 className="qr-scan-title">Find Guest Reservations</h3>
              <p className="qr-scan-description">Scan guest QR code to filter their reservations</p>
              <button onClick={() => openScanner('manage')} className="qr-scan-btn">
                <Camera size={18} />Scan Guest QR
              </button>
            </div>
            <div className="search-divider"><span>OR</span></div>
            {loading ? (
              <div className="loading-state">Loading reservations...</div>
            ) : (filteredReservations.length > 0 ? filteredReservations : reservations).length === 0 ? (
              <div className="empty-state">
                {guestFilter ? 'No reservations found for this guest' : 'No reservations found'}
              </div>
            ) : (
              (filteredReservations.length > 0 ? filteredReservations : reservations).map(reservation => (
                <div key={reservation.reservationId} className="reservation-card">
                  <div className="reservation-card-header">
                    <div>
                      <h3 className="reservation-card-title">RES-{reservation.reservationId}</h3>
                      <div className="reservation-card-subtitle">Guest ID: {reservation.guestId}</div>
                    </div>
                    <div className="status-badge status-confirmed">{reservation.status}</div>
                  </div>
                  <div className="reservation-card-body">
                    <div>Check-in: {reservation.checkInDate}</div>
                    <div>Check-out: {reservation.checkOutDate}</div>
                    <div>Room IDs: {Array.from(reservation.roomIds || []).join(', ')}</div>
                    <div>Created: {new Date(reservation.createdAt).toLocaleDateString()}</div>
                  </div>
                  <select
                    value={reservation.status}
                    onChange={(e) => updateReservationStatus(reservation.reservationId, e.target.value)}
                    className="status-select"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'checkin' && (
          <div>
            <h2 className="section-title">Front Desk Operations</h2>
            {dailySummary && (
              <div className="daily-summary">
                <h3 className="daily-summary-title">TODAY'S SUMMARY</h3>
                <div className="daily-summary-grid">
                  <div className="daily-summary-card">
                    <div className="daily-summary-value">{dailySummary.occupancyRate}%</div>
                    <div className="daily-summary-label">Occupancy</div>
                  </div>
                  <div className="daily-summary-card">
                    <div className="daily-summary-value">{dailySummary.expectedArrivals}</div>
                    <div className="daily-summary-label">Arrivals</div>
                  </div>
                  <div className="daily-summary-card">
                    <div className="daily-summary-value">{dailySummary.expectedDepartures}</div>
                    <div className="daily-summary-label">Departures</div>
                  </div>
                  <div className="daily-summary-card">
                    <div className="daily-summary-value">{dailySummary.availableRooms}</div>
                    <div className="daily-summary-label">Available</div>
                  </div>
                </div>
              </div>
            )}
            <div className="qr-scan-section">
              <div className="qr-scan-icon"><Camera size={48} /></div>
              <h3 className="qr-scan-title">Scan Guest QR Code</h3>
              <p className="qr-scan-description">Quick check-in for arriving guests</p>
              <button onClick={() => openScanner('checkin')} className="qr-scan-btn">
                <Camera size={20} />Scan for Check-in
              </button>
            </div>
            <div className="arrivals-section">
              <h3 className="arrivals-title">TODAY'S ARRIVALS ({todayArrivals.length})</h3>
              {todayArrivals.length === 0 ? (
                <div className="empty-state">No arrivals scheduled for today</div>
              ) : (
                todayArrivals.map(reservation => (
                  <div key={reservation.reservationId} className="arrival-card">
                    <div className="arrival-card-content">
                      <div className="arrival-info">
                        <div className="arrival-id">RES-{reservation.reservationId}</div>
                        <div className="arrival-guest">Guest: {reservation.guestId}</div>
                        <div className="arrival-room">Room IDs: {Array.from(reservation.roomIds || []).join(', ')}</div>
                        <div className="arrival-dates">Stay: {reservation.checkInDate} to {reservation.checkOutDate}</div>
                      </div>
                      <button onClick={() => handleCheckIn(reservation.reservationId)} disabled={loading} className="checkin-btn">
                        Check In
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="departures-section">
              <h3 className="departures-title">TODAY'S DEPARTURES ({todayDepartures.length})</h3>
              {todayDepartures.length === 0 ? (
                <div className="empty-state">No departures scheduled for today</div>
              ) : (
                todayDepartures.map(reservation => (
                  <div key={reservation.reservationId} className="departure-card">
                    <div className="departure-card-content">
                      <div className="departure-info">
                        <div className="departure-id">RES-{reservation.reservationId}</div>
                        <div className="departure-guest">Guest: {reservation.guestId}</div>
                        <div className="departure-room">Room IDs: {Array.from(reservation.roomIds || []).join(', ')}</div>
                        <div className="departure-dates">Checked in: {reservation.checkInDate}</div>
                      </div>
                      <button onClick={() => handleCheckOut(reservation.reservationId)} disabled={loading} className="checkout-btn">
                        Check Out
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;