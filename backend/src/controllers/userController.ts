import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { UserUpdateRequest, UserResponse, UserErrorResponse } from '../types/user';
import { getUserById, updateUserProfile, deleteUserAccount, getAllUsers } from '../services/userService';
import { body, validationResult, query } from 'express-validator';

/**
 * Get current user profile
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            const errorResponse: UserErrorResponse = {
                message: 'Authentication required',
                error: 'AUTHENTICATION_REQUIRED'
            };
            return res.status(401).json(errorResponse);
        }

        const user = await getUserById(req.user.id);

        if (!user) {
            const errorResponse: UserErrorResponse = {
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            };
            return res.status(404).json(errorResponse);
        }

        res.status(200).json({
            message: 'User profile retrieved successfully',
            data: user
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        const errorResponse: UserErrorResponse = {
            message: 'Failed to fetch user profile',
            error: 'FETCH_PROFILE_FAILED'
        };
        res.status(500).json(errorResponse);
    }
};

/**
 * Update current user profile
 */
export const updateUserProfileController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorResponse: UserErrorResponse = {
                message: 'Validation failed',
                error: 'VALIDATION_ERROR'
            };
            return res.status(400).json({
                ...errorResponse,
                errors: errors.array()
            });
        }

        if (!req.user) {
            const errorResponse: UserErrorResponse = {
                message: 'Authentication required',
                error: 'AUTHENTICATION_REQUIRED'
            };
            return res.status(401).json(errorResponse);
        }

        const { name, username }: UserUpdateRequest = req.body;

        try {
            const updatedUser = await updateUserProfile(req.user.id, { name, username });
            res.status(200).json({
                message: 'User profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Username is already taken') {
                const errorResponse: UserErrorResponse = {
                    message: error.message,
                    error: 'USERNAME_TAKEN'
                };
                return res.status(409).json(errorResponse);
            }
            throw error;
        }
    } catch (error) {
        console.error('Error in updateUserProfileController:', error);
        const errorResponse: UserErrorResponse = {
            message: 'Failed to update user profile',
            error: 'UPDATE_PROFILE_FAILED'
        };
        res.status(500).json(errorResponse);
    }
};

/**
 * Delete current user account
 */
export const deleteUserAccountController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            const errorResponse: UserErrorResponse = {
                message: 'Authentication required',
                error: 'AUTHENTICATION_REQUIRED'
            };
            return res.status(401).json(errorResponse);
        }

        try {
            await deleteUserAccount(req.user.id);
            res.status(200).json({ message: 'User account deleted successfully' });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
                const errorResponse: UserErrorResponse = {
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                };
                return res.status(404).json(errorResponse);
            }
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteUserAccountController:', error);
        const errorResponse: UserErrorResponse = {
            message: 'Failed to delete user account',
            error: 'DELETE_ACCOUNT_FAILED'
        };
        res.status(500).json(errorResponse);
    }
};

/**
 * Get all users (admin only)
 */
export const getAllUsersController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorResponse: UserErrorResponse = {
                message: 'Validation failed',
                error: 'VALIDATION_ERROR'
            };
            return res.status(400).json({
                ...errorResponse,
                errors: errors.array()
            });
        }

        if (!req.user) {
            const errorResponse: UserErrorResponse = {
                message: 'Authentication required',
                error: 'AUTHENTICATION_REQUIRED'
            };
            return res.status(401).json(errorResponse);
        }

        // In a real application, you would check if the user has admin privileges
        // For now, we'll assume all authenticated users can access this endpoint
        // In a production app, you would add an admin role check here

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';

        const userList = await getAllUsers({ page, limit, search });
        res.status(200).json({
            message: 'Users retrieved successfully',
            data: userList
        });
    } catch (error) {
        console.error('Error in getAllUsersController:', error);
        const errorResponse: UserErrorResponse = {
            message: 'Failed to fetch users',
            error: 'FETCH_USERS_FAILED'
        };
        res.status(500).json(errorResponse);
    }
};

// Validation middleware for user profile update
export const validateUserProfileUpdate = [
    body('name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .trim(),
    body('username')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .trim()
];

// Validation middleware for user query parameters
export const validateUserQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('search')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Search term must be less than 100 characters')
        .trim()
];