import prisma from '../config/database';
import {
    Comment,
    CommentWithAuthor,
    CommentWithDetails,
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentQueryParams,
    CommentListResponse
} from '../types/comment';
import {
    validatePaginationParams,
    calculatePaginationMetadata,
    buildPrismaPaginationQuery,
    getPaginationFromQuery
} from '../utils/pagination';
import {
    validateSortingParams,
    buildPrismaSortingQuery,
    createCommentSortingConfig,
    handleSpecialSorting
} from '../utils/sorting';

/**
 * Creates a new comment in the database.
 *
 * @param data - The comment data including content and optional parent ID
 * @param authorId - The ID of the user creating the comment
 * @returns Promise<CommentWithAuthor> - The created comment with author information
 * @throws Error if parent comment is not found or if comment creation fails
 */
export const createComment = async (data: CreateCommentRequest, authorId: string): Promise<CommentWithAuthor> => {
    try {
        if (data.parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: data.parentId }
            });

            if (!parentComment) {
                throw new Error('Parent comment not found');
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content: data.content,
                authorId,
                parentId: data.parentId || null
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        });

        return {
            ...comment,
            author: {
                ...comment.author,
                name: comment.author.name ?? undefined
            }
        } as CommentWithAuthor;
    } catch (error) {
        throw new Error(`Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves a paginated list of comments with optional filtering and sorting.
 *
 * @param params - Query parameters including pagination, sorting, and filters
 * @returns Promise<CommentListResponse> - Paginated list of comments with metadata
 * @throws Error if pagination or sorting parameters are invalid
 */
export const getComments = async (params: CommentQueryParams): Promise<CommentListResponse> => {
    try {
        const paginationValidation = validatePaginationParams(
            { page: params.page, limit: params.limit },
            { maxLimit: 100, defaultLimit: 10 }
        );

        if (!paginationValidation.isValid || !paginationValidation.params) {
            throw new Error(`Invalid pagination parameters: ${paginationValidation.errors?.join(', ')}`);
        }

        const paginationParams = paginationValidation.params;

        let sortingParams;
        if (params.specialSort) {
            sortingParams = handleSpecialSorting(params.specialSort);
        } else {
            const sortingValidation = validateSortingParams(
                { sortBy: params.sortBy, sortOrder: params.sortOrder },
                createCommentSortingConfig()
            );

            if (!sortingValidation.isValid || !sortingValidation.params) {
                throw new Error(`Invalid sorting parameters: ${sortingValidation.errors?.join(', ')}`);
            }

            sortingParams = sortingValidation.params;
        }

        const where: any = {};

        if (params.authorId) {
            where.authorId = params.authorId;
        }

        if (params.parentId !== undefined) {
            where.parentId = params.parentId;
        }

        if (params.dateFrom || params.dateTo) {
            where.createdAt = {};
            if (params.dateFrom) {
                where.createdAt.gte = new Date(params.dateFrom);
            }
            if (params.dateTo) {
                where.createdAt.lte = new Date(params.dateTo);
            }
        }

        const total = await prisma.comment.count({ where });

        const paginationQuery = buildPrismaPaginationQuery(paginationParams);
        const sortingQuery = buildPrismaSortingQuery(sortingParams);

        const comments = await prisma.comment.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        replies: true,
                        likes: true
                    }
                }
            },
            orderBy: sortingQuery,
            ...paginationQuery
        });

        const commentsWithCounts = await Promise.all(
            comments.map(async (comment: any) => {
                const likesCount = await prisma.like.count({
                    where: {
                        commentId: comment.id,
                        type: 'like'
                    }
                });

                const dislikesCount = await prisma.like.count({
                    where: {
                        commentId: comment.id,
                        type: 'dislike'
                    }
                });

                return {
                    ...comment,
                    likesCount,
                    dislikesCount
                } as CommentWithDetails;
            })
        );

        const paginationMetadata = calculatePaginationMetadata(
            paginationParams.page,
            paginationParams.limit,
            total
        );

        return {
            comments: commentsWithCounts,
            pagination: paginationMetadata
        };
    } catch (error) {
        throw new Error(`Failed to get comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves a single comment by its ID with detailed information.
 *
 * @param id - The unique identifier of the comment
 * @returns Promise<CommentWithDetails | null> - The comment with details or null if not found
 * @throws Error if comment retrieval fails
 */
export const getCommentById = async (id: string): Promise<CommentWithDetails | null> => {
    try {
        const comment = await prisma.comment.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        replies: true,
                        likes: true
                    }
                }
            }
        });

        if (!comment) {
            return null;
        }

        return {
            ...comment,
            author: {
                ...comment.author,
                name: comment.author.name ?? undefined
            }
        } as CommentWithDetails;
    } catch (error) {
        throw new Error(`Failed to get comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Updates an existing comment's content.
 *
 * @param id - The unique identifier of the comment to update
 * @param data - The updated comment data
 * @param authorId - The ID of the user attempting to update the comment
 * @returns Promise<CommentWithAuthor> - The updated comment with author information
 * @throws Error if comment is not found, user is unauthorized, or update fails
 */
export const updateComment = async (id: string, data: UpdateCommentRequest, authorId: string): Promise<CommentWithAuthor> => {
    try {
        const existingComment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!existingComment) {
            throw new Error('Comment not found');
        }

        if (existingComment.authorId !== authorId) {
            throw new Error('Unauthorized to update this comment');
        }

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: {
                content: data.content
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        });

        return {
            ...updatedComment,
            author: {
                ...updatedComment.author,
                name: updatedComment.author.name ?? undefined
            }
        } as CommentWithAuthor;
    } catch (error) {
        throw new Error(`Failed to update comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Deletes a comment from the database.
 *
 * @param id - The unique identifier of the comment to delete
 * @param authorId - The ID of the user attempting to delete the comment
 * @returns Promise<void>
 * @throws Error if comment is not found, user is unauthorized, or deletion fails
 */
export const deleteComment = async (id: string, authorId: string): Promise<void> => {
    try {
        const existingComment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!existingComment) {
            throw new Error('Comment not found');
        }

        if (existingComment.authorId !== authorId) {
            throw new Error('Unauthorized to delete this comment');
        }

        await prisma.comment.delete({
            where: { id }
        });
    } catch (error) {
        throw new Error(`Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves a paginated list of replies to a specific comment.
 *
 * @param parentId - The unique identifier of the parent comment
 * @param params - Query parameters including pagination and sorting
 * @returns Promise<CommentListResponse> - Paginated list of replies with metadata
 * @throws Error if parent comment is not found or if retrieval fails
 */
export const getRepliesToComment = async (parentId: string, params: CommentQueryParams): Promise<CommentListResponse> => {
    try {
        const paginationValidation = validatePaginationParams(
            { page: params.page, limit: params.limit },
            { maxLimit: 100, defaultLimit: 10 }
        );

        if (!paginationValidation.isValid || !paginationValidation.params) {
            throw new Error(`Invalid pagination parameters: ${paginationValidation.errors?.join(', ')}`);
        }

        const paginationParams = paginationValidation.params;

        const sortingValidation = validateSortingParams(
            { sortBy: params.sortBy, sortOrder: params.sortOrder },
            {
                ...createCommentSortingConfig(),
                defaultSortBy: ['createdAt'],
                defaultSortOrder: ['asc']
            }
        );

        if (!sortingValidation.isValid || !sortingValidation.params) {
            throw new Error(`Invalid sorting parameters: ${sortingValidation.errors?.join(', ')}`);
        }

        const sortingParams = sortingValidation.params;

        const parentComment = await prisma.comment.findUnique({
            where: { id: parentId }
        });

        if (!parentComment) {
            throw new Error('Parent comment not found');
        }

        const total = await prisma.comment.count({
            where: { parentId }
        });

        const paginationQuery = buildPrismaPaginationQuery(paginationParams);
        const sortingQuery = buildPrismaSortingQuery(sortingParams);

        const replies = await prisma.comment.findMany({
            where: { parentId },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        replies: true,
                        likes: true
                    }
                }
            },
            orderBy: sortingQuery,
            ...paginationQuery
        });

        const repliesWithCounts = await Promise.all(
            replies.map(async (reply: any) => {
                const likesCount = await prisma.like.count({
                    where: {
                        commentId: reply.id,
                        type: 'like'
                    }
                });

                const dislikesCount = await prisma.like.count({
                    where: {
                        commentId: reply.id,
                        type: 'dislike'
                    }
                });

                return {
                    ...reply,
                    likesCount,
                    dislikesCount
                } as CommentWithDetails;
            })
        );

        const paginationMetadata = calculatePaginationMetadata(
            paginationParams.page,
            paginationParams.limit,
            total
        );

        return {
            comments: repliesWithCounts,
            pagination: paginationMetadata
        };
    } catch (error) {
        throw new Error(`Failed to get replies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};