package com.foodexpress.repository;

import com.foodexpress.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCart_IdAndMenuItem_Id(
            Long cartId,
            Long menuItemId
    );

    List<CartItem> findByCart_Id(Long cartId);
}