import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import '../styles/qr-scanner.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const QRScanner = () => {
  const [result, setResult] = useState("");
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
      const SCAN_COOLDOWN = 2000; // 2 seconds between scans

      controlsRef.current = await codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (res, err) => {
          if (res) {
            const qrValue = res.getText();
            const currentTime = Date.now();
            
            // Prevent rapid re-scanning of the same code
            if (qrValue === lastScannedCode && (currentTime - lastScanTime) < SCAN_COOLDOWN) {
              return;
            }
            
            console.log("QR Detected:", qrValue);
            setResult(qrValue);
            lastScannedCode = qrValue;
            lastScanTime = currentTime;
            
            // Add small delay before fetching for better UX
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

  const resetScanner = () => {
    stopCamera();
    setResult("");
    setGuestData(null);
    setError(null);
    setCameraError(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-wrapper">
        
        {/* Header */}
        <div className="qr-scanner-header">
          <div className="qr-scanner-header-info">
            <h1>QR Scanner</h1>
            <p className="qr-scanner-header-count">
              Scan guest QR code to retrieve information
            </p>
          </div>
        </div>

        <div className="qr-scanner-content">
          {!guestData && (
            <div className="scanner-card">
              <div className="scanner-section">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="scanner-video"
              />
              
              {result && (
                <div className="qr-detected">
                  ✓ QR Code Detected: {result}
                </div>
              )}
              
              <div className="scanner-actions">
                {!scanning ? (
                  <button
                    onClick={startCamera}
                    className="btn-start-camera"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="btn-stop-camera"
                  >
                    Stop Camera
                  </button>
                )}
              </div>
            </div>

              {cameraError && (
                <div className="error-container">
                  <div className="error-message">
                    <p>⚠ {cameraError}</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="error-container">
                  <div className="error-message">
                    <p>⚠ {error}</p>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading guest data...</p>
                </div>
              )}
            </div>
          )}

          {guestData && (
            <div className="guest-details-card">
              <div className="guest-details-header">
              <h2 className="guest-details-title">Guest Details</h2>
              <button
                onClick={resetScanner}
                className="btn-scan-again"
              >
                Scan Again
              </button>
            </div>
            
            <div className="guest-images">
              {guestData.imageUrl && (
                <div className="image-container">
                  <img
                    src={guestData.imageUrl}
                    alt="Guest"
                    className="guest-image"
                  />
                  <p className="image-label">Profile Image</p>
                </div>
              )}

              {guestData.qrCodeBase64 && (
                <div className="image-container">
                  <img
                    src={guestData.qrCodeBase64}
                    alt="QR Code"
                    className="qr-image"
                  />
                  <p className="image-label">QR Code</p>
                </div>
              )}
            </div>

            <div className="guest-info">
              <div className="info-item">
                <div className="info-label">Name</div>
                <div className="info-value">{guestData.fullName}</div>
              </div>

              <div className="info-item">
                <div className="info-label">Email</div>
                <div className="info-value">{guestData.email}</div>
              </div>

              <div className="info-item">
                <div className="info-label">Phone</div>
                <div className="info-value">{guestData.phone}</div>
              </div>

              <div className="info-item">
                <div className="info-label">Nationality</div>
                <div className="info-value">{guestData.nationality}</div>
              </div>

              <div className="info-item">
                <div className="info-label">{guestData.identityType}</div>
                <div className="info-value">{guestData.identityNumber}</div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;