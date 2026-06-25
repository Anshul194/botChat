import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { clearSubscription, fetchSubscription } from './subscriptionSlice';

export interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    phone?: string;
    country?: string;
    avatar?: string;
    email_verified_at?: string;
    plan_id?: number | null;
    plan_expired_date?: string | null;
    roles?: string | string[];
    role?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
};

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (
        credentials: { name: string; email: string; password: string; password_confirmation: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/auth/register', credentials);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Registration failed.');
            }

            const data = response.data.data;
            const token = data.token;
            const user = data.user || data;

            const normalizedUser = {
                ...user,
                role: user.type === 'Super Admin' ? 'SUPER_ADMIN' :
                    user.type === 'Reseller' ? 'RESELLER' :
                        user.type === 'Tenant' ? 'TENANT' :
                            user.type === 'Admin' ? 'SUPER_ADMIN' : user.type
            };

            if (typeof window !== 'undefined') {
                if (token) localStorage.setItem('token', token);
                if (normalizedUser) localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            return { token, user: normalizedUser };
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Registration failed.';
            return rejectWithValue(message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Login failed.');
            }

            const data = response.data.data;
            const token = data.token;
            // Handle both flat and nested user objects
            const user = data.user || data;

            // Normalize role for existing selectors
            const normalizedUser = {
                ...user,
                role: user.type === 'Super Admin' ? 'SUPER_ADMIN' :
                    user.type === 'Reseller' ? 'RESELLER' :
                        user.type === 'Tenant' ? 'TENANT' :
                            user.type === 'Admin' ? 'SUPER_ADMIN' : user.type
            };

            if (typeof window !== 'undefined') {
                if (token) localStorage.setItem('token', token);
                if (normalizedUser) localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            setTimeout(() => dispatch(fetchSubscription()), 0);

            return { token, user: normalizedUser };
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed.';
            return rejectWithValue(message);
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async (token: string, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/verify-email', { token });
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Verification failed.');
            }
            return response.data.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Verification failed.';
            return rejectWithValue(message);
        }
    }
);

export const resendVerification = createAsyncThunk(
    'auth/resendVerification',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/resend-verification');
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to resend verification.');
            }
            return response.data.message;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to resend verification.';
            return rejectWithValue(message);
        }
    }
);

export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to fetch user.');
            }

            const data = response.data.data;
            // Handle both flat and nested user objects
            const user = data.user || data;

            const normalizedUser = {
                ...user,
                role: user.type === 'Super Admin' ? 'SUPER_ADMIN' :
                    user.type === 'Reseller' ? 'RESELLER' :
                        user.type === 'Tenant' ? 'TENANT' :
                            user.type === 'Admin' ? 'SUPER_ADMIN' : user.type
            };

            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            return normalizedUser;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch user.';
            return rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            // Per production request: using DELETE for logout
            await api.delete('/auth/logout').catch(() => { });

            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
            }
            dispatch(clearSubscription());
            return null;
        } catch (error: any) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
            }
            dispatch(clearSubscription());
            return rejectWithValue(error.message);
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (payload: { current_password: string; password: string; password_confirmation: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch('/profile/password', payload);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to change password.');
            }
            return response.data.message || 'Password changed successfully.';
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to change password.';
            return rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isInitialized = true;
        },
        setInitialized: (state) => {
            state.isInitialized = true;
        }
    },
    extraReducers: (builder) => {
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
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                if (state.user) {
                    state.user = { ...state.user, ...action.payload.user };
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('user', JSON.stringify(state.user));
                    }
                }
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMe.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(action.payload));
                }
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            });
    },
});

export const { clearError, setCredentials, setInitialized } = authSlice.actions;

// Global Role Selectors (using any to avoid circular dependency with store)
export const selectIsSuperAdmin = (state: any) => state.auth.user?.role === 'SUPER_ADMIN';
export const selectIsReseller = (state: any) => state.auth.user?.role === 'RESELLER';
export const selectIsTenant = (state: any) => state.auth.user?.role === 'TENANT';

export default authSlice.reducer;
