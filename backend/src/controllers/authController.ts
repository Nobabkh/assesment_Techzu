import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { generateToken, hashPassword, comparePassword } from '../utils/auth';
import { AuthenticatedRequest, RegisterRequest, LoginRequest, AuthResponse, AuthErrorResponse } from '../types/auth';

// Validation middleware for registration
export const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Name must be less than 100 characters'),
];

// Validation middleware for login
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

// Register user controller with validation
export const register = async (req: Request, res: Response) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorResponse: AuthErrorResponse = {
                message: 'Validation failed',
                error: 'VALIDATION_ERROR'
            };
            return res.status(400).json({
                ...errorResponse,
                errors: errors.array()
            });
        }

        const { email, username, password, name }: RegisterRequest = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            const errorResponse: AuthErrorResponse = {
                message: existingUser.email === email ? 'Email is already registered' : 'Username is already taken',
                error: 'USER_EXISTS'
            };
            return res.status(409).json(errorResponse);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                name: name || null
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                createdAt: true
            }
        });

        // Generate JWT token
        const token = generateToken({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            name: newUser.name || undefined
        });

        // Prepare response
        const response: AuthResponse = {
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                name: newUser.name || undefined
            },
            token
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Registration error:', error);
        const errorResponse: AuthErrorResponse = {
            message: 'Registration failed',
            error: 'REGISTRATION_ERROR'
        };
        res.status(500).json(errorResponse);
    }
};

// Login user controller with validation
export const login = async (req: Request, res: Response) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorResponse: AuthErrorResponse = {
                message: 'Validation failed',
                error: 'VALIDATION_ERROR'
            };
            return res.status(400).json({
                ...errorResponse,
                errors: errors.array()
            });
        }

        const { email, password }: LoginRequest = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            const errorResponse: AuthErrorResponse = {
                message: 'Invalid email or password',
                error: 'INVALID_CREDENTIALS'
            };
            return res.status(401).json(errorResponse);
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            const errorResponse: AuthErrorResponse = {
                message: 'Invalid email or password',
                error: 'INVALID_CREDENTIALS'
            };
            return res.status(401).json(errorResponse);
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name || undefined
        });

        // Prepare response
        const response: AuthResponse = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name || undefined
            },
            token
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Login error:', error);
        const errorResponse: AuthErrorResponse = {
            message: 'Login failed',
            error: 'LOGIN_ERROR'
        };
        res.status(500).json(errorResponse);
    }
};

// Get current user controller
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            const errorResponse: AuthErrorResponse = {
                message: 'User not authenticated',
                error: 'NOT_AUTHENTICATED'
            };
            return res.status(401).json(errorResponse);
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            const errorResponse: AuthErrorResponse = {
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            };
            return res.status(404).json(errorResponse);
        }

        // Convert null to undefined for name field to match UserPayload interface
        const userResponse = {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // Wrap in { message, data } for consistent API response format
        res.status(200).json({
            message: 'User retrieved successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Get current user error:', error);
        const errorResponse: AuthErrorResponse = {
            message: 'Failed to get user information',
            error: 'GET_USER_ERROR'
        };
        res.status(500).json(errorResponse);
    }
};

// Logout user controller (optional)
export const logout = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // In a stateless JWT implementation, logout is typically handled on the client side
        // by simply removing the token from storage
        // Here we'll just return a success message
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        const errorResponse: AuthErrorResponse = {
            message: 'Logout failed',
            error: 'LOGOUT_ERROR'
        };
        res.status(500).json(errorResponse);
    }
};