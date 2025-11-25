import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Users, Clock, AlertCircle, Bell, FileText
} from 'lucide-react';
import billingAPI from '../api/billing-api';
import FolioDetails from './FolioDetails';
import CreateFolioModal from './CreateFolioModal';
import '../styles/billing.css';

const ReceptionistBilling = () => {
  // State management
  const [folios, setFolios] = useState([]);
  const [filteredFolios, setFilteredFolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolio, setSelectedFolio] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [todayCheckouts, setTodayCheckouts] = useState([]);

  // Quick stats for receptionist
  const [stats, setStats] = useState({
    activeGuests: 0,
    pendingPayments: 0,
    todayCheckouts: 0
  });

  // Load active folios only
  useEffect(() => {
    loadActiveFolios();
  }, []);

  const loadActiveFolios = async () => {
    try {
      setLoading(true);
      // Get only OPEN and SETTLED folios (active guests)
      const [openFolios, settledFolios] = await Promise.all([
        billingAPI.getFoliosByStatus('OPEN'),
        billingAPI.getFoliosByStatus('SETTLED')
      ]);
      
      const activeFolios = [...openFolios, ...settledFolios];
      setFolios(activeFolios);
      setFilteredFolios(activeFolios);
      
      // Get today's checkouts first
      const checkouts = getTodayCheckouts(activeFolios);
      
      // Then calculate stats with correct checkout count
      calculateStats(activeFolios, checkouts.length);
    } catch (error) {
      console.error('Error loading folios:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (folioList, checkoutCount) => {
    const activeGuests = folioList.filter(f => f.status === 'OPEN').length;
    const pendingPayments = folioList.filter(f => 
      f.status === 'OPEN' && parseFloat(f.balance || 0) > 0
    ).length;
    
    setStats({
      activeGuests,
      pendingPayments,
      todayCheckouts: checkoutCount
    });
  };

  const getTodayCheckouts = (folioList) => {
    const today = new Date().toISOString().split('T')[0];
    const checkouts = folioList.filter(folio => {
      const checkoutDate = folio.reservation?.checkOutDate?.split('T')[0];
      return checkoutDate === today && folio.status !== 'CLOSED';
    });
    setTodayCheckouts(checkouts);
    return checkouts;
  };

  // Search functionality
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredFolios(folios);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = folios.filter(folio => 
      folio.folioNumber?.toLowerCase().includes(searchLower) ||
      folio.guestName?.toLowerCase().includes(searchLower) ||
      folio.reservation?.room?.roomNumber?.toString().includes(searchLower)
    );
    setFilteredFolios(filtered);
  };

  // Quick action handlers
  const handleViewFolio = (folio) => {
    setSelectedFolio(folio);
  };

  const handleCreateFolio = () => {
    setShowCreateModal(true);
  };

  const handleFolioCreated = () => {
    setShowCreateModal(false);
    loadActiveFolios();
  };

  const handleFolioUpdated = () => {
    loadActiveFolios();
    if (selectedFolio) {
      // Refresh the selected folio details
      const updatedFolio = folios.find(f => f.id === selectedFolio.id);
      setSelectedFolio(updatedFolio);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    const styles = {
      OPEN: { backgroundColor: 'black', color: 'white' },
      SETTLED: { backgroundColor: '#f9f9f9', color: 'black', border: '1px solid #e0e0e0' },
      CLOSED: { backgroundColor: '#f0f0f0', color: '#666' }
    };
    return styles[status] || styles.CLOSED;
  };

  // If viewing a specific folio
  if (selectedFolio) {
    return (
      <FolioDetails
        folio={selectedFolio}
        onBack={() => setSelectedFolio(null)}
        onUpdate={handleFolioUpdated}
      />
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '300',
            color: 'black',
            letterSpacing: '0.5px',
            margin: '0 0 4px 0',
          }}>
            Guest Billing
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#666',
            fontWeight: '300',
            margin: 0,
          }}>
            Manage guest folios and payments
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Active Guests */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'black';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{
                  fontSize: '11px',
                  color: '#666',
                  fontWeight: '400',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0'
                }}>
                  Active Guests
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '300',
                  color: 'black',
                  margin: 0
                }}>
                  {stats.activeGuests}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f9f9f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e0e0'
              }}>
                <Users size={24} strokeWidth={1.5} color="black" />
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'black';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{
                  fontSize: '11px',
                  color: '#666',
                  fontWeight: '400',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0'
                }}>
                  Pending Payments
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '300',
                  color: 'black',
                  margin: 0
                }}>
                  {stats.pendingPayments}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f9f9f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e0e0'
              }}>
                <AlertCircle size={24} strokeWidth={1.5} color="black" />
              </div>
            </div>
          </div>

          {/* Today's Checkouts */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'black';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{
                  fontSize: '11px',
                  color: '#666',
                  fontWeight: '400',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0'
                }}>
                  Today's Checkouts
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '300',
                  color: 'black',
                  margin: 0
                }}>
                  {stats.todayCheckouts}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f9f9f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e0e0'
              }}>
                <Clock size={24} strokeWidth={1.5} color="black" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Checkouts Alert */}
        {todayCheckouts.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid black',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'black',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bell size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: 'black',
                  margin: '0 0 12px 0',
                  letterSpacing: '0.3px'
                }}>
                  Guests Checking Out Today ({todayCheckouts.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todayCheckouts.map(folio => (
                    <div 
                      key={folio.id}
                      onClick={() => handleViewFolio(folio)}
                      style={{
                        backgroundColor: '#f9f9f9',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = 'black';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '400', color: 'black' }}>
                          {folio.guestName}
                        </span>
                        <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                          Room {folio.reservation?.room?.roomNumber}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '400',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        letterSpacing: '0.3px',
                        ...(parseFloat(folio.balance || 0) > 0 
                          ? { backgroundColor: 'black', color: 'white' }
                          : { backgroundColor: '#f0f0f0', color: '#666', border: '1px solid #e0e0e0' }
                        )
                      }}>
                        {parseFloat(folio.balance || 0) > 0 
                          ? `Balance: ${formatCurrency(folio.balance)}`
                          : 'Fully Paid'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Toolbar */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }}
              />
              <input
                type="text"
                placeholder="Search by guest name, room, or folio..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'black',
                  outline: 'none',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'black';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                }}
              />
            </div>

            {/* Create Folio Button */}
            <button
              onClick={handleCreateFolio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'black',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.2px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus size={18} />
              <span>Create Folio</span>
            </button>
          </div>

          {/* Active Folios Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 0',
                gap: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f0f0f0',
                  borderTop: '3px solid black',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Loading folios...</p>
              </div>
            ) : filteredFolios.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 0',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid #e0e0e0'
                }}>
                  <FileText size={32} strokeWidth={1.5} color="#999" />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '400', color: 'black', margin: '0 0 4px 0' }}>
                  {searchTerm ? 'No folios found' : 'No active folios'}
                </p>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Create a folio to get started'
                  }
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Folio Number
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Guest Name
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Room
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Check Out
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Balance
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFolios.map((folio) => (
                    <tr 
                      key={folio.id}
                      onClick={() => handleViewFolio(folio)}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafafa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '400', color: 'black' }}>
                          {folio.folioNumber}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '400', color: 'black' }}>
                          {folio.guestName}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>
                          {folio.reservation?.room?.roomNumber || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>
                          {folio.reservation?.checkOutDate 
                            ? new Date(folio.reservation.checkOutDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '-'
                          }
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '400',
                          color: parseFloat(folio.balance || 0) > 0 ? 'black' : '#999'
                        }}>
                          {formatCurrency(folio.balance)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: '400',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          letterSpacing: '0.3px',
                          ...getStatusStyle(folio.status)
                        }}>
                          {folio.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFolio(folio);
                          }}
                          style={{
                            fontSize: '13px',
                            fontWeight: '400',
                            color: 'black',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Info */}
          {!loading && filteredFolios.length > 0 && (
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#f9f9f9',
              borderTop: '1px solid #e0e0e0'
            }}>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                Showing <span style={{ fontWeight: '500', color: 'black' }}>{filteredFolios.length}</span> active folio{filteredFolios.length !== 1 ? 's' : ''}
                {searchTerm && (
                  <span style={{ color: '#999' }}>
                    {' '}• Filtered by: <span style={{ fontWeight: '400', color: '#666' }}>"{searchTerm}"</span>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Folio Modal */}
      {showCreateModal && (
        <CreateFolioModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFolioCreated}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReceptionistBilling;