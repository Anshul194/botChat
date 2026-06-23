import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../lib/api';

export interface Plan {
    id: number;
    name: string;
    price: number;
    duration: number;
    duration_type: string;
    description: string;
    status: boolean;
    is_highlighted: boolean;
    discount: number;
    discount_terms: string;
    discount_start: string;
    discount_end: string;
    discount_timezone: string;
    discount_status: boolean;
    apply_to_other_packages: string;
    features: {
        [key: string]: string;
    };
    feature_types: {
        [key: string]: string;
    };
    created_at: string;
    updated_at: string;
}

interface PlansState {
    plans: Plan[];
    selectedPlan: Plan | null;
    userPlan: Plan | null;
    isLoading: boolean;
    isLoadingUserPlan: boolean;
    error: string | null;
}

const initialState: PlansState = {
    plans: [],
    selectedPlan: null,
    userPlan: null,
    isLoading: true,
    isLoadingUserPlan: false,
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

export const fetchPublicPlans = createAsyncThunk(
    'plans/fetchPublicPlans',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('https://api.megadm.chat/api/v1/public/plans', {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer 2|SEjhqz8RiNIReWskv4No2rERcQncuVIEizJ1ShBI66ea70b9',
                },
            });
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
        }
    }
);

export const fetchMyPlan = createAsyncThunk(
    'plans/fetchMyPlan',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/plans/my');
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch my plan');
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
                if (state.userPlan) {
                    const updated = action.payload.find((p: Plan) => p.id === state.userPlan!.id);
                    if (updated) state.userPlan = updated;
                }
            })
            .addCase(fetchPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPublicPlans.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPublicPlans.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plans = action.payload;
            })
            .addCase(fetchPublicPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMyPlan.pending, (state) => {
                state.isLoadingUserPlan = true;
            })
            .addCase(fetchMyPlan.fulfilled, (state, action) => {
                state.isLoadingUserPlan = false;
                state.userPlan = action.payload;
            })
            .addCase(fetchMyPlan.rejected, (state, action) => {
                state.isLoadingUserPlan = false;
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
                if (state.userPlan?.id === action.payload.id) {
                    state.userPlan = action.payload;
                }
            })
            .addCase(deletePlan.fulfilled, (state, action) => {
                state.plans = state.plans.filter(p => p.id !== action.payload);
                if (state.userPlan?.id === action.payload) {
                    state.userPlan = null;
                }
            });
    },
});

export const { setSelectedPlan, clearError } = plansSlice.actions;
export default plansSlice.reducer;
