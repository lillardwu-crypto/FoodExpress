package com.foodexpress.service;

import com.foodexpress.dto.restaurant.RestaurantResponse;
import com.foodexpress.entity.Restaurant;
import com.foodexpress.entity.RestaurantStatus;
import com.foodexpress.exception.ResourceNotFoundException;
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

    /**
     * Creates one sample restaurant only when the database
     * does not already contain any restaurant records.
     */
    public RestaurantResponse createSampleRestaurant() {

        List<Restaurant> restaurants = restaurantRepository.findAll();

        if (!restaurants.isEmpty()) {
            return toRestaurantResponse(restaurants.get(0));
        }

        Restaurant restaurant = Restaurant.builder()
                .name("Boston Burger")
                .address("123 Main St, Boston, MA")
                .phone("617-123-4567")
                .imageUrl("burger.jpg")
                .rating(new BigDecimal("4.8"))
                .category("Burger")
                .deliveryTime(25)
                .deliveryFee(new BigDecimal("2.99"))
                .status(RestaurantStatus.OPEN)
                .latitude(new BigDecimal("42.3505000"))
                .longitude(new BigDecimal("-71.1054000"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        return toRestaurantResponse(savedRestaurant);
    }

    /**
     * Returns all restaurants as API response DTOs.
     */
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::toRestaurantResponse)
                .toList();
    }

    /**
     * Returns one restaurant by id.
     */
    public RestaurantResponse getRestaurantById(Long id) {

        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Restaurant not found with id: " + id
                        )
                );

        return toRestaurantResponse(restaurant);
    }

    /**
     * Converts the persistence entity into the public API response DTO.
     */
    private RestaurantResponse toRestaurantResponse(Restaurant restaurant) {

        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .imageUrl(restaurant.getImageUrl())
                .rating(restaurant.getRating())
                .category(restaurant.getCategory())
                .deliveryTime(restaurant.getDeliveryTime())
                .deliveryFee(restaurant.getDeliveryFee())
                .status(
                        restaurant.getStatus() == null
                                ? null
                                : restaurant.getStatus().name()
                )
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .build();
    }
}




