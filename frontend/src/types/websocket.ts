/**
 * WebSocket event types
 */
export enum SocketEvents {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CONNECT_ERROR = 'connect_error',
    RECONNECT = 'reconnect',
    RECONNECT_ERROR = 'reconnect_error',
    RECONNECT_FAILED = 'reconnect_failed',
    COMMENT_CREATED = 'comment:created',
    COMMENT_UPDATED = 'comment:updated',
    COMMENT_DELETED = 'comment:deleted',
    REPLY_CREATED = 'reply:created',
    COMMENT_LIKED = 'comment:liked',
    COMMENT_DISLIKED = 'comment:disliked',
    COMMENT_LIKE_REMOVED = 'comment:like_removed',
    REPLY_LIKED = 'reply:liked',
    REPLY_DISLIKED = 'reply:disliked',
    REPLY_LIKE_REMOVED = 'reply:like_removed',
    TYPING_INDICATOR = 'typing:indicator',
    NOTIFICATION_NEW = 'notification:new',
}

/**
 * Connection status enumeration
 */
export enum ConnectionStatus {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error',
}