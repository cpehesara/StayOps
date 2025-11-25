package com.example.stayops.repository;

import com.example.stayops.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByName(String name);

    // Fetch department with staff eagerly to avoid lazy loading issues
    @Query("SELECT DISTINCT d FROM Department d LEFT JOIN FETCH d.staff WHERE d.id = :id")
    Optional<Department> findByIdWithStaff(Long id);

    // Fetch all departments with staff eagerly
    @Query("SELECT DISTINCT d FROM Department d LEFT JOIN FETCH d.staff")
    List<Department> findAllWithStaff();
}