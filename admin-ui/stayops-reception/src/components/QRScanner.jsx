import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import {
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  QrCode,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// API base URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const QRScanner = () => {
  const [result, setResult] = useState("");
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);

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
            fetchGuestData(qrValue.trim()); // API call with guestId
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
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          border: "2px solid black",
          borderRadius: "8px",
        }}
      >
        {/* Header */}
        <div style={{ backgroundColor: "black", color: "white", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <QrCode size={24} />
            <div>
              <h1 style={{ margin: 0, fontSize: "24px" }}>QR Scanner</h1>
              <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>
                Scan QR code to get guest details
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Scanner Section */}
          {!guestData && (
            <div>
              <div
                style={{
                  border: "1px solid black",
                  padding: "20px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {!result ? (
                  <div>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        border: "2px solid black",
                      }}
                    />
                    <div style={{ marginTop: "15px" }}>
                      <button
                        onClick={startCamera}
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          border: "none",
                          padding: "12px 24px",
                          cursor: "pointer",
                          fontSize: "16px",
                          marginRight: "10px",
                        }}
                      >
                        <Camera size={16} /> Start Camera
                      </button>
                      <button
                        onClick={stopCamera}
                        style={{
                          backgroundColor: "gray",
                          color: "white",
                          border: "none",
                          padding: "12px 24px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        Stop Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>
                    <CheckCircle color="green" /> QR Code Detected: {result}
                  </p>
                )}
              </div>

              {cameraError && (
                <p style={{ color: "red" }}>
                  <AlertCircle /> {cameraError}
                </p>
              )}
              {error && (
                <p style={{ color: "red" }}>
                  <AlertCircle /> {error}
                </p>
              )}
              {loading && <p>Loading guest data...</p>}
            </div>
          )}

          {/* Guest Data Section */}
          {guestData && (
            <div
              style={{
                border: "1px solid black",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h2 style={{ marginBottom: "15px" }}>Guest Details</h2>
              
              {/* Guest Photo + QR Code side by side */}
              <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
                {guestData.imageUrl && (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={guestData.imageUrl}
                      alt="Guest"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid black",
                      }}
                    />
                    <p style={{ marginTop: "8px" }}>Profile Image</p>
                  </div>
                )}

                {guestData.qrCodeBase64 && (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={guestData.qrCodeBase64}
                      alt="QR Code"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "8px",
                        border: "2px solid black",
                      }}
                    />
                    <p style={{ marginTop: "8px" }}>QR Code</p>
                  </div>
                )}
              </div>

              {/* Guest Info */}
              <p><User size={16} /> <strong>Name:</strong> {guestData.fullName}</p>
              <p><Mail size={16} /> <strong>Email:</strong> {guestData.email}</p>
              <p><Phone size={16} /> <strong>Phone:</strong> {guestData.phone}</p>
              <p><MapPin size={16} /> <strong>Nationality:</strong> {guestData.nationality}</p>
              <p><CreditCard size={16} /> <strong>{guestData.identityType}:</strong> {guestData.identityNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
