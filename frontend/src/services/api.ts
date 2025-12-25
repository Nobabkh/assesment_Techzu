import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiErrorResponse, HttpStatus } from '../types';

// Get API base URL from environment variables
// Use relative path for Vite proxy to work
const API_BASE_URL = '/api';

// Create Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common responses and errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle common error scenarios
        if (error.response?.status === HttpStatus.UNAUTHORIZED) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Generic API request function
export const apiRequest = async <T = any>(
    method: string,
    url: string,
    data?: any,
    config?: any
): Promise<ApiResponse<T>> => {
    try {
        const response = await apiClient.request<{ message?: string; data?: T }>({
            method,
            url,
            data,
            ...config,
        });
        // Backend wraps response in { message, data }, extract the inner data
        return {
            success: true,
            data: response.data?.data !== undefined ? response.data.data : response.data as T,
        };
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        // Extract error message from response or use a default message
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An unknown error occurred';

        return {
            success: false,
            message: errorMessage,
            error: axiosError.response?.data?.error || 'API_ERROR',
        };
    }
};

// HTTP method helpers
export const apiGet = <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>('GET', url, undefined, config);
};

export const apiPost = <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>('POST', url, data, config);
};

export const apiPut = <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>('PUT', url, data, config);
};

export const apiPatch = <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>('PATCH', url, data, config);
};

export const apiDelete = <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>('DELETE', url, undefined, config);
};

// Export the Axios instance for custom requests
export default apiClient;