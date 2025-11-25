package com.example.stayops.service;

import com.example.stayops.dto.RatingDTO;
import com.example.stayops.dto.RatingRequestDTO;
import com.example.stayops.dto.RatingStatsDTO;

import java.util.List;

public interface RatingService {
    RatingDTO createRating(RatingRequestDTO requestDTO, String guestId);
    RatingDTO updateRating(Long ratingId, RatingRequestDTO requestDTO, String guestId);
    void deleteRating(Long ratingId, String guestId);
    RatingDTO getRating(Long ratingId);
    RatingDTO getRatingByReservation(Long reservationId);
    List<RatingDTO> getGuestRatings(String guestId);
    List<RatingDTO> getAllPublishedRatings();
    RatingStatsDTO getRatingStats();
    void publishRating(Long ratingId, Boolean isPublished);
}