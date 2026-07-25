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
import com.foodexpress.entity.Restaurant;
import com.foodexpress.entity.RestaurantStatus;
import com.foodexpress.entity.User;
import com.foodexpress.entity.UserRole;
import com.foodexpress.exception.BadRequestException;
import com.foodexpress.exception.ConflictException;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.AddressRepository;
import com.foodexpress.repository.CartItemRepository;
import com.foodexpress.repository.CartRepository;
import com.foodexpress.repository.OrderRepository;
import com.foodexpress.repository.RestaurantRepository;
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
    private final RestaurantRepository restaurantRepository;

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
     * 查询当前登录商家所属餐厅的全部订单。
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getMerchantOrders(
            String email
    ) {
        // 1. 查询当前登录用户，并验证其 Merchant 角色
        User merchant = getMerchantByEmail(email);

        // 2. 查询该 Merchant 所拥有的餐厅
        Restaurant restaurant =
                getRestaurantOwnedByMerchant(
                        merchant
                );

        // 3. 查询该餐厅的全部订单
        return orderRepository
                .findByRestaurant_IdOrderByCreatedAtDesc(
                        restaurant.getId()
                )
                .stream()
                .map(this::buildOrderResponse)
                .toList();
    }

    /**
     * 商家更新自己餐厅订单的状态。
     *
     * 商家当前只允许以下状态流转：
     *
     * PENDING -> ACCEPTED
     * ACCEPTED -> PREPARING
     * PREPARING -> READY_FOR_PICKUP
     */
    @Transactional
    public OrderResponse updateMerchantOrderStatus(
            String email,
            Long orderId,
            OrderStatus newStatus
    ) {
        // 1. 校验请求参数
        if (orderId == null) {
            throw new BadRequestException(
                    "Order id is required"
            );
        }

        if (newStatus == null) {
            throw new BadRequestException(
                    "Order status is required"
            );
        }

        // 2. 查询当前登录用户，并验证其 Merchant 角色
        User merchant = getMerchantByEmail(email);

        // 3. 查询该 Merchant 所拥有的餐厅
        Restaurant restaurant =
                getRestaurantOwnedByMerchant(
                        merchant
                );

        // 4. 查询订单
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: "
                                        + orderId
                        )
                );

        /*
         * 5. 验证订单属于当前商家的餐厅。
         *
         * 对于不属于当前商家的订单同样返回 404，
         * 避免泄露其他餐厅订单是否存在。
         */
        if (!order.getRestaurant()
                .getId()
                .equals(restaurant.getId())) {
            throw new ResourceNotFoundException(
                    "Order not found with id: "
                            + orderId
            );
        }

        OrderStatus currentStatus =
                order.getStatus();

        // 6. 防止重复更新为相同状态
        if (currentStatus == newStatus) {
            throw new ConflictException(
                    "Order is already in status: "
                            + currentStatus
            );
        }

        // 7. 校验 Merchant 状态流转
        if (!canMerchantTransition(
                currentStatus,
                newStatus
        )) {
            throw new ConflictException(
                    "Invalid merchant order status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        // 8. 更新订单状态
        order.setStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        // 9. 返回更新后的订单
        return buildOrderResponse(savedOrder);
    }

    /**
     * 更新当前登录用户所属订单的状态。
     *
     * 当前阶段只验证：
     * 1. 当前用户真实存在
     * 2. 订单属于当前用户
     * 3. 状态流转合法
     *
     * 后续该接口会调整为 Customer 专用取消接口。
     * Merchant 状态更新使用单独的 Merchant 接口。
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

        OrderStatus currentStatus =
                order.getStatus();

        // 防止重复更新为相同状态
        if (currentStatus == newStatus) {
            throw new ConflictException(
                    "Order is already in status: "
                            + currentStatus
            );
        }

        // 校验状态流转是否合法
        if (!canTransition(
                currentStatus,
                newStatus
        )) {
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

        /**
         * 查询当前 Driver 可以接取的订单。
         *
         * 可接订单必须满足：
         * 1. 当前状态为 READY_FOR_PICKUP
         * 2. 尚未分配 Driver
         */
        @Transactional(readOnly = true)
        public List<OrderResponse> getAvailableDriverOrders(
                String email
        ) {
        // 1. 验证当前登录用户是 Driver
        getDriverByEmail(email);

        // 2. 查询已经备餐完成、但尚未分配 Driver 的订单
        return orderRepository
                .findByStatusAndDriverIsNullOrderByCreatedAtAsc(
                        OrderStatus.READY_FOR_PICKUP
                )
                .stream()
                .map(this::buildOrderResponse)
                .toList();
        }


                /**
         * 当前 Driver 接取一个等待配送的订单。
         *
         * 接单条件：
         * 1. 当前用户必须是 Driver
         * 2. 订单必须存在
         * 3. 订单状态必须为 READY_FOR_PICKUP
         * 4. 订单尚未被其他 Driver 接取
         */
        @Transactional
        public OrderResponse acceptDriverOrder(
                String email,
                Long orderId
        ) {
        // 1. 校验订单 ID
        if (orderId == null) {
                throw new BadRequestException(
                        "Order id is required"
                );
        }

        // 2. 查询当前登录用户，并验证其 Driver 角色
        User driver = getDriverByEmail(email);

        // 3. 查询订单
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: "
                                        + orderId
                        )
                );

        // 4. 只有已经完成备餐的订单才能被接取
        if (order.getStatus()
                != OrderStatus.READY_FOR_PICKUP) {
                throw new ConflictException(
                        "Order is not ready for pickup"
                );
        }

        // 5. 防止已经被其他 Driver 接取的订单再次被接取
        if (order.getDriver() != null) {
                throw new ConflictException(
                        "Order has already been accepted by another driver"
                );
        }

        // 6. 将当前 Driver 分配给订单
        order.setDriver(driver);

        // 7. 保存订单
        Order savedOrder =
                orderRepository.save(order);

        // 8. 返回更新后的订单
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
     * 根据 JWT 邮箱查询当前用户，
     * 并验证当前用户是 Merchant。
     */
    private User getMerchantByEmail(
            String email
    ) {
        User merchant = getUserByEmail(email);

        if (merchant.getRole()
                != UserRole.MERCHANT) {
            throw new ConflictException(
                    "Current user is not a merchant"
            );
        }

        return merchant;
    }

    /**
     * 根据 JWT 邮箱查询当前用户，
     * 并验证当前用户是 Driver。
     *
     * Driver 业务方法将在后续调用该方法，
     * 统一完成用户查询和角色验证。
     */
    private User getDriverByEmail(
            String email
    ) {
        User driver = getUserByEmail(email);

        if (driver.getRole()
                != UserRole.DRIVER) {
            throw new ConflictException(
                    "Current user is not a driver"
            );
        }

        return driver;
    }

    /**
     * 查询当前 Merchant 所拥有的餐厅。
     *
     * Merchant 角色验证已经由
     * getMerchantByEmail() 完成。
     */
    private Restaurant getRestaurantOwnedByMerchant(
            User merchant
    ) {
        return restaurantRepository
                .findByOwner_Id(
                        merchant.getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Restaurant not found for merchant: "
                                        + merchant.getEmail()
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
     * 判断 Merchant 是否可以执行状态流转。
     *
     * Merchant 只负责餐厅处理阶段：
     *
     * PENDING -> ACCEPTED
     * ACCEPTED -> PREPARING
     * PREPARING -> READY_FOR_PICKUP
     */
    private boolean canMerchantTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus
    ) {
        return switch (currentStatus) {
            case PENDING ->
                    newStatus
                            == OrderStatus.ACCEPTED;

            case ACCEPTED ->
                    newStatus
                            == OrderStatus.PREPARING;

            case PREPARING ->
                    newStatus
                            == OrderStatus.READY_FOR_PICKUP;

            case READY_FOR_PICKUP,
                 OUT_FOR_DELIVERY,
                 DELIVERED,
                 CANCELLED -> false;
        };
    }

    /**
     * 判断通用订单状态是否可以合法流转。
     *
     * 当前该方法仍然被旧的 Customer 状态更新接口使用。
     */
    private boolean canTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus
    ) {
        return switch (currentStatus) {
            case PENDING ->
                    newStatus
                            == OrderStatus.ACCEPTED
                            || newStatus
                            == OrderStatus.CANCELLED;

            case ACCEPTED ->
                    newStatus
                            == OrderStatus.PREPARING
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

            case DELIVERED,
                 CANCELLED -> false;
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
                        .driverId(
                                order.getDriver() == null
                                        ? null
                                        : order.getDriver().getId()
                        )
                        .status(order.getStatus())
                        .totalPrice(order.getTotalPrice())
                        .items(itemResponses)
                        .createdAt(order.getCreatedAt())
                        .updatedAt(order.getUpdatedAt())
                        .build();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getDriverOrders(
                String email
        ) {
        User driver = getDriverByEmail(email);

        return orderRepository
                .findByDriver_IdOrderByCreatedAtDesc(
                        driver.getId()
                )
                .stream()
                .map(this::buildOrderResponse)
                .toList();
        }

        @Transactional
        public OrderResponse updateDriverOrderStatus(
                String email,
                Long orderId,
                OrderStatus newStatus
        ) {
        User driver = getDriverByEmail(email);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId
                        )
                );

        if (order.getDriver() == null ||
                !order.getDriver().getId().equals(driver.getId())) {
                throw new ConflictException(
                        "Order is not assigned to current driver"
                );
        }

        OrderStatus currentStatus = order.getStatus();

        boolean validTransition =
                currentStatus == OrderStatus.READY_FOR_PICKUP
                        && newStatus == OrderStatus.OUT_FOR_DELIVERY
                ||
                currentStatus == OrderStatus.OUT_FOR_DELIVERY
                        && newStatus == OrderStatus.DELIVERED;

        if (!validTransition) {
                throw new ConflictException(
                        "Invalid driver order status transition: "
                                + currentStatus
                                + " -> "
                                + newStatus
                );
        }

        order.setStatus(newStatus);

        Order savedOrder = orderRepository.saveAndFlush(order);

        return buildOrderResponse(savedOrder);
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
