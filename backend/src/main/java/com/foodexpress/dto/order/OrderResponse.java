package com.foodexpress.dto.order;

import com.foodexpress.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    // Delivery address snapshot
    private String deliveryRecipientName;

    private String deliveryPhone;

    private String deliveryStreet;

    private String deliveryCity;

    private String deliveryState;

    private String deliveryZipCode;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}