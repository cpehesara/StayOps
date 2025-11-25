package com.example.stayops.dto;

import com.example.stayops.enums.ComplaintCategory;
import com.example.stayops.enums.ComplaintPriority;
import com.example.stayops.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintDTO {
    private Long id;
    private String guestId;
    private String guestName;
    private Long reservationId;
    private ComplaintCategory category;
    private String subject;
    private String description;
    private ComplaintStatus status;
    private ComplaintPriority priority;
    private String assignedToId;
    private String assignedToName;
    private List<String> attachments;
    private String resolution;
    private String internalNotes;
    private LocalDateTime createdAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;
}