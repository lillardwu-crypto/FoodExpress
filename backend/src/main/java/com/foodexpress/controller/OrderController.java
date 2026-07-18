package com.foodexpress.controller;

import com.foodexpress.dto.order.CheckoutRequest;
import com.foodexpress.dto.order.OrderResponse;
import com.foodexpress.dto.order.UpdateOrderStatusRequest;
import com.foodexpress.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Checkout：将用户当前购物车转换为订单
     */
    @PostMapping
    public ResponseEntity<OrderResponse> checkout(
            @Valid @RequestBody CheckoutRequest request
    ) {
        OrderResponse response =
                orderService.checkout(request.getUserId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 查询订单详情
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long orderId
    ) {
        OrderResponse response =
                orderService.getOrder(orderId);

        return ResponseEntity.ok(response);
    }

    /**
     * 查询用户历史订单
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @PathVariable Long userId
    ) {
        List<OrderResponse> responses =
                orderService.getUserOrders(userId);

        return ResponseEntity.ok(responses);
    }

    /**
     * 更新订单状态
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponse response =
                orderService.updateOrderStatus(
                        orderId,
                        request.getStatus()
                );

        return ResponseEntity.ok(response);
    }
}
