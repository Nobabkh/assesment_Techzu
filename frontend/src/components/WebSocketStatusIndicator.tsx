import React from 'react';
import { useAppSelector } from '../store';
import { ConnectionStatus } from '../types/websocket';

interface WebSocketStatusIndicatorProps {
    className?: string;
}

const WebSocketStatusIndicator: React.FC<WebSocketStatusIndicatorProps> = ({ className = '' }) => {
    const { connectionStatus } = useAppSelector((state: any) => state.ui);

    const getStatusText = () => {
        switch (connectionStatus) {
            case ConnectionStatus.CONNECTED:
                return 'Connected';
            case ConnectionStatus.CONNECTING:
                return 'Connecting...';
            case ConnectionStatus.DISCONNECTED:
                return 'Disconnected';
            case ConnectionStatus.RECONNECTING:
                return 'Reconnecting...';
            case ConnectionStatus.ERROR:
                return 'Connection Error';
            default:
                return 'Unknown';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case ConnectionStatus.CONNECTED:
                return '🟢';
            case ConnectionStatus.CONNECTING:
            case ConnectionStatus.RECONNECTING:
                return '🟡';
            case ConnectionStatus.DISCONNECTED:
                return '🔴';
            case ConnectionStatus.ERROR:
                return '❌';
            default:
                return '❓';
        }
    };

    const isHealthy = connectionStatus === ConnectionStatus.CONNECTED;
    const isWarning = connectionStatus === ConnectionStatus.CONNECTING || connectionStatus === ConnectionStatus.RECONNECTING;
    const isError = connectionStatus === ConnectionStatus.DISCONNECTED || connectionStatus === ConnectionStatus.ERROR;

    return (
        <div className={`flex items-center gap-2 p-2 rounded-[20px] bg-black/5 text-sm font-medium transition-all duration-200 ${className} ${isHealthy ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
            isWarning ? 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            }`}>
            <span className="text-base leading-none">{getStatusIcon()}</span>
            <span className="font-medium">{getStatusText()}</span>
            {isError && (
                <button
                    className="ml-2 px-2 py-1 border-none rounded bg-blue-500 text-white text-xs cursor-pointer transition-colors duration-200 hover:bg-blue-600 active:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:active:bg-indigo-800"
                    onClick={() => window.location.reload()}
                    title="Reconnect"
                >
                    Reconnect
                </button>
            )}
        </div>
    );
};

export default WebSocketStatusIndicator;