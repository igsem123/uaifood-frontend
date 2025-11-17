import {Address} from "@/types/address.ts";

export interface User {
    id: string;
    name: string;
    email: string;
    adressess?: Address[];
    phone: string;
    type: UserType;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserType {
    ADMIN = 'ADMIN',
    CLIENT = 'CLIENT',
}