package com.example.stayops.service.impl;

import com.example.stayops.dto.LoyaltyPointsDTO;
import com.example.stayops.entity.Guest;
import com.example.stayops.entity.LoyaltyPoints;
import com.example.stayops.repository.GuestRepository;
import com.example.stayops.repository.LoyaltyPointsRepository;
import com.example.stayops.service.LoyaltyPointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoyaltyPointsServiceImpl implements LoyaltyPointsService {

    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final GuestRepository guestRepository;

    @Override
    public LoyaltyPointsDTO createOrUpdate(LoyaltyPointsDTO dto) {
        Guest guest = guestRepository.findById(dto.getGuestId())
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        LoyaltyPoints loyaltyPoints = loyaltyPointsRepository.findByGuestGuestId(dto.getGuestId())
                .orElse(LoyaltyPoints.builder()
                        .guest(guest)
                        .build());

        loyaltyPoints.setPoints(dto.getPoints());
        loyaltyPoints.setMembershipLevel(dto.getMembershipLevel());

        LoyaltyPoints saved = loyaltyPointsRepository.save(loyaltyPoints);

        return new LoyaltyPointsDTO(saved.getId(),
                saved.getGuest().getGuestId(),
                saved.getPoints(),
                saved.getMembershipLevel());
    }

    @Override
    public LoyaltyPointsDTO getByGuestId(String guestId) {
        LoyaltyPoints lp = loyaltyPointsRepository.findByGuestGuestId(guestId)
                .orElseThrow(() -> new RuntimeException("Loyalty record not found"));
        return new LoyaltyPointsDTO(lp.getId(), lp.getGuest().getGuestId(), lp.getPoints(), lp.getMembershipLevel());
    }

    @Override
    public List<LoyaltyPointsDTO> getAll() {
        return loyaltyPointsRepository.findAll()
                .stream()
                .map(lp -> new LoyaltyPointsDTO(lp.getId(), lp.getGuest().getGuestId(), lp.getPoints(), lp.getMembershipLevel()))
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        loyaltyPointsRepository.deleteById(id);
    }
}
