package com.foodexpress.dto.order;

import com.foodexpress.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDriverOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus status;
}
