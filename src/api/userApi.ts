import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {User} from "@/types/user.ts";

export async function fetchUsers(page?: number, pageSize?: number): Promise<User[]> {
    try {
        const response = await api.get("/api/users", {
            params: {
                page,
                pageSize
            }
        });
        return response.data.users;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchUserById(id: number): Promise<User> {
    try {
        const response = await api.get(`/api/users/${id}`);
        return response.data.user;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchUserWithRelationsById(id: number, relations: string[]): Promise<User> {
    try {
        const response = await api.get(`/api/users/${id}/relations`, {
            params: {
                include: relations.join(',')
            }
        });
        return response.data.user;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
        const response = await api.post("/api/users", user);
        return response.data.user;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateUser(user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    try {
        const response = await api.patch(`/api/users`, user);
        return response.data.user;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function deleteUser(): Promise<void> {
    try {
        await api.delete(`/api/users`);
    } catch (error) {
        throw transformApiError(error);
    }
}