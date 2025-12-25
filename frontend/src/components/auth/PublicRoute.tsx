import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
    children,
    redirectTo = '/comments'
}) => {
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    // Show loading indicator while checking authentication status
    if (isLoading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Checking authentication...</p>
            </div>
        );
    }

    // Redirect to comments if already authenticated
    if (isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;