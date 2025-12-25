import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services';
import {
    UserState,
    UserProfile,
    UserUpdateRequest,
} from '../../types';

// Initial state
const initialState: UserState = {
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk<
    UserProfile,
    void,
    { rejectValue: string }
>('user/fetchUserProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await userService.getCurrentUserProfile();
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to fetch user profile');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
});

export const updateUserProfile = createAsyncThunk<
    UserProfile,
    UserUpdateRequest,
    { rejectValue: string }
>('user/updateUserProfile', async (userData, { rejectWithValue }) => {
    try {
        const response = await userService.updateCurrentUserProfile(userData);
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to update user profile');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update user profile');
    }
});

export const fetchUserById = createAsyncThunk<
    UserProfile,
    string,
    { rejectValue: string }
>('user/fetchUserById', async (id, { rejectWithValue }) => {
    try {
        const response = await userService.getUserById(id);
        if (response.success && response.data) {
            return response.data;
        } else {
            return rejectWithValue(response.message || 'Failed to fetch user');
        }
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch user');
    }
});

// Create the slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Reset state
        resetUserState: () => initialState,
        // Update user profile locally (for real-time updates)
        updateProfileLocally: (state, action: PayloadAction<Partial<UserProfile>>) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
            }
        },
        // Set user profile (for auth login)
        setProfile: (state, action: PayloadAction<UserProfile>) => {
            state.profile = action.payload;
        },
        // Clear profile (for logout)
        clearProfile: (state) => {
            state.profile = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch user profile
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch user profile';
            });

        // Update user profile
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload || 'Failed to update user profile';
            });

        // Fetch user by ID
        builder
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch user';
            });
    },
});

export const {
    clearError,
    resetUserState,
    updateProfileLocally,
    setProfile,
    clearProfile,
} = userSlice.actions;

export default userSlice.reducer;