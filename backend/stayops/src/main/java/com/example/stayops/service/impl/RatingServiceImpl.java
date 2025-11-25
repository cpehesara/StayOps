package com.example.stayops.service.impl;

import com.example.stayops.dto.RatingDTO;
import com.example.stayops.dto.RatingRequestDTO;
import com.example.stayops.dto.RatingStatsDTO;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.Rating;
import com.example.stayops.entity.Reservation;
import com.example.stayops.exception.ResourceNotFoundException;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.repository.RatingRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final GuestRepository guestRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional
    public RatingDTO createRating(RatingRequestDTO requestDTO, String guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id: " + guestId));

        Reservation reservation = reservationRepository.findById(requestDTO.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + requestDTO.getReservationId()));

        if (ratingRepository.existsByReservationReservationId(requestDTO.getReservationId())) {
            throw new RuntimeException("Rating already exists for this reservation");
        }

        Rating rating = Rating.builder()
                .guest(guest)
                .reservation(reservation)
                .overallRating(requestDTO.getOverallRating())
                .cleanlinessRating(requestDTO.getCleanlinessRating())
                .serviceRating(requestDTO.getServiceRating())
                .amenitiesRating(requestDTO.getAmenitiesRating())
                .valueRating(requestDTO.getValueRating())
                .locationRating(requestDTO.getLocationRating())
                .comment(requestDTO.getComment())
                .highlights(requestDTO.getHighlights())
                .improvements(requestDTO.getImprovements())
                .isVerified(true)
                .isPublished(true)
                .build();

        Rating saved = ratingRepository.save(rating);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public RatingDTO updateRating(Long ratingId, RatingRequestDTO requestDTO, String guestId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + ratingId));

        if (!rating.getGuest().getGuestId().equals(guestId)) {
            throw new RuntimeException("Unauthorized to update this rating");
        }

        rating.setOverallRating(requestDTO.getOverallRating());
        rating.setCleanlinessRating(requestDTO.getCleanlinessRating());
        rating.setServiceRating(requestDTO.getServiceRating());
        rating.setAmenitiesRating(requestDTO.getAmenitiesRating());
        rating.setValueRating(requestDTO.getValueRating());
        rating.setLocationRating(requestDTO.getLocationRating());
        rating.setComment(requestDTO.getComment());
        rating.setHighlights(requestDTO.getHighlights());
        rating.setImprovements(requestDTO.getImprovements());

        Rating updated = ratingRepository.save(rating);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteRating(Long ratingId, String guestId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + ratingId));

        if (!rating.getGuest().getGuestId().equals(guestId)) {
            throw new RuntimeException("Unauthorized to delete this rating");
        }

        ratingRepository.delete(rating);
    }

    @Override
    public RatingDTO getRating(Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + ratingId));
        return mapToDTO(rating);
    }

    @Override
    public RatingDTO getRatingByReservation(Long reservationId) {
        Rating rating = ratingRepository.findByReservationReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found for reservation id: " + reservationId));
        return mapToDTO(rating);
    }

    @Override
    public List<RatingDTO> getGuestRatings(String guestId) {
        return ratingRepository.findByGuestGuestIdOrderByCreatedAtDesc(guestId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RatingDTO> getAllPublishedRatings() {
        return ratingRepository.findByIsPublishedOrderByCreatedAtDesc(true)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RatingStatsDTO getRatingStats() {
        return RatingStatsDTO.builder()
                .averageOverallRating(ratingRepository.getAverageOverallRating())
                .averageCleanlinessRating(ratingRepository.getAverageCleanlinessRating())
                .averageServiceRating(ratingRepository.getAverageServiceRating())
                .averageAmenitiesRating(ratingRepository.getAverageAmenitiesRating())
                .averageValueRating(ratingRepository.getAverageValueRating())
                .totalRatings(ratingRepository.getTotalPublishedRatings())
                .build();
    }

    @Override
    @Transactional
    public void publishRating(Long ratingId, Boolean isPublished) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + ratingId));
        rating.setIsPublished(isPublished);
        ratingRepository.save(rating);
    }

    private RatingDTO mapToDTO(Rating rating) {
        return RatingDTO.builder()
                .id(rating.getId())
                .guestId(rating.getGuest().getGuestId())
                .guestName(rating.getGuest().getFirstName() + " " + rating.getGuest().getLastName())
                .reservationId(rating.getReservation().getReservationId())
                .overallRating(rating.getOverallRating())
                .cleanlinessRating(rating.getCleanlinessRating())
                .serviceRating(rating.getServiceRating())
                .amenitiesRating(rating.getAmenitiesRating())
                .valueRating(rating.getValueRating())
                .locationRating(rating.getLocationRating())
                .comment(rating.getComment())
                .highlights(rating.getHighlights())
                .improvements(rating.getImprovements())
                .isVerified(rating.getIsVerified())
                .isPublished(rating.getIsPublished())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}