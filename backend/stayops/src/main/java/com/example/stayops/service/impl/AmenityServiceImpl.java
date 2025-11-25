package com.example.stayops.service.impl;

import com.example.stayops.entity.Amenity;
import com.example.stayops.repository.AmenityRepository;
import com.example.stayops.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    @Override
    @Transactional
    public Amenity addAmenity(Amenity amenity) {
        return amenityRepository.save(amenity);
    }

    @Override
    @Transactional
    public void deleteAmenity(Long id) {
        amenityRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Amenity> getAmenitiesByHotelId(Long hotelId) {
        return amenityRepository.findAmenitiesByHotelId(hotelId);
    }
}