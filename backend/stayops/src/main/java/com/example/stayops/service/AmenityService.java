package com.example.stayops.service;

import com.example.stayops.entity.Amenity;

import java.util.List;

public interface AmenityService {
    List<Amenity> getAllAmenities();
    Amenity addAmenity(Amenity amenity);
    void deleteAmenity(Long id);
    List<Amenity> getAmenitiesByHotelId(Long hotelId);
}
