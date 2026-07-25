package com.foodexpress.repository;

import com.foodexpress.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import com.foodexpress.entity.OrderStatus;
import java.util.List;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(
            Long userId
    );

    List<Order> findByRestaurant_IdOrderByCreatedAtDesc(
            Long restaurantId
    );

    List<Order> findByStatusAndDriverIsNullOrderByCreatedAtAsc(
            OrderStatus status
    );

    List<Order> findByDriver_IdOrderByCreatedAtDesc(
            Long driverId
    );
}
