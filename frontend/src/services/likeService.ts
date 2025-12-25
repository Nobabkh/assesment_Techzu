import { apiGet, apiPost, apiDelete } from './api';
import {
    LikeStatus,
    LikeRequest,
    LikeQueryParams,
    ApiResponse,
    LikeWithCounts,
    LikeCounts
} from '../types';

// Type for the extracted data from LikeResponse (after api.ts extracts inner data)
type LikeResponseData = {
    like?: LikeWithCounts['like'];
    counts: LikeCounts;
};

const LIKE_ENDPOINT = '/likes';

export const likeService = {
    // Like or dislike a comment (uses different endpoints based on type)
    toggleCommentLike: async (commentId: string, likeData: LikeRequest): Promise<ApiResponse<LikeResponseData>> => {
        // Backend has separate endpoints for like and dislike
        const endpoint = likeData.type === 'dislike'
            ? `${LIKE_ENDPOINT}/comment/${commentId}/dislike`
            : `${LIKE_ENDPOINT}/comment/${commentId}`;
        return apiPost<LikeResponseData>(endpoint, likeData);
    },

    // Like or dislike a reply (uses different endpoints based on type)
    toggleReplyLike: async (replyId: string, likeData: LikeRequest): Promise<ApiResponse<LikeResponseData>> => {
        // Backend has separate endpoints for like and dislike
        const endpoint = likeData.type === 'dislike'
            ? `${LIKE_ENDPOINT}/reply/${replyId}/dislike`
            : `${LIKE_ENDPOINT}/reply/${replyId}`;
        return apiPost<LikeResponseData>(endpoint, likeData);
    },

    // Get like status for a comment (for current user)
    getCommentLikeStatus: async (commentId: string): Promise<ApiResponse<LikeStatus>> => {
        return apiGet<LikeStatus>(`${LIKE_ENDPOINT}/comment/${commentId}/status`);
    },

    // Get like status for a reply (for current user)
    getReplyLikeStatus: async (replyId: string): Promise<ApiResponse<LikeStatus>> => {
        return apiGet<LikeStatus>(`${LIKE_ENDPOINT}/reply/${replyId}/status`);
    },

    // Get all likes for a comment
    getCommentLikes: async (commentId: string, params?: LikeQueryParams): Promise<ApiResponse<any>> => {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = queryParams.toString()
            ? `${LIKE_ENDPOINT}/comment/${commentId}?${queryParams.toString()}`
            : `${LIKE_ENDPOINT}/comment/${commentId}`;

        return apiGet<any>(url);
    },

    // Get all likes for a reply
    getReplyLikes: async (replyId: string, params?: LikeQueryParams): Promise<ApiResponse<any>> => {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = queryParams.toString()
            ? `${LIKE_ENDPOINT}/reply/${replyId}?${queryParams.toString()}`
            : `${LIKE_ENDPOINT}/reply/${replyId}`;

        return apiGet<any>(url);
    },

    // Remove a like (unlike)
    removeLike: async (likeId: string): Promise<ApiResponse<void>> => {
        return apiDelete<void>(`${LIKE_ENDPOINT}/${likeId}`);
    }
};

export default likeService;