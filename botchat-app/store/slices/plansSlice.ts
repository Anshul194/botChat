import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface Plan {
    id: number;
    name: string;
    price: number;
    duration: number;
    durationtype: string;
    max_users: number;
    max_roles: number;
    max_documents: number;
    max_blogs: number;
    active_status: boolean;
    created_at: string;
    updated_at: string;
}

interface PlansState {
    plans: Plan[];
    selectedPlan: Plan | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PlansState = {
    plans: [],
    selectedPlan: null,
    isLoading: false,
    error: null,
};

export const fetchPlans = createAsyncThunk(
    'plans/fetchPlans',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/plans');
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
        }
    }
);

export const createPlan = createAsyncThunk(
    'plans/createPlan',
    async (planData: Partial<Plan>, { rejectWithValue }) => {
        try {
            const response = await api.post('/plans', planData);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create plan');
        }
    }
);

export const updatePlan = createAsyncThunk(
    'plans/updatePlan',
    async ({ id, data }: { id: number, data: Partial<Plan> }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/plans/${id}`, data);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update plan');
        }
    }
);

export const deletePlan = createAsyncThunk(
    'plans/deletePlan',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/plans/${id}`);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete plan');
        }
    }
);

const plansSlice = createSlice({
    name: 'plans',
    initialState,
    reducers: {
        setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
            state.selectedPlan = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlans.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPlans.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plans = action.payload;
            })
            .addCase(fetchPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createPlan.fulfilled, (state, action) => {
                state.plans.unshift(action.payload);
            })
            .addCase(updatePlan.fulfilled, (state, action) => {
                const index = state.plans.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.plans[index] = action.payload;
                }
            })
            .addCase(deletePlan.fulfilled, (state, action) => {
                state.plans = state.plans.filter(p => p.id !== action.payload);
            });
    },
});

export const { setSelectedPlan, clearError } = plansSlice.actions;
export default plansSlice.reducer;
