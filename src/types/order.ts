import { Item } from "@/types/item.ts";
import {User} from "@/types/user.ts";

export interface Order {
    id: number;
    client: User;
    clientId: number;
    createdBy: User;
    createdByUserId: number;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: number;
    order: Order;
    orderId: number;
    itemId: number;
    item: Item;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export enum PaymentMethod {
    CASH = "CASH",
    DEBIT = "DEBIT_CARD",
    CREDIT = "CREDIT_CARD",
    PIX = "PIX",
}

export const paymentMap: Record<string, string> = {
    CASH: "Dinheiro",
    DEBIT: "Débito",
    CREDIT: "Crédito",
    PIX: "PIX",
};

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    DELIVERED = "DELIVERED",
    CANCELED = "CANCELED",
}

export const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING: {label: "Pendente", variant: "outline"},
    CONFIRMED: {label: "Confirmado", variant: "secondary"},
    DELIVERED: {label: "Entregue", variant: "default"},
    CANCELED: {label: "Cancelado", variant: "destructive"},
};