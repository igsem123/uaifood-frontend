import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {Order} from "@/types/order.ts";

export async function fetchAllOrders(page?: number, pageSize?: number) {
    try {
        const response = await api.get("/orders", {
            params: {
                page,
                pageSize
            }
        });
        return response.data.orders as Order[];
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchOrderById(id: number) {
    try {
        const response = await api.get(`/orders/${id}`);
        return response.data.order as Order;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchOrderByClientId(clientId: number, page?: number, pageSize?: number) {
    try {
        const response = await api.get(`/orders/client/${clientId}`, {
            params: {
                page,
                pageSize
            }
        });
        return response.data.orders as Order[];
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'client' | 'createdBy' | 'items'> & { items: { itemId: number; quantity: number; }[] }) {
    try {
        const response = await api.post("/orders", orderData);
        return response.data.order as Order;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateOrder(id: number, orderData: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'client' | 'createdBy' | 'items'>> & { items?: { itemId: number; quantity: number; }[] }) {
    try {
        const response = await api.patch(`/orders/${id}`, orderData);
        return response.data.order as Order;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function deleteOrder(id: number) {
    try {
        await api.delete(`/orders/${id}`);
    } catch (error) {
        throw transformApiError(error);
    }
}