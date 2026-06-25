import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface TenantSubscription {
    id: number;
    name: string;
    email: string;
    tenant_id: string | null;
    plan_id: number | null;
    plan_expired_date: string | null;
    is_suspended: boolean;
    active_status: boolean;
    subscription_status: 'active' | 'expired' | 'suspended' | 'free';
    plan: { id: number; name: string; price: number; duration: number; duration_type: string; features: Record<string, string> } | null;
    created_at: string;
}

export interface RevenueStats {
    mrr: number;
    arr: number;
    total_revenue: number;
    recent_revenue: number;
    total_tenants: number;
    active_tenants: number;
    expired_tenants: number;
    suspended_tenants: number;
    free_tenants: number;
    revenue_by_plan: { plan_name: string; total_revenue: number; order_count: number }[];
}

export interface RevenueTrendPoint {
    period: string;
    revenue: number;
    order_count: number;
    cumulative_revenue: number;
}

export interface PaymentAnalytics {
    summary: { total_orders: number; successful_orders: number; failed_orders: number; success_rate: number };
    by_status: { payment_status: string; count: number; total_amount: number }[];
    by_gateway: { payment_type: string; count: number; total_amount: number }[];
    coupon_usage: { coupon_code: string; usage_count: number; total_amount: number; total_discount: number }[];
    monthly_trend: { month: string; success_count: number; failure_count: number; success_rate: number }[];
}

export interface ExpiringTenant {
    id: number;
    name: string;
    email: string;
    plan: { id: number; name: string; price: number } | null;
    plan_expired_date: string;
    days_remaining: number;
    urgency: 'critical' | 'warning' | 'normal';
}

export interface TopTenant {
    id: number;
    name: string;
    email: string;
    plan_name: string | null;
    status: string;
    total_revenue: number;
    order_count: number;
    last_payment_at: string;
}

export interface TenantDetail {
    user: { id: number; name: string; email: string; tenant_id: string | null; is_suspended: boolean; active_status: boolean; created_at: string };
    plan: { id: number; name: string; price: number; duration: number; duration_type: string; features: Record<string, string> } | null;
    expiry: string | null;
    status: string;
    days_remaining: number | null;
    usage: { feature_key: string; used_count: number; period_start: string; period_end: string }[];
    payments: { id: number; payment_id: string; amount: number; status: string; payment_type: string; coupon_code: string | null; created_at: string }[];
    timeline: { type: string; label: string; date: string; icon: string; color: string; details?: Record<string, unknown> }[];
}

interface SuperAdminSubscriptionState {
    tenants: TenantSubscription[];
    totalCount: number;
    currentPage: number;
    lastPage: number;
    stats: RevenueStats | null;
    detail: TenantDetail | null;
    revenueTrends: RevenueTrendPoint[];
    revenueTrendsPeriod: string;
    paymentAnalytics: PaymentAnalytics | null;
    expiringSoon: ExpiringTenant[];
    topTenants: TopTenant[];
    loading: boolean;
    statsLoading: boolean;
    detailLoading: boolean;
    actionLoading: boolean;
    revenueLoading: boolean;
    paymentLoading: boolean;
    expiringLoading: boolean;
    topTenantsLoading: boolean;
    error: string | null;
}

const initialState: SuperAdminSubscriptionState = {
    tenants: [],
    totalCount: 0,
    currentPage: 1,
    lastPage: 1,
    stats: null,
    detail: null,
    revenueTrends: [],
    revenueTrendsPeriod: 'daily',
    paymentAnalytics: null,
    expiringSoon: [],
    topTenants: [],
    loading: false,
    statsLoading: false,
    detailLoading: false,
    actionLoading: false,
    revenueLoading: false,
    paymentLoading: false,
    expiringLoading: false,
    topTenantsLoading: false,
    error: null,
};

export const fetchSubscriptions = createAsyncThunk(
    'superadminSubscription/fetchAll',
    async (params: { page?: number; per_page?: number; search?: string; status?: string; plan_id?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions', { params });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscriptions');
        }
    }
);

export const fetchSubscriptionStats = createAsyncThunk(
    'superadminSubscription/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions/stats');
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const fetchTenantDetail = createAsyncThunk(
    'superadminSubscription/fetchDetail',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/subscriptions/${id}`);
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch tenant detail');
        }
    }
);

export const assignTenantPlan = createAsyncThunk(
    'superadminSubscription/assignPlan',
    async ({ id, plan_id, plan_expired_date }: { id: number; plan_id: number; plan_expired_date?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/subscriptions/${id}/assign-plan`, { plan_id, plan_expired_date });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to assign plan');
        }
    }
);

export const extendTenantExpiry = createAsyncThunk(
    'superadminSubscription/extendExpiry',
    async ({ id, days }: { id: number; days: number }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/subscriptions/${id}/extend-expiry`, { days });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to extend expiry');
        }
    }
);

export const suspendTenant = createAsyncThunk(
    'superadminSubscription/suspend',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/subscriptions/${id}/suspend`);
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to suspend subscription');
        }
    }
);

export const resumeTenant = createAsyncThunk(
    'superadminSubscription/resume',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/subscriptions/${id}/resume`);
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to resume subscription');
        }
    }
);

export const resetTenantUsage = createAsyncThunk(
    'superadminSubscription/resetUsage',
    async ({ id, feature_key }: { id: number; feature_key?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/subscriptions/${id}/reset-usage`, { feature_key });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to reset usage');
        }
    }
);

export const fetchRevenueTrends = createAsyncThunk(
    'superadminSubscription/fetchRevenueTrends',
    async (params: { period?: string; days?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions/revenue-trends', { params });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch revenue trends');
        }
    }
);

export const fetchPaymentAnalytics = createAsyncThunk(
    'superadminSubscription/fetchPaymentAnalytics',
    async (params: { days?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions/payment-analytics', { params });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch payment analytics');
        }
    }
);

export const fetchExpiringSoon = createAsyncThunk(
    'superadminSubscription/fetchExpiringSoon',
    async (params: { days?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions/expiring-soon', { params });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch expiring tenants');
        }
    }
);

export const fetchTopTenants = createAsyncThunk(
    'superadminSubscription/fetchTopTenants',
    async (params: { limit?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions/top-tenants', { params });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch top tenants');
        }
    }
);

const superadminSubscriptionSlice = createSlice({
    name: 'superadminSubscription',
    initialState,
    reducers: {
        clearDetail: (state) => { state.detail = null; },
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscriptions.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSubscriptions.fulfilled, (state, action) => {
                state.loading = false;
                state.tenants = action.payload.data ?? action.payload;
                state.totalCount = action.payload.meta?.total ?? state.tenants.length;
                state.currentPage = action.payload.meta?.current_page ?? 1;
                state.lastPage = action.payload.meta?.last_page ?? 1;
            })
            .addCase(fetchSubscriptions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            .addCase(fetchSubscriptionStats.pending, (state) => { state.statsLoading = true; })
            .addCase(fetchSubscriptionStats.fulfilled, (state, action) => { state.statsLoading = false; state.stats = action.payload; })
            .addCase(fetchSubscriptionStats.rejected, (state) => { state.statsLoading = false; })
            .addCase(fetchTenantDetail.pending, (state) => { state.detailLoading = true; state.error = null; })
            .addCase(fetchTenantDetail.fulfilled, (state, action) => { state.detailLoading = false; state.detail = action.payload; })
            .addCase(fetchTenantDetail.rejected, (state, action) => { state.detailLoading = false; state.error = action.payload as string; })
            .addCase(assignTenantPlan.pending, (state) => { state.actionLoading = true; })
            .addCase(assignTenantPlan.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(assignTenantPlan.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
            .addCase(extendTenantExpiry.pending, (state) => { state.actionLoading = true; })
            .addCase(extendTenantExpiry.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(extendTenantExpiry.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
            .addCase(suspendTenant.pending, (state) => { state.actionLoading = true; })
            .addCase(suspendTenant.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(suspendTenant.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
            .addCase(resumeTenant.pending, (state) => { state.actionLoading = true; })
            .addCase(resumeTenant.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(resumeTenant.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
            .addCase(resetTenantUsage.pending, (state) => { state.actionLoading = true; })
            .addCase(resetTenantUsage.fulfilled, (state) => { state.actionLoading = false; })
            .addCase(resetTenantUsage.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
            .addCase(fetchRevenueTrends.pending, (state) => { state.revenueLoading = true; })
            .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
                state.revenueLoading = false;
                state.revenueTrends = action.payload.data ?? [];
                state.revenueTrendsPeriod = action.payload.period ?? 'daily';
            })
            .addCase(fetchRevenueTrends.rejected, (state) => { state.revenueLoading = false; })
            .addCase(fetchPaymentAnalytics.pending, (state) => { state.paymentLoading = true; })
            .addCase(fetchPaymentAnalytics.fulfilled, (state, action) => { state.paymentLoading = false; state.paymentAnalytics = action.payload; })
            .addCase(fetchPaymentAnalytics.rejected, (state) => { state.paymentLoading = false; })
            .addCase(fetchExpiringSoon.pending, (state) => { state.expiringLoading = true; })
            .addCase(fetchExpiringSoon.fulfilled, (state, action) => {
                state.expiringLoading = false;
                state.expiringSoon = action.payload.tenants ?? [];
            })
            .addCase(fetchExpiringSoon.rejected, (state) => { state.expiringLoading = false; })
            .addCase(fetchTopTenants.pending, (state) => { state.topTenantsLoading = true; })
            .addCase(fetchTopTenants.fulfilled, (state, action) => {
                state.topTenantsLoading = false;
                state.topTenants = action.payload.tenants ?? [];
            })
            .addCase(fetchTopTenants.rejected, (state) => { state.topTenantsLoading = false; });
    },
});

export const { clearDetail, clearError } = superadminSubscriptionSlice.actions;
export default superadminSubscriptionSlice.reducer;
