package com.foodexpress.repository;

import com.foodexpress.entity.Cart;
import com.foodexpress.entity.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser_IdAndStatus(
            Long userId,
            CartStatus status
    );
}