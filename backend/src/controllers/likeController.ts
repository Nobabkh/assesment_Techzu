import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/auth';
import {
    LikeResponse,
    LikeStatusResponse,
    LikeErrorResponse,
    LikeCounts,
    LikeWithCounts
} from '../types/like';
import {
    likeComment,
    likeReply,
    removeLikeFromComment,
    removeLikeFromReply,
    getCommentLikeCountsWithUserStatus,
    getReplyLikeCountsWithUserStatus
} from '../services/likeService';
import { getWebSocketService } from '../services/websocketService';
import { getCommentById } from '../services/commentService';

/**
 * Likes a comment
 * @param req - Express authenticated request containing comment ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with like data or error
 */
export const likeCommentController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            } as LikeErrorResponse);
            return;
        }

        const { commentId } = req.params;
        const userId = req.user!.id;

        console.log('[likeController] likeCommentController - commentId:', commentId, 'userId:', userId, 'action: like');

        const result = await likeComment(commentId, userId, 'like');
        const counts = await getCommentLikeCountsWithUserStatus(commentId, userId);

        console.log('[likeController] Counts retrieved:', JSON.stringify(counts, null, 2));
        console.log('[likeController] userLikeStatus in counts:', counts.userLikeStatus);

        const comment = await getCommentById(commentId);
        if (comment) {
            const webSocketService = getWebSocketService();
            const broadcastCounts: LikeCounts = {
                likesCount: counts.likesCount,
                dislikesCount: counts.dislikesCount
            };
            console.log('[likeController] Emitting comment:liked event for commentId:', commentId, 'to room:', `comment:${commentId}`, 'with counts:', broadcastCounts);
            webSocketService.emitCommentLiked(commentId, userId, broadcastCounts, comment.authorId);
        } else {
            console.log('[likeController] Comment not found for WebSocket emission:', commentId);
        }

        const response: LikeResponse = {
            message: 'Comment liked successfully',
            data: {
                like: result.like,
                counts
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error liking comment:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Comment not found') {
                statusCode = 404;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to like comment'
        } as LikeErrorResponse);
    }
};

/**
 * Dislikes a comment
 * @param req - Express authenticated request containing comment ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with dislike data or error
 */
export const dislikeCommentController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            } as LikeErrorResponse);
            return;
        }

        const { commentId } = req.params;
        const userId = req.user!.id;

        console.log('[likeController] dislikeCommentController - commentId:', commentId, 'userId:', userId, 'action: dislike');

        const result = await likeComment(commentId, userId, 'dislike');
        const counts = await getCommentLikeCountsWithUserStatus(commentId, userId);

        console.log('[likeController] Counts retrieved:', JSON.stringify(counts, null, 2));
        console.log('[likeController] userLikeStatus in counts:', counts.userLikeStatus);

        const comment = await getCommentById(commentId);
        if (comment) {
            const webSocketService = getWebSocketService();
            const broadcastCounts: LikeCounts = {
                likesCount: counts.likesCount,
                dislikesCount: counts.dislikesCount
            };
            console.log('[likeController] Emitting comment:disliked event for commentId:', commentId, 'to room:', `comment:${commentId}`, 'with counts:', broadcastCounts);
            webSocketService.emitCommentDisliked(commentId, userId, broadcastCounts, comment.authorId);
        } else {
            console.log('[likeController] Comment not found for WebSocket emission:', commentId);
        }

        const response: LikeResponse = {
            message: 'Comment disliked successfully',
            data: {
                like: result.like,
                counts
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error disliking comment:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Comment not found') {
                statusCode = 404;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to dislike comment'
        } as LikeErrorResponse);
    }
};

/**
 * Removes a like or dislike from a comment
 * @param req - Express authenticated request containing comment ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with updated counts or error
 */
export const removeLikeFromCommentController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            } as LikeErrorResponse);
            return;
        }

        const { commentId } = req.params;
        const userId = req.user!.id;

        console.log('[likeController] removeLikeFromCommentController - commentId:', commentId, 'userId:', userId, 'action: remove');

        await removeLikeFromComment(commentId, userId);
        const counts = await getCommentLikeCountsWithUserStatus(commentId, userId);

        console.log('[likeController] Counts retrieved:', JSON.stringify(counts, null, 2));
        console.log('[likeController] userLikeStatus in counts:', counts.userLikeStatus);

        const comment = await getCommentById(commentId);
        if (comment) {
            const webSocketService = getWebSocketService();
            const broadcastCounts: LikeCounts = {
                likesCount: counts.likesCount,
                dislikesCount: counts.dislikesCount
            };
            console.log('[likeController] Emitting comment:like_removed event for commentId:', commentId, 'to room:', `comment:${commentId}`, 'with counts:', broadcastCounts);
            webSocketService.emitCommentLikeRemoved(commentId, userId, broadcastCounts, comment.authorId);
        } else {
            console.log('[likeController] Comment not found for WebSocket emission:', commentId);
        }

        const response: LikeResponse = {
            message: 'Like/dislike removed from comment successfully',
            data: {
                counts
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error removing like from comment:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Like not found') {
                statusCode = 404;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to remove like from comment'
        } as LikeErrorResponse);
    }
};

/**
 * Likes a reply
 * @param req - Express authenticated request containing reply ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with like data or error
 */
