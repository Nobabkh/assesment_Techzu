// User payload for JWT token
export interface UserPayload {
    id: string;
    email: string;
    username: string;
    name?: string;
}

// JWT token payload
export interface JWTPayload {
    id: string;
    email: string;
    username: string;
    name?: string;
    iat?: number;
    exp?: number;
}

// Registration request
export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    name?: string;
}

// Login request
export interface LoginRequest {
    email: string;
    password: string;
}

// Authentication response
export interface AuthResponse {
    user: UserPayload;
    token: string;
}

// Authentication error response
export interface AuthErrorResponse {
    message: string;
    error?: string;
}

// Authentication state in the app
export interface AuthState {
    isAuthenticated: boolean;
    user: UserPayload | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}