package com.example.stayops.repository;

import com.example.stayops.entity.RoomStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomStatusHistoryRepository extends JpaRepository<RoomStatusHistory, Long> {
    List<RoomStatusHistory> findByRoomId(Long roomId);
}
