package com.example.stayops.service.impl;

import com.example.stayops.entity.Hotel;
import com.example.stayops.repository.HotelRepository;
import com.example.stayops.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    @Override
    @Transactional
    public Hotel createHotel(Hotel hotel){
        return hotelRepository.save(hotel);
    }

    @Override
    @Transactional
    public Hotel updateHotel(Long hotelId, Hotel hotel){
        return hotelRepository.findById(hotelId)
                .map(existing -> {
                    existing.setName(hotel.getName());
                    existing.setAddress(hotel.getAddress());
                    existing.setPhone(hotel.getPhone());
                    existing.setEmail(hotel.getEmail());
                    existing.setDescription(hotel.getDescription());
                    return hotelRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Hotel not found with id " + hotelId));
    }

    @Override
    @Transactional
    public void deleteHotel(Long hotelId){
        hotelRepository.deleteById(hotelId);
    }

    @Override
    @Transactional(readOnly = true)
    public Hotel getHotelById(Long hotelId){
        return hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id " + hotelId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Hotel> getAllHotels(){
        return hotelRepository.findAll();
    }
}