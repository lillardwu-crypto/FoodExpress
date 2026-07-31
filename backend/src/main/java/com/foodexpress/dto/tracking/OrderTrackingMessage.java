package com.foodexpress.dto.tracking;

import com.foodexpress.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * WebSocket message sent to clients when an order
 * tracking event occurs.
 *
 * This DTO is intentionally separated from
 * OrderResponse because REST APIs and
 * WebSocket messages have different purposes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingMessage {

    /**
     * Order identifier.
     */
    private Long orderId;

    /**
     * Current order status.
     */
    private OrderStatus status;

    /**
     * Driver latitude.
     *
     * Null until the order is
     * OUT_FOR_DELIVERY.
     */
    private Double driverLatitude;

    /**
     * Driver longitude.
     *
     * Null until the order is
     * OUT_FOR_DELIVERY.
     */
    private Double driverLongitude;
}