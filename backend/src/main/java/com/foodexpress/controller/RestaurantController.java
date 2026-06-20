package com.foodexpress.controller;

import com.foodexpress.entity.Restaurant;
import com.foodexpress.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping("/sample")
    public Restaurant createSampleRestaurant() {
        return restaurantService.createSampleRestaurant();
    }

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }
}
