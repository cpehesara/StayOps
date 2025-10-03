import React, { useState, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

// QR Scanner Component
const QRScanner = ({ onGuestDataReceived, onClose }) => {
  const [result, setResult] = useState("");
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = React.useRef(null);
  const codeReaderRef = React.useRef(null);
  const controlsRef = React.useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  const fetchGuestData = async (guestId) => {
    try {
      setLoading(true);
      setError(null);
      setGuestData(null);

      const response = await fetch(`${API_BASE_URL}/api/v1/guests/${guestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Guest not found (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      setGuestData(data);
      
      if (onGuestDataReceived) {
        onGuestDataReceived(data);
      }
      
      stopCamera();
    } catch (err) {
      console.error("Error fetching guest data:", err);
      setError(err.message || "Failed to fetch guest data");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setCameraError(null);
      setGuestData(null);
      setResult("");
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
            
            console.log("QR Detected:", qrValue);
            setResult(qrValue);
            lastScannedCode = qrValue;
            lastScanTime = currentTime;
            
            setTimeout(() => {
              fetchGuestData(qrValue.trim());
            }, 500);
          }
          if (err && !(err.name === "NotFoundException")) {
            console.error("QR scan error:", err);
          }
        }
      );
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
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

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full max-w-lg">
      {!guestData && (
        <div>
          <div className="border-2 border-black p-6 text-center mb-6 bg-white">
            {!result ? (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-sm max-h-80 border-2 border-black bg-gray-100 mb-4"
                />
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wide hover:bg-gray-900 transition-colors"
                  >
                    Start Camera
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 border-2 border-black bg-white text-black text-sm font-semibold uppercase tracking-wide hover:bg-gray-100 transition-colors"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-5">
                <div className="text-base font-semibold text-black mb-2">
                  ✓ QR Code Detected
                </div>
                <div className="text-sm font-mono">
                  {result}
                </div>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-4 border-2 border-red-600 bg-red-50 mb-4 text-sm text-red-900">
              ⚠ {cameraError}
            </div>
          )}
          
          {error && (
            <div className="p-4 border-2 border-red-600 bg-red-50 mb-4 text-sm text-red-900">
              ⚠ {error}
            </div>
          )}
          
          {loading && (
            <div className="text-center py-5 text-base font-semibold">
              Loading guest data...
            </div>
          )}
        </div>
      )}

      {guestData && (
        <div className="border-2 border-black p-6 bg-gray-50 mb-5">
          <h3 className="mb-4 text-lg font-semibold uppercase tracking-wide">
            Guest Details Found
          </h3>
          
          {(guestData.imageUrl || guestData.qrCodeBase64) && (
            <div className="flex gap-5 mb-5 justify-center">
              {guestData.imageUrl && (
                <div className="text-center">
                  <img
                    src={guestData.imageUrl}
                    alt="Guest"
                    className="w-24 h-24 object-cover border-2 border-black"
                  />
                  <div className="mt-2 text-xs font-semibold">Profile</div>
                </div>
              )}

              {guestData.qrCodeBase64 && (
                <div className="text-center">
                  <img
                    src={guestData.qrCodeBase64}
                    alt="QR Code"
                    className="w-24 h-24 border-2 border-black"
                  />
                  <div className="mt-2 text-xs font-semibold">QR Code</div>
                </div>
              )}
            </div>
          )}

          <div className="text-sm space-y-2">
            <div><strong>Name:</strong> {guestData.fullName}</div>
            <div><strong>Email:</strong> {guestData.email}</div>
            <div><strong>Phone:</strong> {guestData.phone}</div>
            <div><strong>Nationality:</strong> {guestData.nationality}</div>
            <div><strong>{guestData.identityType}:</strong> {guestData.identityNumber}</div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              if (onClose) onClose();
            }}
            className="w-full mt-4 px-6 py-3 text-sm font-semibold border-2 border-black bg-black text-white uppercase tracking-wide hover:bg-gray-900 transition-colors"
          >
            Use This Guest Data
          </button>
        </div>
      )}
    </div>
  );
};

// QR Scanner Modal Component
const QRScannerModal = ({ isOpen, onClose, onGuestDataReceived, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white p-8 border-4 border-black max-w-2xl w-11/12 max-h-screen overflow-auto text-center">
        <h3 className="text-xl font-semibold mb-6 uppercase tracking-wide">
          {title}
        </h3>
        
        <QRScanner 
          onGuestDataReceived={onGuestDataReceived}
          onClose={onClose}
        />
        
        <button
          onClick={onClose}
          className="px-6 py-3 text-sm font-semibold border-2 border-black bg-white text-black uppercase tracking-wide hover:bg-gray-100 transition-colors mt-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const CheckInOut = () => {
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanningFor, setScanningFor] = useState('');
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    guestName: '',
    reservationId: '',
    action: 'guest-checkin'
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/activity/recent');
      const data = await response.json();
      setRecentActivity(data);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const handleQRScan = (guestData) => {
    if (guestData) {
      setFormData({
        ...formData,
        guestName: guestData.fullName,
      });

      alert(`Guest details loaded: ${guestData.fullName}`);
      setShowQRScanner(false);
      setScanningFor('');
    }
  };

  const startQRScan = (type) => {
    setScanningFor(type);
    setShowQRScanner(true);
  };

  const stayOpsAPI = {
    processAction: async (actionData) => {
      const endpoint = `/api/${actionData.action.replace('-', '/')}`;
      
      const payload = {
        roomNumber: actionData.roomNumber,
        guestName: actionData.guestName || null,
        reservationId: actionData.reservationId || null,
        timestamp: new Date().toISOString(),
        staff: 'Current User'
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    }
  };

  const handleSubmit = async () => {
    if (!formData.roomNumber.trim()) {
      alert('Room number is required');
      return;
    }

    if (formData.action.includes('guest') && !formData.guestName.trim()) {
      alert('Guest name is required for guest operations');
      return;
    }

    setLoading(true);
    
    try {
      const response = await stayOpsAPI.processAction(formData);
      
      if (response.success) {
        await loadRecentActivity();
        
        setFormData({
          roomNumber: '',
          guestName: '',
          reservationId: '',
          action: 'guest-checkin'
        });
        
        alert(response.message || 'Operation completed successfully');
      }
    } catch (error) {
      console.error('Operation failed:', error);
      alert('Operation failed. Please try again.');
    }
    
    setLoading(false);
  };

  const getStatusIndicator = (status) => {
    return status === 'completed' ? '●' : '○';
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Operation Form */}
          <div>
            {/* Header */}
            <div className="border-b-4 border-black pb-6 mb-12">
              <h1 className="text-5xl font-light tracking-tight mb-3">
                Check-In/Out
              </h1>
              <p className="text-sm text-gray-500">
                Terminal Operations
              </p>
            </div>

            {/* Operation Selection */}
            <div className="mb-12">
              <label className="block text-xs text-gray-500 mb-4 uppercase tracking-wide">
                Operation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'guest-checkin', label: 'Check In' },
                  { value: 'guest-checkout', label: 'Check Out' },
                  { value: 'room-cleaning', label: 'Cleaning' },
                  { value: 'room-maintenance', label: 'Maintenance' }
                ].map(option => (
                  <label 
                    key={option.value}
                    className={`flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 border-black transition-colors ${
                      formData.action === option.value 
                        ? 'bg-black text-white' 
                        : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={option.value}
                      checked={formData.action === option.value}
                      onChange={(e) => setFormData({...formData, action: e.target.value})}
                      className="hidden"
                    />
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="mb-12">
              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-4 border-2 border-black bg-white text-black text-center text-2xl font-semibold font-mono focus:outline-none focus:border-gray-600"
                  placeholder="301"
                  maxLength="10"
                />
              </div>

              {formData.action.includes('guest') && (
                <>
                  <div className="mb-6">
                    <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                      Guest Name *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.guestName}
                        onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                        className="flex-1 px-4 py-3 border-2 border-black bg-white text-black text-sm focus:outline-none focus:border-gray-600"
                        placeholder="John Smith"
                      />
                      <button
                        type="button"
                        onClick={() => startQRScan('guest')}
                        className="px-6 py-3 text-sm font-semibold border-2 border-black bg-white text-black uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                      >
                        Scan
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                      Reservation ID
                    </label>
                    <input
                      type="text"
                      value={formData.reservationId}
                      onChange={(e) => setFormData({...formData, reservationId: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-3 border-2 border-black bg-white text-black font-mono text-sm focus:outline-none focus:border-gray-600"
                      placeholder="RES001"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full px-6 py-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {loading ? 'Processing...' : 'Execute Operation'}
            </button>
          </div>

          {/* Right Column - Activity Log */}
          <div>
            <div className="border-b-4 border-black pb-4 mb-6">
              <h2 className="text-2xl font-light tracking-tight">
                Activity Log
              </h2>
            </div>

            <div className="border-2 border-black max-h-96 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center text-gray-400 italic text-sm">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`p-4 ${
                      index < recentActivity.length - 1 ? 'border-b border-gray-200' : ''
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          activity.status === 'completed' ? 'text-black' : 'text-gray-400'
                        }`}>
                          {getStatusIndicator(activity.status)}
                        </span>
                        <span className="font-semibold text-sm uppercase tracking-wide">
                          {activity.type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><strong>Room:</strong> {activity.room}</div>
                      {activity.guest && (
                        <div><strong>Guest:</strong> {activity.guest}</div>
                      )}
                      {activity.staff && (
                        <div><strong>Staff:</strong> {activity.staff}</div>
                      )}
                      <div className={`text-xs font-semibold uppercase tracking-wide ${
                        activity.status === 'completed' ? 'text-black' : 'text-gray-500'
                      }`}>
                        {activity.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* API Documentation */}
            <div className="mt-12 border-2 border-black bg-gray-50">
              <div className="p-4 border-b border-black bg-black text-white">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  API Endpoints
                </h3>
              </div>
              <div className="p-4">
                <div className="text-xs font-mono leading-relaxed space-y-2">
                  <div><strong>POST</strong> /api/guest/checkin</div>
                  <div><strong>POST</strong> /api/guest/checkout</div>
                  <div><strong>POST</strong> /api/room/cleaning</div>
                  <div><strong>POST</strong> /api/room/maintenance</div>
                  
                  <div className="bg-white border border-gray-300 p-3 mt-4 text-xs">
{`{
  "roomNumber": "301",
  "guestName": "John Smith",
  "reservationId": "RES001",
  "timestamp": "2025-09-25T14:30:00Z",
  "staff": "Current User"
}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          title={scanningFor === 'guest' ? 'Scan Guest QR Code' : 'Scan Reservation QR Code'}
          onClose={() => {
            setShowQRScanner(false);
            setScanningFor('');
          }}
          onGuestDataReceived={scanningFor === 'guest' ? handleQRScan : null}
        />
      )}
    </div>
  );
};

export default CheckInOut;