import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Calendar, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  syncAvailabilityToOTA,
  syncRatesToOTA,
  getAutomationConfig
} from '../api/automation';
import { getAllRooms } from '../api/room';

const OTAChannelManagement = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [syncType, setSyncType] = useState('availability');
  
  // Availability Sync
  const [availabilityData, setAvailabilityData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Rate Sync
  const [rateData, setRateData] = useState({});
  const [lastSyncStatus, setLastSyncStatus] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [configData, roomsData] = await Promise.all([
        getAutomationConfig(),
        getAllRooms()
      ]);
      
      setConfig(configData);
      setRooms(roomsData);
      
      // Initialize rate data for each room type
      const uniqueTypes = [...new Set(roomsData.map(r => r.type))];
      const initialRates = {};
      uniqueTypes.forEach(type => {
        const room = roomsData.find(r => r.type === type);
        initialRates[type] = room?.pricePerNight || 0;
      });
      setRateData(initialRates);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load OTA configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAvailability = async () => {
    if (!window.confirm(`Sync availability from ${availabilityData.startDate} to ${availabilityData.endDate}?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await syncAvailabilityToOTA(
        availabilityData.startDate,
        availabilityData.endDate
      );
      
      setLastSyncStatus({
        type: 'availability',
        success: true,
        message: result.message || 'Availability synced successfully',
        timestamp: new Date().toISOString(),
        details: result
      });
      
      alert('Availability synced to OTA channels successfully');
    } catch (error) {
      console.error('Error syncing availability:', error);
      setLastSyncStatus({
        type: 'availability',
        success: false,
        message: error.message || 'Failed to sync availability',
        timestamp: new Date().toISOString()
      });
      alert('Failed to sync availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRates = async () => {
    if (!window.confirm('Sync current room rates to all OTA channels?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await syncRatesToOTA(rateData);
      
      setLastSyncStatus({
        type: 'rates',
        success: true,
        message: result.message || 'Rates synced successfully',
        timestamp: new Date().toISOString(),
        details: result
      });
      
      alert('Rates synced to OTA channels successfully');
    } catch (error) {
      console.error('Error syncing rates:', error);
      setLastSyncStatus({
        type: 'rates',
        success: false,
        message: error.message || 'Failed to sync rates',
        timestamp: new Date().toISOString()
      });
      alert('Failed to sync rates');
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (roomType, value) => {
    setRateData(prev => ({
      ...prev,
      [roomType]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            OTA Channel Management
          </h1>
          <p className="text-sm text-gray-500">
            Synchronize availability and rates with booking channels
          </p>
        </div>

        {/* Status Banner */}
        {config && (
          <div className={`mb-8 p-6 border ${
            config.otaSyncEnabled 
              ? 'border-green-200 bg-green-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={24} />
                <div>
                  <div className="font-medium">
                    OTA Sync Status: {config.otaSyncEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {config.otaSyncEnabled 
                      ? 'Automatic synchronization is active' 
                      : 'Enable in automation settings to activate auto-sync'}
                  </div>
                </div>
              </div>
              {config.otaLastSyncTime && (
                <div className="text-sm text-gray-600">
                  Last sync: {new Date(config.otaLastSyncTime).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Sync Status */}
        {lastSyncStatus && (
          <div className={`mb-8 p-6 border ${
            lastSyncStatus.success 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {lastSyncStatus.success ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <AlertTriangle size={20} className="text-red-600" />
              )}
              <div className={`font-medium ${
                lastSyncStatus.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {lastSyncStatus.message}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {new Date(lastSyncStatus.timestamp).toLocaleString()}
            </div>
            {lastSyncStatus.details && (
              <div className="mt-3 text-sm">
                <div className="font-medium mb-1">Sync Details:</div>
                <div className="space-y-1">
                  {lastSyncStatus.details.channelsSynced && (
                    <div>Channels synced: {lastSyncStatus.details.channelsSynced}</div>
                  )}
                  {lastSyncStatus.details.roomsUpdated && (
                    <div>Rooms updated: {lastSyncStatus.details.roomsUpdated}</div>
                  )}
                  {lastSyncStatus.details.datesUpdated && (
                    <div>Dates updated: {lastSyncStatus.details.datesUpdated}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sync Type Tabs */}
        <div className="flex mb-12 gap-0">
          <button
            onClick={() => setSyncType('availability')}
            className={`px-6 py-3 text-sm border border-gray-200 transition-colors flex items-center gap-2 ${
              syncType === 'availability' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:border-black'
            }`}
          >
            <Calendar size={16} />
            Availability Sync
          </button>
          <button
            onClick={() => setSyncType('rates')}
            className={`px-6 py-3 text-sm border border-gray-200 border-l-0 transition-colors flex items-center gap-2 ${
              syncType === 'rates' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:border-black'
            }`}
          >
            <DollarSign size={16} />
            Rate Sync
          </button>
        </div>

        {/* Availability Sync Tab */}
        {syncType === 'availability' && (
          <div>
            <h2 className="text-2xl font-light mb-8">Sync Availability</h2>
            
            <div className="border border-gray-200 p-8">
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-6">
                  Synchronize room availability across all connected OTA channels. 
                  This will update booking availability based on your current reservations.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={availabilityData.startDate}
                      onChange={(e) => setAvailabilityData({
                        ...availabilityData,
                        startDate: e.target.value
                      })}
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date *</label>
                    <input
                      type="date"
                      value={availabilityData.endDate}
                      onChange={(e) => setAvailabilityData({
                        ...availabilityData,
                        endDate: e.target.value
                      })}
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      min={availabilityData.startDate}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSyncAvailability}
                disabled={loading || !availabilityData.startDate || !availabilityData.endDate}
                className="w-full px-6 py-4 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Syncing...' : 'Sync Availability to OTA Channels'}
              </button>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
                <div className="text-sm font-medium mb-2">Connected Channels:</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Booking.com</div>
                  <div>• Expedia</div>
                  <div>• Airbnb</div>
                  <div>• Hotels.com</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rate Sync Tab */}
        {syncType === 'rates' && (
          <div>
            <h2 className="text-2xl font-light mb-8">Sync Room Rates</h2>
            
            <div className="border border-gray-200 p-8">
              <p className="text-sm text-gray-600 mb-6">
                Update room rates across all OTA channels. Current rates will be synchronized 
                to all connected booking platforms.
              </p>

              <div className="space-y-6 mb-8">
                {Object.entries(rateData).map(([roomType, rate]) => (
                  <div key={roomType} className="grid grid-cols-3 gap-6 items-center p-4 border border-gray-200">
                    <div>
                      <div className="font-medium">{roomType}</div>
                      <div className="text-sm text-gray-500">
                        {rooms.filter(r => r.type === roomType).length} rooms
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rate per Night</label>
                      <div className="flex items-center">
                        <span className="px-3 py-3 border border-r-0 border-gray-200 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={rate}
                          onChange={(e) => handleRateChange(roomType, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Will be synced to all channels
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSyncRates}
                disabled={loading}
                className="w-full px-6 py-4 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Syncing...' : 'Sync Rates to OTA Channels'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-2">Note:</div>
                <div className="text-sm text-blue-700">
                  Rate changes may take 5-15 minutes to reflect on all OTA platforms. 
                  Some channels may require manual confirmation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync History (Placeholder) */}
        <div className="mt-12 border border-gray-200 p-6">
          <h3 className="font-medium mb-4">Recent Sync History</h3>
          <div className="text-sm text-gray-500 text-center py-8">
            Sync history tracking coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTAChannelManagement;