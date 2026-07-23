
package com.foodexpress.controller;

import com.foodexpress.dto.cart.AddCartItemRequest;
import com.foodexpress.dto.cart.CartResponse;
import com.foodexpress.dto.cart.UpdateCartItemRequest;
import com.foodexpress.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * Add a menu item to the current authenticated user's cart.
     *
     * POST /api/carts/items
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            Authentication authentication,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        String email = authentication.getName();

        CartResponse response = cartService.addItemToCart(
                email,
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Get the current authenticated user's active cart.
     *
     * GET /api/carts
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            Authentication authentication
    ) {
        String email = authentication.getName();

        CartResponse response = cartService.getCart(email);

        return ResponseEntity.ok(response);
    }

    /**
     * Update the quantity of an item in the current user's cart.
     *
     * PUT /api/carts/items/{cartItemId}
     */
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            Authentication authentication,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        String email = authentication.getName();

        CartResponse response = cartService.updateCartItemQuantity(
                email,
                cartItemId,
                request
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Remove an item from the current user's cart.
     *
     * DELETE /api/carts/items/{cartItemId}
     */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeCartItem(
            Authentication authentication,
            @PathVariable Long cartItemId
    ) {
        String email = authentication.getName();

        CartResponse response = cartService.removeCartItem(
                email,
                cartItemId
        );

        return ResponseEntity.ok(response);
    }
}

