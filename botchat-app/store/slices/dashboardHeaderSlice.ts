import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export interface HeaderCardItem {
    id: string;
    title: string;
    icon: string;
    feature_key: string;
    enabled: boolean;
    used: number;
    limit: number;
    is_unlimited: boolean;
    remaining: number | null;
    percentage: number;
    color: 'green' | 'yellow' | 'red' | 'purple' | string;
    click_url: string;
    type: string;
}

export interface HeaderQuickAction {
    id: string;
    label: string;
    icon: string;
    url: string;
    variant: 'primary' | 'outline' | 'gradient' | 'icon';
}

export interface DashboardHeaderData {
    role: 'super_admin' | 'admin' | 'user';
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        type?: string;
        role_label?: string;
    };
    workspace: {
        id: string | number;
        name: string;
        logo?: string;
        role_badge?: string;
        is_central?: boolean;
    };
    subscription?: {
        plan_name: string;
        status: 'active' | 'expired' | 'suspended' | 'trial';
        is_active: boolean;
        is_trial: boolean;
        renewal_date: string;
        days_remaining: number;
        price: number;
        billing_cycle: string;
        auto_renewal: boolean;
    };
    platform_stats?: {
        total_tenants: number;
        active_subscriptions: number;
        total_users: number;
        total_broadcasts: number;
        monthly_revenue: number;
        server_status: {
            status: string;
            php_version: string;
            database: string;
            uptime: string;
        };
    };
    cards: HeaderCardItem[];
    quick_actions: HeaderQuickAction[];
    permissions: {
        can_upgrade_plan?: boolean;
        can_manage_billing?: boolean;
        can_manage_subscription?: boolean;
        can_manage_payment_methods?: boolean;
        can_manage_team?: boolean;
        can_manage_workspace?: boolean;
        can_view_invoices?: boolean;
        can_view_usage?: boolean;
        can_manage_tenants?: boolean;
        can_manage_plans?: boolean;
        can_manage_coupons?: boolean;
        can_manage_announcements?: boolean;
        can_manage_platform?: boolean;
    };
    alerts: Array<{
        type: 'info' | 'warning' | 'danger';
        key: string;
        message: string;
    }>;
    billing?: {
        latest_invoice?: {
            id: number;
            order_id: string;
            amount: number;
            status: string;
            date: string;
        } | null;
        current_plan_price: number;
    };
}

interface DashboardHeaderState {
    data: DashboardHeaderData | null;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

const initialState: DashboardHeaderState = {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
};

export const fetchDashboardHeader = createAsyncThunk(
    'dashboardHeader/fetchDashboardHeader',
    async (path: string | undefined, { rejectWithValue }: { rejectWithValue: (value: unknown) => unknown }) => {
        try {
            const url = path ? `/dashboard/header?path=${encodeURIComponent(path)}` : '/dashboard/header';
            const response = await api.get(url);
            return response.data.data || response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard header details');
        }
    }
);

const dashboardHeaderSlice = createSlice({
    name: 'dashboardHeader',
    initialState,
    reducers: {
        clearDashboardHeader: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardHeader.pending, (state) => {
                state.loading = !state.data;
                state.error = null;
            })
            .addCase(fetchDashboardHeader.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.lastFetched = Date.now();
                state.error = null;
            })
            .addCase(fetchDashboardHeader.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearDashboardHeader } = dashboardHeaderSlice.actions;
export default dashboardHeaderSlice.reducer;
