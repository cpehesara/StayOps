package com.example.stayops.controller;

import com.example.stayops.dto.ServiceTypeDTO;
import com.example.stayops.service.ServiceTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-types")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"*"}) // allow cross origin - adjust as necessary
public class ServiceTypeController {

    private final ServiceTypeService service;

    @PostMapping("/create")
    public ResponseEntity<ServiceTypeDTO> create(@Valid @RequestBody ServiceTypeDTO dto) {
        ServiceTypeDTO created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceTypeDTO> getById(@PathVariable Long id) {
        ServiceTypeDTO dto = service.getById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ServiceTypeDTO> getByCode(@PathVariable String code) {
        ServiceTypeDTO dto = service.getByCode(code);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<ServiceTypeDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ServiceTypeDTO> update(@PathVariable Long id,
                                                 @Valid @RequestBody ServiceTypeDTO dto) {
        ServiceTypeDTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
