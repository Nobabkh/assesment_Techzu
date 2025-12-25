// Generic API response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Generic API error response
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
    details?: any;
}

// HTTP status codes
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
}

// API request configuration
export interface ApiRequestConfig {
    timeout?: number;
    headers?: Record<string, string>;
    params?: Record<string, any>;
}

// API error details
export interface ApiError {
    message: string;
    status?: HttpStatus;
    code?: string;
    details?: any;
}

// Request methods
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API endpoint configuration
export interface ApiEndpoint {
    url: string;
    method: RequestMethod;
    requiresAuth?: boolean;
}