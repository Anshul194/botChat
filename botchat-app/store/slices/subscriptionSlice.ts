import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface PlanFeatureMap {
    [key: string]: boolean;
}

export interface UsageItem {
    limit: number;
    used: number;
    remaining: number;
}

export interface UsageMap {
    [key: string]: UsageItem;
}

export interface CurrentPlan {
    id?: number;
    name?: string;
    price?: number | string;
    duration?: number | string;
    duration_type?: string;
    features?: Record<string, unknown>;
    [key: string]: unknown;
}

interface SubscriptionState {
    currentPlan: CurrentPlan | null;
    expiryDate: string | null;
    expired: boolean;
    features: PlanFeatureMap;
    usage: UsageMap;
    loading: boolean;
    error: string | null;
}

const initialState: SubscriptionState = {
    currentPlan: null,
    expiryDate: null,
    expired: false,
    features: {},
    usage: {},
    loading: true,
    error: null,
};

const unwrapData = (payload: unknown): unknown => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: unknown }).data;
    }
    return payload;
};

export const fetchCurrentPlan = createAsyncThunk(
    'subscription/fetchCurrentPlan',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/plans/my');
            const data = unwrapData(response.data) as Record<string, unknown>;

            return {
                currentPlan: (data?.plan as CurrentPlan | null) ?? null,
                expiryDate: (data?.plan_expired_date as string) ?? (data?.expires_at as string) ?? null,
                expired: Boolean(data?.is_expired ?? data?.expired ?? false),
            };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch current plan');
        }
    }
);

export const fetchFeatures = createAsyncThunk(
    'subscription/fetchFeatures',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/plans/features');
            return unwrapData(response.data) as PlanFeatureMap;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch plan features');
        }
    }
);

export const fetchUsage = createAsyncThunk(
    'subscription/fetchUsage',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/plans/usage');
            return unwrapData(response.data) as UsageMap;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch plan usage');
        }
    }
);

export const fetchSubscription = createAsyncThunk(
    'subscription/fetchSubscription',
    async (_, { dispatch }) => {
        await Promise.allSettled([
            dispatch(fetchCurrentPlan()).unwrap(),
            dispatch(fetchFeatures()).unwrap(),
            dispatch(fetchUsage()).unwrap(),
        ]);

        try {
            await api.get('/subscription/status');
        } catch {
            // Optional backend endpoint; plans/my is the source of truth for now.
        }

        return true;
    }
);

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        clearSubscription: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubscription.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(fetchSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch subscription';
            })
            .addCase(fetchCurrentPlan.fulfilled, (state, action) => {
                state.currentPlan = action.payload.currentPlan;
                state.expiryDate = action.payload.expiryDate;
                state.expired = action.payload.expired;
            })
            .addCase(fetchCurrentPlan.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(fetchFeatures.fulfilled, (state, action) => {
                state.features = action.payload || {};
            })
            .addCase(fetchFeatures.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(fetchUsage.fulfilled, (state, action) => {
                state.usage = action.payload || {};
            })
            .addCase(fetchUsage.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
