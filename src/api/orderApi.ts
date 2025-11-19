import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {Order} from "@/types/order.ts";
import {CreateOrderDTO, UpdateOrderDTO} from "@/api/dtos/orderDto.ts";

export async function fetchOrders(page?: number, pageSize?: number) {
    try {
        const response = await api.get("/api/orders", {
            params: {
                page,
                pageSize
            }
        });
        return response.data;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchOrderById(id: number) {
    try {
        const response = await api.get(`/api/orders/${id}`);
        return response.data.order as Order;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function fetchOrderByClientId(clientId: number, page?: number, pageSize?: number) {
    try {
        const response = await api.get(`/api/orders/client/${clientId}`, {
            params: {
                page,
                pageSize
            }
        });

        return response.data;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function createOrder(orderData: CreateOrderDTO) {
    try {
        const response = await api.post("/api/orders", orderData);
        return response.data.order as Order;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateOrder(id: number, data: UpdateOrderDTO) {
    try {
        const response = await api.patch(`/api/orders/${id}`, data);
        return response.data.order as Order;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function deleteOrder(id: number) {
    try {
        await api.delete(`/api/orders/${id}`);
    } catch (error) {
        throw transformApiError(error);
    }
}