package com.example.stayops.service.impl;

import com.example.stayops.dto.ReservationHistoryDTO;
import com.example.stayops.entity.Reservation;
import com.example.stayops.entity.ReservationHistory;
import com.example.stayops.repository.ReservationHistoryRepository;
import com.example.stayops.repository.ReservationRepository;
import com.example.stayops.service.ReservationHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationHistoryServiceImpl implements ReservationHistoryService {

    private final ReservationHistoryRepository historyRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public ReservationHistoryDTO recordHistory(ReservationHistoryDTO dto) {
        Reservation reservation = reservationRepository.findById(dto.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        ReservationHistory history = ReservationHistory.builder()
                .reservation(reservation)
                .previousStatus(dto.getPreviousStatus())
                .newStatus(dto.getNewStatus())
                .changedBy(dto.getChangedBy())
                .notes(dto.getNotes())
                .build();

        return toDTO(historyRepository.save(history));
    }

    @Override
    public List<ReservationHistoryDTO> getHistoryByReservation(Long reservationId) {
        return historyRepository.findByReservation_ReservationId(reservationId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ReservationHistoryDTO toDTO(ReservationHistory entity) {
        return ReservationHistoryDTO.builder()
                .historyId(entity.getHistoryId())
                .reservationId(entity.getReservation().getReservationId())
                .previousStatus(entity.getPreviousStatus())
                .newStatus(entity.getNewStatus())
                .changedBy(entity.getChangedBy())
                .notes(entity.getNotes())
                .changedAt(entity.getChangedAt())
                .build();
    }
}
