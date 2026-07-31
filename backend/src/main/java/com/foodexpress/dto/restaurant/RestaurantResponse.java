package com.foodexpress.dto.restaurant;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RestaurantResponse {

    private Long id;

    private String name;

    private String address;

    private String phone;

    private String imageUrl;

    private BigDecimal rating;

    private String category;

    private Integer deliveryTime;

    private BigDecimal deliveryFee;

    private String status;

    private BigDecimal latitude;

    private BigDecimal longitude;
}