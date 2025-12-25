import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthErrorResponse } from '../types/auth';
import { verifyToken } from '../utils/auth';

// Middleware to verify JWT tokens from Authorization header
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            const errorResponse: AuthErrorResponse = {
                message: 'Access token is required',
                error: 'MISSING_TOKEN'
            };
            return res.status(401).json(errorResponse);
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            const errorResponse: AuthErrorResponse = {
                message: 'Invalid authorization header format. Expected: "Bearer <token>"',
                error: 'INVALID_HEADER_FORMAT'
            };
            return res.status(401).json(errorResponse);
        }

        const token = parts[1];

        if (!token) {
            const errorResponse: AuthErrorResponse = {
                message: 'Access token is required',
                error: 'MISSING_TOKEN'
            };
            return res.status(401).json(errorResponse);
        }

        try {
            const decoded = verifyToken(token);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                username: decoded.username,
                name: decoded.name
            };
            next();
        } catch (error) {
            let errorMessage = 'Invalid token';
            let errorCode = 'INVALID_TOKEN';

            if (error instanceof Error) {
                if (error.message === 'Token expired') {
                    errorMessage = 'Token expired';
                    errorCode = 'TOKEN_EXPIRED';
                } else if (error.message === 'Invalid token') {
                    errorMessage = 'Invalid token';
                    errorCode = 'INVALID_TOKEN';
                }
            }

            const errorResponse: AuthErrorResponse = {
                message: errorMessage,
                error: errorCode
            };
            return res.status(401).json(errorResponse);
        }
    } catch (error) {
        const errorResponse: AuthErrorResponse = {
            message: 'Authentication failed',
            error: 'AUTHENTICATION_ERROR'
        };
        return res.status(500).json(errorResponse);
    }
};

// Optional authentication middleware - doesn't fail if no token is provided
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return next();
        }

        const token = parts[1];

        if (!token) {
            return next();
        }

        try {
            const decoded = verifyToken(token);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                username: decoded.username,
                name: decoded.name
            };
        } catch (error) {
            // Silently ignore token errors for optional auth
        }

        next();
    } catch (error) {
        // Silently ignore errors for optional auth
        next();
    }
};