const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// ==================== AUTOMATION CONFIGURATION ====================

export const getAutomationConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/config`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching automation config:', error);
    throw error;
  }
};

export const updateAutomationConfig = async (updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/config`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`Failed to update config: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating automation config:', error);
    throw error;
  }
};

export const getAutomationStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/status`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching automation status:', error);
    throw error;
  }
};

// ==================== HOUSEKEEPING MANAGEMENT ====================

export const getPendingHousekeepingTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/housekeeping/pending`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

export const getUrgentHousekeepingTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/housekeeping/urgent`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch urgent tasks: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching urgent tasks:', error);
    throw error;
  }
};

export const getTasksByDate = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/housekeeping/date/${date}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks by date:', error);
    throw error;
  }
};

export const completeHousekeepingTask = async (id, completedBy) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/automation/housekeeping/${id}/complete?completedBy=${encodeURIComponent(completedBy)}`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error(`Failed to complete task: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

// ==================== DYNAMIC PRICING ====================

export const getAllPricingRules = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/pricing/rules`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch pricing rules: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    throw error;
  }
};

export const getActivePricingRules = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/pricing/rules/active`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch active rules: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching active pricing rules:', error);
    throw error;
  }
};

export const createPricingRule = async (ruleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/pricing/rules`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(ruleData),
    });
    if (!response.ok) throw new Error(`Failed to create rule: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    throw error;
  }
};

export const updatePricingRule = async (id, ruleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/pricing/rules/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(ruleData),
    });
    if (!response.ok) throw new Error(`Failed to update rule: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    throw error;
  }
};

export const deletePricingRule = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/pricing/rules/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete rule: ${response.status}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    throw error;
  }
};

export const triggerPriceUpdate = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/pricing/update-all`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to trigger price update: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error triggering price update:', error);
    throw error;
  }
};

// ==================== FRAUD DETECTION ====================

export const getPendingFraudAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/fraud/alerts/pending`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch alerts: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending fraud alerts:', error);
    throw error;
  }
};

export const getHighRiskAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/fraud/alerts/high-risk`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch high-risk alerts: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching high-risk alerts:', error);
    throw error;
  }
};

export const getAllFraudAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/fraud/alerts`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch all alerts: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching all fraud alerts:', error);
    throw error;
  }
};

export const reviewFraudAlert = async (id, status, reviewedBy, notes = null) => {
  try {
    const params = new URLSearchParams({
      status,
      reviewedBy,
      ...(notes && { notes })
    });
    
    const response = await fetch(
      `${API_BASE_URL}/api/automation/fraud/alerts/${id}/review?${params}`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error(`Failed to review alert: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error reviewing fraud alert:', error);
    throw error;
  }
};

// ==================== OTA CHANNEL MANAGEMENT ====================

export const syncAvailabilityToOTA = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/automation/ota/sync-availability?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error(`Failed to sync availability: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error syncing availability:', error);
    throw error;
  }
};

export const syncRatesToOTA = async (roomTypeRates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/ota/sync-rates`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(roomTypeRates),
    });
    if (!response.ok) throw new Error(`Failed to sync rates: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error syncing rates:', error);
    throw error;
  }
};

// ==================== MANUAL TRIGGERS ====================

export const triggerNoShowProcessing = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/jobs/process-no-shows`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to trigger no-show processing: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error triggering no-show processing:', error);
    throw error;
  }
};

export const triggerNightlyAudit = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/automation/jobs/nightly-audit`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to trigger nightly audit: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error triggering nightly audit:', error);
    throw error;
  }
};

export default {
  getAutomationConfig,
  updateAutomationConfig,
  getAutomationStatus,
  getPendingHousekeepingTasks,
  getUrgentHousekeepingTasks,
  getTasksByDate,
  completeHousekeepingTask,
  getAllPricingRules,
  getActivePricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  triggerPriceUpdate,
  getPendingFraudAlerts,
  getHighRiskAlerts,
  getAllFraudAlerts,
  reviewFraudAlert,
  syncAvailabilityToOTA,
  syncRatesToOTA,
  triggerNoShowProcessing,
  triggerNightlyAudit,
};