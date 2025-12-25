import { Server as SocketIOServer } from 'socket.io';
import { emitToRoom, emitToUser } from '../config/socket';
import { CommentResponse } from '../types/comment';
import { LikeCounts } from '../types/like';
import {
    CommentCreatedEventData,
    CommentUpdatedEventData,
    CommentDeletedEventData,
    ReplyCreatedEventData,
    CommentLikedEventData,
    CommentDislikedEventData,
    CommentLikeRemovedEventData,
    ReplyLikedEventData,
    ReplyDislikedEventData,
    ReplyLikeRemovedEventData,
    TypingIndicatorEventData,
    NotificationEventData,
    CommentNotificationData,
    ReplyNotificationData
} from '../types/websocket';

export const COMMENT_EVENTS = {
    CREATED: 'comment:created',
    UPDATED: 'comment:updated',
    DELETED: 'comment:deleted',
    REPLY_CREATED: 'reply:created',
} as const;

export const LIKE_EVENTS = {
    COMMENT_LIKED: 'comment:liked',
    COMMENT_DISLIKED: 'comment:disliked',
    COMMENT_LIKE_REMOVED: 'comment:like_removed',
    REPLY_LIKED: 'reply:liked',
    REPLY_DISLIKED: 'reply:disliked',
    REPLY_LIKE_REMOVED: 'reply:like_removed',
} as const;

export const TYPING_EVENTS = {
    INDICATOR: 'typing:indicator',
} as const;

export const NOTIFICATION_EVENTS = {
    NEW: 'notification:new',
} as const;

/**
 * WebSocket service for handling real-time comment and like events.
 * Manages event emission for comments, replies, likes, and notifications.
 */
export class WebSocketService {
    /**
     * Creates a new WebSocketService instance.
     *
     * @param io - The Socket.IO server instance
     */
    constructor(private io: SocketIOServer) { }

