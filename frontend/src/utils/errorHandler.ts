import { ApiError } from '../types';

// Error types
export enum ErrorType {
    NETWORK = 'NETWORK',
    API = 'API',
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    NOT_FOUND = 'NOT_FOUND',
    SERVER = 'SERVER',
    UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// Standardized error object
export interface AppError {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    code?: string;
    details?: any;
    timestamp: Date;
    userFriendlyMessage: string;
}

// Error handler class
class ErrorHandler {
    private static instance: ErrorHandler;
    private errorListeners: ((error: AppError) => void)[] = [];

    private constructor() { }

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    // Subscribe to error events
    public subscribe(listener: (error: AppError) => void): () => void {
        this.errorListeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.errorListeners.indexOf(listener);
            if (index > -1) {
                this.errorListeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners
    private notify(error: AppError): void {
        this.errorListeners.forEach(listener => {
            try {
                listener(error);
            } catch (e) {
                console.error('Error in error listener:', e);
            }
        });
    }

    // Handle API errors
    public handleApiError(error: ApiError): AppError {
        let type = ErrorType.UNKNOWN;
        let severity = ErrorSeverity.MEDIUM;
        let userFriendlyMessage = 'An unexpected error occurred. Please try again.';

        // Determine error type and severity based on status code
        if (error.status) {
            switch (error.status) {
                case 400:
                    type = ErrorType.VALIDATION;
                    severity = ErrorSeverity.LOW;
                    userFriendlyMessage = error.message || 'Invalid input. Please check your data.';
                    break;
                case 401:
                    type = ErrorType.AUTHENTICATION;
                    severity = ErrorSeverity.MEDIUM;
                    userFriendlyMessage = 'You need to log in to access this resource.';
                    break;
                case 403:
                    type = ErrorType.AUTHORIZATION;
                    severity = ErrorSeverity.MEDIUM;
                    userFriendlyMessage = 'You don\'t have permission to perform this action.';
                    break;
                case 404:
                    type = ErrorType.NOT_FOUND;
                    severity = ErrorSeverity.LOW;
                    userFriendlyMessage = 'The requested resource was not found.';
                    break;
                case 500:
                    type = ErrorType.SERVER;
                    severity = ErrorSeverity.HIGH;
                    userFriendlyMessage = 'Server error. Please try again later.';
                    break;
                default:
                    type = ErrorType.API;
                    severity = ErrorSeverity.MEDIUM;
                    userFriendlyMessage = error.message || 'An error occurred while processing your request.';
            }
        } else {
            // Network error or other non-HTTP error
            type = ErrorType.NETWORK;
            severity = ErrorSeverity.HIGH;
            userFriendlyMessage = 'Network error. Please check your connection and try again.';
        }

        const appError: AppError = {
            type,
            severity,
            message: error.message || 'Unknown error',
            code: error.code,
            details: error.details,
            timestamp: new Date(),
            userFriendlyMessage
        };

        this.notify(appError);
        return appError;
    }

    // Handle generic errors
    public handleError(error: Error | string, type: ErrorType = ErrorType.UNKNOWN, severity: ErrorSeverity = ErrorSeverity.MEDIUM): AppError {
        let message: string;
        if (typeof error === 'string') {
            message = error;
        } else {
            message = error.message || 'Unknown error';
        }

        const appError: AppError = {
            type,
            severity,
            message,
            timestamp: new Date(),
            userFriendlyMessage: message
        };

        this.notify(appError);
        return appError;
    }

    // Log error to console (in development) or to a service (in production)
    public logError(error: AppError): void {
        if (process.env.NODE_ENV === 'development') {
            console.group(`Error [${error.type}] - ${new Date().toISOString()}`);
            console.error('Error:', error);
            if (error.details) {
                console.log('Details:', error.details);
            }
            console.groupEnd();
        } else {
            // In production, you would send this to an error tracking service
            // like Sentry, LogRocket, etc.
            // errorTrackingService.captureException(error);
        }
    }
}

export const errorHandler = ErrorHandler.getInstance();

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(
        event.reason || 'Unhandled promise rejection',
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH
    );
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    errorHandler.handleError(
        event.error || event.message || 'Uncaught error',
        ErrorType.UNKNOWN,
        ErrorSeverity.CRITICAL
    );
});

export default errorHandler;