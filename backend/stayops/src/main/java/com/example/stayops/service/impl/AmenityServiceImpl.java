package com.example.stayops.service.impl;

import com.example.stayops.entity.Amenity;
import com.example.stayops.repository.AmenityRepository;
import com.example.stayops.service.AmenityService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    public AmenityServiceImpl(AmenityRepository amenityRepository) {
        this.amenityRepository = amenityRepository;
    }

    @Override
    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    @Override
    public Amenity addAmenity(Amenity amenity) {
        return amenityRepository.save(amenity);
    }

    @Override
    public void deleteAmenity(Long id) {
        amenityRepository.deleteById(id);
    }

    @Override
    public List<Amenity> getAmenitiesByHotelId(Long hotelId) {
        return amenityRepository.findAmenitiesByHotelId(hotelId);
    }
}
