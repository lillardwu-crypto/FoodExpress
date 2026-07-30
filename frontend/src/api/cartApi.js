import apiClient from "./apiClient";

export async function addToCart(menuItemId, quantity) {
    const response = await apiClient.post(
        "/api/carts/items",
        {
            menuItemId,
            quantity,
        }
    );

    return response.data;
}

export async function getCart() {
    const response = await apiClient.get(
        "/api/carts"
    );

    return response.data;
}