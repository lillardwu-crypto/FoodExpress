package com.foodexpress.service;

import com.foodexpress.dto.cart.AddCartItemRequest;
import com.foodexpress.dto.cart.CartItemResponse;
import com.foodexpress.dto.cart.CartResponse;
import com.foodexpress.dto.cart.UpdateCartItemRequest;
import com.foodexpress.entity.Cart;
import com.foodexpress.entity.CartItem;
import com.foodexpress.entity.CartStatus;
import com.foodexpress.entity.MenuItem;
import com.foodexpress.entity.User;
import com.foodexpress.exception.BadRequestException;
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
            Long userId,
            AddCartItemRequest request
    ) {
        // 先检查请求参数，避免无意义地查询数据库
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

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        MenuItem menuItem = menuItemRepository
                .findById(request.getMenuItemId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Menu item not found with id: "
                                        + request.getMenuItemId()
                        )
                );

        Cart cart = cartRepository
                .findByUser_IdAndStatus(
                        userId,
                        CartStatus.ACTIVE
                )
                .orElseGet(() ->
                        createCart(user, menuItem)
                );

        validateRestaurant(cart, menuItem);

        CartItem cartItem = cartItemRepository
                .findByCart_IdAndMenuItem_Id(
                        cart.getId(),
                        menuItem.getId()
                )
                .orElse(null);

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
    public CartResponse getCart(Long userId) {

        Cart cart = cartRepository
                .findByUser_IdAndStatus(
                        userId,
                        CartStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active cart not found for user id: "
                                        + userId
                        )
                );

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(
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

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return buildCartResponse(cartItem.getCart());
    }

    @Transactional
    public CartResponse removeCartItem(Long cartItemId) {

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart item not found with id: "
                                        + cartItemId
                        )
                );

        Cart cart = cartItem.getCart();

        cartItemRepository.delete(cartItem);

        return buildCartResponse(cart);
    }

    // =========================
    // Private helper methods
    // =========================

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

    private void validateRestaurant(
            Cart cart,
            MenuItem menuItem
    ) {
        Long cartRestaurantId =
                cart.getRestaurant().getId();

        Long itemRestaurantId =
                menuItem.getRestaurant().getId();

        if (!cartRestaurantId.equals(itemRestaurantId)) {
            throw new BadRequestException(
                    "Cart can only contain items from one restaurant"
            );
        }
    }

    private CartResponse buildCartResponse(Cart cart) {

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
                                    .cartItemId(cartItem.getId())
                                    .menuItemId(
                                            cartItem.getMenuItem().getId()
                                    )
                                    .name(
                                            cartItem.getMenuItem().getName()
                                    )
                                    .unitPrice(
                                            cartItem.getMenuItem().getPrice()
                                    )
                                    .quantity(cartItem.getQuantity())
                                    .subtotal(subtotal)
                                    .build();
                        })
                        .toList();

        BigDecimal totalPrice = itemResponses.stream()
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
