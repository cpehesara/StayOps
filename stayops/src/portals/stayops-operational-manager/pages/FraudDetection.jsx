import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import {
  getAllFraudAlerts,
  getPendingFraudAlerts,
  getHighRiskAlerts,
  reviewFraudAlert
} from '../api/automation';

const FraudDetection = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [filterType]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      let data;
      
      switch(filterType) {
        case 'pending':
          data = await getPendingFraudAlerts();
          break;
        case 'high-risk':
          data = await getHighRiskAlerts();
          break;
        default:
          data = await getAllFraudAlerts();
      }
      
      setAlerts(data);
    } catch (error) {
      console.error('Error loading fraud alerts:', error);
      alert('Failed to load fraud alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (alertId, status) => {
    try {
      setLoading(true);
      await reviewFraudAlert(alertId, status, 'Current User', reviewNotes || null);
      alert(`Alert ${status.toLowerCase()} successfully`);
      setSelectedAlert(null);
      setReviewNotes('');
      loadAlerts();
    } catch (error) {
      console.error('Error reviewing alert:', error);
      alert('Failed to review alert');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch(level?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-red-100 text-red-800';
      case 'FALSE_POSITIVE':
        return 'bg-green-100 text-green-800';
      case 'INVESTIGATING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Fraud Detection
          </h1>
          <p className="text-sm text-gray-500">
            Monitor and review suspicious activities
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          <Filter size={20} />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 text-sm border transition-colors ${
                filterType === 'all'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-4 py-2 text-sm border transition-colors ${
                filterType === 'pending'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setFilterType('high-risk')}
              className={`px-4 py-2 text-sm border transition-colors ${
                filterType === 'high-risk'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              High Risk
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {alerts.filter(a => a.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-500">Pending Review</div>
          </div>
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {alerts.filter(a => a.riskLevel === 'HIGH').length}
            </div>
            <div className="text-sm text-gray-500">High Risk</div>
          </div>
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {alerts.filter(a => a.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-500">Confirmed Fraud</div>
          </div>
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {alerts.filter(a => a.status === 'FALSE_POSITIVE').length}
            </div>
            <div className="text-sm text-gray-500">False Positives</div>
          </div>
        </div>

        {/* Alerts List */}
        <div>
          {loading && alerts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              Loading fraud alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <p className="text-sm text-gray-500">No fraud alerts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle size={20} className="text-red-500" />
                        <h3 className="font-medium">{alert.alertType || 'Fraud Alert'}</h3>
                        <span className={`px-3 py-1 text-xs border ${getRiskLevelColor(alert.riskLevel)}`}>
                          {alert.riskLevel} Risk
                        </span>
                        <span className={`px-3 py-1 text-xs ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-3">
                        {alert.description || 'Suspicious activity detected'}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {alert.reservationId && (
                          <div>
                            <span className="text-gray-500">Reservation:</span>
                            <div className="font-medium">#{alert.reservationId}</div>
                          </div>
                        )}
                        {alert.guestId && (
                          <div>
                            <span className="text-gray-500">Guest ID:</span>
                            <div className="font-medium">{alert.guestId}</div>
                          </div>
                        )}
                        {alert.detectedAt && (
                          <div>
                            <span className="text-gray-500">Detected:</span>
                            <div className="font-medium">
                              {new Date(alert.detectedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {alert.details && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200">
                          <div className="text-xs font-medium mb-1">Alert Details:</div>
                          <div className="text-xs text-gray-700">{alert.details}</div>
                        </div>
                      )}

                      {alert.reviewedBy && (
                        <div className="mt-3 text-xs text-gray-600">
                          Reviewed by {alert.reviewedBy} on {new Date(alert.reviewedAt).toLocaleString()}
                          {alert.reviewNotes && (
                            <div className="mt-1 text-gray-500">Note: {alert.reviewNotes}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {alert.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="px-4 py-2 border border-gray-200 hover:border-black transition-colors flex items-center gap-2 text-sm"
                      >
                        <Eye size={16} />
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border-2 border-black p-8 max-w-2xl w-11/12">
              <h2 className="text-2xl font-light mb-6">Review Fraud Alert</h2>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-sm border ${getRiskLevelColor(selectedAlert.riskLevel)}`}>
                    {selectedAlert.riskLevel} Risk
                  </span>
                  <h3 className="text-lg font-medium">{selectedAlert.alertType}</h3>
                </div>
                
                <div className="text-sm text-gray-700 mb-4">
                  {selectedAlert.description}
                </div>

                {selectedAlert.details && (
                  <div className="p-4 bg-gray-50 border border-gray-200 mb-4">
                    <div className="font-medium mb-2">Details:</div>
                    <div className="text-sm text-gray-700">{selectedAlert.details}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  {selectedAlert.reservationId && (
                    <div>
                      <span className="text-gray-500">Reservation:</span>
                      <div className="font-medium">#{selectedAlert.reservationId}</div>
                    </div>
                  )}
                  {selectedAlert.guestId && (
                    <div>
                      <span className="text-gray-500">Guest ID:</span>
                      <div className="font-medium">{selectedAlert.guestId}</div>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Review Notes (Optional)</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black resize-vertical"
                    rows="3"
                    placeholder="Add notes about this review..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(selectedAlert.id, 'CONFIRMED')}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Confirm Fraud
                </button>
                <button
                  onClick={() => handleReview(selectedAlert.id, 'FALSE_POSITIVE')}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark Safe
                </button>
                <button
                  onClick={() => {
                    setSelectedAlert(null);
                    setReviewNotes('');
                  }}
                  className="px-6 py-3 border border-gray-200 text-black text-sm hover:border-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDetection;