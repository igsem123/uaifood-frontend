export interface ZodIssue {
    code: string;
    path: (string | number)[];
    message: string;
}

export interface ZodErrorResponse {
    errors: ZodIssue[];
}

export interface GenericErrorResponse {
    error: string;
}

export type ApiErrorResponse = ZodErrorResponse | GenericErrorResponse;
