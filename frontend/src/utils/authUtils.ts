import { authService } from '../services';
import { store } from '../store';
import { setAuthFromStorage, logoutUser, getCurrentUser as getCurrentUserThunk } from '../store/slices/authSlice';

/**
 * Initialize authentication state from localStorage
 * This should be called when the app starts
 */
export const initializeAuth = () => {
    // Check if there's stored auth data and set it in Redux store
    return store.dispatch(setAuthFromStorage());
};

/**
 * Handle token expiration and automatic logout
 * This can be called periodically or before making authenticated requests
 */
export const handleTokenExpiration = (): boolean => {
    if (!authService.isAuthenticated()) {
        // Token is expired or invalid, logout user
        store.dispatch(logoutUser());
        return false;
    }
    return true;
};

/**
 * Setup token expiration monitoring
 * This sets up periodic checks for token expiration
 */
export const setupTokenExpirationMonitor = (): (() => void) => {
    // Check token expiration every 5 minutes
    const intervalId = setInterval(() => {
        handleTokenExpiration();
    }, 5 * 60 * 1000); // 5 minutes

    // Return cleanup function
    return () => clearInterval(intervalId);
};

/**
 * Get authentication headers for API requests
 * This ensures the token is included in API calls
 */
export const getAuthHeaders = (): Record<string, string> => {
    const token = authService.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Handle authentication errors from API responses
 * This centralizes error handling for auth-related failures
 */
export const handleAuthError = (error: any): boolean => {
    // Check if error is related to authentication
    if (
        error?.status === 401 || // Unauthorized
        error?.status === 403 || // Forbidden
        error?.message?.includes('token') ||
        error?.message?.includes('authentication') ||
        error?.message?.includes('unauthorized')
    ) {
        // Clear auth state and redirect to login
        store.dispatch(logoutUser());
        return true;
    }
    return false;
};

/**
 * Refresh authentication state
 * This can be used after a page reload or when auth state might be stale
 */
export const refreshAuthState = async (): Promise<boolean> => {
    try {
        if (authService.isAuthenticated()) {
            // Try to get current user to verify token is still valid
            const result = await store.dispatch(getCurrentUserThunk());
            return getCurrentUserThunk.fulfilled.match(result);
        }
        return false;
    } catch (error) {
        // If there's an error, logout user
        store.dispatch(logoutUser());
        return false;
    }
};

/**
 * Check if user has specific role or permission
 * This can be extended for role-based access control
 */
export const hasPermission = (permission: string): boolean => {
    const state = store.getState();
    const user = state.auth.user;

    // For now, just check if user is authenticated
    // This can be extended to check specific roles/permissions
    return !!user;
};

/**
 * Get current user information
 * This provides a centralized way to access user data
 */
export const getCurrentUserData = () => {
    const state = store.getState();
    return state.auth.user;
};

/**
 * Check if user is currently authenticated
 * This provides a centralized way to check auth status
 */
export const isUserAuthenticated = (): boolean => {
    const state = store.getState();
    return state.auth.isAuthenticated;
};