import React, { useState } from 'react';
import { X } from 'lucide-react';
import billingAPI from '../api/billing-api';

const AddChargeModal = ({ folioId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    itemType: 'SERVICE',
    description: '',
    amount: '',
    quantity: 1,
    department: 'FRONT_DESK',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const itemTypes = [
    { value: 'ROOM_CHARGE', label: 'Room Charge' },
    { value: 'SERVICE', label: 'Service Charge' },
    { value: 'FOOD_BEVERAGE', label: 'Food & Beverage' },
    { value: 'MINIBAR', label: 'Minibar' },
    { value: 'LAUNDRY', label: 'Laundry' },
    { value: 'TELEPHONE', label: 'Telephone' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'PARKING', label: 'Parking' },
    { value: 'TAX', label: 'Tax' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'OTHER', label: 'Other' }
  ];

  const departments = [
    { value: 'FRONT_DESK', label: 'Front Desk' },
    { value: 'HOUSEKEEPING', label: 'Housekeeping' },
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'BAR', label: 'Bar' },
    { value: 'SPA', label: 'Spa' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    try {
      setLoading(true);

      const lineItemData = {
        itemType: formData.itemType,
        description: formData.description.trim(),
        amount: amount,
        quantity: quantity,
        unitPrice: amount / quantity,
        department: formData.department,
        notes: formData.notes.trim() || null,
        postedBy: 'System'
      };

      await billingAPI.addLineItem(folioId, lineItemData);
      onSuccess();
    } catch (err) {
      console.error('Error adding charge:', err);
      setError('Failed to add charge. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h2 style={{
            fontSize: '24px',
            fontWeight: 300,
            letterSpacing: '-0.025em',
            color: '#000',
            margin: 0
          }}>Add Charge</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            {/* Item Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#000',
                marginBottom: '8px'
              }}>
                Charge Type <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              >
                {itemTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#000',
                marginBottom: '8px'
              }}>
                Department <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              >
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
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
              placeholder="Enter charge description"
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            {/* Amount */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#000',
                marginBottom: '8px'
              }}>
                Amount ($) <span style={{ color: '#EF4444' }}>*</span>
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
            </div>

            {/* Quantity */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#000',
                marginBottom: '8px'
              }}>
                Quantity <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
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
          </div>

          {/* Total Amount Display */}
          <div style={{
            padding: '16px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#000'
            }}>Total Amount:</span>
            <span style={{
              fontSize: '24px',
              fontWeight: 300,
              color: '#000'
            }}>
              ${(parseFloat(formData.amount || 0) * parseInt(formData.quantity || 1)).toFixed(2)}
            </span>
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
              {loading ? 'Adding...' : 'Add Charge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChargeModal;