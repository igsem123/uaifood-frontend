import { PaymentMethod } from "@/types/order.ts";

export type CreateOrderDTO = {
    clientId: number;
    addressId: number;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    items: {
        itemId: number;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }[];
};

export type UpdateOrderDTO = {
    clientId?: number;
    confirmedByUserId?: number;
    status?: string;
};
