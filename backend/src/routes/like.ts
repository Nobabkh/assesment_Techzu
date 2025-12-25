import { Router } from 'express';
import { param } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import {
    likeCommentController,
    dislikeCommentController,
    removeLikeFromCommentController,
    likeReplyController,
    dislikeReplyController,
    removeLikeFromReplyController,
    getCommentLikeStatusController
} from '../controllers/likeController';

const router = Router();

// Validation for comment ID parameter
const commentIdValidation = [
    param('commentId')
        .isMongoId()
        .withMessage('Invalid comment ID')
];

// Validation for reply ID parameter
const replyIdValidation = [
    param('replyId')
        .isMongoId()
        .withMessage('Invalid reply ID')
];

// Routes for comments

/**
 * @swagger
 * /api/likes/comment/{commentId}:
 *   post:
 *     summary: Like a comment
 *     description: Add a like to a comment
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       201:
 *         description: Comment liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comment liked successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     like:
 *                       $ref: '#/components/schemas/Like'
 *                     counts:
 *                       $ref: '#/components/schemas/LikeCounts'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/comment/:commentId', authenticateToken, commentIdValidation, likeCommentController);

/**
 * @swagger
 * /api/likes/comment/{commentId}/dislike:
 *   post:
 *     summary: Dislike a comment
 *     description: Add a dislike to a comment
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       201:
 *         description: Comment disliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comment disliked successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     like:
 *                       $ref: '#/components/schemas/Like'
 *                     counts:
 *                       $ref: '#/components/schemas/LikeCounts'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/comment/:commentId/dislike', authenticateToken, commentIdValidation, dislikeCommentController);

/**
 * @swagger
 * /api/likes/comment/{commentId}:
 *   delete:
 *     summary: Remove like/dislike from a comment
 *     description: Remove a like or dislike from a comment
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Like/dislike removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Like/dislike removed from comment successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     counts:
 *                       $ref: '#/components/schemas/LikeCounts'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Like not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/comment/:commentId', authenticateToken, commentIdValidation, removeLikeFromCommentController);

/**
 * @swagger
 * /api/likes/comment/{commentId}/status:
 *   get:
 *     summary: Get like status for current user
 *     description: Check if the current user has liked or disliked a comment
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Like status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comment like status retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasLiked:
 *                       type: boolean
 *                       example: true
 *                     hasDisliked:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/comment/:commentId/status', authenticateToken, commentIdValidation, getCommentLikeStatusController);

// Routes for replies

/**
 * @swagger
 * /api/likes/reply/{replyId}:
 *   post:
 *     summary: Like a reply
 *     description: Add a like to a reply
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       201:
 *         description: Reply liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Reply liked successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     like:
 *                       $ref: '#/components/schemas/Like'
 *                     counts:
 *                       $ref: '#/components/schemas/LikeCounts'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reply not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reply/:replyId', authenticateToken, replyIdValidation, likeReplyController);

/**
 * @swagger
 * /api/likes/reply/{replyId}/dislike:
 *   post:
 *     summary: Dislike a reply
 *     description: Add a dislike to a reply
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       201:
 *         description: Reply disliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Reply disliked successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     like:
 *                       $ref: '#/components/schemas/Like'
 *                     counts:
 *                       $ref: '#/components/schemas/LikeCounts'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reply not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reply/:replyId/dislike', authenticateToken, replyIdValidation, dislikeReplyController);

/**
 * @swagger
 * /api/likes/reply/{replyId}:
 *   delete:
 *     summary: Remove like/dislike from a reply
 *     description: Remove a like or dislike from a reply
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Like/dislike removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Like/dislike removed from reply successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     counts:
 *                       $ref: '#/components/schemas/LikeCounts'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Like not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/reply/:replyId', authenticateToken, replyIdValidation, removeLikeFromReplyController);

export default router;