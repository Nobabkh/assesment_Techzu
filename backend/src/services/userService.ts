import prisma from '../config/database';
import { UserProfile, UserUpdateRequest, UserResponse, UserListResponse, UserQueryParams } from '../types/user';

/**
 * Retrieves a user profile by their unique identifier.
 *
 * @param userId - The unique identifier of the user
 * @returns Promise<UserProfile | null> - The user profile or null if not found
 * @throws Error if user retrieval fails
 */
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
            return null;
        }

        return {
            ...user,
            name: user.name ?? undefined
        };
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw new Error('Failed to fetch user');
    }
};

/**
 * Updates a user's profile information.
 *
 * @param userId - The unique identifier of the user to update
 * @param updateData - The data to update (username, email, name)
 * @returns Promise<UserProfile> - The updated user profile
 * @throws Error if username is already taken or if update fails
 */
export const updateUserProfile = async (userId: string, updateData: UserUpdateRequest): Promise<UserProfile> => {
    try {
        if (updateData.username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: updateData.username,
                    id: { not: userId }
                }
            });

            if (existingUser) {
                throw new Error('Username is already taken');
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return {
            ...updatedUser,
            name: updatedUser.name ?? undefined
        };
    } catch (error) {
        console.error('Error updating user profile:', error);
        if (error instanceof Error && error.message === 'Username is already taken') {
            throw error;
        }
        throw new Error('Failed to update user profile');
    }
};

/**
 * Deletes a user account from the database.
 *
 * @param userId - The unique identifier of the user to delete
 * @returns Promise<boolean> - True if deletion was successful
 * @throws Error if deletion fails
 */
export const deleteUserAccount = async (userId: string): Promise<boolean> => {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });

        return true;
    } catch (error) {
        console.error('Error deleting user account:', error);
        throw new Error('Failed to delete user account');
    }
};

/**
 * Retrieves a paginated list of users with optional search functionality.
 *
 * @param queryParams - Query parameters including pagination and search term
 * @returns Promise<UserListResponse> - Paginated list of users with metadata
 * @throws Error if user retrieval fails
 */
export const getAllUsers = async (queryParams: UserQueryParams = {}): Promise<UserListResponse> => {
    try {
        const page = queryParams.page || 1;
        const limit = queryParams.limit || 10;
        const skip = (page - 1) * limit;
        const search = queryParams.search || '';

        const where = search
            ? {
                OR: [
                    { username: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { name: { contains: search, mode: 'insensitive' as const } }
                ]
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);

        const usersWithUndefinedName = users.map(user => ({
            ...user,
            name: user.name ?? undefined
        }));

        return {
            users: usersWithUndefinedName,
            total,
            page,
            limit
        };
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw new Error('Failed to fetch users');
    }
};