package com.foodexpress.service;

import com.foodexpress.dto.order.OrderItemResponse;
import com.foodexpress.dto.order.OrderResponse;
import com.foodexpress.entity.*;
import com.foodexpress.exception.BadRequestException;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.CartItemRepository;
import com.foodexpress.repository.CartRepository;
import com.foodexpress.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    /**
     * Checkout：将用户当前 ACTIVE 购物车转换为订单
     */
    @Transactional
    public OrderResponse checkout(Long userId) {

        // 1. 查询用户当前 ACTIVE 购物车
        Cart cart = cartRepository
                .findByUser_IdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active cart not found for user id: " + userId
                ));

        // 2. 查询购物车中的商品
        List<CartItem> cartItems =
                cartItemRepository.findByCart_Id(cart.getId());

        if (cartItems.isEmpty()) {
            throw new BadRequestException(
                    "Cannot checkout an empty cart"
            );
        }

        // 3. 根据购物车商品重新计算订单总价
        BigDecimal totalPrice = cartItems.stream()
                .map(cartItem -> cartItem.getMenuItem()
                        .getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        cartItem.getQuantity()
                                )
                        ))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. 创建订单
        Order order = Order.builder()
                .user(cart.getUser())
                .restaurant(cart.getRestaurant())
                .status(OrderStatus.PENDING)
                .totalPrice(totalPrice)
                .build();

        // 5. CartItem 转换为 OrderItem 快照
        for (CartItem cartItem : cartItems) {

            MenuItem menuItem = cartItem.getMenuItem();

            OrderItem orderItem = OrderItem.builder()
                    .menuItemId(menuItem.getId())
                    .menuItemName(menuItem.getName())
                    .unitPrice(menuItem.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();

            order.addItem(orderItem);
        }

        // 6. 保存 Order，级联保存 OrderItem
        Order savedOrder = orderRepository.save(order);

        // 7. 修改购物车状态
        cart.setStatus(CartStatus.CHECKED_OUT);
        cartRepository.save(cart);

        // 8. 返回结果
        return buildOrderResponse(savedOrder);
    }

    /**
     * 查询订单详情
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId
                ));

        return buildOrderResponse(order);
    }

    /**
     * 查询用户历史订单
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {

        return orderRepository
                .findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::buildOrderResponse)
                .toList();
    }

    /**
     * 更新订单状态
     */
    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatus newStatus
    ) {
        // 1. 查询订单
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId
                ));

        OrderStatus currentStatus = order.getStatus();

        // 2. 防止重复更新为相同状态
        if (currentStatus == newStatus) {
            throw new BadRequestException(
                    "Order is already in status: " + currentStatus
            );
        }

        // 3. 校验状态流转是否合法
        if (!canTransition(currentStatus, newStatus)) {
            throw new BadRequestException(
                    "Invalid order status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        // 4. 修改订单状态
        order.setStatus(newStatus);

        // 5. 保存订单
        Order savedOrder = orderRepository.save(order);

        // 6. 返回更新后的订单
        return buildOrderResponse(savedOrder);
    }

    /**
     * 判断订单状态是否可以合法流转
     */
    private boolean canTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus
    ) {
        return switch (currentStatus) {

            case PENDING ->
                    newStatus == OrderStatus.ACCEPTED
                            || newStatus == OrderStatus.CANCELLED;

            case ACCEPTED ->
                    newStatus == OrderStatus.PREPARING
                            || newStatus == OrderStatus.CANCELLED;

            case PREPARING ->
                    newStatus == OrderStatus.READY_FOR_PICKUP;

            case READY_FOR_PICKUP ->
                    newStatus == OrderStatus.OUT_FOR_DELIVERY;

            case OUT_FOR_DELIVERY ->
                    newStatus == OrderStatus.DELIVERED;

            case DELIVERED, CANCELLED -> false;
        };
    }

    /**
     * 将 Order Entity 转换为 OrderResponse DTO
     */
    private OrderResponse buildOrderResponse(Order order) {

        List<OrderItemResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(this::buildOrderItemResponse)
                        .toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .userId(order.getUser().getId())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * 将 OrderItem Entity 转换为 OrderItemResponse DTO
     */
    private OrderItemResponse buildOrderItemResponse(
            OrderItem orderItem
    ) {

        BigDecimal subtotal = orderItem.getUnitPrice()
                .multiply(
                        BigDecimal.valueOf(
                                orderItem.getQuantity()
                        )
                );

        return OrderItemResponse.builder()
                .orderItemId(orderItem.getId())
                .menuItemId(orderItem.getMenuItemId())
                .menuItemName(orderItem.getMenuItemName())
                .unitPrice(orderItem.getUnitPrice())
                .quantity(orderItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
