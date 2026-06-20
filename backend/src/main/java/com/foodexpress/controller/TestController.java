package com.foodexpress.controller;

import com.foodexpress.entity.Restaurant;
import com.foodexpress.entity.RestaurantStatus;
import com.foodexpress.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final RestaurantRepository restaurantRepository;

    @PostMapping("/restaurants")
    public Restaurant createRestaurant() {
        Restaurant restaurant = Restaurant.builder()
                .name("Boston Burger")
                .address("123 Main St, Boston, MA")
                .phone("617-123-4567")
                .status(RestaurantStatus.OPEN)
                .latitude(new BigDecimal("42.3505000"))
                .longitude(new BigDecimal("-71.1054000"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return restaurantRepository.save(restaurant);
    }

    @GetMapping("/restaurants")
    public List<Restaurant> getRestaurants() {
        return restaurantRepository.findAll();
    }
}
