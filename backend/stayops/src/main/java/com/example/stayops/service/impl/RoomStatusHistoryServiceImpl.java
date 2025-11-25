package com.example.stayops.service.impl;

import com.example.stayops.dto.RoomStatusHistoryDTO;
import com.example.stayops.entity.Room;
import com.example.stayops.entity.RoomStatusHistory;
import com.example.stayops.repository.RoomRepository;
import com.example.stayops.repository.RoomStatusHistoryRepository;
import com.example.stayops.service.RoomStatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomStatusHistoryServiceImpl implements RoomStatusHistoryService {

    private final RoomStatusHistoryRepository historyRepository;
    private final RoomRepository roomRepository;

    @Override
    public RoomStatusHistoryDTO createStatusChange(RoomStatusHistoryDTO dto) {
        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        RoomStatusHistory history = RoomStatusHistory.builder()
                .room(room)
                .previousStatus(dto.getPreviousStatus())
                .newStatus(dto.getNewStatus())
                .changedAt(LocalDateTime.now())
                .build();

        historyRepository.save(history);

        dto.setId(history.getId());
        dto.setChangedAt(history.getChangedAt());
        return dto;
    }

    @Override
    public List<RoomStatusHistoryDTO> getHistoryByRoom(Long roomId) {
        return historyRepository.findByRoomId(roomId)
                .stream()
                .map(h -> new RoomStatusHistoryDTO(
                        h.getId(),
                        h.getRoom().getId(),
                        h.getPreviousStatus(),
                        h.getNewStatus(),
                        h.getChangedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomStatusHistoryDTO> getAllHistory() {
        return historyRepository.findAll()
                .stream()
                .map(h -> new RoomStatusHistoryDTO(
                        h.getId(),
                        h.getRoom().getId(),
                        h.getPreviousStatus(),
                        h.getNewStatus(),
                        h.getChangedAt()
                ))
                .collect(Collectors.toList());
    }
}
