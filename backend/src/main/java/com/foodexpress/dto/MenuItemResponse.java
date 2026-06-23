package com.foodexpress.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemResponse {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private String imageUrl;

    private Boolean available;
}
