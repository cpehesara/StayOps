const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

export const getDailyMetrics = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/metrics/automation/daily?date=${date}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error(`Failed to fetch metrics: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    throw error;
  }
};

export const getTodayMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metrics/automation/today`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch today metrics: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching today metrics:', error);
    throw error;
  }
};

export default {
  getDailyMetrics,
  getTodayMetrics,
};