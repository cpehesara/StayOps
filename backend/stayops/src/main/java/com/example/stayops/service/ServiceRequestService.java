package com.example.stayops.service;

import com.example.stayops.dto.ServiceRequestDTO;

import java.time.Instant;
import java.util.List;

public interface ServiceRequestService {

    /**
     * Create a new service request
     */
    ServiceRequestDTO createServiceRequest(ServiceRequestDTO dto);

    /**
     * Get service request by ID
     */
    ServiceRequestDTO getServiceRequestById(Long id);

    /**
     * Get all service requests
     */
    List<ServiceRequestDTO> getAllServiceRequests();

    /**
     * Update service request
     */
    ServiceRequestDTO updateServiceRequest(Long id, ServiceRequestDTO dto);

    /**
     * Delete service request
     */
    void deleteServiceRequest(Long id);

    /**
     * Get service requests by status
     */
    List<ServiceRequestDTO> getServiceRequestsByStatus(String status);

    /**
     * Get service requests by type
     */
    List<ServiceRequestDTO> getServiceRequestsByType(String serviceType);

    /**
     * Get service requests by priority
     */
    List<ServiceRequestDTO> getServiceRequestsByPriority(String priority);

    /**
     * Get service requests for a reservation
     */
    List<ServiceRequestDTO> getServiceRequestsByReservation(Long reservationId);

    /**
     * Get service requests for a room
     */
    List<ServiceRequestDTO> getServiceRequestsByRoom(Long roomId);

    /**
     * Get service requests assigned to a staff member
     */
    List<ServiceRequestDTO> getServiceRequestsByAssignedStaff(String staffId);

    /**
     * Get service requests for a specific guest
     */
    List<ServiceRequestDTO> getServiceRequestsByGuest(String guestId);

    /**
     * Get all pending requests
     */
    List<ServiceRequestDTO> getPendingRequests();

    /**
     * Get all urgent requests
     */
    List<ServiceRequestDTO> getUrgentRequests();

    /**
     * Assign service request to staff
     */
    ServiceRequestDTO assignToStaff(Long requestId, String staffId);

    /**
     * Update service request status
     */
    ServiceRequestDTO updateStatus(Long requestId, String status);

    /**
     * Mark service request as completed
     */
    ServiceRequestDTO markAsCompleted(Long requestId);

    /**
     * Get service requests by date range
     */
    List<ServiceRequestDTO> getServiceRequestsByDateRange(Instant startDate, Instant endDate);

    /**
     * Get incomplete service requests
     */
    List<ServiceRequestDTO> getIncompleteRequests();
}