
package com.foodexpress.controller;

import com.foodexpress.dto.restaurant.RestaurantResponse;
import com.foodexpress.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    /**
     * Creates a sample restaurant when the database is empty.
     */
    @PostMapping("/sample")
    public RestaurantResponse createSampleRestaurant() {
        return restaurantService.createSampleRestaurant();
    }

    /**
     * Returns all restaurants.
     */
    @GetMapping
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    /**
     * Returns one restaurant by id.
     */
    @GetMapping("/{id}")
    public RestaurantResponse getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }
}

