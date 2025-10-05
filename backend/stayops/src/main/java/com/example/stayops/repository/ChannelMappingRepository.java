package com.example.stayops.repository;

import com.example.stayops.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelMappingRepository extends JpaRepository<ChannelMapping, Long> {
    Optional<ChannelMapping> findByExternalBookingId(String externalBookingId);
    Optional<ChannelMapping> findByReservationReservationId(Long reservationId);
    List<ChannelMapping> findByChannelCode(String channelCode);
}