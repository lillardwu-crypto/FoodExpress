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

    /**
     * Add a menu item to the authenticated user's active cart.
     *
     * If the user does not yet have an active cart, a new cart is created
     * using the restaurant associated with the first menu item.
     */
    @Transactional
    public CartResponse addItemToCart(
            String email,
            AddCartItemRequest request
    ) {
        validateAddCartItemRequest(request);

        User user = getUserByEmail(email);

        MenuItem menuItem = menuItemRepository
                .findById(request.getMenuItemId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Menu item not found with id: "
                                        + request.getMenuItemId()
                        )
                );

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

    /**
     * Get the authenticated user's active cart.
     */
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

    /**
     * Replace the quantity of an existing cart item.
     */
    @Transactional
    public CartResponse updateCartItemQuantity(
            String email,
            Long cartItemId,
            UpdateCartItemRequest request
    ) {
        validateUpdateCartItemRequest(request);

        CartItem cartItem = getCartItemById(cartItemId);

        validateCartOwnership(
                cartItem.getCart(),
                email
        );

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return buildCartResponse(
                cartItem.getCart()
        );
    }

    /**
     * Remove an item from the authenticated user's cart.
     */
    @Transactional
    public CartResponse removeCartItem(
            String email,
            Long cartItemId
    ) {
        CartItem cartItem = getCartItemById(cartItemId);
        Cart cart = cartItem.getCart();

        validateCartOwnership(cart, email);

        cartItemRepository.delete(cartItem);

        return buildCartResponse(cart);
    }

    // =========================
    // Private helper methods
    // =========================

    /**
     * Service-layer validation is retained even though the request DTO
     * also uses Bean Validation.
     */
    private void validateAddCartItemRequest(
            AddCartItemRequest request
    ) {
        if (request == null) {
            throw new BadRequestException(
                    "Request body is required"
            );
        }

        if (request.getMenuItemId() == null) {
            throw new BadRequestException(
                    "Menu item id is required"
            );
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {
            throw new BadRequestException(
                    "Quantity must be greater than zero"
            );
        }
    }

    private void validateUpdateCartItemRequest(
            UpdateCartItemRequest request
    ) {
        if (request == null) {
            throw new BadRequestException(
                    "Request body is required"
            );
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {
            throw new BadRequestException(
                    "Quantity must be greater than zero"
            );
        }
    }

    private User getUserByEmail(String email) {
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

    private CartItem getCartItemById(
            Long cartItemId
    ) {
        if (cartItemId == null) {
            throw new BadRequestException(
                    "Cart item id is required"
            );
        }

        return cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart item not found with id: "
                                        + cartItemId
                        )
                );
    }

    /**
     * A menu item must still be available before it can be added.
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
     * Items can only be added from an open restaurant.
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
     * Create an active cart using the restaurant of the first item.
     */
    private Cart createCart(
            User user,
            MenuItem menuItem
    ) {
        Cart cart = Cart.builder()
                .user(user)
                .restaurant(
                        menuItem.getRestaurant()
                )
                .status(CartStatus.ACTIVE)
                .build();

        return cartRepository.save(cart);
    }

    /**
     * One active cart can only contain items from one restaurant.
     */
    private void validateRestaurant(
            Cart cart,
            MenuItem menuItem
    ) {
        Long cartRestaurantId =
                cart.getRestaurant().getId();

        Long menuItemRestaurantId =
                menuItem.getRestaurant().getId();

        if (!cartRestaurantId.equals(
                menuItemRestaurantId
        )) {
            throw new ConflictException(
                    "Cart can only contain items from one restaurant"
            );
        }
    }

    /**
     * Verify that the current authenticated user owns the cart.
     *
     * A 404 response avoids exposing whether another user's cart exists.
     */
    private void validateCartOwnership(
            Cart cart,
            String email
    ) {
        if (cart == null ||
                cart.getUser() == null ||
                !cart.getUser()
                        .getEmail()
                        .equalsIgnoreCase(email)) {
            throw new ResourceNotFoundException(
                    "Cart not found"
            );
        }
    }

    /**
     * Convert the cart entity into its API response.
     *
     * The subtotal and total price are recalculated from the current
     * menu item price and quantity.
     */
    private CartResponse buildCartResponse(
            Cart cart
    ) {
        List<CartItemResponse> itemResponses =
                cartItemRepository
                        .findByCart_Id(cart.getId())
                        .stream()
                        .map(this::buildCartItemResponse)
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
                .userId(
                        cart.getUser().getId()
                )
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

    private CartItemResponse buildCartItemResponse(
            CartItem cartItem
    ) {
        BigDecimal unitPrice =
                cartItem.getMenuItem().getPrice();

        BigDecimal subtotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(
                                cartItem.getQuantity()
                        )
                );

        return CartItemResponse.builder()
                .cartItemId(
                        cartItem.getId()
                )
                .menuItemId(
                        cartItem.getMenuItem().getId()
                )
                .name(
                        cartItem.getMenuItem().getName()
                )
                .unitPrice(unitPrice)
                .quantity(
                        cartItem.getQuantity()
                )
                .subtotal(subtotal)
                .build();
    }
}
