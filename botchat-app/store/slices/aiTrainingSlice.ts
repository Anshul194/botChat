import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface Campaign {
    id: number;
    name: string;
    description?: string;
    status?: string;
    system_prompt?: string;
    created_at?: string;
    updated_at?: string;
}

export type CampaignPayload = {
    name: string;
    status: 'active' | 'inactive';
    description: string;
    system_prompt: string;
};

interface CampaignsState {
    campaigns: Campaign[];
    selectedCampaign: Campaign | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
}

const initialState: CampaignsState = {
    campaigns: [],
    selectedCampaign: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────
export const fetchCampaigns = createAsyncThunk(
    'aiTraining/fetchCampaigns',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/ai-training/campaigns');
            const data = res.data?.data ?? res.data;
            return Array.isArray(data) ? data : [];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch campaigns');
        }
    }
);

export const createCampaign = createAsyncThunk(
    'aiTraining/createCampaign',
    async (payload: CampaignPayload, { rejectWithValue }) => {
        try {
            const res = await api.post('/ai-training/campaigns', payload);
            const data = res.data?.data ?? res.data;
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create campaign');
        }
    }
);

export const updateCampaign = createAsyncThunk(
    'aiTraining/updateCampaign',
    async ({ id, ...payload }: CampaignPayload & { id: number }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/ai-training/campaigns/${id}`, payload);
            const data = res.data?.data ?? res.data;
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update campaign');
        }
    }
);

export const deleteCampaign = createAsyncThunk(
    'aiTraining/deleteCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/ai-training/campaigns/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete campaign');
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────────────────
const aiTrainingSlice = createSlice({
    name: 'aiTraining',
    initialState,
    reducers: {
        setSelectedCampaign(state, action) {
            state.selectedCampaign = action.payload;
        },
        clearSelectedCampaign(state) {
            state.selectedCampaign = null;
        },
    },
    extraReducers: (builder) => {
        // fetchCampaigns
        builder
            .addCase(fetchCampaigns.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.campaigns = action.payload;
            })
            .addCase(fetchCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // createCampaign
        builder
            .addCase(createCampaign.pending, (state) => { state.isSubmitting = true; })
            .addCase(createCampaign.fulfilled, (state, action) => {
                state.isSubmitting = false;
                if (action.payload) state.campaigns.unshift(action.payload);
            })
            .addCase(createCampaign.rejected, (state) => { state.isSubmitting = false; });

        // updateCampaign
        builder
            .addCase(updateCampaign.pending, (state) => { state.isSubmitting = true; })
            .addCase(updateCampaign.fulfilled, (state, action) => {
                state.isSubmitting = false;
                if (action.payload) {
                    const idx = state.campaigns.findIndex(c => c.id === action.payload.id);
                    if (idx !== -1) state.campaigns[idx] = action.payload;
                    if (state.selectedCampaign?.id === action.payload.id) {
                        state.selectedCampaign = action.payload;
                    }
                }
            })
            .addCase(updateCampaign.rejected, (state) => { state.isSubmitting = false; });

        // deleteCampaign
        builder
            .addCase(deleteCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
                if (state.selectedCampaign?.id === action.payload) state.selectedCampaign = null;
            });
    },
});

export const { setSelectedCampaign, clearSelectedCampaign } = aiTrainingSlice.actions;
export default aiTrainingSlice.reducer;
