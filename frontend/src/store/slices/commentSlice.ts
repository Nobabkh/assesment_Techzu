import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { commentService } from '../../services';
import {
    CommentState,
    CommentResponse,
    CommentListResponse,
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentQueryParams,
    PaginationMetadata,
} from '../../types';

const initialState: CommentState = {
    comments: [],
    currentComment: null,
    replies: {},
    pagination: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    totalCount: 0,
};

/**
 * Fetches comments with optional query parameters
 * @param params - Optional query parameters for filtering and pagination
 * @returns Promise resolving to comment list response
 */
export const fetchComments = createAsyncThunk<
    CommentListResponse,
    CommentQueryParams | undefined,
    { rejectValue: string }
>('comments/fetchComments', async (params, { rejectWithValue }) => {
    try {
        const response = await commentService.getComments(params);
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to fetch comments');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments';
        return rejectWithValue(errorMessage);
    }
});

/**
 * Fetches a single comment by ID
 * @param id - The comment ID to fetch
 * @returns Promise resolving to comment response
 */
export const fetchCommentById = createAsyncThunk<
    CommentResponse,
    string,
    { rejectValue: string }
>('comments/fetchCommentById', async (id, { rejectWithValue }) => {
    try {
        const response = await commentService.getCommentById(id);
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to fetch comment');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comment';
        return rejectWithValue(errorMessage);
    }
});

/**
 * Creates a new comment
 * @param commentData - The comment data to create
 * @returns Promise resolving to created comment response
 */
export const createComment = createAsyncThunk<
    CommentResponse,
    CreateCommentRequest,
    { rejectValue: string }
>('comments/createComment', async (commentData, { rejectWithValue }) => {
    try {
        const response = await commentService.createComment(commentData);
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to create comment');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
        return rejectWithValue(errorMessage);
    }
});

/**
 * Updates an existing comment
 * @param param - Object containing comment ID and update data
 * @returns Promise resolving to updated comment response
 */
export const updateComment = createAsyncThunk<
    CommentResponse,
    { id: string; data: UpdateCommentRequest },
    { rejectValue: string }
>('comments/updateComment', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await commentService.updateComment(id, data);
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to update comment');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
        return rejectWithValue(errorMessage);
    }
});

/**
 * Deletes a comment
 * @param id - The comment ID to delete
 * @returns Promise resolving to deleted comment ID
 */
