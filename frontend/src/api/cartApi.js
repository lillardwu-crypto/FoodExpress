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

export async function updateCartItem(cartItemId, quantity) {
    const response = await apiClient.put(
        `/api/carts/items/${cartItemId}`,
        {
            quantity,
        }
    );

    return response.data;
}

export async function removeCartItem(cartItemId) {
    const response = await apiClient.delete(
        `/api/carts/items/${cartItemId}`
    );

    return response.data;
}

