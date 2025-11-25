import React, { useState, useEffect } from 'react';
import { guestAPI } from '../api/guest';
import '../styles/guests.css';

const Guests = () => {
  const [activeView, setActiveView] = useState('grid');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await guestAPI.getAllGuests();
      setGuests(data);
    } catch (error) {
      console.error('Error fetching guests:', error);
      alert('Failed to fetch guests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (guestId) => {
    setLoading(true);
    try {
      const data = await guestAPI.getGuestById(guestId);
      setSelectedGuest(data);
      setActiveView('details');
    } catch (error) {
      console.error('Error fetching guest details:', error);
      alert('Failed to fetch guest details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search function with better name matching
  const searchGuests = (guest, term) => {
    const searchLower = term.toLowerCase().trim();
    
    if (!searchLower) return true;
    
    // Search by full name
    if (guest.fullName?.toLowerCase().includes(searchLower)) return true;
    
    // Search by first name or last name separately
    const nameParts = guest.fullName?.toLowerCase().split(' ') || [];
    const matchesAnyNamePart = nameParts.some(part => part.includes(searchLower));
    if (matchesAnyNamePart) return true;
    
    // Search by email
    if (guest.email?.toLowerCase().includes(searchLower)) return true;
    
    // Search by phone (remove spaces and dashes for better matching)
    const phoneClean = guest.phone?.replace(/[\s-]/g, '') || '';
    const searchClean = searchLower.replace(/[\s-]/g, '');
    if (phoneClean.includes(searchClean)) return true;
    
    // Search by guest ID
    if (guest.guestId?.toLowerCase().includes(searchLower)) return true;
    
    // Search by identity number
    if (guest.identityNumber?.toLowerCase().includes(searchLower)) return true;
    
    // Search by nationality
    if (guest.nationality?.toLowerCase().includes(searchLower)) return true;
    
    return false;
  };

  const filteredGuests = guests.filter(guest => searchGuests(guest, searchTerm));

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleCopyGuestId = async () => {
    if (!selectedGuest?.guestId) return;
    
    try {
      await navigator.clipboard.writeText(selectedGuest.guestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy guest ID:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = selectedGuest.guestId;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy Guest ID');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="guests-container">
      <div className="guests-wrapper">
        
        {/* Header */}
        <div className="guests-header">
          <div className="guests-header-info">
            <h1>Guests</h1>
            <p className="guests-header-count">
              {searchTerm ? (
                <>Showing {filteredGuests.length} of {guests.length} guests</>
              ) : (
                <>Total: {guests.length} guests</>
              )}
            </p>
          </div>
          
          {activeView === 'details' && (
            <button
              onClick={() => {
                setActiveView('grid');
                setSelectedGuest(null);
              }}
              className="btn-back"
            >
              Back to List
            </button>
          )}
        </div>

        {/* Grid View */}
        {activeView === 'grid' && (
          <div>
            <div className="search-input-wrapper">
              <div style={{ position: 'relative', width: '100%' }}>
                <svg
                  className="search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, phone, ID, nationality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: '40px', paddingRight: searchTerm ? '40px' : '12px' }}
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="search-clear-btn"
                    aria-label="Clear search"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading guests...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? (
                  <>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginBottom: '16px', opacity: 0.5 }}
                    >
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>No guests found matching "{searchTerm}"</p>
                    <button onClick={handleClearSearch} className="btn-secondary" style={{ marginTop: '12px' }}>
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginBottom: '16px', opacity: 0.5 }}
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>No guests found</p>
                  </>
                )}
              </div>
            ) : (
              <div className="guests-grid">
                {filteredGuests.map(guest => (
                  <div 
                    key={guest.guestId} 
                    onClick={() => handleViewDetails(guest.guestId)}
                    className="guest-card"
                  >
                    <div className="guest-card-content">
                      <div className="guest-card-header">
                        <h3 className="guest-card-name">{guest.fullName}</h3>
                        <p className="guest-card-id">ID: {guest.guestId}</p>
                      </div>
                      
                      <div className="guest-card-details">
                        <div className="guest-card-detail-row">
                          <span className="guest-card-detail-label">Email</span>
                          <span className="guest-card-detail-value">{guest.email}</span>
                        </div>
                        <div className="guest-card-detail-row">
                          <span className="guest-card-detail-label">Phone</span>
                          <span className="guest-card-detail-value">{guest.phone}</span>
                        </div>
                        <div className="guest-card-detail-row">
                          <span className="guest-card-detail-label">Nationality</span>
                          <span className="guest-card-detail-value">{guest.nationality || 'N/A'}</span>
                        </div>
                        <div className="guest-card-detail-row">
                          <span className="guest-card-detail-label">{guest.identityType}</span>
                          <span className="guest-card-detail-value">{guest.identityNumber}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(guest.guestId);
                        }}
                        className="guest-card-action"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details View */}
        {activeView === 'details' && selectedGuest && (
          <div>
            <div className="details-header">
              <h2 className="details-title">Guest Details</h2>
            </div>
            
            <div className="details-container">
              <div className="details-content">
                <div className="details-grid">
                  
                  {/* Personal Information */}
                  <div className="details-section">
                    <h3 className="section-title">Personal Information</h3>
                    <div>
                      <div className="info-item">
                        <div className="info-label">Full Name</div>
                        <div className="info-value">{selectedGuest.fullName}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">{selectedGuest.email}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Phone</div>
                        <div className="info-value">{selectedGuest.phone}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Nationality</div>
                        <div className="info-value">{selectedGuest.nationality || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Identity Information */}
                  <div className="details-section">
                    <h3 className="section-title">Identity Information</h3>
                    <div>
                      <div className="info-item">
                        <div className="info-label">Guest ID</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="info-value" style={{ flex: 1 }}>{selectedGuest.guestId}</div>
                          <button
                            onClick={handleCopyGuestId}
                            className="btn-copy-small"
                            title="Copy Guest ID"
                            type="button"
                          >
                            {copied ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Identity Type</div>
                        <div className="info-value">{selectedGuest.identityType}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Identity Number</div>
                        <div className="info-value">{selectedGuest.identityNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Documents & QR Code */}
                <div className="documents-section">
                  <h3 className="documents-title">Documents & QR Code</h3>
                  
                  <div className={`documents-grid ${(!selectedGuest.qrCodeBase64 || !selectedGuest.imageUrl) ? 'documents-grid-single' : ''}`}>
                    {selectedGuest.qrCodeBase64 && (
                      <div className="document-item">
                        <h4>QR CODE</h4>
                        <img 
                          src={selectedGuest.qrCodeBase64} 
                          alt="Guest QR Code"
                          className="document-image"
                          onError={(e) => {
                            console.error('Failed to load QR code image');
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {selectedGuest.imageUrl && (
                      <div className="document-item">
                        <h4>IDENTITY DOCUMENT</h4>
                        <img 
                          src={selectedGuest.imageUrl} 
                          alt="Guest Identity"
                          className="document-image"
                          onError={(e) => {
                            console.error('Failed to load identity document image');
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {!selectedGuest.qrCodeBase64 && !selectedGuest.imageUrl && (
                      <div className="empty-documents">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ opacity: 0.3, marginBottom: '12px' }}
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="12" y1="18" x2="12" y2="12"/>
                          <line x1="9" y1="15" x2="15" y2="15"/>
                        </svg>
                        <p>No documents available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guests;