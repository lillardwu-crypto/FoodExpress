package com.foodexpress.controller;

import com.foodexpress.dto.order.OrderResponse;
import com.foodexpress.entity.OrderStatus;
import com.foodexpress.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/merchant/orders")
@RequiredArgsConstructor
public class MerchantOrderController {

    private final OrderService orderService;

    /**
     * 查询当前登录商家所属餐厅的全部订单。
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>>
    getMerchantOrders(
            Authentication authentication
    ) {
        String email =
                authentication.getName();

        List<OrderResponse> orders =
                orderService.getMerchantOrders(
                        email
                );

        return ResponseEntity.ok(orders);
    }

    /**
     * 商家更新自己餐厅订单的状态。
     *
     * 允许：
     * PENDING -> ACCEPTED
     * ACCEPTED -> PREPARING
     * PREPARING -> READY_FOR_PICKUP
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse>
    updateMerchantOrderStatus(
            Authentication authentication,
            @PathVariable Long orderId,
            @RequestBody UpdateMerchantOrderStatusRequest request
    ) {
        String email =
                authentication.getName();

        OrderResponse response =
                orderService.updateMerchantOrderStatus(
                        email,
                        orderId,
                        request.getStatus()
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 当前先将请求 DTO 放在 Controller 内部。
     * 后续前端联调时可以再移动到 dto/order 目录。
     */
    public static class UpdateMerchantOrderStatusRequest {

        private OrderStatus status;

        public OrderStatus getStatus() {
            return status;
        }

        public void setStatus(
                OrderStatus status
        ) {
            this.status = status;
        }
    }
}