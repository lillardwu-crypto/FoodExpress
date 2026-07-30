import apiClient from "./apiClient";

export async function getAddresses() {
    const response = await apiClient.get(
        "/api/addresses"
    );

    return response.data;
}

export async function createAddress(addressData) {
    const response = await apiClient.post(
        "/api/addresses",
        addressData
    );

    return response.data;
}

export async function updateAddress(
    addressId,
    addressData
) {
    const response = await apiClient.put(
        `/api/addresses/${addressId}`,
        addressData
    );

    return response.data;
}

export async function deleteAddress(addressId) {
    const response = await apiClient.delete(
        `/api/addresses/${addressId}`
    );

    return response.data;
}

export async function setDefaultAddress(addressId) {
    const response = await apiClient.patch(
        `/api/addresses/${addressId}/default`
    );

    return response.data;
}