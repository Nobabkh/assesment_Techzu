import { Dispatch } from '@reduxjs/toolkit';
import { showSuccess, showError } from '../slices/uiSlice';

// Error handling utility for Redux async operations
export const handleAsyncError = (
    error: any,
    dispatch: Dispatch,
    fallbackMessage = 'An error occurred'
) => {
    const errorMessage = error?.message || fallbackMessage;
    dispatch(showError({ title: 'Error', message: errorMessage }));
    return errorMessage;
};

// Success notification utility
export const handleAsyncSuccess = (
    message: string,
    dispatch: Dispatch,
    title = 'Success'
) => {
    dispatch(showSuccess({ title, message }));
};

// Generic async operation wrapper with error handling
export const withErrorHandling = async <T>(
    asyncOperation: () => Promise<T>,
    dispatch: Dispatch,
    options?: {
        successMessage?: string;
        successTitle?: string;
        errorTitle?: string;
        fallbackErrorMessage?: string;
    }
): Promise<T | null> => {
    try {
        const result = await asyncOperation();

        if (options?.successMessage) {
            handleAsyncSuccess(
                options.successMessage,
                dispatch,
                options.successTitle
            );
        }

        return result;
    } catch (error: any) {
        handleAsyncError(
            error,
            dispatch,
            options?.fallbackErrorMessage || 'Operation failed'
        );
        return null;
    }
};

// API response handler
export const handleApiResponse = <T>(
    response: { success: boolean; data?: T; message?: string },
    dispatch: Dispatch,
    options?: {
        successMessage?: string;
        errorTitle?: string;
        fallbackErrorMessage?: string;
    }
): T | null => {
    if (response.success && response.data) {
        if (options?.successMessage) {
            handleAsyncSuccess(options.successMessage, dispatch);
        }
        return response.data;
    } else {
        handleAsyncError(
            response.message,
            dispatch,
            options?.fallbackErrorMessage || 'Operation failed'
        );
        return null;
    }
};

// Validation error handler
export const handleValidationErrors = (
    error: any,
    dispatch: Dispatch
): string[] => {
    const errors: string[] = [];

    if (error?.response?.data?.errors) {
        // Handle validation errors from API
        const validationErrors = error.response.data.errors;

        if (Array.isArray(validationErrors)) {
            validationErrors.forEach((err: any) => {
                if (err.message) {
                    errors.push(err.message);
                }
            });
        } else if (typeof validationErrors === 'object') {
            Object.values(validationErrors).forEach((err: any) => {
                if (typeof err === 'string') {
                    errors.push(err);
                } else if (err?.message) {
                    errors.push(err.message);
                }
            });
        }
    } else if (error?.message) {
        errors.push(error.message);
    } else {
        errors.push('An unknown error occurred');
    }

    // Show all errors as notifications
    errors.forEach((errorMessage, index) => {
        const title = index === 0 ? 'Validation Error' : '';
        dispatch(showError({ title, message: errorMessage }));
    });

    return errors;
};

// Network error handler
export const handleNetworkError = (
    error: any,
    dispatch: Dispatch
): string => {
    let errorMessage = 'Network error occurred';

    if (error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error?.code === 'TIMEOUT') {
        errorMessage = 'Request timed out. Please try again later.';
    } else if (error?.response?.status === 0) {
        errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
    } else if (error?.response?.status === 503) {
        errorMessage = 'Service unavailable. Please try again later.';
    } else if (error?.message) {
        errorMessage = error.message;
    }

    dispatch(showError({ title: 'Network Error', message: errorMessage }));
    return errorMessage;
};

// Authentication error handler
export const handleAuthError = (
    error: any,
    dispatch: Dispatch
): string => {
    let errorMessage = 'Authentication error';

    if (error?.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
    } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
    } else if (error?.message) {
        errorMessage = error.message;
    }

    dispatch(showError({ title: 'Authentication Error', message: errorMessage }));
    return errorMessage;
};

// Permission error handler
export const handlePermissionError = (
    error: any,
    dispatch: Dispatch
): string => {
    let errorMessage = 'Permission denied';

    if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
    } else if (error?.message) {
        errorMessage = error.message;
    }

    dispatch(showError({ title: 'Permission Error', message: errorMessage }));
    return errorMessage;
};

// Create a comprehensive error handler that determines the type of error and handles it appropriately
export const handleReduxError = (
    error: any,
    dispatch: Dispatch,
    context?: string
): string => {
    const contextPrefix = context ? `${context}: ` : '';

    // Determine error type and handle accordingly
    if (error?.response?.status === 401 || error?.response?.status === 403) {
        return handleAuthError(error, dispatch);
    } else if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
        return handleNetworkError(error, dispatch);
    } else if (error?.response?.data?.errors) {
        return handleValidationErrors(error, dispatch).join('; ');
    } else {
        return handleAsyncError(error, dispatch, `${contextPrefix}An unexpected error occurred`);
    }
};