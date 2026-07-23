package com.foodexpress.controller;

import com.foodexpress.dto.order.CheckoutRequest;
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

        OrderResponse response = orderService.checkout(
                email,
                request.getAddressId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 查询当前登录用户的所有历史订单。
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
     * 查询当前登录用户的某个订单详情。
     *
     * Service 层必须验证该订单属于当前用户，
     * 防止用户通过修改 orderId 查看其他用户的订单。
     *
     * GET /api/orders/{orderId}
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        String email = authentication.getName();

        OrderResponse response = orderService.getOrder(
                email,
                orderId
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 更新订单状态。
     *
     * 当前先把登录用户邮箱传入 Service，
     * 后续可以根据用户角色限制不同的状态操作：
     *
     * CUSTOMER:
     * 只能取消自己的订单
     *
     * RESTAURANT_OWNER:
     * 只能更新自己餐厅的订单
     *
     * DRIVER:
     * 只能更新自己配送的订单
     *
     * PATCH /api/orders/{orderId}/status
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            Authentication authentication,
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        String email = authentication.getName();

        OrderResponse response =
                orderService.updateOrderStatus(
                        email,
                        orderId,
                        request.getStatus()
                );

        return ResponseEntity.ok(response);
    }
}
