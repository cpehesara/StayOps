// api/billing.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const billingAPI = {
  // ==================== FOLIO MANAGEMENT ====================
  
  /**
   * Get all folios
   */
  getAllFolios: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch folios');
      return await response.json();
    } catch (error) {
      console.error('Error fetching folios:', error);
      throw error;
    }
  },

  /**
   * Get folio by ID
   */
  getFolioById: async (folioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/${folioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch folio');
      return await response.json();
    } catch (error) {
      console.error('Error fetching folio:', error);
      throw error;
    }
  },

  /**
   * Get folio by folio number
   */
  getFolioByNumber: async (folioNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/number/${folioNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch folio');
      return await response.json();
    } catch (error) {
      console.error('Error fetching folio by number:', error);
      throw error;
    }
  },

  /**
   * Get folio by reservation ID
   */
  getFolioByReservation: async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/reservation/${reservationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch folio');
      return await response.json();
    } catch (error) {
      console.error('Error fetching folio by reservation:', error);
      throw error;
    }
  },

  /**
   * Get folios by status
   */
  getFoliosByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch folios');
      return await response.json();
    } catch (error) {
      console.error('Error fetching folios by status:', error);
      throw error;
    }
  },

  /**
   * Create folio for a reservation
   */
  createFolio: async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/create/${reservationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to create folio');
      return await response.json();
    } catch (error) {
      console.error('Error creating folio:', error);
      throw error;
    }
  },

  // ==================== LINE ITEMS ====================

  /**
   * Add line item to folio
   */
  addLineItem: async (folioId, lineItemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/${folioId}/line-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lineItemData),
      });
      if (!response.ok) throw new Error('Failed to add line item');
      return await response.json();
    } catch (error) {
      console.error('Error adding line item:', error);
      throw error;
    }
  },

  /**
   * Get all line items for a folio
   */
  getFolioLineItems: async (folioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/${folioId}/line-items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch line items');
      return await response.json();
    } catch (error) {
      console.error('Error fetching line items:', error);
      throw error;
    }
  },

  /**
   * Void a line item
   */
  voidLineItem: async (lineItemId, voidedBy, voidReason) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/folios/line-items/${lineItemId}/void?voidedBy=${encodeURIComponent(voidedBy)}&voidReason=${encodeURIComponent(voidReason)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to void line item');
      return response;
    } catch (error) {
      console.error('Error voiding line item:', error);
      throw error;
    }
  },

  // ==================== FOLIO ACTIONS ====================

  /**
   * Settle a folio
   */
  settleFolio: async (folioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/${folioId}/settle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to settle folio');
      return await response.json();
    } catch (error) {
      console.error('Error settling folio:', error);
      throw error;
    }
  },

  /**
   * Close a folio
   */
  closeFolio: async (folioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/${folioId}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to close folio');
      return await response.json();
    } catch (error) {
      console.error('Error closing folio:', error);
      throw error;
    }
  },

  /**
   * Generate invoice PDF
   */
  generateInvoice: async (folioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folios/${folioId}/invoice`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      if (!response.ok) throw new Error('Failed to generate invoice');
      return await response.blob();
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  },

  // ==================== PAYMENT PROCESSING ====================

  /**
   * Process payment (adds payment as line item)
   */
  processPayment: async (folioId, paymentData) => {
    try {
      const lineItemData = {
        itemType: 'PAYMENT',
        description: paymentData.description || 'Payment received',
        amount: -Math.abs(paymentData.amount), // Negative for payment
        quantity: 1,
        unitPrice: -Math.abs(paymentData.amount),
        reference: paymentData.reference || `PAY-${Date.now()}`,
        postedBy: paymentData.postedBy || 'System',
        department: 'FRONT_DESK',
        notes: paymentData.notes || `Payment via ${paymentData.method || 'Cash'}`,
      };

      return await billingAPI.addLineItem(folioId, lineItemData);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // ==================== BILLING SERVICE ENDPOINTS ====================

  /**
   * Create folio via billing service
   */
  createFolioForReservation: async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/folios/reservation/${reservationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to create folio');
      return await response.json();
    } catch (error) {
      console.error('Error creating folio via billing service:', error);
      throw error;
    }
  },

  /**
   * Get folio by reservation via billing service
   */
  getBillingFolioByReservation: async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/folios/reservation/${reservationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch folio');
      return await response.json();
    } catch (error) {
      console.error('Error fetching folio via billing service:', error);
      throw error;
    }
  },

  /**
   * Add room charge
   */
  addRoomCharge: async (reservationId, date = null) => {
    try {
      const url = date
        ? `${API_BASE_URL}/billing/folios/reservation/${reservationId}/room-charge?date=${date}`
        : `${API_BASE_URL}/billing/folios/reservation/${reservationId}/room-charge`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to add room charge');
      return await response.json();
    } catch (error) {
      console.error('Error adding room charge:', error);
      throw error;
    }
  },

  /**
   * Add service charge
   */
  addServiceCharge: async (reservationId, serviceRequestId, serviceType, amount = null) => {
    try {
      let url = `${API_BASE_URL}/billing/folios/reservation/${reservationId}/service-charge?serviceRequestId=${serviceRequestId}&serviceType=${serviceType}`;
      if (amount) {
        url += `&amount=${amount}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to add service charge');
      return await response.json();
    } catch (error) {
      console.error('Error adding service charge:', error);
      throw error;
    }
  },

  /**
   * Generate bill PDF
   */
  generateBillPdf: async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/folios/reservation/${reservationId}/bill/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      if (!response.ok) throw new Error('Failed to generate bill');
      return await response.blob();
    } catch (error) {
      console.error('Error generating bill:', error);
      throw error;
    }
  },

  /**
   * Send bill to guest via email
   */
  sendBillToGuest: async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/folios/reservation/${reservationId}/bill/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to send bill');
      return await response.text();
    } catch (error) {
      console.error('Error sending bill:', error);
      throw error;
    }
  },

  // ==================== RESERVATIONS ====================

  /**
   * Get all reservations (for creating folios)
   */
  getAllReservations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/getAll`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch reservations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  },

  // ==================== PAYMENT TRANSACTIONS ====================

  /**
   * Initiate payment transaction
   */
  initiatePayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error('Failed to initiate payment');
      return await response.json();
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  },

  /**
   * Get payments for a reservation
   */
  getReservationPayments: async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/reservation/${reservationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  /**
   * Capture authorized payment
   */
  capturePayment: async (transactionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${transactionId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to capture payment');
      return await response.json();
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw error;
    }
  },

  /**
   * Initiate refund
   */
  initiateRefund: async (transactionId, amount, reason = null) => {
    try {
      let url = `${API_BASE_URL}/payments/${transactionId}/refund?amount=${amount}`;
      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to initiate refund');
      return await response.json();
    } catch (error) {
      console.error('Error initiating refund:', error);
      throw error;
    }
  },
};

export default billingAPI;