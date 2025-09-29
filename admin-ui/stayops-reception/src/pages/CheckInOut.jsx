import React, { useState, useEffect } from 'react';

// QR Scanner Component - Your existing component
const QRScanner = ({ onGuestDataReceived, onClose }) => {
  const [result, setResult] = useState("");
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = React.useRef(null);
  const codeReaderRef = React.useRef(null);
  const controlsRef = React.useRef(null);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  // Fetch guest details from backend
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
      
      // Pass guest data back to parent component
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

  // Start camera and QR scanning
  const startCamera = async () => {
    try {
      setError(null);
      setCameraError(null);
      setGuestData(null);
      setResult("");

      // Import BrowserQRCodeReader dynamically
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      controlsRef.current = await codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (res, err) => {
          if (res) {
            const qrValue = res.getText();
            console.log("QR Detected:", qrValue);
            setResult(qrValue);
            fetchGuestData(qrValue.trim());
          }
          if (err && !(err.name === "NotFoundException")) {
            console.error("QR scan error:", err);
          }
        }
      );
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  // Stop camera when done
  const stopCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '500px' }}>
      {/* Scanner Section */}
      {!guestData && (
        <div>
          <div style={{
            border: "2px solid #000",
            padding: "20px",
            textAlign: "center",
            marginBottom: "20px",
            backgroundColor: '#fff'
          }}>
            {!result ? (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    maxHeight: "300px",
                    border: "2px solid #000",
                    backgroundColor: '#f8f8f8'
                  }}
                />
                <div style={{ marginTop: "15px" }}>
                  <button
                    onClick={startCamera}
                    style={{
                      backgroundColor: "#000",
                      color: "#fff",
                      border: "2px solid #000",
                      padding: "12px 24px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: '600',
                      marginRight: "10px",
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Start Camera
                  </button>
                  <button
                    onClick={stopCamera}
                    style={{
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "2px solid #000",
                      padding: "12px 24px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
                  ✓ QR Code Detected
                </div>
                <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                  {result}
                </div>
              </div>
            )}
          </div>

          {cameraError && (
            <div style={{ 
              color: "#c62828", 
              backgroundColor: '#ffebee', 
              border: '2px solid #f44336',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              ⚠ {cameraError}
            </div>
          )}
          
          {error && (
            <div style={{ 
              color: "#c62828", 
              backgroundColor: '#ffebee', 
              border: '2px solid #f44336',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              ⚠ {error}
            </div>
          )}
          
          {loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Loading guest data...
            </div>
          )}
        </div>
      )}

      {/* Guest Data Section */}
      {guestData && (
        <div style={{
          border: "2px solid #000",
          padding: "20px",
          backgroundColor: "#f8f8f8",
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            marginBottom: "15px", 
            fontSize: '18px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Guest Details Found
          </h3>
          
          {/* Guest Images */}
          {(guestData.imageUrl || guestData.qrCodeBase64) && (
            <div style={{ 
              display: "flex", 
              gap: "20px", 
              marginBottom: "20px",
              justifyContent: 'center'
            }}>
              {guestData.imageUrl && (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={guestData.imageUrl}
                    alt="Guest"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      border: "2px solid #000",
                    }}
                  />
                  <div style={{ marginTop: "8px", fontSize: '12px', fontWeight: '600' }}>
                    Profile
                  </div>
                </div>
              )}

              {guestData.qrCodeBase64 && (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={guestData.qrCodeBase64}
                    alt="QR Code"
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "2px solid #000",
                    }}
                  />
                  <div style={{ marginTop: "8px", fontSize: '12px', fontWeight: '600' }}>
                    QR Code
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guest Info */}
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: "8px" }}>
              <strong>Name:</strong> {guestData.fullName}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Email:</strong> {guestData.email}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Phone:</strong> {guestData.phone}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Nationality:</strong> {guestData.nationality}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>{guestData.identityType}:</strong> {guestData.identityNumber}
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              if (onClose) onClose();
            }}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              border: '2px solid #000',
              backgroundColor: '#000',
              color: '#fff',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '32px',
        border: '3px solid #000',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '24px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 24px 0'
        }}>
          {title}
        </h3>
        
        <QRScanner 
          onGuestDataReceived={onGuestDataReceived}
          onClose={onClose}
        />
        
        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            border: '2px solid #000',
            backgroundColor: '#fff',
            color: '#000',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '16px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const CheckInOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanningFor, setScanningFor] = useState(''); // 'guest' or 'reservation'
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    guestName: '',
    reservationId: '',
    action: 'guest-checkin'
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load recent activity on component mount
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

  // QR Code scanning functions
  const handleQRScan = (guestData) => {
    if (guestData) {
      // Populate form with guest data from QR scan
      setFormData({
        ...formData,
        guestName: guestData.fullName,
        // You can also populate room number if available in guest data
        // roomNumber: guestData.roomNumber || formData.roomNumber,
        // reservationId: guestData.reservationId || formData.reservationId
      });

      alert(`Guest details loaded: ${guestData.fullName}`);
      setShowQRScanner(false);
      setScanningFor('');
    }
  };

  const handleGuestQRScan = async (qrData) => {
    // This is now handled by the QRScanner component itself
    // The QRScanner will fetch guest data and call handleQRScan
  };

  const handleReservationQRScan = async (qrData) => {
    try {
      // Parse QR data for reservation
      let reservationId;
      
      try {
        const parsed = JSON.parse(qrData);
        reservationId = parsed.reservationId || parsed.id;
      } catch {
        reservationId = qrData;
      }

      // Fetch reservation details from backend
      const response = await fetch(`/api/reservation/${reservationId}`);
      if (!response.ok) {
        throw new Error('Reservation not found');
      }

      const reservationData = await response.json();
      
      // Populate form with reservation data
      setFormData({
        ...formData,
        reservationId: reservationData.id,
        guestName: reservationData.guestName,
        roomNumber: reservationData.roomNumber || formData.roomNumber
      });

      alert(`Reservation details loaded: ${reservationData.id}`);
    } catch (error) {
      console.error('Failed to load reservation details:', error);
      alert('Failed to load reservation details from QR code');
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
        staff: 'Current User' // Replace with actual user from auth
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${authToken}`
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
        // Reload recent activity to get updated data
        await loadRecentActivity();
        
        // Reset form
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      'guest-checkin': 'Check In',
      'guest-checkout': 'Check Out',
      'room-cleaning': 'Cleaning',
      'room-maintenance': 'Maintenance'
    };
    return labels[action] || action;
  };

  const getStatusIndicator = (status) => {
    return status === 'completed' ? '●' : '○';
  };

  const baseInputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #000',
    backgroundColor: '#fff',
    color: '#000',
    outline: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #000',
    backgroundColor: loading ? '#f8f8f8' : '#000',
    color: loading ? '#999' : '#fff',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fff', 
      color: '#000', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      lineHeight: '1.4'
    }}>
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px'
      }}>
        
        {/* Left Column - Operation Form */}
        <div>
          {/* Header */}
          <div style={{ 
            borderBottom: '3px solid #000', 
            paddingBottom: '24px', 
            marginBottom: '32px' 
          }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 16px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              StayOps Terminal
            </h1>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              fontFamily: 'monospace',
              marginBottom: '4px'
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Operation Selection */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Operation Type
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px' 
            }}>
              {[
                { value: 'guest-checkin', label: 'Check In' },
                { value: 'guest-checkout', label: 'Check Out' },
                { value: 'room-cleaning', label: 'Cleaning' },
                { value: 'room-maintenance', label: 'Maintenance' }
              ].map(option => (
                <label key={option.value} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  padding: '12px',
                  border: '2px solid #000',
                  backgroundColor: formData.action === option.value ? '#000' : '#fff',
                  color: formData.action === option.value ? '#fff' : '#000',
                  transition: 'all 0.15s ease'
                }}>
                  <input
                    type="radio"
                    name="action"
                    value={option.value}
                    checked={formData.action === option.value}
                    onChange={(e) => setFormData({...formData, action: e.target.value})}
                    style={{ display: 'none' }}
                  />
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Room Number *
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value.toUpperCase()})}
                style={{
                  ...baseInputStyle,
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}
                placeholder="301"
                maxLength="10"
              />
            </div>

            {formData.action.includes('guest') && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Guest Name *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                      style={{ ...baseInputStyle, flex: 1 }}
                      placeholder="John Smith"
                    />
                    <button
                      type="button"
                      onClick={() => startQRScan('guest')}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '2px solid #000',
                        backgroundColor: '#fff',
                        color: '#000',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '100px'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#000';
                        e.target.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.color = '#000';
                      }}
                    >
                      Scan Guest
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Reservation ID
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={formData.reservationId}
                      onChange={(e) => setFormData({...formData, reservationId: e.target.value.toUpperCase()})}
                      style={{
                        ...baseInputStyle,
                        fontFamily: 'monospace',
                        flex: 1
                      }}
                      placeholder="RES001"
                    />
                    <button
                      type="button"
                      onClick={() => startQRScan('reservation')}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '2px solid #000',
                        backgroundColor: '#fff',
                        color: '#000',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '100px'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#000';
                        e.target.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.color = '#000';
                      }}
                    >
                      Scan Res
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={buttonStyle}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#333';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#000';
              }
            }}
          >
            {loading ? 'Processing...' : 'Execute Operation'}
          </button>
        </div>

        {/* Right Column - Activity Log */}
        <div>
          <div style={{ 
            borderBottom: '3px solid #000', 
            paddingBottom: '16px', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Activity Log
            </h2>
          </div>

          <div style={{ 
            maxHeight: '600px', 
            overflowY: 'auto',
            border: '2px solid #000'
          }}>
            {recentActivity.length === 0 ? (
              <div style={{ 
                padding: '32px', 
                textAlign: 'center', 
                color: '#666',
                fontStyle: 'italic'
              }}>
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  style={{ 
                    padding: '16px',
                    borderBottom: index < recentActivity.length - 1 ? '1px solid #e0e0e0' : 'none',
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: activity.status === 'completed' ? '#000' : '#666'
                      }}>
                        {getStatusIndicator(activity.status)}
                      </span>
                      <span style={{ 
                        fontWeight: '600', 
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {activity.type}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      fontFamily: 'monospace',
                      color: '#666'
                    }}>
                      {activity.time}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#333' }}>
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Room:</strong> {activity.room}
                    </div>
                    {activity.guest && (
                      <div style={{ marginBottom: '2px' }}>
                        <strong>Guest:</strong> {activity.guest}
                      </div>
                    )}
                    {activity.staff && (
                      <div style={{ marginBottom: '2px' }}>
                        <strong>Staff:</strong> {activity.staff}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '12px',
                      color: activity.status === 'completed' ? '#000' : '#666',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {activity.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* API Documentation */}
          <div style={{ 
            marginTop: '32px',
            border: '2px solid #000',
            backgroundColor: '#f8f8f8'
          }}>
            <div style={{ 
              padding: '16px',
              borderBottom: '1px solid #000',
              backgroundColor: '#000',
              color: '#fff'
            }}>
              <h3 style={{ 
                fontSize: '14px',
                fontWeight: '600', 
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                API Endpoints
              </h3>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>POST</strong> /api/guest/checkin
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>POST</strong> /api/guest/checkout
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>POST</strong> /api/room/cleaning
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>POST</strong> /api/room/maintenance
                </div>
                
                <div style={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ccc',
                  padding: '12px',
                  fontSize: '11px'
                }}>
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