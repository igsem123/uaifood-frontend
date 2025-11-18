import {Address} from "@/types/address.ts";

export interface User {
    id: string;
    name: string;
    email: string;
    addresses?: Address[];
    phone: string;
    type: UserType;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserType {
    ADMIN = 'ADMIN',
    CLIENT = 'CLIENT',
}