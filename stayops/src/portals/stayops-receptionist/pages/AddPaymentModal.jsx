import React, { useState } from 'react';
import { X, CreditCard, Banknote, Building } from 'lucide-react';
import billingAPI from '../api/billing-api';

const AddPaymentModal = ({ folioId, balance, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: balance > 0 ? balance.toFixed(2) : '',
    paymentMethod: 'CASH',
    description: 'Payment received',
    reference: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: <Banknote size={18} /> },
    { value: 'CREDIT_CARD', label: 'Credit Card', icon: <CreditCard size={18} /> },
    { value: 'DEBIT_CARD', label: 'Debit Card', icon: <CreditCard size={18} /> },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <Building size={18} /> },
    { value: 'CHECK', label: 'Check', icon: <Banknote size={18} /> },
    { value: 'OTHER', label: 'Other', icon: <CreditCard size={18} /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleQuickAmount = (percentage) => {
    const amount = (balance * percentage).toFixed(2);
    setFormData(prev => ({
      ...prev,
      amount: amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    if (amount > balance) {
      if (!window.confirm(`Payment amount ($${amount.toFixed(2)}) exceeds balance ($${balance.toFixed(2)}). Continue?`)) {
        return;
      }
    }

    try {
      setLoading(true);

      const lineItemData = {
        itemType: 'PAYMENT',
        description: formData.description.trim(),
        amount: -Math.abs(amount),
        quantity: 1,
        unitPrice: -Math.abs(amount),
        reference: formData.reference.trim() || `PAY-${Date.now()}`,
        postedBy: 'System',
        department: 'FRONT_DESK',
        notes: formData.notes.trim() ? `Payment via ${formData.paymentMethod}. ${formData.notes.trim()}` : `Payment via ${formData.paymentMethod}`
      };

      await billingAPI.addLineItem(folioId, lineItemData);
      onSuccess();
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        maxWidth: '672px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '32px',
          borderBottom: '1px solid #000'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 300,
              letterSpacing: '-0.025em',
              color: '#000',
              margin: 0
            }}>Process Payment</h2>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              marginTop: '8px',
              marginBottom: 0
            }}>Outstanding Balance: {formatCurrency(balance)}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent'
            }}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#991B1B',
                margin: 0
              }}>{error}</p>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '12px'
            }}>
              Payment Method <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {paymentMethods.map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    border: formData.paymentMethod === method.value ? '1px solid #000' : '1px solid #E5E7EB',
                    backgroundColor: formData.paymentMethod === method.value ? '#000' : 'white',
                    color: formData.paymentMethod === method.value ? 'white' : '#000',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {method.icon}
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Payment Amount ($) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />

            {/* Quick Amount Buttons */}
            {balance > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(0.25)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(0.5)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(0.75)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(1)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    border: '1px solid #000',
                    backgroundColor: '#000',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Full Amount
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Description <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Payment received"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Reference Number */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Reference Number (Optional)
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Transaction reference or receipt number"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows="3"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Payment Summary */}
          <div style={{
            padding: '16px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Payment Amount:</span>
              <span style={{ fontSize: '24px', fontWeight: 300, color: '#000' }}>
                {formatCurrency(parseFloat(formData.amount || 0))}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid #D1D5DB'
            }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Remaining Balance:</span>
              <span style={{ fontSize: '24px', fontWeight: 300, color: '#000' }}>
                {formatCurrency(balance - parseFloat(formData.amount || 0))}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 32px',
                border: '1px solid #D1D5DB',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 32px',
                backgroundColor: loading ? '#9CA3AF' : '#000',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;