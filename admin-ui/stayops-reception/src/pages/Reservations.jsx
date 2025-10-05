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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// QR Scanner Modal Component
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
        const errorText = await response.text();
        throw new Error(`Guest not found (${response.status}): ${errorText}`);
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
            
            setTimeout(() => {
              fetchGuestData(qrValue.trim());
            }, 500);
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
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white border-2 border-black p-8 max-w-2xl w-11/12 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light tracking-tight">Scan Guest QR Code</h2>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={24} />
          </button>
        </div>

        {!guestData && (
          <div>
            <div className="border border-gray-200 p-6 text-center mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto border border-gray-200 bg-black"
              />
              
              {result && (
                <div className="mt-4 p-3 bg-black text-white flex items-center justify-center gap-2 text-sm">
                  <CheckCircle size={16} />
                  <span>QR Detected: {result}</span>
                </div>
              )}
              
              <div className="mt-4 flex gap-3 justify-center">
                {!scanning ? (
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors flex items-center gap-2"
                  >
                    <Camera size={18} /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-gray-600 text-white text-sm hover:bg-gray-700 transition-colors"
                  >
                    Stop Camera
                  </button>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="p-4 border border-gray-300 mb-4 flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>{cameraError}</span>
              </div>
            )}
            
            {error && (
              <div className="p-4 border border-gray-300 mb-4 flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-8 text-sm text-gray-500">
                Loading guest data...
              </div>
            )}
          </div>
        )}

        {guestData && (
          <div className="border border-gray-200 p-6">
            <h3 className="text-sm font-medium mb-6 pb-3 border-b border-gray-200">
              Guest Details Loaded
            </h3>
            
            <div className="flex gap-6 mb-6 justify-center flex-wrap">
              {guestData.imageUrl && (
                <div className="text-center">
                  <img
                    src={guestData.imageUrl}
                    alt="Guest"
                    className="w-24 h-24 object-cover border border-gray-200 grayscale"
                  />
                  <p className="mt-2 text-xs text-gray-500">Profile Photo</p>
                </div>
              )}

              {guestData.qrCodeBase64 && (
                <div className="text-center">
                  <img
                    src={guestData.qrCodeBase64}
                    alt="QR Code"
                    className="w-24 h-24 border border-gray-200"
                  />
                  <p className="mt-2 text-xs text-gray-500">QR Code</p>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="p-3 border border-gray-200">
                <span className="font-medium">Guest ID:</span> {guestData.guestId}
              </div>
              <div className="p-3 border border-gray-200">
                <span className="font-medium">Name:</span> {guestData.fullName}
              </div>
              <div className="p-3 border border-gray-200">
                <span className="font-medium">Email:</span> {guestData.email}
              </div>
              <div className="p-3 border border-gray-200">
                <span className="font-medium">Phone:</span> {guestData.phone}
              </div>
              <div className="p-3 border border-gray-200">
                <span className="font-medium">Nationality:</span> {guestData.nationality}
              </div>
              <div className="p-3 border border-gray-200">
                <span className="font-medium">{guestData.identityType}:</span> {guestData.identityNumber}
              </div>
            </div>

            <button
              onClick={() => onGuestScanned(guestData)}
              className="w-full px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
            >
              Use This Guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Reservations = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null);

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

  useEffect(() => {
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
    if (reservationData.roomType && availableRoomsByType[reservationData.roomType]) {
      const roomsOfType = availableRoomsByType[reservationData.roomType];
      if (roomsOfType.length > 0) {
        const firstRoom = roomsOfType[0];
        setReservationData(prev => ({ 
          ...prev, 
          roomId: firstRoom.id.toString() 
        }));
      }
    }
  }, [reservationData.roomType, availableRoomsByType]);

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
      alert('Please fill in all required fields: Guest, Check-in, Check-out, and Room Type');
      return;
    }

    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Build reservation payload according to backend ReservationRequestDTO
    const reservationPayload = {
      guestId: data.guestId,
      roomIds: [parseInt(data.roomId)],
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      status: data.status,
      adults: data.adults,
      kids: data.kids,
      mealPlan: data.mealPlan,
      amenities: data.amenities,
      specialRequests: data.specialRequests,
      additionalNotes: data.additionalNotes
    };

    try {
      setLoading(true);
      
      // Verify guest exists
      const guestResponse = await fetch(`${API_BASE_URL}/api/v1/guests/${data.guestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      
      if (!guestResponse.ok) {
        throw new Error(`Guest not found. Please scan a valid guest QR code.`);
      }

      // Verify room availability
      const selectedRoomId = parseInt(reservationPayload.roomIds[0]);
      const roomsOfType = availableRoomsByType[data.roomType] || [];
      const roomExists = roomsOfType.find(room => room.id === selectedRoomId);
      
      if (!roomExists) {
        throw new Error(`Room validation failed: Room is not available for the selected dates.`);
      }

      const newReservation = await createReservationAPI(reservationPayload);
      
      alert(`Reservation created successfully!\n\nReservation ID: ${newReservation.reservationId}\nGuest: ${data.guestName}\nRoom Type: ${data.roomType}\nRoom Number: ${roomExists.roomNumber}`);
      
      // Reset form
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
      
    } catch (error) {
      console.error('Create reservation error:', error);
      alert(error.message || 'Failed to create reservation');
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
      
      const criteria = {
        [searchData.searchBy]: searchData.searchValue
      };
      
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
        alert(`Guest loaded: ${newGuestData.guestName}`);
      }, 100);
      
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        <QRScannerModal 
          isOpen={showScanner}
          onClose={() => {
            setShowScanner(false);
            setScannerTarget(null);
          }}
          onGuestScanned={handleGuestScanned}
        />

        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Reservations
          </h1>
          <p className="text-sm text-gray-500">
            Manage bookings and check-ins
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-12 gap-0 flex-wrap">
          {[
            { key: 'create', label: 'Create' },
            { key: 'search', label: 'Search' },
            { key: 'manage', label: 'Manage' },
            { key: 'checkin', label: 'Front Desk' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm border border-gray-200 transition-colors ${
                activeTab === tab.key 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:border-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div>
            <h2 className="text-3xl font-light tracking-tight mb-8">
              Create New Reservation
            </h2>
            
            <div className="mb-8 p-6 border border-gray-200">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-64">
                  <div className="text-xs text-gray-500 mb-3">Guest Information</div>
                  {reservationData.guestId ? (
                    <div className="text-sm space-y-2">
                      <div className="p-3 border border-gray-200">
                        <span className="font-medium">ID:</span> {reservationData.guestId}
                      </div>
                      <div className="p-3 border border-gray-200">
                        <span className="font-medium">Name:</span> {reservationData.guestName}
                      </div>
                      <div className="p-3 border border-gray-200">
                        <span className="font-medium">Email:</span> {reservationData.guestEmail}
                      </div>
                      <div className="p-3 border border-gray-200">
                        <span className="font-medium">Phone:</span> {reservationData.guestPhone}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 p-4 border border-dashed border-gray-300">
                      No guest selected - Scan QR code to load guest
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openScanner('create')}
                  className={`px-6 py-3 text-sm flex items-center gap-2 transition-colors ${
                    reservationData.guestId 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <Camera size={18} /> {reservationData.guestId ? 'Re-scan' : 'Scan Guest QR'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  value={reservationData.checkInDate}
                  onChange={(e) => setReservationData({...reservationData, checkInDate: e.target.value, roomType: '', roomId: ''})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={reservationData.checkOutDate}
                  onChange={(e) => setReservationData({...reservationData, checkOutDate: e.target.value, roomType: '', roomId: ''})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                  min={reservationData.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-2">
                  Room Type * 
                  {roomStatusLoading && ' (Checking availability...)'}
                  {!roomStatusLoading && roomTypes.length > 0 && ` (${roomTypes.length} types available)`}
                </label>
                <select
                  value={reservationData.roomType}
                  onChange={(e) => setReservationData({...reservationData, roomType: e.target.value, roomId: ''})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
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
                {reservationData.roomType && availableRoomsByType[reservationData.roomType] && (
                  <div className="text-xs text-black mt-2 p-3 border border-gray-200">
                    System will automatically assign: Room {availableRoomsByType[reservationData.roomType][0]?.roomNumber}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Meal Plan</label>
                <select
                  value={reservationData.mealPlan}
                  onChange={(e) => setReservationData({...reservationData, mealPlan: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                >
                  <option value="Room Only">Room Only</option>
                  <option value="Bed & Breakfast">Bed & Breakfast</option>
                  <option value="Half Board">Half Board</option>
                  <option value="Full Board">Full Board</option>
                  <option value="All Inclusive">All Inclusive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-2">Adults</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={reservationData.adults}
                  onChange={(e) => setReservationData({...reservationData, adults: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Kids</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={reservationData.kids}
                  onChange={(e) => setReservationData({...reservationData, kids: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-2">Amenities</label>
              <input
                type="text"
                value={reservationData.amenities}
                onChange={(e) => setReservationData({...reservationData, amenities: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="e.g., Wifi, Breakfast, Airport Pickup"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-2">Special Requests</label>
              <textarea
                value={reservationData.specialRequests}
                onChange={(e) => setReservationData({...reservationData, specialRequests: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors resize-vertical"
                rows="3"
                placeholder="Any special requirements..."
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs text-gray-500 mb-2">Additional Notes (Internal)</label>
              <textarea
                value={reservationData.additionalNotes}
                onChange={(e) => setReservationData({...reservationData, additionalNotes: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors resize-vertical"
                rows="2"
                placeholder="Internal notes..."
              />
            </div>
            
            <button
              onClick={() => createReservation(reservationData)}
              disabled={loading || !reservationData.guestId || !reservationData.checkInDate || !reservationData.checkOutDate || !reservationData.roomType}
              className={`w-full px-6 py-4 text-sm transition-colors ${
                loading || !reservationData.guestId || !reservationData.roomType
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {loading ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <h2 className="text-3xl font-light tracking-tight mb-8">
              Search Reservations
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <select
                value={searchData.searchBy}
                onChange={(e) => setSearchData({...searchData, searchBy: e.target.value})}
                className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
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
                className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Enter search value..."
              />
              
              <button
                onClick={searchReservations}
                disabled={loading}
                className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-4">
                  Results ({searchResults.length})
                </h3>
                {searchResults.map(reservation => (
                  <div key={reservation.reservationId} className="border border-gray-200 p-6 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-medium text-lg">RES-{reservation.reservationId}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Guest ID: {reservation.guestId}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {reservation.status}
                      </div>
                    </div>
                    
                    <div className="text-sm grid grid-cols-2 gap-3">
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

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-light tracking-tight">
                All Reservations ({reservations.length})
              </h2>
              <button
                onClick={fetchAllReservations}
                className="px-4 py-2 border border-gray-200 text-black text-xs hover:border-black transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-24 text-sm text-gray-400">
                Loading reservations...
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-24 text-sm text-gray-400">
                No reservations found
              </div>
            ) : (
              reservations.map(reservation => (
                <div key={reservation.reservationId} className="border border-gray-200 p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-light">RES-{reservation.reservationId}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        Guest ID: {reservation.guestId}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {reservation.status}
                    </div>
                  </div>
                  
                  <div className="text-sm grid grid-cols-2 gap-3 mb-4">
                    <div>Check-in: {reservation.checkInDate}</div>
                    <div>Check-out: {reservation.checkOutDate}</div>
                    <div>Room IDs: {Array.from(reservation.roomIds || []).join(', ')}</div>
                    <div>Created: {new Date(reservation.createdAt).toLocaleDateString()}</div>
                  </div>
                  
                  <select
                    value={reservation.status}
                    onChange={(e) => updateReservationStatus(reservation.reservationId, e.target.value)}
                    className="px-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
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

        {/* Front Desk Tab */}
        {activeTab === 'checkin' && (
          <div>
            <h2 className="text-3xl font-light tracking-tight mb-8">
              Front Desk Operations
            </h2>
            
            {dailySummary && (
              <div className="mb-12 p-6 border border-gray-200">
                <h3 className="text-sm font-medium mb-6">Today's Summary</h3>
                <div className="grid grid-cols-4 gap-6">
                  <div className="p-6 border border-gray-200 text-center">
                    <div className="text-3xl font-light mb-2">{dailySummary.occupancyRate}%</div>
                    <div className="text-xs text-gray-500">Occupancy</div>
                  </div>
                  <div className="p-6 border border-gray-200 text-center">
                    <div className="text-3xl font-light mb-2">{dailySummary.expectedArrivals}</div>
                    <div className="text-xs text-gray-500">Arrivals</div>
                  </div>
                  <div className="p-6 border border-gray-200 text-center">
                    <div className="text-3xl font-light mb-2">{dailySummary.expectedDepartures}</div>
                    <div className="text-xs text-gray-500">Departures</div>
                  </div>
                  <div className="p-6 border border-gray-200 text-center">
                    <div className="text-3xl font-light mb-2">{dailySummary.availableRooms}</div>
                    <div className="text-xs text-gray-500">Available</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center py-16 border border-gray-200 mb-12">
              <div className="mb-6 flex justify-center">
                <Camera size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-4">
                Scan Guest QR Code
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                Quick check-in for arriving guests
              </p>
              <button
                onClick={() => openScanner('checkin')}
                className="px-8 py-4 bg-black text-white text-sm hover:bg-gray-900 transition-colors inline-flex items-center gap-3"
              >
                <Camera size={20} />
                Scan for Check-in
              </button>
            </div>

            <div className="mb-12">
              <h3 className="text-sm font-medium mb-4">
                Today's Arrivals ({todayArrivals.length})
              </h3>
              {todayArrivals.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-300 text-sm text-gray-400">
                  No arrivals scheduled for today
                </div>
              ) : (
                todayArrivals.map(reservation => (
                  <div key={reservation.reservationId} className="border border-gray-200 p-6 mb-4">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-48">
                        <div className="font-medium">RES-{reservation.reservationId}</div>
                        <div className="text-sm mt-2">
                          Guest: {reservation.guestId}
                        </div>
                        <div className="text-sm">
                          Room IDs: {Array.from(reservation.roomIds || []).join(', ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Stay: {reservation.checkInDate} to {reservation.checkOutDate}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckIn(reservation.reservationId)}
                        disabled={loading}
                        className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">
                Today's Departures ({todayDepartures.length})
              </h3>
              {todayDepartures.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-300 text-sm text-gray-400">
                  No departures scheduled for today
                </div>
              ) : (
                todayDepartures.map(reservation => (
                  <div key={reservation.reservationId} className="border border-gray-200 p-6 mb-4">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-48">
                        <div className="font-medium">RES-{reservation.reservationId}</div>
                        <div className="text-sm mt-2">
                          Guest: {reservation.guestId}
                        </div>
                        <div className="text-sm">
                          Room IDs: {Array.from(reservation.roomIds || []).join(', ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Checked in: {reservation.checkInDate}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckOut(reservation.reservationId)}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-600 text-white text-sm hover:bg-gray-700 transition-colors"
                      >
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