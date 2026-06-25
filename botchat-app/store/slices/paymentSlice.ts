import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface PaymentRecord {
    id: number;
    payment_id: string;
    plan_id: number;
    plan_name?: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending' | 'refunded';
    payment_method?: string;
    created_at: string;
}

interface PaymentState {
    history: PaymentRecord[];
    loading: boolean;
    initiating: boolean;
    orderId: string | null;
    razorpayKey: string | null;
    error: string | null;
}

const initialState: PaymentState = {
    history: [],
    loading: false,
    initiating: false,
    orderId: null,
    razorpayKey: null,
    error: null,
};

export const fetchPaymentHistory = createAsyncThunk(
    'payment/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/payment/history');
            const data = response.data?.data ?? response.data ?? [];
            return Array.isArray(data) ? data : [];
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch payment history');
        }
    }
);

export const initiatePayment = createAsyncThunk(
    'payment/initiate',
    async (params: { plan_id: number; coupon_code?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/payment/initiate', params);
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to initiate payment');
        }
    }
);

export const applyCoupon = createAsyncThunk(
    'payment/applyCoupon',
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await api.post('/coupons/apply', { code });
            return response.data?.data ?? response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Invalid coupon code');
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearPaymentState: (state) => {
            state.orderId = null;
            state.razorpayKey = null;
            state.initiating = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaymentHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchPaymentHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(initiatePayment.pending, (state) => {
                state.initiating = true;
                state.error = null;
            })
            .addCase(initiatePayment.fulfilled, (state, action) => {
                state.initiating = false;
                state.orderId = action.payload?.order_id ?? action.payload?.id ?? null;
                state.razorpayKey = action.payload?.razorpay_key ?? null;
            })
            .addCase(initiatePayment.rejected, (state, action) => {
                state.initiating = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
