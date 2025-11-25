import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import billingAPI from '../api/billing-api';

const CreateFolioModal = ({ onClose, onSuccess }) => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await billingAPI.getAllReservations();
      const activeReservations = data.filter(r => 
        r.status === 'CONFIRMED' || r.status === 'CHECKED_IN'
      );
      setReservations(activeReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    if (!searchTerm.trim()) {
      setFilteredReservations(reservations);
      return;
    }

    const filtered = reservations.filter(r =>
      r.reservationId?.toString().includes(searchTerm) ||
      r.guestId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReservations(filtered);
  };

  const handleCreate = async () => {
    if (!selectedReservation) {
      setError('Please select a reservation');
      return;
    }

    try {
      setCreating(true);
      await billingAPI.createFolio(selectedReservation.reservationId);
      onSuccess();
    } catch (err) {
      console.error('Error creating folio:', err);
      setError('Failed to create folio. It may already exist for this reservation.');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      CONFIRMED: { bg: '#F3F4F6', color: '#1F2937' },
      CHECKED_IN: { bg: '#000', color: '#FFF' }
    };
    return colors[status] || { bg: '#F3F4F6', color: '#1F2937' };
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
        maxWidth: '896px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
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
            }}>Create New Folio</h2>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              marginTop: '8px',
              marginBottom: 0
            }}>Select a reservation to create a folio</p>
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

        {/* Search */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
              size={18}
            />
            <input
              type="text"
              placeholder="Search by reservation ID or guest ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '44px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Reservations List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {error && (
            <div style={{
              marginBottom: '16px',
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

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '256px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '2px solid #000',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '256px',
              color: '#6B7280'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: 300,
                margin: 0
              }}>No reservations found</p>
              <p style={{
                fontSize: '14px',
                marginTop: '4px',
                marginBottom: 0
              }}>Try adjusting your search or check back later</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredReservations.map((reservation) => {
                const isSelected = selectedReservation?.reservationId === reservation.reservationId;
                const statusColors = getStatusColor(reservation.status);
                
                return (
                  <div
                    key={reservation.reservationId}
                    onClick={() => setSelectedReservation(reservation)}
                    style={{
                      padding: '20px',
                      border: isSelected ? '1px solid #000' : '1px solid #E5E7EB',
                      backgroundColor: isSelected ? '#F9FAFB' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#000',
                            margin: 0
                          }}>
                            Reservation #{reservation.reservationId}
                          </h3>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: statusColors.bg,
                            color: statusColors.color
                          }}>
                            {reservation.status}
                          </span>
                        </div>
                        <div style={{
                          marginTop: '12px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '16px 24px',
                          fontSize: '14px'
                        }}>
                          <div>
                            <span style={{
                              fontSize: '12px',
                              color: '#6B7280',
                              display: 'block',
                              marginBottom: '4px'
                            }}>Guest ID</span>
                            <span style={{
                              fontSize: '14px',
                              color: '#000',
                              fontWeight: 500
                            }}>{reservation.guestId}</span>
                          </div>
                          <div>
                            <span style={{
                              fontSize: '12px',
                              color: '#6B7280',
                              display: 'block',
                              marginBottom: '4px'
                            }}>Check-in</span>
                            <span style={{
                              fontSize: '14px',
                              color: '#000',
                              fontWeight: 500
                            }}>{formatDate(reservation.checkInDate)}</span>
                          </div>
                          <div>
                            <span style={{
                              fontSize: '12px',
                              color: '#6B7280',
                              display: 'block',
                              marginBottom: '4px'
                            }}>Rooms</span>
                            <span style={{
                              fontSize: '14px',
                              color: '#000',
                              fontWeight: 500
                            }}>
                              {reservation.roomIds?.length || 0} room(s)
                            </span>
                          </div>
                          <div>
                            <span style={{
                              fontSize: '12px',
                              color: '#6B7280',
                              display: 'block',
                              marginBottom: '4px'
                            }}>Check-out</span>
                            <span style={{
                              fontSize: '14px',
                              color: '#000',
                              fontWeight: 500
                            }}>{formatDate(reservation.checkOutDate)}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{
                          marginLeft: '16px',
                          flexShrink: 0
                        }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg
                              style={{ width: '16px', height: '16px', color: 'white' }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: 0
          }}>
            {selectedReservation ? (
              <>
                Selected: <span style={{ fontWeight: 500 }}>Reservation #{selectedReservation.reservationId}</span>
              </>
            ) : (
              'Please select a reservation to continue'
            )}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 32px',
                border: '1px solid #D1D5DB',
                backgroundColor: 'white',
                cursor: creating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!selectedReservation || creating}
              style={{
                padding: '12px 32px',
                backgroundColor: (!selectedReservation || creating) ? '#9CA3AF' : '#000',
                color: 'white',
                border: 'none',
                cursor: (!selectedReservation || creating) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {creating ? 'Creating...' : 'Create Folio'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CreateFolioModal;