package com.example.stayops.repository;

import com.example.stayops.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    // Find by status
    List<ServiceRequest> findByStatus(String status);

    // Find by service type
    List<ServiceRequest> findByServiceType(String serviceType);

    // Find by priority
    List<ServiceRequest> findByPriority(String priority);

    // Find by reservation
    List<ServiceRequest> findByReservationReservationId(Long reservationId);

    // Find by room
    List<ServiceRequest> findByRoomId(Long roomId);

    // Find by assigned staff
    List<ServiceRequest> findByAssignedTo(String assignedTo);

    // Find by guest/requestedBy
    List<ServiceRequest> findByRequestedBy(String guestId);

    // Find pending requests
    @Query("SELECT s FROM ServiceRequest s WHERE s.status = 'PENDING' ORDER BY s.createdAt ASC")
    List<ServiceRequest> findPendingRequests();

    // Find urgent requests
    @Query("SELECT s FROM ServiceRequest s WHERE s.priority = 'URGENT' AND s.status != 'COMPLETED' ORDER BY s.createdAt ASC")
    List<ServiceRequest> findUrgentRequests();

    // Find requests by status and priority
    List<ServiceRequest> findByStatusAndPriority(String status, String priority);

    // Find requests created within date range
    @Query("SELECT s FROM ServiceRequest s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    List<ServiceRequest> findByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    // Find incomplete requests (not completed or cancelled)
    @Query("SELECT s FROM ServiceRequest s WHERE s.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<ServiceRequest> findIncompleteRequests();

    // Count by status
    Long countByStatus(String status);
}