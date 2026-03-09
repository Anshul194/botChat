import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    phone?: string;
    country?: string;
    avatar?: string;
    roles?: string | string[];
    role?: string; // Normalized role: SUPER_ADMIN, RESELLER, TENANT
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const getInitialToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token') || null;
    }
    return null;
};

const getInitialUser = (): User | null => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
    }
    return null;
};

const initialState: AuthState = {
    user: getInitialUser(),
    token: getInitialToken(),
    isAuthenticated: !!getInitialToken(),
    isLoading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);

            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Login failed.');
            }

            const { token, user } = response.data.data;

            // Normalize role for existing selectors
            const normalizedUser = {
                ...user,
                role: user.type === 'Super Admin' ? 'SUPER_ADMIN' :
                    user.type === 'Reseller' ? 'RESELLER' :
                        user.type === 'Tenant' ? 'TENANT' : user.type
            };

            if (typeof window !== 'undefined') {
                if (token) localStorage.setItem('token', token);
                if (normalizedUser) localStorage.setItem('user', JSON.stringify(normalizedUser));
            }

            return { token, user: normalizedUser };
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed.';
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

            const user = response.data.data;
            const normalizedUser = {
                ...user,
                role: user.type === 'Super Admin' ? 'SUPER_ADMIN' :
                    user.type === 'Reseller' ? 'RESELLER' :
                        user.type === 'Tenant' ? 'TENANT' : user.type
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
    async (_, { rejectWithValue }) => {
        try {
            // Per production request: using DELETE for logout
            await api.delete('/auth/logout').catch(() => { });

            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
            }
            return null;
        } catch (error: any) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
            }
            return rejectWithValue(error.message);
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
        },
    },
    extraReducers: (builder) => {
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
            .addCase(fetchMe.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                // If fetching me fails, it might mean the token is invalid
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            });
    },
});

export const { clearError, setCredentials } = authSlice.actions;

// Global Role Selectors (using any to avoid circular dependency with store)
export const selectIsSuperAdmin = (state: any) => state.auth.user?.role === 'SUPER_ADMIN';
export const selectIsReseller = (state: any) => state.auth.user?.role === 'RESELLER';
export const selectIsTenant = (state: any) => state.auth.user?.role === 'TENANT';

export default authSlice.reducer;
