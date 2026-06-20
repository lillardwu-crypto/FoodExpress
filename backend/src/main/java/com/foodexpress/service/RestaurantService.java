package com.foodexpress.service;

import com.foodexpress.entity.Restaurant;
import com.foodexpress.entity.RestaurantStatus;
import com.foodexpress.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public Restaurant createSampleRestaurant() {

        List<Restaurant> restaurants =
                restaurantRepository.findAll();

        if (!restaurants.isEmpty()) {
            return restaurants.get(0);
        }

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

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
}
