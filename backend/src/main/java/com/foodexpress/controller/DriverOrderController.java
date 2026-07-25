package com.foodexpress.controller;

import com.foodexpress.dto.order.OrderResponse;
import com.foodexpress.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.foodexpress.dto.order.UpdateDriverOrderStatusRequest;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/driver/orders")
@RequiredArgsConstructor
public class DriverOrderController {

    private final OrderService orderService;

    /**
     * 查询当前 Driver 可以接取的订单。
     */
    @GetMapping("/available")
    public ResponseEntity<List<OrderResponse>>
    getAvailableOrders(
            Authentication authentication
    ) {
        String email = authentication.getName();

        List<OrderResponse> orders =
                orderService.getAvailableDriverOrders(
                        email
                );

        return ResponseEntity.ok(orders);
    }

    /**
     * 当前 Driver 接取指定订单。
     */
    @PostMapping("/{orderId}/accept")
    public ResponseEntity<OrderResponse>
    acceptOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.acceptDriverOrder(
                        email,
                        orderId
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>>
    getDriverOrders(
            Authentication authentication
    ) {
        String email = authentication.getName();

        return ResponseEntity.ok(
                orderService.getDriverOrders(email)
        );
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            Authentication authentication,
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateDriverOrderStatusRequest request
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.updateDriverOrderStatus(
                        email,
                        orderId,
                        request.getStatus()
                );

        return ResponseEntity.ok(response);
    }
}
