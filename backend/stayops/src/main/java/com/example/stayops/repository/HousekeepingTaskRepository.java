package com.example.stayops.repository;

import com.example.stayops.entity.HousekeepingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {

    List<HousekeepingTask> findByStatus(String status);

    List<HousekeepingTask> findByScheduledDate(LocalDate date);

    List<HousekeepingTask> findByReservationReservationId(Long reservationId);

    List<HousekeepingTask> findByRoomId(Long roomId);

    List<HousekeepingTask> findByAssignedTo(String staffId);

    @Query("SELECT h FROM HousekeepingTask h WHERE h.status = 'PENDING' " +
            "AND h.scheduledDate <= :date ORDER BY h.priority DESC, h.scheduledDate ASC")
    List<HousekeepingTask> findOverdueTasks(@Param("date") LocalDate date);

    @Query("SELECT h FROM HousekeepingTask h WHERE h.status IN ('PENDING', 'IN_PROGRESS') " +
            "AND h.priority = 'URGENT' ORDER BY h.scheduledDate ASC")
    List<HousekeepingTask> findUrgentTasks();
}