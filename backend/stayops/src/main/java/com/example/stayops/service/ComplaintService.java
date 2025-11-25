package com.example.stayops.service;

import com.example.stayops.dto.ComplaintDTO;
import com.example.stayops.dto.ComplaintRequestDTO;
import com.example.stayops.dto.ComplaintUpdateDTO;
import com.example.stayops.enums.ComplaintCategory;
import com.example.stayops.enums.ComplaintPriority;
import com.example.stayops.enums.ComplaintStatus;

import java.util.List;

public interface ComplaintService {
    ComplaintDTO createComplaint(ComplaintRequestDTO requestDTO, String guestId);
    ComplaintDTO updateComplaint(Long complaintId, ComplaintUpdateDTO updateDTO);
    void deleteComplaint(Long complaintId, String guestId);
    ComplaintDTO getComplaint(Long complaintId);
    List<ComplaintDTO> getGuestComplaints(String guestId);
    List<ComplaintDTO> getComplaintsByStatus(ComplaintStatus status);
    List<ComplaintDTO> getComplaintsByCategory(ComplaintCategory category);
    List<ComplaintDTO> getComplaintsByPriority(ComplaintPriority priority);
    List<ComplaintDTO> getStaffComplaints(String staffId);
    List<ComplaintDTO> getActiveComplaintsByPriority();
    Long getComplaintCountByStatus(ComplaintStatus status);
}