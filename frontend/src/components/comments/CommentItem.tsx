import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { CommentResponse } from '../../types';
import { getCommentLikeStatus, toggleCommentLike } from '../../store/slices/likeSlice';
import { formatDate } from '../../utils';
import { LikeButton, CommentActions, ReplyForm } from './index';
import TypingIndicator from '../TypingIndicator';
import { getWebSocketService } from '../../services/websocketService';

interface CommentItemProps {
    comment: CommentResponse;
    isReply?: boolean;
    onEdit?: (comment: CommentResponse) => void;
    onDelete?: (commentId: string) => void;
    onReply?: (commentId: string, content: string) => void;
    showReplies?: boolean;
    level?: number; // For nested replies
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    isReply = false,
    onEdit,
    onDelete,
    onReply,
    showReplies = true,
    level = 0
}) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { commentLikes, isLoading: isLikeLoading } = useAppSelector((state) => state.likes);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showRepliesList, setShowRepliesList] = useState(false);
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [isNewComment, setIsNewComment] = useState(false);
    const [hasRealtimeUpdate, setHasRealtimeUpdate] = useState(false);

    const likeData = commentLikes[comment.id];
    const isAuthor = user?.id === comment.authorId;
    const maxNestingLevel = 3; // Maximum nesting level for replies

    console.log('[CommentItem] Render - commentId:', comment.id, 'likeData:', JSON.stringify(likeData, null, 2), 'user:', user?.id);

    useEffect(() => {
        // Fetch like status for this comment when component mounts
        if (user) {
            dispatch(getCommentLikeStatus(comment.id));
        }

        // Join the comment room to receive real-time like updates
        const websocketService = getWebSocketService();
        console.log('[CommentItem] Joining comment room for commentId:', comment.id);
        websocketService.joinCommentRoom(comment.id);

        // Leave the comment room when component unmounts
        return () => {
            console.log('[CommentItem] Leaving comment room for commentId:', comment.id);
            websocketService.leaveCommentRoom(comment.id);
        };
    }, [dispatch, comment.id, user]);

    // Reset real-time update indicator after a delay
    useEffect(() => {
        if (hasRealtimeUpdate) {
            const timer = setTimeout(() => {
                setHasRealtimeUpdate(false);
            }, 3000); // Clear indicator after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [hasRealtimeUpdate]);

    const handleLike = (type: 'like' | 'dislike') => {
        if (!user) return;

        dispatch(toggleCommentLike({
            commentId: comment.id,
            likeData: { type }
        }));
    };

    const handleReply = (content: string) => {
        if (onReply) {
            onReply(comment.id, content);
            setShowReplyForm(false);
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(comment);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(comment.id);
        }
    };

    const toggleReplies = async () => {
        if (showRepliesList) {
            setShowRepliesList(false);
        } else {
            setIsLoadingReplies(true);
            try {
                // This would typically be an API call to fetch replies
                // For now, we'll just toggle the state
                setShowRepliesList(true);
            } catch (error) {
                console.error('Failed to fetch replies:', error);
            } finally {
                setIsLoadingReplies(false);
            }
        }
    };

    const getLikeCount = () => {
        // Priority: Redux state (if defined) > comment.likesCount from API > 0
        // Check if likeData exists AND has likesCount defined (not just truthy, could be 0)
        if (likeData && likeData.likesCount !== undefined) {
            return likeData.likesCount;
        }
        return (comment as any).likesCount ?? 0;
    };
    const getDislikeCount = () => {
        // Priority: Redux state (if defined) > comment.dislikesCount from API > 0
        if (likeData && likeData.dislikesCount !== undefined) {
            return likeData.dislikesCount;
        }
        return (comment as any).dislikesCount ?? 0;
    };
    const getUserLikeStatus = (): 'like' | 'dislike' | null => {
        // Get user's like status from Redux state
        const userStatus = likeData?.userLikeStatus;
        if (!userStatus) return null;
        // Convert { hasLiked, hasDisliked } to 'like' | 'dislike' | null
        if (userStatus.hasLiked) return 'like';
        if (userStatus.hasDisliked) return 'dislike';
        return null;
    };

    return (
        <article
            className={`rounded-lg p-4 mb-4 transition-all duration-300 ${isReply
                ? 'bg-gray-50 border-l-4 border-blue-200 ml-4 md:ml-8 shadow-none hover:shadow-md'
                : 'bg-white shadow-sm hover:shadow-md'
                } ${hasRealtimeUpdate ? 'border-l-4 border-blue-400' : ''} ${isNewComment ? 'border-l-4 border-green-400' : ''
                } dark:bg-gray-800 dark:text-white dark:border-gray-700`}
            aria-labelledby={`comment-author-${comment.id}`}
        >
            <div className="flex justify-between items-start mb-3 sm:flex-col sm:items-start sm:gap-2">
                <div className="flex items-center gap-3 flex-1 sm:gap-2">
                    <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0 sm:w-9 sm:h-9 sm:text-base shadow-sm"
                        aria-hidden="true"
                    >
                        {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <h3
                            id={`comment-author-${comment.id}`}
                            className="m-0 text-base font-semibold text-gray-900 leading-tight truncate sm:text-sm dark:text-white"
                        >
                            {comment.author.name || comment.author.username}
                        </h3>
                        <time
                            dateTime={comment.createdAt}
                            className="text-xs text-gray-500 leading-tight sm:text-xs dark:text-gray-400"
                            title={formatDate(comment.createdAt, 'full')}
                        >
                            {formatDate(comment.createdAt, 'relative')}
                        </time>
                        {isNewComment && (
                            <span className="inline-flex items-center bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1 uppercase tracking-wide sm:mt-1 sm:ml-0 dark:bg-green-900/30 dark:text-green-400">
                                NEW
                            </span>
                        )}
                        {hasRealtimeUpdate && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 ml-1 sm:mt-1 sm:ml-0 dark:text-blue-400" title="Updated in real-time">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Live
                            </span>
                        )}
                    </div>
                </div>

                {isAuthor && (
                    <CommentActions
                        commentId={comment.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        size="small"
                    />
                )}
            </div>

            <div className="mb-4 leading-relaxed break-words sm:mb-3 sm:text-sm">
                <p className="m-0 whitespace-pre-wrap">{comment.content}</p>

                {comment.updatedAt !== comment.createdAt && (
                    <div className="mt-1 italic text-gray-400 text-xs sm:text-xs dark:text-gray-500">
                        <small>(edited)</small>
                    </div>
                )}
            </div>

            <div className="mt-4 sm:mt-3">
                <div className="flex items-center gap-3 flex-wrap sm:gap-2 sm:justify-start">
                    <LikeButton
                        likeCount={getLikeCount()}
                        dislikeCount={getDislikeCount()}
                        userLikeStatus={getUserLikeStatus() as 'like' | 'dislike' | null}
                        onLike={() => handleLike('like')}
                        onDislike={() => handleLike('dislike')}
                        disabled={!user || isLikeLoading}
                        size="small"
                        ariaLabel={`Like or dislike comment by ${comment.author.username}`}
                        hasRealtimeUpdate={hasRealtimeUpdate}
                    />

                    {!isReply && level < maxNestingLevel && (
                        <button
                            className="px-3 py-1.5 bg-transparent text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed sm:px-2 sm:py-1 sm:text-xs dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400 dark:focus:ring-blue-400"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            aria-expanded={showReplyForm}
                            aria-controls={`reply-form-${comment.id}`}
                        >
                            Reply
                        </button>
                    )}

                    {comment._count.replies > 0 && !isReply && (
                        <button
                            className="px-3 py-1.5 bg-transparent text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed sm:px-2 sm:py-1 sm:text-xs dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400 dark:focus:ring-blue-400"
                            onClick={toggleReplies}
                            aria-expanded={showRepliesList}
                            aria-controls={`replies-${comment.id}`}
                            disabled={isLoadingReplies}
                        >
                            {isLoadingReplies ? 'Loading...' :
                                showRepliesList ? 'Hide replies' :
                                    `View replies (${comment._count.replies})`}
                        </button>
                    )}
                </div>
            </div>

            {showReplyForm && (
                <div className="mt-4 sm:mt-3" id={`reply-form-${comment.id}`}>
                    <TypingIndicator commentId={comment.id} />
                    <ReplyForm
                        onSubmit={handleReply}
                        onCancel={() => setShowReplyForm(false)}
                        placeholder={`Reply to ${comment.author.username}...`}
                        ariaLabel={`Reply to ${comment.author.username}`}
                        commentId={comment.id}
                    />
                </div>
            )}

            {showReplies && showRepliesList && !isReply && (
                <div className="mt-4 sm:mt-3" id={`replies-${comment.id}`}>
                    {isLoadingReplies ? (
                        <div className="p-3 text-center text-gray-500 italic bg-gray-50 rounded-md mt-3 text-sm sm:p-2 sm:mt-2 sm:text-xs dark:bg-gray-700/50 dark:text-gray-400">
                            Loading replies...
                        </div>
                    ) : replies.length > 0 ? (
                        <div className="mt-3 sm:mt-2">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    isReply={true}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onReply={onReply}
                                    level={level + 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 text-center text-gray-500 italic bg-gray-50 rounded-md mt-3 text-sm sm:p-2 sm:mt-2 sm:text-xs dark:bg-gray-700/50 dark:text-gray-400">
                            No replies yet. Be the first to reply!
                        </div>
                    )}
                </div>
            )}
        </article>
    );
};

export default CommentItem;