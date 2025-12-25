import React from 'react';
import { CommentResponse } from '../../types';
import CommentItem from './CommentItem';

export interface CommentListProps {
    comments: CommentResponse[];
    isLoading?: boolean;
    error?: string | null;
    onEdit?: (comment: CommentResponse) => void;
    onDelete?: (commentId: string) => void;
    onReply?: (commentId: string, content: string) => void;
    emptyMessage?: string;
    loadingMessage?: string;
    errorMessage?: string;
    showReplies?: boolean;
    maxNestingLevel?: number;
    className?: string;
}

const CommentList: React.FC<CommentListProps> = ({
    comments,
    isLoading = false,
    error = null,
    onEdit,
    onDelete,
    onReply,
    emptyMessage = 'No comments yet. Be the first to comment!',
    loadingMessage = 'Loading comments...',
    errorMessage = 'Failed to load comments. Please try again.',
    showReplies = true,
    maxNestingLevel = 3,
    className = ''
}) => {
    if (isLoading) {
        return (
            <div className={`w-full ${className}`}>
                <div className="flex flex-col items-center justify-center py-12 text-center sm:py-8" aria-live="polite" aria-busy="true">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 sm:w-10 sm:h-10 sm:mb-3" aria-hidden="true"></div>
                    <span className="text-gray-500 text-base sm:text-sm dark:text-gray-400">{loadingMessage}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`w-full ${className}`}>
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg sm:p-3 dark:bg-red-900/20 dark:border-red-800" role="alert" aria-live="assertive">
                    <div className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 sm:self-center sm:mt-0 sm:mb-2 dark:text-red-400" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="m-0 mb-1 text-base font-semibold text-red-700 sm:text-sm dark:text-red-400">Error</h3>
                        <p className="m-0 mb-3 text-red-600 leading-relaxed text-sm sm:mb-2 sm:text-xs dark:text-red-300">{error}</p>
                        <button
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:px-3 sm:py-1.5 sm:text-xs dark:bg-red-700 dark:hover:bg-red-600 dark:focus:ring-red-400"
                            onClick={() => window.location.reload()}
                            aria-label="Retry loading comments"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className={`w-full ${className}`}>
                <div className="flex flex-col items-center justify-center py-12 text-center sm:py-8" aria-live="polite">
                    <div className="w-16 h-16 text-gray-300 mb-4 sm:w-12 sm:h-12 sm:mb-3 dark:text-gray-600" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                        </svg>
                    </div>
                    <p className="m-0 text-gray-500 text-base sm:text-sm dark:text-gray-400">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <div className="flex flex-col gap-4" role="list">
                {comments.map((comment) => (
                    <div key={comment.id} role="listitem">
                        <CommentItem
                            comment={comment}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onReply={onReply}
                            showReplies={showReplies}
                            level={0}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentList;