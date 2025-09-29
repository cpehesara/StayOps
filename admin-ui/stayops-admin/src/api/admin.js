// src/api/admin.js

// Detect environment and choose correct backend URL
// Replace with your real LAN IP (e.g., 192.168.1.23)
const LAPTOP_IP = "192.168.1.23"; 

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/api"           // when running on laptop
    : `http://${LAPTOP_IP}:8080/api`;       // when accessed from phone/LAN

// Basic Auth header
const authHeader = () => {
  const credentials = btoa("admin:admin"); // encode admin/admin
  return {
    "Content-Type": "application/json",
    "Authorization": `Basic ${credentials}`,
  };
};

export const adminAPI = {
  registerReceptionist: async (receptionistData) => {
    const response = await fetch(`${API_BASE_URL}/receptionists/register`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(receptionistData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }
    return data;
  },
};
