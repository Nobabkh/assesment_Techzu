import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { commentService, authService } from '../services';
import { CommentResponse, CommentQueryParams, ExtendedCommentQueryParams, SortOrder } from '../types';
import { RootState } from '../store';
import { fetchComments, createComment, updateComment, deleteComment } from '../store/slices/commentSlice';
import { toggleCommentLike, getCommentLikeStatus } from '../store/slices/likeSlice';
import {
    CommentList,
    CommentForm,
    CommentSort,
    CommentPagination,
    CommentFilters
} from '../components/comments';
import { useWebSocket, useTypingUsers } from '../hooks';
import { TypingIndicator } from '../components';
import { getWebSocketService } from '../services/websocketService';

// Define SortOption interface locally since it's not exported from the components
interface SortOption {
    value: string;
    label: string;
    field: string;
    order: SortOrder;
}

const Comments: React.FC = () => {
    const dispatch = useDispatch();
    const commentState = useSelector((state: RootState) => state.comments) as any;
    const {
        comments,
        pagination,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error
    } = commentState;
    const { user } = useSelector((state: RootState) => state.auth);

    const [filters, setFilters] = useState<ExtendedCommentQueryParams>({});
    const [sortOption, setSortOption] = useState<SortOption>({
        value: 'newest',
        label: 'Newest First',
        field: 'createdAt',
        order: 'desc'
    });
    const [editingComment, setEditingComment] = useState<CommentResponse | null>(null);
    const [showCommentForm, setShowCommentForm] = useState(false);

    const sortOptions: SortOption[] = [
        { value: 'newest', label: 'Newest First', field: 'createdAt', order: 'desc' },
        { value: 'oldest', label: 'Oldest First', field: 'createdAt', order: 'asc' },
        { value: 'mostLiked', label: 'Most Liked', field: 'likes', order: 'desc' },
        { value: 'mostReplied', label: 'Most Replied', field: 'replies', order: 'desc' }
    ];

    useEffect(() => {
        fetchCommentsList();
    }, []);

    useEffect(() => {
        fetchCommentsList();
    }, [filters, sortOption]);

    const fetchCommentsList = () => {
        const params: CommentQueryParams = {
            page: 1,
            limit: 10,
            sortBy: sortOption.field,
            sortOrder: sortOption.order,
            ...filters
        };

        dispatch(fetchComments(params) as any);
    };

    const handleCommentSubmit = async (content: string) => {
        if (editingComment) {
            // Update existing comment
            dispatch(updateComment({
                id: editingComment.id,
                data: { content }
            }) as any);
            setEditingComment(null);
        } else {
            // Create new comment
            dispatch(createComment({ content }) as any);
        }
        setShowCommentForm(false);
    };

    const handleEdit = (comment: CommentResponse) => {
        setEditingComment(comment);
        setShowCommentForm(true);
    };

    const handleDelete = (commentId: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            dispatch(deleteComment(commentId) as any);
        }
    };

    const handleReply = (commentId: string, content: string) => {
        // This would typically create a reply to the comment
        // For now, we'll just show a success message
        alert(`Reply to comment ${commentId}: ${content}`);
    };

    const handleLike = (commentId: string, type: 'like' | 'dislike') => {
        if (!user) return;

        dispatch(toggleCommentLike({
            commentId,
            likeData: { type }
        }) as any);
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
    };

    const handleFiltersChange = (newFilters: ExtendedCommentQueryParams) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        const params: CommentQueryParams = {
            page,
            limit: 10,
            sortBy: sortOption.field,
            sortOrder: sortOption.order,
            ...filters
        };

        dispatch(fetchComments(params) as any);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setShowCommentForm(false);
    };

    const handleNewComment = () => {
        setEditingComment(null);
        setShowCommentForm(true);
    };

    const isAuthenticated = authService.isAuthenticated();
    const { isConnected } = useWebSocket();

    // Join the general room for real-time updates (new comments from other users)
    useEffect(() => {
        if (isConnected) {
            const ws = getWebSocketService();
            ws.joinGeneralRoom();
            console.log('[Comments] Joined general room for real-time updates');

            return () => {
                ws.leaveGeneralRoom();
            };
        }
    }, [isConnected]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <header className="bg-white rounded-xl shadow-sm p-6 mb-6 sm:p-4 dark:bg-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1 sm:text-xl dark:text-white">
                                Comments
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                            <CommentSort
                                options={sortOptions}
                                value={sortOption.value}
                                onChange={handleSortChange}
                            />

                            <CommentFilters
                                onFiltersChange={handleFiltersChange}
                                initialFilters={filters}
                            />
                        </div>
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 sm:mb-4 sm:p-3 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400" role="alert">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* New Comment Section */}
                {isAuthenticated && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sm:p-4 sm:mb-4 dark:bg-gray-800">
                        {!showCommentForm ? (
                            <button
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium sm:px-4 sm:py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400"
                                onClick={handleNewComment}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Comment
                            </button>
                        ) : (
                            <div>
                                <CommentForm
                                    onSubmit={handleCommentSubmit}
                                    onCancel={handleCancelEdit}
                                    initialContent={editingComment?.content || ''}
                                    isEditing={!!editingComment}
                                    editingComment={editingComment}
                                    submitButtonText={editingComment ? 'Update Comment' : 'Post Comment'}
                                    title={editingComment ? `Editing comment by ${editingComment.author.username}` : 'Leave a Comment'}
                                    disabled={isCreating || isUpdating}
                                />

                                {/* Typing indicator for general comment area */}
                                {isConnected && (
                                    <div className="mt-3">
                                        <TypingIndicator commentId="general" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Comments List */}
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-4 dark:bg-gray-800">
                    <CommentList
                        comments={comments}
                        isLoading={isLoading}
                        error={error}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReply={handleReply}
                        emptyMessage="No comments yet. Be the first to comment!"
                        loadingMessage="Loading comments..."
                        errorMessage="Failed to load comments. Please try again."
                    />
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6">
                        <CommentPagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            disabled={isLoading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comments;