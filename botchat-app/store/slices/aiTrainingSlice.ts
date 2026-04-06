import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface Campaign {
    id: number;
    name: string;
    description?: string;
    status?: string;
    prompt_message?: string;
    created_at?: string;
    updated_at?: string;
}

export type CampaignPayload = {
    name: string;
    status: 'active' | 'inactive';
    description: string;
    prompt_message: string;
};

export type SourceType = 'manual' | 'url' | 'file' | 'api' | 'sheet';

export interface KnowledgeSource {
    id: number;
    campaign_id: number;
    type: SourceType;
    status?: string;
    // manual
    title?: string;
    content?: string;
    // url / sheet
    url?: string;
    sheet_url?: string;
    sheet_name?: string;
    // file
    file_name?: string;
    file_path?: string;
    // api
    api_url?: string;
    method?: string;
    headers?: string;
    created_at?: string;
}

interface CampaignsState {
    campaigns: Campaign[];
    selectedCampaign: Campaign | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    // Knowledge sources
    knowledgeSources: KnowledgeSource[];
    isLoadingSources: boolean;
    isAddingSource: boolean;
}

const initialState: CampaignsState = {
    campaigns: [],
    selectedCampaign: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    knowledgeSources: [],
    isLoadingSources: false,
    isAddingSource: false,
};

// ── Campaign Thunks ───────────────────────────────────────────────────────────
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
            return res.data?.data ?? res.data;
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
            return res.data?.data ?? res.data;
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

// ── Knowledge Source Thunks ───────────────────────────────────────────────────
export const fetchKnowledgeSources = createAsyncThunk(
    'aiTraining/fetchKnowledgeSources',
    async (campaignId: number, { rejectWithValue }) => {
        try {
            const res = await api.get(`/ai-training/campaigns/${campaignId}`);
            const data = res.data?.data ?? res.data;

            // Flatten categorical arrays into a single list with normalized type/status
            const flattened: any[] = [];

            if (data.urls) data.urls.forEach((s: any) => flattened.push({ ...s, type: 'url', status: s.crawl_status }));
            if (data.files) data.files.forEach((s: any) => flattened.push({ ...s, type: 'file', status: s.processed_status }));
            if (data.api) data.api.forEach((s: any) => flattened.push({ ...s, type: 'api', status: s.fetch_status }));
            if (data.sheets) data.sheets.forEach((s: any) => flattened.push({ ...s, type: 'sheet', status: s.fetch_status }));

            return flattened;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch sources');
        }
    }
);

export const createKnowledgeSource = createAsyncThunk(
    'aiTraining/createKnowledgeSource',
    async (
        { campaignId, endpoint, payload }: { campaignId: number; endpoint: string; payload: FormData | Record<string, any> },
        { rejectWithValue }
    ) => {
        try {
            const isFormData = payload instanceof FormData;
            const res = await api.post(
                endpoint,
                payload,
                isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
            );
            return res.data?.data ?? res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add source');
        }
    }
);

export const deleteKnowledgeSource = createAsyncThunk(
    'aiTraining/deleteKnowledgeSource',
    async ({ campaignId, sourceId }: { campaignId: number; sourceId: number }, { rejectWithValue }) => {
        try {
            await api.delete(`/ai-training/campaigns/${campaignId}/sources/${sourceId}`);
            return sourceId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete source');
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
            state.knowledgeSources = [];
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
                    if (state.selectedCampaign?.id === action.payload.id)
                        state.selectedCampaign = action.payload;
                }
            })
            .addCase(updateCampaign.rejected, (state) => { state.isSubmitting = false; });

        // deleteCampaign
        builder
            .addCase(deleteCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
                if (state.selectedCampaign?.id === action.payload) state.selectedCampaign = null;
            });

        // fetchKnowledgeSources
        builder
            .addCase(fetchKnowledgeSources.pending, (state) => { state.isLoadingSources = true; })
            .addCase(fetchKnowledgeSources.fulfilled, (state, action) => {
                state.isLoadingSources = false;
                state.knowledgeSources = action.payload;
            })
            .addCase(fetchKnowledgeSources.rejected, (state) => { state.isLoadingSources = false; });

        // createKnowledgeSource
        builder
            .addCase(createKnowledgeSource.pending, (state) => { state.isAddingSource = true; })
            .addCase(createKnowledgeSource.fulfilled, (state, action) => {
                state.isAddingSource = false;
                if (action.payload) state.knowledgeSources.unshift(action.payload);
            })
            .addCase(createKnowledgeSource.rejected, (state) => { state.isAddingSource = false; });

        // deleteKnowledgeSource
        builder
            .addCase(deleteKnowledgeSource.fulfilled, (state, action) => {
                state.knowledgeSources = state.knowledgeSources.filter(s => s.id !== action.payload);
            });
    },
});

export const { setSelectedCampaign, clearSelectedCampaign } = aiTrainingSlice.actions;
export default aiTrainingSlice.reducer;
