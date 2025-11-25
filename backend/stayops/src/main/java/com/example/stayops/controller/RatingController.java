package com.example.stayops.controller;

import com.example.stayops.dto.RatingDTO;
import com.example.stayops.dto.RatingRequestDTO;
import com.example.stayops.dto.RatingStatsDTO;
import com.example.stayops.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingDTO> createRating(
            @RequestBody RatingRequestDTO requestDTO,
            @RequestParam String guestId) {
        RatingDTO rating = ratingService.createRating(requestDTO, guestId);
        return new ResponseEntity<>(rating, HttpStatus.CREATED);
    }

    @PutMapping("/{ratingId}")
    public ResponseEntity<RatingDTO> updateRating(
            @PathVariable Long ratingId,
            @RequestBody RatingRequestDTO requestDTO,
            @RequestParam String guestId) {
        RatingDTO rating = ratingService.updateRating(ratingId, requestDTO, guestId);
        return ResponseEntity.ok(rating);
    }

    @DeleteMapping("/{ratingId}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long ratingId,
            @RequestParam String guestId) {
        ratingService.deleteRating(ratingId, guestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{ratingId}")
    public ResponseEntity<RatingDTO> getRating(@PathVariable Long ratingId) {
        RatingDTO rating = ratingService.getRating(ratingId);
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<RatingDTO> getRatingByReservation(@PathVariable Long reservationId) {
        RatingDTO rating = ratingService.getRatingByReservation(reservationId);
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<RatingDTO>> getGuestRatings(@PathVariable String guestId) {
        List<RatingDTO> ratings = ratingService.getGuestRatings(guestId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/published")
    public ResponseEntity<List<RatingDTO>> getAllPublishedRatings() {
        List<RatingDTO> ratings = ratingService.getAllPublishedRatings();
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/stats")
    public ResponseEntity<RatingStatsDTO> getRatingStats() {
        RatingStatsDTO stats = ratingService.getRatingStats();
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{ratingId}/publish")
    public ResponseEntity<Void> publishRating(
            @PathVariable Long ratingId,
            @RequestParam Boolean isPublished) {
        ratingService.publishRating(ratingId, isPublished);
        return ResponseEntity.ok().build();
    }
}