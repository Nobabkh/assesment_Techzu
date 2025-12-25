import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { likeService } from '../../services';
import {
    LikeState,
    LikeRequest,
    LikeCounts,
    LikeStatus,
} from '../../types';

// Initial state
const initialState: LikeState = {
    commentLikes: {},
    replyLikes: {},
    isLoading: false,
    error: null,
};

// Async thunks
export const toggleCommentLike = createAsyncThunk<
    { commentId: string; counts: LikeCounts },
    { commentId: string; likeData: LikeRequest },
    { rejectValue: string }
>('likes/toggleCommentLike', async ({ commentId, likeData }, { rejectWithValue }) => {
    try {
        const response = await likeService.toggleCommentLike(commentId, likeData);
        console.log('[likeSlice] toggleCommentLike response:', JSON.stringify(response, null, 2));
        if (response.success && response.data) {
            // response.data is { like, counts } after api.ts extracts inner data
            const counts = response.data.counts || response.data;
            console.log('[likeSlice] Extracted counts:', JSON.stringify(counts, null, 2));
            return {
                commentId,
                counts,
            };
        } else {
            return rejectWithValue(response.message || 'Failed to toggle like');
        }
    } catch (error: any) {
        console.error('[likeSlice] toggleCommentLike error:', error);
        return rejectWithValue(error.message || 'Failed to toggle like');
    }
});

export const toggleReplyLike = createAsyncThunk<
    { replyId: string; counts: LikeCounts },
    { replyId: string; likeData: LikeRequest },
    { rejectValue: string }
>('likes/toggleReplyLike', async ({ replyId, likeData }, { rejectWithValue }) => {
    try {
        const response = await likeService.toggleReplyLike(replyId, likeData);
        console.log('[likeSlice] toggleReplyLike response:', JSON.stringify(response, null, 2));
        if (response.success && response.data) {
            // response.data is { like, counts } after api.ts extracts inner data
            const counts = response.data.counts || response.data;
            console.log('[likeSlice] Extracted counts:', JSON.stringify(counts, null, 2));
            return {
                replyId,
                counts,
            };
        } else {
            return rejectWithValue(response.message || 'Failed to toggle like');
        }
    } catch (error: any) {
        console.error('[likeSlice] toggleReplyLike error:', error);
        return rejectWithValue(error.message || 'Failed to toggle like');
    }
});

export const getCommentLikeStatus = createAsyncThunk<
    { commentId: string; status: LikeStatus },
    string,
    { rejectValue: string }
