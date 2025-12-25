import { Request } from 'express';

// User payload for JWT token
export interface UserPayload {
    id: string;
    email: string;
    username: string;
    name?: string;
}

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
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