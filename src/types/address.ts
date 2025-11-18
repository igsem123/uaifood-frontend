export interface Address {
    id: number;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    userId: bigint;
    createdAt: Date;
    updatedAt: Date;
}