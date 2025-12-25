import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { websocketService } from '../services';
import { ConnectionStatus } from '../types/websocket';
import { RootState } from '../types';

/**
 * Return type for useWebSocket hook
 */
interface UseWebSocketReturn {
    connectionStatus: ConnectionStatus;
    isConnected: boolean;
    startTyping: (id: string) => void;
    stopTyping: (id: string) => void;
    reconnect: () => void;
    disconnect: () => void;
}

/**
 * Custom hook to manage WebSocket connections
 * @param commentId - Optional comment ID to join a specific comment room
 * @returns Object with connection status and utility functions
 */
export const useWebSocket = (commentId?: string): UseWebSocketReturn => {
    const { connectionStatus } = useAppSelector((state: RootState) => state.ui);
    const dispatch = useAppDispatch();
    const isConnected = connectionStatus === ConnectionStatus.CONNECTED;
    const previousCommentId = useRef<string | undefined>(undefined);

    useEffect(() => {
        const ws = websocketService();
        if (isConnected && commentId && commentId !== previousCommentId.current) {
            if (previousCommentId.current) {
                ws.leaveCommentRoom(previousCommentId.current);
            }

            ws.joinCommentRoom(commentId);
            previousCommentId.current = commentId;
        }

        return () => {
            if (previousCommentId.current) {
                ws.leaveCommentRoom(previousCommentId.current);
            }
        };
    }, [commentId, isConnected]);

    useEffect(() => {
        const ws = websocketService();
        return () => {
            if (previousCommentId.current) {
                ws.leaveCommentRoom(previousCommentId.current);
            }
        };
    }, []);

    const startTyping = useCallback(
        (id: string): void => {
            if (isConnected) {
                websocketService().startTyping(id);
            }
        },
        [isConnected]
    );

    const stopTyping = useCallback(
        (id: string): void => {
            if (isConnected) {
                websocketService().stopTyping(id);
            }
        },
        [isConnected]
    );

    const reconnect = useCallback((): void => {
        websocketService().reconnect(dispatch);
    }, [dispatch]);

    const disconnect = useCallback((): void => {
        websocketService().disconnect();
    }, []);

    return {
        connectionStatus,
        isConnected,
        startTyping,
        stopTyping,
        reconnect,
        disconnect,
    };
};

/**
 * Custom hook to get typing users for a specific comment
 * @param commentId - Comment ID to get typing users for
 * @returns Array of user IDs currently typing
 */
export const useTypingUsers = (commentId?: string): string[] => {
    const typingUsers = useAppSelector((state: RootState) => state.ui.typingUsers);

    if (!commentId) {
        return [];
    }

    return typingUsers[commentId] || [];
};

/**
 * Custom hook to check if WebSocket is ready
 * @returns Boolean indicating if WebSocket is connected and ready
 */
export const useWebSocketReady = (): boolean => {
    const { connectionStatus } = useAppSelector((state: RootState) => state.ui);
    return connectionStatus === ConnectionStatus.CONNECTED;
};