import apiClient from "./apiClient";

export async function login(
    email,
    password
) {
    const response =
        await apiClient.post(
            "/api/auth/login",
            {
                email,
                password,
            }
        );

    return response.data;
}

export async function register(
    name,
    email,
    password
) {
    const response =
        await apiClient.post(
            "/api/auth/register",
            {
                name,
                email,
                password,
            }
        );

    return response.data;
}