package com.example.stayops.dto;

import com.example.stayops.entity.ServiceRequest.RequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ServiceRequestDTO {
    private Long requestId;
    private Long reservationId;
    private String guestId;
    private Long roomId;
    private Long serviceTypeId;
    private String assignedTo;
    private String description;
    private LocalDateTime requestAt;
    private RequestStatus status;
}
