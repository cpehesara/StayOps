package com.example.stayops.dto;

import com.example.stayops.enums.ComplaintPriority;
import com.example.stayops.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintUpdateDTO {
    private ComplaintStatus status;
    private ComplaintPriority priority;
    private String assignedToId;
    private String resolution;
    private String internalNotes;
}