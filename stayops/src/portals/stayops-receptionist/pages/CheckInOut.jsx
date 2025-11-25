import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, CheckCircle, AlertCircle, RefreshCw, User, Search, Clipboard } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { getGuestReservations, checkInReservation, checkOutReservation } from '../api/reservation';
import { getRoomById, getAllRooms } from '../api/room';
import theme from '../styles/theme';
import '../styles/checkinout.css';
import '../styles/modals.css';

// ✅ FIXED: Correct environment variable for Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ==========================================
// QR SCANNER MODAL COMPONENT
// ==========================================

const QRScannerModal = ({ isOpen, onClose, onGuestDataReceived }) => {
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

      const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('This guest is not registered in the system. Please ask the guest to register first or contact IT support.');
      }

      const data = await response.json();
      setGuestData(data);
      stopCamera();
    } catch (_err) {
      console.error('fetchGuestData failed:', _err && (_err.stack || _err.message || _err));
      setError((_err && _err.message) || 'Could not find guest information. Please try scanning again or enter details manually.');
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
          if (err) {
            const name = String(err?.name || err || '');
            if (!name.includes('NotFoundException')) {
              console.error('QR scan error:', err);
            }
          }
        }
      );
    } catch {
      setCameraError('Cannot access camera. Please allow camera permission in your browser or try a different browser.');
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

            <div className="modal-actions">
              <button
                onClick={() => {
                  onGuestDataReceived(guestData);
                  onClose();
                }}
                className="btn-primary"
              >
                Use This Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// GUEST ID MODAL COMPONENT
// ==========================================

const GuestIdModal = ({ isOpen, onClose, onGuestDataReceived }) => {
  const [guestId, setGuestId] = useState('');
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const inputRef = useRef(null);

  const fetchGuestData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setGuestData(null);

      const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('This guest is not registered in the system. Please ask the guest to register first or contact IT support.');
      }

      const data = await response.json();
      setGuestData(data);
    } catch (_err) {
      console.error('fetchGuestData failed:', _err && (_err.stack || _err.message || _err));
      setError((_err && _err.message) || 'Could not find guest information. Please verify the Guest ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmedText = text.trim();
      if (trimmedText) {
        setGuestId(trimmedText);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
        inputRef.current?.focus();
      } else {
        setError('Clipboard is empty. Please copy a Guest ID first.');
      }
    } catch (err) {
      console.error('Paste failed:', err);
      setError('Cannot access clipboard. Please paste manually using Ctrl+V or right-click.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedId = guestId.trim();
    if (!trimmedId) {
      setError('Please enter a Guest ID');
      return;
    }
    fetchGuestData(trimmedId);
  };

  const handleReset = () => {
    setGuestId('');
    setGuestData(null);
    setError(null);
    setLoading(false);
    setPasteSuccess(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setTimeout(() => {
        setGuestId('');
        setGuestData(null);
        setError(null);
        setLoading(false);
        setPasteSuccess(false);
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Fetch Guest by ID</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        {!guestData && (
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="guest-id-input-section">
                <label className="guest-id-label">ENTER GUEST ID</label>
                <div className="guest-id-input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    value={guestId}
                    onChange={(e) => setGuestId(e.target.value)}
                    className="guest-id-input"
                    placeholder="e.g., G12345"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    disabled={loading}
                    className={`paste-btn ${pasteSuccess ? 'success' : ''}`}
                    title="Paste from clipboard"
                  >
                    <Clipboard size={16} />
                    {pasteSuccess ? 'Pasted!' : 'Paste'}
                  </button>
                </div>
                <div className="guest-id-hint">
                  Enter the unique Guest ID or click "Paste" to paste from clipboard
                </div>
              </div>

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

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={loading || !guestId.trim()}
                  className="btn-primary"
                >
                  <Search size={18} /> {loading ? 'Searching...' : 'Fetch Guest'}
                </button>
              </div>
            </form>
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

            <div className="modal-actions-group">
              <button
                onClick={handleReset}
                className="btn-secondary"
              >
                Search Another Guest
              </button>
              <button
                onClick={() => {
                  onGuestDataReceived(guestData);
                  onClose();
                }}
                className="btn-primary"
              >
                Use This Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN CHECK-IN/OUT COMPONENT
// ==========================================

const CheckInOut = () => {
  const [loading, setLoading] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showGuestIdModal, setShowGuestIdModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [guestReservations, setGuestReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [roomMap, setRoomMap] = useState(null);
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    guestName: '',
    guestId: '',
    reservationId: '',
    notes: '',
    action: 'checkin'
  });

  // Helpers: normalize reservation fields coming from API variants
  const getReservationId = (r) => r?.id ?? r?.reservationId ?? r?.reservationID ?? r?.bookingId ?? r?.bookingID ?? '';
  const getRoomNumber = (r) => (
    r?.roomNumber ??
    r?.room_no ??
    r?.roomNo ??
    r?.room?.number ??
    r?.room?.roomNumber ??
    r?.allocatedRoomNumber ??
    r?.assignedRoomNumber ??
    r?.roomId ??
    ''
  );
  const getRoomNumberFromRoom = (room) => (
    room?.roomNumber ?? room?.room_number ?? room?.number ?? ''
  );
  const getRoomId = (r) => (
    r?.roomId ??
    r?.room_id ??
    (Array.isArray(r?.roomIds) && r.roomIds.length > 0 ? r.roomIds[0] : undefined) ??
    r?.room?.id ??
    r?.room?.roomId ??
    null
  );

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const fetchGuestReservations = async (guestId) => {
    try {
      setLoadingReservations(true);
      console.log('Fetching reservations for guest:', guestId);
      
      const reservations = await getGuestReservations(guestId);
      console.log('Guest reservations:', reservations);
      
      const ensureRoomMap = async () => {
        if (roomMap) return roomMap;
        try {
          const rooms = await getAllRooms();
          const map = Array.isArray(rooms) ? rooms.reduce((acc, room) => {
            const rid = room.id ?? room.roomId ?? room.room_id;
            const rn = room.roomNumber ?? room.room_number ?? room.number;
            if (rid != null && rn != null) acc[rid] = rn;
            return acc;
          }, {}) : {};
          setRoomMap(map);
          return map;
        } catch {
          return {};
        }
      };

      const map = await ensureRoomMap();
      const normalized = Array.isArray(reservations)
        ? reservations.map(r => {
            const rid = getRoomId(r);
            const rn = getRoomNumber(r) || (rid != null ? map[rid] : undefined);
            return { ...r, _roomId: rid, _roomNumber: rn };
          })
        : [];
      setGuestReservations(normalized);
      
      const confirmedReservation = normalized.find(r => r.status === 'CONFIRMED');
      if (confirmedReservation) {
        setSelectedReservation({ ...confirmedReservation, _roomId: getRoomId(confirmedReservation) });
        setFormData(prev => ({
          ...prev,
          roomNumber: ((getRoomNumber(confirmedReservation) || confirmedReservation._roomNumber || '').toString()),
          reservationId: getReservationId(confirmedReservation),
          reservationRoomId: getRoomId(confirmedReservation)
        }));
        const rn = getRoomNumber(confirmedReservation) || confirmedReservation._roomNumber;
        showNotification('success', `✓ Booking found! Room ${rn || '—'} auto-filled`);

        if (!rn) {
          const rid = getRoomId(confirmedReservation);
          if (rid) {
            try {
              const room = await getRoomById(rid);
              const fetchedRn = getRoomNumberFromRoom(room);
              if (fetchedRn) {
                setFormData(prev => ({ ...prev, roomNumber: fetchedRn.toString() }));
                showNotification('info', `✓ Room ${fetchedRn} fetched from room details`);
              }
            } catch {
              // Silently ignore; user can type room number manually
            }
          }
        }
      } else if (reservations.length > 0) {
        showNotification('info', `Found ${reservations.length} booking(s). Please select one or enter room manually.`);
      } else {
        showNotification('info', 'No bookings found. Please enter room number manually.');
      }
    } catch (error) {
      console.error('Error fetching guest reservations:', error);
      showNotification('error', 'Could not load guest bookings. Please enter room number manually.');
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleQRScan = async (guestData) => {
    if (guestData) {
      setFormData(prev => ({
        ...prev,
        guestName: guestData.fullName,
        guestId: guestData.guestId,
      }));

      await fetchGuestReservations(guestData.guestId);
    }
  };

  const handleReservationSelect = async (reservation) => {
    const resId = getReservationId(reservation);
    let rn = getRoomNumber(reservation) || reservation._roomNumber;
    const rid = getRoomId(reservation);
    
    setSelectedReservation({ ...reservation, _roomId: rid });
    setFormData(prev => ({
      ...prev,
      roomNumber: (rn || '').toString(),
      reservationId: resId,
      reservationRoomId: rid
    }));
    
    if (rn) {
      showNotification('info', `✓ Room ${rn} auto-filled from Booking #${resId}`);
    } else if (rid) {
      if (roomMap && roomMap[rid]) {
        rn = roomMap[rid];
        setFormData(prev => ({ ...prev, roomNumber: rn.toString() }));
        showNotification('info', `✓ Room ${rn} resolved from room list`);
        return;
      }
      try {
        const room = await getRoomById(rid);
        const fetchedRn = getRoomNumberFromRoom(room);
        if (fetchedRn) {
          setFormData(prev => ({ ...prev, roomNumber: fetchedRn.toString() }));
          showNotification('info', `✓ Room ${fetchedRn} fetched from room details`);
        } else {
          showNotification('warning', 'Room number not available for this booking. Please enter manually.');
        }
      } catch {
        showNotification('warning', 'Could not fetch room details. Please enter room number manually.');
      }
    }
  };

  const handleClearGuest = () => {
    if (window.confirm('Clear all guest information and start over?')) {
      setFormData({
        roomNumber: '',
        guestName: '',
        guestId: '',
        reservationId: '',
        notes: '',
        action: formData.action
      });
      setGuestReservations([]);
      setSelectedReservation(null);
      showNotification('info', 'Guest information cleared. Ready for new guest.');
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Reset the entire form to start fresh?')) {
      setFormData({
        roomNumber: '',
        guestName: '',
        guestId: '',
        reservationId: '',
        notes: '',
        action: 'checkin'
      });
      setGuestReservations([]);
      setSelectedReservation(null);
      showNotification('info', 'Form reset successfully.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.guestName.trim()) {
      alert('⚠️ Guest Name Required\n\nPlease scan the guest QR code or enter the guest name manually.');
      return;
    }

    if (!formData.roomNumber.trim()) {
      alert('⚠️ Room Number Required\n\nPlease select a booking or enter the room number manually.');
      return;
    }

    if (formData.action === 'checkin' && selectedReservation?.checkInDate) {
      const now = new Date();
      const ci = new Date(selectedReservation.checkInDate);
      if (!Number.isNaN(ci.getTime())) {
        const toDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (toDateOnly(now) < toDateOnly(ci)) {
          const nice = ci.toLocaleDateString();
          alert(`❌ You can only check in on or after the check-in date.\n\nCheck-in Date: ${nice}`);
          return;
        }
      }
    }

    if (formData.action === 'checkout') {
      const status = selectedReservation?.status;
      if (status === 'CHECKED_OUT') {
        alert('❌ This reservation is already checked out.\n\nNo further checkout action is required.');
        return;
      }
      if (status === 'PENDING') {
        alert('❌ This reservation has not been checked in yet.\n\nPlease check in before attempting to check out.');
        return;
      }

      // Prevent checkout before the scheduled check-out date
      const coRaw = selectedReservation?.checkOutDate;
      if (coRaw) {
        const now = new Date();
        const co = new Date(coRaw);
        if (!Number.isNaN(co.getTime())) {
          const toDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
          if (toDateOnly(now) < toDateOnly(co)) {
            const nice = co.toLocaleDateString();
            alert(`❌ You can only check out on the scheduled check-out date or later.\n\nCheck-out Date: ${nice}`);
            return;
          }
        }
      }
    }

    const actionText = formData.action === 'checkin' ? 'check in' : 'check out';
    const confirmMessage = `Are you sure you want to ${actionText}?\n\nGuest: ${formData.guestName}\nRoom: ${formData.roomNumber}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (selectedReservation) {
        if (formData.action === 'checkin') {
          result = await checkInReservation(getReservationId(selectedReservation));
          showNotification('success', `✓ Check-in completed! ${formData.guestName} is now in Room ${formData.roomNumber}`);
        } else {
          result = await checkOutReservation(getReservationId(selectedReservation), formData.guestId);
          showNotification('success', `✓ Check-out completed! Room ${formData.roomNumber} is now available`);
        }
        
        console.log('Operation result:', result);
      } else {
        showNotification('warning', '⚠️ No booking found. Processed manually. Inform your supervisor.');
      }
      
      setFormData({
        roomNumber: '',
        guestName: '',
        guestId: '',
        reservationId: '',
        notes: '',
        action: 'checkin'
      });
      setGuestReservations([]);
      setSelectedReservation(null);
      
    } catch (error) {
      console.error('Operation failed:', error);
      
      let userMessage = '❌ Something went wrong. ';
      
      if (error.message.includes('not found') || error.message.includes('404')) {
        userMessage += 'This booking could not be found. Please check the booking number or contact your supervisor.';
      } else if (error.message.includes('already checked')) {
        userMessage += 'This guest has already been checked in/out. Please verify the booking status.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage += 'Cannot connect to the system. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        userMessage += 'The system is taking too long to respond. Please wait a moment and try again.';
      } else {
        userMessage += 'Please try again. If the problem continues, contact IT support.';
      }
      
      alert(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'CONFIRMED': 'status-confirmed',
      'PENDING': 'status-pending',
      'CHECKED_IN': 'status-checked-in',
      'CHECKED_OUT': 'status-checked-out',
      'CANCELLED': 'status-cancelled',
    };
    return `status-badge ${statusMap[status] || 'status-pending'}`;
  };

  return (
    <div className="checkinout-container">
      <div className="checkinout-wrapper">
        {/* Header */}
        <div className="checkinout-header">
          <div className="checkinout-header-content">
            <div>
              <h1 className="checkinout-title">Check-In / Check-Out</h1>
              <p className="checkinout-subtitle">Process guest arrivals and departures</p>
            </div>
            <div className="checkinout-header-actions">
              {formData.guestId && (
                <button onClick={handleClearGuest} className="btn-outline" title="Clear current guest and keep form settings">
                  <User size={14} /> Clear Guest
                </button>
              )}
              <button onClick={handleResetForm} className="btn-outline" title="Reset entire form">
                <RefreshCw size={14} /> Reset Form
              </button>
            </div>
          </div>
        </div>

        <div className="checkinout-grid">
          {/* Notification Bar */}
          {notification.show && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className={`notification-bar notification-${notification.type}`}>
                {notification.message}
              </div>
            </div>
          )}

          {/* Left Column - Main Form */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Operation Type */}
              <div className="action-type-selector">
                <label className="action-type-label">SELECT ACTION</label>
                <div className="action-type-grid">
                  <label className={`action-type-option ${formData.action === 'checkin' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="action"
                      value="checkin"
                      checked={formData.action === 'checkin'}
                      onChange={(e) => {
                        setFormData({...formData, action: e.target.value});
                        // Clear selection if the selected reservation is not valid for check-in
                        if (selectedReservation) {
                          const status = selectedReservation.status;
                          if (status === 'CHECKED_IN' || status === 'CHECKED_OUT' || status === 'CANCELLED') {
                            setSelectedReservation(null);
                            setFormData(prev => ({
                              ...prev,
                              action: e.target.value,
                              reservationId: '',
                              reservationRoomId: null
                            }));
                            showNotification('info', 'Selected reservation is not valid for check-in. Please select another booking.');
                          }
                        }
                      }}
                    />
                    Guest Arrival (Check In)
                  </label>
                  
                  <label className={`action-type-option ${formData.action === 'checkout' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="action"
                      value="checkout"
                      checked={formData.action === 'checkout'}
                      onChange={(e) => {
                        setFormData({...formData, action: e.target.value});
                        // Clear selection if the selected reservation is not valid for check-out
                        if (selectedReservation) {
                          const status = selectedReservation.status;
                          if (status === 'PENDING' || status === 'CONFIRMED' || status === 'CHECKED_OUT' || status === 'CANCELLED') {
                            setSelectedReservation(null);
                            setFormData(prev => ({
                              ...prev,
                              action: e.target.value,
                              reservationId: '',
                              reservationRoomId: null
                            }));
                            showNotification('info', 'Selected reservation is not valid for check-out. Please select another booking.');
                          }
                        }
                      }}
                    />
                    Guest Departure (Check Out)
                  </label>
                </div>
              </div>

              {/* Guest Information Section */}
              <div className="guest-info-section">
                <div className="guest-info-content">
                  <div className="guest-info-details">
                    <div className="guest-info-title">GUEST DETAILS</div>
                    {formData.guestId ? (
                      <div className="guest-info-data">
                        <div className="guest-info-row">
                          <span className="guest-info-row-label">ID:</span>
                          <span className="guest-info-row-value">{formData.guestId}</span>
                        </div>
                        <div className="guest-info-row">
                          <span className="guest-info-row-label">Name:</span>
                          <span className="guest-info-row-value">{formData.guestName}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="guest-info-empty">
                        No guest loaded yet. Use buttons below →
                      </div>
                    )}
                  </div>
                  <div className="guest-action-buttons">
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className={`scan-guest-btn ${formData.guestId ? 'secondary' : 'primary'}`}
                      title="Scan guest QR code using camera"
                    >
                      <Camera size={16} /> {formData.guestId ? 'Scan Different' : 'Scan QR'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGuestIdModal(true)}
                      className={`scan-guest-btn ${formData.guestId ? 'secondary' : 'primary'}`}
                      title="Enter guest ID manually"
                    >
                      <Search size={16} /> {formData.guestId ? 'Search Different' : 'Enter ID'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Room Number */}
              <div className="room-number-section">
                <label className="room-number-label">
                  ROOM NUMBER {selectedReservation ? '(Auto-filled from booking)' : '(Required)'}
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value.toUpperCase()})}
                  className="room-number-input"
                  placeholder="e.g., 301"
                  maxLength="10"
                  required
                />
                <div className={`room-number-hint ${selectedReservation ? 'success' : ''}`}>
                  {selectedReservation 
                    ? '✓ Room number filled automatically from selected booking' 
                    : 'Select a booking or enter room number manually'
                  }
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`submit-btn ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <span className="submit-btn-content">
                    <span className="submit-btn-spinner">⏳</span>
                    Please wait...
                  </span>
                ) : (
                  `✓ Complete ${formData.action === 'checkin' ? 'Check-In' : 'Check-Out'}`
                )}
              </button>

              {/* Notes */}
              <div className="notes-section">
                <label className="notes-label">SPECIAL NOTES (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="notes-textarea"
                  placeholder="Any special requests or important information about this guest..."
                  rows="3"
                />
              </div>
            </form>
          </div>

          {/* Right Column - Guest Reservations */}
          <div>
            <div className="reservations-sidebar">
              <div className="reservations-header">
                <h3 className="reservations-title">Guest Bookings</h3>
                {guestReservations.length > 0 && (
                  <span className="reservations-count">{guestReservations.length}</span>
                )}
              </div>
              
              {loadingReservations ? (
                <div className="reservations-loading">Searching for bookings...</div>
              ) : guestReservations.length > 0 ? (
                <div className="reservations-list">
                  {guestReservations.map((reservation) => {
                    const resId = getReservationId(reservation);
                    const rn = getRoomNumber(reservation);
                    const isSelected = (selectedReservation?.id ?? selectedReservation?.reservationId) === resId;
                    
                    // Disable logic based on action type
                    let disabledForAction = false;
                    let disabledTitle = undefined;
                    
                    if (formData.action === 'checkin') {
                      // For check-in: only allow PENDING and CONFIRMED
                      if (reservation.status === 'CHECKED_IN') {
                        disabledForAction = true;
                        disabledTitle = 'This reservation is already checked in';
                      } else if (reservation.status === 'CHECKED_OUT') {
                        disabledForAction = true;
                        disabledTitle = 'This reservation is already checked out';
                      } else if (reservation.status === 'CANCELLED') {
                        disabledForAction = true;
                        disabledTitle = 'This reservation is cancelled';
                      }
                    } else if (formData.action === 'checkout') {
                      // For check-out: only allow CHECKED_IN
                      if (reservation.status === 'PENDING') {
                        disabledForAction = true;
                        disabledTitle = 'Cannot check out - Guest has not checked in yet';
                      } else if (reservation.status === 'CONFIRMED') {
                        disabledForAction = true;
                        disabledTitle = 'Cannot check out - Guest has not checked in yet';
                      } else if (reservation.status === 'CHECKED_OUT') {
                        disabledForAction = true;
                        disabledTitle = 'This reservation is already checked out';
                      } else if (reservation.status === 'CANCELLED') {
                        disabledForAction = true;
                        disabledTitle = 'This reservation is cancelled';
                      } else {
                        // Also block if today's date is before scheduled check-out date
                        const raw = reservation.checkOutDate;
                        if (raw) {
                          const now = new Date();
                          const co = new Date(raw);
                          if (!Number.isNaN(co.getTime())) {
                            const toDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            if (toDateOnly(now) < toDateOnly(co)) {
                              disabledForAction = true;
                              const nice = co.toLocaleDateString();
                              disabledTitle = `Cannot check out before the scheduled check-out date (${nice})`;
                            }
                          }
                        }
                      }
                    }
                    
                    return (
                      <div
                        key={resId}
                        role="button"
                        aria-disabled={disabledForAction}
                        tabIndex={disabledForAction ? -1 : 0}
                        onClick={() => { if (!disabledForAction) handleReservationSelect(reservation); }}
                        onKeyDown={(e) => { if (!disabledForAction && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleReservationSelect(reservation); } }}
                        className={`reservation-card ${isSelected ? 'selected' : ''} ${disabledForAction ? 'disabled' : ''}`}
                        style={{ cursor: disabledForAction ? 'not-allowed' : 'pointer', opacity: disabledForAction ? 0.6 : 1 }}
                        title={disabledTitle}
                      >
                      <div className="reservation-card-header">
                        <span className="reservation-id">#{resId}</span>
                        <span className={getStatusBadgeClass(reservation.status)}>
                          {reservation.status}
                        </span>
                      </div>
                      <div className="reservation-card-body">
                        <div className="reservation-room">Room {rn || reservation._roomNumber || (reservation._roomId != null && roomMap ? roomMap[reservation._roomId] : '') || '—'}</div>
                        <div><span className="reservation-date-label">Arrives:</span> {reservation.checkInDate}</div>
                        <div><span className="reservation-date-label">Departs:</span> {reservation.checkOutDate}</div>
                      </div>
                      {isSelected && (
                        <div className="reservation-selected-badge">
                          ✓ Selected & Room Auto-filled
                        </div>
                      )}
                      {disabledForAction && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#a15757', lineHeight: '1.4' }}>
                          {disabledTitle}
                        </div>
                      )}
                      </div>
                    );
                  })}
                </div>
              ) : formData.guestId ? (
                <div className="reservations-empty">
                  <p className="reservations-empty-text">No bookings found for this guest</p>
                  <p className="reservations-empty-subtext">Enter room number manually below</p>
                </div>
              ) : (
                <div className="reservations-empty">
                  <Camera size={24} className="reservations-empty-icon" />
                  <p className="reservations-empty-text">Load guest information first</p>
                  <p className="reservations-empty-subtext">to see their bookings</p>
                </div>
              )}

              {/* Quick Stats */}
              {guestReservations.length > 0 && (
                <div className="quick-stats">
                  <div className="quick-stats-grid">
                    <div className="quick-stat-card">
                      <div className="quick-stat-value">{guestReservations.length}</div>
                      <div className="quick-stat-label">Total</div>
                    </div>
                    <div className="quick-stat-card">
                      <div className="quick-stat-value">
                        {guestReservations.filter(r => r.status === 'CONFIRMED').length}
                      </div>
                      <div className="quick-stat-label">Active</div>
                    </div>
                    <div className="quick-stat-card">
                      <div className="quick-stat-value">
                        {guestReservations.filter(r => r.status === 'CHECKED_IN').length}
                      </div>
                      <div className="quick-stat-label">In House</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="instructions-section">
          <h3 className="instructions-title">SIMPLE INSTRUCTIONS</h3>
          <div className="instructions-grid">
            <div className="instruction-card">
              <div className="instruction-number">𝟏</div>
              <div className="instruction-title">Load Guest Information</div>
              <div className="instruction-description">
                Click "Scan QR" to use camera, or "Enter ID" to manually type the Guest ID. Guest details and bookings will load automatically.
              </div>
            </div>
            <div className="instruction-card">
              <div className="instruction-number">𝟐</div>
              <div className="instruction-title">Select Booking (Auto-fill Room)</div>
              <div className="instruction-description">
                Click on a valid booking from the list. The room number will be filled automatically. Invalid bookings for the selected action are disabled.
              </div>
            </div>
            <div className="instruction-card">
              <div className="instruction-number">𝟑</div>
              <div className="instruction-title">Complete Action</div>
              <div className="instruction-description">
                Review the details and click the button. You'll see a confirmation when it's done.
              </div>
            </div>
          </div>
          
          <div className="tips-section">
            <div className="tip-card">
              <div className="tip-title">Quick Tips</div>
              <div className="tip-list">
                <div>• Use QR scanner for quick check-in with camera</div>
                <div>• Use ID search when QR code is not available</div>
                <div>• Room number auto-fills when you select a booking</div>
                <div>• Only valid reservations can be selected based on the action type</div>
                <div>• Switching between Check-In/Check-Out will clear invalid selections</div>
                <div>• Use "Clear Guest" to load a different guest</div>
              </div>
            </div>
            <div className="tip-card">
              <div className="tip-title">Reservation Rules</div>
              <div className="tip-description">
                <strong>Check-In:</strong> Only PENDING and CONFIRMED reservations can be checked in.<br/><br/>
                <strong>Check-Out:</strong> Only CHECKED_IN reservations can be checked out. Guests must be checked in first.<br/><br/>
                Cancelled and already completed reservations cannot be selected.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onGuestDataReceived={handleQRScan}
      />

      {/* Guest ID Modal */}
      <GuestIdModal
        isOpen={showGuestIdModal}
        onClose={() => setShowGuestIdModal(false)}
        onGuestDataReceived={handleQRScan}
      />
    </div>
  );
};

export default CheckInOut;