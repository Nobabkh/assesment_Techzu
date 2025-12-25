import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import {
    createCommentController,
    getCommentsController,
    getCommentByIdController,
    updateCommentController,
    deleteCommentController,
    getRepliesController
} from '../controllers/commentController';

const router = Router();

// Validation rules for creating a comment
const createCommentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Content must be between 1 and 1000 characters'),
    body('parentId')
        .optional()
        .isMongoId()
        .withMessage('Invalid parent comment ID')
];

// Validation rules for updating a comment
const updateCommentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Content must be between 1 and 1000 characters')
];

// Validation rules for getting comments with pagination
const getCommentsValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const allowedFields = ['createdAt', 'updatedAt', 'content', 'likesCount', 'dislikesCount', 'repliesCount'];
                const fields = value.split(',').map((field: string) => field.trim());
                for (const field of fields) {
                    if (!allowedFields.includes(field)) {
                        throw new Error(`Invalid sort field: ${field}. Allowed fields: ${allowedFields.join(', ')}`);
                    }
                }
            }
            return true;
        }),
    query('sortOrder')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const orders = value.split(',').map((order: string) => order.trim());
                for (const order of orders) {
                    if (order !== 'asc' && order !== 'desc') {
                        throw new Error(`Invalid sort order: ${order}. Must be 'asc' or 'desc'`);
                    }
                }
            }
            return true;
        }),
    query('authorId')
        .optional()
        .isMongoId()
        .withMessage('Invalid author ID'),
    query('parentId')
        .optional()
        .isMongoId()
        .withMessage('Invalid parent comment ID'),
    query('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('dateFrom must be a valid ISO 8601 date'),
    query('dateTo')
        .optional()
        .isISO8601()
        .withMessage('dateTo must be a valid ISO 8601 date'),
    query('specialSort')
        .optional()
        .isIn(['mostLiked', 'mostDisliked', 'newest', 'oldest'])
        .withMessage('specialSort must be one of: mostLiked, mostDisliked, newest, oldest'),
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    query('minLikes')
        .optional()
        .isInt({ min: 0 })
        .withMessage('minLikes must be a non-negative integer'),
    query('maxLikes')
        .optional()
        .isInt({ min: 0 })
        .withMessage('maxLikes must be a non-negative integer'),
    query('minReplies')
        .optional()
        .isInt({ min: 0 })
        .withMessage('minReplies must be a non-negative integer'),
    query('maxReplies')
        .optional()
        .isInt({ min: 0 })
        .withMessage('maxReplies must be a non-negative integer')
];

// Validation rules for getting replies
const getRepliesValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const allowedFields = ['createdAt', 'updatedAt', 'content', 'likesCount', 'dislikesCount', 'repliesCount'];
                const fields = value.split(',').map((field: string) => field.trim());
                for (const field of fields) {
                    if (!allowedFields.includes(field)) {
                        throw new Error(`Invalid sort field: ${field}. Allowed fields: ${allowedFields.join(', ')}`);
                    }
                }
            }
            return true;
        }),
    query('sortOrder')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const orders = value.split(',').map((order: string) => order.trim());
                for (const order of orders) {
                    if (order !== 'asc' && order !== 'desc') {
                        throw new Error(`Invalid sort order: ${order}. Must be 'asc' or 'desc'`);
                    }
                }
            }
            return true;
        })
];

// Validation for comment ID parameter
const commentIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid comment ID')
];

// Routes

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment or reply to an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comment created successfully'
 *                 data:
 *                   $ref: '#/components/schemas/CommentWithDetails'
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
 *         description: Parent comment not found
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
router.post('/', authenticateToken, createCommentValidation, createCommentController);

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get comments with pagination and sorting
 *     description: Retrieve a paginated list of comments with optional filtering and sorting
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, content, likesCount, dislikesCount, repliesCount]
 *         description: Field to sort by (comma-separated for multiple fields)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (comma-separated for multiple fields)
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter by parent comment ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter comments created after this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter comments created before this date
 *       - in: query
 *         name: specialSort
 *         schema:
 *           type: string
 *           enum: [mostLiked, mostDisliked, newest, oldest]
 *         description: Special sorting options
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search term for comment content
 *       - in: query
 *         name: minLikes
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum number of likes
 *       - in: query
 *         name: maxLikes
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum number of likes
 *       - in: query
 *         name: minReplies
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum number of replies
 *       - in: query
 *         name: maxReplies
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum number of replies
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comments retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CommentWithDetails'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Validation error
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
router.get('/', getCommentsValidation, getCommentsController);

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Get a single comment
 *     description: Retrieve a specific comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comment retrieved successfully'
 *                 data:
 *                   $ref: '#/components/schemas/CommentWithDetails'
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
router.get('/:id', commentIdValidation, getCommentByIdController);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Update an existing comment (only by the author)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comment updated successfully'
 *                 data:
 *                   $ref: '#/components/schemas/CommentWithDetails'
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
 *       403:
 *         description: Forbidden (not the comment author)
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
router.put('/:id', authenticateToken, commentIdValidation, updateCommentValidation, updateCommentController);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete an existing comment (only by the author)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Comment deleted successfully'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not the comment author)
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
router.delete('/:id', authenticateToken, commentIdValidation, deleteCommentController);

/**
 * @swagger
 * /api/comments/{id}/replies:
 *   get:
 *     summary: Get replies to a comment
 *     description: Retrieve paginated replies to a specific comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent comment ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, content, likesCount, dislikesCount, repliesCount]
 *         description: Field to sort by (comma-separated for multiple fields)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (comma-separated for multiple fields)
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Replies retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CommentWithDetails'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Parent comment not found
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
router.get('/:id/replies', commentIdValidation, getRepliesValidation, getRepliesController);

export default router;