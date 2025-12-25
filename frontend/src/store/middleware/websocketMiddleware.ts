import { Middleware, MiddlewareAPI, Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { RootState } from '../../types/store';
import {
    setConnectionStatus,
    addTypingUser,
    removeTypingUser
} from '../slices/uiSlice';
import {
    updateCommentInState,
    removeCommentFromState
} from '../slices/commentSlice';
import {
    updateCommentLikeCounts,
    updateReplyLikeCounts
} from '../slices/likeSlice';
import {
    showNewCommentNotification,
    showNewLikeNotification,
    showCommentDeletedNotification
} from '../../components/NotificationSystem';
import { ConnectionStatus } from '../../types/websocket';

// WebSocket event payload types
interface CommentCreatedPayload {
    comment: any;
    user: {
        id: string;
        name?: string;
        username: string;
    };
}

interface CommentUpdatedPayload {
    comment: any;
}

interface CommentDeletedPayload {
    commentId: string;
}

interface LikeEventPayload {
    commentId?: string;
    replyId?: string;
    counts: any;
    user: {
        id: string;
        name?: string;
        username: string;
    };
}

interface TypingEventPayload {
    commentId: string;
    userId: string;
}

// Type guard to check if action has payload
function hasPayload(action: UnknownAction): action is UnknownAction & { payload: any } {
    return 'payload' in action;
}

// Throttling mechanism for high-frequency events
class EventThrottler {
    private lastEventTime = 0;
    private throttleDelay = 1000; // 1 second throttle for most events

    shouldThrottle(eventType: string): boolean {
        const now = Date.now();
        const timeSinceLastEvent = now - this.lastEventTime;

        // Don't throttle typing events
        if (eventType.includes('typing')) {
            this.lastEventTime = now;
            return false;
        }

        // Throttle other events
        if (timeSinceLastEvent < this.throttleDelay) {
            return true;
        }

        this.lastEventTime = now;
        return false;
    }
}

const throttler = new EventThrottler();

// WebSocket middleware to handle real-time events
const websocketMiddleware: Middleware<{}, RootState> = (store: MiddlewareAPI<Dispatch, RootState>) => (next) => (action: unknown) => {
    const typedAction = action as UnknownAction;

    // Check if this is a WebSocket event
    if (typedAction.type.startsWith('websocket/')) {
        const eventType = typedAction.type.replace('websocket/', '');

        // Extract payload if it exists
        const payload = hasPayload(typedAction) ? typedAction.payload : undefined;

        // Skip throttled events
        if (throttler.shouldThrottle(eventType)) {
            return next(action);
        }

        switch (eventType) {
            case 'connected':
                store.dispatch(setConnectionStatus(ConnectionStatus.CONNECTED));
                break;

            case 'disconnected':
                store.dispatch(setConnectionStatus(ConnectionStatus.DISCONNECTED));
                break;

            case 'connecting':
                store.dispatch(setConnectionStatus(ConnectionStatus.CONNECTING));
                break;

            case 'reconnecting':
                store.dispatch(setConnectionStatus(ConnectionStatus.RECONNECTING));
                break;

            case 'error':
                store.dispatch(setConnectionStatus(ConnectionStatus.ERROR));
                break;

            case 'comment_created':
                handleCommentCreated(store, payload as CommentCreatedPayload);
                break;

            case 'comment_updated':
                handleCommentUpdated(store, payload as CommentUpdatedPayload);
                break;

            case 'comment_deleted':
                handleCommentDeleted(store, payload as CommentDeletedPayload);
                break;

            case 'like_added':
            case 'like_removed':
            case 'dislike_added':
            case 'dislike_removed':
                handleLikeEvent(store, payload as LikeEventPayload);
                break;

            case 'typing_started':
                handleTypingStarted(store, payload as TypingEventPayload);
                break;

            case 'typing_stopped':
                handleTypingStopped(store, payload as TypingEventPayload);
                break;

            default:
                console.warn(`Unknown WebSocket event type: ${eventType}`);
        }
    }

    return next(action);
};

// Handle new comment creation
const handleCommentCreated = (store: MiddlewareAPI<Dispatch, RootState>, payload: CommentCreatedPayload) => {
    const { comment, user } = payload;
    const state = store.getState();
    const currentUser = state.auth.user;

    // Don't show notification for own comments
    if (currentUser?.id !== user.id) {
        showNewCommentNotification(user.name || user.username);
    }

    // Update comment in state
    store.dispatch(updateCommentInState(comment));
};

// Handle comment updates
const handleCommentUpdated = (store: MiddlewareAPI<Dispatch, RootState>, payload: CommentUpdatedPayload) => {
    const { comment } = payload;
    store.dispatch(updateCommentInState(comment));
};

// Handle comment deletion
const handleCommentDeleted = (store: MiddlewareAPI<Dispatch, RootState>, payload: CommentDeletedPayload) => {
    const { commentId } = payload;
    showCommentDeletedNotification();
    store.dispatch(removeCommentFromState(commentId));
};

// Handle like events
const handleLikeEvent = (store: MiddlewareAPI<Dispatch, RootState>, payload: LikeEventPayload) => {
    const { commentId, replyId, counts, user } = payload;
    const state = store.getState();
    const currentUser = state.auth.user;

    // Don't show notification for own likes
    if (currentUser?.id !== user.id) {
        showNewLikeNotification(user.name || user.username);
    }

    // Update like counts in state
    if (commentId) {
        store.dispatch(updateCommentLikeCounts({ commentId, counts }));
    } else if (replyId) {
        store.dispatch(updateReplyLikeCounts({ replyId, counts }));
    }
};

// Handle typing started events
const handleTypingStarted = (store: MiddlewareAPI<Dispatch, RootState>, payload: TypingEventPayload) => {
    const { commentId, userId } = payload;
    const state = store.getState();
    const currentUser = state.auth.user;

    // Don't track own typing
    if (currentUser?.id !== userId) {
        store.dispatch(addTypingUser({ commentId, userId }));
    }
};

// Handle typing stopped events
const handleTypingStopped = (store: MiddlewareAPI<Dispatch, RootState>, payload: TypingEventPayload) => {
    const { commentId, userId } = payload;
    const state = store.getState();
    const currentUser = state.auth.user;

    // Don't track own typing
    if (currentUser?.id !== userId) {
        store.dispatch(removeTypingUser({ commentId, userId }));
    }
};

export default websocketMiddleware;