import { useCallback } from 'react';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '../index';
import { CommentState, UserState, UIState, LikeState } from '../../types';

// Define typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Authentication hooks
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    const login = useCallback(
        (credentials: { email: string; password: string }) => {
            // Import here to avoid circular dependencies
            const { loginUser } = require('../slices/authSlice');
            return dispatch(loginUser(credentials));
        },
        [dispatch]
    );

    const register = useCallback(
        (userData: { email: string; username: string; password: string; name?: string }) => {
            const { registerUser } = require('../slices/authSlice');
            return dispatch(registerUser(userData));
        },
        [dispatch]
    );

    const logout = useCallback(() => {
        const { logoutUser } = require('../slices/authSlice');
        return dispatch(logoutUser());
    }, [dispatch]);

    const getCurrentUser = useCallback(() => {
        const { getCurrentUser } = require('../slices/authSlice');
        return dispatch(getCurrentUser());
    }, [dispatch]);

    const clearError = useCallback(() => {
        const { clearError } = require('../slices/authSlice');
        return dispatch(clearError());
    }, [dispatch]);

    const setAuthFromStorage = useCallback(() => {
        const { setAuthFromStorage } = require('../slices/authSlice');
        return dispatch(setAuthFromStorage());
    }, [dispatch]);

    return {
        ...auth,
        login,
        register,
        logout,
        getCurrentUser,
        clearError,
        setAuthFromStorage,
    };
};

// Comment hooks
export const useComments = () => {
    const dispatch = useAppDispatch();
    const comments = useAppSelector((state) => state.comments);

    const fetchComments = useCallback(
        (params?: any) => {
            const { fetchComments } = require('../slices/commentSlice');
            return dispatch(fetchComments(params));
        },
        [dispatch]
    );

    const fetchCommentById = useCallback(
        (id: string) => {
            const { fetchCommentById } = require('../slices/commentSlice');
            return dispatch(fetchCommentById(id));
        },
        [dispatch]
    );

    const createComment = useCallback(
        (commentData: { content: string; parentId?: string }) => {
            const { createComment } = require('../slices/commentSlice');
            return dispatch(createComment(commentData));
        },
        [dispatch]
    );

    const updateComment = useCallback(
        (id: string, data: { content: string }) => {
            const { updateComment } = require('../slices/commentSlice');
            return dispatch(updateComment({ id, data }));
        },
        [dispatch]
    );

    const deleteComment = useCallback(
        (id: string) => {
            const { deleteComment } = require('../slices/commentSlice');
            return dispatch(deleteComment(id));
        },
        [dispatch]
    );

    const fetchReplies = useCallback(
        (commentId: string, params?: any) => {
            const { fetchReplies } = require('../slices/commentSlice');
            return dispatch(fetchReplies({ commentId, params }));
        },
        [dispatch]
    );

    const createReply = useCallback(
        (commentId: string, replyData: { content: string }) => {
            const { createReply } = require('../slices/commentSlice');
            return dispatch(createReply({ commentId, replyData }));
        },
        [dispatch]
    );

    const clearError = useCallback(() => {
        const { clearError } = require('../slices/commentSlice');
        return dispatch(clearError());
    }, [dispatch]);

    const clearCurrentComment = useCallback(() => {
        const { clearCurrentComment } = require('../slices/commentSlice');
        return dispatch(clearCurrentComment());
    }, [dispatch]);

    const resetCommentState = useCallback(() => {
        const { resetCommentState } = require('../slices/commentSlice');
        return dispatch(resetCommentState());
    }, [dispatch]);

    return {
        ...(comments as CommentState),
        fetchComments,
        fetchCommentById,
        createComment,
        updateComment,
        deleteComment,
        fetchReplies,
        createReply,
        clearError,
        clearCurrentComment,
        resetCommentState,
    };
};

// User hooks
export const useUser = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);

    const fetchUserProfile = useCallback(() => {
        const { fetchUserProfile } = require('../slices/userSlice');
        return dispatch(fetchUserProfile());
    }, [dispatch]);

    const updateUserProfile = useCallback(
        (userData: { name?: string; username?: string }) => {
            const { updateUserProfile } = require('../slices/userSlice');
            return dispatch(updateUserProfile(userData));
        },
        [dispatch]
    );

    const fetchUserById = useCallback(
        (id: string) => {
            const { fetchUserById } = require('../slices/userSlice');
            return dispatch(fetchUserById(id));
        },
        [dispatch]
    );

    const clearError = useCallback(() => {
        const { clearError } = require('../slices/userSlice');
        return dispatch(clearError());
    }, [dispatch]);

    const resetUserState = useCallback(() => {
        const { resetUserState } = require('../slices/userSlice');
        return dispatch(resetUserState());
    }, [dispatch]);

    const setProfile = useCallback(
        (profile: any) => {
            const { setProfile } = require('../slices/userSlice');
            return dispatch(setProfile(profile));
        },
        [dispatch]
    );

    const clearProfile = useCallback(() => {
        const { clearProfile } = require('../slices/userSlice');
        return dispatch(clearProfile());
    }, [dispatch]);

    return {
        ...(user as UserState),
        fetchUserProfile,
        updateUserProfile,
        fetchUserById,
        clearError,
        resetUserState,
        setProfile,
        clearProfile,
    };
};

