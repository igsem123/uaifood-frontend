import { api } from "./api";

export async function loginRequest(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password }, { skipAuthRefresh: true });
    return response.data; // { accessToken, user }
}

export async function refreshRequest() {
    const response = await api.post("/auth/refresh", {}, { skipAuthRefresh: true });
    return response.data; // { accessToken, user }
}

export async function logoutRequest() {
    return api.post("/auth/logout", {}, { skipAuthRefresh: true });
}

export async function signupRequest(email: string, password: string, name: string, phone: string) {
    const response = await api.post("/users", { email, password, name, phone }, { skipAuthRefresh: true });
    return response.data; // { message, user }
}
