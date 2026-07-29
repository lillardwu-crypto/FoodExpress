import apiClient from "./apiClient";

export async function getRestaurants() {
    const response = await apiClient.get("/restaurants");
    return response.data;
}