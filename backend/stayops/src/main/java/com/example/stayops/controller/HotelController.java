package com.example.stayops.controller;

import com.example.stayops.entity.Hotel;
import com.example.stayops.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelService hotelService;

    @PostMapping("/create")
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel){
        return ResponseEntity.ok(hotelService.createHotel(hotel));
    }

    @PutMapping("/update/{hotelId}")
    public ResponseEntity<Hotel> updateHotel(@PathVariable Long hotelId, @RequestBody Hotel hotel){
        return ResponseEntity.ok(hotelService.updateHotel(hotelId,hotel));
    }

    @DeleteMapping("/delete/{hotelId}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long hotelId){
        hotelService.deleteHotel(hotelId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/get/{hotelId}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable Long hotelId){
        return  ResponseEntity.ok(hotelService.getHotelById(hotelId));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Hotel>> getAllHotels(){
        return ResponseEntity.ok(hotelService.getAllHotels());
    }
}