export const deleteComment = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>('comments/deleteComment', async (id, { rejectWithValue }) => {
    try {
        const response = await commentService.deleteComment(id);
        if (response.success) {
            return id;
        } else {
            return rejectWithValue(response.message || 'Failed to delete comment');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
        return rejectWithValue(errorMessage);
    }
});

/**
 * Fetches replies for a specific comment
 * @param param - Object containing comment ID and optional query parameters
 * @returns Promise resolving to replies with pagination
 */
export const fetchReplies = createAsyncThunk<
    { commentId: string; replies: CommentResponse[]; pagination: PaginationMetadata },
    { commentId: string; params?: CommentQueryParams },
    { rejectValue: string }
>('comments/fetchReplies', async ({ commentId, params }, { rejectWithValue }) => {
    try {
        const response = await commentService.getReplies(commentId, params);
        if (response.success && response.data) {
            return {
                commentId,
                replies: response.data.comments,
                pagination: response.data.pagination,
            };
        } else {
            return rejectWithValue(response.message || 'Failed to fetch replies');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch replies';
        return rejectWithValue(errorMessage);
    }
});

/**
 * Creates a reply to a comment
 * @param param - Object containing parent comment ID and reply data
 * @returns Promise resolving to created reply with parent comment ID
 */
export const createReply = createAsyncThunk<
    { commentId: string; reply: CommentResponse },
    { commentId: string; replyData: CreateCommentRequest },
    { rejectValue: string }
>('comments/createReply', async ({ commentId, replyData }, { rejectWithValue }) => {
    try {
        const response = await commentService.createReply(commentId, replyData);
        if (response.success && response.data) {
            return { commentId, reply: response.data };
        } else {
            return rejectWithValue(response.message || 'Failed to create reply');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create reply';
        return rejectWithValue(errorMessage);
    }
});

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        /**
         * Clears the error state
         */
        clearError: (state: CommentState): void => {
            state.error = null;
        },
        /**
         * Clears the current comment
         */
        clearCurrentComment: (state: CommentState): void => {
            state.currentComment = null;
        },
        /**
         * Resets the comment state to initial values
         */
        resetCommentState: (): CommentState => initialState,
        /**
         * Updates a comment in the state
         * @param state - Current comment state
         * @param action - Action containing the updated comment
         */
        updateCommentInState: (state: CommentState, action: PayloadAction<CommentResponse>): void => {
            const { id } = action.payload;
            const index = state.comments.findIndex((comment) => comment.id === id);
            if (index !== -1) {
                state.comments[index] = action.payload;
            }
            Object.keys(state.replies).forEach((parentId) => {
                const replyIndex = state.replies[parentId].findIndex((reply) => reply.id === id);
                if (replyIndex !== -1) {
                    state.replies[parentId][replyIndex] = action.payload;
                }
            });
        },
        /**
         * Adds a new comment to the state
         * @param state - Current comment state
         * @param action - Action containing the new comment
         */
        addCommentToState: (state: CommentState, action: PayloadAction<CommentResponse>): void => {
            const newComment = action.payload;
            const exists = state.comments.some((comment) => comment.id === newComment.id);
            if (!exists) {
                state.comments.unshift(newComment);
                state.totalCount += 1;
            }
        },
        /**
         * Adds a new reply to the state
         * @param state - Current comment state
         * @param action - Action containing parent ID and reply
         */
        addReplyToState: (state: CommentState, action: PayloadAction<{ parentId: string; reply: CommentResponse }>): void => {
            const { parentId, reply } = action.payload;
            if (!state.replies[parentId]) {
                state.replies[parentId] = [];
            }
            const exists = state.replies[parentId].some((r) => r.id === reply.id);
            if (!exists) {
                state.replies[parentId].unshift(reply);
                const parentIndex = state.comments.findIndex((c) => c.id === parentId);
                if (parentIndex !== -1) {
                    state.comments[parentIndex]._count.replies += 1;
                }
            }
        },
        /**
         * Removes a comment from the state
         * @param state - Current comment state
         * @param action - Action containing the comment ID to remove
         */
        removeCommentFromState: (state: CommentState, action: PayloadAction<string>): void => {
            const commentId = action.payload;
            state.comments = state.comments.filter((comment) => comment.id !== commentId);
            Object.keys(state.replies).forEach((parentId) => {
                state.replies[parentId] = state.replies[parentId].filter(
                    (reply) => reply.id !== commentId
                );
            });
        },
    },
    extraReducers: (builder) => {
        // Fetch comments
        builder
            .addCase(fetchComments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.comments = action.payload.comments;
                state.pagination = action.payload.pagination;
                state.totalCount = action.payload.pagination.totalItems;
                state.error = null;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch comments';
            });

        // Fetch comment by ID
        builder
            .addCase(fetchCommentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCommentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentComment = action.payload;
                state.error = null;
            })
            .addCase(fetchCommentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch comment';
            });

        // Create comment
        builder
            .addCase(createComment.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.isCreating = false;
                state.comments.unshift(action.payload);
                state.totalCount += 1;
                state.error = null;
            })
            .addCase(createComment.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload || 'Failed to create comment';
            });

        // Update comment
        builder
            .addCase(updateComment.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.isUpdating = false;
                const index = state.comments.findIndex((comment) => comment.id === action.payload.id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
                if (state.currentComment?.id === action.payload.id) {
                    state.currentComment = action.payload;
                }
                state.error = null;
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload || 'Failed to update comment';
            });

        // Delete comment
        builder
            .addCase(deleteComment.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.comments = state.comments.filter((comment) => comment.id !== action.payload);
                state.totalCount = Math.max(0, state.totalCount - 1);
                if (state.currentComment?.id === action.payload) {
                    state.currentComment = null;
                }
                state.error = null;
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload || 'Failed to delete comment';
            });

        // Fetch replies
        builder
            .addCase(fetchReplies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReplies.fulfilled, (state, action) => {
                state.isLoading = false;
                const { commentId, replies } = action.payload;
                state.replies[commentId] = replies;
                state.error = null;
            })
            .addCase(fetchReplies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch replies';
            });

        // Create reply
        builder
            .addCase(createReply.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createReply.fulfilled, (state, action) => {
                state.isCreating = false;
                const { commentId, reply } = action.payload;
                if (!state.replies[commentId]) {
                    state.replies[commentId] = [];
                }
                state.replies[commentId].unshift(reply);
                state.error = null;
            })
            .addCase(createReply.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload || 'Failed to create reply';
            });
    },
});

export const {
    clearError,
    clearCurrentComment,
    resetCommentState,
    updateCommentInState,
    addCommentToState,
    addReplyToState,
    removeCommentFromState,
} = commentSlice.actions;

export default commentSlice.reducer;