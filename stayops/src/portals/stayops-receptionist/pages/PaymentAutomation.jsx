import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import '../styles/billing-styles.css';

const PaymentAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadPayments();
  }, [filterStatus]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Placeholder data
      const placeholderData = [
        {
          id: 1,
          reservationId: 'RES001',
          guestName: 'John Doe',
          amount: 250.00,
          status: 'COMPLETED',
          paymentMethod: 'CREDIT_CARD',
          processedAt: new Date().toISOString(),
          transactionId: 'TXN123456'
        },
        {
          id: 2,
          reservationId: 'RES002',
          guestName: 'Jane Smith',
          amount: 180.00,
          status: 'PENDING',
          paymentMethod: 'DEBIT_CARD',
          scheduledAt: new Date().toISOString()
        }
      ];
      
      setPayments(placeholderData);
      
      // Calculate stats
      const completed = placeholderData.filter(p => p.status === 'COMPLETED');
      const pending = placeholderData.filter(p => p.status === 'PENDING');
      const failed = placeholderData.filter(p => p.status === 'FAILED');
      
      setStats({
        completed: completed.length,
        pending: pending.length,
        failed: failed.length,
        totalAmount: completed.reduce((sum, p) => sum + p.amount, 0)
      });
      
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle size={20} color="#000" />;
      case 'PENDING':
        return <Clock size={20} color="#6B7280" />;
      case 'FAILED':
        return <XCircle size={20} color="#DC2626" />;
      default:
        return <AlertTriangle size={20} color="#6B7280" />;
    }
  };

  return (
    <div className="payment-automation-container">
      <div className="payment-content">
        
        {/* Header */}
        <div className="payment-header">
          <h1 className="page-title">Payment Automation</h1>
          <p className="page-subtitle">Automated payment processing and tracking</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <CheckCircle size={24} color="#000" />
              <h3 className="stat-title">Completed</h3>
            </div>
            <div className="stat-value">{stats.completed}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Clock size={24} color="#6B7280" />
              <h3 className="stat-title">Pending</h3>
            </div>
            <div className="stat-value">{stats.pending}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <XCircle size={24} color="#DC2626" />
              <h3 className="stat-title">Failed</h3>
            </div>
            <div className="stat-value">{stats.failed}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <DollarSign size={24} color="#000" />
              <h3 className="stat-title">Total Processed</h3>
            </div>
            <div className="stat-value">${stats.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-buttons">
          <button
            onClick={() => setFilterStatus('all')}
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          >
            All Payments
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('failed')}
            className={`filter-btn ${filterStatus === 'failed' ? 'active' : ''}`}
          >
            Failed
          </button>
        </div>

        {/* Payment List */}
        <div>
          {loading && payments.length === 0 ? (
            <div className="empty-state">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="empty-state" style={{
              padding: '80px',
              border: '1px dashed #D1D5DB'
            }}>
              <CreditCard size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No payment transactions found</p>
            </div>
          ) : (
            <div className="payments-list">
              {payments.map(payment => (
                <div key={payment.id} className="payment-card">
                  <div>
                    <div className="payment-header-section">
                      {getStatusIcon(payment.status)}
                      <div className="payment-guest-info">
                        <h3>{payment.guestName}</h3>
                        <div className="reservation-id">
                          Reservation: {payment.reservationId}
                        </div>
                      </div>
                      <span className={`status-badge ${payment.status?.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </div>

                    <div className="payment-details-grid">
                      <div className="payment-detail-item">
                        <span className="label">Amount:</span>
                        <div className="value payment-amount">
                          ${payment.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="payment-detail-item">
                        <span className="label">Method:</span>
                        <div className="value">
                          {payment.paymentMethod?.replace(/_/g, ' ')}
                        </div>
                      </div>
                      {payment.transactionId && (
                        <div className="payment-detail-item">
                          <span className="label">Transaction ID:</span>
                          <div className="value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {payment.transactionId}
                          </div>
                        </div>
                      )}
                      <div className="payment-detail-item">
                        <span className="label">
                          {payment.status === 'COMPLETED' ? 'Processed:' : 'Scheduled:'}
                        </span>
                        <div className="value" style={{ fontSize: '12px' }}>
                          {new Date(payment.processedAt || payment.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {payment.failureReason && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          color: '#991B1B',
                          fontWeight: 500
                        }}>Failure Reason:</div>
                        <div style={{
                          fontSize: '14px',
                          color: '#DC2626'
                        }}>{payment.failureReason}</div>
                      </div>
                    )}

                    {payment.notes && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          marginBottom: '4px'
                        }}>Notes:</div>
                        <div style={{
                          fontSize: '12px',
                          color: '#374151'
                        }}>{payment.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Automation Settings */}
        <div className="automation-settings">
          <h3 className="settings-title">Automation Settings</h3>
          
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Auto-charge at checkout</div>
                <div className="setting-description">
                  Automatically process payment when guest checks out
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Retry failed payments</div>
                <div className="setting-description">
                  Automatically retry failed transactions after 24 hours
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Send payment receipts</div>
                <div className="setting-description">
                  Email receipts automatically after successful payment
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAutomation;