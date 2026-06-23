package com.foodexpress.controller;

import com.foodexpress.dto.MenuItemResponse;
import com.foodexpress.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @PostMapping("/sample")
    public MenuItemResponse createSampleMenuItem(@PathVariable Long restaurantId) {
        return menuItemService.createSampleMenuItem(restaurantId);
    }

    @GetMapping
    public List<MenuItemResponse> getMenuItemsByRestaurant(@PathVariable Long restaurantId) {
        return menuItemService.getMenuItemsByRestaurant(restaurantId);
    }
}
