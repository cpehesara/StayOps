package com.example.stayops.repository;

import com.example.stayops.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.serviceType.code = :code")
    List<ServiceRequest> findByServiceTypeCode(@Param("code") String code);
}