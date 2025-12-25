import { apiPost, apiGet } from './api';
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserPayload,
    ApiResponse
} from '../types';

const AUTH_ENDPOINT = '/auth';

export const authService = {
    // Register a new user
    register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
        return apiPost<AuthResponse>(`${AUTH_ENDPOINT}/register`, userData);
    },

    // Login user
    login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        return apiPost<AuthResponse>(`${AUTH_ENDPOINT}/login`, credentials);
    },

    // Logout user (client-side only)
    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user profile
    getCurrentUser: async (): Promise<ApiResponse<UserPayload>> => {
        return apiGet<UserPayload>(`${AUTH_ENDPOINT}/me`);
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        // Basic token validation (you might want to add more sophisticated validation)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            // Check if token is expired
            if (payload.exp < currentTime) {
                authService.logout();
                return false;
            }

            return true;
        } catch (error) {
            authService.logout();
            return false;
        }
    },

    // Get stored user data
    getStoredUser: (): UserPayload | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get stored token
    getStoredToken: (): string | null => {
        return localStorage.getItem('token');
    },

    // Store authentication data
    storeAuthData: (token: string, user: UserPayload): void => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Refresh token (if your backend supports it)
    refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
        return apiPost<{ token: string }>(`${AUTH_ENDPOINT}/refresh`);
    }
};

export default authService;