>('likes/getCommentLikeStatus', async (commentId, { rejectWithValue }) => {
    try {
        const response = await likeService.getCommentLikeStatus(commentId);
        console.log('[likeSlice] getCommentLikeStatus response:', JSON.stringify(response, null, 2));
        if (response.success && response.data) {
            // response.data is { hasLiked, hasDisliked } after api.ts extracts inner data
            return {
                commentId,
                status: response.data,
            };
        } else {
            return rejectWithValue(response.message || 'Failed to get like status');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to get like status');
    }
});

export const getReplyLikeStatus = createAsyncThunk<
    { replyId: string; status: LikeStatus },
    string,
    { rejectValue: string }
>('likes/getReplyLikeStatus', async (replyId, { rejectWithValue }) => {
    try {
        const response = await likeService.getReplyLikeStatus(replyId);
        console.log('[likeSlice] getReplyLikeStatus response:', JSON.stringify(response, null, 2));
        if (response.success && response.data) {
            // response.data is { hasLiked, hasDisliked } after api.ts extracts inner data
            return {
                replyId,
                status: response.data,
            };
        } else {
            return rejectWithValue(response.message || 'Failed to get like status');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to get like status');
    }
});

// Create the slice
const likeSlice = createSlice({
    name: 'likes',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Reset like state
        resetLikeState: () => initialState,

        // Update comment like counts locally (for real-time updates)
        // Preserves the user's own like status while updating counts
        updateCommentLikeCounts: (state, action: PayloadAction<{ commentId: string; counts: LikeCounts }>) => {
            const { commentId, counts } = action.payload;
            console.log('[likeSlice] updateCommentLikeCounts - commentId:', commentId, 'counts:', JSON.stringify(counts, null, 2));
            console.log('[likeSlice] Previous state for commentId:', commentId, ':', JSON.stringify(state.commentLikes[commentId], null, 2));

            // Preserve the user's own like status if it exists
            const existingUserLikeStatus = state.commentLikes[commentId]?.userLikeStatus;

            state.commentLikes[commentId] = {
                ...counts,
                userLikeStatus: existingUserLikeStatus || counts.userLikeStatus
            };

            console.log('[likeSlice] New state for commentId:', commentId, ':', JSON.stringify(state.commentLikes[commentId], null, 2));
        },

        // Update reply like counts locally (for real-time updates)
        // Preserves the user's own like status while updating counts
        updateReplyLikeCounts: (state, action: PayloadAction<{ replyId: string; counts: LikeCounts }>) => {
            const { replyId, counts } = action.payload;
            console.log('[likeSlice] updateReplyLikeCounts - replyId:', replyId, 'counts:', JSON.stringify(counts, null, 2));
            console.log('[likeSlice] Previous state for replyId:', replyId, ':', JSON.stringify(state.replyLikes[replyId], null, 2));

            // Preserve the user's own like status if it exists
            const existingUserLikeStatus = state.replyLikes[replyId]?.userLikeStatus;

            state.replyLikes[replyId] = {
                ...counts,
                userLikeStatus: existingUserLikeStatus || counts.userLikeStatus
            };

            console.log('[likeSlice] New state for replyId:', replyId, ':', JSON.stringify(state.replyLikes[replyId], null, 2));
        },

        // Remove comment likes from state
        removeCommentLikes: (state, action: PayloadAction<string>) => {
            const commentId = action.payload;
            delete state.commentLikes[commentId];
        },

        // Remove reply likes from state
        removeReplyLikes: (state, action: PayloadAction<string>) => {
            const replyId = action.payload;
            delete state.replyLikes[replyId];
        },
    },
    extraReducers: (builder) => {
        // Toggle comment like
        builder
            .addCase(toggleCommentLike.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleCommentLike.fulfilled, (state, action) => {
                state.isLoading = false;
                const { commentId, counts } = action.payload;
                state.commentLikes[commentId] = counts;
                state.error = null;
            })
            .addCase(toggleCommentLike.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to toggle like';
            });

        // Toggle reply like
        builder
            .addCase(toggleReplyLike.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleReplyLike.fulfilled, (state, action) => {
                state.isLoading = false;
                const { replyId, counts } = action.payload;
                state.replyLikes[replyId] = counts;
                state.error = null;
            })
            .addCase(toggleReplyLike.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to toggle like';
            });

        // Get comment like status
        builder
            .addCase(getCommentLikeStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCommentLikeStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const { commentId, status } = action.payload;

                // Only update the user's like status, preserve existing counts
                if (state.commentLikes[commentId]) {
                    state.commentLikes[commentId].userLikeStatus = status;
                } else {
                    // Create entry with only userLikeStatus - counts will come from comment object or toggle action
                    state.commentLikes[commentId] = {
                        userLikeStatus: status,
                    } as any;
                }

                state.error = null;
            })
            .addCase(getCommentLikeStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to get like status';
            });

        // Get reply like status
        builder
            .addCase(getReplyLikeStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getReplyLikeStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const { replyId, status } = action.payload;

                // Only update the user's like status, preserve existing counts
                if (state.replyLikes[replyId]) {
                    state.replyLikes[replyId].userLikeStatus = status;
                } else {
                    // Create entry with only userLikeStatus - counts will come from reply object or toggle action
                    state.replyLikes[replyId] = {
                        userLikeStatus: status,
                    } as any;
                }

                state.error = null;
            })
            .addCase(getReplyLikeStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to get like status';
            });
    },
});

export const {
    clearError,
    resetLikeState,
    updateCommentLikeCounts,
    updateReplyLikeCounts,
    removeCommentLikes,
    removeReplyLikes,
} = likeSlice.actions;

export default likeSlice.reducer;