package com.example.stayops.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ServiceTypeDTO {

    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must be at most 120 characters")
    private String name;

    @NotBlank(message = "Code is required")
    @Pattern(regexp = "^[A-Z0-9_\\-]+$", message = "Code must be uppercase letters, numbers, underscores or hyphens")
    @Size(max = 20, message = "Code must be at most 20 characters")
    private String code;

    @NotNull(message = "Default charge is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Default charge must be non-negative")
    private BigDecimal defaultCharge;

    @Size(max = 2000, message = "Description must be at most 2000 characters")
    private String description;
}
