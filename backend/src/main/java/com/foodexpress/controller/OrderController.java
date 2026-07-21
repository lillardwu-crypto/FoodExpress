package com.foodexpress.controller;

import com.foodexpress.dto.order.OrderResponse;
import com.foodexpress.dto.order.UpdateOrderStatusRequest;
import com.foodexpress.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 将当前登录用户的 ACTIVE 购物车转换为订单
     */
    @PostMapping
    public ResponseEntity<OrderResponse> checkout(
            Authentication authentication
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.checkout(email);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 查询当前用户的某个订单详情
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.getOrder(orderId, email);

        return ResponseEntity.ok(response);
    }

    /**
     * 查询当前登录用户的历史订单
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication
    ) {
        String email = authentication.getName();

        List<OrderResponse> responses =
                orderService.getUserOrders(email);

        return ResponseEntity.ok(responses);
    }

    /**
     * 更新订单状态
     *
     * 这一接口后面应限制为 ADMIN、RESTAURANT 或 DRIVER，
     * 今天可以暂时保留。
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
