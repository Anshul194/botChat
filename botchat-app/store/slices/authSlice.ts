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

export interface TwoFactorChallenge {
    user: User | null;
    temporaryLoginToken: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    twoFactorChallenge: TwoFactorChallenge | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
    twoFactorChallenge: null,
};

function normalizeRole(user: Record<string, unknown>) {
    const rawType = String(user?.type || '').toLowerCase().trim();
    return rawType === 'super admin' || rawType === 'superadmin' ? 'SUPER_ADMIN' :
        rawType === 'reseller' ? 'RESELLER' :
            rawType === 'tenant' ? 'TENANT' :
            rawType === 'admin' ? 'ADMIN' : 'USER';
}

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

            const normalizedUser = { ...user, role: normalizeRole(user) };

            if (typeof window !== 'undefined') {
                if (token) localStorage.setItem('token', token);
                if (normalizedUser) localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            return { token, user: normalizedUser };
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed.';
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

            // ── Two-factor challenge ─────────────────────────────────────────
            // No token is issued yet. The client must complete the second step
            // with the temporary token via verifyTwoFactorLogin / recoveryCodeLogin.
            if (data.requires_two_factor) {
                const user = data.user || data;
                const normalizedUser = { ...user, role: normalizeRole(user) };

                return {
                    requiresTwoFactor: true,
                    token: null,
                    user: normalizedUser,
                    temporaryLoginToken: data.temporary_login_token,
                };
            }

            const token = data.token;
            const user = data.user || data;

            const normalizedUser = { ...user, role: normalizeRole(user) };

            if (typeof window !== 'undefined') {
                if (token) localStorage.setItem('token', token);
                if (normalizedUser) localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            setTimeout(() => {
                if (normalizedUser.role !== 'SUPER_ADMIN') {
                    dispatch(fetchSubscription());
                }
            }, 0);

            return { requiresTwoFactor: false, token, user: normalizedUser };
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed.';
            return rejectWithValue(message);
        }
    }
);

export const verifyTwoFactorLogin = createAsyncThunk(
    'auth/verifyTwoFactorLogin',
    async (payload: { code: string; temporaryLoginToken: string }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login/2fa', {
                code: payload.code,
                temporary_login_token: payload.temporaryLoginToken,
            });

            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Two-factor verification failed.');
            }

            const data = response.data.data;
            const token = data.token;
            const user = data.user || data;

            const normalizedUser = { ...user, role: normalizeRole(user) };

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            setTimeout(() => {
                if (normalizedUser.role !== 'SUPER_ADMIN') {
                    dispatch(fetchSubscription());
                }
            }, 0);

            return { token, user: normalizedUser };
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Two-factor verification failed.';
            return rejectWithValue(message);
        }
    }
);

export const recoveryCodeLogin = createAsyncThunk(
    'auth/recoveryCodeLogin',
    async (payload: { recoveryCode: string; temporaryLoginToken: string }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login/recovery', {
                recovery_code: payload.recoveryCode,
                temporary_login_token: payload.temporaryLoginToken,
            });

            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Recovery code verification failed.');
            }

            const data = response.data.data;
            const token = data.token;
            const user = data.user || data;

            const normalizedUser = { ...user, role: normalizeRole(user) };

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            setTimeout(() => {
                if (normalizedUser.role !== 'SUPER_ADMIN') {
                    dispatch(fetchSubscription());
                }
            }, 0);

            return { token, user: normalizedUser };
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Recovery code verification failed.';
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

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (payload: { email: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/forgot-password', payload);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to send reset link.');
            }
            return response.data.message || 'If your email exists in our system, a password reset link has been sent.';
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to send reset link.';
            return rejectWithValue(message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (
        payload: { token: string; email: string; password: string; password_confirmation: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/auth/reset-password', payload);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Password reset failed.');
            }
            return response.data.message || 'Password reset successfully.';
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Password reset failed.';
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

            const normalizedUser = { ...user, role: normalizeRole(user) };

            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            return normalizedUser;
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch user.';
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
        },
        clearTwoFactorChallenge: (state) => {
            state.twoFactorChallenge = null;
            state.error = null;
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
                if (action.payload.requiresTwoFactor) {
                    state.twoFactorChallenge = {
                        user: action.payload.user,
                        temporaryLoginToken: action.payload.temporaryLoginToken,
                    };
                    return;
                }
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(verifyTwoFactorLogin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyTwoFactorLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.twoFactorChallenge = null;
            })
            .addCase(verifyTwoFactorLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(recoveryCodeLogin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(recoveryCodeLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.twoFactorChallenge = null;
            })
            .addCase(recoveryCodeLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.twoFactorChallenge = null;
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
                state.twoFactorChallenge = null;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            });
    },
});

export const { clearError, setCredentials, setInitialized, clearTwoFactorChallenge } = authSlice.actions;

// Global Role Selectors (using any to avoid circular dependency with store)
export const selectIsSuperAdmin = (state: any) => state.auth.user?.role === 'SUPER_ADMIN';
export const selectIsReseller = (state: any) => state.auth.user?.role === 'RESELLER';
export const selectIsTenant = (state: any) => state.auth.user?.role === 'TENANT';

export default authSlice.reducer;
