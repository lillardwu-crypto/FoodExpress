package com.foodexpress.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Restaurant basic information
     */
    @Column(nullable = false)
    private String name;

    private String address;

    private String phone;

    /**
     * Restaurant card information
     */
    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    private String category;

    @Column(name = "delivery_time")
    private Integer deliveryTime;

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    /**
     * Restaurant business status
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RestaurantStatus status = RestaurantStatus.OPEN;

    /**
     * Restaurant location
     */
    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    /**
     * Restaurant owner
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnore
    private User owner;

    /**
     * Restaurant menu items
     */
    @OneToMany(mappedBy = "restaurant")
    @JsonIgnore
    private List<MenuItem> menuItems;

    /**
     * Audit timestamps
     */
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}