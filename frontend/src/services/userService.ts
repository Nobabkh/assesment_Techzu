import { apiGet, apiPut } from './api';
import {
    UserProfile,
    UserUpdateRequest,
    UserListResponse,
    UserQueryParams,
    ApiResponse
} from '../types';

const USER_ENDPOINT = '/users';

export const userService = {
    // Get current user profile
    getCurrentUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
        return apiGet<UserProfile>(`${USER_ENDPOINT}/profile`);
    },

    // Update current user profile
    updateCurrentUserProfile: async (userData: UserUpdateRequest): Promise<ApiResponse<UserProfile>> => {
        return apiPut<UserProfile>(`${USER_ENDPOINT}/profile`, userData);
    },

    // Get user by ID
    getUserById: async (id: string): Promise<ApiResponse<UserProfile>> => {
        return apiGet<UserProfile>(`${USER_ENDPOINT}/${id}`);
    },

    // Get all users (for admin purposes)
    getUsers: async (params?: UserQueryParams): Promise<ApiResponse<UserListResponse>> => {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = queryParams.toString() ? `${USER_ENDPOINT}?${queryParams.toString()}` : USER_ENDPOINT;
        return apiGet<UserListResponse>(url);
    }
};

export default userService;