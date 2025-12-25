import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary, Layout, NotificationSystem, ProtectedRoute, PublicRoute, AuthErrorHandler, AuthLoadingIndicator, WebSocketStatusIndicator } from './components';
import { Home, Login, Register, Comments, Profile } from './pages';
import { useAppDispatch, useAppSelector } from './store';
import { initializeAuth, setupTokenExpirationMonitor } from './utils';
import { websocketService } from './services';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  // Initialize authentication state and setup token monitoring
  useEffect(() => {
    console.log('[App] Initializing auth state...');
    // Initialize auth state from localStorage
    dispatch(initializeAuth());

    // Setup token expiration monitoring
    const cleanup = setupTokenExpirationMonitor();

    return cleanup;
  }, [dispatch]);

  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    console.log('[App] Auth state changed, isAuthenticated:', isAuthenticated);
    const token = localStorage.getItem('token');
    console.log('[App] Token in localStorage:', token ? 'exists' : 'not found');

    if (isAuthenticated && token) {
      console.log('[App] Initializing WebSocket service...');
      websocketService().initialize(dispatch);
    } else {
      console.log('[App] Not initializing WebSocket - not authenticated or no token');
    }
  }, [isAuthenticated, dispatch]);

  return (
    <ErrorBoundary>
      <Router>
        <AuthErrorHandler>
          <AuthLoadingIndicator />
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />

              {/* Auth routes (redirect if already authenticated) */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="/comments"
                element={
                  <ProtectedRoute>
                    <Comments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global notification system */}
            <NotificationSystem />
          </Layout>
        </AuthErrorHandler>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
