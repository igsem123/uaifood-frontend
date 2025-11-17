import { api } from "./api";
import { transformApiError } from "@/api/apiErrorValidation.ts";

export async function loginRequest(email: string, password: string) {
    try {
        const response = await api.post("/auth/login", { email, password }, { skipAuthRefresh: true });
        return response.data; // { accessToken, user }
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function refreshRequest() {
    try {
        const response = await api.post("/auth/refresh", {}, { skipAuthRefresh: true });
        return response.data; // { accessToken, user }
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function logoutRequest() {
    return api.post("/auth/logout", {}, { skipAuthRefresh: true });
}

export async function signupRequest(email: string, password: string, name: string, phone: string) {
    try {
        const response = await api.post("/users", { email, password, name, phone }, { skipAuthRefresh: true });
        return response.data; // { message, user }
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function profileRequest() {
    try {
        const response = await api.get("/auth/profile");
        return response.data; // { message, user }
    } catch (error) {
        throw transformApiError(error);
    }
}