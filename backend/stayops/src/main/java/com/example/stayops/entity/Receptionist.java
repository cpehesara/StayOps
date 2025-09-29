package com.example.stayops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "receptionists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Receptionist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;
}
