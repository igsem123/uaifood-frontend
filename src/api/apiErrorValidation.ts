import {FrontendError} from "@/types/frontendError.ts";

export interface ApiErrorResponse {
    response?: {
        data?: {
            errors?: { message: string }[];
            message?: string;
        };
    };
}

export function transformApiError(err: ApiErrorResponse): FrontendError {
    const errors = err.response?.data?.errors;
    if (errors && Array.isArray(errors) && errors.length > 0) {
        const messages = errors.map((e) => e.message);
        return {
            type: "validation",
            messages
        };
    }

    const message = err.response?.data?.message || "Um erro inesperado ocorreu.";
    return {
        type: "api",
        message
    };
}
