import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification } from '../../types';
import { ConnectionStatus } from '../../types/websocket';

// Initial state
const initialState: UIState = {
    isLoading: false,
    notifications: [],
    theme: 'light',
    sidebarOpen: false,
    connectionStatus: ConnectionStatus.DISCONNECTED,
    typingUsers: {},
};

// Create the slice
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Set global loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Add a notification
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
            const notification: Notification = {
                ...action.payload,
                id: Date.now().toString(),
                timestamp: Date.now(),
            };
            state.notifications.push(notification);
        },

        // Remove a notification by ID
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            );
        },

        // Clear all notifications
        clearNotifications: (state) => {
            state.notifications = [];
        },

        // Toggle theme
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },

        // Set theme
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },

        // Toggle sidebar
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },

        // Set sidebar state
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },

        // Show success notification (convenience method)
        showSuccess: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
            const notification: Notification = {
                type: 'success',
                title: action.payload.title,
                message: action.payload.message,
                duration: action.payload.duration || 3000,
                id: Date.now().toString(),
                timestamp: Date.now(),
                dismissible: true,
            };
            state.notifications.push(notification);
        },

        // Show error notification (convenience method)
        showError: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
            const notification: Notification = {
                type: 'error',
                title: action.payload.title,
                message: action.payload.message,
                duration: action.payload.duration || 5000,
                id: Date.now().toString(),
                timestamp: Date.now(),
                dismissible: true,
            };
            state.notifications.push(notification);
        },

        // Show warning notification (convenience method)
        showWarning: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
            const notification: Notification = {
                type: 'warning',
                title: action.payload.title,
                message: action.payload.message,
                duration: action.payload.duration || 4000,
                id: Date.now().toString(),
                timestamp: Date.now(),
                dismissible: true,
            };
            state.notifications.push(notification);
        },

        // Show info notification (convenience method)
        showInfo: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
            const notification: Notification = {
                type: 'info',
                title: action.payload.title,
                message: action.payload.message,
                duration: action.payload.duration || 3000,
                id: Date.now().toString(),
                timestamp: Date.now(),
                dismissible: true,
            };
            state.notifications.push(notification);
        },

        // Set WebSocket connection status
        setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
            state.connectionStatus = action.payload;
        },

        // Add typing user
        addTypingUser: (state, action: PayloadAction<{ userId: string; commentId: string }>) => {
            const { userId, commentId } = action.payload;
            if (!state.typingUsers[commentId]) {
                state.typingUsers[commentId] = [];
            }
            if (!state.typingUsers[commentId].includes(userId)) {
                state.typingUsers[commentId].push(userId);
            }
        },

        // Remove typing user
        removeTypingUser: (state, action: PayloadAction<{ userId: string; commentId: string }>) => {
            const { userId, commentId } = action.payload;
            if (state.typingUsers[commentId]) {
                state.typingUsers[commentId] = state.typingUsers[commentId].filter(
                    (id) => id !== userId
                );
                // Clean up empty arrays
                if (state.typingUsers[commentId].length === 0) {
                    delete state.typingUsers[commentId];
                }
            }
        },

        // Reset UI state
        resetUIState: () => initialState,
    },
});

export const {
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setConnectionStatus,
    addTypingUser,
    removeTypingUser,
    resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;