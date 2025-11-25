package com.example.stayops.service;

import com.example.stayops.dto.LoyaltyPointsDTO;
import java.util.List;

public interface LoyaltyPointsService {
    LoyaltyPointsDTO createOrUpdate(LoyaltyPointsDTO dto);
    LoyaltyPointsDTO getByGuestId(String guestId);
    List<LoyaltyPointsDTO> getAll();
    void delete(Long id);
}
