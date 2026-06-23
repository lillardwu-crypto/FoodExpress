package com.foodexpress.service;

import com.foodexpress.dto.MenuItemResponse;
import com.foodexpress.entity.MenuItem;
import com.foodexpress.entity.Restaurant;
import com.foodexpress.repository.MenuItemRepository;
import com.foodexpress.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuItemResponse createSampleMenuItem(Long restaurantId) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        MenuItem menuItem = MenuItem.builder()
                .restaurant(restaurant)
                .name("Cheese Burger")
                .description("Classic cheese burger")
                .price(new BigDecimal("12.99"))
                .imageUrl("https://example.com/cheese-burger.jpg")
                .available(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);

        return toResponse(savedMenuItem);
    }

    public List<MenuItemResponse> getMenuItemsByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MenuItemResponse toResponse(MenuItem menuItem) {
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .imageUrl(menuItem.getImageUrl())
                .available(menuItem.getAvailable())
                .build();
    }
}