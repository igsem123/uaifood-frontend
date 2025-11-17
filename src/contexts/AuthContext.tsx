import { createContext, useState } from "react";
import {
    loginRequest,
    logoutRequest,
    signupRequest,
} from "@/api/authApi";
import { setAccessToken, clearAccessToken } from "@/auth/tokenStore";
import { User } from "@/types/user";
import * as React from "react";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (email: string, password: string, name: string, phone: string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function login(email: string, password: string) {
        setIsLoading(true);
        try {
            const data = await loginRequest(email, password);
            setAccessToken(data.accessToken); // tokenStore
            setUser(data.user ?? null);
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        try {
            await logoutRequest();
        } finally {
            clearAccessToken();
            setUser(null);
        }
    }

    async function signup(email: string, password: string, name: string, phone: string) {
        setIsLoading(true);
        try {
            await signupRequest(email, password, name, phone);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                signup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}