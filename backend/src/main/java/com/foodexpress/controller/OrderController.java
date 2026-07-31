package com.foodexpress.controller;

import com.foodexpress.dto.order.CheckoutRequest;
import com.foodexpress.dto.order.OrderResponse;
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
     * 将当前登录用户的 ACTIVE 购物车转换为订单。
     *
     * 配送地址通过 addressId 选择，
     * OrderService 会把地址内容保存为订单地址快照。
     *
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<OrderResponse> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequest request
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.checkout(
                        email,
                        request.getAddressId()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 查询当前登录用户的全部历史订单。
     *
     * GET /api/orders
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
     * 查询当前登录用户的订单详情。
     *
     * Service 层负责验证：
     * 1. 当前用户存在
     * 2. 订单属于当前用户
     *
     * GET /api/orders/{orderId}
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.getOrder(
                        email,
                        orderId
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 当前登录用户取消自己的订单。
     *
     * 当前阶段仅允许：
     *
     * PENDING -> CANCELLED
     * ACCEPTED -> CANCELLED
     *
     * Merchant、Driver 的状态更新
     * 将由独立 Controller 提供。
     *
     * PATCH /api/orders/{orderId}/cancel
     */
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.cancelCustomerOrder(
                        email,
                        orderId
                );

        return ResponseEntity.ok(response);
    }
}
