package com.foodexpress.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long cartItemId;

    private Long menuItemId;

    private String name;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal subtotal;
}
