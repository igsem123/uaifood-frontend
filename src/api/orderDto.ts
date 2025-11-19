import { PaymentMethod } from "@/types/order";

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
    confirmedByUserId?: number;
    status?: string;
};
