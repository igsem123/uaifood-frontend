import axios from "axios";
import { refreshRequest, logoutRequest } from "./authApi";
import { getAccessToken, setAccessToken } from "../auth/tokenStore";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});

// INTERCEPTOR: adiciona accessToken
api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// INTERCEPTOR: renova token se expirar
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // ‘Flag’ para sinalizar que não deve tentar renovar se for uma requisição de refresh ou logout
        if (originalRequest?.skipAuthRefresh) {
            return Promise.reject(error);
        }

        // Se deu 401 e ainda não tentamos renovar
        if (error.response?.status === 401 && !originalRequest.__retry) {
            originalRequest.__retry = true;

            try {
                const data = await refreshRequest();
                setAccessToken(data.accessToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                // tenta de novo
                return api(originalRequest);
            } catch (err) {
                // Se não conseguir renovar, desloga
                await logoutRequest();
                setAccessToken(null);
                window.location.href = '/auth'; // redireciona para auth
            }
        }

        return Promise.reject(error);
    }
);
