package com.foodexpress.repository;

import com.foodexpress.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantRepository
        extends JpaRepository<Restaurant, Long> {

    Optional<Restaurant> findByOwner_Id(Long ownerId);
}