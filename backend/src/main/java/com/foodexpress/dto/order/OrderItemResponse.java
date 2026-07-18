package com.foodexpress.dto.order;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long orderItemId;

    private Long menuItemId;

    private String menuItemName;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal subtotal;
}
