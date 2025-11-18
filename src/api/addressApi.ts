import {api} from "@/api/api.ts";
import {transformApiError} from "@/api/apiErrorValidation.ts";
import {Address} from "@/types/address.ts";

export async function createAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    try {
        const response = await api.post("/addresses", address);
        return response.data.address;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function updateAddress(address: Partial<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Address> {
    try {
        const response = await api.patch(`/addresses`, address);
        return response.data.address;
    } catch (error) {
        throw transformApiError(error);
    }
}

export async function deleteAddress(id: number): Promise<void> {
    try {
        await api.delete(`/addresses/${id}`);
    } catch (error) {
        throw transformApiError(error);
    }
}