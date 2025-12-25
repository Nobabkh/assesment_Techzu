import { apiGet, apiPost, apiPut, apiDelete } from './api';
import {
    CommentResponse,
    CommentListResponse,
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentQueryParams,
    ApiResponse
} from '../types';

const COMMENT_ENDPOINT = '/comments';

export const commentService = {
    // Get all comments with pagination and filtering
    getComments: async (params?: CommentQueryParams): Promise<ApiResponse<CommentListResponse>> => {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v.toString()));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        const url = queryParams.toString() ? `${COMMENT_ENDPOINT}?${queryParams.toString()}` : COMMENT_ENDPOINT;
        return apiGet<CommentListResponse>(url);
    },

    // Get a single comment by ID
    getCommentById: async (id: string): Promise<ApiResponse<CommentResponse>> => {
        return apiGet<CommentResponse>(`${COMMENT_ENDPOINT}/${id}`);
    },

    // Create a new comment
    createComment: async (commentData: CreateCommentRequest): Promise<ApiResponse<CommentResponse>> => {
        return apiPost<CommentResponse>(COMMENT_ENDPOINT, commentData);
    },

    // Update an existing comment
    updateComment: async (id: string, commentData: UpdateCommentRequest): Promise<ApiResponse<CommentResponse>> => {
        return apiPut<CommentResponse>(`${COMMENT_ENDPOINT}/${id}`, commentData);
    },

    // Delete a comment
    deleteComment: async (id: string): Promise<ApiResponse<void>> => {
        return apiDelete<void>(`${COMMENT_ENDPOINT}/${id}`);
    },

    // Get replies for a specific comment
    getReplies: async (commentId: string, params?: CommentQueryParams): Promise<ApiResponse<CommentListResponse>> => {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v.toString()));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        const url = queryParams.toString()
            ? `${COMMENT_ENDPOINT}/${commentId}/replies?${queryParams.toString()}`
            : `${COMMENT_ENDPOINT}/${commentId}/replies`;

        return apiGet<CommentListResponse>(url);
    },

    // Create a reply to a comment
    createReply: async (commentId: string, replyData: CreateCommentRequest): Promise<ApiResponse<CommentResponse>> => {
        return apiPost<CommentResponse>(`${COMMENT_ENDPOINT}/${commentId}/replies`, replyData);
    }
};

export default commentService;