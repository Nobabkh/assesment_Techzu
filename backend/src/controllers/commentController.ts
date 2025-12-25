import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/auth';
import {
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentQueryParams,
    CommentResponse
} from '../types/comment';
import {
    createComment,
    getComments,
    getCommentById,
    updateComment,
    deleteComment,
    getRepliesToComment
} from '../services/commentService';
import { getPaginationFromQuery } from '../utils/pagination';
import { getSortingFromQuery, createCommentSortingConfig } from '../utils/sorting';
import { validateCommentQueryParams, createValidationErrorResponse } from '../utils/validation';
import { getWebSocketService } from '../services/websocketService';

/**
 * Creates a new comment
 * @param req - Express authenticated request containing comment data
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with created comment or error
 */
export const createCommentController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        const { content, parentId } = req.body as CreateCommentRequest;
        const authorId = req.user!.id;

        const comment = await createComment({ content, parentId }, authorId);

        const commentWithDetails = await getCommentById(comment.id);

        const webSocketService = getWebSocketService();
        if (commentWithDetails) {
            if (parentId) {
                webSocketService.emitReplyCreated(commentWithDetails, parentId);
            } else {
                webSocketService.emitCommentCreated(commentWithDetails);
            }
        }

        res.status(201).json({
            message: 'Comment created successfully',
            data: commentWithDetails || comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        const statusCode = error instanceof Error && error.message === 'Parent comment not found' ? 404 : 500;
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to create comment'
        });
    }
};

/**
 * Retrieves comments with pagination and sorting
 * @param req - Express request containing query parameters
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with paginated comments or error
 */
export const getCommentsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = validateCommentQueryParams(req.query);

        if (!validation.isValid) {
            res.status(400).json(createValidationErrorResponse(validation.errors || []));
            return;
        }

        const paginationParams = getPaginationFromQuery(req.query, {
            maxLimit: 100,
            defaultLimit: 10
        });

        const sortingParams = getSortingFromQuery(req.query, createCommentSortingConfig());

        const {
            authorId,
            parentId,
            dateFrom,
            dateTo,
            specialSort
        } = req.query;

        const params: CommentQueryParams = {
            page: paginationParams.page,
            limit: paginationParams.limit,
            sortBy: sortingParams.sortBy,
            sortOrder: sortingParams.sortOrder,
            authorId: authorId as string | undefined,
            parentId: parentId as string | undefined,
            dateFrom: dateFrom as string | undefined,
            dateTo: dateTo as string | undefined,
            specialSort: specialSort as 'mostLiked' | 'mostDisliked' | 'newest' | 'oldest' | undefined
        };

        const result = await getComments(params);

        res.status(200).json({
            message: 'Comments retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error getting comments:', error);

        if (error instanceof Error && (error.message.includes('Invalid pagination parameters') ||
            error.message.includes('Invalid sorting parameters'))) {
            res.status(400).json({
                message: error.message
            });
            return;
        }

        res.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to get comments'
        });
    }
};

/**
 * Retrieves a single comment by ID
 * @param req - Express request containing comment ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with comment or error
 */
export const getCommentByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const comment = await getCommentById(id);

        if (!comment) {
            res.status(404).json({
                message: 'Comment not found'
            });
            return;
        }

        res.status(200).json({
            message: 'Comment retrieved successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error getting comment:', error);
        res.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to get comment'
        });
    }
};

/**
 * Updates an existing comment
 * @param req - Express authenticated request containing comment ID and update data
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with updated comment or error
 */
export const updateCommentController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        const { id } = req.params;
        const { content } = req.body as UpdateCommentRequest;
        const authorId = req.user!.id;

        const comment = await updateComment(id, { content }, authorId);

        const commentWithDetails = await getCommentById(comment.id);

        const webSocketService = getWebSocketService();
        if (commentWithDetails) {
            webSocketService.emitCommentUpdated(commentWithDetails, commentWithDetails.parentId);
        }

        res.status(200).json({
            message: 'Comment updated successfully',
            data: commentWithDetails || comment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Comment not found') {
                statusCode = 404;
            } else if (error.message === 'Unauthorized to update this comment') {
                statusCode = 403;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to update comment'
        });
    }
};

/**
 * Deletes a comment
 * @param req - Express authenticated request containing comment ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response confirming deletion or error
 */
export const deleteCommentController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const authorId = req.user!.id;

        const commentToDelete = await getCommentById(id);
        if (!commentToDelete) {
            res.status(404).json({
                message: 'Comment not found'
            });
            return;
        }

        await deleteComment(id, authorId);

        const webSocketService = getWebSocketService();
        webSocketService.emitCommentDeleted(id, authorId, commentToDelete.parentId);

        res.status(200).json({
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Comment not found') {
                statusCode = 404;
            } else if (error.message === 'Unauthorized to delete this comment') {
                statusCode = 403;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to delete comment'
        });
    }
};

/**
 * Retrieves replies to a specific comment
 * @param req - Express request containing comment ID and query parameters
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with paginated replies or error
 */
export const getRepliesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const validation = validateCommentQueryParams(req.query);

        if (!validation.isValid) {
            res.status(400).json(createValidationErrorResponse(validation.errors || []));
            return;
        }

        const paginationParams = getPaginationFromQuery(req.query, {
            maxLimit: 100,
            defaultLimit: 10
        });

        const sortingParams = getSortingFromQuery(req.query, {
            ...createCommentSortingConfig(),
            defaultSortBy: ['createdAt'],
            defaultSortOrder: ['asc']
        });

        const params: CommentQueryParams = {
            page: paginationParams.page,
            limit: paginationParams.limit,
            sortBy: sortingParams.sortBy,
            sortOrder: sortingParams.sortOrder
        };

        const result = await getRepliesToComment(id, params);

        res.status(200).json({
            message: 'Replies retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error getting replies:', error);

        if (error instanceof Error && (error.message.includes('Invalid pagination parameters') ||
            error.message.includes('Invalid sorting parameters'))) {
            res.status(400).json({
                message: error.message
            });
            return;
        }

        const statusCode = error instanceof Error && error.message === 'Parent comment not found' ? 404 : 500;
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to get replies'
        });
    }
};