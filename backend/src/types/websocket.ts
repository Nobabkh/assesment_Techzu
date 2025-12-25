import { CommentResponse } from './comment';
import { LikeCounts } from './like';

export interface CommentCreatedEventData {
    comment: CommentResponse;
    parentId?: string;
}

export interface CommentUpdatedEventData {
    comment: CommentResponse;
    parentId?: string;
}

export interface CommentDeletedEventData {
    commentId: string;
    parentId?: string;
}

export interface ReplyCreatedEventData {
    reply: CommentResponse;
    parentCommentId: string;
}

export interface CommentLikedEventData {
    commentId: string;
    userId: string;
    counts: LikeCounts;
}

export interface CommentDislikedEventData {
    commentId: string;
    userId: string;
    counts: LikeCounts;
}

export interface CommentLikeRemovedEventData {
    commentId: string;
    userId: string;
    counts: LikeCounts;
}

export interface ReplyLikedEventData {
    replyId: string;
    userId: string;
    counts: LikeCounts;
}

export interface ReplyDislikedEventData {
    replyId: string;
    userId: string;
    counts: LikeCounts;
}

export interface ReplyLikeRemovedEventData {
    replyId: string;
    userId: string;
    counts: LikeCounts;
}

export interface TypingIndicatorEventData {
    userId: string;
    isTyping: boolean;
}

export type NotificationType =
    | 'comment_created'
    | 'comment_updated'
    | 'comment_deleted'
    | 'reply_created'
    | 'comment_liked'
    | 'comment_disliked'
    | 'comment_like_removed'
    | 'reply_liked'
    | 'reply_disliked'
    | 'reply_like_removed';

export interface NotificationEventData {
    type: NotificationType;
    message: string;
    data: unknown;
}

export interface CommentNotificationData {
    commentId?: string;
    userId?: string;
    counts?: LikeCounts;
}

export interface ReplyNotificationData {
    replyId?: string;
    userId?: string;
    counts?: LikeCounts;
}