import React, { useState, useEffect } from 'react';
import { ratingsAPI } from '../api/ratings';

const Ratings = () => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRatings();
    fetchStats();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const data = await ratingsAPI.getAllPublishedRatings();
      setRatings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ratingsAPI.getRatingStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handlePublishToggle = async (ratingId, currentStatus) => {
    try {
      await ratingsAPI.publishRating(ratingId, !currentStatus);
      fetchRatings();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating || 0);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Guest Ratings & Reviews
          </h1>
          <p className="text-sm text-gray-500">
            View and manage guest feedback
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-200 p-6">
              <p className="text-xs text-gray-500 mb-2">Average Rating</p>
              <p className="text-3xl font-light">
                {stats.averageOverallRating?.toFixed(1) || 'N/A'} / 5.0
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {renderStars(Math.round(stats.averageOverallRating))}
              </p>
            </div>
            <div className="border border-gray-200 p-6">
              <p className="text-xs text-gray-500 mb-2">Total Reviews</p>
              <p className="text-3xl font-light">{stats.totalRatings || 0}</p>
            </div>
            <div className="border border-gray-200 p-6">
              <p className="text-xs text-gray-500 mb-2">Service Rating</p>
              <p className="text-3xl font-light">
                {stats.averageServiceRating?.toFixed(1) || 'N/A'} / 5.0
              </p>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        {stats && (
          <div className="mb-8 border border-gray-200 p-6">
            <h2 className="text-xl font-light mb-4">Rating Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Cleanliness</p>
                <p className="text-lg font-light">
                  {stats.averageCleanlinessRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Service</p>
                <p className="text-lg font-light">
                  {stats.averageServiceRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amenities</p>
                <p className="text-lg font-light">
                  {stats.averageAmenitiesRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Value</p>
                <p className="text-lg font-light">
                  {stats.averageValueRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-lg font-light">
                  {stats.averageLocationRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-red-300 bg-red-50">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Ratings List */}
        <div className="mb-8">
          <h2 className="text-2xl font-light mb-4">Recent Reviews</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading ratings...</p>
            </div>
          ) : ratings.length === 0 ? (
            <div className="text-center py-12 border border-gray-200">
              <p className="text-gray-500">No ratings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-black">{rating.guestName}</h3>
                      <p className="text-sm text-gray-500">
                        Reservation #{rating.reservationId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-light">
                        {rating.overallRating}.0
                      </p>
                      <p className="text-xs text-gray-500">
                        {renderStars(rating.overallRating)}
                      </p>
                    </div>
                  </div>

                  {/* Rating Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {rating.cleanlinessRating && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Cleanliness</p>
                        <p className="text-sm">{rating.cleanlinessRating}/5</p>
                      </div>
                    )}
                    {rating.serviceRating && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Service</p>
                        <p className="text-sm">{rating.serviceRating}/5</p>
                      </div>
                    )}
                    {rating.amenitiesRating && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Amenities</p>
                        <p className="text-sm">{rating.amenitiesRating}/5</p>
                      </div>
                    )}
                    {rating.valueRating && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Value</p>
                        <p className="text-sm">{rating.valueRating}/5</p>
                      </div>
                    )}
                    {rating.locationRating && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm">{rating.locationRating}/5</p>
                      </div>
                    )}
                  </div>

                  {/* Comment */}
                  {rating.comment && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{rating.comment}</p>
                    </div>
                  )}

                  {/* Highlights & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {rating.highlights && (
                      <div className="bg-green-50 border border-green-200 p-3">
                        <p className="text-xs text-gray-500 mb-1">Highlights</p>
                        <p className="text-sm text-gray-700">{rating.highlights}</p>
                      </div>
                    )}
                    {rating.improvements && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3">
                        <p className="text-xs text-gray-500 mb-1">Improvements</p>
                        <p className="text-sm text-gray-700">{rating.improvements}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                      {rating.isVerified && ' • Verified Stay'}
                    </p>
                    <button
                      onClick={() => handlePublishToggle(rating.id, rating.isPublished)}
                      className={`px-3 py-1 border text-xs transition-colors ${
                        rating.isPublished
                          ? 'border-gray-300 hover:border-black'
                          : 'bg-black text-white border-black'
                      }`}
                    >
                      {rating.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ratings;