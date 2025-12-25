import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { clearError } from '../../store/slices/authSlice';
import { NotificationSystem, showSuccess, showError, showInfo } from '../index';

interface AuthErrorHandlerProps {
    children?: React.ReactNode;
}

const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { error, isAuthenticated } = useAppSelector((state) => state.auth);

    // Handle authentication errors
    useEffect(() => {
        if (error) {
            showError(error);

            // Auto-clear error after 5 seconds
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    // Show success message when authentication state changes
    useEffect(() => {
        if (isAuthenticated) {
            showInfo('You are now logged in');
        }
    }, [isAuthenticated]);

    return <>{children}</>;
};

export default AuthErrorHandler;