import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {Item} from "@/types/item.ts";

export async function fetchItems(): Promise<Item[]> {
    try {
        const response = await api.get("/api/items");
        return response.data.items;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    try {
        const response = await api.post("/api/items", item);
        return response.data.item;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateItem(id: number, item: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Item> {
    try {
        const response = await api.patch(`/api/items/${id}`, item);
        return response.data.item;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function deleteItem(id: number): Promise<void> {
    try {
        await api.delete(`/api/items/${id}`);
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchItemById(id: number): Promise<Item> {
    try {
        const response = await api.get(`/api/items/${id}`);
        return response.data.item;
    } catch (error) {
        throw transformApiError(error);
    }
}