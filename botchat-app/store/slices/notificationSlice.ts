import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface Notification {
    id: string;
    type: string;
    data: {
        type: string;
        title: string;
        message: string;
        action_url?: string;
        action_label?: string;
        plan_name?: string;
        days_remaining?: number;
        amount?: number;
        payment_id?: string;
        coupon_code?: string;
        discount_amount?: number;
        tenant_name?: string;
        tenant_email?: string;
        reason?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
}

export interface NotificationPreferences {
    id: number;
    user_id: number;
    email_notifications: boolean;
    billing_notifications: boolean;
    renewal_reminders: boolean;
    payment_alerts: boolean;
}

interface NotificationState {
    notifications: Notification[];
    totalCount: number;
    currentPage: number;
    lastPage: number;
    unreadCount: number;
    preferences: NotificationPreferences | null;
    loading: boolean;
    unreadLoading: boolean;
    preferencesLoading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    totalCount: 0,
    currentPage: 1,
    lastPage: 1,
    unreadCount: 0,
    preferences: null,
    loading: false,
    unreadLoading: false,
    preferencesLoading: false,
    error: null,
};

export const fetchNotifications = createAsyncThunk(
    'notification/fetchAll',
    async (params: { page?: number; per_page?: number; type?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/notifications', { params });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notification/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    'notification/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await api.patch('/notifications/read');
            return true;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to mark notifications as read');
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    'notification/markRead',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            return id;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read');
        }
    }
);

export const fetchNotificationPreferences = createAsyncThunk(
    'notification/fetchPreferences',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/notifications/preferences');
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch preferences');
        }
    }
);

export const updateNotificationPreferences = createAsyncThunk(
    'notification/updatePreferences',
    async (prefs: Partial<NotificationPreferences>, { rejectWithValue }) => {
        try {
            const response = await api.patch('/notifications/preferences', prefs);
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to update preferences');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        clearNotifications: (state) => { state.notifications = []; state.totalCount = 0; },
        decrementUnread: (state) => { state.unreadCount = Math.max(0, state.unreadCount - 1); },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.data ?? [];
                state.totalCount = action.payload.meta?.total ?? state.notifications.length;
                state.currentPage = action.payload.meta?.current_page ?? 1;
                state.lastPage = action.payload.meta?.last_page ?? 1;
            })
            .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            .addCase(fetchUnreadCount.pending, (state) => { state.unreadLoading = true; })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadLoading = false;
                state.unreadCount = action.payload?.count ?? 0;
            })
            .addCase(fetchUnreadCount.rejected, (state) => { state.unreadLoading = false; })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.unreadCount = 0;
                state.notifications = state.notifications.map((n) => ({ ...n, read_at: new Date().toISOString() }));
            })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const id = action.payload;
                const notif = state.notifications.find((n) => n.id === id);
                if (notif && !notif.read_at) {
                    notif.read_at = new Date().toISOString();
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(fetchNotificationPreferences.pending, (state) => { state.preferencesLoading = true; })
            .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
                state.preferencesLoading = false;
                state.preferences = action.payload;
            })
            .addCase(fetchNotificationPreferences.rejected, (state) => { state.preferencesLoading = false; })
            .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
                state.preferences = action.payload;
            });
    },
});

export const { clearNotifications, decrementUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
