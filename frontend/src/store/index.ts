import { configureStore } from '@reduxjs/toolkit';
import {
    authSlice,
    commentSlice,
    userSlice,
    uiSlice,
    likeSlice
} from './slices';
import websocketMiddleware from './middleware/websocketMiddleware';

// Configure the Redux store
export const store = configureStore({
    reducer: {
        auth: authSlice,
        comments: commentSlice,
        user: userSlice,
        ui: uiSlice,
        likes: likeSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['items.dates'],
            },
        }).concat(websocketMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
});

// Export the store type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export all slices
export { authSlice, commentSlice, userSlice, uiSlice, likeSlice } from './slices';

// Export UI actions for WebSocket
export {
    setConnectionStatus,
    addTypingUser,
    removeTypingUser,
} from './slices';

// Export comment actions for WebSocket
export {
    updateCommentInState,
    removeCommentFromState,
} from './slices';

// Export like actions for WebSocket
export {
    updateCommentLikeCounts,
    updateReplyLikeCounts,
} from './slices';

// Export all selectors
export * from './selectors';

// Export all hooks
export * from './hooks';

// Export error handling utilities
export * from './utils/errorHandler';

export default store;