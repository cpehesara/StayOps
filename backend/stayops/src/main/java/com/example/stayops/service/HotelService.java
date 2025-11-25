package com.example.stayops.service;

import com.example.stayops.entity.Hotel;

import java.util.List;

public interface HotelService {

    Hotel createHotel(Hotel hotel);

    Hotel updateHotel(Long hotelId, Hotel hotel);

    void deleteHotel(Long hotelId);

    Hotel getHotelById(Long hotelId);

    List<Hotel> getAllHotels();
}