export const likeReplyController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            } as LikeErrorResponse);
            return;
        }

        const { replyId } = req.params;
        const userId = req.user!.id;

        console.log('[likeController] likeReplyController - replyId:', replyId, 'userId:', userId, 'action: like');

        const result = await likeReply(replyId, userId, 'like');
        const counts = await getReplyLikeCountsWithUserStatus(replyId, userId);

        console.log('[likeController] Counts retrieved:', JSON.stringify(counts, null, 2));
        console.log('[likeController] userLikeStatus in counts:', counts.userLikeStatus);

        const reply = await getCommentById(replyId);
        if (reply) {
            const webSocketService = getWebSocketService();
            const broadcastCounts: LikeCounts = {
                likesCount: counts.likesCount,
                dislikesCount: counts.dislikesCount
            };
            console.log('[likeController] Emitting reply:liked event for replyId:', replyId, 'to room:', `comment:${replyId}`, 'with counts:', broadcastCounts);
            webSocketService.emitReplyLiked(replyId, userId, broadcastCounts, reply.authorId);
        } else {
            console.log('[likeController] Reply not found for WebSocket emission:', replyId);
        }

        const response: LikeResponse = {
            message: 'Reply liked successfully',
            data: {
                like: result.like,
                counts
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error liking reply:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Reply not found') {
                statusCode = 404;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to like reply'
        } as LikeErrorResponse);
    }
};

/**
 * Dislikes a reply
 * @param req - Express authenticated request containing reply ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with dislike data or error
 */
export const dislikeReplyController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            } as LikeErrorResponse);
            return;
        }

        const { replyId } = req.params;
        const userId = req.user!.id;

        console.log('[likeController] dislikeReplyController - replyId:', replyId, 'userId:', userId, 'action: dislike');

        const result = await likeReply(replyId, userId, 'dislike');
        const counts = await getReplyLikeCountsWithUserStatus(replyId, userId);

        console.log('[likeController] Counts retrieved:', JSON.stringify(counts, null, 2));
        console.log('[likeController] userLikeStatus in counts:', counts.userLikeStatus);

        const reply = await getCommentById(replyId);
        if (reply) {
            const webSocketService = getWebSocketService();
            const broadcastCounts: LikeCounts = {
                likesCount: counts.likesCount,
                dislikesCount: counts.dislikesCount
            };
            console.log('[likeController] Emitting reply:disliked event for replyId:', replyId, 'to room:', `comment:${replyId}`, 'with counts:', broadcastCounts);
            webSocketService.emitReplyDisliked(replyId, userId, broadcastCounts, reply.authorId);
        } else {
            console.log('[likeController] Reply not found for WebSocket emission:', replyId);
        }

        const response: LikeResponse = {
            message: 'Reply disliked successfully',
            data: {
                like: result.like,
                counts
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error disliking reply:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Reply not found') {
                statusCode = 404;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to dislike reply'
        } as LikeErrorResponse);
    }
};

/**
 * Removes a like or dislike from a reply
 * @param req - Express authenticated request containing reply ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with updated counts or error
 */
export const removeLikeFromReplyController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            } as LikeErrorResponse);
            return;
        }

        const { replyId } = req.params;
        const userId = req.user!.id;

        console.log('[likeController] removeLikeFromReplyController - replyId:', replyId, 'userId:', userId, 'action: remove');

        await removeLikeFromReply(replyId, userId);
        const counts = await getReplyLikeCountsWithUserStatus(replyId, userId);

        console.log('[likeController] Counts retrieved:', JSON.stringify(counts, null, 2));
        console.log('[likeController] userLikeStatus in counts:', counts.userLikeStatus);

        const reply = await getCommentById(replyId);
        if (reply) {
            const webSocketService = getWebSocketService();
            const broadcastCounts: LikeCounts = {
                likesCount: counts.likesCount,
                dislikesCount: counts.dislikesCount
            };
            console.log('[likeController] Emitting reply:like_removed event for replyId:', replyId, 'to room:', `comment:${replyId}`, 'with counts:', broadcastCounts);
            webSocketService.emitReplyLikeRemoved(replyId, userId, broadcastCounts, reply.authorId);
        } else {
            console.log('[likeController] Reply not found for WebSocket emission:', replyId);
        }

        const response: LikeResponse = {
            message: 'Like/dislike removed from reply successfully',
            data: {
                counts
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error removing like from reply:', error);
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message === 'Like not found') {
                statusCode = 404;
            }
        }

        res.status(statusCode).json({
            message: error instanceof Error ? error.message : 'Failed to remove like from reply'
        } as LikeErrorResponse);
    }
};

/**
 * Retrieves the like status for a comment
 * @param req - Express authenticated request containing comment ID
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with like status or error
 */
export const getCommentLikeStatusController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            } as LikeErrorResponse);
            return;
        }

        const { commentId } = req.params;
        const userId = req.user!.id;

        const counts = await getCommentLikeCountsWithUserStatus(commentId, userId);

        const response: LikeStatusResponse = {
            message: 'Comment like status retrieved successfully',
            data: counts.userLikeStatus || {
                hasLiked: false,
                hasDisliked: false
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting comment like status:', error);
        res.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to get comment like status'
        } as LikeErrorResponse);
    }
};