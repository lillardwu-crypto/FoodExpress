import apiClient from "./apiClient";

export async function getRestaurants() {
    const response = await apiClient.get(
        "/api/restaurants"
    );

    return response.data;
}

export async function getRestaurantById(id) {
    const response = await apiClient.get(
        `/api/restaurants/${id}`
    );

    return response.data;
}