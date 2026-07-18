package com.foodexpress.controller;

import com.foodexpress.dto.cart.AddCartItemRequest;
import com.foodexpress.dto.cart.CartResponse;
import com.foodexpress.dto.cart.UpdateCartItemRequest;
import com.foodexpress.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartResponse> addItemToCart(
            @PathVariable Long userId,
            @RequestBody AddCartItemRequest request
    ) {
        CartResponse response =
                cartService.addItemToCart(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(
        @PathVariable Long userId
        ) {
            return ResponseEntity.ok(
                    cartService.getCart(userId)
            );
        }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            @PathVariable Long cartItemId,
            @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(
                cartService.updateCartItemQuantity(
                        cartItemId,
                        request
                )
        );
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeCartItem(
            @PathVariable Long cartItemId
    ) {
        return ResponseEntity.ok(
                cartService.removeCartItem(cartItemId)
        );
    }
    
}