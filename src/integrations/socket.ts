import { io } from "socket.io-client";
import { getAccessToken } from "@/auth/tokenStore.ts";

let socket = null;

console.log("API_URL =", import.meta.env.VITE_API_BASE_URL);

export function connectSocket() {
    const token = getAccessToken();

    socket = io(import.meta.env.VITE_API_BASE_URL, {
        auth: { token },
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log("Socket conectado:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket desconectado");
    });

    return socket;
}

export function getSocket() {
    return socket;
}
