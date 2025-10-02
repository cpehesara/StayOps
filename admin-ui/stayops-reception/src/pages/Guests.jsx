import React, { useState, useEffect } from 'react';
import { guestAPI } from '../api/guest';

const Guests = () => {
  const [activeView, setActiveView] = useState('grid');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

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
      setEditData({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        nationality: data.nationality,
        identityType: data.identityType,
        identityNumber: data.identityNumber
      });
      setActiveView('details');
      setEditMode(false);
    } catch (error) {
      console.error('Error fetching guest details:', error);
      alert('Failed to fetch guest details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGuest = async () => {
    setLoading(true);
    try {
      const completeUpdateData = {
        ...selectedGuest,
        ...editData,
        guestId: undefined,
        qrCodeBase64: undefined,
        imageUrl: undefined
      };
      
      Object.keys(completeUpdateData).forEach(key => {
        if (completeUpdateData[key] === undefined) {
          delete completeUpdateData[key];
        }
      });
      
      await guestAPI.updateGuest(selectedGuest.guestId, completeUpdateData);
      alert('Guest updated successfully');
      
      await handleViewDetails(selectedGuest.guestId);
      await fetchGuests();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Failed to update guest: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(guest =>
    guest.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone?.includes(searchTerm) ||
    guest.guestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.identityNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-16 border-b border-black pb-6">
          <div>
            <h1 className="text-5xl font-light tracking-tight text-black mb-2">
              Guests
            </h1>
            <p className="text-sm text-gray-500">
              Total: {guests.length}
            </p>
          </div>
          
          {activeView === 'details' && (
            <button
              onClick={() => {
                setActiveView('grid');
                setSelectedGuest(null);
                setEditMode(false);
              }}
              className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
            >
              Back to List
            </button>
          )}
        </div>

        {/* Grid View */}
        {activeView === 'grid' && (
          <div>
            <div className="mb-12">
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 text-sm">Loading...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 text-sm">
                  {searchTerm ? 'No guests found matching your search' : 'No guests found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuests.map(guest => (
                  <div 
                    key={guest.guestId} 
                    onClick={() => handleViewDetails(guest.guestId)}
                    className="border border-gray-200 hover:border-black transition-colors cursor-pointer"
                  >
                    <div className="p-6">
                      <div className="mb-6">
                        <h3 className="text-xl font-light tracking-tight mb-1">
                          {guest.fullName}
                        </h3>
                        <p className="text-xs text-gray-400">
                          ID: {guest.guestId}
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-6 pb-6 border-b border-gray-100">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email</span>
                          <span className="text-black truncate ml-2">{guest.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone</span>
                          <span className="text-black">{guest.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Nationality</span>
                          <span className="text-black">{guest.nationality || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{guest.identityType}</span>
                          <span className="text-black">{guest.identityNumber}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(guest.guestId);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 text-black text-xs hover:border-black transition-colors"
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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-light tracking-tight">
                Guest Details
              </h2>
              
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
                >
                  Edit Information
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditData({
                        fullName: selectedGuest.fullName,
                        email: selectedGuest.email,
                        phone: selectedGuest.phone,
                        nationality: selectedGuest.nationality,
                        identityType: selectedGuest.identityType,
                        identityNumber: selectedGuest.identityNumber
                      });
                    }}
                    className="px-6 py-3 border border-gray-200 text-black text-sm hover:border-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateGuest}
                    disabled={loading}
                    className={`px-6 py-3 text-sm transition-colors ${
                      loading 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-black text-white hover:bg-gray-900'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="border border-gray-200">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-sm font-medium mb-6 pb-3 border-b border-gray-200">
                      Personal Information
                    </h3>
                    
                    {editMode ? (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editData.fullName}
                            onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Nationality
                          </label>
                          <input
                            type="text"
                            value={editData.nationality}
                            onChange={(e) => setEditData({...editData, nationality: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="pb-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Full Name</div>
                          <div className="text-black">{selectedGuest.fullName}</div>
                        </div>
                        <div className="pb-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Email</div>
                          <div className="text-black">{selectedGuest.email}</div>
                        </div>
                        <div className="pb-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Phone</div>
                          <div className="text-black">{selectedGuest.phone}</div>
                        </div>
                        <div className="pb-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Nationality</div>
                          <div className="text-black">{selectedGuest.nationality || 'Not specified'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Identity Information */}
                  <div>
                    <h3 className="text-sm font-medium mb-6 pb-3 border-b border-gray-200">
                      Identity Information
                    </h3>
                    
                    {editMode ? (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Identity Type
                          </label>
                          <select
                            value={editData.identityType}
                            onChange={(e) => setEditData({...editData, identityType: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                          >
                            <option value="NIC">NIC</option>
                            <option value="Passport">Passport</option>
                            <option value="Driver License">Driver License</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Identity Number
                          </label>
                          <input
                            type="text"
                            value={editData.identityNumber}
                            onChange={(e) => setEditData({...editData, identityNumber: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Guest ID (Read Only)
                          </label>
                          <input
                            type="text"
                            value={selectedGuest.guestId}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 text-sm bg-gray-50 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="pb-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Guest ID</div>
                          <div className="text-black">{selectedGuest.guestId}</div>
                        </div>
                        <div className="pb-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Identity Type</div>
                          <div className="text-black">{selectedGuest.identityType}</div>
                        </div>
                        <div className="pb-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Identity Number</div>
                          <div className="text-black">{selectedGuest.identityNumber}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Documents & QR Code */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-sm font-medium mb-6">
                    Documents & QR Code
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedGuest.qrCodeBase64 && (
                      <div>
                        <h4 className="text-xs text-gray-500 mb-3">
                          QR Code
                        </h4>
                        <img 
                          src={selectedGuest.qrCodeBase64} 
                          alt="Guest QR Code"
                          className="w-full max-w-xs border border-gray-200"
                          onError={(e) => {
                            console.error('Failed to load QR code image');
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {selectedGuest.imageUrl && (
                      <div>
                        <h4 className="text-xs text-gray-500 mb-3">
                          Identity Document
                        </h4>
                        <img 
                          src={selectedGuest.imageUrl} 
                          alt="Guest Identity"
                          className="w-full max-w-xs border border-gray-200"
                          onError={(e) => {
                            console.error('Failed to load identity document image');
                            e.target.style.display = 'none';
                          }}
                        />
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