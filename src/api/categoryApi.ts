import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {Category} from "@/types/category.ts";

export async function fetchCategories(): Promise<Category[]> {
    try {
        const response = await api.get("/categories");
        return response.data.categories;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
        const response = await api.post("/categories", category);
        return response.data.category;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateCategory(id: number, category: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> {
    try {
        const response = await api.patch(`/categories/${id}`, category);
        return response.data.category;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function deleteCategory(id: number): Promise<void> {
    try {
        await api.delete(`/categories/${id}`);
    } catch (error) {
        throw transformApiError(error);
    }
}