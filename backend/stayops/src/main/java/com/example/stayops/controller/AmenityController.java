package com.example.stayops.controller;

import com.example.stayops.entity.Amenity;
import com.example.stayops.service.AmenityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
@CrossOrigin(origins = {"*"})
public class AmenityController {

    private final AmenityService amenityService;

    public AmenityController(AmenityService amenityService) {
        this.amenityService = amenityService;
    }

    @GetMapping("/getAll")
    public List<Amenity> getAllAmenities() {
        return amenityService.getAllAmenities();
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Amenity>> getAmenitiesByHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(amenityService.getAmenitiesByHotelId(hotelId));
    }

    @PostMapping("/create")
    public Amenity addAmenity(@RequestBody Amenity amenity) {
        return amenityService.addAmenity(amenity);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteAmenity(@PathVariable Long id) {
        amenityService.deleteAmenity(id);
    }
}
