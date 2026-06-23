import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface UserDetail {
    id: number;
    name: string;
    email: string;
    type: string;
    phone: string;
    country: string;
    country_code: string;
    dial_code: string;
    avatar: string;
    plan_id: number | null;
    plan_expired_date: string | null;
    active_status: boolean;
    email_verified_at: string;
    phone_verified_at: string;
    roles: any;
    permissions: any;
    created_at: string;
    updated_at: string;
}

interface UsersState {
    users: UserDetail[];
    selectedUser: UserDetail | null;
    isLoading: boolean;
    error: string | null;
    total: number;
}

const initialState: UsersState = {
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    total: 0,
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users');
            if (response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchUserById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    'users/toggleUserStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/users/${id}/status`);
            if (response.data.success) {
                return { id, status: response.data.data.active_status || response.data.active_status };
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const assignPlanToUser = createAsyncThunk(
    'users/assignPlanToUser',
    async ({ id, plan_id, plan_expired_date }: { id: number; plan_id: number; plan_expired_date?: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/users/${id}/assign-plan`, { plan_id, plan_expired_date });
            if (response.data.success) {
                return response.data.data || { id, plan_id, plan_expired_date };
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign plan');
        }
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData: {
        name: string;
        email: string;
        password: string;
        domains: string;
        country_code: string;
        dial_code: string;
        phone: string;
        plan_id: number;
    }, { rejectWithValue }) => {
        try {
            const response = await api.post('/users', userData);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload.data;
                state.total = action.payload.meta?.total || action.payload.data.length;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.unshift(action.payload);
                state.total += 1;
            })
            .addCase(assignPlanToUser.fulfilled, (state, action) => {
                const user = state.users.find(u => u.id === action.payload.id);
                if (user) {
                    user.plan_id = action.payload.plan_id;
                    user.plan_expired_date = action.payload.plan_expired_date;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser.plan_id = action.payload.plan_id;
                    state.selectedUser.plan_expired_date = action.payload.plan_expired_date;
                }
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                const user = state.users.find(u => u.id === action.payload.id);
                if (user) {
                    user.active_status = !user.active_status;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser.active_status = !state.selectedUser.active_status;
                }
            });
    },
});

export const { clearSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
