import React, { useState, useEffect } from 'react';
import { AppError, ErrorSeverity, errorHandler } from '../utils/errorHandler';
import { useAppSelector } from '../store';
import { ConnectionStatus } from '../types/websocket';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    isPersistent?: boolean;
    isRealtime?: boolean; // For real-time event notifications
}

const NotificationSystem: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { connectionStatus } = useAppSelector((state: any) => state.ui);

    // Add a new notification
    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove notification after duration (default 5 seconds)
        if (!notification.isPersistent && notification.duration !== 0) {
            const duration = notification.duration || 5000;
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    };

    // Remove a notification
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Convert AppError to notification
    const showErrorNotification = (error: AppError) => {
        let type: 'error' | 'warning' | 'info' = 'error';
        let title = 'Error';

        switch (error.type) {
            case 'VALIDATION':
                type = 'warning';
                title = 'Validation Error';
                break;
            case 'AUTHENTICATION':
                type = 'warning';
                title = 'Authentication Error';
                break;
            case 'AUTHORIZATION':
                type = 'warning';
                title = 'Authorization Error';
                break;
            case 'NETWORK':
                type = 'error';
                title = 'Network Error';
                break;
            case 'SERVER':
                type = 'error';
                title = 'Server Error';
                break;
            default:
                type = 'error';
                title = 'Error';
        }

        // Set duration based on severity
        let duration = 5000;
        let isPersistent = false;

        switch (error.severity) {
            case 'low':
                duration = 3000;
                break;
            case 'medium':
                duration = 5000;
                break;
            case 'high':
                duration = 8000;
                break;
            case 'critical':
                duration = 0; // Don't auto-dismiss
                isPersistent = true;
                break;
        }

        addNotification({
            type,
            title,
            message: error.userFriendlyMessage,
            duration,
            isPersistent
        });
    };

    // Show success notification
    const showSuccessNotification = (message: string, title = 'Success') => {
        addNotification({
            type: 'success',
            title,
            message,
            duration: 3000
        });
    };

    // Show info notification
    const showInfoNotification = (message: string, title = 'Information') => {
        addNotification({
            type: 'info',
            title,
            message,
            duration: 4000
        });
    };

    // Show warning notification
    const showWarningNotification = (message: string, title = 'Warning') => {
        addNotification({
            type: 'warning',
            title,
            message,
            duration: 6000
        });
    };

    // Subscribe to error handler
    useEffect(() => {
        const unsubscribe = errorHandler.subscribe((error: AppError) => {
            showErrorNotification(error);
        });

        return unsubscribe;
    }, []);

    // Make notification methods globally available
    useEffect(() => {
        // Attach to window for global access
        (window as any).notificationSystem = {
            success: showSuccessNotification,
            error: showErrorNotification,
            info: showInfoNotification,
            warning: showWarningNotification
        };
    }, []);

    return (
        <div className="fixed top-5 right-5 z-[1000] max-w-[400px] md:max-w-[400px] xs:top-2.5 xs:right-2.5 xs:left-2.5 xs:max-w-none">
            {/* Connection status indicator */}
            {connectionStatus === ConnectionStatus.DISCONNECTED && (
                <div className="bg-white rounded-md mb-4 p-0 overflow-hidden animate-[slideIn_0.3s_ease-out] transition-all border-l-4 border-warning relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-warning to-yellow-300 animate-[realtimePulse_2s_infinite]"></div>
                    <div className="p-4 bg-opacity-5 bg-warning">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="m-0 text-base font-semibold">Connection Lost</h4>
                            <button
                                className="bg-none border-none text-xl leading-none text-secondary cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-opacity-10 hover:bg-secondary hover:text-dark"
                                onClick={() => removeNotification('connection-lost')}
                                aria-label="Close notification"
                            >
                                &times;
                            </button>
                        </div>
                        <p className="m-0 text-sm leading-6">Real-time updates are unavailable. Check your connection.</p>
                    </div>
                </div>
            )}

            {connectionStatus === ConnectionStatus.RECONNECTING && (
                <div className="bg-white rounded-md mb-4 p-0 overflow-hidden animate-[slideIn_0.3s_ease-out] transition-all border-l-4 border-info relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-info to-cyan-300 animate-[realtimePulse_2s_infinite]"></div>
                    <div className="p-4 bg-opacity-5 bg-info">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="m-0 text-base font-semibold">Reconnecting</h4>
                        </div>
                        <p className="m-0 text-sm leading-6">Attempting to restore real-time connection...</p>
                    </div>
                </div>
            )}

            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`bg-white rounded-md mb-4 p-0 overflow-hidden animate-[slideIn_0.3s_ease-out] transition-all ${notification.type === 'success' ? 'border-l-4 border-success' :
                        notification.type === 'error' ? 'border-l-4 border-danger' :
                            notification.type === 'warning' ? 'border-l-4 border-warning' :
                                'border-l-4 border-info'
                        } ${notification.isRealtime ? 'relative' : ''}`}
                >
                    {notification.isRealtime && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-info to-cyan-300 animate-[realtimePulse_2s_infinite]"></div>
                    )}
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="m-0 text-base font-semibold">{notification.title}</h4>
                            <button
                                className="bg-none border-none text-xl leading-none text-secondary cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-opacity-10 hover:bg-secondary hover:text-dark"
                                onClick={() => removeNotification(notification.id)}
                                aria-label="Close notification"
                            >
                                &times;
                            </button>
                        </div>
                        <p className="m-0 text-sm leading-6">{notification.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;

// Export helper functions for use in components
export const showSuccess = (message: string, title?: string) => {
    if ((window as any).notificationSystem) {
        (window as any).notificationSystem.success(message, title);
    }
};

export const showError = (message: string, title?: string) => {
    if ((window as any).notificationSystem) {
        (window as any).notificationSystem.error({ message, userFriendlyMessage: message } as AppError);
    }
};

export const showInfo = (message: string, title?: string) => {
    if ((window as any).notificationSystem) {
        (window as any).notificationSystem.info(message, title);
    }
};

export const showWarning = (message: string, title?: string) => {
    if ((window as any).notificationSystem) {
        (window as any).notificationSystem.warning(message, title);
    }
};

// Real-time notification helpers
export const showRealtimeNotification = (
    type: 'success' | 'info' | 'warning',
    message: string,
    title?: string
) => {
    if ((window as any).notificationSystem) {
        (window as any).notificationSystem.addNotification({
            type,
            title: title || 'Real-time Update',
            message,
            duration: 3000,
            isRealtime: true
        });
    }
};

export const showNewCommentNotification = (authorName: string) => {
    showRealtimeNotification('info', `${authorName} posted a new comment`, 'New Comment');
};

export const showNewLikeNotification = (authorName: string) => {
    showRealtimeNotification('info', `${authorName} liked your comment`, 'New Like');
};

export const showCommentDeletedNotification = () => {
    showRealtimeNotification('warning', 'A comment has been deleted', 'Comment Deleted');
};