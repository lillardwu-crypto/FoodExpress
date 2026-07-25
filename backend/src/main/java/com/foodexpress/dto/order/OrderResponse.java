package com.foodexpress.dto.order;

import com.foodexpress.entity.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long orderId;

    private Long userId;

    private Long restaurantId;

    private String restaurantName;

    private Long driverId;

    private OrderStatus status;

    private BigDecimal totalPrice;

    private List<OrderItemResponse> items;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
