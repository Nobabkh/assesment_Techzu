import { createSelector } from '@reduxjs/toolkit';
import { RootState, CommentResponse } from '../../types';

// Base selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectComments = (state: RootState) => state.comments;
export const selectUser = (state: RootState) => state.user;
export const selectUI = (state: RootState) => state.ui;
export const selectLikes = (state: RootState) => state.likes;

// Authentication selectors
export const selectIsAuthenticated = createSelector(
    [selectAuth],
    (auth) => auth.isAuthenticated
);

export const selectCurrentUser = createSelector(
    [selectAuth],
    (auth) => auth.user
);

export const selectAuthToken = createSelector(
    [selectAuth],
    (auth) => auth.token
);

export const selectAuthLoading = createSelector(
    [selectAuth],
    (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
    [selectAuth],
    (auth) => auth.error
);

// Comment selectors
export const selectAllComments = createSelector(
    [selectComments],
    (comments) => comments.comments
);

export const selectCurrentComment = createSelector(
    [selectComments],
    (comments) => comments.currentComment
);

export const selectCommentReplies = createSelector(
    [selectComments, (state: RootState, commentId: string) => commentId],
    (comments, commentId) => comments.replies[commentId] || []
);

export const selectCommentsPagination = createSelector(
    [selectComments],
    (comments) => comments.pagination
);

export const selectCommentsTotalCount = createSelector(
    [selectComments],
    (comments) => comments.totalCount
);

export const selectCommentsLoading = createSelector(
    [selectComments],
    (comments) => comments.isLoading
);

export const selectCommentCreating = createSelector(
    [selectComments],
    (comments) => comments.isCreating
);

export const selectCommentUpdating = createSelector(
    [selectComments],
    (comments) => comments.isUpdating
);

export const selectCommentDeleting = createSelector(
    [selectComments],
    (comments) => comments.isDeleting
);

export const selectCommentsError = createSelector(
    [selectComments],
    (comments) => comments.error
);

// Memoized selector for comment by ID
export const selectCommentById = createSelector(
    [selectAllComments, (state: RootState, commentId: string) => commentId],
    (comments, commentId) => comments.find((comment) => comment.id === commentId)
);

// Memoized selector for comments by author ID
export const selectCommentsByAuthorId = createSelector(
    [selectAllComments, (state: RootState, authorId: string) => authorId],
    (comments, authorId) => comments.filter((comment) => comment.authorId === authorId)
);

// User selectors
export const selectUserProfile = createSelector(
    [selectUser],
    (user) => user.profile
);

export const selectUserLoading = createSelector(
    [selectUser],
    (user) => user.isLoading
);

export const selectUserUpdating = createSelector(
    [selectUser],
    (user) => user.isUpdating
);

export const selectUserError = createSelector(
    [selectUser],
    (user) => user.error
);

// UI selectors
export const selectGlobalLoading = createSelector(
    [selectUI],
    (ui) => ui.isLoading
);

export const selectNotifications = createSelector(
    [selectUI],
    (ui) => ui.notifications
);

export const selectTheme = createSelector(
    [selectUI],
    (ui) => ui.theme
);

export const selectSidebarOpen = createSelector(
    [selectUI],
    (ui) => ui.sidebarOpen
);

// Memoized selector for notifications by type
export const selectNotificationsByType = createSelector(
    [selectNotifications, (state: RootState, type: string) => type],
    (notifications, type) => notifications.filter((notification) => notification.type === type)
);

// Like selectors
export const selectCommentLikes = createSelector(
    [selectLikes, (state: RootState, commentId: string) => commentId],
    (likes, commentId) => likes.commentLikes[commentId]
);

export const selectReplyLikes = createSelector(
    [selectLikes, (state: RootState, replyId: string) => replyId],
    (likes, replyId) => likes.replyLikes[replyId]
);

export const selectLikesLoading = createSelector(
    [selectLikes],
    (likes) => likes.isLoading
);

export const selectLikesError = createSelector(
    [selectLikes],
    (likes) => likes.error
);

// Memoized selector for like status of a comment
export const selectCommentLikeStatus = createSelector(
    [selectCommentLikes],
    (commentLikes) => commentLikes?.userLikeStatus
);

// Memoized selector for like counts of a comment
export const selectCommentLikeCounts = createSelector(
    [selectCommentLikes],
    (commentLikes) => {
        if (!commentLikes) return { likesCount: 0, dislikesCount: 0 };
        return {
            likesCount: commentLikes.likesCount,
            dislikesCount: commentLikes.dislikesCount,
        };
    }
);

// Memoized selector for like status of a reply
export const selectReplyLikeStatus = createSelector(
    [selectReplyLikes],
    (replyLikes) => replyLikes?.userLikeStatus
);

// Memoized selector for like counts of a reply
export const selectReplyLikeCounts = createSelector(
    [selectReplyLikes],
    (replyLikes) => {
        if (!replyLikes) return { likesCount: 0, dislikesCount: 0 };
        return {
            likesCount: replyLikes.likesCount,
            dislikesCount: replyLikes.dislikesCount,
        };
    }
);

// Complex selectors
export const selectCommentsWithLikeStatus = createSelector(
    [selectAllComments, selectLikes],
    (comments, likes) => {
        return comments.map((comment: CommentResponse) => ({
            ...comment,
            likeStatus: likes.commentLikes[comment.id]?.userLikeStatus,
            likeCounts: {
                likesCount: likes.commentLikes[comment.id]?.likesCount || 0,
                dislikesCount: likes.commentLikes[comment.id]?.dislikesCount || 0,
            },
        }));
    }
);

export const selectRepliesWithLikeStatus = createSelector(
    [selectCommentReplies, selectLikes, (state: RootState, commentId: string) => commentId],
    (replies, likes, commentId) => {
        return replies.map((reply: CommentResponse) => ({
            ...reply,
            likeStatus: likes.replyLikes[reply.id]?.userLikeStatus,
            likeCounts: {
                likesCount: likes.replyLikes[reply.id]?.likesCount || 0,
                dislikesCount: likes.replyLikes[reply.id]?.dislikesCount || 0,
            },
        }));
    }
);