import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Printer, CreditCard, DollarSign, X, AlertCircle } from 'lucide-react';
import billingAPI from '../api/billing-api';
import AddChargeModal from './AddChargeModal';
import AddPaymentModal from './AddPaymentModal';
import '../styles/billing-styles.css';

const FolioDetails = ({ folio: initialFolio, onClose }) => {
  const [folio, setFolio] = useState(initialFolio);
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFolioDetails();
  }, [folio.id]);

  const loadFolioDetails = async () => {
    try {
      setLoading(true);
      const [folioData, lineItemsData] = await Promise.all([
        billingAPI.getFolioById(folio.id),
        billingAPI.getFolioLineItems(folio.id)
      ]);
      setFolio(folioData);
      setLineItems(lineItemsData);
    } catch (error) {
      console.error('Error loading folio details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (folio.balance > 0) {
      alert('Cannot settle folio with outstanding balance');
      return;
    }

    if (!window.confirm('Are you sure you want to settle this folio?')) {
      return;
    }

    try {
      setActionLoading(true);
      const updated = await billingAPI.settleFolio(folio.id);
      setFolio(updated);
      alert('Folio settled successfully');
    } catch (error) {
      console.error('Error settling folio:', error);
      alert('Failed to settle folio');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (folio.balance !== 0) {
      alert('Cannot close folio with non-zero balance');
      return;
    }

    if (!window.confirm('Are you sure you want to close this folio?')) {
      return;
    }

    try {
      setActionLoading(true);
      const updated = await billingAPI.closeFolio(folio.id);
      setFolio(updated);
      alert('Folio closed successfully');
    } catch (error) {
      console.error('Error closing folio:', error);
      alert('Failed to close folio');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      const blob = await billingAPI.generateInvoice(folio.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    }
  };

  const handleVoidLineItem = async (lineItemId) => {
    const reason = window.prompt('Enter void reason:');
    if (!reason) return;

    try {
      await billingAPI.voidLineItem(lineItemId, 'System', reason);
      loadFolioDetails();
    } catch (error) {
      console.error('Error voiding line item:', error);
      alert('Failed to void line item');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: folio.currency || 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="folio-details-container">
      {/* Header */}
      <div className="folio-header">
        <div className="folio-header-content">
          <div className="folio-header-inner">
            <div className="folio-header-left">
              <button onClick={onClose} className="back-button">
                <ArrowLeft size={24} color="#6B7280" />
              </button>
              <div>
                <h1 className="folio-title">Folio Details</h1>
                <p className="folio-subtitle">{folio.folioNumber}</p>
              </div>
            </div>
            <div className="folio-actions">
              <button onClick={handlePrintInvoice} className="btn-outline">
                <Printer size={18} />
                Print Invoice
              </button>
              {folio.status === 'OPEN' && (
                <>
                  <button
                    onClick={handleSettle}
                    disabled={folio.balance > 0 || actionLoading}
                    className="btn-primary"
                  >
                    <CreditCard size={18} />
                    Settle Folio
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={folio.balance !== 0 || actionLoading}
                    className="btn-outline"
                  >
                    Close Folio
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="folio-content">
        <div className="folio-grid">
          {/* Folio Information */}
          <div className="folio-sidebar">
            {/* Guest Info */}
            <div className="info-card">
              <h2 className="card-title">Guest Information</h2>
              <div className="info-item">
                <span className="info-label">Guest Name</span>
                <span className="info-value">{folio.guestName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{folio.guestEmail}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Room Number</span>
                <span className="info-value">{folio.roomNumber || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Reservation ID</span>
                <span className="info-value">{folio.reservationId}</span>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="info-card">
              <h2 className="card-title">Balance Summary</h2>
              <div className="balance-row">
                <span className="balance-label">Status</span>
                <span style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: folio.status === 'SETTLED' ? '#000' : '#F3F4F6',
                  color: folio.status === 'SETTLED' ? '#FFF' : '#1F2937'
                }}>
                  {folio.status}
                </span>
              </div>
              <div className="balance-row" style={{ paddingTop: '8px', borderTop: '1px solid #E5E7EB' }}>
                <span className="balance-label">Total Charges</span>
                <span className="balance-value">{formatCurrency(folio.totalCharges)}</span>
              </div>
              <div className="balance-row">
                <span className="balance-label">Total Payments</span>
                <span className="balance-value">{formatCurrency(folio.totalPayments)}</span>
              </div>
              <div className="balance-row total">
                <span className="balance-label" style={{ fontSize: '16px', fontWeight: 500 }}>Balance Due</span>
                <span className="balance-amount">{formatCurrency(folio.balance)}</span>
              </div>

              {folio.balance > 0 && (
                <div className="alert-box">
                  <AlertCircle size={18} color="#6B7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p className="alert-title">Outstanding Balance</p>
                    <p className="alert-text">Payment required before settling</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {folio.status === 'OPEN' && (
              <div className="info-card">
                <h2 className="card-title">Quick Actions</h2>
                <div className="quick-actions">
                  <button
                    onClick={() => setShowAddCharge(true)}
                    className="btn-full primary"
                  >
                    <Plus size={18} />
                    Add Charge
                  </button>
                  <button
                    onClick={() => setShowAddPayment(true)}
                    className="btn-full secondary"
                  >
                    <DollarSign size={18} />
                    Add Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div>
            <div className="transactions-card">
              <div className="transactions-header">
                <h2 className="card-title">Transaction History</h2>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : lineItems.length === 0 ? (
                <div className="empty-state">
                  No transactions found
                </div>
              ) : (
                <div className="transactions-list">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className={`transaction-item ${item.isVoided ? 'voided' : ''}`}
                    >
                      <div className="transaction-content">
                        <div className="transaction-details">
                          <div>
                            <span className="transaction-type">{item.itemType}</span>
                            {item.isVoided && (
                              <span style={{
                                fontSize: '12px',
                                color: '#DC2626',
                                fontWeight: 500,
                                marginLeft: '8px'
                              }}>VOIDED</span>
                            )}
                          </div>
                          <p className="transaction-description">{item.description}</p>
                          <div className="transaction-meta">
                            <span>{formatDate(item.createdAt)}</span>
                            {item.reference && <span>Ref: {item.reference}</span>}
                            {item.postedBy && <span>By: {item.postedBy}</span>}
                          </div>
                          {item.notes && (
                            <p className="transaction-notes">{item.notes}</p>
                          )}
                          {item.isVoided && item.voidReason && (
                            <p style={{
                              fontSize: '12px',
                              color: '#DC2626',
                              marginTop: '4px'
                            }}>Void Reason: {item.voidReason}</p>
                          )}
                        </div>
                        <div className="transaction-amount-section">
                          <p className="transaction-amount">
                            {item.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
                          </p>
                          {item.quantity > 1 && (
                            <p className="transaction-unit-price">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          )}
                          {!item.isVoided && folio.status === 'OPEN' && (
                            <button
                              onClick={() => handleVoidLineItem(item.id)}
                              className="void-button"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddCharge && (
        <AddChargeModal
          folioId={folio.id}
          onClose={() => setShowAddCharge(false)}
          onSuccess={() => {
            setShowAddCharge(false);
            loadFolioDetails();
          }}
        />
      )}

      {showAddPayment && (
        <AddPaymentModal
          folioId={folio.id}
          balance={folio.balance}
          onClose={() => setShowAddPayment(false)}
          onSuccess={() => {
            setShowAddPayment(false);
            loadFolioDetails();
          }}
        />
      )}
    </div>
  );
};

export default FolioDetails;