// UI hooks
export const useUI = () => {
    const dispatch = useAppDispatch();
    const ui = useAppSelector((state) => state.ui);

    const setLoading = useCallback(
        (loading: boolean) => {
            const { setLoading } = require('../slices/uiSlice');
            return dispatch(setLoading(loading));
        },
        [dispatch]
    );

    const addNotification = useCallback(
        (notification: {
            type: 'success' | 'error' | 'warning' | 'info';
            title: string;
            message: string;
            duration?: number;
            dismissible?: boolean;
        }) => {
            const { addNotification } = require('../slices/uiSlice');
            return dispatch(addNotification(notification));
        },
        [dispatch]
    );

    const removeNotification = useCallback(
        (id: string) => {
            const { removeNotification } = require('../slices/uiSlice');
            return dispatch(removeNotification(id));
        },
        [dispatch]
    );

    const clearNotifications = useCallback(() => {
        const { clearNotifications } = require('../slices/uiSlice');
        return dispatch(clearNotifications());
    }, [dispatch]);

    const toggleTheme = useCallback(() => {
        const { toggleTheme } = require('../slices/uiSlice');
        return dispatch(toggleTheme());
    }, [dispatch]);

    const setTheme = useCallback(
        (theme: 'light' | 'dark') => {
            const { setTheme } = require('../slices/uiSlice');
            return dispatch(setTheme(theme));
        },
        [dispatch]
    );

    const toggleSidebar = useCallback(() => {
        const { toggleSidebar } = require('../slices/uiSlice');
        return dispatch(toggleSidebar());
    }, [dispatch]);

    const setSidebarOpen = useCallback(
        (open: boolean) => {
            const { setSidebarOpen } = require('../slices/uiSlice');
            return dispatch(setSidebarOpen(open));
        },
        [dispatch]
    );

    const showSuccess = useCallback(
        (title: string, message: string, duration?: number) => {
            const { showSuccess } = require('../slices/uiSlice');
            return dispatch(showSuccess({ title, message, duration }));
        },
        [dispatch]
    );

    const showError = useCallback(
        (title: string, message: string, duration?: number) => {
            const { showError } = require('../slices/uiSlice');
            return dispatch(showError({ title, message, duration }));
        },
        [dispatch]
    );

    const showWarning = useCallback(
        (title: string, message: string, duration?: number) => {
            const { showWarning } = require('../slices/uiSlice');
            return dispatch(showWarning({ title, message, duration }));
        },
        [dispatch]
    );

    const showInfo = useCallback(
        (title: string, message: string, duration?: number) => {
            const { showInfo } = require('../slices/uiSlice');
            return dispatch(showInfo({ title, message, duration }));
        },
        [dispatch]
    );

    return {
        ...(ui as UIState),
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
    };
};

// Like hooks
export const useLikes = () => {
    const dispatch = useAppDispatch();
    const likes = useAppSelector((state) => state.likes);

    const toggleCommentLike = useCallback(
        (commentId: string, likeData: { type: 'like' | 'dislike' }) => {
            const { toggleCommentLike } = require('../slices/likeSlice');
            return dispatch(toggleCommentLike({ commentId, likeData }));
        },
        [dispatch]
    );

    const toggleReplyLike = useCallback(
        (replyId: string, likeData: { type: 'like' | 'dislike' }) => {
            const { toggleReplyLike } = require('../slices/likeSlice');
            return dispatch(toggleReplyLike({ replyId, likeData }));
        },
        [dispatch]
    );

    const getCommentLikeStatus = useCallback(
        (commentId: string) => {
            const { getCommentLikeStatus } = require('../slices/likeSlice');
            return dispatch(getCommentLikeStatus(commentId));
        },
        [dispatch]
    );

    const getReplyLikeStatus = useCallback(
        (replyId: string) => {
            const { getReplyLikeStatus } = require('../slices/likeSlice');
            return dispatch(getReplyLikeStatus(replyId));
        },
        [dispatch]
    );

    const clearError = useCallback(() => {
        const { clearError } = require('../slices/likeSlice');
        return dispatch(clearError());
    }, [dispatch]);

    const resetLikeState = useCallback(() => {
        const { resetLikeState } = require('../slices/likeSlice');
        return dispatch(resetLikeState());
    }, [dispatch]);

    const updateCommentLikeCounts = useCallback(
        (commentId: string, counts: any) => {
            const { updateCommentLikeCounts } = require('../slices/likeSlice');
            return dispatch(updateCommentLikeCounts({ commentId, counts }));
        },
        [dispatch]
    );

    const updateReplyLikeCounts = useCallback(
        (replyId: string, counts: any) => {
            const { updateReplyLikeCounts } = require('../slices/likeSlice');
            return dispatch(updateReplyLikeCounts({ replyId, counts }));
        },
        [dispatch]
    );

    return {
        ...(likes as LikeState),
        toggleCommentLike,
        toggleReplyLike,
        getCommentLikeStatus,
        getReplyLikeStatus,
        clearError,
        resetLikeState,
        updateCommentLikeCounts,
        updateReplyLikeCounts,
    };
};