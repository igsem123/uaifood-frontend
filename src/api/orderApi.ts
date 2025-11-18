import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {Order, PaymentMethod} from "@/types/order.ts";
import {CreateOrderDTO, UpdateOrderDTO} from "@/api/orderDto.ts";

export async function fetchAllOrders(page?: number, pageSize?: number) {
    try {
        const response = await api.get("/orders", {
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

        return response.data;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function createOrder(orderData: CreateOrderDTO) {
    try {
        const response = await api.post("/orders", orderData);
        return response.data.order as Order;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateOrder(id: number, data: UpdateOrderDTO) {
    try {
        const response = await api.patch(`/orders/${id}`, data);
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