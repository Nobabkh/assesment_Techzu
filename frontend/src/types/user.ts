// User profile interface
export interface UserProfile {
    id: string;
    email: string;
    username: string;
    name?: string;
    createdAt: string; // Changed from Date to string for JSON serialization
    updatedAt: string; // Changed from Date to string for JSON serialization
}

// User update request interface
export interface UserUpdateRequest {
    name?: string;
    username?: string;
}

// User response interface
export interface UserResponse {
    id: string;
    email: string;
    username: string;
    name?: string;
    createdAt: string; // Changed from Date to string for JSON serialization
    updatedAt: string; // Changed from Date to string for JSON serialization
}

// User list response interface (for admin)
export interface UserListResponse {
    users: UserResponse[];
    total: number;
    page: number;
    limit: number;
}

// User error response interface
export interface UserErrorResponse {
    message: string;
    error?: string;
}

// User query parameters for pagination
export interface UserQueryParams {
    page?: number;
    limit?: number;
    search?: string;
}