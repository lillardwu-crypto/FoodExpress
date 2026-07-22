package com.foodexpress.service;

import com.foodexpress.dto.cart.AddCartItemRequest;
import com.foodexpress.dto.cart.CartItemResponse;
import com.foodexpress.dto.cart.CartResponse;
import com.foodexpress.dto.cart.UpdateCartItemRequest;
import com.foodexpress.entity.Cart;
import com.foodexpress.entity.CartItem;
import com.foodexpress.entity.CartStatus;
import com.foodexpress.entity.MenuItem;
import com.foodexpress.entity.RestaurantStatus;
import com.foodexpress.entity.User;
import com.foodexpress.exception.BadRequestException;
import com.foodexpress.exception.ConflictException;
import com.foodexpress.exception.ResourceNotFoundException;
import com.foodexpress.repository.CartItemRepository;
import com.foodexpress.repository.CartRepository;
import com.foodexpress.repository.MenuItemRepository;
import com.foodexpress.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    // =========================
    // Public business methods
    // =========================

    @Transactional
    public CartResponse addItemToCart(
            String email,
            AddCartItemRequest request
    ) {
        /*
         * DTO 层已经使用 @NotNull 和 @Positive 进行校验。
         * 这里继续保留 Service 层校验，防止未来其他 Service
         * 直接调用该方法时绕过 Controller 校验。
         */
        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {
            throw new BadRequestException(
                    "Quantity must be greater than zero"
            );
        }

        if (request.getMenuItemId() == null) {
            throw new BadRequestException(
                    "Menu item id is required"
            );
        }

        User user = getUserByEmail(email);

        MenuItem menuItem = menuItemRepository
                .findById(request.getMenuItemId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Menu item not found with id: "
                                        + request.getMenuItemId()
                        )
                );

        /*
         * 加入购物车前检查：
         * 1. 商品是否仍然可售
         * 2. 餐厅是否处于 OPEN 状态
         */
        validateMenuItemAvailability(menuItem);
        validateRestaurantAvailability(menuItem);

        Cart cart = cartRepository
                .findByUser_IdAndStatus(
                        user.getId(),
                        CartStatus.ACTIVE
                )
                .orElseGet(() ->
                        createCart(user, menuItem)
                );

        /*
         * 一个购物车只能包含同一家餐厅的商品。
         */
        validateRestaurant(cart, menuItem);

        CartItem cartItem = cartItemRepository
                .findByCart_IdAndMenuItem_Id(
                        cart.getId(),
                        menuItem.getId()
                )
                .orElse(null);

        /*
         * 商品第一次加入购物车时创建 CartItem。
         * 如果商品已存在，则累加数量。
         */
        if (cartItem == null) {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .build();
        } else {
            cartItem.setQuantity(
                    cartItem.getQuantity()
                            + request.getQuantity()
            );
        }

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {

        User user = getUserByEmail(email);

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

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(
            String email,
            Long cartItemId,
            UpdateCartItemRequest request
    ) {
        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {
            throw new BadRequestException(
                    "Quantity must be greater than zero"
            );
        }

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart item not found with id: "
                                        + cartItemId
                        )
                );

        /*
         * 只有购物车所有者才能修改商品数量。
         */
        validateCartOwnership(
                cartItem.getCart(),
                email
        );

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return buildCartResponse(cartItem.getCart());
    }

    @Transactional
    public CartResponse removeCartItem(
            String email,
            Long cartItemId
    ) {
        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart item not found with id: "
                                        + cartItemId
                        )
                );

        Cart cart = cartItem.getCart();

        /*
         * 只有购物车所有者才能删除商品。
         */
        validateCartOwnership(cart, email);

        cartItemRepository.delete(cartItem);

        return buildCartResponse(cart);
    }

    // =========================
    // Private helper methods
    // =========================

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );
    }

    /**
     * 检查菜单商品当前是否可售。
     */
    private void validateMenuItemAvailability(
            MenuItem menuItem
    ) {
        if (!menuItem.isAvailable()) {
            throw new ConflictException(
                    "Menu item is currently unavailable: "
                            + menuItem.getName()
            );
        }
    }

    /**
     * 检查餐厅当前是否正常营业。
     *
     * CLOSED 和 INACTIVE 状态都不能添加商品。
     */
    private void validateRestaurantAvailability(
            MenuItem menuItem
    ) {
        if (menuItem.getRestaurant().getStatus()
                != RestaurantStatus.OPEN) {
            throw new ConflictException(
                    "Restaurant is currently unavailable"
            );
        }
    }

    /**
     * 当前用户没有 ACTIVE 购物车时，
     * 根据第一个商品所属餐厅创建购物车。
     */
    private Cart createCart(
            User user,
            MenuItem menuItem
    ) {
        Cart cart = Cart.builder()
                .user(user)
                .restaurant(menuItem.getRestaurant())
                .status(CartStatus.ACTIVE)
                .build();

        return cartRepository.save(cart);
    }

    /**
     * 一个购物车只能包含同一家餐厅的商品。
     *
     * 这是业务状态冲突，因此返回 409 Conflict，
     * 而不是 400 Bad Request。
     */
    private void validateRestaurant(
            Cart cart,
            MenuItem menuItem
    ) {
        Long cartRestaurantId =
                cart.getRestaurant().getId();

        Long itemRestaurantId =
                menuItem.getRestaurant().getId();

        if (!cartRestaurantId.equals(itemRestaurantId)) {
            throw new ConflictException(
                    "Cart can only contain items from one restaurant"
            );
        }
    }

    /**
     * 验证当前登录用户是否拥有该购物车。
     *
     * 返回 404 而不是 403，避免泄露其他用户购物车是否存在。
     */
    private void validateCartOwnership(
            Cart cart,
            String email
    ) {
        if (!cart.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException(
                    "Cart not found"
            );
        }
    }

    /**
     * 将购物车 Entity 转换成返回给前端的 DTO，
     * 同时重新计算每个商品的小计和购物车总价。
     */
    private CartResponse buildCartResponse(
            Cart cart
    ) {
        List<CartItemResponse> itemResponses =
                cartItemRepository
                        .findByCart_Id(cart.getId())
                        .stream()
                        .map(cartItem -> {

                            BigDecimal subtotal =
                                    cartItem.getMenuItem()
                                            .getPrice()
                                            .multiply(
                                                    BigDecimal.valueOf(
                                                            cartItem.getQuantity()
                                                    )
                                            );

                            return CartItemResponse.builder()
                                    .cartItemId(
                                            cartItem.getId()
                                    )
                                    .menuItemId(
                                            cartItem.getMenuItem()
                                                    .getId()
                                    )
                                    .name(
                                            cartItem.getMenuItem()
                                                    .getName()
                                    )
                                    .unitPrice(
                                            cartItem.getMenuItem()
                                                    .getPrice()
                                    )
                                    .quantity(
                                            cartItem.getQuantity()
                                    )
                                    .subtotal(subtotal)
                                    .build();
                        })
                        .toList();

        BigDecimal totalPrice = itemResponses
                .stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUser().getId())
                .restaurantId(
                        cart.getRestaurant().getId()
                )
                .restaurantName(
                        cart.getRestaurant().getName()
                )
                .items(itemResponses)
                .totalPrice(totalPrice)
                .build();
    }
}
