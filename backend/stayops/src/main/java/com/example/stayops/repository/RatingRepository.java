package com.example.stayops.repository;

import com.example.stayops.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByReservationReservationId(Long reservationId);

    List<Rating> findByGuestGuestIdOrderByCreatedAtDesc(String guestId);

    List<Rating> findByIsPublishedOrderByCreatedAtDesc(Boolean isPublished);

    @Query("SELECT AVG(r.overallRating) FROM Rating r WHERE r.isPublished = true")
    Double getAverageOverallRating();

    @Query("SELECT AVG(r.cleanlinessRating) FROM Rating r WHERE r.isPublished = true")
    Double getAverageCleanlinessRating();

    @Query("SELECT AVG(r.serviceRating) FROM Rating r WHERE r.isPublished = true")
    Double getAverageServiceRating();

    @Query("SELECT AVG(r.amenitiesRating) FROM Rating r WHERE r.isPublished = true")
    Double getAverageAmenitiesRating();

    @Query("SELECT AVG(r.valueRating) FROM Rating r WHERE r.isPublished = true")
    Double getAverageValueRating();

    @Query("SELECT AVG(r.locationRating) FROM Rating r WHERE r.isPublished = true")
    Double getAverageLocationRating();

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.isPublished = true")
    Long getTotalPublishedRatings();

    boolean existsByReservationReservationId(Long reservationId);
}