    /**
     * Emits a comment created event to relevant rooms and notifies the author.
     *
     * @param comment - The created comment data
     * @param parentId - Optional parent comment ID for replies
     */
    emitCommentCreated(comment: CommentResponse, parentId?: string): void {
        const room = parentId ? `comment:${parentId}` : 'comment:general';

        const eventData: CommentCreatedEventData = {
            comment,
            parentId,
        };

        emitToRoom(this.io, room, COMMENT_EVENTS.CREATED, eventData);

        if (comment.author.id) {
            const notificationData: NotificationEventData = {
                type: 'comment_created',
                message: 'Your comment was posted successfully',
                data: comment,
            };
            emitToUser(this.io, comment.author.id, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a comment updated event to relevant rooms and notifies the author.
     *
     * @param comment - The updated comment data
     * @param parentId - Optional parent comment ID for replies
     */
    emitCommentUpdated(comment: CommentResponse, parentId?: string): void {
        const room = parentId ? `comment:${parentId}` : 'comment:general';

        const eventData: CommentUpdatedEventData = {
            comment,
            parentId,
        };

        emitToRoom(this.io, room, COMMENT_EVENTS.UPDATED, eventData);

        if (comment.author.id) {
            const notificationData: NotificationEventData = {
                type: 'comment_updated',
                message: 'Your comment was updated successfully',
                data: comment,
            };
            emitToUser(this.io, comment.author.id, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a comment deleted event to relevant rooms and notifies the author.
     *
     * @param commentId - The ID of the deleted comment
     * @param authorId - The ID of the comment author
     * @param parentId - Optional parent comment ID for replies
     */
    emitCommentDeleted(commentId: string, authorId: string, parentId?: string): void {
        const room = parentId ? `comment:${parentId}` : 'comment:general';

        const eventData: CommentDeletedEventData = {
            commentId,
            parentId,
        };

        emitToRoom(this.io, room, COMMENT_EVENTS.DELETED, eventData);

        const notificationData: NotificationEventData = {
            type: 'comment_deleted',
            message: 'Your comment was deleted successfully',
            data: { commentId },
        };
        emitToUser(this.io, authorId, NOTIFICATION_EVENTS.NEW, notificationData);
    }

    /**
     * Emits a reply created event to the parent comment room and notifies the author.
     *
     * @param reply - The created reply data
     * @param parentCommentId - The ID of the parent comment
     */
    emitReplyCreated(reply: CommentResponse, parentCommentId: string): void {
        const eventData: ReplyCreatedEventData = {
            reply,
            parentCommentId,
        };

        emitToRoom(this.io, `comment:${parentCommentId}`, COMMENT_EVENTS.REPLY_CREATED, eventData);

        if (reply.author.id) {
            const notificationData: NotificationEventData = {
                type: 'reply_created',
                message: 'Your reply was posted successfully',
                data: reply,
            };
            emitToUser(this.io, reply.author.id, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a comment liked event to relevant rooms and notifies the author.
     *
     * @param commentId - The ID of the liked comment
     * @param userId - The ID of the user who liked the comment
     * @param counts - The updated like counts
     * @param authorId - The ID of the comment author
     */
    emitCommentLiked(commentId: string, userId: string, counts: LikeCounts, authorId: string): void {
        const eventData: CommentLikedEventData = {
            commentId,
            userId,
            counts,
        };

        emitToRoom(this.io, `comment:${commentId}`, LIKE_EVENTS.COMMENT_LIKED, eventData);
        emitToRoom(this.io, 'comment:general', LIKE_EVENTS.COMMENT_LIKED, eventData);

        if (authorId !== userId) {
            const notificationData: NotificationEventData = {
                type: 'comment_liked',
                message: 'Someone liked your comment',
                data: { commentId, userId, counts } as CommentNotificationData,
            };
            emitToUser(this.io, authorId, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a comment disliked event to relevant rooms and notifies the author.
     *
     * @param commentId - The ID of the disliked comment
     * @param userId - The ID of the user who disliked the comment
     * @param counts - The updated like counts
     * @param authorId - The ID of the comment author
     */
    emitCommentDisliked(commentId: string, userId: string, counts: LikeCounts, authorId: string): void {
        const eventData: CommentDislikedEventData = {
            commentId,
            userId,
            counts,
        };

        emitToRoom(this.io, `comment:${commentId}`, LIKE_EVENTS.COMMENT_DISLIKED, eventData);
        emitToRoom(this.io, 'comment:general', LIKE_EVENTS.COMMENT_DISLIKED, eventData);

        if (authorId !== userId) {
            const notificationData: NotificationEventData = {
                type: 'comment_disliked',
                message: 'Someone disliked your comment',
                data: { commentId, userId, counts } as CommentNotificationData,
            };
            emitToUser(this.io, authorId, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a comment like removed event to relevant rooms and notifies the author.
     *
     * @param commentId - The ID of the comment
     * @param userId - The ID of the user who removed their like
     * @param counts - The updated like counts
     * @param authorId - The ID of the comment author
     */
    emitCommentLikeRemoved(commentId: string, userId: string, counts: LikeCounts, authorId: string): void {
        const eventData: CommentLikeRemovedEventData = {
            commentId,
            userId,
            counts,
        };

        emitToRoom(this.io, `comment:${commentId}`, LIKE_EVENTS.COMMENT_LIKE_REMOVED, eventData);
        emitToRoom(this.io, 'comment:general', LIKE_EVENTS.COMMENT_LIKE_REMOVED, eventData);

        if (authorId !== userId) {
            const notificationData: NotificationEventData = {
                type: 'comment_like_removed',
                message: 'Someone removed their like from your comment',
                data: { commentId, userId, counts } as CommentNotificationData,
            };
            emitToUser(this.io, authorId, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a reply liked event to relevant rooms and notifies the author.
     *
     * @param replyId - The ID of the liked reply
     * @param userId - The ID of the user who liked the reply
     * @param counts - The updated like counts
     * @param authorId - The ID of the reply author
     */
    emitReplyLiked(replyId: string, userId: string, counts: LikeCounts, authorId: string): void {
        const eventData: ReplyLikedEventData = {
            replyId,
            userId,
            counts,
        };

        emitToRoom(this.io, `comment:${replyId}`, LIKE_EVENTS.REPLY_LIKED, eventData);
        emitToRoom(this.io, 'comment:general', LIKE_EVENTS.REPLY_LIKED, eventData);

        if (authorId !== userId) {
            const notificationData: NotificationEventData = {
                type: 'reply_liked',
                message: 'Someone liked your reply',
                data: { replyId, userId, counts } as ReplyNotificationData,
            };
            emitToUser(this.io, authorId, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a reply disliked event to relevant rooms and notifies the author.
     *
     * @param replyId - The ID of the disliked reply
     * @param userId - The ID of the user who disliked the reply
     * @param counts - The updated like counts
     * @param authorId - The ID of the reply author
     */
    emitReplyDisliked(replyId: string, userId: string, counts: LikeCounts, authorId: string): void {
        const eventData: ReplyDislikedEventData = {
            replyId,
            userId,
            counts,
        };

        emitToRoom(this.io, `comment:${replyId}`, LIKE_EVENTS.REPLY_DISLIKED, eventData);
        emitToRoom(this.io, 'comment:general', LIKE_EVENTS.REPLY_DISLIKED, eventData);

        if (authorId !== userId) {
            const notificationData: NotificationEventData = {
                type: 'reply_disliked',
                message: 'Someone disliked your reply',
                data: { replyId, userId, counts } as ReplyNotificationData,
            };
            emitToUser(this.io, authorId, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a reply like removed event to relevant rooms and notifies the author.
     *
     * @param replyId - The ID of the reply
     * @param userId - The ID of the user who removed their like
     * @param counts - The updated like counts
     * @param authorId - The ID of the reply author
     */
    emitReplyLikeRemoved(replyId: string, userId: string, counts: LikeCounts, authorId: string): void {
        const eventData: ReplyLikeRemovedEventData = {
            replyId,
            userId,
            counts,
        };

        emitToRoom(this.io, `comment:${replyId}`, LIKE_EVENTS.REPLY_LIKE_REMOVED, eventData);
        emitToRoom(this.io, 'comment:general', LIKE_EVENTS.REPLY_LIKE_REMOVED, eventData);

        if (authorId !== userId) {
            const notificationData: NotificationEventData = {
                type: 'reply_like_removed',
                message: 'Someone removed their like from your reply',
                data: { replyId, userId, counts } as ReplyNotificationData,
            };
            emitToUser(this.io, authorId, NOTIFICATION_EVENTS.NEW, notificationData);
        }
    }

    /**
     * Emits a typing indicator event to a comment room.
     *
     * @param commentId - The ID of the comment being replied to
     * @param userId - The ID of the user typing
     * @param isTyping - Whether the user is currently typing
     */
    emitTypingIndicator(commentId: string, userId: string, isTyping: boolean): void {
        const eventData: TypingIndicatorEventData = {
            userId,
            isTyping,
        };

        emitToRoom(this.io, `comment:${commentId}`, TYPING_EVENTS.INDICATOR, eventData);
    }
}

let webSocketService: WebSocketService;

/**
 * Initializes the WebSocket service with a Socket.IO server instance.
 *
 * @param io - The Socket.IO server instance
 * @returns WebSocketService - The initialized WebSocket service instance
 */
export const initializeWebSocketService = (io: SocketIOServer): WebSocketService => {
    webSocketService = new WebSocketService(io);
    return webSocketService;
};

/**
 * Retrieves the initialized WebSocket service instance.
 *
 * @returns WebSocketService - The WebSocket service instance
 * @throws Error if the service has not been initialized
 */
export const getWebSocketService = (): WebSocketService => {
    if (!webSocketService) {
        throw new Error('WebSocket service not initialized. Call initializeWebSocketService first.');
    }
    return webSocketService;
};