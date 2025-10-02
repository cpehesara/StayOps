import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-16">
          <h1 className="text-5xl font-light tracking-tight text-black mb-3">
            QR Scanner
          </h1>
          <p className="text-gray-500 text-sm">
            Scan guest QR code to retrieve information
          </p>
        </div>

        {!guestData && (
          <div>
            <div className="border border-gray-200 p-8 text-center mb-8">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto border border-gray-200 bg-black mb-6"
              />
              
              {result && (
                <div className="mb-6 p-4 bg-black text-white text-sm">
                  ✓ QR Code Detected: {result}
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                {!scanning ? (
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
                  >
                    Start Camera
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
              <div className="p-4 border border-gray-300 mb-4 text-sm">
                ⚠ {cameraError}
              </div>
            )}
            
            {error && (
              <div className="p-4 border border-gray-300 mb-4 text-sm">
                ⚠ {error}
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
          <div className="border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-light tracking-tight">
                Guest Details
              </h2>
              <button
                onClick={resetScanner}
                className="px-6 py-3 border border-gray-200 text-black text-sm hover:border-black transition-colors"
              >
                Scan Again
              </button>
            </div>
            
            <div className="flex gap-8 mb-8 justify-center flex-wrap">
              {guestData.imageUrl && (
                <div className="text-center">
                  <img
                    src={guestData.imageUrl}
                    alt="Guest"
                    className="w-40 h-40 object-cover border border-gray-200 grayscale"
                  />
                  <p className="mt-3 text-xs text-gray-500">Profile Image</p>
                </div>
              )}

              {guestData.qrCodeBase64 && (
                <div className="text-center">
                  <img
                    src={guestData.qrCodeBase64}
                    alt="QR Code"
                    className="w-40 h-40 border border-gray-200"
                  />
                  <p className="mt-3 text-xs text-gray-500">QR Code</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Name</div>
                <div className="text-black">{guestData.fullName}</div>
              </div>

              <div className="pb-4 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="text-black">{guestData.email}</div>
              </div>

              <div className="pb-4 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="text-black">{guestData.phone}</div>
              </div>

              <div className="pb-4 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Nationality</div>
                <div className="text-black">{guestData.nationality}</div>
              </div>

              <div className="pb-4 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">{guestData.identityType}</div>
                <div className="text-black">{guestData.identityNumber}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;