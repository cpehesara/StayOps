package com.example.stayops.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"hotel", "reservations"})
@EqualsAndHashCode(exclude = {"hotel", "reservations"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String roomNumber;

    @NotBlank
    private String type;

    @Min(1)
    private int capacity;

    private Double pricePerNight;

    @NotBlank
    private String availabilityStatus;

    private String floorNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "panorama_url")
    private String panoramaUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "gallery_images", columnDefinition = "json")
    private List<String> galleryImages;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "amenities", columnDefinition = "json")
    private List<String> amenities;

    @Column(name = "view_type")
    private String viewType;

    @Column(name = "square_footage")
    private Integer squareFootage;

    @Column(name = "bed_type")
    private String bedType;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "hotel_id", nullable = true)
    @JsonIgnoreProperties({"staffMembers", "rooms", "departments", "amenities"})
    private Hotel hotel;

    @ManyToMany(mappedBy = "rooms", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();
}