import { AuthState } from './auth';
import { CommentResponse, CommentListResponse } from './comment';
import { UserProfile } from './user';
import { LikeStatus, LikeCounts } from './like';
import { PaginationMetadata } from './pagination';
import { ConnectionStatus } from './websocket';

// Root state interface for Redux store
export interface RootState {
    auth: AuthState;
    comments: CommentState;
    user: UserState;
    ui: UIState;
    likes: LikeState;
}

// Authentication state (re-exporting from auth.ts)
export type { AuthState };

// Comment state interface
export interface CommentState {
    comments: CommentResponse[];
    currentComment: CommentResponse | null;
    replies: Record<string, CommentResponse[]>; // Keyed by parent comment ID
    pagination: PaginationMetadata | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    totalCount: number;
}

// User state interface
export interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
}

// UI state interface
export interface UIState {
    isLoading: boolean;
    notifications: Notification[];
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    // WebSocket connection state
    connectionStatus: ConnectionStatus;
    // Typing indicators
    typingUsers: Record<string, string[]>; // Keyed by comment ID, array of user IDs
}

// Notification interface
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number; // in milliseconds, auto-dismiss if provided
    timestamp: number;
    dismissible: boolean;
}

// Like state interface
export interface LikeState {
    // Keyed by comment ID, stores like status and counts
    commentLikes: Record<string, LikeCounts>;
    // Keyed by reply ID, stores like status and counts
    replyLikes: Record<string, LikeCounts>;
    isLoading: boolean;
    error: string | null;
}

// API Request state interface
export interface ApiRequestState {
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
}

// Async thunk status
export type AsyncThunkStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

// Async thunk state
export interface AsyncThunkState<T = any> {
    data: T | null;
    status: AsyncThunkStatus;
    error: string | null;
}

// Redux action types with payload
export interface PayloadAction<T = any> {
    type: string;
    payload: T;
}

// Error action payload
export interface ErrorPayload {
    message: string;
    code?: string;
    details?: any;
}