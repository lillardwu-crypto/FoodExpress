import apiClient from "./apiClient";

export async function checkout(
    addressId
) {
    const response =
        await apiClient.post(
            "/api/orders",
            {
                addressId,
            }
        );

    return response.data;
}

export async function getOrders() {
    const response =
        await apiClient.get(
            "/api/orders"
        );

    return response.data;
}

export async function getOrderById(
    orderId
) {
    const response =
        await apiClient.get(
            `/api/orders/${orderId}`
        );

    return response.data;
}

export async function getMerchantOrders() {
    const response =
        await apiClient.get(
            "/api/merchant/orders"
        );

    return response.data;
}

export async function updateMerchantOrderStatus(
    orderId,
    status
) {
    const response =
        await apiClient.patch(
            `/api/merchant/orders/${orderId}/status`,
            {
                status,
            }
        );

    return response.data;
}

/*
 * Driver APIs
 */

export async function getAvailableDriverOrders() {
    const response =
        await apiClient.get(
            "/api/driver/orders/available"
        );

    return response.data;
}

export async function acceptDriverOrder(
    orderId
) {
    const response =
        await apiClient.post(
            `/api/driver/orders/${orderId}/accept`
        );

    return response.data;
}

export async function getDriverOrders() {
    const response =
        await apiClient.get(
            "/api/driver/orders"
        );

    return response.data;
}

export async function updateDriverOrderStatus(
    orderId,
    status
) {
    const response =
        await apiClient.patch(
            `/api/driver/orders/${orderId}/status`,
            {
                status,
            }
        );

    return response.data;
}

export async function cancelOrder(
    orderId
) {
    const response =
        await apiClient.patch(
            `/api/orders/${orderId}/cancel`
        );

    return response.data;
}