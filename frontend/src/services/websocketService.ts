import { io, Socket } from 'socket.io-client';
import type { AppDispatch } from '../store';
import {
    setConnectionStatus,
    addTypingUser,
    removeTypingUser,
    addNotification
} from '../store/slices/uiSlice';
import {
    updateCommentInState,
    addCommentToState,
    addReplyToState,
    removeCommentFromState
} from '../store/slices/commentSlice';
import {
    updateCommentLikeCounts,
    updateReplyLikeCounts
} from '../store/slices/likeSlice';
import { CommentResponse } from '../types/comment';
import { LikeCounts } from '../types/like';
import { SocketEvents, ConnectionStatus } from '../types/websocket';

/**
 * Comment created event data
 */
interface CommentCreatedEventData {
    comment: CommentResponse;
    parentId?: string;
}

/**
 * Comment updated event data
 */
interface CommentUpdatedEventData {
    comment: CommentResponse;
    parentId?: string;
}

/**
 * Comment deleted event data
 */
interface CommentDeletedEventData {
    commentId: string;
    parentId?: string;
}

/**
 * Reply created event data
 */
interface ReplyCreatedEventData {
    reply: CommentResponse;
    parentCommentId: string;
}

/**
 * Comment liked/disliked/like removed event data
 */
interface CommentLikeEventData {
    commentId: string;
    userId: string;
    counts: LikeCounts;
}

/**
 * Reply liked/disliked/like removed event data
 */
interface ReplyLikeEventData {
    replyId: string;
    userId: string;
    counts: LikeCounts;
}

/**
 * Typing indicator event data
 */
interface TypingIndicatorEventData {
    userId: string;
    isTyping: boolean;
    commentId?: string;
}

/**
 * Notification event data
 */
interface NotificationEventData {
    type: string;
    message: string;
    data?: unknown;
}

/**
 * Service class for managing WebSocket connections and events
 */
class WebSocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private typingTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private isReconnecting = false;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() { }

    /**
     * Initializes the WebSocket connection
     * @param dispatch - Redux dispatch function
     */
    private initializeSocket(dispatch: AppDispatch): void {
        console.log('[WebSocketService] initializeSocket called');

        const token = localStorage.getItem('token');
        console.log('[WebSocketService] Token from localStorage:', token ? 'exists' : 'not found');

        if (!token) {
            console.warn('[WebSocketService] No auth token available for WebSocket connection');
            dispatch(setConnectionStatus(ConnectionStatus.ERROR));
            return;
        }

        console.log('[WebSocketService] Creating socket connection...');
        this.socket = io('/', {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
        });

        console.log('[WebSocketService] Socket created, setting up event listeners...');
        this.setupEventListeners(dispatch);
    }

    /**
     * Sets up all WebSocket event listeners
     * @param dispatch - Redux dispatch function
     */
    private setupEventListeners(dispatch: AppDispatch): void {
        if (!this.socket) {
            console.error('[WebSocketService] setupEventListeners called but socket is null');
            return;
        }

        console.log('[WebSocketService] Setting up event listeners...');

        this.socket.on(SocketEvents.CONNECT, () => {
            console.log('[WebSocketService] CONNECT event received');
            this.reconnectAttempts = 0;
            dispatch(setConnectionStatus(ConnectionStatus.CONNECTED));
        });

        this.socket.on(SocketEvents.DISCONNECT, (reason: string) => {
            console.log('[WebSocketService] DISCONNECT event received, reason:', reason);
            dispatch(setConnectionStatus(ConnectionStatus.DISCONNECTED));

            if (!this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.attemptReconnect(dispatch);
            }
        });

        this.socket.on(SocketEvents.CONNECT_ERROR, (error: Error) => {
            console.error('[WebSocketService] CONNECT_ERROR event received:', error);
            dispatch(setConnectionStatus(ConnectionStatus.ERROR));
        });

        this.socket.on(SocketEvents.RECONNECT, (attemptNumber: number) => {
            console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
            dispatch(setConnectionStatus(ConnectionStatus.CONNECTED));
        });

        this.socket.on(SocketEvents.RECONNECT_ERROR, (error: Error) => {
            console.error('WebSocket reconnection error:', error);
            dispatch(setConnectionStatus(ConnectionStatus.RECONNECTING));
        });

        this.socket.on(SocketEvents.RECONNECT_FAILED, () => {
            console.error('WebSocket reconnection failed');
            dispatch(setConnectionStatus(ConnectionStatus.ERROR));
        });

        this.socket.on(SocketEvents.COMMENT_CREATED, (data: CommentCreatedEventData) => {
            console.log('[WebSocketService] New comment received:', data);
            dispatch(addCommentToState(data.comment));
        });

        this.socket.on(SocketEvents.COMMENT_UPDATED, (data: CommentUpdatedEventData) => {
            console.log('[WebSocketService] Comment updated:', data);
            dispatch(updateCommentInState(data.comment));
        });

        this.socket.on(SocketEvents.COMMENT_DELETED, (data: CommentDeletedEventData) => {
            console.log('[WebSocketService] Comment deleted:', data);
            dispatch(removeCommentFromState(data.commentId));
        });

        this.socket.on(SocketEvents.REPLY_CREATED, (data: ReplyCreatedEventData) => {
            console.log('[WebSocketService] New reply received:', data);
            dispatch(addReplyToState({
                parentId: data.parentCommentId,
                reply: data.reply
            }));
        });

        this.socket.on(SocketEvents.COMMENT_LIKED, (data: CommentLikeEventData) => {
            console.log('[WebSocketService] COMMENT_LIKED event received:', JSON.stringify(data, null, 2));
            console.log('[WebSocketService] Dispatching updateCommentLikeCounts with:', { commentId: data.commentId, counts: data.counts });
            dispatch(updateCommentLikeCounts({
                commentId: data.commentId,
                counts: data.counts,
            }));
        });

        this.socket.on(SocketEvents.COMMENT_DISLIKED, (data: CommentLikeEventData) => {
            console.log('[WebSocketService] COMMENT_DISLIKED event received:', JSON.stringify(data, null, 2));
            console.log('[WebSocketService] Dispatching updateCommentLikeCounts with:', { commentId: data.commentId, counts: data.counts });
            dispatch(updateCommentLikeCounts({
                commentId: data.commentId,
                counts: data.counts,
            }));
        });

        this.socket.on(SocketEvents.COMMENT_LIKE_REMOVED, (data: CommentLikeEventData) => {
            console.log('[WebSocketService] COMMENT_LIKE_REMOVED event received:', JSON.stringify(data, null, 2));
            console.log('[WebSocketService] Dispatching updateCommentLikeCounts with:', { commentId: data.commentId, counts: data.counts });
            dispatch(updateCommentLikeCounts({
                commentId: data.commentId,
                counts: data.counts,
            }));
        });

        this.socket.on(SocketEvents.REPLY_LIKED, (data: ReplyLikeEventData) => {
            console.log('[WebSocketService] REPLY_LIKED event received:', JSON.stringify(data, null, 2));
            console.log('[WebSocketService] Dispatching updateReplyLikeCounts with:', { replyId: data.replyId, counts: data.counts });
            dispatch(updateReplyLikeCounts({
                replyId: data.replyId,
                counts: data.counts,
            }));
        });

        this.socket.on(SocketEvents.REPLY_DISLIKED, (data: ReplyLikeEventData) => {
            console.log('[WebSocketService] REPLY_DISLIKED event received:', JSON.stringify(data, null, 2));
            console.log('[WebSocketService] Dispatching updateReplyLikeCounts with:', { replyId: data.replyId, counts: data.counts });
            dispatch(updateReplyLikeCounts({
                replyId: data.replyId,
                counts: data.counts,
            }));
        });

        this.socket.on(SocketEvents.REPLY_LIKE_REMOVED, (data: ReplyLikeEventData) => {
            console.log('[WebSocketService] REPLY_LIKE_REMOVED event received:', JSON.stringify(data, null, 2));
            console.log('[WebSocketService] Dispatching updateReplyLikeCounts with:', { replyId: data.replyId, counts: data.counts });
            dispatch(updateReplyLikeCounts({
                replyId: data.replyId,
                counts: data.counts,
            }));
        });

        this.socket.on(SocketEvents.TYPING_INDICATOR, (data: TypingIndicatorEventData) => {
            console.log('Typing indicator:', data);
            if (data.isTyping) {
                dispatch(addTypingUser({
                    userId: data.userId,
                    commentId: data.commentId || 'general',
                }));
            } else {
                dispatch(removeTypingUser({
                    userId: data.userId,
                    commentId: data.commentId || 'general',
                }));
            }
        });

        this.socket.on(SocketEvents.NOTIFICATION_NEW, (data: NotificationEventData) => {
            console.log('New notification:', data);
            dispatch(addNotification({
                type: 'info',
                title: 'New Notification',
                message: data.message,
                dismissible: true,
            }));
        });
    }

    /**
     * Joins a specific comment room
     * @param commentId - The ID of the comment room to join
     */
    public joinCommentRoom(commentId: string): void {
        console.log('[WebSocketService] joinCommentRoom called for commentId:', commentId, 'socket connected:', this.socket?.connected);
        if (this.socket && this.socket.connected) {
            this.socket.emit('join:comment', commentId);
            console.log('[WebSocketService] join:comment event emitted for commentId:', commentId);
        } else {
            console.warn('[WebSocketService] Cannot join comment room - socket not connected');
        }
    }

    /**
     * Leaves a specific comment room
     * @param commentId - The ID of the comment room to leave
     */
    public leaveCommentRoom(commentId: string): void {
        console.log('[WebSocketService] leaveCommentRoom called for commentId:', commentId);
        if (this.socket && this.socket.connected) {
            this.socket.emit('leave:comment', commentId);
        }
    }

    /**
     * Joins the general room for receiving new top-level comments
     */
    public joinGeneralRoom(): void {
        console.log('[WebSocketService] joinGeneralRoom called, socket connected:', this.socket?.connected);
        if (this.socket && this.socket.connected) {
            this.socket.emit('join:comment', 'general');
            console.log('[WebSocketService] Joined general room');
        } else {
            console.warn('[WebSocketService] Cannot join general room - socket not connected');
        }
    }

    /**
     * Leaves the general room
     */
    public leaveGeneralRoom(): void {
        console.log('[WebSocketService] leaveGeneralRoom called');
        if (this.socket && this.socket.connected) {
            this.socket.emit('leave:comment', 'general');
        }
    }

    /**
     * Starts typing indicator for a comment
     * @param commentId - The ID of the comment being typed on
     */
    public startTyping(commentId: string): void {
        if (this.socket && this.socket.connected) {
            const existingTimeout = this.typingTimeouts.get(commentId);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            const debounceTimeout = this.typingTimeouts.get(commentId);
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }

            const newTimeout = setTimeout(() => {
                this.socket?.emit('typing:start', { commentId });

                const stopTimeout = setTimeout(() => {
                    this.stopTyping(commentId);
                }, 3000);

                this.typingTimeouts.set(commentId, stopTimeout);
            }, 300);

            this.typingTimeouts.set(commentId, newTimeout);
        }
    }

    /**
     * Stops typing indicator for a comment
     * @param commentId - The ID of the comment
     */
    public stopTyping(commentId: string): void {
        if (this.socket && this.socket.connected) {
            const timeout = this.typingTimeouts.get(commentId);
            if (timeout) {
                clearTimeout(timeout);
                this.typingTimeouts.delete(commentId);
            }

            this.socket.emit('typing:stop', { commentId });
        }
    }

    /**
     * Disconnects the WebSocket connection
     */
    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Attempts to reconnect with exponential backoff
     * @param dispatch - Redux dispatch function
     */
    private attemptReconnect(dispatch: AppDispatch): void {
        if (this.isReconnecting) return;

        this.isReconnecting = true;
        this.reconnectAttempts++;

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        const maxDelay = 30000;

        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${Math.min(delay, maxDelay)}ms`);
        dispatch(setConnectionStatus(ConnectionStatus.RECONNECTING));

        this.reconnectTimer = setTimeout(() => {
            this.disconnect();
            this.initializeSocket(dispatch);
            this.isReconnecting = false;
        }, Math.min(delay, maxDelay));
    }

    /**
     * Manually reconnects the WebSocket
     * @param dispatch - Redux dispatch function
     */
    public reconnect(dispatch: AppDispatch): void {
        this.reconnectAttempts = 0;
        this.isReconnecting = false;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.disconnect();
        this.initializeSocket(dispatch);
    }

    /**
     * Initializes the WebSocket service
     * @param dispatch - Redux dispatch function
     */
    public initialize(dispatch: AppDispatch): void {
        console.log('[WebSocketService] initialize called');
        if (this.socket) {
            console.log('[WebSocketService] Socket already initialized, skipping');
            return;
        }
        console.log('[WebSocketService] Calling initializeSocket...');
        this.initializeSocket(dispatch);
    }

    /**
     * Checks if the socket is connected
     * @returns True if connected, false otherwise
     */
    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Gets the socket instance
     * @returns The socket instance or null
     */
    public getSocket(): Socket | null {
        return this.socket;
    }
}

let websocketServiceInstance: WebSocketService | null = null;

/**
 * Gets the WebSocket service singleton instance
 * @returns The WebSocket service instance
 */
export const getWebSocketService = (): WebSocketService => {
    if (!websocketServiceInstance) {
        websocketServiceInstance = new WebSocketService();
    }
    return websocketServiceInstance;
};

export default getWebSocketService;