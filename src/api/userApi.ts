import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {User} from "@/types/user.ts";

export async function fetchUsers(page?: number, pageSize?: number): Promise<User[]> {
    try {
        const response = await api.get("/users", {
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
        const response = await api.get(`/users/${id}`);
        return response.data.user;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchUserWithRelationsById(id: number, relations: string[]): Promise<User> {
    try {
        const response = await api.get(`/users/${id}/relations`, {
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
        const response = await api.post("/users", user);
        return response.data.user;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateUser(id: number, user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    try {
        const response = await api.patch(`/users/${id}`, user);
        return response.data.user;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function deleteUser(id: number): Promise<void> {
    try {
        await api.delete(`/users/${id}`);
    } catch (error) {
        throw transformApiError(error);
    }
}