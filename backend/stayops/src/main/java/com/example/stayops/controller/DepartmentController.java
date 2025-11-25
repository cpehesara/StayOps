package com.example.stayops.controller;

import com.example.stayops.dto.DepartmentRequestDTO;
import com.example.stayops.dto.DepartmentResponseDTO;
import com.example.stayops.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
@Slf4j
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * Create a new department
     * POST /api/departments/create
     */
    @PostMapping("/create")
    public ResponseEntity<DepartmentResponseDTO> createDepartment(@RequestBody DepartmentRequestDTO dto) {
        log.info("REST request to create department: {}", dto.getName());
        DepartmentResponseDTO response = departmentService.createDepartment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update an existing department
     * PUT /api/departments/update/{id}
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<DepartmentResponseDTO> updateDepartment(
            @PathVariable Long id,
            @RequestBody DepartmentRequestDTO dto) {
        log.info("REST request to update department with id: {}", id);
        DepartmentResponseDTO response = departmentService.updateDepartment(id, dto);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a department
     * DELETE /api/departments/delete/{id}
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        log.info("REST request to delete department with id: {}", id);
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get department by ID
     * GET /api/departments/get/{id}
     */
    @GetMapping("/get/{id}")
    public ResponseEntity<DepartmentResponseDTO> getDepartmentById(@PathVariable Long id) {
        log.info("REST request to get department with id: {}", id);
        DepartmentResponseDTO response = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all departments
     * GET /api/departments/getAll
     */
    @GetMapping("/getAll")
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        log.info("REST request to get all departments");
        List<DepartmentResponseDTO> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }
}