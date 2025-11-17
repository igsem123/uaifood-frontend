let accessToken: string | null = localStorage.getItem("accessToken");

export function setAccessToken(token: string) {
    accessToken = token;
    localStorage.setItem("accessToken", token);
}

export function getAccessToken() {
    return accessToken ?? localStorage.getItem("accessToken");
}

export function clearAccessToken() {
    accessToken = null;
    localStorage.removeItem("accessToken");
}
