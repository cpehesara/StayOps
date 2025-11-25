package com.example.stayops.repository;

import com.example.stayops.entity.Complaint;
import com.example.stayops.enums.ComplaintCategory;
import com.example.stayops.enums.ComplaintPriority;
import com.example.stayops.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByGuestGuestIdOrderByCreatedAtDesc(String guestId);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findByCategoryOrderByCreatedAtDesc(ComplaintCategory category);

    List<Complaint> findByPriorityOrderByCreatedAtDesc(ComplaintPriority priority);

    List<Complaint> findByAssignedToStaffIdOrderByCreatedAtDesc(String staffId);

    @Query("SELECT c FROM Complaint c WHERE c.status IN :statuses ORDER BY c.priority DESC, c.createdAt ASC")
    List<Complaint> findActiveComplaintsByPriority(List<ComplaintStatus> statuses);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    Long countByStatus(ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.guest.guestId = :guestId AND c.status = :status")
    Long countByGuestGuestIdAndStatus(String guestId, ComplaintStatus status);
}