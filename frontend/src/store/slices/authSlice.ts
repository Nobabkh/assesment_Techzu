import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services';
import {
    AuthState,
    UserPayload,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ApiResponse,
    AsyncThunkStatus,
} from '../../types';

// Initial state
const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
    AuthResponse,
    LoginRequest,
    { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await authService.login(credentials);
        if (response.success && response.data) {
            // Store auth data in localStorage
            authService.storeAuthData(response.data.token, response.data.user);
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Login failed');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Login failed');
    }
});

export const registerUser = createAsyncThunk<
    AuthResponse,
    RegisterRequest,
    { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await authService.register(userData);
        if (response.success && response.data) {
            // Store auth data in localStorage
            authService.storeAuthData(response.data.token, response.data.user);
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Registration failed');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Registration failed');
    }
});

export const getCurrentUser = createAsyncThunk<
    UserPayload,
    void,
    { rejectValue: string }
>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
    try {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to get user information');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to get user information');
    }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            authService.logout();
        } catch (error: any) {
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

// Create the slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Set authentication state from localStorage (for app initialization)
        setAuthFromStorage: (state) => {
            const token = authService.getStoredToken();
            const user = authService.getStoredUser();

            if (token && user && authService.isAuthenticated()) {
                state.isAuthenticated = true;
                state.token = token;
                state.user = user;
            }
        },
        // Update user profile
        updateUserProfile: (state, action: PayloadAction<Partial<UserPayload>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                // Update localStorage
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload || 'Login failed';
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload || 'Registration failed';
            });

        // Get current user
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload || 'Failed to get user information';
            });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = null;
            });
    },
});

export const { clearError, setAuthFromStorage, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;