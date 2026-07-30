import apiClient from "./apiClient";

export async function getMenuItemsByRestaurant(restaurantId) {
    const response = await apiClient.get(
        `/api/restaurants/${restaurantId}/menu-items`
    );

    return response.data;
}