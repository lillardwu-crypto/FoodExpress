package com.foodexpress.service;

import com.foodexpress.dto.order.OrderItemResponse;
import com.foodexpress.dto.order.OrderResponse;
import com.foodexpress.entity.Address;
import com.foodexpress.entity.Cart;
import com.foodexpress.entity.CartItem;
import com.foodexpress.entity.CartStatus;
import com.foodexpress.entity.MenuItem;
import com.foodexpress.entity.Order;
import com.foodexpress.entity.OrderItem;
import com.foodexpress.entity.OrderStatus;
import com.foodexpress.entity.RestaurantStatus;
import com.foodexpress.entity.User;
import com.foodexpress.exception.BadRequestException;
import com.foodexpress.exception.ConflictException;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.AddressRepository;
import com.foodexpress.repository.CartItemRepository;
import com.foodexpress.repository.CartRepository;
import com.foodexpress.repository.OrderRepository;
import com.foodexpress.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    // =========================
    // Public business methods
    // =========================

    /**
     * 将当前登录用户的 ACTIVE 购物车转换为订单，
     * 并把用户选择的配送地址保存为订单地址快照。
     */
    @Transactional
    public OrderResponse checkout(
            String email,
            Long addressId
    ) {
        if (addressId == null) {
            throw new BadRequestException(
                    "Address id is required"
            );
        }

        // 1. 根据 JWT 中的邮箱查询当前登录用户
        User user = getUserByEmail(email);

        // 2. 查询配送地址，并验证地址属于当前用户
        Address address = addressRepository
                .findByIdAndUserId(
                        addressId,
                        user.getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found with id: "
                                        + addressId
                        )
                );

        // 3. 查询当前用户的 ACTIVE 购物车
        Cart cart = cartRepository
                .findByUser_IdAndStatus(
                        user.getId(),
                        CartStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active cart not found for user: "
                                        + email
                        )
                );

        // 4. Checkout 前再次检查餐厅是否营业
        if (cart.getRestaurant().getStatus()
                != RestaurantStatus.OPEN) {
            throw new ConflictException(
                    "Restaurant is currently unavailable"
            );
        }

        // 5. 查询购物车中的商品
        List<CartItem> cartItems =
                cartItemRepository.findByCart_Id(
                        cart.getId()
                );

        // 6. 检查购物车是否为空
        if (cartItems.isEmpty()) {
            throw new BadRequestException(
                    "Cannot checkout an empty cart"
            );
        }

        // 7. Checkout 前再次检查商品是否可售
        for (CartItem cartItem : cartItems) {
            MenuItem menuItem = cartItem.getMenuItem();

            if (!menuItem.isAvailable()) {
                throw new ConflictException(
                        "Menu item is currently unavailable: "
                                + menuItem.getName()
                );
            }
        }

        // 8. 根据当前商品价格重新计算订单总价
        BigDecimal totalPrice = cartItems
                .stream()
                .map(cartItem ->
                        cartItem.getMenuItem()
                                .getPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                cartItem.getQuantity()
                                        )
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        // 9. 创建订单，并保存配送地址快照
        Order order = Order.builder()
                .user(user)
                .restaurant(cart.getRestaurant())
                .status(OrderStatus.PENDING)
                .totalPrice(totalPrice)

                // Delivery Address Snapshot
                .deliveryRecipientName(
                        address.getRecipientName()
                )
                .deliveryPhone(
                        address.getPhone()
                )
                .deliveryStreet(
                        address.getStreet()
                )
                .deliveryCity(
                        address.getCity()
                )
                .deliveryState(
                        address.getState()
                )
                .deliveryZipCode(
                        address.getZipCode()
                )
                .build();

        // 10. 将 CartItem 转换为 OrderItem 商品快照
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

        // 11. 保存订单，并级联保存 OrderItem
        Order savedOrder = orderRepository.save(order);

        // 12. 将购物车状态修改为 CHECKED_OUT
        cart.setStatus(CartStatus.CHECKED_OUT);
        cartRepository.save(cart);

        // 13. 返回订单响应
        return buildOrderResponse(savedOrder);
    }

    /**
     * 查询当前登录用户的某个订单详情。
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrder(
            String email,
            Long orderId
    ) {
        User user = getUserByEmail(email);

        Order order = getOrderOwnedByUser(
                orderId,
                user.getId()
        );

        return buildOrderResponse(order);
    }

    /**
     * 查询当前登录用户的全部历史订单。
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(
            String email
    ) {
        User user = getUserByEmail(email);

        return orderRepository
                .findByUser_IdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::buildOrderResponse)
                .toList();
    }

    /**
     * 更新当前登录用户所属订单的状态。
     *
     * 当前阶段只验证：
     * 1. 当前用户真实存在
     * 2. 订单属于当前用户
     * 3. 状态流转合法
     *
     * 后续加入 MERCHANT、DRIVER 后，
     * 还需要根据角色和资源归属进一步限制状态更新权限。
     */
    @Transactional
    public OrderResponse updateOrderStatus(
            String email,
            Long orderId,
            OrderStatus newStatus
    ) {
        if (newStatus == null) {
            throw new BadRequestException(
                    "Order status is required"
            );
        }

        User user = getUserByEmail(email);

        Order order = getOrderOwnedByUser(
                orderId,
                user.getId()
        );

        OrderStatus currentStatus = order.getStatus();

        // 防止重复更新为相同状态
        if (currentStatus == newStatus) {
            throw new ConflictException(
                    "Order is already in status: "
                            + currentStatus
            );
        }

        // 校验状态流转是否合法
        if (!canTransition(currentStatus, newStatus)) {
            throw new ConflictException(
                    "Invalid order status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        order.setStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        return buildOrderResponse(savedOrder);
    }

    // =========================
    // Private helper methods
    // =========================

    /**
     * 根据 JWT 中的邮箱查询当前登录用户。
     */
    private User getUserByEmail(
            String email
    ) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException(
                    "Authenticated user email is required"
            );
        }

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );
    }

    /**
     * 查询订单，并验证订单属于当前登录用户。
     *
     * 对于不属于当前用户的订单同样返回 404，
     * 避免泄露其他用户的订单是否存在。
     */
    private Order getOrderOwnedByUser(
            Long orderId,
            Long userId
    ) {
        if (orderId == null) {
            throw new BadRequestException(
                    "Order id is required"
            );
        }

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: "
                                        + orderId
                        )
                );

        if (!order.getUser()
                .getId()
                .equals(userId)) {
            throw new ResourceNotFoundException(
                    "Order not found with id: "
                            + orderId
            );
        }

        return order;
    }

    /**
     * 判断订单状态是否可以合法流转。
     */
    private boolean canTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus
    ) {
        return switch (currentStatus) {
            case PENDING ->
                    newStatus == OrderStatus.ACCEPTED
                            || newStatus
                            == OrderStatus.CANCELLED;

            case ACCEPTED ->
                    newStatus == OrderStatus.PREPARING
                            || newStatus
                            == OrderStatus.CANCELLED;

            case PREPARING ->
                    newStatus
                            == OrderStatus.READY_FOR_PICKUP;

            case READY_FOR_PICKUP ->
                    newStatus
                            == OrderStatus.OUT_FOR_DELIVERY;

            case OUT_FOR_DELIVERY ->
                    newStatus
                            == OrderStatus.DELIVERED;

            case DELIVERED, CANCELLED -> false;
        };
    }

    /**
     * 将 Order Entity 转换为 OrderResponse DTO。
     */
    private OrderResponse buildOrderResponse(
            Order order
    ) {
        List<OrderItemResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(this::buildOrderItemResponse)
                        .toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .userId(
                        order.getUser().getId()
                )
                .restaurantId(
                        order.getRestaurant().getId()
                )
                .restaurantName(
                        order.getRestaurant().getName()
                )
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * 将 OrderItem Entity 转换为 OrderItemResponse DTO。
     */
    private OrderItemResponse buildOrderItemResponse(
            OrderItem orderItem
    ) {
        BigDecimal subtotal =
                orderItem.getUnitPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        orderItem.getQuantity()
                                )
                        );

        return OrderItemResponse.builder()
                .orderItemId(
                        orderItem.getId()
                )
                .menuItemId(
                        orderItem.getMenuItemId()
                )
                .menuItemName(
                        orderItem.getMenuItemName()
                )
                .unitPrice(
                        orderItem.getUnitPrice()
                )
                .quantity(
                        orderItem.getQuantity()
                )
                .subtotal(subtotal)
                .build();
    }
}
