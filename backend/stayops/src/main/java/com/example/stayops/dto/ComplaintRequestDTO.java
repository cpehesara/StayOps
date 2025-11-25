package com.example.stayops.dto;

import com.example.stayops.enums.ComplaintCategory;
import com.example.stayops.enums.ComplaintPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintRequestDTO {
    private Long reservationId;
    private ComplaintCategory category;
    private String subject;
    private String description;
    private ComplaintPriority priority;
    private List<String> attachments;
}